import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { scansApi } from '@/services/api';
import type { ScanType } from '@/types';

const SCAN_TYPES: { value: ScanType; label: string; description: string }[] = [
  {
    value: 'org_repos',
    label: 'Organization Repositories',
    description: 'Scan all repositories in a GitHub organization',
  },
  {
    value: 'org_users',
    label: 'Organization Users',
    description: 'Scan repositories of all members in an organization',
  },
  {
    value: 'search_code',
    label: 'Search Code',
    description: 'Scan repositories from GitHub code search results',
  },
  {
    value: 'search_commits',
    label: 'Search Commits',
    description: 'Scan repositories from GitHub commit search results',
  },
  {
    value: 'search_issues',
    label: 'Search Issues',
    description: 'Scan repositories from GitHub issue/PR search results',
  },
  {
    value: 'search_repos',
    label: 'Search Repositories',
    description: 'Scan repositories from GitHub repository search',
  },
  {
    value: 'search_users',
    label: 'Search Users',
    description: 'Scan repositories from GitHub user search results',
  },
];

export const NewScan: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [scanType, setScanType] = useState<ScanType>('org_repos');
  const [query, setQuery] = useState('');

  const createScanMutation = useMutation({
    mutationFn: scansApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scans'] });
      navigate('/scans');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createScanMutation.mutate({ type: scanType, value: query });
  };

  const selectedType = SCAN_TYPES.find((t) => t.value === scanType);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Create New Scan</h1>
        <p className="text-muted-foreground mt-2">
          Configure a new security scan for GitHub repositories
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Scan Type Selection */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Scan Type
            </label>
            <select
              value={scanType}
              onChange={(e) => setScanType(e.target.value as ScanType)}
              className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              required
            >
              {SCAN_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {selectedType && (
              <p className="text-sm text-muted-foreground mt-2">
                {selectedType.description}
              </p>
            )}
          </div>

          {/* Query Input */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Query
            </label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={getQueryPlaceholder(scanType)}
              className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
            <p className="text-sm text-muted-foreground mt-2">
              {getQueryHelp(scanType)}
            </p>
          </div>
        </div>

        {/* Error Display */}
        {createScanMutation.isError && (
          <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
            <p className="text-sm font-semibold text-destructive mb-1">
              Failed to create scan
            </p>
            <p className="text-sm text-destructive">
              {(() => {
                const error = createScanMutation.error as any;
                if (error?.response?.data) {
                  // Handle validation errors
                  const data = error.response.data;
                  if (typeof data === 'string') return data;
                  if (data.non_field_errors) return data.non_field_errors[0];
                  if (data.detail) return data.detail;
                  // Return first error message from any field
                  const firstError = Object.values(data)[0];
                  if (Array.isArray(firstError)) return firstError[0];
                  if (typeof firstError === 'string') return firstError;
                }
                return 'Please check your input and try again.';
              })()}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={createScanMutation.isPending}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createScanMutation.isPending ? 'Creating...' : 'Create Scan'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/scans')}
            className="px-6 py-2 border border-border rounded-lg font-medium hover:bg-accent transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

function getQueryPlaceholder(scanType: ScanType): string {
  switch (scanType) {
    case 'org_repos':
    case 'org_users':
      return 'e.g., microsoft';
    case 'search_code':
      return 'e.g., AWS_SECRET_KEY';
    case 'search_commits':
      return 'e.g., password OR secret';
    case 'search_issues':
      return 'e.g., exposed credentials';
    case 'search_repos':
      return 'e.g., security scanner';
    case 'search_users':
      return 'e.g., john-doe';
    default:
      return '';
  }
}

function getQueryHelp(scanType: ScanType): string {
  switch (scanType) {
    case 'org_repos':
      return 'Enter the GitHub organization name';
    case 'org_users':
      return 'Enter the GitHub organization name to scan all member repositories';
    case 'search_code':
      return 'Enter code search query (searches GitHub code)';
    case 'search_commits':
      return 'Enter commit search query (searches GitHub commits)';
    case 'search_issues':
      return 'Enter issue/PR search query (searches GitHub issues and pull requests)';
    case 'search_repos':
      return 'Enter repository search query (searches GitHub repositories)';
    case 'search_users':
      return 'Enter user search query (searches GitHub users)';
    default:
      return '';
  }
}
