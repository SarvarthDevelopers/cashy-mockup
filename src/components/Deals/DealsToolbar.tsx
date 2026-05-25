import { useState, useEffect, useRef } from 'react';
import { Search, Download, Archive, X, HelpCircle, Loader2, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { Tooltip } from '../Tooltip/Tooltip';
import { DEALS_MICROCOPY } from '../../data/mockDeals';
import type { ColumnDef } from './DealsTable';

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
  // Desktop layout integration props
  columns?: ColumnDef[];
  onColumnsChange?: (cols: ColumnDef[]) => void;
  activePills?: Array<{ category: string; value: string; onClear: () => void }>;
  onClearFilters?: () => void;
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
  columns = [],
  onColumnsChange,
  activePills = [],
  onClearFilters,
}: DealsToolbarProps) {
  // Local debounced state
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const columnPickerRef = useRef<HTMLDivElement>(null);
  // Previous-prop tracking: sync localSearch when searchQuery changes externally
  const [prevSearchQuery, setPrevSearchQuery] = useState(searchQuery);
  if (searchQuery !== prevSearchQuery) {
    setPrevSearchQuery(searchQuery);
    if (localSearch !== searchQuery) setLocalSearch(searchQuery);
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (columnPickerRef.current && !columnPickerRef.current.contains(e.target as Node)) {
        setShowColumnPicker(false);
      }
    };
    if (showColumnPicker) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showColumnPicker]);

  useEffect(() => {
    if (localSearch === searchQuery) return;
    const delay = setTimeout(() => {
      onSearchChange(localSearch);
      setIsSearching(false);
    }, 300);
    return () => clearTimeout(delay);
  }, [localSearch, onSearchChange, searchQuery]);

  const handleSearchChange = (value: string) => {
    setLocalSearch(value);
    setIsSearching(value !== searchQuery);
  };

  return (
    <div className="flex flex-col gap-3 w-full" role="toolbar" aria-label="Deals toolbar controls">
      
      {/* Mobile view layout (hidden on md and up) */}
      <div className="flex flex-col gap-3 md:hidden w-full">
        {/* Row 1: Title & Actions (Filter + Export) */}
        <div className="flex items-center justify-between w-full">
          {/* Left: Title + Count Badge */}
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-[var(--text-primary)] leading-none tracking-tight">Deals</h1>
            <span className="text-[10px] font-black tabular-nums bg-[var(--background-secondary)] text-[var(--text-subtle)] border border-[var(--border-subtle)] px-2.5 py-0.5 rounded-full">
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
                <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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
              className="h-9 px-3 bg-[var(--background-primary)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-extrabold rounded-lg text-xs hover:bg-[var(--background-secondary)] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              {exportStatus === 'processing' ? (
                <Loader2 size={12} strokeWidth={1.5} className="animate-spin text-[var(--text-brand)]" />
              ) : (
                <Download size={12} strokeWidth={1.5} className="text-[var(--text-subtle)]" />
              )}
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Row 2: Search Input OR Bulk action bar */}
        <div className="w-full">
          {selectedCount > 0 ? (
            /* Bulk action bar (Full width on mobile) */
            <div className="flex items-center justify-between w-full px-3 py-1 bg-[var(--background-brand-primary)] border border-[var(--border-brand-subtle)] rounded-lg animate-in fade-in zoom-in-95 duration-200 h-9">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-[var(--text-brand)]">
                  {selectedCount} selected
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {bulkActionStatus === 'processing' ? (
                  <div className="flex items-center gap-1.5">
                    <Loader2 size={12} strokeWidth={1.5} className="animate-spin text-[var(--text-brand)]" />
                    <span className="text-[10px] font-bold text-[var(--text-brand)]">Archiving...</span>
                  </div>
                ) : bulkActionStatus === 'error' ? (
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-bold text-[var(--text-error)] truncate max-w-[100px]" title={bulkErrorMessage}>
                      {bulkErrorMessage || 'Error'}
                    </span>
                    {onRetryBulk && (
                      <button onClick={onRetryBulk} className="p-0.5 hover:bg-red-100 rounded text-[var(--text-error)]">
                        <RefreshCw size={10} strokeWidth={1.5} />
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={onBulkArchive}
                    className="flex items-center gap-1 px-2 py-1 text-[10px] font-black text-white bg-[var(--background-error-solid)] hover:bg-[var(--background-error-solid-hover)] rounded transition-colors focus:outline-none"
                  >
                    <Archive size={10} strokeWidth={1.5} />
                    <span>Archive Selected</span>
                  </button>
                )}

                <div className="w-[1px] h-3.5 bg-[var(--border-brand)]/25" />
                <button
                  onClick={onClearSelection}
                  className="p-1 hover:bg-[var(--background-secondary)] rounded transition-colors text-[var(--text-subtlest)] hover:text-[var(--text-brand)]"
                >
                  <X size={12} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          ) : (
            /* Search Input Box (Full width on mobile) */
            <div className="relative w-full">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-subtlest)] z-10">
                {isSearching ? (
                  <Loader2 size={14} strokeWidth={1.5} className="animate-spin text-[var(--text-brand)]" />
                ) : (
                  <Search size={14} strokeWidth={1.5} />
                )}
              </span>
              <input
                type="text"
                value={localSearch}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search..."
                className="w-full h-9 pl-9 pr-16 bg-[var(--background-primary)] border border-[var(--border-subtle)] rounded-lg text-xs focus:outline-none focus:border-[var(--border-brand)] focus:ring-2 focus:ring-[var(--border-brand)]/20 transition-all text-[var(--text-primary)] placeholder:text-[var(--text-subtlest)] font-semibold"
                aria-label="Search index fields"
              />
              {localSearch && (
                <button
                  onClick={() => { setLocalSearch(''); onSearchChange(''); }}
                  className="absolute right-8 top-1/2 -translate-y-1/2 p-0.5 hover:bg-[var(--background-secondary)] rounded transition-colors cursor-pointer"
                  aria-label="Clear search input"
                >
                  <X size={12} strokeWidth={1.5} className="text-[var(--text-subtlest)] hover:text-[var(--text-primary)]" />
                </button>
              )}
              {/* Tooltip Help icon on mobile */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 z-25 flex items-center">
                <Tooltip content="Search across IDs, customer details, status, and timeline notes." side="top">
                  <span><HelpCircle size={12} strokeWidth={1.5} className="text-[var(--text-subtlest)] cursor-help hover:text-[var(--text-subtle)]" /></span>
                </Tooltip>
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
            <span className="text-xs font-black tabular-nums bg-[var(--background-secondary)] text-[var(--text-subtle)] border border-[var(--border-subtle)] px-2.5 py-0.5 rounded-full">
              {totalResults}
            </span>
          </div>

          {/* Selected Filters (Active Pills) & Columns visibility */}
          <div className="flex-1 flex items-center justify-between min-w-0 mr-4 select-none">
            <div className="flex-1 min-w-0 mr-4">
              {activePills.length > 0 ? (
                <div className="flex flex-wrap items-center gap-1.5">
                  {activePills.map((pill, idx) => (
                    <span 
                      key={idx} 
                      className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-0.5 rounded-full bg-[var(--background-secondary)] border border-[var(--border-subtle)] text-[10px] font-bold text-[var(--text-subtle)] animate-in fade-in duration-200"
                    >
                      <span className="text-[9px] text-[var(--text-subtlest)] font-extrabold uppercase shrink-0">{pill.category}:</span>
                      <span className="truncate max-w-[100px]">{pill.value}</span>
                      <button 
                        onClick={pill.onClear}
                        className="hover:bg-[var(--background-secondary-hover)] rounded-full p-0.5 transition-colors cursor-pointer text-[var(--text-subtlest)] hover:text-[var(--text-primary)] focus:outline-none flex items-center justify-center shrink-0"
                        aria-label={`Remove ${pill.category} filter ${pill.value}`}
                      >
                        <X size={10} strokeWidth={1.5} />
                      </button>
                    </span>
                  ))}
                  {onClearFilters && (
                    <button
                      onClick={onClearFilters}
                      className="text-[11px] text-[var(--text-error)] font-black hover:text-[var(--text-error-on-subtle)] cursor-pointer focus:outline-none shrink-0 ml-1.5 transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              ) : (
                <span className="text-xs text-[var(--text-subtlest)] font-semibold italic pl-1">No active filters</span>
              )}
            </div>
            
            {/* Columns Toggle Button */}
            {columns.length > 0 && onColumnsChange && (
              <div className="relative" ref={columnPickerRef}>
                <button
                  onClick={() => setShowColumnPicker(!showColumnPicker)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-extrabold text-[var(--text-subtle)] hover:text-[var(--text-primary)] hover:bg-[var(--background-secondary)] rounded-md transition-colors cursor-pointer border border-[var(--border-subtle)] bg-[var(--background-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-brand)]"
                  aria-label="Manage column visibility"
                  aria-expanded={showColumnPicker}
                >
                  {showColumnPicker ? <EyeOff size={14} strokeWidth={1.5} /> : <Eye size={14} strokeWidth={1.5} />}
                  <span>Columns</span>
                </button>
                {showColumnPicker && (
                  <div className="absolute right-0 top-8.5 z-50 bg-[var(--background-primary)] border border-[var(--border-subtle)] rounded-lg p-2.5 w-52 max-h-72 overflow-y-auto slick-scrollbar animate-in fade-in zoom-in-95 duration-150">
                    <p className="text-[10px] font-black text-[var(--text-subtlest)] uppercase tracking-wider px-1.5 pb-1.5 border-b border-[var(--border-subtle)] mb-1">Show/Hide Columns</p>
                    {columns.map(col => (
                      <label key={col.key} className="flex items-center gap-2.5 px-1.5 py-1.5 rounded-md hover:bg-[var(--background-secondary)] cursor-pointer transition-colors text-left focus-within:ring-2 focus-within:ring-[var(--border-brand)]/50">
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
                            col.visible 
                              ? 'bg-[var(--background-brand-solid)] border-[var(--border-brand)] text-white' 
                              : 'border-[var(--border-subtle)] bg-[var(--background-primary)]'
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            onColumnsChange(columns.map(c => c.key === col.key ? { ...c, visible: !c.visible } : c));
                          }}
                        >
                          {col.visible && (
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        <span className="text-xs text-[var(--text-subtle)] font-bold">{col.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Inline Bulk action bar — visible when rows selected */}
          {selectedCount > 0 && (
            <div className="flex items-center gap-2.5 px-3 py-1 bg-[var(--background-brand-primary)] border border-[var(--border-brand-subtle)] rounded-lg animate-in fade-in zoom-in-95 duration-200 shrink-0 h-10">
              <span className="text-xs font-black text-[var(--text-brand)] shrink-0">
                {selectedCount} selected
              </span>
              <div className="w-[1px] h-4 bg-[var(--border-brand)]/20 shrink-0" />
              
              {bulkActionStatus === 'processing' ? (
                <div className="flex items-center gap-2 shrink-0">
                  <Loader2 size={13} strokeWidth={1.5} className="animate-spin text-[var(--text-brand)]" />
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
                      <RefreshCw size={11} strokeWidth={1.5} />
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={onBulkArchive}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-black text-white bg-[var(--background-error-solid)] hover:bg-[var(--background-error-solid-hover)] rounded-md transition-colors cursor-pointer focus:outline-none"
                >
                  <Archive size={12} strokeWidth={1.5} />
                  <span>Archive Selected Deals</span>
                </button>
              )}

              <div className="w-[1px] h-4 bg-[var(--border-brand)]/25 shrink-0" />
              <button
                onClick={onClearSelection}
                className="p-1 hover:bg-[var(--background-secondary)] rounded-md transition-colors cursor-pointer text-[var(--text-subtlest)] hover:text-[var(--text-brand)]"
                title="Clear selection"
              >
                <X size={12} strokeWidth={1.5} />
              </button>
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5 shrink-0 flex-nowrap">
            {/* Help Tooltip */}
            <Tooltip
              content={
                selectedCount > 0
                  ? `Downloads your selected ${selectedCount} deal${selectedCount > 1 ? 's' : ''} in highly structured CSV spreadsheet format.`
                  : 'Downloads your actively filtered list containing all 28+ deal details in highly structured CSV spreadsheet format.'
              }
              side="top"
            >
              <button
                onClick={onExportAll}
                disabled={exportStatus === 'processing'}
                className="h-10 px-4 bg-[var(--background-primary)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-extrabold rounded-lg text-sm hover:bg-[var(--background-secondary)] hover:border-[var(--border-brand-hover)] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                {exportStatus === 'processing' ? (
                  <Loader2 size={14} strokeWidth={1.5} className="animate-spin text-[var(--text-brand)]" />
                ) : (
                  <Download size={14} strokeWidth={1.5} className="text-[var(--text-subtle)]" />
                )}
                <span>Export</span>
              </button>
            </Tooltip>
        </div>
      </div>

      {/* Export status toast notification overlay */}
      {exportStatus !== 'idle' && (
        <div className={`flex items-center justify-between gap-3 px-4 py-3 border rounded-xl animate-in slide-in-from-top-2 duration-200 ${
          exportStatus === 'processing' 
            ? 'bg-[var(--background-brand-primary)] border-[var(--border-brand-subtle)] text-[var(--text-brand)]'
            : exportStatus === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center gap-2.5">
            {exportStatus === 'processing' ? (
              <Loader2 size={16} strokeWidth={1.5} className="animate-spin shrink-0" />
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
        <div className="flex items-center gap-2.5 px-4 py-2.5 bg-[var(--background-secondary)] border border-[var(--border-subtle)] rounded-lg text-xs font-bold text-[var(--text-subtle)] animate-in slide-in-from-top-1 duration-150 shrink-0">
          <span className="w-5 h-5 rounded-full bg-[var(--background-brand-solid)]/10 border border-[var(--border-brand-subtle)] text-[var(--text-brand)] font-extrabold flex items-center justify-center text-[10px]">ℹ</span>
          <span>{DEALS_MICROCOPY.search.unsortedWarning}</span>
        </div>
      )}

    </div>
  );
}
