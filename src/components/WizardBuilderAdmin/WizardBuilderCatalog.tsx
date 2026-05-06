import React, { useState } from 'react';
import type { WizardConfig } from '../../data/wizardData';
import { ConfirmationModal } from './ConfirmationModal';

interface CatalogSidebarProps {
  searchTerm: string;
  showClear: boolean;
  onSearch: (term: string) => void;
  onCategoryChange: (category: string) => void;
  onShopChange: (shop: string) => void;
  onClear: () => void;
  onCreateNew: () => void;
}

const CatalogSidebar: React.FC<CatalogSidebarProps> = ({ 
  searchTerm, 
  showClear,
  onSearch, 
  onCategoryChange, 
  onShopChange, 
  onClear,
  onCreateNew 
}) => {
  return (
    <div className="w-[280px] shrink-0 flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full h-11 bg-[var(--background-primary)] border border-[var(--border-subtle)] rounded-lg pl-10 pr-4 text-sm focus:outline-none focus:border-[var(--border-brand)] transition-all"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-subtlest)]">
             <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
               <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
               <path d="M13 13L16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
             </svg>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="relative">
            <select 
              id="category-filter"
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full h-11 bg-[var(--background-primary)] border border-[var(--border-subtle)] rounded-lg px-4 text-sm appearance-none focus:outline-none focus:border-[var(--border-brand)] transition-all"
            >
              <option value="">All Categories</option>
              <option value="Car">Car</option>
              <option value="Watches">Watches</option>
              <option value="General Electronics">General Electronics</option>
              <option value="Luxury">Luxury</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-subtlest)]">
               <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                 <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
               </svg>
            </div>
          </div>
          
          <div className="relative">
            <select 
              id="shop-filter"
              onChange={(e) => onShopChange(e.target.value)}
              className="w-full h-11 bg-[var(--background-primary)] border border-[var(--border-subtle)] rounded-lg px-4 text-sm appearance-none focus:outline-none focus:border-[var(--border-brand)] transition-all"
            >
              <option value="">All Shops / Branches</option>
              <option value="Global">Global</option>
              <option value="Downtown Branch">Downtown Branch</option>
              <option value="Uptown Branch">Uptown Branch</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-subtlest)]">
               <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                 <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
               </svg>
            </div>
          </div>
        </div>

        {showClear && (
          <button 
            onClick={onClear}
            className="text-xs font-bold text-gray-400 hover:text-[#17142b] transition-colors flex items-center gap-1.5 px-1 animate-in fade-in slide-in-from-top-1"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            Clear all filters
          </button>
        )}
      </div>

      <div className="mt-auto pt-8 border-t border-[var(--border-subtle)] flex flex-col gap-4">
        <button 
          onClick={onCreateNew}
          className="h-11 bg-[var(--background-brand-solid)] text-[var(--text-white)] rounded-lg flex items-center justify-center gap-2 font-bold text-sm hover:bg-[var(--background-brand-solid-hover)] transition-colors shadow-lg shadow-[var(--lilac-100)]"
        >
          <span>+</span> Create New Wizard
        </button>
        <button 
          onClick={() => {
            if (confirm('Are you sure you want to reset all wizards to default? This will clear all your custom changes.')) {
              localStorage.removeItem('cashy_wizards_v2');
              window.location.reload();
            }
          }}
          className="text-[10px] font-bold text-[var(--text-subtlest)] hover:text-[var(--text-error)] uppercase tracking-widest transition-colors text-center"
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
  onSelect: (id: string) => void;
  onEdit: (wizard: WizardConfig) => void;
}

