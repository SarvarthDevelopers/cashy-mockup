import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Search, AlertTriangle } from 'lucide-react';
import { Checkbox } from '../Checkbox/Checkbox';
import { 
  ALL_EXISTING_CATEGORIES, 
  buildCategoryTree, 
  getDescendants,
  type CategoryNode 
} from '../../data/businessAreaMapping';

export interface CategoryTreeCheckboxProps {
  selectedPaths: string[];
  onChange: (paths: string[]) => void;
  warningMap?: Record<string, string>;
}

export const CategoryTreeCheckbox: React.FC<CategoryTreeCheckboxProps> = ({
  selectedPaths,
  onChange,
  warningMap = {}
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPaths, setExpandedPaths] = useState<Record<string, boolean>>({});

  // 1. Build base category tree from all possible categories
  const rootNode = useMemo(() => {
    return buildCategoryTree(ALL_EXISTING_CATEGORIES);
  }, []);

  // 2. Determine which nodes match the search query (including descendants/ancestors)
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

  // 3. Automatically expand folders containing search matches when search changes
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
      // Expand parent paths
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

  const handleCheckboxChange = (node: CategoryNode, checked: boolean) => {
    const descendants = getDescendants(node);
    let newPaths = [...selectedPaths];

    if (checked) {
      // Add all leaf descendants that are not yet selected
      descendants.forEach(path => {
        if (!newPaths.includes(path)) {
          newPaths.push(path);
        }
      });
    } else {
      // Remove all descendants from selected list
      newPaths = newPaths.filter(p => !descendants.includes(p));
    }
    onChange(newPaths);
  };

  const renderNode = (node: CategoryNode, level: number = 0) => {
    const children = Object.values(node.children);
    const isLeaf = children.length === 0;
    
    // Hide node if it doesn't match search criteria
    if (matchingPaths && node.fullPath && !matchingPaths.has(node.fullPath)) {
      return null;
    }

    const isExpanded = !!expandedPaths[node.fullPath];
    const descendants = getDescendants(node);
    
    // Checkbox evaluation
    const checkedDescendants = descendants.filter(d => selectedPaths.includes(d));
    const isChecked = descendants.length > 0 && checkedDescendants.length === descendants.length;
    const isIndeterminate = descendants.length > 0 && checkedDescendants.length > 0 && checkedDescendants.length < descendants.length;

    const warningArea = node.fullPath ? warningMap[node.fullPath] : null;

      const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === ' ') {
          e.preventDefault();
          handleCheckboxChange(node, !isChecked);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (!isLeaf) {
            setExpandedPaths(prev => ({ ...prev, [node.fullPath]: !prev[node.fullPath] }));
          } else {
            handleCheckboxChange(node, !isChecked);
          }
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
              onClick={() => {
                if (!isLeaf) {
                  setExpandedPaths(prev => ({ ...prev, [node.fullPath]: !prev[node.fullPath] }));
                } else {
                  handleCheckboxChange(node, !isChecked);
                }
              }}
              onKeyDown={handleKeyDown}
              tabIndex={0}
              role="checkbox"
              aria-checked={isChecked ? "true" : isIndeterminate ? "mixed" : "false"}
              aria-label={node.displayName}
              className="flex items-center justify-between py-2 px-3 hover:bg-[var(--background-secondary)] rounded-xl transition-all cursor-pointer select-none text-left w-full gap-2 min-h-10 border border-transparent hover:border-[var(--border-subtler)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-brand)] focus-visible:ring-inset"
              style={{ paddingLeft: `${Math.max(12, level * 16)}px` }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Expand/Collapse arrow */}
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={(e) => handleToggleExpand(node.fullPath, e)}
                  className={`w-5 h-5 flex items-center justify-center rounded-md hover:bg-gray-100 text-[var(--text-placeholder)] shrink-0 transition-colors border-none bg-transparent cursor-pointer focus:outline-none ${
                    isLeaf ? 'opacity-0 pointer-events-none' : ''
                  }`}
                >
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
  
                {/* Checkbox */}
                <div onClick={(e) => e.stopPropagation()} className="flex items-center shrink-0">
                  <Checkbox
                    checked={isChecked}
                    indeterminate={isIndeterminate}
                    onChange={(e) => handleCheckboxChange(node, e.target.checked)}
                    tabIndex={-1}
                  />
                </div>
  
                {/* Label */}
                <div className="flex flex-col min-w-0">
                  <span className={`text-[13px] truncate ${isChecked ? 'text-[var(--text-brand)] font-bold' : 'text-[var(--text-primary)] font-semibold'}`}>
                    {node.displayName}
                  </span>
                  {isLeaf && (
                    <span className="text-[9px] text-[var(--text-placeholder)] font-mono tracking-tight">{node.fullPath}</span>
                  )}
                </div>
              </div>
  
              {/* Warning indicator */}
              {isLeaf && warningArea && (
                <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-100 rounded-md text-[9px] font-extrabold text-amber-700 uppercase tracking-tight shrink-0">
                  <AlertTriangle size={9} />
                  <span>In {warningArea}</span>
                </div>
              )}
            </div>
          )}

        {/* Child Nodes */}
        {(!node.fullPath || isExpanded) && children.length > 0 && (
          <div className="flex flex-col w-full">
            {children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const hasMatches = useMemo(() => {
    if (!matchingPaths) return true;
    return matchingPaths.size > 0;
  }, [matchingPaths]);

  return (
    <div className="flex flex-col gap-3.5 w-full">
      {/* Search Input */}
      <div className="relative w-full">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-placeholder)]">
          <Search size={14} />
        </span>
        <input
          type="text"
          placeholder="Search categories..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full h-10 pl-9 pr-4 text-[13px] font-semibold bg-[var(--background-secondary)] border border-[var(--border-subtle)] rounded-xl focus:outline-none focus:border-[var(--border-brand)] hover:bg-[var(--background-secondary-hover)] focus:bg-[var(--background-primary)] text-[var(--text-primary)] transition-all placeholder:text-[var(--text-placeholder)]"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => handleSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--text-placeholder)] hover:text-[var(--text-primary)] border-none bg-transparent cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* Category Tree Container */}
      <div className="flex flex-col gap-0.5">
        {!hasMatches ? (
          <div className="py-8 px-4 text-center text-[12px] text-[var(--text-placeholder)] font-bold italic">
            No matching categories found
          </div>
        ) : (
          Object.values(rootNode.children).map(child => renderNode(child, 0))
        )}
      </div>
    </div>
  );
};
