import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scansApi } from '@/services/api';

export const ScanDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: scan, isLoading, error } = useQuery({
    queryKey: ['scan', id],
    queryFn: () => scansApi.get(Number(id)),
    enabled: !!id,
    refetchInterval: (query) => {
      const data = query.state.data;
      // Auto-refresh every 3 seconds if scan is active
      const isActive = data?.status === 'queued' || data?.status === 'in_progress';
      return isActive ? 3000 : false;
    },
  });

  const deleteScanMutation = useMutation({
    mutationFn: scansApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scans'] });
      navigate('/scans');
    },
  });

  const handleDeleteScan = () => {
    if (scan && window.confirm(`Are you sure you want to delete the scan "${scan.value}"? This action cannot be undone.`)) {
      deleteScanMutation.mutate(scan.id);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      queued: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      in_progress: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
      completed: 'bg-green-500/10 text-green-600 dark:text-green-400',
      failed: 'bg-red-500/10 text-red-600 dark:text-red-400',
    };
    return styles[status as keyof typeof styles] || 'bg-muted text-muted-foreground';
  };

  const formatScanType = (type: string) => {
    const typeMap: Record<string, string> = {
      org_repos: 'Organization Repositories',
      org_users: 'Organization Users',
      search_code: 'Search Code',
      search_commits: 'Search Commits',
      search_issues: 'Search Issues',
      search_repos: 'Search Repositories',
      search_users: 'Search Users',
    };
    return typeMap[type] || type;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <p className="text-muted-foreground">Loading scan details...</p>
        </div>
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="space-y-6">
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <p className="text-destructive">Failed to load scan details</p>
          <Link
            to="/scans"
            className="inline-block mt-4 text-primary hover:underline"
          >
            Back to Scans
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/scans"
              className="text-muted-foreground hover:text-foreground"
            >
              ← Back
            </Link>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Scan Details</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Scan #{scan.id}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to={`/findings?scan=${scan.id}`}
            className="inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            View Findings
          </Link>
          <button
            onClick={handleDeleteScan}
            disabled={deleteScanMutation.isPending}
            className="inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-lg bg-destructive px-4 py-2 font-medium text-destructive-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {deleteScanMutation.isPending ? 'Deleting...' : 'Delete Scan'}
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-4 space-y-6 sm:p-6">
        {/* Basic Information */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Scan Type</h3>
              <p className="text-foreground text-lg">{formatScanType(scan.type)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Status</h3>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(scan.status)}`}
              >
                {scan.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Query/Value</h3>
              <p className="text-foreground text-lg font-mono">{scan.value}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">User</h3>
              <p className="text-foreground text-lg">{scan.user}</p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="border-t border-border pt-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Statistics</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Repositories</h3>
              <p className="text-3xl font-bold text-foreground">{scan.total_repositories}</p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Scanned</h3>
              <p className="text-3xl font-bold text-foreground">{scan.scanned_repositories}</p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Findings</h3>
              <p className="text-3xl font-bold text-foreground">{scan.total_findings}</p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Ignored</h3>
              <p className="text-3xl font-bold text-muted-foreground">
                {scan.ignored_repositories + scan.ignored_findings}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {scan.ignored_repositories} repos, {scan.ignored_findings} findings
              </p>
            </div>
          </div>
        </div>

        {/* Timestamps */}
        <div className="border-t border-border pt-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Timeline</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Created At</h3>
              <p className="text-foreground">{new Date(scan.created_at).toLocaleString()}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Updated At</h3>
              <p className="text-foreground">{new Date(scan.updated_at).toLocaleString()}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Completed At</h3>
              <p className="text-foreground">
                {scan.completed_at ? new Date(scan.completed_at).toLocaleString() : 'Not completed'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
