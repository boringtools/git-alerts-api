# GitAlerts

A comprehensive platform for automated security scanning of GitHub repositories to detect exposed secrets and sensitive information. This project extends the original [git-alerts](https://github.com/boringtools/git-alerts) CLI tool with a web-based platform.

## Overview

GitAlerts provides a complete solution for monitoring GitHub repositories for security vulnerabilities:

- **Automated Scanning** - Detect exposed secrets using TruffleHog
- **Multiple Discovery Methods** - Scan organization repos, user repos, and GitHub search results
- **Smart Filtering** - Reduce false positives with configurable ignore rules
- **Web Interface** - Manage scans and view results through a modern React UI
- **API Access** - RESTful API with interactive documentation
- **AI Integration** - MCP server for LLM/AI tool integration

## Demo

📺 [GitAlerts Platform Walkthrough](https://youtu.be/9AujWmTx9-w)

## Project Structure

This project consists of three main components:

- **`api/`** - Django REST API backend ([API Documentation](api/README.md))
- **`ui/`** - React frontend application ([UI Documentation](ui/README.md))
- **`mcp-server/`** - MCP server for AI/LLM integration ([MCP Server Documentation](mcp-server/README.md))

## Quick Start (Docker)

The fastest way to get GitAlerts running. Requires Docker and Docker Compose.

```bash
git clone https://github.com/YOUR_USERNAME/git-alerts-api.git
cd git-alerts-api
cp .env.example .env
docker compose up
```

Once everything is up:

- UI: http://localhost:5173
- API: http://localhost:8000
- API docs: http://localhost:8000/api/docs/

To create an admin user:

```bash
docker compose exec api python manage.py createsuperuser
```

The MCP server is not part of the compose stack since MCP clients typically launch it themselves. See [`mcp-server/README.md`](mcp-server/README.md) for setup.

## Manual Setup

If you prefer to run components natively, see each component's README:

- [API setup](api/README.md)
- [UI setup](ui/README.md)
- [MCP Server setup](mcp-server/README.md)

## Documentation

- [API Documentation](api/README.md) - Backend API setup and usage
- [UI Documentation](ui/README.md) - Frontend application setup
- [MCP Server Documentation](mcp-server/README.md) - AI/LLM integration setup
- [Architecture Documentation](docs/architecture.md) - System architecture overview
