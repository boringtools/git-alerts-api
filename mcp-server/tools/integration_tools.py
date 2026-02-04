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


def create_integration(provider: str, token: str) -> dict:
    """
    Create or update a third-party integration (GitHub, Slack, etc.)

    Args:
        provider: The service provider. Valid values:
            - github: GitHub integration (requires Personal Access Token)
            - slack: Slack integration (requires Bot Token)
        token: The API token or access token for the provider
            - For GitHub: Personal Access Token with repo scope
            - For Slack: Bot User OAuth Token (xoxb-...)
            - Must be at least 10 characters

    Returns:
        dict: Created/updated integration details including validation status

    Example:
        # Add GitHub integration
        create_integration(provider="github", token="ghp_xxxxxxxxxxxx")

        # Add Slack integration
        create_integration(provider="slack", token="xoxb-xxxxxxxxxxxx")

    Note:
        - If an integration already exists for the provider, it will be updated
        - Validation is triggered automatically after creation
        - Check the 'status' field to see if validation succeeded
    """
    valid_providers = ["github", "slack"]

    if provider not in valid_providers:
        raise ValueError(
            f"Invalid provider '{provider}'. Valid providers are: {', '.join(valid_providers)}"
        )

    if not token or len(token) < 10:
        raise ValueError("Token must be at least 10 characters long")

    try:
        client = GitAlertsAPIClient()
        response = client.request(
            method="POST",
            path="/integrations/",
            json={"provider": provider, "token": token},
        )
        return response
    except Exception as e:
        raise Exception(f"Failed to create integration for '{provider}': {str(e)}")


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
