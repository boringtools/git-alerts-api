import React from 'react';
import { Link } from 'react-router-dom';

const DOCS_BASE =
  import.meta.env.VITE_DOCS_BASE_URL ||
  'https://github.com/boringtools/git-alerts-api/blob/main';

interface DocLink {
  title: string;
  description: string;
  href: string;
  internal?: boolean;
}

const componentDocs: DocLink[] = [
  {
    title: 'Project overview',
    description: 'What GitAlerts does, how to run the whole stack with Docker.',
    href: `${DOCS_BASE}/README.md`,
  },
  {
    title: 'API',
    description: 'Django REST backend: setup, environment variables, endpoints.',
    href: `${DOCS_BASE}/api/README.md`,
  },
  {
    title: 'Web UI',
    description: 'React frontend: local development against the API.',
    href: `${DOCS_BASE}/ui/README.md`,
  },
  {
    title: 'MCP server',
    description: 'Expose scans and findings to AI clients such as Claude Desktop or Cursor.',
    href: `${DOCS_BASE}/mcp-server/README.md`,
  },
];

export const Help: React.FC = () => {
  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Help &amp; documentation</h1>
        <p className="text-muted-foreground mt-2">
          Everything that explains what GitAlerts is doing, and how to drive it from outside
          this browser tab.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-card border border-border rounded-lg p-6 flex flex-col">
          <h2 className="text-xl font-semibold text-foreground">API reference</h2>
          <p className="text-sm text-muted-foreground mt-1 flex-1">
            Interactive Swagger UI for every REST endpoint. Requires a logged-in session:
            if you signed in to this app you are already authorized.
          </p>
          <a
            href="/api/docs/"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Open API reference
          </a>
          <p className="text-xs text-muted-foreground mt-2">
            If the page answers 403, sign in again from the Login screen, then reload it.
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 flex flex-col">
          <h2 className="text-xl font-semibold text-foreground">Architecture</h2>
          <p className="text-sm text-muted-foreground mt-1 flex-1">
            How the React UI, Django API, Celery workers, TruffleHog and the database fit
            together, with a diagram.
          </p>
          <a
            href={`${DOCS_BASE}/docs/architecture.md`}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors"
          >
            Read the architecture doc
          </a>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 flex flex-col md:col-span-2">
          <h2 className="text-xl font-semibold text-foreground">MCP server setup</h2>
          <p className="text-sm text-muted-foreground mt-1 flex-1">
            Let an AI client list scans, read findings and manage ignore rules through GitAlerts.
            The guide builds a copy-pasteable config for this exact server, using a token instead
            of your account password.
          </p>
          <Link
            to="/help/mcp"
            className="mt-4 inline-flex items-center px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity self-start"
          >
            Open the MCP setup guide
          </Link>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-foreground">Component docs</h2>
        <p className="text-sm text-muted-foreground mt-1">
          The README for each part of the repository. These open on GitHub.
        </p>
        <ul className="mt-4 divide-y divide-border border border-border rounded-lg bg-card">
          {componentDocs.map((doc) => (
            <li key={doc.href}>
              <a
                href={doc.href}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col px-6 py-4 hover:bg-accent transition-colors"
              >
                <span className="text-sm font-medium text-foreground">{doc.title}</span>
                <span className="text-sm text-muted-foreground mt-0.5">{doc.description}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
