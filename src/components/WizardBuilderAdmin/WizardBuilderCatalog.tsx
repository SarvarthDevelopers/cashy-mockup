import React, { useState } from 'react';
import { Search, X, Filter, Copy, Trash2 } from 'lucide-react';
import type { WizardConfig } from '../../data/wizardData';
import { ConfirmationModal } from './ConfirmationModal';

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function FilterSection({ title, children, defaultOpen = true }: FilterSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="content-stretch flex flex-col gap-0 items-start relative shrink-0 w-full last:border-b-0 border-b border-[var(--border-subtle)]" data-name="Section">
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

interface MultiCheckboxFilterProps {
  options: string[];
  selected: string[];
  onChange: (val: string[]) => void;
  wizards: WizardConfig[];
  filterKey: 'category' | 'shop';
}

function MultiCheckboxFilter({
  options,
  selected,
  onChange,
  wizards,
  filterKey,
}: MultiCheckboxFilterProps) {
  const getCounts = (opt: string) => {
    return wizards.filter(w => {
      const val = (w as unknown as Record<string, unknown>)[filterKey] || (filterKey === 'shop' ? 'Global' : '');
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
              <span className={`text-[13px] font-medium transition-colors text-left ${
                checked ? 'text-[var(--text-brand)] font-semibold' : 'text-[var(--text-primary)]'
              }`}>{opt}</span>
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

interface CatalogSidebarProps {
  searchTerm: string;
  showClear: boolean;
  onSearch: (term: string) => void;
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
  selectedShops: string[];
  onShopsChange: (shops: string[]) => void;
  onClear: () => void;
  wizards: WizardConfig[];
}

const CatalogSidebar: React.FC<CatalogSidebarProps> = ({ 
  searchTerm, 
  showClear,
  onSearch, 
  selectedCategories, 
  onCategoriesChange, 
  selectedShops, 
  onShopsChange, 
  onClear,
  wizards
}) => {
  return (
    <div className="w-[280px] shrink-0 bg-[var(--background-primary)] border border-[var(--border-subtle)] rounded-[8px] flex flex-col overflow-hidden shadow-sm h-fit">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-[var(--border-subtle)] bg-[var(--background-secondary)] shrink-0">
        <div className="flex items-center gap-2.5">
          <Filter size={16} className="text-[var(--text-primary)]" />
          <span className="text-sm font-extrabold text-[var(--text-primary)]">Filters</span>
        </div>
      </div>

      {/* Scrollable filters */}
      <div className="flex-grow overflow-y-auto slick-scrollbar">
        {/* Search Section */}
        <FilterSection title="Search Wizards" defaultOpen={true}>
          <div className="relative w-full">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-subtlest)]">
              <Search size={14} />
            </span>
            <input
              type="text"
              placeholder="Search name or category..."
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-8 text-xs bg-[var(--background-secondary)] border border-[var(--border-subtle)] rounded-[6px] focus:outline-none focus:border-[var(--border-brand)] hover:bg-[var(--background-secondary-hover)] focus:bg-[var(--background-primary)] text-[var(--text-primary)] transition-all font-semibold"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => onSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-subtlest)] hover:text-[var(--text-primary)] border-none bg-transparent cursor-pointer flex items-center justify-center"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </FilterSection>

        {/* Categories Section */}
        <FilterSection title="Categories" defaultOpen={true}>
          <MultiCheckboxFilter
            options={['Car', 'Watches', 'General Electronics', 'Luxury']}
            selected={selectedCategories}
            onChange={onCategoriesChange}
            wizards={wizards}
            filterKey="category"
          />
        </FilterSection>

        {/* Shops & Branches Section */}
        <FilterSection title="Shops & Branches" defaultOpen={true}>
          <MultiCheckboxFilter
            options={['Global', 'Downtown Branch', 'Uptown Branch']}
            selected={selectedShops}
            onChange={onShopsChange}
            wizards={wizards}
            filterKey="shop"
          />
        </FilterSection>
      </div>

      {/* Footer Area */}
      <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--background-secondary)] flex flex-col gap-3 shrink-0">
        {showClear && (
          <button 
            onClick={onClear}
            className="h-10 text-xs font-bold text-[var(--text-subtle)] bg-[var(--background-primary)] border border-[var(--border-subtle)] rounded-lg hover:bg-[var(--background-secondary-hover)] transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <X size={14} />
            Clear all filters
          </button>
        )}
        <button 
          onClick={() => {
            if (confirm('Are you sure you want to reset all wizards to default? This will clear all your custom changes.')) {
              localStorage.removeItem('cashy_wizards_v2');
              window.location.reload();
            }
          }}
          className="text-[10px] font-bold text-[var(--text-subtlest)] hover:text-[var(--text-error)] uppercase tracking-widest transition-colors text-center mt-1"
        >
          Reset Catalog to Defaults
        </button>
      </div>
    </div>
  );
};

interface WizardRowProps {
  wizard: WizardConfig;
  selected: boolean;
  isJustDuplicated?: boolean;
  onSelect: (id: string) => void;
  onEdit: (wizard: WizardConfig) => void;
  onDuplicate?: (wizard: WizardConfig) => void;
  onDeleteSingle?: (wizard: WizardConfig) => void;
}

const WizardRow: React.FC<WizardRowProps> = ({ wizard, selected, isJustDuplicated, onSelect, onEdit, onDuplicate, onDeleteSingle }) => {
  return (
    <div className={`bg-[var(--background-primary)] border rounded-xl p-6 flex items-center justify-between group transition-all shadow-sm ${
      isJustDuplicated
        ? 'border-2 border-[#4649E5] bg-[#F8F8FF] ring-4 ring-[#4649E5]/15'
        : selected 
        ? 'border-[var(--border-brand)] bg-[var(--background-brand-primary)]' 
        : 'border-[var(--border-subtle)] hover:border-[var(--border-brand-hover)]'
    }`}>
      <div className="flex items-center gap-4">
        <input 
          type="checkbox" 
          checked={selected}
          onChange={() => onSelect(wizard.id)}
          className="w-4 h-4 rounded border-[var(--border-primary)] text-[#4649E5] cursor-pointer" 
        />
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[var(--text-subtlest)] uppercase tracking-widest">{wizard.id}</span>
            {wizard.active ? (
              <span className="bg-[var(--background-success-primary)] text-[var(--text-success)] text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider border border-[var(--background-success-subtle)]">Active</span>
            ) : (
              <span className="bg-[var(--background-disabled-subtle)] text-[var(--text-disabled)] text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider border border-[var(--border-disabled-subtle)]">Inactive</span>
            )}
          </div>
          <h4 className="text-base font-bold text-[var(--text-primary)]">{wizard.name} <span className="text-[var(--text-subtlest)] font-medium ml-1">[{wizard.category || 'No Category'}{wizard.condition && wizard.condition !== 'All' ? ` • ${wizard.condition}` : ' • All Conditions'}]</span></h4>
        </div>
      </div>

      <div className="flex items-center gap-8">
        <div className="text-right">
          <p className="text-[10px] text-[var(--text-subtlest)] uppercase font-bold tracking-wider">Updated</p>
          <p className="text-xs font-medium text-[var(--text-subtle)]">{wizard.updatedAt} by {wizard.updatedBy}</p>
        </div>
        <div className="flex items-center gap-2">
          {onDuplicate && (
            <button 
              onClick={() => onDuplicate(wizard)}
              className="size-9 rounded-lg border border-[var(--border-subtle)] bg-[var(--background-primary)] text-[var(--text-subtle)] hover:text-[#4649E5] hover:border-[#4649E5] hover:bg-[#F8F8FF] transition-all flex items-center justify-center cursor-pointer shadow-sm"
              title="Duplicate Wizard"
              aria-label="Duplicate Wizard"
            >
              <Copy size={16} />
            </button>
          )}

          {onDeleteSingle && (
            <button 
              onClick={() => onDeleteSingle(wizard)}
              className="size-9 rounded-lg border border-[var(--border-subtle)] bg-[var(--background-primary)] text-[var(--text-subtle)] hover:text-[var(--text-error)] hover:border-[var(--border-error)] hover:bg-[var(--background-error-subtle)] transition-all flex items-center justify-center cursor-pointer shadow-sm"
              title="Delete Wizard"
              aria-label="Delete Wizard"
            >
              <Trash2 size={16} />
            </button>
          )}

          <button 
            onClick={() => onEdit(wizard)}
            className="h-9 px-5 bg-[var(--background-primary)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-lg text-xs font-bold hover:bg-[var(--background-primary-solid)] hover:text-[var(--text-white)] transition-all shadow-sm cursor-pointer ml-1"
          >
            Edit Wizard
          </button>
        </div>
      </div>
    </div>
  );
};

interface WizardBuilderCatalogProps {
    wizards: WizardConfig[];
    onEditWizard: (wizard: WizardConfig) => void;
    onCreateNew: () => void;
    onDeleteWizards: (ids: string[]) => void;
    onDeactivateWizards: (ids: string[]) => void;
    onDuplicateWizard?: (wizard: WizardConfig) => WizardConfig | void;
}

export const WizardBuilderCatalog: React.FC<WizardBuilderCatalogProps> = ({ 
  wizards, 
  onEditWizard, 
  onCreateNew,
  onDeleteWizards,
  onDeactivateWizards,
  onDuplicateWizard
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategories, setFilterCategories] = useState<string[]>([]);
  const [filterShops, setFilterShops] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [singleWizardToDelete, setSingleWizardToDelete] = useState<WizardConfig | null>(null);
  const [justDuplicatedId, setJustDuplicatedId] = useState<string | null>(null);

  const handleDuplicate = (wizard: WizardConfig) => {
    if (onDuplicateWizard) {
      const created = onDuplicateWizard(wizard);
      if (created) {
        setJustDuplicatedId(created.id);
      }
    }
  };

  const filteredWizards = wizards.filter(w => {
    const matchesSearch = w.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          w.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategories.length === 0 || filterCategories.includes(w.category);
    const matchesShop = filterShops.length === 0 || filterShops.some(shop => {
      const wShop = (w as unknown as Record<string, unknown>).shop || 'Global';
      return wShop === shop;
    });

    return matchesSearch && matchesCategory && matchesShop;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredWizards.map(w => w.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterCategories([]);
    setFilterShops([]);
  };

  const allSelected = filteredWizards.length > 0 && filteredWizards.every(w => selectedIds.has(w.id));

  // Deletion logic
  const selectedWizards = wizards.filter(w => selectedIds.has(w.id));
  const hasActiveSelected = selectedWizards.some(w => w.active);

  const handleRequestSingleDelete = (wizard: WizardConfig) => {
    setSingleWizardToDelete(wizard);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (singleWizardToDelete) {
      onDeleteWizards([singleWizardToDelete.id]);
      setSingleWizardToDelete(null);
    } else {
      onDeleteWizards(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  };

  const handleDeactivateConfirm = () => {
    onDeactivateWizards(Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  return (
    <div className="p-8 flex flex-col gap-8 h-full bg-[var(--background-tertiary)] overflow-y-auto slick-scrollbar">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Wizard Builder Catalog</h1>
        <p className="text-[var(--text-subtle)] text-sm">Manage wizard templates for different categories and branches</p>
      </div>

      <div className="flex gap-4 items-start">
        <CatalogSidebar 
          searchTerm={searchTerm}
          showClear={searchTerm !== '' || filterCategories.length > 0 || filterShops.length > 0}
          onSearch={setSearchTerm} 
          selectedCategories={filterCategories}
          onCategoriesChange={setFilterCategories}
          selectedShops={filterShops}
          onShopsChange={setFilterShops}
          onClear={clearFilters}
          wizards={wizards}
        />

        <div className="flex-1 flex flex-col gap-4">
          <div className="flex items-center justify-between px-2 mb-2">
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-3 text-sm font-bold text-[var(--text-primary)] cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={allSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 rounded border-[var(--border-subtle)] cursor-pointer" 
                />
                Select All ({selectedIds.size})
              </label>
              {selectedIds.size > 0 && (
                <div className="flex items-center gap-4 border-l border-[var(--border-subtle)] pl-4">
                  <button 
                    onClick={() => setIsDeactivateModalOpen(true)}
                    className="text-[var(--text-subtle)] text-xs font-bold hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                  >
                    Deactivate Wizards
                  </button>
                  <button 
                    onClick={() => {
                      setSingleWizardToDelete(null);
                      setIsDeleteModalOpen(true);
                    }}
                    className="text-[var(--text-error)] text-xs font-bold hover:underline cursor-pointer"
                  >
                    Delete Wizards
                  </button>
                </div>
              )}
            </div>

            <button 
              onClick={onCreateNew}
              className="h-10 px-4 bg-[var(--background-brand-solid)] text-[var(--text-white)] rounded-lg flex items-center justify-center gap-2 font-bold text-sm hover:bg-[var(--background-brand-solid-hover)] transition-colors shadow-lg shadow-[var(--lilac-100)] cursor-pointer"
            >
              <span>+</span> Create New Wizard
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {filteredWizards.map(wizard => (
              <WizardRow 
                key={wizard.id} 
                wizard={wizard} 
                selected={selectedIds.has(wizard.id)}
                isJustDuplicated={wizard.id === justDuplicatedId}
                onSelect={handleSelectOne}
                onEdit={onEditWizard} 
                onDuplicate={handleDuplicate}
                onDeleteSingle={handleRequestSingleDelete}
              />
            ))}
            {filteredWizards.length === 0 && (
              <div className="py-20 text-center bg-white rounded-xl border border-dashed border-gray-200">
                <p className="text-gray-400 font-medium">No wizards found matching your filters.</p>
                <button onClick={clearFilters} className="text-[#4649E5] text-sm font-bold mt-2 hover:underline">Clear all filters</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSingleWizardToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title={singleWizardToDelete ? `Delete "${singleWizardToDelete.name}"?` : `Delete ${selectedIds.size} Wizard${selectedIds.size > 1 ? 's' : ''}?`}
        description="This action cannot be undone. All configuration and field data associated with this wizard will be permanently removed."
        confirmText="Delete Permanently"
        confirmVariant="danger"
        requireTypedConfirmation={singleWizardToDelete ? singleWizardToDelete.active : hasActiveSelected}
        typedConfirmationWord="delete"
        warningMessage={(singleWizardToDelete ? singleWizardToDelete.active : hasActiveSelected) ? "Warning: This wizard is currently ACTIVE and associated with categories. Deleting it may impact live deal workflows." : undefined}
      />

      <ConfirmationModal
        isOpen={isDeactivateModalOpen}
        onClose={() => setIsDeactivateModalOpen(false)}
        onConfirm={handleDeactivateConfirm}
        title={`Deactivate ${selectedIds.size} Wizard${selectedIds.size > 1 ? 's' : ''}?`}
        description="Are you sure you want to deactivate these wizards? Fields assigned to the wizard won't be available in live deal workflows until reactivated."
        confirmText="Deactivate"
        confirmVariant="primary"
      />
    </div>
  );
};
