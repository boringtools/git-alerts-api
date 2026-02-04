from os import path
from fastmcp import FastMCP
from dotenv import load_dotenv
from tools.scan_tools import (
    list_all_scans,
    fetch_scan_details,
    create_scan,
    delete_scan,
    get_scan_findings
)
from tools.finding_tools import (
    list_all_findings,
    get_finding_details,
    update_finding,
    delete_finding,
    list_ignore_types,
    create_ignore_type,
    delete_ignore_type,
    list_ignore_domains,
    create_ignore_domain,
    delete_ignore_domain
)
from tools.settings_tools import (
    get_settings,
    update_settings
)
from tools.integration_tools import (
    list_integrations,
    create_integration,
    validate_integration
)
from tools.server_tools import (
    health_check
)

load_dotenv()

mcp = FastMCP(name="GitAlerts MCP Server")

# Scan tools
mcp.tool(list_all_scans)
mcp.tool(fetch_scan_details)
mcp.tool(create_scan)
mcp.tool(delete_scan)
mcp.tool(get_scan_findings)

# Finding tools
mcp.tool(list_all_findings)
mcp.tool(get_finding_details)
mcp.tool(update_finding)
mcp.tool(delete_finding)

# Ignore management tools
mcp.tool(list_ignore_types)
mcp.tool(create_ignore_type)
mcp.tool(delete_ignore_type)
mcp.tool(list_ignore_domains)
mcp.tool(create_ignore_domain)
mcp.tool(delete_ignore_domain)

# Settings tools
mcp.tool(get_settings)
mcp.tool(update_settings)

# Integration tools
mcp.tool(list_integrations)
mcp.tool(create_integration)
mcp.tool(validate_integration)

# Server tools
mcp.tool(health_check)

if __name__ == "__main__":
    mcp.run()
