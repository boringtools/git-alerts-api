import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { findingsApi } from '@/services/api';

export const Findings: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedFinding, setSelectedFinding] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFindings, setSelectedFindings] = useState<Set<number>>(new Set());

  // Filter form state
  const [filterForm, setFilterForm] = useState({
    type: searchParams.get('type') || '',
    value: searchParams.get('value') || '',
    email: searchParams.get('email') || '',
    repository: searchParams.get('repository') || '',
    scan: searchParams.get('scan') || '',
    validated: searchParams.get('validated') || '',
    created_at: searchParams.get('created_at') || '',
  });

  // Extract all filter parameters from URL
  const filters = {
    type: searchParams.get('type') || undefined,
    value: searchParams.get('value') || undefined,
    email: searchParams.get('email') || undefined,
    repository: searchParams.get('repository') || undefined,
    scan: searchParams.get('scan') ? Number(searchParams.get('scan')) : undefined,
    validated: searchParams.get('validated') ? searchParams.get('validated') === 'true' : undefined,
    created_at: searchParams.get('created_at') || undefined,
  };

  const { data: findings = [], isLoading, error } = useQuery({
    queryKey: ['findings', filters],
    queryFn: () => findingsApi.list(filters),
  });

  const deleteFindingMutation = useMutation({
    mutationFn: findingsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['findings'] });
      setSelectedFinding(null);
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      await Promise.all(ids.map(id => findingsApi.delete(id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['findings'] });
      setSelectedFindings(new Set());
    },
  });

  const updateFindingMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<any> }) => findingsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['findings'] });
    },
  });

  const handleDeleteFinding = (id: number, type: string) => {
    if (window.confirm(`Are you sure you want to delete this ${type} finding? This action cannot be undone.`)) {
      deleteFindingMutation.mutate(id);
    }
  };

  const handleToggleValidated = (finding: any) => {
    updateFindingMutation.mutate(
      { id: finding.id, data: { validated: !finding.validated } },
      {
        onSuccess: () => {
          // Update the selected finding in local state
          setSelectedFinding({ ...finding, validated: !finding.validated });
        },
      }
    );
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
      email: '',
      repository: '',
      scan: '',
      validated: '',
      created_at: '',
    });
    setSearchParams(new URLSearchParams());
  };

  const handleRemoveFilter = (key: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete(key);
    setSearchParams(newParams);
    setFilterForm({ ...filterForm, [key]: '' });
  };

  const handleToggleSelection = (id: number) => {
    const newSelected = new Set(selectedFindings);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedFindings(newSelected);
  };

  const handleToggleSelectAll = () => {
    if (selectedFindings.size === findings.length) {
      setSelectedFindings(new Set());
    } else {
      setSelectedFindings(new Set(findings.map(f => f.id)));
    }
  };

  const handleBulkDelete = () => {
    const count = selectedFindings.size;
    if (window.confirm(`Are you sure you want to delete ${count} finding${count > 1 ? 's' : ''}? This action cannot be undone.`)) {
      bulkDeleteMutation.mutate(Array.from(selectedFindings));
    }
  };

  const getValidatedBadge = (validated: boolean) => {
    return validated
      ? 'bg-green-500/10 text-green-600'
      : 'bg-yellow-500/10 text-yellow-600';
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
          <h1 className="text-3xl font-bold text-foreground">Findings</h1>
          {selectedFindings.size > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {selectedFindings.size} finding{selectedFindings.size > 1 ? 's' : ''} selected
            </p>
          )}
        </div>
        <div className="flex gap-3">
          {selectedFindings.size > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleteMutation.isPending}
              className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {bulkDeleteMutation.isPending ? 'Deleting...' : `Delete Selected (${selectedFindings.size})`}
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
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
          <h2 className="text-lg font-semibold text-foreground mb-4">Filter Findings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Type
              </label>
              <input
                type="text"
                value={filterForm.type}
                onChange={(e) => setFilterForm({ ...filterForm, type: e.target.value })}
                placeholder="e.g., slack, aws, github"
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Email Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email
              </label>
              <input
                type="text"
                value={filterForm.email}
                onChange={(e) => setFilterForm({ ...filterForm, email: e.target.value })}
                placeholder="e.g., user@example.com"
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Repository Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Repository
              </label>
              <input
                type="text"
                value={filterForm.repository}
                onChange={(e) => setFilterForm({ ...filterForm, repository: e.target.value })}
                placeholder="e.g., owner/repo"
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Value Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Value
              </label>
              <input
                type="text"
                value={filterForm.value}
                onChange={(e) => setFilterForm({ ...filterForm, value: e.target.value })}
                placeholder="Search in secret value"
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Scan ID Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Scan ID
              </label>
              <input
                type="number"
                value={filterForm.scan}
                onChange={(e) => setFilterForm({ ...filterForm, scan: e.target.value })}
                placeholder="e.g., 123"
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Validated Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Status
              </label>
              <select
                value={filterForm.validated}
                onChange={(e) => setFilterForm({ ...filterForm, validated: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">All</option>
                <option value="true">Validated</option>
                <option value="false">Unvalidated</option>
              </select>
            </div>

            {/* Created At Filter */}
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
          <p className="text-muted-foreground">Loading findings...</p>
        </div>
      ) : error ? (
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <p className="text-destructive">Failed to load findings</p>
        </div>
      ) : findings.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <p className="text-muted-foreground">No findings yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Run a scan to discover security findings
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-12">
                      <input
                        type="checkbox"
                        checked={findings.length > 0 && selectedFindings.size === findings.length}
                        onChange={handleToggleSelectAll}
                        className="w-4 h-4 rounded border-input text-primary focus:ring-2 focus:ring-ring cursor-pointer"
                        title="Select all"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Repository
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Found
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {findings.map((finding) => (
                    <tr key={finding.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedFindings.has(finding.id)}
                          onChange={() => handleToggleSelection(finding.id)}
                          className="w-4 h-4 rounded border-input text-primary focus:ring-2 focus:ring-ring cursor-pointer"
                          title={`Select finding ${finding.id}`}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-foreground">
                          {finding.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <div className="text-sm text-foreground truncate">
                          <a
                            href={finding.repository.startsWith('http') ? finding.repository : `https://github.com/${finding.repository}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {finding.repository}
                          </a>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-foreground">
                          {finding.email || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getValidatedBadge(
                            finding.validated
                          )}`}
                        >
                          {finding.validated ? 'VALIDATED' : 'UNVALIDATED'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {new Date(finding.created_at).toLocaleDateString()}
                        <div className="text-xs">
                          {new Date(finding.created_at).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => setSelectedFinding(finding)}
                          className="text-primary hover:text-primary/80 font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Details Modal */}
          {selectedFinding && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-card border border-border rounded-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto">
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <h2 className="text-2xl font-bold text-foreground">
                      Finding Details
                    </h2>
                    <button
                      onClick={() => setSelectedFinding(null)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Type</h3>
                        <p className="text-foreground">{selectedFinding.type}</p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getValidatedBadge(
                            selectedFinding.validated
                          )}`}
                        >
                          {selectedFinding.validated ? 'VALIDATED' : 'UNVALIDATED'}
                        </span>
                      </div>
                    </div>

                    {selectedFinding.description && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                        <p className="text-foreground">{selectedFinding.description}</p>
                      </div>
                    )}

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Repository</h3>
                      <a
                        href={selectedFinding.repository.startsWith('http') ? selectedFinding.repository : `https://github.com/${selectedFinding.repository}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {selectedFinding.repository}
                      </a>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">File</h3>
                      <p className="text-foreground font-mono text-sm break-all">
                        {selectedFinding.file}
                        {selectedFinding.line && ` : Line ${selectedFinding.line}`}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                        <p className="text-foreground">{selectedFinding.email || 'N/A'}</p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Commit</h3>
                        {selectedFinding.commit_url ? (
                          <a
                            href={selectedFinding.commit_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline text-sm font-mono"
                          >
                            {selectedFinding.commit_hash.substring(0, 7)}
                          </a>
                        ) : (
                          <p className="text-foreground text-sm font-mono">
                            {selectedFinding.commit_hash}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">
                        Secret Value
                      </h3>
                      <div className="bg-muted p-3 rounded">
                        <code className="text-xs text-destructive break-all">
                          {selectedFinding.value}
                        </code>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        ⚠️ This is sensitive information. Handle with care.
                      </p>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      <div>Created: {new Date(selectedFinding.created_at).toLocaleString()}</div>
                      <div>Updated: {new Date(selectedFinding.updated_at).toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4">
                    <button
                      onClick={() => handleDeleteFinding(selectedFinding.id, selectedFinding.type)}
                      disabled={deleteFindingMutation.isPending}
                      className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
                    >
                      {deleteFindingMutation.isPending ? 'Deleting...' : 'Delete Finding'}
                    </button>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleToggleValidated(selectedFinding)}
                        disabled={updateFindingMutation.isPending}
                        className={`px-4 py-2 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 ${
                          selectedFinding.validated
                            ? 'bg-yellow-500/10 text-yellow-600 border border-yellow-600'
                            : 'bg-green-500/10 text-green-600 border border-green-600'
                        }`}
                      >
                        {updateFindingMutation.isPending
                          ? 'Updating...'
                          : selectedFinding.validated
                          ? 'Mark as Unvalidated'
                          : 'Mark as Validated'}
                      </button>
                      <button
                        onClick={() => setSelectedFinding(null)}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
