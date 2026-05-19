import { useState, useEffect } from 'react';
import { Search, Download, Archive, X, HelpCircle, Loader2, RefreshCw } from 'lucide-react';
import { DEALS_MICROCOPY } from '../../data/mockDeals';

interface DealsToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalResults: number;
  selectedCount: number;
  onBulkArchive: () => void;
  onExportAll: () => void;
  onClearSelection: () => void;
  // Dynamic action status props
  bulkActionStatus?: 'idle' | 'processing' | 'success' | 'error';
  bulkErrorMessage?: string;
  onRetryBulk?: () => void;
  exportStatus?: 'idle' | 'processing' | 'success' | 'error';
  exportProgress?: number;
  // Mobile filter toggle props
  onToggleFilter?: () => void;
  activeFiltersCount?: number;
}

export function DealsToolbar({
  searchQuery,
  onSearchChange,
  totalResults,
  selectedCount,
  onBulkArchive,
  onExportAll,
  onClearSelection,
  bulkActionStatus = 'idle',
  bulkErrorMessage = '',
  onRetryBulk,
  exportStatus = 'idle',
  exportProgress = 0,
  onToggleFilter,
  activeFiltersCount = 0,
}: DealsToolbarProps) {
  // Local debounced state
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    if (localSearch === searchQuery) return;
    setIsSearching(true);
    const delay = setTimeout(() => {
      onSearchChange(localSearch);
      setIsSearching(false);
    }, 300);
    return () => clearTimeout(delay);
  }, [localSearch, onSearchChange, searchQuery]);

  return (
    <div className="flex flex-col gap-3 w-full" role="toolbar" aria-label="Deals toolbar controls">
      
      {/* Mobile view layout (hidden on md and up) */}
      <div className="flex flex-col gap-3 md:hidden w-full">
        {/* Row 1: Title & Actions (Filter + Export) */}
        <div className="flex items-center justify-between w-full">
          {/* Left: Title + Count Badge */}
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-[var(--text-primary)] leading-none tracking-tight">Deals</h1>
            <span className="text-[10px] font-black tabular-nums bg-[var(--background-secondary)] text-[var(--text-subtle)] border border-[var(--border-subtle)] px-2.5 py-0.5 rounded-full shadow-sm">
              {totalResults}
            </span>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Filter Toggle Button */}
            <button
              onClick={onToggleFilter}
              className={`h-9 px-3 text-xs font-extrabold rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer focus:outline-none ${
                activeFiltersCount > 0
                  ? 'bg-[var(--background-brand-subtle)] border-[var(--border-brand)] text-[var(--text-brand)] font-black'
                  : 'bg-[var(--background-primary)] border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--background-secondary)]'
              }`}
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className={activeFiltersCount > 0 ? 'text-[var(--text-brand)]' : 'text-[var(--text-subtle)]'}>
                <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="text-[10px] font-black bg-[var(--background-brand-solid)] text-white px-1.5 py-0.5 rounded-full leading-none">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Export Button */}
            <button
              onClick={onExportAll}
              disabled={exportStatus === 'processing'}
              className="h-9 px-3 bg-[var(--background-primary)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-extrabold rounded-lg text-xs hover:bg-[var(--background-secondary)] transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              {exportStatus === 'processing' ? (
                <Loader2 size={12} className="animate-spin text-[var(--text-brand)]" />
              ) : (
                <Download size={12} className="text-[var(--text-subtle)]" />
              )}
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Row 2: Search Input OR Bulk action bar */}
        <div className="w-full">
          {selectedCount > 0 ? (
            /* Bulk action bar (Full width on mobile) */
            <div className="flex items-center justify-between w-full px-3 py-1 bg-[var(--background-brand-primary)] border border-[var(--border-brand-subtle)] rounded-lg animate-in fade-in zoom-in-95 duration-200 shadow-sm h-9">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-[var(--text-brand)]">
                  {selectedCount} selected
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {bulkActionStatus === 'processing' ? (
                  <div className="flex items-center gap-1.5">
                    <Loader2 size={12} className="animate-spin text-[var(--text-brand)]" />
                    <span className="text-[10px] font-bold text-[var(--text-brand)]">Archiving...</span>
                  </div>
                ) : bulkActionStatus === 'error' ? (
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-bold text-[var(--text-error)] truncate max-w-[100px]" title={bulkErrorMessage}>
                      {bulkErrorMessage || 'Error'}
                    </span>
                    {onRetryBulk && (
                      <button onClick={onRetryBulk} className="p-0.5 hover:bg-red-100 rounded text-[var(--text-error)]">
                        <RefreshCw size={10} />
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={onBulkArchive}
                    className="flex items-center gap-1 px-2 py-1 text-[10px] font-black text-white bg-[var(--background-error-solid)] hover:bg-[var(--background-error-solid-hover)] rounded transition-colors shadow-sm focus:outline-none"
                  >
                    <Archive size={10} />
                    <span>Archive Selected</span>
                  </button>
                )}

                <div className="w-[1px] h-3.5 bg-[var(--border-brand)]/25" />
                <button
                  onClick={onClearSelection}
                  className="p-1 hover:bg-[var(--background-secondary)] rounded transition-colors text-[var(--text-subtlest)] hover:text-[var(--text-brand)]"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          ) : (
            /* Search Input Box (Full width on mobile) */
            <div className="relative w-full">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-subtlest)] z-10">
                {isSearching ? (
                  <Loader2 size={14} className="animate-spin text-[var(--text-brand)]" />
                ) : (
                  <Search size={14} />
                )}
              </span>
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search..."
                className="w-full h-9 pl-9 pr-16 bg-[var(--background-primary)] border border-[var(--border-subtle)] rounded-lg text-xs focus:outline-none focus:border-[var(--border-brand)] focus:ring-2 focus:ring-[var(--border-brand)]/20 transition-all text-[var(--text-primary)] placeholder:text-[var(--text-subtlest)] font-semibold shadow-sm"
                aria-label="Search index fields"
              />
              {localSearch && (
                <button
                  onClick={() => { setLocalSearch(''); onSearchChange(''); }}
                  className="absolute right-8 top-1/2 -translate-y-1/2 p-0.5 hover:bg-[var(--background-secondary)] rounded transition-colors cursor-pointer"
                  aria-label="Clear search input"
                >
                  <X size={12} className="text-[var(--text-subtlest)] hover:text-[var(--text-primary)]" />
                </button>
              )}
              {/* Tooltip Help icon on mobile */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 group z-25 flex items-center">
                <HelpCircle size={12} className="text-[var(--text-subtlest)] cursor-help hover:text-[var(--text-subtle)]" />
                <div className="absolute bottom-full right-0 mb-2 w-52 hidden group-hover:block bg-[#131518] text-white text-[9px] font-bold p-2.5 rounded-lg shadow-xl border border-[#4c5564] leading-relaxed">
                  Search across IDs, customer details, status, and timeline notes.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Desktop view layout (hidden on mobile screens) */}
      <div className="hidden md:flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left: Title + Search + Inline Actions */}
        <div className="flex flex-1 items-center gap-4 min-w-0 flex-nowrap">
          <div className="flex items-center gap-2 shrink-0">
            <h1 className="text-2xl font-black text-[var(--text-primary)] leading-none tracking-tight">Deals</h1>
            <span className="text-xs font-black tabular-nums bg-[var(--background-secondary)] text-[var(--text-subtle)] border border-[var(--border-subtle)] px-2.5 py-0.5 rounded-full shadow-sm">
              {totalResults}
            </span>
          </div>

          {/* Search Input Box */}
          <div className="relative flex-1 max-w-[420px] min-w-[200px]">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-subtlest)] z-10">
              {isSearching ? (
                <Loader2 size={16} className="animate-spin text-[var(--text-brand)]" />
              ) : (
                <Search size={16} />
              )}
            </span>
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder={DEALS_MICROCOPY.search.placeholder}
              className="w-full h-10 pl-10 pr-16 bg-[var(--background-primary)] border border-[var(--border-subtle)] rounded-lg text-sm focus:outline-none focus:border-[var(--border-brand)] focus:ring-2 focus:ring-[var(--border-brand)]/20 transition-all text-[var(--text-primary)] placeholder:text-[var(--text-subtlest)] font-medium shadow-sm"
              aria-label="Search index fields"
            />
            {localSearch && (
              <button
                onClick={() => { setLocalSearch(''); onSearchChange(''); }}
                className="absolute right-9 top-1/2 -translate-y-1/2 p-0.5 hover:bg-[var(--background-secondary)] rounded-md transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-brand)]"
                aria-label="Clear search input"
              >
                <X size={14} className="text-[var(--text-subtlest)] hover:text-[var(--text-primary)]" />
              </button>
            )}

            {/* Premium Hover Help Tooltip */}
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 group z-25 flex items-center">
              <HelpCircle size={14} className="text-[var(--text-subtlest)] cursor-help hover:text-[var(--text-subtle)]" />
              <div className="absolute bottom-full right-0 mb-2 w-64 hidden group-hover:block bg-[#131518] text-white text-[10px] font-bold p-3 rounded-lg shadow-xl border border-[#4c5564] leading-relaxed animate-in fade-in duration-150">
                <span className="block text-[9px] text-[var(--text-brand)] uppercase tracking-wider mb-1 font-black">Search Fields</span>
                Searches across Deal ID, Customer name, email, phone, branch, shop, appraisers, item variant specifications, and internal timeline notes.
              </div>
            </div>
          </div>

          {/* Inline Bulk action bar — visible when rows selected */}
          {selectedCount > 0 && (
            <div className="flex items-center gap-2.5 px-3 py-1 bg-[var(--background-brand-primary)] border border-[var(--border-brand-subtle)] rounded-lg animate-in fade-in zoom-in-95 duration-200 shadow-sm shrink-0 h-10">
              <span className="text-xs font-black text-[var(--text-brand)] shrink-0">
                {selectedCount} selected
              </span>
              <div className="w-[1px] h-4 bg-[var(--border-brand)]/20 shrink-0" />
              
              {bulkActionStatus === 'processing' ? (
                <div className="flex items-center gap-2 shrink-0">
                  <Loader2 size={13} className="animate-spin text-[var(--text-brand)]" />
                  <span className="text-[11px] font-bold text-[var(--text-brand)]">Archiving...</span>
                </div>
              ) : bulkActionStatus === 'error' ? (
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-bold text-[var(--text-error)] truncate max-w-[120px]" title={bulkErrorMessage}>
                    {bulkErrorMessage || 'Error'}
                  </span>
                  {onRetryBulk && (
                    <button
                      onClick={onRetryBulk}
                      className="p-1 hover:bg-red-100 rounded text-[var(--text-error)] cursor-pointer"
                    >
                      <RefreshCw size={11} />
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={onBulkArchive}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-black text-white bg-[var(--background-error-solid)] hover:bg-[var(--background-error-solid-hover)] rounded-md transition-colors shadow-sm cursor-pointer focus:outline-none"
                >
                  <Archive size={12} />
                  <span>Archive Selected Deals</span>
                </button>
              )}

              <div className="w-[1px] h-4 bg-[var(--border-brand)]/25 shrink-0" />
              <button
                onClick={onClearSelection}
                className="p-1 hover:bg-[var(--background-secondary)] rounded-md transition-colors cursor-pointer text-[var(--text-subtlest)] hover:text-[var(--text-brand)]"
                title="Clear selection"
              >
                <X size={12} />
              </button>
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5 shrink-0 flex-nowrap">
          {/* Export Action */}
          <div className="relative group inline-block">
            <button
              onClick={onExportAll}
              disabled={exportStatus === 'processing'}
              className="h-10 px-4 bg-[var(--background-primary)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-extrabold rounded-lg text-sm hover:bg-[var(--background-secondary)] hover:border-[var(--border-brand-hover)] transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              {exportStatus === 'processing' ? (
                <Loader2 size={14} className="animate-spin text-[var(--text-brand)]" />
              ) : (
                <Download size={14} className="text-[var(--text-subtle)]" />
              )}
              <span>Export</span>
            </button>
            {/* Help Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 hidden group-hover:block bg-[#131518] text-white text-[10px] font-bold p-3 rounded-lg shadow-xl border border-[#4c5564] leading-relaxed z-50 animate-in fade-in duration-150">
              <span className="block text-[9px] text-[var(--text-brand)] uppercase tracking-wider mb-1 font-black">Export Output</span>
              Downloads your actively filtered list containing all 28+ deal details in highly structured CSV spreadsheet format.
            </div>
          </div>
        </div>
      </div>

      {/* Export status toast notification overlay */}
      {exportStatus !== 'idle' && (
        <div className={`flex items-center justify-between gap-3 px-4 py-3 border rounded-xl shadow-md animate-in slide-in-from-top-2 duration-200 ${
          exportStatus === 'processing' 
            ? 'bg-[var(--background-brand-primary)] border-[var(--border-brand-subtle)] text-[var(--text-brand)]'
            : exportStatus === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center gap-2.5">
            {exportStatus === 'processing' ? (
              <Loader2 size={16} className="animate-spin shrink-0" />
            ) : (
              <span className="text-lg font-black leading-none">✓</span>
            )}
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-black">{DEALS_MICROCOPY.export.started}</span>
              <span className="text-[11px] font-medium opacity-90">{DEALS_MICROCOPY.export.estimatedTime}</span>
            </div>
          </div>
          {exportStatus === 'processing' && (
            <div className="w-24 bg-[var(--border-subtle)] rounded-full h-1.5 overflow-hidden shrink-0">
              <div className="bg-[var(--background-brand-solid)] h-full transition-all duration-300" style={{ width: `${exportProgress}%` }} />
            </div>
          )}
        </div>
      )}

      {/* Unsorted search warning banner banner */}
      {localSearch && (
        <div className="flex items-center gap-2.5 px-4 py-2.5 bg-[var(--background-secondary)] border border-[var(--border-subtle)] rounded-lg text-xs font-bold text-[var(--text-subtle)] animate-in slide-in-from-top-1 duration-150 shadow-sm shrink-0">
          <span className="w-5 h-5 rounded-full bg-[var(--background-brand-solid)]/10 border border-[var(--border-brand-subtle)] text-[var(--text-brand)] font-extrabold flex items-center justify-center text-[10px]">ℹ</span>
          <span>{DEALS_MICROCOPY.search.unsortedWarning}</span>
        </div>
      )}

    </div>
  );
}
