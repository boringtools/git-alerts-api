import subprocess
import json
from logging import getLogger

logger = getLogger(__name__)


class TruffleHogClient:
    """TruffleHog client for scanning secrets in the repositories"""

    def __init__(self):
        pass

    def scan_repository(
        self, repository_url: str, only_verified: bool = True
    ) -> list[dict]:
        """Scan repository for secrets using TruffleHog

        Args:
            repository_url: URL of the repository to scan
            only_verified: If True, only return verified secrets (default: True)

        Returns:
            List of findings from TruffleHog
        """

        all_findings = []

        logger.info(f"event=trufflehog_scan_started repository={repository_url}")

        try:
            tf_command = ["trufflehog", "git", repository_url, "--json"]

            if only_verified:
                tf_command.append("--only-verified")

            tf_command_output = subprocess.run(
                tf_command, check=True, timeout=600, capture_output=True, text=True
            )

            for line in tf_command_output.stdout.splitlines():
                if line.strip():
                    finding_data = json.loads(line.strip())
                    metadata = (
                        finding_data.get("SourceMetadata", {})
                        .get("Data", {})
                        .get("Git", {})
                    )

                    parsed_data = {
                        "repository": metadata.get("repository"),
                        "commit": metadata.get("commit"),
                        "file": metadata.get("file"),
                        "line": metadata.get("line"),
                        "author": metadata.get("email"),
                        "type": finding_data.get("DetectorName"),
                        "description": finding_data.get("DetectorDescription"),
                        "value": finding_data.get("Raw"),
                    }
                    all_findings.append(parsed_data)

            logger.info(
                f"event=trufflehog_scan_completed repository={repository_url} findings_count={len(all_findings)}"
            )
            return all_findings

        except subprocess.TimeoutExpired:
            logger.warning(
                f"event=trufflehog_scan_timeout repository={repository_url} timeout=600s"
            )
            return []

        except Exception as e:
            logger.error(
                f"event=trufflehog_scan_error repository={repository_url} error={e}",
                exc_info=True,
            )
            raise
