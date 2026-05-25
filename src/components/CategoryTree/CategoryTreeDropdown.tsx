import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronDown, ChevronRight, Search, Check } from 'lucide-react';
import { 
  ALL_EXISTING_CATEGORIES, 
  CATEGORY_DISPLAY_NAMES,
  buildCategoryTree, 
  type CategoryNode 
} from '../../data/businessAreaMapping';

export interface CategoryTreeDropdownProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export const CategoryTreeDropdown: React.FC<CategoryTreeDropdownProps> = ({
  label,
  value,
  onChange,
  disabled = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPaths, setExpandedPaths] = useState<Record<string, boolean>>({});
  
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Build category tree
  const rootNode = useMemo(() => {
    return buildCategoryTree(ALL_EXISTING_CATEGORIES);
  }, []);

  // 2. Clicks outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // 3. Search matching logic
  const matchingPaths = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const query = searchQuery.toLowerCase().trim();
    const matches = new Set<string>();

    const checkNode = (node: CategoryNode): boolean => {
      const isMatch = node.displayName.toLowerCase().includes(query) || node.fullPath.toLowerCase().includes(query);
      
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

    checkNode(rootNode);
    return matches;
  }, [searchQuery, rootNode]);

  // 4. Auto-expand on search matching
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) return;

    const q = query.toLowerCase().trim();
    const matches = new Set<string>();

    const checkNode = (node: CategoryNode): boolean => {
      const isMatch = node.displayName.toLowerCase().includes(q) || node.fullPath.toLowerCase().includes(q);
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

    checkNode(rootNode);

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

  const handleToggleExpand = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedPaths(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  const handleSelectNode = (path: string) => {
    onChange(path);
    setIsOpen(false);
  };

  const renderNode = (node: CategoryNode, level: number = 0) => {
    const children = Object.values(node.children);
    const isLeaf = children.length === 0;

    if (matchingPaths && node.fullPath && !matchingPaths.has(node.fullPath)) {
      return null;
    }

    const isExpanded = !!expandedPaths[node.fullPath];
    const isSelected = value === node.fullPath;

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleSelectNode(node.fullPath);
      } else if (e.key === 'ArrowRight' && !isLeaf && !isExpanded) {
        e.preventDefault();
        setExpandedPaths(prev => ({ ...prev, [node.fullPath]: true }));
      } else if (e.key === 'ArrowLeft' && !isLeaf && isExpanded) {
        e.preventDefault();
        setExpandedPaths(prev => ({ ...prev, [node.fullPath]: false }));
      }
    };

    return (
      <div key={node.fullPath || 'root'} className="flex flex-col w-full">
        {node.fullPath && (
          <div 
            onClick={() => handleSelectNode(node.fullPath)}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="button"
            aria-selected={isSelected}
            className={`flex items-center justify-between py-2 px-3 hover:bg-[var(--background-secondary)] rounded-xl transition-all cursor-pointer select-none text-left w-full h-10 border border-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-brand)] focus-visible:ring-inset ${
              isSelected 
                ? 'bg-[var(--background-brand-subtle)] border-[var(--border-brand)] text-[var(--text-brand)]' 
                : 'hover:border-[var(--border-subtler)]'
            }`}
            style={{ paddingLeft: `${Math.max(12, level * 16)}px` }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Expand Chevron (only for folders) */}
              {!isLeaf ? (
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={(e) => handleToggleExpand(node.fullPath, e)}
                  className="w-5 h-5 flex items-center justify-center rounded-md hover:bg-gray-100/50 text-[var(--text-placeholder)] shrink-0 transition-colors border-none bg-transparent cursor-pointer focus:outline-none"
                >
                  {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                </button>
              ) : (
                <div className="w-5 h-5 flex items-center justify-center shrink-0 text-[var(--text-placeholder)]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--border-subtle)]" />
                </div>
              )}

              {/* Icon / Label */}
              <div className="flex flex-col min-w-0">
                <span className={`text-[13px] truncate ${isSelected ? 'font-bold' : 'font-semibold text-[var(--text-primary)]'}`}>
                  {node.displayName}
                </span>
                <span className="text-[9px] text-[var(--text-placeholder)] font-mono tracking-tight">{node.fullPath}</span>
              </div>
            </div>

            {isSelected && (
              <span className="text-[var(--text-brand)] shrink-0 pr-1">
                <Check size={14} />
              </span>
            )}
          </div>
        )}

        {/* Render child nodes */}
        {(!node.fullPath || isExpanded) && children.length > 0 && (
          <div className="flex flex-col w-full">
            {children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const currentLabel = useMemo(() => {
    if (!value) return 'Select Category';
    return CATEGORY_DISPLAY_NAMES[value] || value;
  }, [value]);

  const hasMatches = useMemo(() => {
    if (!matchingPaths) return true;
    return matchingPaths.size > 0;
  }, [matchingPaths]);

  return (
    <div ref={containerRef} className={`flex flex-col gap-2 w-full relative ${className}`}>
      {label && (
        <span className="text-[13px] font-bold text-[var(--text-subtle)]">
          {label}
        </span>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-11 px-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--background-secondary)] text-[var(--text-primary)] flex items-center justify-between text-left transition-all hover:bg-[var(--background-secondary-hover)] hover:border-[var(--border-brand-hover)] focus:outline-none focus:border-[var(--border-brand)] focus:bg-[var(--background-primary)] disabled:opacity-50 disabled:cursor-not-allowed ${
          isOpen ? 'ring-2 ring-[var(--border-brand)] ring-offset-2 bg-[var(--background-primary)]' : ''
        }`}
      >
        <span className={`text-[13px] font-bold truncate ${value ? 'text-[var(--text-primary)]' : 'text-[var(--text-placeholder)]'}`}>
          {currentLabel}
        </span>
        <ChevronDown size={14} className="text-[var(--text-placeholder)] shrink-0" />
      </button>

      {/* Popover overlay dropdown */}
      {isOpen && (
        <div className="absolute top-[calc(100%+6px)] left-0 right-0 bg-[var(--background-primary)] border border-[var(--border-subtle)] rounded-2xl shadow-xl z-[300] flex flex-col p-3 gap-3 animate-in fade-in duration-150 min-w-[280px]">
          {/* Search bar */}
          <div className="relative w-full shrink-0">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-placeholder)]">
              <Search size={13} />
            </span>
            <input
              type="text"
              placeholder="Search category tree..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full h-9 pl-8 pr-4 text-[12px] font-semibold bg-[var(--background-secondary)] border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:border-[var(--border-brand)] focus:bg-[var(--background-primary)] text-[var(--text-primary)] transition-all placeholder:text-[var(--text-placeholder)]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => handleSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[var(--text-placeholder)] hover:text-[var(--text-primary)] border-none bg-transparent cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Hierarchical tree scroll viewport */}
          <div className="flex flex-col gap-0.5 max-h-56 overflow-y-auto slick-scrollbar bg-[var(--background-secondary)]/10 rounded-xl p-1">
            {!hasMatches ? (
              <div className="py-8 px-4 text-center text-[11px] text-[var(--text-placeholder)] font-bold italic">
                No matching categories
              </div>
            ) : (
              Object.values(rootNode.children).map(child => renderNode(child, 0))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
