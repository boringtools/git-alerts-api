from datetime import datetime
from utils.api_client import GitAlertsAPIClient


def health_check() -> dict:
    """
    Check GitAlerts MCP server health and return status information

    Returns:
        dict: Server health status including:
            - status: Overall health status (healthy, degraded, unhealthy)
            - mcp_server: MCP server name and version
            - api: GitAlerts API health information
            - timestamp: Current timestamp
    """
    status = "healthy"
    api_info = None
    api_error = None

    try:
        client = GitAlertsAPIClient()
        api_response = client.request(method="GET", path="/")
        api_info = api_response
    except Exception as e:
        status = "degraded"
        api_error = str(e)

    health_response = {
        "status": status,
        "mcp_server": {"name": "GitAlerts MCP Server", "version": "1.0.0"},
        "timestamp": datetime.now().isoformat(),
    }

    if api_info:
        health_response["api"] = api_info

    if api_error:
        health_response["api_error"] = api_error

    return health_response
