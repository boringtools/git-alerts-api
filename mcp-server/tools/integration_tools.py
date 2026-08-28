from utils.api_client import GitAlertsAPIClient


def list_integrations() -> dict:
    """
    List all third-party integrations for the authenticated user

    Returns:
        dict: Dictionary containing 'integrations' key with list of integrations and details including:
            - id: Integration ID
            - provider: Service provider (github, slack)
            - status: Connection status (connected, disconnected, pending, failed)
            - last_validated_at: Last time the token was validated
            - error_message: Error message if validation failed
            - created_at, updated_at: Timestamps
    """
    try:
        client = GitAlertsAPIClient()
        response = client.request(method="GET", path="/integrations/")
        return {"integrations": response}
    except Exception as e:
        raise Exception(f"Failed to list integrations: {str(e)}")




def validate_integration(id: int) -> dict:
    """
    Manually trigger validation for an existing integration

    Args:
        id: The ID of the integration to validate

    Returns:
        dict: Validation trigger confirmation with status

    Note:
        - Validation runs asynchronously (may take a few seconds)
        - Use list_integrations() to check the updated status after validation
        - If validation fails, check the 'error_message' field for details
    """
    try:
        client = GitAlertsAPIClient()
        response = client.request(method="POST", path=f"/integrations/{id}/validate/")
        return response
    except Exception as e:
        raise Exception(
            f"Failed to trigger validation for integration ID {id}: {str(e)}"
        )
