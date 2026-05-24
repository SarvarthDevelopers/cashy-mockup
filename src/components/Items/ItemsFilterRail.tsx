import { useState, useMemo } from 'react';
import { X, Search } from 'lucide-react';
import type { FlatItem } from './ItemsTable';
import { INITIAL_FILTERS } from './itemsFilterConstants';
import type { FilterState } from './itemsFilterConstants';
import { getBusinessAreas, buildCategoryTree, getDescendants, type CategoryNode } from '../../data/businessAreaMapping';

export { INITIAL_FILTERS };
export type { FilterState };

interface ItemsFilterRailProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  items: FlatItem[];
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

// Hierarchical Category Tree Node component
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
          className="flex items-center justify-between py-1 px-1.5 hover:bg-[var(--background-secondary)] rounded-md transition-colors cursor-pointer text-left w-full h-8"
          style={{ paddingLeft: `${level * 12 + 6}px` }}
        >
          <div className="flex items-center gap-2 min-w-0">
            {/* Expand indicator */}
            <div className="w-3.5 h-3.5 flex items-center justify-center shrink-0 text-[var(--text-subtlest)]">
              {!isLeaf && (
                isExpanded ? (
                  <svg width="8" height="5" viewBox="0 0 10 6" fill="none">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="5" height="8" viewBox="0 0 6 10" fill="none">
                    <path d="M1 1L5 5L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )
              )}
            </div>

            {/* Checkbox */}
            <div 
              onClick={handleCheckboxClick}
              className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                isChecked 
                  ? 'bg-[var(--background-brand-solid)] border-[var(--border-brand)] text-white' 
                  : isIndeterminate
                    ? 'bg-[var(--background-brand-primary)] border-[var(--border-brand)] text-[var(--text-brand)]'
                    : 'border-[var(--border-subtle)] bg-[var(--background-primary)]'
              }`}
            >
              {isChecked && (
                <svg width="8" height="6" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              {isIndeterminate && (
                <div className="w-1.5 h-0.5 bg-[var(--text-brand)] rounded" />
              )}
            </div>

            <span className={`text-xs truncate ${isChecked ? 'text-[var(--text-brand)] font-bold' : 'text-[var(--text-primary)] font-medium'}`}>
              {displayName}
            </span>
          </div>

          <span className={`text-[9px] font-bold tabular-nums px-1 py-0.2 rounded border ${
            isChecked 
              ? 'bg-[var(--background-primary)] border-[var(--border-brand-subtle)] text-[var(--text-brand)]' 
              : 'bg-[var(--background-primary)] border-[var(--border-subtle)] text-[var(--text-subtlest)]'
          }`}>
            {count}
          </span>
        </div>
      )}

      {!isLeaf && (node.fullPath === '' || isExpanded) && (
        <div className="flex flex-col w-full">
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

// Segmented Toggle for Boolean/Tri-state Filters
function SegmentedToggle({
  value,
  onChange,
  label
}: {
  value: 'all' | 'yes' | 'no';
  onChange: (val: 'all' | 'yes' | 'no') => void;
  label: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <span className="text-[10px] font-bold text-[var(--text-subtlest)] uppercase tracking-wider">{label}</span>
      <div className="flex bg-[var(--background-secondary)] p-1 rounded-lg border border-[var(--border-subtle)] w-full">
        {(['all', 'yes', 'no'] as const).map(opt => {
          const isActive = value === opt;
          return (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              className={`flex-1 text-center py-1 text-xs font-bold rounded-md transition-all cursor-pointer focus:outline-none capitalize ${
                isActive
                  ? 'bg-[var(--background-primary)] text-[var(--text-brand)] border border-[var(--border-subtle)] font-bold'
                  : 'text-[var(--text-subtlest)] hover:text-[var(--text-primary)]'
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Multi-checkbox helper for exact visual parity
function MultiCheckboxFilter({
  options,
  selected,
  onChange,
  items,
  filterKey,
}: {
  options: string[];
  selected: string[];
  onChange: (val: string[]) => void;
  items: FlatItem[];
  filterKey: 'businessArea' | 'dealStatus';
}) {
  const getCounts = (opt: string) => {
    return items.filter(i => {
      if (filterKey === 'businessArea') return i.businessArea === opt;
      if (filterKey === 'dealStatus') return i.dealStatus === opt;
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
              }`}>{opt.replace(/_/g, ' ')}</span>
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

export function ItemsFilterRail({ filters, onFiltersChange, items, collapsed, onToggleCollapse }: ItemsFilterRailProps) {
  const [expandedPaths, setExpandedPaths] = useState<Record<string, boolean>>({});
  const [categorySearchQuery, setCategorySearchQuery] = useState('');

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  // Build the hierarchical Category Tree
  const categoryTree = useMemo(() => {
    const categories = Array.from(new Set(items.map(i => i.category)));
    return buildCategoryTree(categories);
  }, [items]);

  const businessAreaOptions = useMemo(() => {
    const areas = getBusinessAreas().map(a => a.name);
    if (!areas.includes('Mixed')) {
      areas.push('Mixed');
    }
    return areas;
  }, []);

  // Derive initial expanded paths synchronously from categoryTree
  // When categoryTree changes, we update expandedPaths by comparing to previous tree
  const [prevCategoryTree, setPrevCategoryTree] = useState(categoryTree);
  if (categoryTree !== prevCategoryTree) {
    setPrevCategoryTree(categoryTree);
    const initialExpanded: Record<string, boolean> = {};
    const recurse = (node: CategoryNode) => {
      if (node.fullPath) initialExpanded[node.fullPath] = true;
      Object.values(node.children).forEach(recurse);
    };
    recurse(categoryTree);
    setExpandedPaths(initialExpanded);
  }

  // Matching paths for search query
  const matchingPaths = useMemo(() => {
    if (!categorySearchQuery.trim()) return null;
    const query = categorySearchQuery.toLowerCase().trim();
    const matches = new Set<string>();

    const checkNode = (node: CategoryNode): boolean => {
      const isMatch = node.name.toLowerCase().includes(query) || node.fullPath.toLowerCase().includes(query) || node.displayName.toLowerCase().includes(query);
      
      let childMatches = false;
      Object.values(node.children).forEach(child => {
        if (checkNode(child)) {
          childMatches = true;
        }
      });

      if (isMatch || childMatches) {
        if (node.fullPath) {
          matches.add(node.fullPath);
        }
        return true;
      }
      return false;
    };

    checkNode(categoryTree);
    return matches;
  }, [categorySearchQuery, categoryTree]);

  // Auto-expand parents of search results when search changes
  const handleCategorySearch = (query: string) => {
    setCategorySearchQuery(query);
    if (!query.trim()) return;

    const q = query.toLowerCase().trim();
    const matches = new Set<string>();

    const checkNode = (node: CategoryNode): boolean => {
      const isMatch = node.name.toLowerCase().includes(q) || node.fullPath.toLowerCase().includes(q) || node.displayName.toLowerCase().includes(q);
      let childMatches = false;
      Object.values(node.children).forEach(child => {
        if (checkNode(child)) {
          childMatches = true;
        }
      });
      if (isMatch || childMatches) {
        if (node.fullPath) {
          matches.add(node.fullPath);
        }
        return true;
      }
      return false;
    };

    checkNode(categoryTree);

    const newExpanded: Record<string, boolean> = {};
    matches.forEach(path => {
      const parts = path.split('.');
      let current = '';
      parts.forEach(part => {
        current = current ? `${current}.${part}` : part;
        newExpanded[current] = true;
      });
    });
    setExpandedPaths(newExpanded);
  };

  // Compute total category mapping counts
  const categoryCountMap = useMemo(() => {
    const counts: Record<string, number> = {};
    items.forEach(i => {
      if (!i.category) return;
      const parts = i.category.split('.');
      let currentPath = '';
      parts.forEach(part => {
        currentPath = currentPath ? `${currentPath}.${part}` : part;
        counts[currentPath] = (counts[currentPath] || 0) + 1;
      });
    });
    return counts;
  }, [items]);

  const handleToggleExpand = (path: string) => {
    setExpandedPaths(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  const handleCategoryCheckboxChange = (path: string, checked: boolean) => {
    // Helper to find node in tree recursively
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
      // Add all descendants to active list
      descendants.forEach(d => {
        if (!newPaths.includes(d)) newPaths.push(d);
      });
    } else {
      // Remove all descendants from active list
      newPaths = newPaths.filter(p => !descendants.includes(p));
    }
    updateFilter('categoryPaths', newPaths);
  };

  const sidebarClasses = `
    fixed inset-0 z-50 w-full bg-[var(--background-primary)] flex flex-col h-full overflow-hidden transition-transform duration-300 transform 
    md:static md:w-64 md:h-auto md:shadow-none md:border md:border-[var(--border-subtle)] md:rounded-[8px] md:flex md:translate-x-0 md:translate-y-0
    ${collapsed ? 'translate-y-full md:hidden md:-translate-x-full' : 'translate-y-0 md:translate-x-0'}
  `;

  return (
    <>
      {!collapsed && (
        <div 
          className="fixed inset-0 bg-black/40 z-45 transition-opacity md:hidden animate-in fade-in duration-200" 
          onClick={onToggleCollapse}
          aria-hidden="true"
        />
      )}

      <div className={sidebarClasses} role="search" aria-label="Items filters">
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
              className="p-1 hover:bg-[var(--background-secondary)] rounded-md transition-colors cursor-pointer focus:outline-none"
              aria-label="Collapse filters sidebar"
            >
              <X size={15} className="text-[var(--text-subtlest)] hover:text-[var(--text-primary)]" />
            </button>
          </div>
        </div>

        {/* Scrollable sections */}
        <div className="flex-1 overflow-y-auto slick-scrollbar">
          {/* Item ID filter */}
          <FilterSection title="Item ID" defaultOpen={true}>
            <input
              type="text"
              placeholder="e.g. ITEM-001"
              value={filters.itemId}
              onChange={(e) => updateFilter('itemId', e.target.value)}
              className="w-full h-10 px-3 text-xs bg-[var(--background-secondary)] border border-[var(--border-subtle)] rounded-md focus:outline-none focus:border-[var(--border-brand)] hover:bg-[var(--background-secondary-hover)] focus:bg-[var(--background-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-subtlest)] transition-all font-semibold"
            />
          </FilterSection>

          {/* Deal ID filter */}
          <FilterSection title="Deal ID" defaultOpen={true}>
            <input
              type="text"
              placeholder="e.g. 000001"
              value={filters.dealId}
              onChange={(e) => updateFilter('dealId', e.target.value)}
              className="w-full h-10 px-3 text-xs bg-[var(--background-secondary)] border border-[var(--border-subtle)] rounded-md focus:outline-none focus:border-[var(--border-brand)] hover:bg-[var(--background-secondary-hover)] focus:bg-[var(--background-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-subtlest)] transition-all font-semibold"
            />
          </FilterSection>

          {/* Hierarchical Categories Tree filter */}
          <FilterSection title="Item Category" defaultOpen={true}>
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
            <div className="flex flex-col gap-0.5 max-h-60 overflow-y-auto slick-scrollbar border border-[var(--border-subtle)] rounded-lg p-1.5 bg-[var(--background-primary)]">
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

          {/* Business Area filter */}
          <FilterSection title="Business Area" defaultOpen={true}>
            <MultiCheckboxFilter
              options={businessAreaOptions}
              selected={filters.businessAreas}
              onChange={(val) => updateFilter('businessAreas', val)}
              items={items}
              filterKey="businessArea"
            />
          </FilterSection>

          {/* Parent Deal Status filter */}
          <FilterSection title="Deal Status" defaultOpen={false}>
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
              selected={filters.dealStatuses}
              onChange={(val) => updateFilter('dealStatuses', val)}
              items={items}
              filterKey="dealStatus"
            />
          </FilterSection>

          {/* Has Images / Has Documents Toggles */}
          <FilterSection title="Media & Attachments" defaultOpen={false}>
            <div className="flex flex-col gap-4 w-full">
              <SegmentedToggle
                value={filters.hasImages}
                onChange={(val) => updateFilter('hasImages', val)}
                label="Has Images"
              />
              <SegmentedToggle
                value={filters.hasDocuments}
                onChange={(val) => updateFilter('hasDocuments', val)}
                label="Has Documents"
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
