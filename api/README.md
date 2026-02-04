# Git Alerts API

Django REST API backend for automated security scanning of GitHub repositories using TruffleHog to detect exposed secrets.

## Features

- Multiple scan types: organization repositories, organization users, and GitHub search (code, commits, issues, repos, users)
- Automated secret detection using TruffleHog
- Smart filtering: ignore findings by type or email domain
- Duplicate scan prevention with configurable caching window
- Asynchronous task processing with Celery and Redis
- RESTful API with interactive Swagger documentation

## Prerequisites

- Python 3.12+
- PostgreSQL
- Redis
- TruffleHog CLI

## Installation

1. **Set up PostgreSQL database:**
```bash
# Create database using psql
psql -U postgres
CREATE DATABASE git_alerts_db;
```

2. **Install TruffleHog:**
```bash
# macOS
brew install trufflehog

# Linux (using Go)
go install github.com/trufflesecurity/trufflehog/v3/cmd/trufflehog@latest

# Or download from: https://github.com/trufflesecurity/trufflehog/releases
```

Verify installation:
```bash
trufflehog --version
```

3. **Install Python dependencies:**
```bash
uv sync
```

Activate the virtual environment:
```bash
source .venv/bin/activate  # On macOS/Linux
# or on Windows:
# .venv\Scripts\activate
```

4. **Configure environment variables:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

Generate encryption key:
```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
# Add the output to .env as ENCRYPTION_KEY
```

5. **Set up Redis:**
```bash
# macOS
brew install redis
brew services start redis

# Linux
sudo apt-get install redis-server
sudo systemctl start redis
```

6. **Run database migrations:**
```bash
python manage.py migrate
python manage.py createsuperuser
```

## Usage

### Development

Start Redis, Celery worker, and Django server:

```bash
# Terminal 1: Start Redis
redis-server

# Terminal 2: Start Celery worker
celery -A api worker --loglevel=info

# Terminal 3: Start Django server
python manage.py runserver
```

The API will be available at `http://localhost:8000`

### Production

```bash
gunicorn api.wsgi:application --bind 0.0.0.0:8000
```

## API Documentation

### Interactive API Documentation

Explore and test all API endpoints interactively using Swagger UI:

- **Swagger UI**: http://localhost:8000/api/docs/
- **OpenAPI Schema**: http://localhost:8000/api/schema/

### Example API Usage

```bash
# Obtain JWT token
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "your_username",
    "password": "your_password"
  }'

# Create a scan
curl -X POST http://localhost:8000/scans/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type": "org_repos", "value": "your-org-name"}'

# Check scan status
curl http://localhost:8000/scans/1/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Scan Types

| Type | Description | Value Example |
|------|-------------|---------------|
| `org_repos` | All repos in an organization | `my-org` |
| `org_users` | All repos from org members | `my-org` |
| `search_code` | Repos from code search | `"api_key" language:python` |
| `search_commits` | Repos from commit search | `"password" committer:user` |
| `search_issues` | Repos from issue search | `"credentials" is:issue` |
| `search_repos` | Repos from repo search | `security stars:>100` |
| `search_users` | Repos from user search | `location:San Francisco` |

## Configuration

See `.env.example` for all available environment variables. Key variables include:

- `SECRET_KEY` - Django secret key
- `ENCRYPTION_KEY` - Fernet encryption key for token storage
- `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` - Database configuration
- `CELERY_BROKER_URL`, `CELERY_RESULT_BACKEND` - Redis configuration
