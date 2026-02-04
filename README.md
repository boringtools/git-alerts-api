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

## Project Structure

This project consists of three main components:

- **`api/`** - Django REST API backend ([API Documentation](api/README.md))
- **`ui/`** - React frontend application ([UI Documentation](ui/README.md))
- **`mcp-server/`** - MCP server for AI/LLM integration ([MCP Server Documentation](mcp-server/README.md))

## Quick Start

1. **Clone the repository:**
```bash
git clone https://github.com/YOUR_USERNAME/git-alerts-api.git
cd git-alerts-api
```

2. **Set up the API:**
```bash
cd api
# See api/README.md for detailed setup instructions
```

3. **Set up the UI (optional):**
```bash
cd ui
# See ui/README.md for detailed setup instructions
```

4. **Set up the MCP Server (optional):**
```bash
cd mcp-server
# See mcp-server/README.md for detailed setup instructions
```

## Documentation

- [API Documentation](api/README.md) - Backend API setup and usage
- [UI Documentation](ui/README.md) - Frontend application setup
- [MCP Server Documentation](mcp-server/README.md) - AI/LLM integration setup
- [Architecture Documentation](docs/architecture.md) - System architecture overview
