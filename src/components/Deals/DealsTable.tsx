import { useState, useRef, useCallback, useEffect } from 'react';
import { MoreHorizontal, ArrowUpDown, ArrowUp, ArrowDown, AlertTriangle, X, Search, HelpCircle, Loader2 } from 'lucide-react';
import type { Deal } from '../../data/mockDeals';
import { STATUS_STYLES, DEALS_MICROCOPY } from '../../data/mockDeals';
import { ShopLabel } from '../Card/ShopLabel';
import { Tooltip } from '../Tooltip/Tooltip';

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface ColumnDef {
  key: string;
  label: string;
  width: number;
  minWidth: number;
  visible: boolean;
  sortable: boolean;
}

interface DealsTableProps {
  deals: Deal[];
  sortConfigs: SortConfig[];
  onSortChange: (configs: SortConfig[]) => void;
  selectedRows: Set<string>;
  onSelectionChange: (selected: Set<string>) => void;
  onRowClick: (deal: Deal) => void;
  activeDealId: string | null;
  pageSize: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onRowAction?: (action: string, deal: Deal) => void;
  searchActive?: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  columns: ColumnDef[];
  onColumnsChange: React.Dispatch<React.SetStateAction<ColumnDef[]>>;
}

export { DEFAULT_COLUMNS } from './dealsTableColumns';

function formatEur(value: number): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
}

function relativeDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: 'short' });
}

