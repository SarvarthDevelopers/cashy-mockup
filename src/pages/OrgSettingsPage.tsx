import React, { useState, useEffect, useMemo } from 'react';
import { 
  RefreshCw, 
  Search,
  Check,
  Palette,
  Layers,
  Plus,
  Trash2,
  Edit3,
  FolderPlus,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '../components/Toast/useToast';
import { Button } from '../components/Button/Button';
import { Input } from '../components/Input/Input';
import { ShopLabel } from '../components/Card/ShopLabel';
import { CategoryTreeCheckbox } from '../components/CategoryTree/CategoryTreeCheckbox';

// Data layers
import { 
  getBusinessAreas, 
  saveBusinessAreas, 
  DEFAULT_BUSINESS_AREAS, 
  CATEGORY_DISPLAY_NAMES,
  type BusinessArea
} from '../data/businessAreaMapping';

import { 
  getBranchColors, 
  saveBranchColors, 
  PASTEL_COLORS, 
  ALL_BRANCHES_SHOPS, 
  type PastelColor 
} from '../data/branchColorMapping';

type TabId = 'business-areas' | 'branch-colors';

export const OrgSettingsPage: React.FC = () => {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<TabId>('business-areas');
  const [isLoading, setIsLoading] = useState(true);

  // Business Areas State
  const [areas, setAreas] = useState<BusinessArea[]>(() => getBusinessAreas());
  const [editingArea, setEditingArea] = useState<BusinessArea | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formCategories, setFormCategories] = useState<string[]>([]);
  const [formError, setFormError] = useState('');

  // Branch Colors State
  const [branchColors, setBranchColors] = useState<Record<string, PastelColor>>(() => getBranchColors());
  const [branchSearchQuery, setBranchSearchQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Listeners for localStorage sync
  useEffect(() => {
    const handleAreasUpdate = () => {
      setAreas(getBusinessAreas());
    };
    const handleColorsUpdate = () => {
      setBranchColors(getBranchColors());
    };

    window.addEventListener('cashy_business_areas_updated', handleAreasUpdate as EventListener);
    window.addEventListener('cashy_branch_colors_updated', handleColorsUpdate as EventListener);

    return () => {
      window.removeEventListener('cashy_business_areas_updated', handleAreasUpdate as EventListener);
      window.removeEventListener('cashy_branch_colors_updated', handleColorsUpdate as EventListener);
    };
  }, []);

  // --- Business Areas Logic ---
  const openCreateDrawer = () => {
    setEditingArea(null);
    setFormName('');
    setFormCategories([]);
    setFormError('');
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (area: BusinessArea) => {
    setEditingArea(area);
    setFormName(area.name);
    setFormCategories([...area.categories]);
    setFormError('');
    setIsDrawerOpen(true);
  };

  const handleSaveArea = () => {
    if (!formName.trim()) {
      setFormError('Please enter a business area name.');
      return;
    }

    const newAreaId = editingArea?.id || `ba-${Date.now()}`;
    const newArea: BusinessArea = {
      id: newAreaId,
      name: formName.trim(),
      categories: formCategories
    };

    let updatedAreas = [...areas];

    if (editingArea) {
      updatedAreas = updatedAreas.map(area => {
        if (area.id === editingArea.id) return newArea;
        return {
          ...area,
          categories: area.categories.filter(cat => !formCategories.includes(cat))
        };
      });
    } else {
      updatedAreas = updatedAreas.map(area => ({
        ...area,
        categories: area.categories.filter(cat => !formCategories.includes(cat))
      }));
      updatedAreas.push(newArea);
    }

    saveBusinessAreas(updatedAreas);
    setAreas(updatedAreas);
    setIsDrawerOpen(false);
    showToast(`Business Area "${newArea.name}" saved successfully!`, 'success');
  };

  const handleDeleteArea = (areaId: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the business area "${name}"? Categories in this area will become unassigned.`)) {
      const updatedAreas = areas.filter(a => a.id !== areaId);
      saveBusinessAreas(updatedAreas);
      setAreas(updatedAreas);
      showToast(`Business Area "${name}" deleted.`, 'info');
    }
  };

  const handleResetAreasDefaults = () => {
    if (window.confirm('Reset all business areas back to system defaults? Any custom business areas will be deleted.')) {
      saveBusinessAreas(DEFAULT_BUSINESS_AREAS);
      setAreas(DEFAULT_BUSINESS_AREAS);
      showToast('Settings reset to system defaults.', 'info');
    }
  };

  const warningMap = useMemo(() => {
    const map: Record<string, string> = {};
    areas.forEach(area => {
      if (!editingArea || area.id !== editingArea.id) {
        area.categories.forEach(cat => {
          map[cat] = area.name;
        });
      }
    });
    return map;
  }, [areas, editingArea]);

  // --- Branch Colors Logic ---
  const filteredBranches = useMemo(() => {
    const query = branchSearchQuery.trim().toLowerCase();
    if (!query) return ALL_BRANCHES_SHOPS;
    return ALL_BRANCHES_SHOPS.filter(name => name.toLowerCase().includes(query));
  }, [branchSearchQuery]);

  const handleColorSelect = (branch: string, color: PastelColor) => {
    const nextMappings = { ...branchColors, [branch]: color };
    saveBranchColors(nextMappings);
    setBranchColors(nextMappings);
    showToast(`Assigned ${color} badge color to "${branch}"`, 'success');
  };

  const handleResetBranch = (branch: string) => {
    if (branchColors[branch]) {
      const nextMappings = { ...branchColors };
      delete nextMappings[branch];
      saveBranchColors(nextMappings);
      setBranchColors(nextMappings);
      showToast(`Reverted "${branch}" to fallback color`, 'info');
    }
  };

  const handleResetAllColors = () => {
    if (window.confirm('Are you sure you want to reset all shop and branch badge colors back to their system defaults?')) {
      saveBranchColors({});
      setBranchColors({});
      showToast('All branch badge colors reset to defaults.', 'info');
    }
  };

  const getCountryForBranch = (branch: string) => {
    const lower = branch.toLowerCase();
    if (
      lower.includes('vienna') || 
      lower.includes('wien') || 
      lower.includes('graz') || 
      lower.includes('linz') || 
      lower.includes('salzburg') || 
      lower.includes('at')
    ) {
      return 'AT';
    }
    if (
      lower.includes('berlin') || 
      lower.includes('munich') || 
      lower.includes('hamburg') || 
      lower.includes('frankfurt') || 
      lower.includes('de')
    ) {
      return 'DE';
    }
    return 'AT';
  };

  if (isLoading) {
    return (
      <div className="p-8 flex flex-col gap-8 h-full bg-[var(--background-tertiary)] overflow-y-auto select-none animate-pulse">
        <div className="flex flex-col gap-1">
          <div className="h-8 w-60 bg-gray-250 rounded" />
          <div className="h-4 w-96 bg-gray-200 rounded mt-1" />
        </div>
        <div className="flex gap-12 items-start mt-4">
          <div className="w-[280px] shrink-0 h-48 bg-white border border-[var(--border-subtle)] rounded-[8px]" />
          <div className="flex-1 h-96 bg-white border border-[var(--border-subtle)] rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 flex flex-col gap-8 h-full bg-[var(--background-tertiary)] overflow-y-auto slick-scrollbar font-['Inter',sans-serif]">
      
      {/* Header section (reconstructed to match Wizard Builder Catalog layout) */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Organization Settings</h1>
        <p className="text-[var(--text-subtle)] text-sm">
          Configure your organization's business hierarchies, appraisal routes, and visual branding tags
        </p>
      </div>

      {/* Main layout matching Wizard Builder Catalog layout grid */}
      <div className="flex flex-col md:flex-row gap-4 items-start">
        
        {/* Navigation Sidebar Selector */}
        <div className="w-full md:w-[280px] shrink-0 flex flex-col gap-4 md:sticky md:top-8">
          
          {/* Desktop Side Nav Tab Buttons */}
          <div className="hidden md:flex w-full bg-[var(--background-primary)] border border-[var(--border-subtle)] rounded-[8px] flex-col overflow-hidden shadow-sm h-fit">
             <button
              onClick={() => setActiveTab('business-areas')}
              className={`w-full text-left p-4 flex items-start gap-3.5 transition-all cursor-pointer border-y-0 border-r-0 border-l-4 bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-brand)] focus-visible:ring-inset hover:bg-[var(--background-secondary-hover)] ${
                activeTab === 'business-areas'
                  ? 'bg-[var(--background-brand-subtle)] border-[var(--border-brand)] text-[var(--text-brand)]'
                  : 'border-transparent text-[var(--text-subtle)]'
              }`}
            >
              <Layers className={`size-5 mt-0.5 ${activeTab === 'business-areas' ? 'text-[var(--text-brand)]' : 'text-[var(--text-subtle)]'}`} />
              <div>
                <span className={`text-[14px] font-extrabold block ${activeTab === 'business-areas' ? 'text-[var(--text-brand)]' : 'text-[var(--text-primary)]'}`}>Business Areas</span>
                <span className="text-[11px] font-medium text-[var(--text-subtlest)] mt-1.5 block leading-relaxed">
                  Map category codes to route deals dynamically.
                </span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('branch-colors')}
              className={`w-full text-left p-4 flex items-start gap-3.5 transition-all cursor-pointer border-y-0 border-r-0 border-l-4 bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-brand)] focus-visible:ring-inset hover:bg-[var(--background-secondary-hover)] ${
                activeTab === 'branch-colors'
                  ? 'bg-[var(--background-brand-subtle)] border-[var(--border-brand)] text-[var(--text-brand)]'
                  : 'border-transparent text-[var(--text-subtle)]'
              }`}
            >
              <Palette className={`size-5 mt-0.5 ${activeTab === 'branch-colors' ? 'text-[var(--text-brand)]' : 'text-[var(--text-subtle)]'}`} />
              <div>
                <span className={`text-[14px] font-extrabold block ${activeTab === 'branch-colors' ? 'text-[var(--text-brand)]' : 'text-[var(--text-primary)]'}`}>Branch Badges</span>
                <span className="text-[11px] font-medium text-[var(--text-subtlest)] mt-1.5 block leading-relaxed">
                  Customize shop and branch tag highlights.
                </span>
              </div>
            </button>
          </div>

          {/* Mobile Navigation Dropdown/Tabs */}
          <div className="flex md:hidden bg-[var(--background-primary)] border border-[var(--border-subtle)] p-1.5 rounded-[8px] w-full gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('business-areas')}
              className={`flex-1 text-center py-2.5 px-2 rounded-[6px] text-xs font-bold transition-all cursor-pointer border-none ${
                activeTab === 'business-areas'
                  ? 'bg-[var(--background-brand-solid)] text-white'
                  : 'text-[var(--text-subtle)] hover:bg-[var(--background-secondary-hover)] bg-transparent'
              }`}
            >
              Business Areas
            </button>
            <button
              onClick={() => setActiveTab('branch-colors')}
              className={`flex-1 text-center py-2.5 px-2 rounded-[6px] text-xs font-bold transition-all cursor-pointer border-none ${
                activeTab === 'branch-colors'
                  ? 'bg-[var(--background-brand-solid)] text-white'
                  : 'text-[var(--text-subtle)] hover:bg-[var(--background-secondary-hover)] bg-transparent'
              }`}
            >
              Branch Badges
            </button>
          </div>

        </div>

        {/* Content Panel Area */}
        <div className="flex-1 w-full bg-[var(--background-primary)] border border-[var(--border-subtle)] rounded-xl p-8 shadow-sm">
          
          {activeTab === 'business-areas' ? (
            <div className="space-y-8">
              
              {/* Panel Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-[var(--border-subtlest)]">
                <div>
                  <h2 className="text-2xl font-extrabold text-[var(--text-primary)]">Business Areas</h2>
                  <p className="text-sm text-[var(--text-subtle)] mt-1 font-medium">
                    Define logical partitions for dealing appraisal scopes.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleResetAreasDefaults}
                    className="h-10 px-4 border border-[var(--border-subtle)] bg-[var(--background-primary)] hover:bg-[var(--background-secondary-hover)] text-sm font-bold rounded-lg flex items-center gap-2 transition-all cursor-pointer text-[var(--text-subtle)] shadow-xs"
                  >
                    <RefreshCw size={14} className="text-[var(--text-placeholder)]" />
                    Reset Defaults
                  </button>
                  <button
                    onClick={openCreateDrawer}
                    className="h-10 px-5 bg-[var(--background-brand-solid)] hover:bg-[var(--background-brand-solid-hover)] text-white text-sm font-extrabold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
                  >
                    <Plus size={16} />
                    Create Area
                  </button>
                </div>
              </div>

              {/* Cards Grid */}
              {areas.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center p-12 bg-[var(--background-secondary)]/30 rounded-xl border border-dashed border-[var(--border-subtle)] min-h-[300px]">
                  <FolderPlus className="text-[var(--text-placeholder)] mb-4" size={36} />
                  <h3 className="text-lg font-black text-[var(--text-primary)] mb-1.5">No Areas Configured</h3>
                  <p className="text-sm text-[var(--text-placeholder)] max-w-xs mb-6">
                    Create your first Business Area to assign appraisal scope filters.
                  </p>
                  <button
                    onClick={openCreateDrawer}
                    className="px-5 py-2.5 bg-[var(--background-brand-solid)] text-white text-sm font-bold rounded-lg cursor-pointer"
                  >
                    Create Area
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {areas.map(area => (
                    <div 
                      key={area.id}
                      className="bg-[var(--background-secondary)]/15 border border-[var(--border-subtle)] rounded-xl p-6 flex flex-col justify-between min-h-[240px] hover:border-gray-300 dark:hover:border-gray-700 transition-all shadow-xs"
                    >
                      <div className="space-y-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-extrabold text-xl text-[var(--text-primary)] leading-tight">{area.name}</h3>
                            <span className="text-xs font-semibold text-[var(--text-subtlest)] mt-1 block">
                              {area.categories.length} {area.categories.length === 1 ? 'category' : 'categories'} assigned
                            </span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => openEditDrawer(area)}
                              className="p-2 hover:bg-[var(--background-secondary-hover)] text-[var(--text-subtle)] hover:text-[#4649e5] rounded-lg cursor-pointer border-none bg-transparent"
                              title="Edit"
                            >
                              <Edit3 size={15} />
                            </button>
                            <button
                              onClick={() => handleDeleteArea(area.id, area.name)}
                              className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg cursor-pointer border-none bg-transparent"
                              title="Delete"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2.5">
                          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-placeholder)]">Mapped Categories</span>
                          {area.categories.length === 0 ? (
                            <p className="text-xs text-[var(--text-placeholder)] italic mt-1">No categories assigned</p>
                          ) : (
                            <div className="flex flex-wrap gap-2 pt-0.5">
                              {area.categories.map(cat => (
                                <span 
                                  key={cat}
                                  className="px-3.5 py-2 bg-white border border-[var(--border-subtle)] text-[13px] font-semibold rounded-lg text-[var(--text-primary)] flex items-center gap-1.5 shadow-xs"
                                  title={cat}
                                >
                                  <span>{CATEGORY_DISPLAY_NAMES[cat] || cat}</span>
                                  <span className="text-[10px] font-mono text-[var(--text-subtlest)]">({cat})</span>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          ) : (
            <div className="space-y-8">

              {/* Panel Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-[var(--border-subtlest)]">
                <div>
                  <h2 className="text-2xl font-extrabold text-[var(--text-primary)]">Branch Colors</h2>
                  <p className="text-sm text-[var(--text-subtle)] mt-1 font-medium">
                    Configure colors assigned to shops and branches.
                  </p>
                </div>
                <div>
                  <button
                    onClick={handleResetAllColors}
                    disabled={Object.keys(branchColors).length === 0}
                    className="h-10 px-4 border border-[var(--border-subtle)] bg-[var(--background-primary)] hover:bg-[var(--background-secondary-hover)] disabled:opacity-40 disabled:pointer-events-none text-sm font-bold rounded-lg flex items-center gap-2 transition-all cursor-pointer text-[var(--text-subtle)] shadow-xs"
                  >
                    <RefreshCw size={14} className="text-[var(--text-placeholder)]" />
                    Reset All Colors
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative w-full max-w-md">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-[var(--text-placeholder)]">
                  <Search size={18} />
                </span>
                <input
                  type="text"
                  placeholder="Search shops or branches..."
                  value={branchSearchQuery}
                  onChange={(e) => setBranchSearchQuery(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 bg-[var(--background-primary)] border border-[var(--border-subtle)] rounded-lg text-sm font-medium focus:outline-none focus:border-[var(--border-brand)] focus:ring-2 focus:ring-[var(--border-brand)]/20 transition-all text-[var(--text-primary)]"
                />
              </div>

              {/* Branch Grid */}
              {filteredBranches.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center p-12 bg-[var(--background-secondary)]/30 rounded-xl border border-dashed border-[var(--border-subtle)] min-h-[300px]">
                  <Palette className="text-[var(--text-placeholder)] mb-4" size={36} />
                  <h3 className="text-lg font-black text-[var(--text-primary)] mb-1.5">No Shops Found</h3>
                  <p className="text-sm text-[var(--text-placeholder)]">
                    No branch matches your search term. Try another query.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {filteredBranches.map(branchName => {
                    const activeColor = branchColors[branchName];
                    
                    return (
                      <div 
                        key={branchName}
                        className="bg-[var(--background-secondary)]/15 border border-[var(--border-subtle)] rounded-xl p-6 flex flex-col justify-between min-h-[180px] hover:border-gray-300 dark:hover:border-gray-700 transition-all shadow-xs"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-extrabold text-[18px] text-[var(--text-primary)] tracking-tight leading-tight">
                              {branchName}
                            </h3>
                            <p className="text-xs font-semibold text-[var(--text-placeholder)] mt-1.5">
                              {getCountryForBranch(branchName) === 'AT' ? 'Austria Branch' : 'Germany Branch'}
                            </p>
                          </div>
                          <div className="scale-[1.15] origin-top-right mr-2 mt-1">
                            <ShopLabel 
                              branch={branchName} 
                              country={getCountryForBranch(branchName)} 
                            />
                          </div>
                        </div>

                        <div className="mt-6">
                          <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-placeholder)] block mb-3">
                            Badge Color
                          </span>
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2 flex-wrap">
                              {PASTEL_COLORS.map(colorOpt => {
                                const isActive = activeColor === colorOpt.value;
                                
                                return (
                                  <button
                                    key={colorOpt.value}
                                    onClick={() => handleColorSelect(branchName, colorOpt.value)}
                                    title={colorOpt.label}
                                    className="w-6 h-6 rounded-full border border-gray-250 flex items-center justify-center transition-all hover:scale-115 cursor-pointer shadow-xs"
                                    style={{ backgroundColor: colorOpt.bg }}
                                    aria-label={`Set ${colorOpt.label}`}
                                  >
                                    {isActive && (
                                      <Check size={14} style={{ color: colorOpt.text }} strokeWidth={4} />
                                    )}
                                  </button>
                                );
                              })}
                            </div>

                            {activeColor && (
                              <button
                                onClick={() => handleResetBranch(branchName)}
                                className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors border-none bg-transparent cursor-pointer"
                                title="Reset color"
                              >
                                Reset
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

        </div>

      </div>

      {/* Slide-over drawer modal for Business Area edit forms */}
      {isDrawerOpen && activeTab === 'business-areas' && (
        <div className="fixed inset-0 z-[150] flex justify-end">
          <div 
            className="fixed inset-0 bg-black/45 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-[var(--background-primary)] h-full shadow-lg flex flex-col overflow-hidden border-l border-[var(--border-subtle)] animate-in slide-in-from-right duration-300">
            
            {/* Drawer Header */}
            <div className="px-6 py-5 border-b border-[var(--border-subtle)] bg-[var(--background-secondary)]/60 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-[var(--text-primary)]">
                  {editingArea ? `Edit "${editingArea.name}"` : 'New Business Area'}
                </h3>
                <p className="text-xs text-[var(--text-subtle)] font-medium mt-0.5">
                  Configure business area metadata and category maps
                </p>
              </div>
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-white border border-[var(--border-subtle)] hover:bg-[var(--background-secondary-hover)] flex items-center justify-center text-[var(--text-subtlest)] hover:text-[var(--text-primary)] transition-all cursor-pointer border-none text-lg font-bold"
              >
                &times;
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-7">
              {formError && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3">
                  <AlertTriangle size={18} className="text-red-500 shrink-0" />
                  <span className="text-xs font-bold text-red-700">{formError}</span>
                </div>
              )}

              <div className="space-y-2">
                <Input 
                  label="Business Area Name" 
                  placeholder="e.g. Fine Jewelry" 
                  value={formName}
                  onChange={(e) => { setFormName(e.target.value); setFormError(''); }}
                  required
                />
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-placeholder)]">Category Association Maps</span>
                  <p className="text-xs text-[var(--text-subtlest)] font-semibold mt-1 leading-relaxed">
                    Select the category paths mapped to this business area.
                  </p>
                </div>

                <CategoryTreeCheckbox
                  selectedPaths={formCategories}
                  onChange={setFormCategories}
                  warningMap={warningMap}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-[var(--border-subtle)] bg-[var(--background-secondary)]/40 flex items-center gap-3 shrink-0">
              <Button 
                variant="secondary" 
                onClick={() => setIsDrawerOpen(false)}
                className="flex-1 font-bold h-11 rounded-xl text-sm"
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleSaveArea}
                className="flex-1 font-extrabold h-11 bg-[#4649e5] border-none text-white hover:bg-[#3b3ec3] rounded-xl text-sm"
              >
                {editingArea ? 'Save Changes' : 'Create Area'}
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
