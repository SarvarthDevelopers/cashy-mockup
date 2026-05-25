import { useState, useMemo } from 'react';
import { X, Calendar, ChevronRight, ChevronDown, Search } from 'lucide-react';
import type { Deal } from '../../data/mockDeals';
import { SHOP_METADATA } from '../../data/mockDeals';
import { getBusinessAreas, ALL_EXISTING_CATEGORIES, buildCategoryTree, getDescendants, type CategoryNode } from '../../data/businessAreaMapping';

import { INITIAL_FILTERS } from './dealsFilterConstants';
import type { FilterState } from './dealsFilterConstants';

export { INITIAL_FILTERS };
export type { FilterState };

interface CategoryTreeNodeProps {
  node: CategoryNode;
  selectedPaths: string[];
  expandedPaths: Record<string, boolean>;
  onToggleExpand: (path: string) => void;
  onCheckboxChange: (path: string, checked: boolean) => void;
  countMap: Record<string, number>;
  level: number;
  matchingPaths: Set<string> | null;
}

const CategoryTreeNode: React.FC<CategoryTreeNodeProps> = ({
  node,
  selectedPaths,
  expandedPaths,
  onToggleExpand,
  onCheckboxChange,
  countMap,
  level = 0,
  matchingPaths
}) => {
  const children = Object.values(node.children);
  const isLeaf = children.length === 0;

  const descendants = useMemo(() => {
    return getDescendants(node);
  }, [node]);

  if (matchingPaths && node.fullPath && !matchingPaths.has(node.fullPath)) {
    return null;
  }

  const isExpanded = !!expandedPaths[node.fullPath];

  const checkedDescendantsCount = descendants.filter(d => selectedPaths.includes(d)).length;
  const isChecked = descendants.length > 0 && checkedDescendantsCount === descendants.length;
  const isIndeterminate = descendants.length > 0 && checkedDescendantsCount > 0 && checkedDescendantsCount < descendants.length;

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCheckboxChange(node.fullPath, !isChecked);
  };

  const handleRowClick = () => {
    if (!isLeaf) {
      onToggleExpand(node.fullPath);
    } else {
      onCheckboxChange(node.fullPath, !isChecked);
    }
  };

  const displayName = node.displayName;
  const count = countMap[node.fullPath] || 0;

  return (
    <div className="flex flex-col w-full">
      {node.fullPath && (
        <div 
          onClick={handleRowClick}
          className={`flex items-center justify-between py-1 px-2 hover:bg-[var(--background-secondary-hover)] rounded-[6px] transition-all cursor-pointer text-left w-full h-[36px] ${
            isChecked ? 'bg-[var(--background-brand-subtle)]/30 hover:bg-[var(--background-brand-subtle-hover)]/30' : ''
          }`}
          style={{ paddingLeft: `${level * 16 + 4}px` }}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            {/* Expand indicator */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(node.fullPath);
              }}
              className="w-3.5 h-3.5 flex items-center justify-center shrink-0 text-[var(--text-subtlest)] hover:text-[var(--text-primary)] bg-transparent border-none p-0 cursor-pointer"
            >
              {!isLeaf && (
                isExpanded ? <ChevronDown size={12} strokeWidth={2} /> : <ChevronRight size={12} strokeWidth={2} />
              )}
            </button>

            {/* Checkbox */}
            <div 
              onClick={handleCheckboxClick}
              className={`w-4 h-4 rounded-[4px] border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                isChecked 
                  ? 'bg-[var(--background-brand-solid)] border-[var(--border-brand)] text-white' 
                  : isIndeterminate
                    ? 'bg-[var(--background-brand-primary)] border-[var(--border-brand)] text-[var(--text-brand)]'
                    : 'border-[var(--border-subtle)] bg-[var(--background-primary)] hover:border-[var(--border-brand-hover)]'
              }`}
            >
              {isChecked && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              {isIndeterminate && (
                <div className="w-1.5 h-0.5 bg-[var(--text-brand)] rounded shrink-0" />
              )}
            </div>

            <span className={`text-[13px] truncate transition-colors ${
              isChecked 
                ? 'text-[var(--text-brand)] font-semibold' 
                : 'text-[var(--text-primary)] font-medium'
            }`}>
              {displayName}
            </span>
          </div>

          <span className={`text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-md border transition-colors shrink-0 ${
            isChecked 
              ? 'bg-[var(--background-primary)] border-[var(--border-brand-subtle)] text-[var(--text-brand)]' 
              : 'bg-[var(--background-primary)] border-[var(--border-subtle)] text-[var(--text-subtlest)]'
          }`}>
            {count}
          </span>
        </div>
      )}

      {!isLeaf && (node.fullPath === '' || isExpanded) && (
        <div className="flex flex-col w-full mt-0.5">
          {children.map(child => (
            <CategoryTreeNode
              key={child.fullPath}
              node={child}
              selectedPaths={selectedPaths}
              expandedPaths={expandedPaths}
              onToggleExpand={onToggleExpand}
              onCheckboxChange={onCheckboxChange}
              countMap={countMap}
              level={node.fullPath ? level + 1 : level}
              matchingPaths={matchingPaths}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface DealsFilterRailProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  deals: Deal[];
  collapsed: boolean;
  onToggleCollapse: () => void;
}

// Collapsible section wrapper matching DealWizardBuilder sidebar aesthetic
function FilterSection({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="content-stretch flex flex-col gap-0 items-start relative shrink-0 w-full last:border-b-0" data-name="Section">
      <button
          onClick={() => setOpen(!open)}
          className="bg-[var(--background-primary)] relative shrink-0 w-full cursor-pointer hover:bg-[var(--background-secondary)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-brand)] text-left"
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

// Multi-checkbox filter matching the DealWizardBuilder button cards layout
function MultiCheckboxFilter({
  options,
  selected,
  onChange,
  deals,
  filterKey,
}: {
  options: string[];
  selected: string[];
  onChange: (val: string[]) => void;
  deals: Deal[];
  filterKey: keyof Deal;
}) {
  const getCounts = (opt: string) => {
    return deals.filter(d => {
      const val = d[filterKey];
      if (Array.isArray(val)) return (val as string[]).includes(opt);
      return val === opt;
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
              {/* Checkbox Indicator */}
              <div className={`w-4 h-4 rounded-[4px] border flex items-center justify-center shrink-0 transition-all ${
                checked 
                  ? 'bg-[var(--background-brand-solid)] border-[var(--border-brand)] text-white' 
                  : 'border-[var(--border-subtle)] bg-[var(--background-primary)]'
              }`}>
                {checked && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className={`text-[13px] font-medium transition-colors ${
                checked ? 'text-[var(--text-brand)] font-semibold' : 'text-[var(--text-primary)]'
              }`}>{opt === 'deal' ? 'Pawn' : opt === 'custom_deal' ? 'Purchase' : opt.replace(/_/g, ' ')}</span>
            </div>
            
            {/* Record Count Badge */}
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



export function DealsFilterRail({ filters, onFiltersChange, deals, collapsed, onToggleCollapse }: DealsFilterRailProps) {
  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  // Unique options
  const uniqueBranches = useMemo(() => [...new Set(deals.map(d => d.branch))].sort(), [deals]);

  // Hierarchical Shop Filtering logic
  const filteredShopOptions = useMemo(() => {
    if (filters.branch.length === 0) {
      return [...new Set(deals.map(d => d.shop))].sort();
    }
    const shops: string[] = [];
    filters.branch.forEach(b => {
      const branchShops = SHOP_METADATA[b] || [];
      shops.push(...branchShops);
    });
    return [...new Set(shops)].sort();
  }, [filters.branch, deals]);

  const businessAreaOptions = useMemo(() => {
    const areas = getBusinessAreas().map(a => a.name);
    if (!areas.includes('Mixed')) {
      areas.push('Mixed');
    }
    return areas;
  }, []);

  const categoryTree = useMemo(() => {
    return buildCategoryTree(ALL_EXISTING_CATEGORIES);
  }, []);

  const [expandedPaths, setExpandedPaths] = useState<Record<string, boolean>>({});

  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [matchingPaths, setMatchingPaths] = useState<Set<string> | null>(null);

  const handleCategorySearch = (query: string) => {
    setCategorySearchQuery(query);
    if (!query.trim()) {
      setMatchingPaths(null);
      return;
    }
    const matches = new Set<string>();
    const lowercaseQuery = query.toLowerCase();

    const searchNode = (node: CategoryNode) => {
      const isMatch = node.displayName.toLowerCase().includes(lowercaseQuery);
      let hasMatchingChild = false;

      Object.values(node.children).forEach(child => {
        const childMatch = searchNode(child);
        if (childMatch) {
          hasMatchingChild = true;
        }
      });

      if (isMatch || hasMatchingChild) {
        if (node.fullPath) {
          matches.add(node.fullPath);
        }
        return true;
      }
      return false;
    };

    searchNode(categoryTree);
    setMatchingPaths(matches);

    const newExpanded = { ...expandedPaths };
    matches.forEach(path => {
      newExpanded[path] = true;
    });
    setExpandedPaths(newExpanded);
  };

  const categoryCountMap = useMemo(() => {
    const counts: Record<string, number> = {};
    deals.forEach(d => {
      const dealPaths = new Set<string>();
      d.items.forEach(i => {
        if (!i.category) return;
        const parts = i.category.split('.');
        let currentPath = '';
        parts.forEach(part => {
          currentPath = currentPath ? `${currentPath}.${part}` : part;
          dealPaths.add(currentPath);
        });
      });
      dealPaths.forEach(p => {
        counts[p] = (counts[p] || 0) + 1;
      });
    });
    return counts;
  }, [deals]);

  const handleToggleExpand = (path: string) => {
    setExpandedPaths(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  const handleCategoryCheckboxChange = (path: string, checked: boolean) => {
    const findNode = (node: CategoryNode, targetPath: string): CategoryNode | null => {
      if (node.fullPath === targetPath) return node;
      for (const child of Object.values(node.children)) {
        const found = findNode(child, targetPath);
        if (found) return found;
      }
      return null;
    };

    const targetNode = findNode(categoryTree, path);
    if (!targetNode) return;

    const descendants = getDescendants(targetNode);
    let newPaths = [...filters.categoryPaths];

    if (checked) {
      descendants.forEach(d => {
        if (!newPaths.includes(d)) newPaths.push(d);
      });
    } else {
      newPaths = newPaths.filter(p => !descendants.includes(p));
    }
    updateFilter('categoryPaths', newPaths);
  };



  // Sidebar CSS classes for mobile drawer transitions
  const sidebarClasses = `
    fixed inset-0 z-50 w-full bg-[var(--background-primary)] flex flex-col h-full overflow-hidden transition-transform duration-300 transform 
    md:static md:w-[280px] md:h-auto md:shadow-none md:border md:border-[var(--border-subtle)] md:rounded-[8px] md:flex md:translate-x-0 md:translate-y-0
    ${collapsed ? 'translate-y-full md:hidden md:-translate-x-full' : 'translate-y-0 md:translate-x-0'}
  `;

  return (
    <>
      {/* Backdrop overlay on mobile when open */}
      {!collapsed && (
        <div 
          className="fixed inset-0 bg-black/40 z-45 transition-opacity md:hidden animate-in fade-in duration-200" 
          onClick={onToggleCollapse}
          aria-hidden="true"
        />
      )}

      {/* Main Drawer Sidebar Container */}
      <div className={sidebarClasses} role="search" aria-label="Deals filters">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-[var(--border-subtle)] bg-[var(--background-secondary)] md:bg-transparent shrink-0">
          <div className="flex items-center gap-2.5">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12M4 8h8M6 12h4" stroke="var(--text-primary)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="text-sm font-extrabold text-[var(--text-primary)]">Filters</span>
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

        {/* Scrollable filter sections */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden slick-scrollbar">
          {/* Company Division */}
          <FilterSection title="Company Division" defaultOpen={true}>
            <MultiCheckboxFilter
              options={['CASHY_AUT', 'CASHY_DE']}
              selected={filters.company}
              onChange={(val) => updateFilter('company', val)}
              deals={deals}
              filterKey="company"
            />
          </FilterSection>

          {/* Branch */}
          <FilterSection title="Branch" defaultOpen={true}>
            <MultiCheckboxFilter
              options={uniqueBranches}
              selected={filters.branch}
              onChange={(val) => updateFilter('branch', val)}
              deals={deals}
              filterKey="branch"
            />
          </FilterSection>

          {/* Shop */}
          <FilterSection title="Shop" defaultOpen={true}>
            {filteredShopOptions.length === 0 ? (
              <span className="text-[11px] text-[var(--text-subtlest)] font-semibold italic pl-1.5 w-full">No shops match branch criteria</span>
            ) : (
              <MultiCheckboxFilter
                options={filteredShopOptions}
                selected={filters.shop}
                onChange={(val) => updateFilter('shop', val)}
                deals={deals}
                filterKey="shop"
              />
            )}
          </FilterSection>

          {/* Business Area */}
          <FilterSection title="Business Area" defaultOpen={false}>
            <MultiCheckboxFilter
              options={businessAreaOptions}
              selected={filters.businessArea}
              onChange={(val) => updateFilter('businessArea', val)}
              deals={deals}
              filterKey="businessArea"
            />
          </FilterSection>

          {/* Item Category Tree */}
          <FilterSection title="Item Category" defaultOpen={false}>
            <div className="relative w-full mb-2">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-subtlest)]">
                <Search size={12} />
              </span>
              <input
                type="text"
                placeholder="Search categories..."
                value={categorySearchQuery}
                onChange={(e) => handleCategorySearch(e.target.value)}
                className="w-full h-8 pl-8 pr-4 text-[11px] font-semibold bg-[var(--background-secondary)] border border-[var(--border-subtle)] rounded-md focus:outline-none focus:border-[var(--border-brand)] hover:bg-[var(--background-secondary-hover)] focus:bg-[var(--background-primary)] text-[var(--text-primary)] transition-all placeholder:text-[var(--text-subtlest)]"
              />
              {categorySearchQuery && (
                <button
                  type="button"
                  onClick={() => handleCategorySearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[var(--text-subtlest)] hover:text-[var(--text-primary)] border-none bg-transparent cursor-pointer"
                >
                  &times;
                </button>
              )}
            </div>

            <div className="flex flex-col gap-0.5 max-h-60 overflow-y-auto slick-scrollbar bg-transparent pr-1.5">
              {Object.keys(categoryTree.children).length === 0 ? (
                <span className="text-[11px] text-[var(--text-subtlest)] font-semibold italic p-2">No categories available</span>
              ) : (
                <CategoryTreeNode
                  node={categoryTree}
                  selectedPaths={filters.categoryPaths}
                  expandedPaths={expandedPaths}
                  onToggleExpand={handleToggleExpand}
                  onCheckboxChange={handleCategoryCheckboxChange}
                  countMap={categoryCountMap}
                  level={0}
                  matchingPaths={matchingPaths}
                />
              )}
            </div>
          </FilterSection>

          {/* Deal Type */}
          <FilterSection title="Deal Type" defaultOpen={false}>
            <MultiCheckboxFilter
              options={['deal', 'custom_deal']}
              selected={filters.mode}
              onChange={(val) => updateFilter('mode', val)}
              deals={deals}
              filterKey="mode"
            />
          </FilterSection>

          {/* Payout */}
          <FilterSection title="Payout" defaultOpen={false}>
            <div className="flex gap-2 w-full items-stretch">
              <div className="flex flex-col gap-1 flex-1">
                <input
                  type="number"
                  placeholder="Min (€)"
                  value={filters.minSuggestedPayout}
                  onChange={(e) => updateFilter('minSuggestedPayout', e.target.value)}
                  className="w-full h-[40px] px-3 text-xs bg-[var(--background-secondary)] border border-[var(--border-subtle)] rounded-[6px] focus:outline-none focus:border-[var(--border-brand)] hover:bg-[var(--background-secondary-hover)] focus:bg-[var(--background-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-subtlest)] transition-all font-semibold"
                />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <input
                  type="number"
                  placeholder="Max (€)"
                  value={filters.maxSuggestedPayout}
                  onChange={(e) => updateFilter('maxSuggestedPayout', e.target.value)}
                  className="w-full h-[40px] px-3 text-xs bg-[var(--background-secondary)] border border-[var(--border-subtle)] rounded-[6px] focus:outline-none focus:border-[var(--border-brand)] hover:bg-[var(--background-secondary-hover)] focus:bg-[var(--background-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-subtlest)] transition-all font-semibold"
                />
              </div>
            </div>
          </FilterSection>

          {/* Status */}
          <FilterSection title="Status" defaultOpen={false}>
            <MultiCheckboxFilter
              options={[
                'BOOKED',
                'REVIEWING',
                'VERIFIED',
                'CANCELED',
                'DECLINED',
                'ITEM_RECEIVED_ID_MISSING',
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
                'PICKED_UP',
                'PICKUP_UNSUCCESSFUL'
              ]}
              selected={filters.status}
              onChange={(val) => updateFilter('status', val)}
              deals={deals}
              filterKey="status"
            />
          </FilterSection>

          {/* Pickup Method */}
          <FilterSection title="Pickup Method" defaultOpen={false}>
            <MultiCheckboxFilter
              options={['SHOP', 'STANDARD_SHIPMENT', 'STOREBOX', 'EXTENSION']}
              selected={filters.pickupType}
              onChange={(val) => updateFilter('pickupType', val)}
              deals={deals}
              filterKey="pickupType"
            />
          </FilterSection>

          {/* Created Date */}
          <FilterSection title="Created Date" defaultOpen={false}>
            <div className="flex flex-col gap-1.5 w-full">
              <div className="relative w-full">
                <Calendar size={11} strokeWidth={1.5} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-subtlest)] pointer-events-none" />
                <input
                  type="date"
                  value={filters.createdDateFrom}
                  onChange={(e) => updateFilter('createdDateFrom', e.target.value)}
                  className="w-full h-[40px] pl-7 pr-2 text-xs bg-[var(--background-secondary)] border border-[var(--border-subtle)] rounded-[6px] focus:outline-none focus:border-[var(--border-brand)] hover:bg-[var(--background-secondary-hover)] focus:bg-[var(--background-primary)] text-[var(--text-primary)] transition-all font-semibold"
                  aria-label="Created Date From"
                />
              </div>
              <div className="relative w-full">
                <Calendar size={11} strokeWidth={1.5} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-subtlest)] pointer-events-none" />
                <input
                  type="date"
                  value={filters.createdDateTo}
                  onChange={(e) => updateFilter('createdDateTo', e.target.value)}
                  className="w-full h-[40px] pl-7 pr-2 text-xs bg-[var(--background-secondary)] border border-[var(--border-subtle)] rounded-[6px] focus:outline-none focus:border-[var(--border-brand)] hover:bg-[var(--background-secondary-hover)] focus:bg-[var(--background-primary)] text-[var(--text-primary)] transition-all font-semibold"
                  aria-label="Created Date To"
                />
              </div>
            </div>
          </FilterSection>
        </div>

        {/* Mobile Sticky Footer */}
        <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--background-secondary)] md:hidden shrink-0 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              onFiltersChange(INITIAL_FILTERS);
            }}
            className="flex-1 h-11 text-xs font-bold text-[var(--text-subtle)] bg-[var(--background-primary)] border border-[var(--border-subtle)] rounded-lg hover:bg-[var(--background-secondary-hover)] transition-all cursor-pointer focus:outline-none"
          >
            Reset All
          </button>
          <button
            onClick={onToggleCollapse}
            className="flex-1 h-11 text-xs font-black text-white bg-[var(--background-brand-solid)] hover:bg-[var(--background-brand-solid-hover)] rounded-lg transition-all cursor-pointer focus:outline-none"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
}
