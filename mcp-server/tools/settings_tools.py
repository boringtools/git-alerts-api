from utils.api_client import GitAlertsAPIClient


def get_settings() -> dict:
    """
    Get current system settings for GitAlerts scanning configuration

    Returns:
        dict: System settings including:
            - skip_recent_days: Number of days to skip recently scanned repositories
            - verified_only: Whether to only scan for verified secrets (faster, fewer false positives)
            - org_repos_only: Whether to only scan repositories owned by organizations
            - updated_at: Last update timestamp
    """
    try:
        client = GitAlertsAPIClient()
        response = client.request(method="GET", path="/settings/")
        return response
    except Exception as e:
        raise Exception(f"Failed to get system settings: {str(e)}")


def update_settings(
    skip_recent_days: int = None,
    verified_only: bool = None,
    org_repos_only: bool = None
) -> dict:
    """
    Update system settings for GitAlerts scanning configuration

    Args:
        skip_recent_days: Number of days to skip recently scanned repositories (e.g., 15)
                         Helps avoid re-scanning the same repos too frequently
        verified_only: Whether to only scan for verified secrets (True for faster scans with fewer false positives)
        org_repos_only: Whether to only scan repositories owned by organizations (not individual users)

    Returns:
        dict: Updated system settings

    Example:
        # Skip repos scanned in last 30 days and only find verified secrets
        update_settings(skip_recent_days=30, verified_only=True)

        # Scan all repos regardless of recent scans, include unverified secrets
        update_settings(skip_recent_days=0, verified_only=False)

        # Only scan organization-owned repositories
        update_settings(org_repos_only=True)
    """
    try:
        client = GitAlertsAPIClient()
        data = {}

        if skip_recent_days is not None:
            if skip_recent_days < 0:
                raise ValueError("skip_recent_days must be 0 or greater")
            data["skip_recent_days"] = skip_recent_days

        if verified_only is not None:
            data["verified_only"] = verified_only

        if org_repos_only is not None:
            data["org_repos_only"] = org_repos_only

        if not data:
            raise ValueError("At least one parameter must be provided to update settings")

        response = client.request(
            method="PATCH",
            path="/settings/",
            json=data
        )
        return response
    except ValueError as e:
        raise e
    except Exception as e:
        raise Exception(f"Failed to update system settings: {str(e)}")
