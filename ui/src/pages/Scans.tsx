import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scansApi } from '@/services/api';

export const Scans: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedScans, setSelectedScans] = useState<Set<number>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  // Filter form state
  const [filterForm, setFilterForm] = useState({
    type: searchParams.get('type') || '',
    value: searchParams.get('value') || '',
    status: searchParams.get('status') || '',
    created_at: searchParams.get('created_at') || '',
    completed_at: searchParams.get('completed_at') || '',
  });

  // Extract all filter parameters from URL
  const filters = {
    type: searchParams.get('type') || undefined,
    value: searchParams.get('value') || undefined,
    status: searchParams.get('status') || undefined,
    created_at: searchParams.get('created_at') || undefined,
    completed_at: searchParams.get('completed_at') || undefined,
  };

  const { data: scans = [], isLoading, error } = useQuery({
    queryKey: ['scans', filters],
    queryFn: () => scansApi.list(filters),
    refetchInterval: (query) => {
      const data = query.state.data;
      // Auto-refresh every 5 seconds if any scan is active
      const hasActiveScan = data?.some(
        (scan) => scan.status === 'queued' || scan.status === 'in_progress'
      );
      return hasActiveScan ? 5000 : false;
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      await Promise.all(ids.map(id => scansApi.delete(id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scans'] });
      setSelectedScans(new Set());
    },
  });

  const handleToggleSelection = (id: number) => {
    const newSelected = new Set(selectedScans);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedScans(newSelected);
  };

  const handleToggleSelectAll = () => {
    if (selectedScans.size === scans.length) {
      setSelectedScans(new Set());
    } else {
      setSelectedScans(new Set(scans.map(s => s.id)));
    }
  };

  const handleBulkDelete = () => {
    const count = selectedScans.size;
    if (window.confirm(`Are you sure you want to delete ${count} scan${count > 1 ? 's' : ''}? This action cannot be undone.`)) {
      bulkDeleteMutation.mutate(Array.from(selectedScans));
    }
  };

  const handleApplyFilters = () => {
    const newParams = new URLSearchParams();
    Object.entries(filterForm).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      }
    });
    setSearchParams(newParams);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setFilterForm({
      type: '',
      value: '',
      status: '',
      created_at: '',
      completed_at: '',
    });
    setSearchParams(new URLSearchParams());
  };

  const handleRemoveFilter = (key: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete(key);
    setSearchParams(newParams);
    setFilterForm({ ...filterForm, [key]: '' });
  };

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

  // Get active filter labels
  const activeFilters = Object.entries(filters)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => `${key}: ${value}`);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Scans</h1>
          {selectedScans.size > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {selectedScans.size} scan{selectedScans.size > 1 ? 's' : ''} selected
            </p>
          )}
        </div>
        <div className="flex gap-3">
          {selectedScans.size > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleteMutation.isPending}
              className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {bulkDeleteMutation.isPending ? 'Deleting...' : `Delete Selected (${selectedScans.size})`}
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          <Link
            to="/scans/new"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            New Scan
          </Link>
        </div>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium text-muted-foreground">Active filters:</span>
          {Object.entries(filters).map(([key, value]) =>
            value !== undefined ? (
              <span
                key={key}
                className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
              >
                <span className="font-medium">{key}:</span>
                <span>{value.toString()}</span>
                <button
                  onClick={() => handleRemoveFilter(key)}
                  className="hover:text-primary/80 font-bold"
                  title={`Remove ${key} filter`}
                >
                  ×
                </button>
              </span>
            ) : null
          )}
          <button
            onClick={handleClearFilters}
            className="text-sm text-muted-foreground hover:text-foreground underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Filter Scans</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Scan Type
              </label>
              <select
                value={filterForm.type}
                onChange={(e) => setFilterForm({ ...filterForm, type: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">All Types</option>
                <option value="org_repos">Organization Repositories</option>
                <option value="org_users">Organization Users</option>
                <option value="search_code">Search Code</option>
                <option value="search_commits">Search Commits</option>
                <option value="search_issues">Search Issues</option>
                <option value="search_repos">Search Repositories</option>
                <option value="search_users">Search Users</option>
              </select>
            </div>

            {/* Value Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Query Value
              </label>
              <input
                type="text"
                value={filterForm.value}
                onChange={(e) => setFilterForm({ ...filterForm, value: e.target.value })}
                placeholder="e.g., my-org, search query"
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Status
              </label>
              <select
                value={filterForm.status}
                onChange={(e) => setFilterForm({ ...filterForm, status: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">All Statuses</option>
                <option value="queued">Queued</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            {/* Created Date Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Created Date
              </label>
              <input
                type="date"
                value={filterForm.created_at}
                onChange={(e) => setFilterForm({ ...filterForm, created_at: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Completed Date Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Completed Date
              </label>
              <input
                type="date"
                value={filterForm.completed_at}
                onChange={(e) => setFilterForm({ ...filterForm, completed_at: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleApplyFilters}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Apply Filters
            </button>
            <button
              onClick={handleClearFilters}
              className="px-6 py-2 border border-border rounded-lg font-medium hover:bg-accent transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <p className="text-muted-foreground">Loading scans...</p>
        </div>
      ) : error ? (
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <p className="text-destructive">Failed to load scans</p>
        </div>
      ) : scans.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <p className="text-muted-foreground">No scans yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Create your first scan to get started
          </p>
          <Link
            to="/scans/new"
            className="inline-block mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Create Scan
          </Link>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-12">
                    <input
                      type="checkbox"
                      checked={scans.length > 0 && selectedScans.size === scans.length}
                      onChange={handleToggleSelectAll}
                      className="w-4 h-4 rounded border-input text-primary focus:ring-2 focus:ring-ring cursor-pointer"
                      title="Select all"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Query
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Repositories
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Findings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {scans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedScans.has(scan.id)}
                        onChange={() => handleToggleSelection(scan.id)}
                        className="w-4 h-4 rounded border-input text-primary focus:ring-2 focus:ring-ring cursor-pointer"
                        title={`Select scan ${scan.id}`}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/scans/${scan.id}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {formatScanType(scan.type)}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-foreground">{scan.value}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                          scan.status
                        )}`}
                      >
                        {scan.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-foreground">
                        <div>Total: {scan.total_repositories}</div>
                        <div className="text-xs text-muted-foreground">
                          Scanned: {scan.scanned_repositories}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-foreground">
                        <div>Total: {scan.total_findings}</div>
                        <div className="text-xs text-muted-foreground">
                          Ignored: {scan.ignored_findings}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {new Date(scan.created_at).toLocaleDateString()}
                      <div className="text-xs">
                        {new Date(scan.created_at).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        to={`/findings?scan=${scan.id}`}
                        className="text-primary hover:text-primary/80 font-medium"
                      >
                        View Findings
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
