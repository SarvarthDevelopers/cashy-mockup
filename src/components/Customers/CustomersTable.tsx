import { useState, useRef, useCallback, useEffect } from 'react';
import { MoreHorizontal, AlertTriangle, X, Search, HelpCircle, Loader2 } from 'lucide-react';
import type { Customer } from '../../data/mockCustomers';
import type { ColumnDef } from './customersTableColumns';

interface CustomersTableProps {
  customers: Customer[];
  selectedRows: Set<string>; // Set of Customer IDs
  onSelectionChange: (selected: Set<string>) => void;
  onRowClick: (customer: Customer) => void;
  activeCustomerId: string | null;
  pageSize: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onRowAction?: (action: string, customer: Customer) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  columns: ColumnDef[];
  onColumnsChange: React.Dispatch<React.SetStateAction<ColumnDef[]>>;
}

function formatEur(value: number): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
}

const STATUS_BADGE_STYLES: Record<Customer['status'], { bg: string; text: string }> = {
  'ACTIVE': { bg: '#ecfdf5', text: '#047857' },
  'INACTIVE': { bg: '#f3f4f6', text: '#4b5563' },
  'BLACKLISTED': { bg: '#fee2e2', text: '#dc2626' }
};

function RowActionMenu({ customer, onAction }: { customer: Customer; onAction: (action: string, customer: Customer) => void }) {
  const [open, setOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuItemsRef = useRef<(HTMLButtonElement | null)[]>([]);

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
        setFocusIndex((prev) => (prev + 1) % 6);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusIndex((prev) => (prev - 1 + 6) % 6);
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
  }, [open]);

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
        className="p-1 hover:bg-[var(--background-secondary)] rounded-md transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-brand)] border-none bg-transparent"
        aria-label="Row context menu"
        aria-expanded={open}
      >
        <MoreHorizontal size={16} strokeWidth={1.5} className="text-[var(--text-subtlest)] hover:text-[var(--text-primary)]" />
      </button>
      {open && (
        <div className="absolute right-0 top-7 z-50 bg-[var(--background-primary)] border border-[var(--border-subtle)] rounded-lg py-1 w-44 animate-in fade-in zoom-in-95 duration-150" role="menu">
          {[
            { key: 'view', label: 'View Profile' },
            { key: 'create-deal', label: 'Create Deal' },
            { key: 'status-active', label: 'Mark Active' },
            { key: 'status-inactive', label: 'Mark Inactive' },
            { key: 'status-blacklist', label: 'Blacklist' },
            { key: 'delete', label: 'Delete Customer' },
          ].map((action, idx) => (
            <button
              key={action.key}
              ref={(el) => { menuItemsRef.current[idx] = el; }}
              role="menuitem"
              onClick={(e) => { e.stopPropagation(); onAction(action.key, customer); setOpen(false); triggerRef.current?.focus(); }}
              className="w-full text-left px-3 py-1.5 text-xs text-[var(--text-subtle)] hover:bg-[var(--background-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer font-semibold focus:outline-none focus:bg-[var(--background-secondary)] border-none bg-transparent focus-visible:ring-2 focus-visible:ring-[var(--border-brand)] focus-visible:ring-inset"
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function CustomersTable({
  customers,
  selectedRows,
  onSelectionChange,
  onRowClick,
  activeCustomerId,
  pageSize,
  currentPage,
  onPageChange,
  onPageSizeChange,
  onRowAction,
  searchQuery,
  onSearchChange,
  columns,
  onColumnsChange: setColumns,
}: CustomersTableProps) {
  const [resizingCol, setResizingCol] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState<{ x: number; width: number } | null>(null);

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [isSearching, setIsSearching] = useState(false);
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

  const totalPages = Math.ceil(customers.length / pageSize);
  const paginatedCustomers = customers.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const allPageSelected = paginatedCustomers.length > 0 && paginatedCustomers.every(c => selectedRows.has(c.customerId));
  const somePageSelected = paginatedCustomers.some(c => selectedRows.has(c.customerId));

  const handleSelectAll = () => {
    const newSet = new Set(selectedRows);
    if (allPageSelected) {
      paginatedCustomers.forEach(c => newSet.delete(c.customerId));
    } else {
      paginatedCustomers.forEach(c => newSet.add(c.customerId));
    }
    onSelectionChange(newSet);
  };

  const toggleRow = (customerId: string) => {
    const newSet = new Set(selectedRows);
    if (newSet.has(customerId)) newSet.delete(customerId);
    else newSet.add(customerId);
    onSelectionChange(newSet);
  };

  const visibleColumns = columns.filter(c => c.visible);

  const handleRowAction = (action: string, customer: Customer) => {
    if (onRowAction) {
      onRowAction(action, customer);
    }
  };

  const handleRowKeyDown = (e: React.KeyboardEvent, customer: Customer, idx: number) => {
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
      toggleRow(customer.customerId);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      onRowClick(customer);
    }
  };

  const renderCell = (customer: Customer, col: ColumnDef) => {
    switch (col.key) {
      case 'customerId':
        return <span className="font-semibold text-[var(--text-primary)] text-[13px]">{customer.customerId}</span>;
      case 'name':
        return <span className="text-[13px] text-[var(--text-primary)] font-medium truncate max-w-[150px]">{customer.firstName} {customer.lastName}</span>;
      case 'email':
        return <span className="text-[13px] text-[var(--text-subtle)] font-medium truncate max-w-[150px]">{customer.email}</span>;
      case 'phone':
        return <span className="text-[13px] text-[var(--text-subtle)] font-medium truncate max-w-[130px]">{customer.phone}</span>;
      case 'city':
        return <span className="text-[13px] text-[var(--text-primary)] font-medium">{customer.city}</span>;
      case 'country':
        return <span className="text-[13px] text-[var(--text-primary)] font-medium">{customer.country}</span>;
      case 'status': {
        const style = STATUS_BADGE_STYLES[customer.status] || { bg: '#f3f4f6', text: '#374151' };
        return (
          <span
            className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase"
            style={{ backgroundColor: style.bg, color: style.text }}
          >
            {customer.status}
          </span>
        );
      }
      case 'totalDeals':
        return <span className="text-[13px] text-[var(--text-primary)] font-semibold">{customer.totalDeals}</span>;
      case 'totalVolume':
        return <span className="text-[13px] tabular-nums text-[var(--text-success)] font-semibold">{formatEur(customer.totalVolume)}</span>;
      case 'createdAt':
        return (
          <span className="text-[12px] text-[var(--text-subtlest)]">
            {new Date(customer.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col flex-1 min-w-0 h-full" role="grid" aria-colcount={visibleColumns.length + 2}>
      <div className="flex-1 flex flex-col min-h-0 bg-[var(--background-primary)] border border-[var(--border-subtle)] rounded-xl overflow-hidden">
        
        {/* Desktop Search bar */}
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
              placeholder="Search customers by ID, name, email, phone, location..."
              className="w-full h-10 pl-10 pr-16 bg-[var(--background-primary)] border border-[var(--border-subtle)] rounded-lg text-sm focus:outline-none focus:border-[var(--border-brand)] focus:ring-2 focus:ring-[var(--border-brand)]/20 transition-all text-[var(--text-primary)] placeholder:text-[var(--text-subtlest)] font-medium"
              aria-label="Search index fields"
            />
            {localSearch && (
              <button
                onClick={() => { setLocalSearch(''); onSearchChange(''); }}
                className="absolute right-9 top-1/2 -translate-y-1/2 p-0.5 hover:bg-[var(--background-secondary)] rounded-md transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-brand)] border-none bg-transparent"
                aria-label="Clear search input"
              >
                <X size={14} strokeWidth={1.5} className="text-[var(--text-subtlest)] hover:text-[var(--text-primary)]" />
              </button>
            )}

            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 group z-25 flex items-center">
              <HelpCircle size={14} strokeWidth={1.5} className="text-[var(--text-subtlest)] cursor-help hover:text-[var(--text-subtle)]" />
              <div className="absolute bottom-full right-0 mb-2 w-64 hidden group-hover:block bg-[#131518] text-white text-[10px] font-semibold p-3 rounded-lg border border-[#4c5564] leading-relaxed animate-in fade-in duration-150">
                <span className="block text-[9px] text-[var(--text-brand)] uppercase tracking-wider mb-1 font-semibold">Search Fields</span>
                Searches across Customer ID, Name, Email, Phone, City, and Country.
              </div>
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
                    aria-label="Select all customers on this page"
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
                  const isNumeric = col.key === 'totalDeals' || col.key === 'totalVolume';
                  const sortTooltipText = "Sorting is disabled due to legacy backend API limitations.";

                  return (
                    <th
                      key={col.key}
                      className={`${isNumeric ? 'text-right' : 'text-left'} relative group py-3.5 sticky top-0 bg-[var(--background-secondary)] z-10`}
                      style={{ width: col.width + 'px', minWidth: col.minWidth + 'px' }}
                    >
                      <div
                        className={`flex items-center ${isNumeric ? 'justify-end' : 'justify-start'} gap-1.5 px-2 text-[10px] font-black text-[var(--text-subtlest)] uppercase tracking-wider select-none focus:outline-none`}
                        title={sortTooltipText}
                      >
                        <span className="truncate">{col.label}</span>
                      </div>

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
              {paginatedCustomers.map((customer, idx) => {
                const isSelected = selectedRows.has(customer.customerId);
                const isActive = activeCustomerId === customer.customerId;
                return (
                  <tr
                    key={customer.customerId}
                    data-row-index={idx}
                    tabIndex={0}
                    onKeyDown={(e) => handleRowKeyDown(e, customer, idx)}
                    className={`border-b border-[var(--border-subtle)] transition-colors cursor-pointer group/row outline-none focus:bg-[var(--background-secondary)] focus-visible:ring-2 focus-visible:ring-[var(--border-brand)] focus-visible:ring-inset ${
                      isActive 
                        ? 'bg-[var(--background-brand-primary)] border-l-2 border-l-[var(--border-brand)] font-medium' 
                        : isSelected 
                          ? 'bg-[var(--background-brand-primary)]/40 hover:bg-[var(--background-brand-primary)]/60' 
                          : 'odd:bg-[var(--background-primary)] even:bg-[var(--background-secondary)]/10 hover:bg-[var(--background-secondary)]'
                    }`}
                    onClick={() => onRowClick(customer)}
                    aria-selected={isActive}
                  >
                    {/* Checkbox */}
                    <td className="px-3 py-5 sticky left-0 z-10 transition-colors" style={{ backgroundColor: isActive ? 'var(--background-brand-primary)' : isSelected ? 'rgba(70, 73, 229, 0.05)' : 'var(--background-primary)' }}>
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-colors ${
                          isSelected 
                            ? 'bg-[var(--background-brand-solid)] border-[var(--border-brand)] text-white' 
                            : 'border-[var(--border-subtle)] bg-[var(--background-primary)] group-hover/row:border-[var(--border-brand-hover)]'
                        }`}
                        onClick={(e) => { e.stopPropagation(); toggleRow(customer.customerId); }}
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
                    {visibleColumns.map(col => {
                      const isNumeric = col.key === 'totalDeals' || col.key === 'totalVolume';
                      return (
                        <td 
                          key={col.key} 
                          className={`px-2 py-5 truncate max-w-[200px] text-[13px] ${isNumeric ? 'text-right' : 'text-left'}`}
                        >
                          {renderCell(customer, col)}
                        </td>
                      );
                    })}
                    {/* Row actions */}
                    <td className="px-1.5 py-5" onClick={(e) => e.stopPropagation()}>
                      <RowActionMenu customer={customer} onAction={handleRowAction} />
                    </td>
                  </tr>
                );
              })}
              {paginatedCustomers.length === 0 && (
                <tr>
                  <td colSpan={visibleColumns.length + 2} className="text-center py-16 bg-[var(--background-primary)]">
                    <div className="flex flex-col items-center gap-2.5 select-none animate-in fade-in duration-200">
                      <AlertTriangle size={24} strokeWidth={1.5} className="text-[var(--text-subtlest)]" />
                      <span className="text-sm font-bold text-[var(--text-subtle)]">No customers match the current filters.</span>
                      <span className="text-xs text-[var(--text-subtlest)] font-semibold">Try adjusting or clearing your filters in the sidebar.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-0 px-4 py-3 shrink-0 select-none border-t border-[var(--border-subtle)] bg-[var(--background-secondary)]/30">
        {/* Pagination controls group */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full md:w-auto order-1 md:order-2">
          {/* Page size selector */}
          <select
            value={pageSize}
            onChange={(e) => { onPageSizeChange(Number(e.target.value)); onPageChange(1); }}
            className="w-full sm:w-auto h-10 md:h-8 px-2.5 text-xs bg-[var(--background-primary)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-subtle)] focus:outline-none focus:border-[var(--border-brand)] cursor-pointer transition-all font-semibold text-center"
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
              className="flex-1 sm:flex-none min-w-[40px] min-h-[40px] md:min-w-0 md:min-h-0 md:px-2.5 md:py-1.5 text-xs font-semibold text-[var(--text-subtle)] hover:bg-[var(--background-secondary)] rounded-lg transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer border border-[var(--border-subtle)] bg-[var(--background-primary)] focus:outline-none flex items-center justify-center"
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
                className={`flex-1 sm:flex-none min-w-[40px] min-h-[40px] md:min-w-0 md:min-h-0 md:px-2.5 md:py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer border focus:outline-none flex items-center justify-center ${
                  page === currentPage
                    ? 'bg-[var(--background-brand-solid)] border-[var(--border-brand)] text-white font-bold'
                    : 'text-[var(--text-subtle)] border-[var(--border-subtle)] bg-[var(--background-primary)] hover:bg-[var(--background-secondary)]'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="flex-1 sm:flex-none min-w-[40px] min-h-[40px] md:min-w-0 md:min-h-0 md:px-2.5 md:py-1.5 text-xs font-semibold text-[var(--text-subtle)] hover:bg-[var(--background-secondary)] rounded-lg transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer border border-[var(--border-subtle)] bg-[var(--background-primary)] focus:outline-none flex items-center justify-center"
            >
              →
            </button>
          </div>
        </div>

        {/* Info Group (Showing text + selected count) */}
        <div className="flex items-center justify-center gap-2 order-2 md:order-1 w-full md:w-auto">
          <span className="text-[var(--body-size-small)] md:text-xs text-[var(--text-subtlest)] font-semibold">
            Showing {Math.min((currentPage - 1) * pageSize + 1, customers.length)}–{Math.min(currentPage * pageSize, customers.length)} of {customers.length}
          </span>
          {selectedRows.size > 0 && (
            <span className="text-[var(--body-size-small)] md:text-xs text-[var(--text-brand)] font-semibold bg-[var(--background-brand-primary)] px-2 py-0.5 rounded-full animate-in zoom-in-95 duration-100">
              {selectedRows.size} selected
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
