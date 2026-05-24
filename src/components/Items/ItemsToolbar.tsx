import { useState, useEffect, useRef } from 'react';
import { Search, Download, Archive, X, HelpCircle, Loader2, RefreshCw, Eye, EyeOff } from 'lucide-react';
import type { ColumnDef } from './ItemsTable';

interface ItemsToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalResults: number;
  selectedCount: number;
  onBulkArchive: () => void;
  onExportAll: () => void;
  onClearSelection: () => void;
  bulkActionStatus?: 'idle' | 'processing' | 'success' | 'error';
  bulkErrorMessage?: string;
  onRetryBulk?: () => void;
  exportStatus?: 'idle' | 'processing' | 'success' | 'error';
  exportProgress?: number;
  onToggleFilter?: () => void;
  activeFiltersCount?: number;
  columns?: ColumnDef[];
  onColumnsChange?: (cols: ColumnDef[]) => void;
  activePills?: Array<{ category: string; value: string; onClear: () => void }>;
  onClearFilters?: () => void;
}

export function ItemsToolbar({
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
}: ItemsToolbarProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const columnPickerRef = useRef<HTMLDivElement>(null);
  // Previous-prop tracking: sync localSearch when searchQuery changes externally (e.g., cleared)
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
    <div className="flex flex-col gap-3 w-full" role="toolbar" aria-label="Items toolbar controls">
      
      {/* Mobile view layout (hidden on md and up) */}
      <div className="flex flex-col gap-3 md:hidden w-full">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-[var(--text-primary)] leading-none tracking-tight">Items</h1>
            <span className="text-[10px] font-black tabular-nums bg-[var(--background-secondary)] text-[var(--text-subtle)] border border-[var(--border-subtle)] px-2.5 py-0.5 rounded-full shadow-sm">
              {totalResults}
            </span>
          </div>

          <div className="flex items-center gap-2">
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

        <div className="w-full">
          {selectedCount > 0 ? (
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
                    <span className="text-[10px] font-bold text-[var(--text-brand)]">Processing...</span>
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
                onChange={(e) => handleSearchChange(e.target.value)}
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
              <div className="absolute right-3 top-1/2 -translate-y-1/2 group z-25 flex items-center">
                <HelpCircle size={12} className="text-[var(--text-subtlest)] cursor-help hover:text-[var(--text-subtle)]" />
                <div className="absolute bottom-full right-0 mb-2 w-52 hidden group-hover:block bg-[#131518] text-white text-[9px] font-bold p-2.5 rounded-lg shadow-xl border border-[#4c5564] leading-relaxed">
                  Search across item IDs, titles, variants, and categories.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Desktop view layout (hidden on mobile screens) */}
      <div className="hidden md:flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-1 items-center gap-4 min-w-0 flex-nowrap">
          <div className="flex items-center gap-2 shrink-0">
            <h1 className="text-2xl font-black text-[var(--text-primary)] leading-none tracking-tight">Items</h1>
            <span className="text-xs font-black tabular-nums bg-[var(--background-secondary)] text-[var(--text-subtle)] border border-[var(--border-subtle)] px-2.5 py-0.5 rounded-full shadow-sm">
              {totalResults}
            </span>
          </div>

          <div className="flex-1 flex items-center justify-between min-w-0 mr-4 select-none">
            <div className="flex-1 min-w-0 mr-4">
              {activePills.length > 0 ? (
                <div className="flex flex-wrap items-center gap-1.5">
                  {activePills.map((pill, idx) => (
                    <span 
                      key={idx} 
                      className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-0.5 rounded-full bg-[var(--background-secondary)] border border-[var(--border-subtle)] text-[10px] font-bold text-[var(--text-subtle)] shadow-sm animate-in fade-in duration-200"
                    >
                      <span className="text-[9px] text-[var(--text-subtlest)] font-extrabold uppercase shrink-0">{pill.category}:</span>
                      <span className="truncate max-w-[100px]">{pill.value}</span>
                      <button 
                        onClick={pill.onClear}
                        className="hover:bg-[var(--background-secondary-hover)] rounded-full p-0.5 transition-colors cursor-pointer text-[var(--text-subtlest)] hover:text-[var(--text-primary)] focus:outline-none flex items-center justify-center shrink-0"
                        aria-label={`Remove ${pill.category} filter ${pill.value}`}
                      >
                        <X size={10} strokeWidth={2.5} />
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
            
            {columns.length > 0 && onColumnsChange && (
              <div className="relative" ref={columnPickerRef}>
                <button
                  onClick={() => setShowColumnPicker(!showColumnPicker)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-extrabold text-[var(--text-subtle)] hover:text-[var(--text-primary)] hover:bg-[var(--background-secondary)] rounded-md transition-colors cursor-pointer border border-[var(--border-subtle)] shadow-sm bg-[var(--background-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-brand)]"
                  aria-label="Manage column visibility"
                  aria-expanded={showColumnPicker}
                >
                  {showColumnPicker ? <EyeOff size={14} /> : <Eye size={14} />}
                  <span>Columns</span>
                </button>
                {showColumnPicker && (
                  <div className="absolute right-0 top-8.5 z-50 bg-[var(--background-primary)] border border-[var(--border-subtle)] rounded-lg shadow-xl p-2.5 w-52 max-h-72 overflow-y-auto slick-scrollbar animate-in fade-in zoom-in-95 duration-150">
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
                              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {selectedCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--background-brand-primary)] border border-[var(--border-brand-subtle)] rounded-lg animate-in fade-in slide-in-from-right-3 duration-200 shadow-sm h-10">
              <span className="text-xs font-black text-[var(--text-brand)]">
                {selectedCount} selected
              </span>
              
              <div className="w-[1px] h-3 bg-[var(--border-brand)]/20" />
              
              {bulkActionStatus === 'processing' ? (
                <div className="flex items-center gap-1.5">
                  <Loader2 size={12} className="animate-spin text-[var(--text-brand)]" />
                  <span className="text-[10px] font-bold text-[var(--text-brand)]">Processing...</span>
                </div>
              ) : bulkActionStatus === 'error' ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-[var(--text-error)] max-w-[120px] truncate" title={bulkErrorMessage}>
                    {bulkErrorMessage}
                  </span>
                  {onRetryBulk && (
                    <button onClick={onRetryBulk} className="p-0.5 hover:bg-red-50 rounded text-[var(--text-error)]">
                      <RefreshCw size={10} />
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={onBulkArchive}
                  className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-black text-white bg-[var(--background-error-solid)] hover:bg-[var(--background-error-solid-hover)] rounded transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                >
                  <Archive size={10} />
                  <span>Archive</span>
                </button>
              )}

              <div className="w-[1px] h-3 bg-[var(--border-brand)]/20" />
              
              <button
                onClick={onClearSelection}
                className="p-1 hover:bg-[var(--background-secondary)] rounded transition-colors text-[var(--text-subtlest)] hover:text-[var(--text-brand)] focus:outline-none"
                aria-label="Clear selected rows"
              >
                <X size={12} />
              </button>
            </div>
          )}

          <button
            onClick={onExportAll}
            disabled={exportStatus === 'processing'}
            className="h-10 px-4 bg-[var(--background-primary)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-extrabold rounded-lg text-xs hover:bg-[var(--background-secondary)] hover:text-[var(--text-primary)] transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-brand)]"
          >
            {exportStatus === 'processing' ? (
              <div className="flex items-center gap-2">
                <Loader2 size={14} className="animate-spin text-[var(--text-brand)]" />
                <span className="tabular-nums font-black text-[var(--text-brand)]">{exportProgress}%</span>
              </div>
            ) : (
              <>
                <Download size={14} className="text-[var(--text-subtle)]" />
                <span>Export to CSV</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
