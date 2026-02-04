from utils.api_client import GitAlertsAPIClient


def list_all_findings(
    type: str = None,
    repository: str = None,
    email: str = None,
    validated: bool = None,
    scan_id: int = None,
    search: str = None
) -> dict:
    """
    List all findings from GitAlerts with optional filtering

    Args:
        type: Filter by finding type (e.g., "AWS Access Key", "API Key")
        repository: Filter by repository name
        email: Filter by committer email
        validated: Filter by validation status (True/False)
        scan_id: Filter by scan ID
        search: Search in repository, email, description, value, or commit_hash

    Returns:
        dict: Dictionary containing 'findings' key with list of findings and details including type, value, repository, file, line, commit info, etc.
    """
    try:
        client = GitAlertsAPIClient()
        params = {}

        if type:
            params["type"] = type
        if repository:
            params["repository"] = repository
        if email:
            params["email"] = email
        if validated is not None:
            params["validated"] = validated
        if scan_id:
            params["scan"] = scan_id
        if search:
            params["search"] = search

        response = client.request(
            method="GET",
            path="/findings/",
            params=params
        )
        return {"findings": response}
    except Exception as e:
        raise Exception(f"Failed to list findings: {str(e)}")


def get_finding_details(id: int) -> dict:
    """
    Get detailed information about a specific finding

    Args:
        id: The ID of the finding to retrieve

    Returns:
        dict: Detailed finding information including repository, file, line, commit, and secret value
    """
    try:
        client = GitAlertsAPIClient()
        response = client.request(method="GET", path=f"/findings/{id}/")
        return response
    except Exception as e:
        raise Exception(f"Failed to get finding details for ID {id}: {str(e)}")


def update_finding(id: int, validated: bool) -> dict:
    """
    Update a finding (primarily to mark as validated or not)

    Args:
        id: The ID of the finding to update
        validated: Whether the finding has been validated as a true positive

    Returns:
        dict: Updated finding details
    """
    try:
        client = GitAlertsAPIClient()
        response = client.request(
            method="PATCH",
            path=f"/findings/{id}/",
            json={"validated": validated}
        )
        return response
    except Exception as e:
        raise Exception(f"Failed to update finding ID {id}: {str(e)}")


def delete_finding(id: int) -> dict:
    """
    Delete a finding from GitAlerts

    Args:
        id: The ID of the finding to delete

    Returns:
        dict: Response confirming deletion
    """
    try:
        client = GitAlertsAPIClient()
        response = client.request(method="DELETE", path=f"/findings/{id}/")
        return {"success": True, "message": f"Finding {id} deleted successfully"}
    except Exception as e:
        raise Exception(f"Failed to delete finding ID {id}: {str(e)}")


def list_ignore_types() -> dict:
    """
    List all ignored finding types

    Returns:
        dict: Dictionary containing 'ignore_types' key with list of finding types that are being ignored in scans
    """
    try:
        client = GitAlertsAPIClient()
        response = client.request(method="GET", path="/finding-ignores/types/")
        return {"ignore_types": response}
    except Exception as e:
        raise Exception(f"Failed to list ignored finding types: {str(e)}")


def create_ignore_type(type: str) -> dict:
    """
    Add a finding type to the ignore list (e.g., to filter out false positives)

    Args:
        type: The finding type to ignore (e.g., "Generic API Key", "test_credential")

    Returns:
        dict: Created ignore type entry with ID
    """
    try:
        client = GitAlertsAPIClient()
        response = client.request(
            method="POST",
            path="/finding-ignores/types/",
            json={"type": type}
        )
        return response
    except Exception as e:
        raise Exception(f"Failed to create ignore type '{type}': {str(e)}")


def delete_ignore_type(id: int) -> dict:
    """
    Remove a finding type from the ignore list

    Args:
        id: The ID of the ignore type entry to delete

    Returns:
        dict: Response confirming deletion
    """
    try:
        client = GitAlertsAPIClient()
        response = client.request(method="DELETE", path=f"/finding-ignores/types/{id}")
        return {"success": True, "message": f"Ignore type {id} deleted successfully"}
    except Exception as e:
        raise Exception(f"Failed to delete ignore type ID {id}: {str(e)}")


def list_ignore_domains() -> dict:
    """
    List all ignored email domains

    Returns:
        dict: Dictionary containing 'ignore_domains' key with list of email domains that are being ignored in findings
    """
    try:
        client = GitAlertsAPIClient()
        response = client.request(method="GET", path="/finding-ignores/domains/")
        return {"ignore_domains": response}
    except Exception as e:
        raise Exception(f"Failed to list ignored domains: {str(e)}")


def create_ignore_domain(domain: str) -> dict:
    """
    Add an email domain to the ignore list (e.g., to filter out internal test accounts)

    Args:
        domain: The email domain to ignore (e.g., "example.com", "test.internal")

    Returns:
        dict: Created ignore domain entry with ID
    """
    try:
        client = GitAlertsAPIClient()
        response = client.request(
            method="POST",
            path="/finding-ignores/domains/",
            json={"domain": domain}
        )
        return response
    except Exception as e:
        raise Exception(f"Failed to create ignore domain '{domain}': {str(e)}")


def delete_ignore_domain(id: int) -> dict:
    """
    Remove an email domain from the ignore list

    Args:
        id: The ID of the ignore domain entry to delete

    Returns:
        dict: Response confirming deletion
    """
    try:
        client = GitAlertsAPIClient()
        response = client.request(method="DELETE", path=f"/finding-ignores/domains/{id}")
        return {"success": True, "message": f"Ignore domain {id} deleted successfully"}
    except Exception as e:
        raise Exception(f"Failed to delete ignore domain ID {id}: {str(e)}")
