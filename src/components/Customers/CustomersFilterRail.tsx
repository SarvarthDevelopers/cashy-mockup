import { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import { INITIAL_FILTERS } from './customersFilterConstants';
import type { FilterState } from './customersFilterConstants';
import type { Customer } from '../../data/mockCustomers';
import { DateRangePicker } from '../DatePicker/DateRangePicker';

interface CustomersFilterRailProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  customers: Customer[];
  collapsed: boolean;
  onToggleCollapse: () => void;
}

// Collapsible Section Wrapper
function FilterSection({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="content-stretch flex flex-col gap-0 items-start relative shrink-0 w-full last:border-b-0" data-name="Section">
      <button
          onClick={() => setOpen(!open)}
          className="bg-[var(--background-primary)] relative shrink-0 w-full cursor-pointer hover:bg-[var(--background-secondary)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-brand)] text-left border-none"
          data-name="Section Header"
          aria-expanded={open}
      >
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex gap-[8px] items-center py-[16px] pl-[16px] pr-[16px] relative w-full">
            <div className="content-stretch flex gap-[12px] items-center relative shrink-0" data-name="Title">
              <div className="relative shrink-0 size-[24px] flex items-center justify-center text-[var(--text-primary)]">
                {open ? (
                  <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L7 7L13 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L7 7L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <div className="flex flex-col font-['Inter',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[var(--text-primary)] text-[15px] whitespace-nowrap">
                <p className="leading-[1.4]">{title}</p>
              </div>
            </div>
          </div>
        </div>
      </button>
      {open && children && (
        <div className="relative shrink-0 w-full pb-[16px] pl-[16px] pr-[16px]">
          <div className="content-stretch flex flex-col gap-[6px] items-stretch relative w-full">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

// Multi-checkbox helper
function MultiCheckboxFilter({
  options,
  selected,
  onChange,
  customers,
  filterKey,
}: {
  options: string[];
  selected: string[];
  onChange: (val: string[]) => void;
  customers: Customer[];
  filterKey: 'country' | 'city' | 'status';
}) {
  const getCounts = (opt: string) => {
    return customers.filter(c => {
      if (filterKey === 'country') return c.country === opt;
      if (filterKey === 'city') return c.city === opt;
      if (filterKey === 'status') return c.status === opt;
      return false;
    }).length;
  };

  return (
    <div className="flex flex-col gap-[6px] w-full" role="group">
      {options.map(opt => {
        const checked = selected.includes(opt);
        const count = getCounts(opt);
        const handleKeyDown = (e: React.KeyboardEvent) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            if (checked) onChange(selected.filter(s => s !== opt));
            else onChange([...selected, opt]);
          }
        };

        return (
          <button
            key={opt}
            type="button"
            onClick={() => {
              if (checked) {
                onChange(selected.filter(s => s !== opt));
              } else {
                onChange([...selected, opt]);
              }
            }}
            onKeyDown={handleKeyDown}
            className={`w-full h-[40px] relative rounded-[6px] shrink-0 border transition-all cursor-pointer flex flex-row items-center justify-between px-[12px] py-[8px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-brand)] ${
              checked
                ? 'bg-[var(--background-brand-subtle)] border-[var(--border-brand)] hover:bg-[var(--background-brand-subtle-hover)]'
                : 'bg-[var(--background-secondary)] border-[var(--border-subtle)] hover:bg-[var(--background-secondary-hover)] hover:border-[var(--border-brand-hover)]'
            }`}
          >
            <div className="flex items-center gap-[10px]">
              <div className={`w-3.5 h-3.5 rounded-[4px] border flex items-center justify-center shrink-0 transition-all ${
                checked 
                  ? 'bg-[var(--background-brand-solid)] border-[var(--border-brand)] text-white' 
                  : 'border-[var(--border-subtle)] bg-[var(--background-primary)]'
              }`}>
                {checked && (
                  <svg width="8" height="6" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className={`text-[13px] font-medium transition-colors ${
                checked ? 'text-[var(--text-brand)] font-semibold' : 'text-[var(--text-primary)]'
              }`}>{opt}</span>
            </div>
            
            <span className={`text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-md border transition-all ${
              checked 
                ? 'bg-[var(--background-primary)] border-[var(--border-brand-subtle)] text-[var(--text-brand)]' 
                : 'bg-[var(--background-primary)] border-[var(--border-subtle)] text-[var(--text-subtlest)]'
            }`}>{count}</span>
          </button>
        );
      })}
    </div>
  );
}

const parseDateString = (str: string): Date | null => {
  if (!str) return null;
  const [year, month, day] = str.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const formatDateString = (date: Date | null): string => {
  if (!date) return '';
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export function CustomersFilterRail({ filters, onFiltersChange, customers, collapsed, onToggleCollapse }: CustomersFilterRailProps) {
  const rangeValue = useMemo(() => ({
    from: parseDateString(filters.createdDateFrom || ''),
    to: parseDateString(filters.createdDateTo || '')
  }), [filters.createdDateFrom, filters.createdDateTo]);

  const handleRangeChange = (range: { from: Date | null; to: Date | null }) => {
    onFiltersChange({
      ...filters,
      createdDateFrom: formatDateString(range.from),
      createdDateTo: formatDateString(range.to)
    });
  };
  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const countries = ['Austria', 'Germany'];
  const cities = ['Vienna', 'Graz', 'Linz', 'Salzburg', 'Berlin', 'Munich', 'Hamburg', 'Frankfurt'];
  const statuses = ['ACTIVE', 'INACTIVE', 'BLACKLISTED'];

  const sidebarClasses = `
    fixed inset-0 z-[200] w-full bg-[var(--background-primary)] flex flex-col h-full overflow-hidden transition-transform duration-300 transform 
    md:static md:w-[280px] md:h-auto md:shadow-none md:border md:border-[var(--border-subtle)] md:rounded-[8px] md:flex md:translate-x-0 md:translate-y-0
    ${collapsed ? 'translate-y-full md:hidden md:-translate-x-full' : 'translate-y-0 md:translate-x-0'}
  `;

  return (
    <>
      {!collapsed && (
        <div 
          className="fixed inset-0 bg-black/40 z-[150] transition-opacity md:hidden animate-in fade-in duration-200" 
          onClick={onToggleCollapse}
          aria-hidden="true"
        />
      )}

      <div className={sidebarClasses} role="search" aria-label="Customers filters">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-[var(--border-subtle)] bg-[var(--background-secondary)] md:bg-transparent shrink-0">
          <div className="flex items-center gap-2.5">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12M4 8h8M6 12h4" stroke="var(--text-primary)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="text-sm font-semibold text-[var(--text-primary)]">Filters</span>
          </div>
          <div className="md:hidden">
            <button
              onClick={onToggleCollapse}
              className="w-10 h-10 flex items-center justify-center hover:bg-[var(--background-secondary-hover)] rounded-md transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-brand)] border-none bg-transparent"
              aria-label="Collapse filters sidebar"
            >
              <X size={20} className="text-[var(--text-subtlest)] hover:text-[var(--text-primary)]" />
            </button>
          </div>
        </div>

        {/* Scrollable sections */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden slick-scrollbar">
          {/* Customer ID filter */}
          <FilterSection title="Customer ID" defaultOpen={true}>
            <input
              type="text"
              placeholder="e.g. 2030397"
              value={filters.customerId}
              onChange={(e) => updateFilter('customerId', e.target.value)}
              className="w-full h-10 px-3 text-xs bg-[var(--background-secondary)] border border-[var(--border-subtle)] rounded-md focus:outline-none focus:border-[var(--border-brand)] hover:bg-[var(--background-secondary-hover)] focus:bg-[var(--background-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-subtlest)] transition-all font-semibold"
            />
          </FilterSection>

          {/* Country filter */}
          <FilterSection title="Country" defaultOpen={true}>
            <MultiCheckboxFilter
              options={countries}
              selected={filters.countries}
              onChange={(val) => updateFilter('countries', val)}
              customers={customers}
              filterKey="country"
            />
          </FilterSection>

          {/* City filter */}
          <FilterSection title="City" defaultOpen={true}>
            <MultiCheckboxFilter
              options={cities}
              selected={filters.cities}
              onChange={(val) => updateFilter('cities', val)}
              customers={customers}
              filterKey="city"
            />
          </FilterSection>

          {/* Status filter */}
          <FilterSection title="Status" defaultOpen={true}>
            <MultiCheckboxFilter
              options={statuses}
              selected={filters.statuses}
              onChange={(val) => updateFilter('statuses', val)}
              customers={customers}
              filterKey="status"
            />
          </FilterSection>

          {/* Deals Count range */}
          <FilterSection title="Total Deals Count" defaultOpen={false}>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.minDeals}
                onChange={(e) => updateFilter('minDeals', e.target.value)}
                className="w-1/2 h-10 px-3 text-xs bg-[var(--background-secondary)] border border-[var(--border-subtle)] rounded-md focus:outline-none focus:border-[var(--border-brand)] hover:bg-[var(--background-secondary-hover)] focus:bg-[var(--background-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-subtlest)] transition-all font-semibold"
              />
              <span className="text-xs text-[var(--text-subtlest)]">-</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxDeals}
                onChange={(e) => updateFilter('maxDeals', e.target.value)}
                className="w-1/2 h-10 px-3 text-xs bg-[var(--background-secondary)] border border-[var(--border-subtle)] rounded-md focus:outline-none focus:border-[var(--border-brand)] hover:bg-[var(--background-secondary-hover)] focus:bg-[var(--background-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-subtlest)] transition-all font-semibold"
              />
            </div>
          </FilterSection>

          {/* Payout Volume range */}
          <FilterSection title="Payout Volume (€)" defaultOpen={false}>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.minVolume}
                onChange={(e) => updateFilter('minVolume', e.target.value)}
                className="w-1/2 h-10 px-3 text-xs bg-[var(--background-secondary)] border border-[var(--border-subtle)] rounded-md focus:outline-none focus:border-[var(--border-brand)] hover:bg-[var(--background-secondary-hover)] focus:bg-[var(--background-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-subtlest)] transition-all font-semibold"
              />
              <span className="text-xs text-[var(--text-subtlest)]">-</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxVolume}
                onChange={(e) => updateFilter('maxVolume', e.target.value)}
                className="w-1/2 h-10 px-3 text-xs bg-[var(--background-secondary)] border border-[var(--border-subtle)] rounded-md focus:outline-none focus:border-[var(--border-brand)] hover:bg-[var(--background-secondary-hover)] focus:bg-[var(--background-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-subtlest)] transition-all font-semibold"
              />
            </div>
          </FilterSection>

          {/* Created Date range */}
          <FilterSection title="Created Date" defaultOpen={false}>
            <div className="w-full">
              <DateRangePicker
                value={rangeValue}
                onChange={handleRangeChange}
                placeholder="Select date range"
                className="w-full"
              />
            </div>
          </FilterSection>
        </div>

        {/* Mobile footer */}
        <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--background-secondary)] md:hidden shrink-0 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              onFiltersChange(INITIAL_FILTERS);
            }}
            className="flex-1 h-11 text-xs font-semibold text-[var(--text-subtle)] bg-[var(--background-primary)] border border-[var(--border-subtle)] rounded-lg hover:bg-[var(--background-secondary-hover)] transition-all cursor-pointer focus:outline-none"
          >
            Reset All
          </button>
          <button
            onClick={onToggleCollapse}
            className="flex-1 h-11 text-xs font-semibold text-white bg-[var(--background-brand-solid)] hover:bg-[var(--background-brand-solid-hover)] rounded-lg transition-all cursor-pointer focus:outline-none"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
}
