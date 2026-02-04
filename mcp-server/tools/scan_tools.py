from utils.api_client import GitAlertsAPIClient


def list_all_scans() -> dict:
    """
    List all scans from GitAlerts

    Returns:
        dict: Dictionary containing 'scans' key with list of all scans and their details including status, type, findings count, etc.
    """
    try:
        client = GitAlertsAPIClient()
        response = client.request(
            method="GET",
            path="/scans/",
        )
        return {"scans": response}
    except Exception as e:
        raise Exception(f"Failed to list scans: {str(e)}")


def fetch_scan_details(id: int) -> dict:
    """
    Fetch a scan from GitAlerts

    Args:
        id : scan id

    Returns:
        dict: return scan details
    """
    try:
        client = GitAlertsAPIClient()
        response = client.request(method="GET", path=f"/scans/{id}/")
        return response
    except Exception as e:
        raise Exception(f"Failed to fetch scan details for scan ID {id}: {str(e)}")


def create_scan(type: str, value: str) -> dict:
    """
    Create a new scan in GitAlerts

    Args:
        type: The type of scan to create. Valid values:
            - org_repos: Organization Repositories
            - org_users: Organization Users
            - search_code: Search Code
            - search_commits: Search Commits
            - search_issues: Search Issues
            - search_repos: Search Repositories
            - search_users: Search Users
        value: The value/target for the scan (e.g., organization name, search query)

    Returns:
        dict: Created scan details with ID, status, and other information
    """
    valid_types = [
        "org_repos",
        "org_users",
        "search_code",
        "search_commits",
        "search_issues",
        "search_repos",
        "search_users",
    ]

    if type not in valid_types:
        raise ValueError(
            f"Invalid scan type '{type}'. Valid types are: {', '.join(valid_types)}"
        )

    try:
        client = GitAlertsAPIClient()
        response = client.request(
            method="POST", path="/scans/", json={"type": type, "value": value}
        )
        return response
    except Exception as e:
        raise Exception(
            f"Failed to create scan of type '{type}' for value '{value}': {str(e)}"
        )


def delete_scan(id: int) -> dict:
    """
    Delete a scan from GitAlerts

    Args:
        id: The ID of the scan to delete

    Returns:
        dict: Response confirming deletion
    """
    try:
        client = GitAlertsAPIClient()
        response = client.request(method="DELETE", path=f"/scans/{id}/")
        return {"success": True, "message": f"Scan {id} deleted successfully"}
    except Exception as e:
        raise Exception(f"Failed to delete scan ID {id}: {str(e)}")


def get_scan_findings(id: int) -> dict:
    """
    Get all findings for a specific scan

    Args:
        id: The ID of the scan to get findings for

    Returns:
        dict: Dictionary containing 'findings' key with list of findings associated with the scan, including severity, description, repository info, etc.
    """
    try:
        client = GitAlertsAPIClient()
        response = client.request(method="GET", path=f"/scans/{id}/findings/")
        return {"findings": response}
    except Exception as e:
        raise Exception(f"Failed to get findings for scan ID {id}: {str(e)}")