const WizardRow: React.FC<WizardRowProps> = ({ wizard, selected, onSelect, onEdit }) => {
  return (
    <div className={`bg-[var(--background-primary)] border rounded-xl p-6 flex items-center justify-between group transition-all shadow-sm ${selected ? 'border-[var(--border-brand)] bg-[var(--background-brand-primary)]' : 'border-[var(--border-subtle)] hover:border-[var(--border-brand-hover)]'}`}>
      <div className="flex items-center gap-4">
        <input 
          type="checkbox" 
          checked={selected}
          onChange={() => onSelect(wizard.id)}
          className="w-4 h-4 rounded border-[var(--border-primary)] text-[var(--text-brand)] cursor-pointer" 
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
          <h4 className="text-base font-bold text-[var(--text-primary)]">{wizard.name} <span className="text-[var(--text-subtlest)] font-medium ml-1">[{wizard.category || 'No Category'}]</span></h4>
        </div>
      </div>

      <div className="flex items-center gap-8">
        <div className="text-right">
          <p className="text-[10px] text-[var(--text-subtlest)] uppercase font-bold tracking-wider">Updated</p>
          <p className="text-xs font-medium text-[var(--text-subtle)]">{wizard.updatedAt} by {wizard.updatedBy}</p>
        </div>
        <button 
          onClick={() => onEdit(wizard)}
          className="h-9 px-6 bg-[var(--background-primary)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-lg text-sm font-bold hover:bg-[var(--background-primary-solid)] hover:text-[var(--text-white)] transition-all shadow-sm"
        >
          Edit Wizard
        </button>
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
}

export const WizardBuilderCatalog: React.FC<WizardBuilderCatalogProps> = ({ 
  wizards, 
  onEditWizard, 
  onCreateNew,
  onDeleteWizards,
  onDeactivateWizards
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterShop, setFilterShop] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);

  const filteredWizards = wizards.filter(w => {
    const matchesSearch = w.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         w.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === '' || w.category === filterCategory;
    const matchesShop = filterShop === '' || (w as any).shop === filterShop || (filterShop === 'Global');

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
    setFilterCategory('');
    setFilterShop('');
    const catSelect = document.getElementById('category-filter') as HTMLSelectElement;
    const shopSelect = document.getElementById('shop-filter') as HTMLSelectElement;
    if (catSelect) catSelect.value = '';
    if (shopSelect) shopSelect.value = '';
  };

  const allSelected = filteredWizards.length > 0 && filteredWizards.every(w => selectedIds.has(w.id));

  // Deletion logic
  const selectedWizards = wizards.filter(w => selectedIds.has(w.id));
  const hasActiveSelected = selectedWizards.some(w => w.active);

  const handleDeleteConfirm = () => {
    onDeleteWizards(Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  const handleDeactivateConfirm = () => {
    onDeactivateWizards(Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  return (
    <div className="p-8 flex flex-col gap-8 h-full bg-[var(--background-secondary)] overflow-y-auto slick-scrollbar">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Wizard Builder Catalog</h1>
        <p className="text-[var(--text-subtle)] text-sm">Manage wizard templates for different categories and branches</p>
      </div>

      <div className="flex gap-12 items-start">
        <CatalogSidebar 
          searchTerm={searchTerm}
          showClear={searchTerm !== '' || filterCategory !== '' || filterShop !== ''}
          onSearch={setSearchTerm} 
          onCategoryChange={setFilterCategory}
          onShopChange={setFilterShop}
          onClear={clearFilters}
          onCreateNew={onCreateNew} 
        />

        <div className="flex-1 flex flex-col gap-4">
          <div className="flex items-center justify-between px-2 mb-2">
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
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsDeactivateModalOpen(true)}
                  className="text-[var(--text-subtle)] text-sm font-bold hover:text-[var(--text-primary)] transition-colors"
                >
                  Deactivate Wizards
                </button>
                <button 
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="text-[var(--text-error)] text-sm font-bold hover:underline"
                >
                  Delete Wizards
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {filteredWizards.map(wizard => (
              <WizardRow 
                key={wizard.id} 
                wizard={wizard} 
                selected={selectedIds.has(wizard.id)}
                onSelect={handleSelectOne}
                onEdit={onEditWizard} 
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
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={`Delete ${selectedIds.size} Wizard${selectedIds.size > 1 ? 's' : ''}?`}
        description="This action cannot be undone. All configuration and field data associated with these wizards will be permanently removed."
        confirmText="Delete Permanently"
        confirmVariant="danger"
        requireTypedConfirmation={hasActiveSelected}
        typedConfirmationWord="delete"
        warningMessage={hasActiveSelected ? "Warning: Some of the selected wizards are currently ACTIVE and associated with categories. Deleting them may impact live deal workflows." : undefined}
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
