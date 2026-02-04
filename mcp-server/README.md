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

Copy the example environment file and update with your GitAlerts API credentials:

```bash
cp .env.example .env
```

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
- **Integrations**: List, create, and validate integrations (GitHub, Slack)
- **Server**: Health check

## MCP Client Configuration

Configure the MCP server in your MCP client (e.g., Claude Desktop, Cursor):

```json
{
  "mcpServers": {
    "gitalerts": {
      "command": "python",
      "args": ["/path/to/mcp-server/main.py"]
    }
  }
}
```
