import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const DOCS_BASE =
  import.meta.env.VITE_DOCS_BASE_URL ||
  'https://github.com/boringtools/git-alerts-api/blob/main';

const toolGroups = [
  {
    name: 'Scans',
    tools: 'list, details, create, delete, findings for one scan',
  },
  {
    name: 'Findings',
    tools: 'list, details, update, delete',
  },
  {
    name: 'Ignore rules',
    tools: 'list and manage ignored finding types and email domains',
  },
  {
    name: 'Settings',
    tools: 'read and update system settings',
  },
  {
    name: 'Integrations',
    tools: 'list GitHub and Slack integrations, trigger a validation',
  },
  {
    name: 'Server',
    tools: 'health check',
  },
];

interface CodeBlockProps {
  code: string;
  label?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, label }) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="relative">
      {label && <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>}
      <pre className="bg-muted text-foreground text-xs leading-relaxed rounded-lg p-4 overflow-x-auto">
        <code>{code}</code>
      </pre>
      <button
        onClick={copy}
        className="absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium border border-border bg-card hover:bg-accent transition-colors"
        type="button"
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
};

export const McpSetup: React.FC = () => {
  const origin = window.location.origin;

  const mcpConfig = useMemo(
    () =>
      JSON.stringify(
        {
          mcpServers: {
            gitalerts: {
              command: 'python',
              args: ['/absolute/path/to/git-alerts-api/mcp-server/main.py'],
              env: {
                GITALERTS_API_BASE_URL: origin,
                GITALERTS_REFRESH_TOKEN: '<paste the refresh token from step 2>',
              },
            },
          },
        },
        null,
        2
      ),
    [origin]
  );

  const tokenCommand = `curl -s -X POST ${origin}/api/token/ \\
  -H 'Content-Type: application/json' \\
  -d '{"username": "YOUR_USERNAME", "password": "YOUR_PASSWORD"}'`;

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <Link
          to="/help"
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          &larr; Help &amp; documentation
        </Link>
        <h1 className="text-3xl font-bold text-foreground mt-2">MCP server setup</h1>
        <p className="text-muted-foreground mt-2">
          The MCP server exposes this GitAlerts instance to AI clients such as Claude Desktop,
          Cursor or any other Model Context Protocol host. It talks to the REST API at{' '}
          <span className="font-medium text-foreground">{origin}</span>, so the config below is
          already pointed at this server.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">Before you start</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
          <li>
            Python 3.14+ and <code className="text-foreground">uv</code> on the machine that runs
            the MCP client.
          </li>
          <li>
            A local clone of the repository, because the client launches{' '}
            <code className="text-foreground">mcp-server/main.py</code> directly.
          </li>
          <li>
            In <code className="text-foreground">mcp-server/</code> run{' '}
            <code className="text-foreground">uv sync</code> once to install its dependencies.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">1. Install the server</h2>
        <CodeBlock
          code={`git clone ${DOCS_BASE.replace('/blob/main', '')}.git\ncd git-alerts-api/mcp-server\nuv sync`}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">2. Get a token</h2>
        <p className="text-sm text-muted-foreground">
          Authenticate once from a terminal and keep the two tokens in the response. Do not put
          your account password in an MCP config file: the config is plain text and is often
          synced to other machines.
        </p>
        <CodeBlock label="Run this in a terminal, not in a config file" code={tokenCommand} />
        <p className="text-sm text-muted-foreground">
          Use the <code className="text-foreground">refresh</code> value from the response in the
          config below. It lasts 30 days and lets the server mint fresh access tokens by itself.
          If you prefer the short-lived route, put the{' '}
          <code className="text-foreground">access</code> value in{' '}
          <code className="text-foreground">GITALERTS_API_TOKEN</code> instead; it expires after
          24 hours.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">3. Point your MCP client at it</h2>
        <p className="text-sm text-muted-foreground">
          Paste this into the client's MCP configuration (for Claude Desktop that is{' '}
          <code className="text-foreground">claude_desktop_config.json</code>; for Cursor it is{' '}
          <code className="text-foreground">.mcp.json</code> in the project root). Replace the
          path in <code className="text-foreground">args</code> with your clone.
        </p>
        <CodeBlock label=".mcp.json" code={mcpConfig} />
        <p className="text-xs text-muted-foreground">
          Tokens are bearer credentials: keep the file readable by you only (
          <code className="text-foreground">chmod 600</code>) and never commit it. When the
          refresh token expires after 30 days, repeat step 2 and replace it.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">What the client gets</h2>
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left font-medium px-4 py-2 text-foreground">Area</th>
                <th className="text-left font-medium px-4 py-2 text-foreground">Tools</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {toolGroups.map((group) => (
                <tr key={group.name}>
                  <td className="px-4 py-2 align-top text-foreground">{group.name}</td>
                  <td className="px-4 py-2 text-muted-foreground">{group.tools}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-muted-foreground">
          The tools act as the account that owns the token, so they can create and delete scans
          as well as read findings. See the{' '}
          <a
            href={`${DOCS_BASE}/mcp-server/README.md`}
            target="_blank"
            rel="noreferrer"
            className="text-primary hover:underline"
          >
            MCP server README
          </a>{' '}
          for the full list.
        </p>
      </section>
    </div>
  );
};
