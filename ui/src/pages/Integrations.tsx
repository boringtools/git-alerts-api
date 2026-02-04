import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { integrationsApi } from '@/services/api';

export const Integrations: React.FC = () => {
  const queryClient = useQueryClient();
  const [githubToken, setGithubToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [isUpdatingToken, setIsUpdatingToken] = useState(false);

  const { data: integrations = [], isLoading } = useQuery({
    queryKey: ['integrations'],
    queryFn: integrationsApi.list,
  });

  const addIntegrationMutation = useMutation({
    mutationFn: integrationsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      setGithubToken('');
      setShowTokenInput(false);
      setIsUpdatingToken(false);
    },
  });

  const validateIntegrationMutation = useMutation({
    mutationFn: integrationsApi.validate,
    onSuccess: () => {
      // Wait a bit for validation to complete, then refresh
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['integrations'] });
      }, 2000);
    },
  });

  const handleAddGitHub = (e: React.FormEvent) => {
    e.preventDefault();
    if (githubToken.trim()) {
      addIntegrationMutation.mutate({
        provider: 'github',
        token: githubToken.trim(),
      });
    }
  };

  const handleTestConnection = (integrationId: number) => {
    validateIntegrationMutation.mutate(integrationId);
  };

  const githubIntegration = integrations.find((i) => i.provider === 'github');

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Integrations</h1>
        <p className="text-muted-foreground mt-2">
          Connect external services to GitAlerts
        </p>
      </div>

      {/* GitHub Integration */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">GitHub</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Required for scanning repositories
            </p>
          </div>
          {githubIntegration ? (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              githubIntegration.status === 'connected'
                ? 'bg-green-500/10 text-green-600'
                : githubIntegration.status === 'pending'
                ? 'bg-yellow-500/10 text-yellow-600'
                : 'bg-red-500/10 text-red-600'
            }`}>
              {githubIntegration.status.charAt(0).toUpperCase() + githubIntegration.status.slice(1)}
            </span>
          ) : (
            <span className="px-3 py-1 bg-yellow-500/10 text-yellow-600 rounded-full text-sm font-medium">
              Not Connected
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="text-muted-foreground">Loading...</div>
        ) : githubIntegration ? (
          <div className="space-y-3">
            {/* Show error message if failed */}
            {githubIntegration.error_message && (
              <div className="p-3 bg-destructive/10 border border-destructive rounded-lg">
                <p className="text-sm text-destructive font-medium">Connection Error</p>
                <p className="text-sm text-destructive mt-1">{githubIntegration.error_message}</p>
              </div>
            )}

            {/* Integration Details */}
            {!isUpdatingToken ? (
              <>
                <div className="p-3 bg-muted rounded-lg space-y-2">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">Status:</span> {githubIntegration.status.charAt(0).toUpperCase() + githubIntegration.status.slice(1)}
                  </p>
                  <p className="text-sm text-foreground">
                    <span className="font-medium">User:</span> {githubIntegration.user}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Connected: {new Date(githubIntegration.created_at).toLocaleString()}
                  </p>
                  {githubIntegration.last_validated_at && (
                    <p className="text-sm text-muted-foreground">
                      Last validated: {new Date(githubIntegration.last_validated_at).toLocaleString()}
                    </p>
                  )}
                </div>

                {githubIntegration.status === 'connected' && (
                  <p className="text-sm text-muted-foreground">
                    You can now create scans. The token is encrypted and stored securely.
                  </p>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleTestConnection(githubIntegration.id)}
                    disabled={validateIntegrationMutation.isPending}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {validateIntegrationMutation.isPending ? 'Testing...' : 'Test Connection'}
                  </button>
                  <button
                    onClick={() => setIsUpdatingToken(true)}
                    className="px-4 py-2 border border-border rounded-lg font-medium hover:bg-accent transition-colors"
                  >
                    Update Token
                  </button>
                </div>
              </>
            ) : (
              /* Update Token Form */
              <form onSubmit={handleAddGitHub} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    New GitHub Personal Access Token
                  </label>
                  <input
                    type="password"
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Your token will be encrypted and stored securely
                  </p>
                </div>

                {addIntegrationMutation.isError && (
                  <div className="p-3 bg-destructive/10 border border-destructive rounded-lg">
                    <p className="text-sm text-destructive">
                      Failed to update token. Please check your token and try again.
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={addIntegrationMutation.isPending}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {addIntegrationMutation.isPending ? 'Updating...' : 'Update Token'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsUpdatingToken(false);
                      setGithubToken('');
                    }}
                    className="px-4 py-2 border border-border rounded-lg font-medium hover:bg-accent transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {!showTokenInput ? (
              <div className="space-y-3">
                <p className="text-sm text-foreground">
                  Connect your GitHub account to enable repository scanning.
                </p>
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <p className="text-sm font-medium text-foreground">How to get a GitHub token:</p>
                  <ol className="text-sm text-muted-foreground space-y-1 ml-4 list-decimal">
                    <li>Go to GitHub Settings → Developer settings → Personal access tokens</li>
                    <li>Click "Generate new token (classic)"</li>
                    <li>
                      Select scopes: <code className="px-1 py-0.5 bg-background rounded">repo</code>,{' '}
                      <code className="px-1 py-0.5 bg-background rounded">read:org</code>,{' '}
                      <code className="px-1 py-0.5 bg-background rounded">read:user</code>
                    </li>
                    <li>Generate and copy the token</li>
                  </ol>
                </div>
                <button
                  onClick={() => setShowTokenInput(true)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  Connect GitHub
                </button>
              </div>
            ) : (
              <form onSubmit={handleAddGitHub} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    GitHub Personal Access Token
                  </label>
                  <input
                    type="password"
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Your token will be encrypted and stored securely
                  </p>
                </div>

                {addIntegrationMutation.isError && (
                  <div className="p-3 bg-destructive/10 border border-destructive rounded-lg">
                    <p className="text-sm text-destructive">
                      Failed to connect GitHub. Please check your token and try again.
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={addIntegrationMutation.isPending}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {addIntegrationMutation.isPending ? 'Connecting...' : 'Connect'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowTokenInput(false);
                      setGithubToken('');
                    }}
                    className="px-4 py-2 border border-border rounded-lg font-medium hover:bg-accent transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Slack Integration (Placeholder) */}
      <div className="bg-card border border-border rounded-lg p-6 opacity-50">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Slack</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Get notifications about new findings
            </p>
          </div>
          <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm font-medium">
            Coming Soon
          </span>
        </div>
      </div>
    </div>
  );
};
