# GitAlerts Architecture

## Overview
- **API Layer** – Django REST Framework serves the user and system APIs.
- **Worker Layer** – Celery executes concurrent scan jobs (TruffleHog, GitHub API).
- **Database Layer** – PostgreSQL stores repositories, findings, and users.
- **Cache Layer** – Redis manages task queues and caching.

## System Architecture
```mermaid
graph TD
    subgraph User Layer
        U[Security Engineer / Bug Hunter]
    end

    subgraph Frontend Layer
        F[ReactJS App]
    end

    subgraph API Layer
        A[Django Rest Framework API]
    end

    subgraph Data Layer
        D1[(PostgreSQL DB)]
        D2[(Redis Cache / Queue)]
    end

    subgraph Worker Layer
        W1[Celery Workers]
        W2[TruffleHog Scanner]
    end

    subgraph External Integrations
        G1[GitHub API]
    end

    U --> |HTTP Requests| F
    F --> |HTTP Requests| A
    A --> |Dispatch Scan Job| D2
    D2 --> |Process Queued Tasks| W1
    W1 --> |Fetch Repos| G1
    W1 --> |Run Secret Scan| W2
    W2 --> |Store Results| D1
    A --> |Expose Results| F
    F --> |Expose Results| U
    A --> |Store Data| D1
```
