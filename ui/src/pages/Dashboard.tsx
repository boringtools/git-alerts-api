import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { scansApi, findingsApi } from '@/services/api';

export const Dashboard: React.FC = () => {
  const { data: scans = [], isLoading: scansLoading } = useQuery({
    queryKey: ['scans'],
    queryFn: () => scansApi.list(),
  });

  const { data: findings = [], isLoading: findingsLoading } = useQuery({
    queryKey: ['findings'],
    queryFn: () => findingsApi.list(),
  });

  const totalScans = scans.length;
  const totalFindings = findings.length;
  const activeScans = scans.filter(
    (scan) => scan.status === 'in_progress' || scan.status === 'queued'
  ).length;
  const recentScans = scans.slice(0, 5);
  const recentFindings = findings.slice(0, 5);

  const getStatusBadge = (status: string) => {
    const styles = {
      queued: 'bg-blue-500/10 text-blue-600',
      in_progress: 'bg-yellow-500/10 text-yellow-600',
      completed: 'bg-green-500/10 text-green-600',
      failed: 'bg-red-500/10 text-red-600',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-500/10 text-gray-600';
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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <Link
          to="/scans/new"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          New Scan
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-card border border-border rounded-lg">
          <h3 className="text-sm font-medium text-muted-foreground">Total Scans</h3>
          <p className="text-3xl font-bold text-foreground mt-2">
            {scansLoading ? '...' : totalScans}
          </p>
          <Link to="/scans" className="text-xs text-primary hover:underline mt-1 inline-block">
            View all scans
          </Link>
        </div>

        <div className="p-6 bg-card border border-border rounded-lg">
          <h3 className="text-sm font-medium text-muted-foreground">Total Findings</h3>
          <p className="text-3xl font-bold text-foreground mt-2">
            {findingsLoading ? '...' : totalFindings}
          </p>
          <Link to="/findings" className="text-xs text-primary hover:underline mt-1 inline-block">
            View all findings
          </Link>
        </div>

        <div className="p-6 bg-card border border-border rounded-lg">
          <h3 className="text-sm font-medium text-muted-foreground">Active Scans</h3>
          <p className="text-3xl font-bold text-foreground mt-2">
            {scansLoading ? '...' : activeScans}
          </p>
          <p className="text-xs text-muted-foreground mt-1">In progress or queued</p>
        </div>
      </div>

      {/* Recent Scans */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Recent Scans</h2>
          <Link to="/scans" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
        {scansLoading ? (
          <div className="p-8 bg-card border border-border rounded-lg text-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : recentScans.length === 0 ? (
          <div className="p-8 bg-card border border-border rounded-lg text-center">
            <p className="text-muted-foreground">No scans yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Start by creating a new scan
            </p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="divide-y divide-border">
              {recentScans.map((scan) => (
                <Link
                  key={scan.id}
                  to={`/scans/${scan.id}`}
                  className="block p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-foreground">
                          {formatScanType(scan.type)}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                            scan.status
                          )}`}
                        >
                          {scan.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{scan.value}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-foreground">{scan.total_findings} findings</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(scan.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recent Findings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Recent Findings</h2>
          <Link to="/findings" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
        {findingsLoading ? (
          <div className="p-8 bg-card border border-border rounded-lg text-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : recentFindings.length === 0 ? (
          <div className="p-8 bg-card border border-border rounded-lg text-center">
            <p className="text-muted-foreground">No findings yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Run a scan to discover security findings
            </p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="divide-y divide-border">
              {recentFindings.map((finding) => (
                <div
                  key={finding.id}
                  className="p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-foreground">
                          {finding.type}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            finding.validated
                              ? 'bg-green-500/10 text-green-600'
                              : 'bg-yellow-500/10 text-yellow-600'
                          }`}
                        >
                          {finding.validated ? 'VALIDATED' : 'UNVALIDATED'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {finding.repository}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-foreground">{finding.email || 'N/A'}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(finding.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