function RowActionMenu({ deal, onAction }: { deal: Deal; onAction: (action: string, deal: Deal) => void }) {
  const [open, setOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuItemsRef = useRef<(HTMLButtonElement | null)[]>([]);

  // "Extend" is only valid when the pawn deal is LIVE — item received, loan active.
  // "Live" statuses per workflow doc: payout has been made and item is stored.
  const EXTEND_ELIGIBLE_STATUSES = ['PAYED_AND_STORED', 'LOAN_DUE_NOTIFIED', 'LOAN_DUE', 'EXTENSION_CONFIRMED'];
  const isExtendEligible = deal.mode !== 'custom_deal' && EXTEND_ELIGIBLE_STATUSES.includes(deal.status);
  const PAYBACK_ELIGIBLE_STATUSES = ['PAYED_AND_STORED', 'LOAN_DUE_NOTIFIED', 'LOAN_DUE', 'EXTENSION_CONFIRMED', 'ON_SELL'];
  const isPaybackEligible = deal.mode !== 'custom_deal' && PAYBACK_ELIGIBLE_STATUSES.includes(deal.status);
  const menuItems = [
    { key: 'open', label: 'Open Deal Wizard' },
    ...(isExtendEligible ? [{ key: 'extend', label: 'Extend Deal' }] : []),
    ...(isPaybackEligible ? [{ key: 'payback', label: 'Payback Deal' }] : []),
    { key: 'archive', label: 'Mark Archived' },
    { key: 'export', label: 'Export Row' },
  ];

  useEffect(() => {
    const clickHandler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusIndex((prev) => (prev + 1) % menuItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusIndex((prev) => (prev - 1 + menuItems.length) % menuItems.length);
      }
    };
    let frameId: number;
    if (open) {
      document.addEventListener('mousedown', clickHandler);
      document.addEventListener('keydown', keyHandler);
      frameId = requestAnimationFrame(() => {
        setFocusIndex(0); // Focus the first item when opened
      });
    }
    return () => {
      if (frameId) cancelAnimationFrame(frameId);
      document.removeEventListener('mousedown', clickHandler);
      document.removeEventListener('keydown', keyHandler);
    };
  }, [open, menuItems.length]);

  useEffect(() => {
    if (open && focusIndex >= 0 && menuItemsRef.current[focusIndex]) {
      menuItemsRef.current[focusIndex]?.focus();
    }
  }, [open, focusIndex]);

  return (
    <div ref={ref} className="relative flex justify-center">
      <button
        ref={triggerRef}
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="p-1 hover:bg-[var(--background-secondary)] rounded-md transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-brand)]"
        aria-label="Row context menu"
        aria-expanded={open}
      >
        <MoreHorizontal size={16} strokeWidth={1.5} className="text-[var(--text-subtlest)] hover:text-[var(--text-primary)]" />
      </button>
      {open && (
        <div className="absolute right-0 top-7 z-50 bg-[var(--background-primary)] border border-[var(--border-subtle)] rounded-lg py-1 w-44 animate-in fade-in zoom-in-95 duration-150" role="menu">
          {menuItems.map((action, idx) => (
            <button
              key={action.key}
              ref={(el) => { menuItemsRef.current[idx] = el; }}
              role="menuitem"
              onClick={(e) => { e.stopPropagation(); onAction(action.key, deal); setOpen(false); triggerRef.current?.focus(); }}
              className="w-full text-left px-3 py-1.5 text-xs text-[var(--text-subtle)] hover:bg-[var(--background-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer font-extrabold focus:outline-none focus:bg-[var(--background-secondary)] focus-visible:ring-2 focus-visible:ring-[var(--border-brand)] focus-visible:ring-inset"
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function DealsTable({
  deals,
  sortConfigs,
  onSortChange,
  selectedRows,
  onSelectionChange,
  onRowClick,
  activeDealId,
  pageSize,
  currentPage,
  onPageChange,
  onPageSizeChange,
  onRowAction,
  searchActive = false,
  searchQuery,
  onSearchChange,
  columns,
  onColumnsChange: setColumns,
}: DealsTableProps) {
  const [resizingCol, setResizingCol] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState<{ x: number; width: number } | null>(null);

  // Local debounced search state for desktop search
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [isSearching, setIsSearching] = useState(false);
  // Previous-prop tracking: sync localSearch when searchQuery changes externally
  const [prevSearchQuery, setPrevSearchQuery] = useState(searchQuery);
  if (searchQuery !== prevSearchQuery) {
    setPrevSearchQuery(searchQuery);
    if (localSearch !== searchQuery) setLocalSearch(searchQuery);
  }

  useEffect(() => {
    if (localSearch === searchQuery) return;
    const delay = setTimeout(() => {
      onSearchChange(localSearch);
      setIsSearching(false);
    }, 300);
    return () => clearTimeout(delay);
  }, [localSearch, onSearchChange, searchQuery]);

  const handleLocalSearchChange = (value: string) => {
    setLocalSearch(value);
    setIsSearching(value !== searchQuery);
  };

  const handleResizeStart = useCallback((e: React.MouseEvent, colKey: string) => {
    e.preventDefault();
    e.stopPropagation();
    const col = columns.find(c => c.key === colKey);
    if (col) {
      setResizingCol(colKey);
      setResizeStart({ x: e.clientX, width: col.width });
    }
  }, [columns]);

  useEffect(() => {
    if (!resizingCol || !resizeStart) return;

    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - resizeStart.x;
      const col = columns.find(c => c.key === resizingCol);
      if (col) {
        const newWidth = Math.max(col.minWidth, resizeStart.width + diff);
        setColumns(cols => cols.map(c => c.key === resizingCol ? { ...c, width: newWidth } : c));
      }
    };

    const handleMouseUp = () => {
      setResizingCol(null);
      setResizeStart(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizingCol, resizeStart, columns, setColumns]);

  // Handle Sort with Server Index constraints & Client Fallbacks
  const handleSortClick = (key: string, e: React.MouseEvent) => {
    const existing = sortConfigs.find(s => s.key === key);
    if (e.shiftKey) {
      if (existing) {
        if (existing.direction === 'asc') {
          onSortChange(sortConfigs.map(s => s.key === key ? { ...s, direction: 'desc' } : s));
        } else {
          onSortChange(sortConfigs.filter(s => s.key !== key));
        }
      } else {
        onSortChange([...sortConfigs, { key, direction: 'asc' }]);
      }
    } else {
      if (existing && existing.direction === 'asc') {
        onSortChange([{ key, direction: 'desc' }]);
      } else if (existing && existing.direction === 'desc') {
        onSortChange([]);
      } else {
        onSortChange([{ key, direction: 'asc' }]);
      }
    }
  };

  const totalPages = Math.ceil(deals.length / pageSize);
  const paginatedDeals = deals.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const allPageSelected = paginatedDeals.length > 0 && paginatedDeals.every(d => selectedRows.has(d.dealId));
  const somePageSelected = paginatedDeals.some(d => selectedRows.has(d.dealId));

  const handleSelectAll = () => {
    const newSet = new Set(selectedRows);
    if (allPageSelected) {
      paginatedDeals.forEach(d => newSet.delete(d.dealId));
    } else {
      paginatedDeals.forEach(d => newSet.add(d.dealId));
    }
    onSelectionChange(newSet);
  };

  const toggleRow = (dealId: string) => {
    const newSet = new Set(selectedRows);
    if (newSet.has(dealId)) newSet.delete(dealId);
    else newSet.add(dealId);
    onSelectionChange(newSet);
  };

  const visibleColumns = columns.filter(c => c.visible);

  const handleRowAction = (action: string, deal: Deal) => {
    if (onRowAction) {
      onRowAction(action, deal);
    }
  };

  // Keyboard navigation hooks inside table rows
  const handleRowKeyDown = (e: React.KeyboardEvent, deal: Deal, idx: number) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextRow = document.querySelector(`[data-row-index="${idx + 1}"]`) as HTMLElement;
      if (nextRow) nextRow.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevRow = document.querySelector(`[data-row-index="${idx - 1}"]`) as HTMLElement;
      if (prevRow) prevRow.focus();
    } else if (e.key === ' ') {
      e.preventDefault();
      toggleRow(deal.dealId);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      onRowClick(deal);
    }
  };

  const renderCell = (deal: Deal, col: ColumnDef) => {
    switch (col.key) {
      case 'dealId':
        return <span className="font-semibold text-[var(--text-primary)] text-[13px]">{deal.dealId}</span>;
      case 'mode':
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
            deal.mode === 'custom_deal'
              ? 'bg-[var(--background-brand-primary)] text-[var(--text-brand)] border border-[var(--border-brand-subtle)]'
              : 'bg-[var(--background-brand-solid)]/10 text-[var(--text-brand)] border border-[var(--border-brand-subtle)]'
          }`}>
            {deal.mode === 'custom_deal' ? 'Purchase' : 'Pawn'}
          </span>
        );
      case 'status': {
        const style = STATUS_STYLES[deal.status];
        return (
          <span
            className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wider uppercase"
            style={{ backgroundColor: style.bg, color: style.text }}
          >
            {deal.status.replace('_', ' ')}
          </span>
        );
      }
      case 'company':
        return <span className="text-[13px] text-[var(--text-subtle)] font-normal">{deal.company.replace('CASHY_', '')}</span>;
      case 'branch':
        return (
          <div className="flex items-center">
            <ShopLabel country={deal.branch} branch={deal.shop} />
          </div>
        );
      case 'businessArea':
        return <span className="text-[13px] text-[var(--text-subtle)] font-normal">{deal.businessArea}</span>;
      case 'customer':
        return <span className="text-[13px] text-[var(--text-primary)] font-semibold">{deal.primaryCustomer.firstName} {deal.primaryCustomer.lastName}</span>;
      case 'primaryItem':
        return (
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] text-[var(--text-primary)] font-medium truncate max-w-[150px]">{deal.items[0]?.title || '—'}</span>
            {deal.items.length > 1 && (
              <span className="text-[10px] text-[var(--text-subtlest)] font-normal">+{deal.items.length - 1} more items</span>
            )}
          </div>
        );
      case 'payout': {
        const isVerified = [
          'VERIFIED',
          'PAYED_AND_STORED',
          'LOAN_DUE_NOTIFIED',
          'LOAN_DUE',
          'EXTENSION_CONFIRMED',
          'PAYBACK_CONFIRMED',
          'PAYED_SHIPMENT_PENDING',
          'CLOSED',
          'ON_SELL',
          'SOLD_INTERN',
          'SOLD_EXTERN',
          'PICKED_UP'
        ].includes(deal.status);
        return (
          <span className={`text-[13px] tabular-nums ${isVerified ? 'text-[var(--text-success)]' : 'text-[var(--text-primary)]'} font-semibold`}>
            {formatEur(deal.suggestedPayout)}
          </span>
        );
      }
      case 'durationDays':
        return <span className="text-[13px] text-[var(--text-subtlest)] font-normal">{deal.durationDays} days</span>;
      case 'dueDate':
        return <span className="text-[13px] text-[var(--text-subtle)] font-normal">{deal.dueDate}</span>;
      case 'createdAt':
        return <span className="text-[13px] text-[var(--text-subtlest)] font-normal">{relativeDate(deal.createdAt)}</span>;
      case 'pickupType':
        return <span className="text-[13px] text-[var(--text-subtle)] font-normal">{deal.pickupType.replace('_', ' ')}</span>;
      case 'column':
        return <span className="text-[13px] text-[var(--text-subtle)] font-semibold">{deal.column}</span>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col flex-1 min-w-0 h-full" role="grid" aria-colcount={visibleColumns.length + 2}>
      {/* Table & Pagination Wrapper */}
      <div className="flex-1 flex flex-col min-h-0 bg-[var(--background-primary)] border border-[var(--border-subtle)] rounded-xl overflow-hidden">
        
        {/* Desktop Search bar (only visible on md and up) */}
        <div className="hidden md:flex items-center justify-between px-4 py-3 shrink-0 select-none border-b border-[var(--border-subtle)] bg-[var(--background-secondary)]">
          <div className="relative flex-1 max-w-[420px]">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-subtlest)] z-10">
              {isSearching ? (
                <Loader2 size={16} strokeWidth={1.5} className="animate-spin text-[var(--text-brand)]" />
              ) : (
                <Search size={16} strokeWidth={1.5} />
              )}
            </span>
            <input
              type="text"
              value={localSearch}
              onChange={(e) => handleLocalSearchChange(e.target.value)}
              placeholder={DEALS_MICROCOPY.search.placeholder}
              className="w-full h-10 pl-10 pr-16 bg-[var(--background-primary)] border border-[var(--border-subtle)] rounded-lg text-sm focus:outline-none focus:border-[var(--border-brand)] focus:ring-2 focus:ring-[var(--border-brand)]/20 transition-all text-[var(--text-primary)] placeholder:text-[var(--text-subtlest)] font-medium"
              aria-label="Search index fields"
            />
            {localSearch && (
              <button
                onClick={() => { setLocalSearch(''); onSearchChange(''); }}
                className="absolute right-9 top-1/2 -translate-y-1/2 p-0.5 hover:bg-[var(--background-secondary)] rounded-md transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-brand)]"
                aria-label="Clear search input"
              >
                <X size={14} strokeWidth={1.5} className="text-[var(--text-subtlest)] hover:text-[var(--text-primary)]" />
              </button>
            )}

            {/* Premium Hover Help Tooltip */}
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 z-25 flex items-center">
              <Tooltip
                content={
                  <span className="block max-w-[240px]">
                    <span className="block text-[9px] text-[var(--text-brand)] uppercase tracking-wider mb-1 font-black">Search Fields</span>
                    Searches across Deal ID, Customer name, email, phone, branch, shop, appraisers, item variant specifications, and internal timeline notes.
                  </span>
                }
                side="top"
              >
                <span><HelpCircle size={14} strokeWidth={1.5} className="text-[var(--text-subtlest)] cursor-help hover:text-[var(--text-subtle)]" /></span>
              </Tooltip>
            </div>
          </div>
        </div>
        {/* Scrollable Table Area */}
        <div className="flex-1 overflow-auto slick-scrollbar bg-[var(--background-primary)]">
          <table 
            className="w-full border-collapse bg-[var(--background-primary)]" 
            style={{ 
              minWidth: (visibleColumns.reduce((sum, c) => sum + c.width, 0) + 95) + 'px'
            }}
          >
            <thead className="sticky top-0 z-30 shadow-[0_1px_0_0_var(--border-subtle)]">
              <tr className="bg-[var(--background-secondary)] border-b border-[var(--border-subtle)]">
                {/* Select all checkbox */}
                <th className="w-10 px-3 py-3.5 text-left sticky top-0 left-0 bg-[var(--background-secondary)] z-20">
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-colors ${
                    allPageSelected 
                      ? 'bg-[var(--background-brand-solid)] border-[var(--border-brand)] text-white' 
                      : somePageSelected 
                        ? 'bg-[var(--background-brand-primary)] border-[var(--border-brand)] text-[var(--text-brand)]' 
                        : 'border-[var(--border-subtle)] bg-[var(--background-primary)] hover:border-[var(--border-brand-hover)]'
                  }`}
                  onClick={handleSelectAll}
                  role="checkbox"
                  aria-checked={allPageSelected}
                  aria-label="Select all deals on this page"
                >
                  {allPageSelected && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  {somePageSelected && !allPageSelected && (
                    <div className="w-2.5 h-0.5 bg-[var(--text-brand)] rounded" />
                  )}
                </div>
              </th>
              {visibleColumns.map(col => {
                const sortIdx = sortConfigs.findIndex(s => s.key === col.key);
                const sortConfig = sortIdx >= 0 ? sortConfigs[sortIdx] : null;
                const isColServerSorted = !searchActive && (col.key === 'dealId' || col.key === 'createdAt');
                const sortTooltipText = searchActive
                  ? 'Sorted locally (Server search active)'
                  : isColServerSorted
                    ? 'Sorted on Server (Optimized index)'
                    : 'Sorted locally (Server sort unsupported)';
                const isNumeric = col.key === 'payout' || col.key === 'durationDays';

                return (
                  <th
                    key={col.key}
                    className={`${isNumeric ? 'text-right' : 'text-left'} relative group py-3.5 sticky top-0 bg-[var(--background-secondary)] z-10`}
                    style={{ width: col.width + 'px', minWidth: col.minWidth + 'px' }}
                  >
                    <Tooltip content={sortTooltipText} side="top">
                      <div
                        className={`flex items-center ${isNumeric ? 'justify-end' : 'justify-start'} gap-1.5 px-2 text-[10px] font-black text-[var(--text-subtlest)] uppercase tracking-wider cursor-pointer hover:text-[var(--text-primary)] select-none focus-visible:text-[var(--text-primary)] focus:outline-none`}
                        onClick={(e) => handleSortClick(col.key, e)}
                        role="columnheader"
                        aria-sort={sortConfig ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                      >
                        <span className="truncate">{col.label}</span>
                        {!sortConfig && (
                          <ArrowUpDown size={12} strokeWidth={1.5} className="opacity-0 group-hover:opacity-60 transition-opacity shrink-0 text-[var(--text-subtlest)]" />
                        )}
                        {sortConfig && (
                          <span className="flex items-center gap-1 shrink-0 animate-in fade-in duration-150">
                            {sortConfig.direction === 'asc' ? <ArrowUp size={12} strokeWidth={1.5} className="text-[var(--text-brand)]" /> : <ArrowDown size={12} strokeWidth={1.5} className="text-[var(--text-brand)]" />}
                            {sortConfigs.length > 1 && (
                              <span className="text-[8px] text-[var(--text-brand)] font-extrabold bg-[var(--background-brand-primary)] px-1 rounded-sm">{sortIdx + 1}</span>
                            )}
                            {/* Capability Indicator Dot */}
                            <span 
                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${isColServerSorted ? 'bg-emerald-500' : 'bg-blue-500'}`}
                              style={{
                                boxShadow: '0 0 6px rgba(0,0,0,0.1)'
                              }}
                            />
                          </span>
                        )}
                      </div>
                    </Tooltip>

                    {/* Resize handle */}
                    <div
                      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-[var(--border-brand-hover)]/30 transition-colors"
                      onMouseDown={(e) => handleResizeStart(e, col.key)}
                      aria-hidden="true"
                    />
                  </th>
                );
              })}
              {/* Actions column */}
              <th className="w-11 px-1.5 sticky top-0 bg-[var(--background-secondary)] z-10" />
            </tr>
          </thead>
          <tbody>
            {paginatedDeals.map((deal, idx) => {
              const isSelected = selectedRows.has(deal.dealId);
              const isActive = activeDealId === deal.dealId;
              return (
                <tr
                  key={deal.dealId}
                  data-row-index={idx}
                  tabIndex={0}
                  onKeyDown={(e) => handleRowKeyDown(e, deal, idx)}
                  className={`border-b border-[var(--border-subtle)] cursor-pointer group/row outline-none focus:bg-[var(--background-secondary)] focus-visible:ring-2 focus-visible:ring-[var(--border-brand)] focus-visible:ring-inset ${
                    isActive 
                      ? 'bg-[var(--background-brand-primary)] font-medium' 
                      : isSelected 
                        ? 'bg-[var(--background-brand-primary)]/40 hover:bg-[var(--background-brand-primary)]/60' 
                        : 'odd:bg-[var(--background-primary)] even:bg-[var(--background-secondary)]/10 hover:bg-[var(--background-secondary)]'
                  }`}
                  onClick={() => onRowClick(deal)}
                  aria-selected={isActive}
                >
                  {/* Checkbox */}
                  <td 
                    className="px-3 py-5 sticky left-0 z-10"
                    style={{ 
                      backgroundColor: isActive ? 'var(--background-brand-primary)' : isSelected ? 'rgba(70, 73, 229, 0.05)' : 'var(--background-primary)',
                      transition: 'background-color 150ms ease',
                      boxShadow: isActive ? 'inset 4px 0 0 var(--border-brand)' : 'none'
                    }}
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-colors ${
                        isSelected 
                          ? 'bg-[var(--background-brand-solid)] border-[var(--border-brand)] text-white' 
                          : 'border-[var(--border-subtle)] bg-[var(--background-primary)] group-hover/row:border-[var(--border-brand-hover)]'
                      }`}
                      onClick={(e) => { e.stopPropagation(); toggleRow(deal.dealId); }}
                      role="checkbox"
                      aria-checked={isSelected}
                    >
                      {isSelected && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  </td>
                  {/* Data cells */}
                  {visibleColumns.map(col => (
                    <td 
                      key={col.key} 
                      className={`px-2 py-5 truncate max-w-[200px] text-[13px] ${
                        col.key === 'payout' || col.key === 'durationDays' ? 'text-right' : 'text-left'
                      }`}
                    >
                      {renderCell(deal, col)}
                    </td>
                  ))}
                  {/* Row actions */}
                  <td className="px-1.5 py-5" onClick={(e) => e.stopPropagation()}>
                    <RowActionMenu deal={deal} onAction={handleRowAction} />
                  </td>
                </tr>
              );
            })}
            {paginatedDeals.length === 0 && (
              <tr>
                <td colSpan={visibleColumns.length + 2} className="text-center py-16 bg-[var(--background-primary)]">
                  <div className="flex flex-col items-center gap-2.5 select-none animate-in fade-in duration-200">
                    <AlertTriangle size={24} strokeWidth={1.5} className="text-[var(--text-subtlest)]" />
                    <span className="text-sm font-bold text-[var(--text-subtle)]">No deals match the current filters.</span>
                    <span className="text-xs text-[var(--text-subtlest)] font-semibold">Try adjusting or clearing your filters in the sidebar.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-0 px-4 py-3 shrink-0 select-none border-t border-[var(--border-subtle)] bg-[var(--background-secondary)]/30">
        {/* Pagination controls group */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full md:w-auto order-1 md:order-2">
          {/* Page size selector */}
          <select
            value={pageSize}
            onChange={(e) => { onPageSizeChange(Number(e.target.value)); onPageChange(1); }}
            className="w-full sm:w-auto h-10 md:h-8 px-2.5 text-xs bg-[var(--background-primary)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-subtle)] focus:outline-none focus:border-[var(--border-brand)] cursor-pointer transition-all font-bold text-center"
          >
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
            <option value={100}>100 / page</option>
          </select>

          {/* Page navigation */}
          <div className="flex items-center justify-center gap-1 w-full sm:w-auto">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="flex-1 sm:flex-none min-w-[40px] min-h-[40px] md:min-w-0 md:min-h-0 md:px-2.5 md:py-1.5 text-xs font-bold text-[var(--text-subtle)] hover:bg-[var(--background-secondary)] rounded-lg transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer border border-[var(--border-subtle)] bg-[var(--background-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-brand)] flex items-center justify-center"
            >
              ←
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
              Math.max(0, currentPage - 3),
              Math.min(totalPages, currentPage + 2)
            ).map(page => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`flex-1 sm:flex-none min-w-[40px] min-h-[40px] md:min-w-0 md:min-h-0 md:px-2.5 md:py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer border focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-brand)] flex items-center justify-center ${
                  page === currentPage
                    ? 'bg-[var(--background-brand-solid)] border-[var(--border-brand)] text-white font-extrabold'
                    : 'text-[var(--text-subtle)] border-[var(--border-subtle)] bg-[var(--background-primary)] hover:bg-[var(--background-secondary)]'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="flex-1 sm:flex-none min-w-[40px] min-h-[40px] md:min-w-0 md:min-h-0 md:px-2.5 md:py-1.5 text-xs font-bold text-[var(--text-subtle)] hover:bg-[var(--background-secondary)] rounded-lg transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer border border-[var(--border-subtle)] bg-[var(--background-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-brand)] flex items-center justify-center"
            >
              →
            </button>
          </div>
        </div>

        {/* Info Group (Showing text + selected count) */}
        <div className="flex items-center justify-center gap-2 order-2 md:order-1 w-full md:w-auto">
          <span className="text-[var(--body-size-small)] md:text-xs text-[var(--text-subtlest)] font-bold">
            Showing {Math.min((currentPage - 1) * pageSize + 1, deals.length)}–{Math.min(currentPage * pageSize, deals.length)} of {deals.length}
          </span>
          {selectedRows.size > 0 && (
            <span className="text-[var(--body-size-small)] md:text-xs text-[var(--text-brand)] font-extrabold bg-[var(--background-brand-primary)] px-2 py-0.5 rounded-full animate-in zoom-in-95 duration-100">
              {selectedRows.size} selected
            </span>
          )}
        </div>
      </div>
    </div>
  </div>
);
}
