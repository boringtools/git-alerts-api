# GitAlerts MCP Server

Model Context Protocol (MCP) server for GitAlerts API - provides AI/LLM integration tools for managing scans, findings, integrations, and settings.

## Prerequisites

- Python 3.14+
- [uv](https://docs.astral.sh/uv/) package manager
- GitAlerts API running and accessible
- MCP-compatible client (Claude Desktop, Cursor, etc.)

## Installation

```bash
uv sync
source .venv/bin/activate
```

## Configuration

The server talks to the API with a **token**, never with your account password in a
config file. MCP client configs are plain text and are frequently synced, backed up or
committed, so a password there is a password leaked.

Get a token pair once from a terminal:

```bash
curl -s -X POST https://gitalerts.example.com/api/token/ \
  -H 'Content-Type: application/json' \
  -d '{"username": "YOUR_USERNAME", "password": "YOUR_PASSWORD"}'
```

The response contains `access` (24 hours) and `refresh` (30 days). Use the refresh token:

```bash
export GITALERTS_API_BASE_URL=https://gitalerts.example.com
export GITALERTS_REFRESH_TOKEN=<refresh token from the response>
```

The server mints a new access token whenever the current one expires, so the refresh
token is the only long-lived secret in the config.

| Variable | Use |
| --- | --- |
| `GITALERTS_API_BASE_URL` | Base URL of the API, no trailing slash needed. Required. |
| `GITALERTS_REFRESH_TOKEN` | Recommended. 30 day lifetime, renewed into access tokens automatically. |
| `GITALERTS_API_TOKEN` | A ready-made access token. Works, but expires after 24 hours and is not auto-renewed. |
| `GITALERTS_USERNAME` + `GITALERTS_PASSWORD` | Legacy path: the server logs in with your account password. Only use it when you cannot issue a token, because it keeps a password in plain text. |

For local development, copy `.env.example` to `.env` and fill in the same variables.

## Usage

Run the MCP server:

```bash
python main.py
```

## Available Tools

The server provides tools for:

- **Scans**: List, create, fetch details, delete scans, and get scan findings
- **Findings**: List, get details, update, and delete findings
- **Ignore Rules**: Manage ignored finding types and email domains
- **Settings**: Get and update system settings
- **Integrations**: List and validate integrations (GitHub, Slack)
- **Server**: Health check

## MCP Client Configuration

Configure the MCP server in your MCP client (e.g., Claude Desktop, Cursor):

```json
{
  "mcpServers": {
    "gitalerts": {
      "command": "python",
      "args": ["/path/to/git-alerts-api/mcp-server/main.py"],
      "env": {
        "GITALERTS_API_BASE_URL": "https://gitalerts.example.com",
        "GITALERTS_REFRESH_TOKEN": "<refresh token>"
      }
    }
  }
}
```

Restrict the config file (`chmod 600`) and do not commit it: the token is a bearer
credential for the account that issued it.
