import re
from logging import getLogger
from django.utils import timezone
from datetime import timedelta
from scans.models import Scan
from findings.models import Finding, IgnoreFindingType, IgnoreFindingDomain
from core.models import RepoScanHistory, SystemSettings

logger = getLogger(__name__)


class ScanOrchestrator:
    """Orchestrates the end-to-end scan workflow"""

    def __init__(self, scan: Scan, github_client, trufflehog_client):
        self.scan = scan
        self.github_client = github_client
        self.trufflehog_client = trufflehog_client

        system_settings = SystemSettings.get_settings()
        self.skip_recent_days = system_settings.skip_recent_days
        self.verified_only = system_settings.verified_only
        self.org_repos_only = system_settings.org_repos_only

    def run(self):
        """Main orchestrator entry point"""
        logger.info(
            f"event=scan_orchestrator_started scan_id={self.scan.id} type={self.scan.type}"
        )
        try:
            self.handle_scan()
            logger.info(f"event=scan_orchestrator_completed scan_id={self.scan.id}")
        except Exception as e:
            logger.error(
                f"event=scan_orchestrator_failed scan_id={self.scan.id} error={e}",
                exc_info=True,
            )
            raise

    def handle_scan(self):
        """Handles main logic of scanning"""
        if self.scan.type == Scan.ScanTypes.ORG_REPOS:
            repos = self.github_client.get_org_repos(self.scan.value)

        elif self.scan.type == Scan.ScanTypes.ORG_USERS:
            repos = self.github_client.get_org_members_repos(self.scan.value)

        elif self.scan.type == Scan.ScanTypes.SEARCH_CODE:
            repos = self.github_client.search_code(self.scan.value)

        elif self.scan.type == Scan.ScanTypes.SEARCH_COMMITS:
            repos = self.github_client.search_commits(self.scan.value)

        elif self.scan.type == Scan.ScanTypes.SEARCH_ISSUES:
            repos = self.github_client.search_issues(self.scan.value)

        elif self.scan.type == Scan.ScanTypes.SEARCH_REPOS:
            repos = self.github_client.search_repositories(self.scan.value)

        elif self.scan.type == Scan.ScanTypes.SEARCH_USERS:
            repos = self.github_client.search_users(self.scan.value)

        logger.info(
            f"event=scan_orchestrator_github_repos_fetched scan_id={self.scan.id} repo_count={len(repos)}"
        )

        # Filter by organization ownership if enabled
        if self.org_repos_only and self.scan.type in [
            Scan.ScanTypes.SEARCH_CODE,
            Scan.ScanTypes.SEARCH_COMMITS,
            Scan.ScanTypes.SEARCH_ISSUES,
            Scan.ScanTypes.SEARCH_REPOS,
        ]:
            repos = self._filter_organization_repos(repos)
            logger.info(
                f"event=scan_orchestrator_org_filtered scan_id={self.scan.id} org_repo_count={len(repos)}"
            )

        unique_repos_to_scan = set()
        for repo in repos:
            repo_url = self.extract_repo_url_from_response(self.scan.type, repo)
            unique_repos_to_scan.add(repo_url)

        self.scan.total_repositories = len(unique_repos_to_scan)
        self.scan.save()

        logger.info(
            f"event=scan_orchestrator_unique_repos_fetched scan_id={self.scan.id} repo_count={len(unique_repos_to_scan)}"
        )

        repos_to_scan = self.filtered_repos(unique_repos_to_scan)

        self.scan.ignored_repositories = len(repos) - len(repos_to_scan)
        self.scan.save()

        for repo in repos_to_scan:
            history = RepoScanHistory.objects.create(
                repository=repo, status=RepoScanHistory.ScanStatus.STARTED
            )

            self.scan.scanned_repositories += 1
            self.scan.save()

            try:
                findings = self.trufflehog_client.scan_repository(
                    repository_url=repo, only_verified=self.verified_only
                )
            except Exception as e:
                history.status = RepoScanHistory.ScanStatus.FAILED
                history.completed_at = timezone.now()
                history.save()

                logger.error(
                    f"event=scan_orchestrator_repo_scan_failed scan={self.scan.id} repo={repo} error={e}",
                    exc_info=True,
                )
                continue

            history.status = RepoScanHistory.ScanStatus.COMPLETED
            history.completed_at = timezone.now()
            history.save()
            self.save_findings(repo, findings)

    def _filter_organization_repos(self, repos: list[dict]) -> list[dict]:
        """Filter repos to only include organization-owned repositories"""
        filtered = []

        for repo in repos:
            if self.scan.type == Scan.ScanTypes.SEARCH_ISSUES:
                try:
                    repo_url = repo.get("repository_url", "")
                    parts = repo_url.split("/")
                    if len(parts) >= 2:
                        owner = parts[-2]
                        repo_name = parts[-1]

                        full_repo_url = (
                            f"{self.github_client.base_url}/repos/{owner}/{repo_name}"
                        )
                        response = self.github_client._request("GET", full_repo_url)
                        repo_data = response.json()

                        if self.github_client.is_organization_repo(repo_data):
                            filtered.append(repo)
                    else:
                        logger.warning(
                            f"event=scan_orchestrator_invalid_repo_url url={repo_url}"
                        )
                except Exception as e:
                    logger.error(
                        f"event=scan_orchestrator_fetch_repo_failed repo_url={repo.get('repository_url')} error={e}"
                    )
                    continue
            else:
                if self.github_client.is_organization_repo(repo):
                    filtered.append(repo)

        return filtered

    def filtered_repos(self, repositories: set[str]) -> list:
        """Filters repository for scanning based on different filters"""
        filterd_repositories = []
        for repo in repositories:
            if self.is_recently_scanned(repo):
                logger.info(
                    f"event=scan_orchestrator_skipped_recently_scanned_repository repository={repo}"
                )
                RepoScanHistory.objects.create(
                    repository=repo,
                    status=RepoScanHistory.ScanStatus.SKIPPED,
                    completed_at=timezone.now(),
                )
            else:
                filterd_repositories.append(repo)

        return filterd_repositories

    def is_recently_scanned(self, repo_url: str) -> bool:
        """Check if repository was recently scanned"""
        days = timezone.now() - timedelta(days=self.skip_recent_days)
        last_history = (
            RepoScanHistory.objects.filter(repository=repo_url)
            .order_by("-completed_at")
            .first()
        )
        if (
            last_history
            and last_history.completed_at
            and last_history.completed_at > days
        ):
            return True
        return False

    def should_ignore_finding(self, finding) -> bool:
        """Ignore findings based on the finding configuration"""
        ignored_types = set(IgnoreFindingType.objects.values_list("type", flat=True))
        ignored_domains = set(
            IgnoreFindingDomain.objects.values_list("domain", flat=True)
        )

        if finding["type"] in ignored_types:
            logger.info(
                f"event=scan_orchestrator_finding_ignored reason=type_match type={finding['type']}"
            )
            return True

        domain = self.extract_domain(finding["author"])

        if domain in ignored_domains:
            logger.info(
                f"event=scan_orchestrator_finding_ignored reason=domain_match domain={domain}"
            )
            return True

        return False

    def save_findings(self, repo_url: str, findings: list[dict]):
        """Save all findings for a given repository"""
        for finding in findings:
            if not self.should_ignore_finding(finding):
                Finding.objects.create(
                    scan=self.scan,
                    repository=finding["repository"],
                    type=finding["type"],
                    value=finding["value"],
                    description=finding["description"],
                    file=finding["file"],
                    line=finding["line"],
                    email=finding["author"],
                    commit_hash=finding["commit"],
                    commit_url=f"{repo_url}/commit/{finding['commit']}",
                )
                self.scan.total_findings += 1
                self.scan.save()
            else:
                self.scan.ignored_findings += 1
                self.scan.save()

        logger.info(
            f"event=scan_orchestrator_findings_saved scan={self.scan.id} repository={repo_url} findings_count={self.scan.total_findings}"
        )

    @staticmethod
    def extract_repo_url_from_response(scan_type: str, response: dict) -> str:
        """Extracts repository url from GitHub response based on different scan types"""
        if scan_type in [
            Scan.ScanTypes.ORG_REPOS,
            Scan.ScanTypes.ORG_USERS,
            Scan.ScanTypes.SEARCH_REPOS,
            Scan.ScanTypes.SEARCH_USERS,
        ]:
            repo_url = response["html_url"]

        elif scan_type in [Scan.ScanTypes.SEARCH_CODE, Scan.ScanTypes.SEARCH_COMMITS]:
            repo_url = response["repository"]["html_url"]

        elif scan_type in [Scan.ScanTypes.SEARCH_ISSUES]:
            html_url = response["html_url"]

            if "/issues/" in html_url:
                repo_url = html_url.split("/issues/", 1)[0]
            elif "/pull/" in html_url:
                repo_url = html_url.split("/pull/", 1)[0]
            else:
                repo_url = "/".join(html_url.split("/")[:-1])

        return repo_url

    @staticmethod
    def extract_domain(email: str) -> str:
        """Extracts domain from trufflehog email and returns the domain"""
        match = re.search(r"<[^@]+@([^>]+)>", email)
        return match.group(1).lower() if match else ""
