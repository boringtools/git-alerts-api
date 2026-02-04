# GitAlerts UI

Modern React frontend for the GitAlerts API - automated security scanning for GitHub repositories.

## Prerequisites

- Node.js 18+ and npm
- GitAlerts API running on `http://localhost:8000` (or configure `VITE_API_BASE_URL`)

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file in the `ui/` directory:

```bash
cp .env.example .env
```

Set your API base URL:

```
VITE_API_BASE_URL=http://localhost:8000
```

## Usage

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Building for Production

```bash
npm run build
```

Build output will be in `dist/` directory. The application is a static site that can be deployed to any static hosting service (Netlify, Vercel, AWS S3 + CloudFront, etc.).

## Environment Variables

- `VITE_API_BASE_URL` - Base URL for the GitAlerts API (default: `http://localhost:8000`)

**Note:** CORS must be configured on the API to allow requests from the UI origin. For development, the API should allow `http://localhost:5173`.
