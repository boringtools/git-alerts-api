from logging import getLogger
from celery import shared_task
from django.utils import timezone
from .models import Scan
from integrations.models import UserIntegration
from integrations.tasks import validate_github_integration
from core.clients.github_client import GitHubClient, GitHubAuthError
from core.clients.trufflehog_client import TruffleHogClient
from core.services.scan_orchestrator import ScanOrchestrator

logger = getLogger(__name__)


@shared_task
def run_scan_task(scan_id):
    """Celery task for the scanning"""
    logger.info(
        f"event=celery_task_received task={run_scan_task.name} scan_id={scan_id}"
    )

    scan = None
    integration = None

    try:
        logger.info(f"event=scan_started scan_id={scan_id}")
        scan = Scan.objects.get(id=scan_id)
        scan.status = Scan.ScanStatus.INPROGRESS
        scan.save()

        integration = UserIntegration.objects.filter(
            user=scan.user, provider=UserIntegration.Provider.GITHUB
        ).first()

        github_token = integration.get_token()

        logger.info(
            f"event=scan_preflight_validation scan_id={scan_id} integration_id={integration.id}"
        )
        is_valid, error_message = validate_github_integration(github_token)

        if not is_valid:
            integration.status = UserIntegration.Status.FAILED
            integration.error_message = error_message
            integration.last_validated_at = timezone.now()
            integration.save()

            logger.error(
                f"event=scan_preflight_failed scan_id={scan_id} integration_id={integration.id} reason={error_message}"
            )

            scan.status = Scan.ScanStatus.FAILED
            scan.save()

            raise ValueError(f"GitHub token validation failed: {error_message}")

        integration.last_validated_at = timezone.now()
        integration.save()

        logger.info(
            f"event=scan_preflight_passed scan_id={scan_id} integration_id={integration.id}"
        )

        orchestrator = ScanOrchestrator(
            scan=scan,
            github_client=GitHubClient(token=github_token),
            trufflehog_client=TruffleHogClient(),
        )

        orchestrator.run()

        scan.status = Scan.ScanStatus.COMPLETED
        scan.completed_at = timezone.now()
        scan.save()
        logger.info(f"event=scan_completed scan_id={scan_id}")

    except GitHubAuthError as e:
        logger.error(
            f"event=scan_auth_failed scan_id={scan_id} error={e}", exc_info=True
        )

        if integration:
            integration.status = UserIntegration.Status.FAILED
            integration.error_message = "GitHub token is invalid or expired"
            integration.last_validated_at = timezone.now()
            integration.save()

            logger.info(
                f"event=integration_marked_failed integration_id={integration.id} reason=auth_error"
            )

        if scan:
            scan.status = Scan.ScanStatus.FAILED
            scan.save()

        raise

    except Exception as e:
        logger.error(f"event=scan_failed scan_id={scan_id} error={e}", exc_info=True)
        if scan:
            scan.status = Scan.ScanStatus.FAILED
            scan.save()
        raise
