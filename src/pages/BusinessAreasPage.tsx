import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Edit3, 
  RefreshCw, 
  AlertTriangle, 
  Info,
  FolderPlus,
  Sparkles
} from 'lucide-react';
import { useToast } from '../components/Toast/useToast';
import { Button } from '../components/Button/Button';
import { Input } from '../components/Input/Input';
import { 
  getBusinessAreas, 
  saveBusinessAreas, 
  DEFAULT_BUSINESS_AREAS, 
  CATEGORY_DISPLAY_NAMES,
  type BusinessArea
} from '../data/businessAreaMapping';
import { CategoryTreeCheckbox } from '../components/CategoryTree/CategoryTreeCheckbox';

export const BusinessAreasPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [areas, setAreas] = useState<BusinessArea[]>(() => getBusinessAreas());
  const [editingArea, setEditingArea] = useState<BusinessArea | null>(null);
  
  // Drawer form state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formCategories, setFormCategories] = useState<string[]>([]);
  const [formError, setFormError] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Sync state with local storage updates
  useEffect(() => {
    const handleStorageUpdate = () => {
      setAreas(getBusinessAreas());
    };
    window.addEventListener('cashy_business_areas_updated', handleStorageUpdate as EventListener);
    return () => window.removeEventListener('cashy_business_areas_updated', handleStorageUpdate as EventListener);
  }, []);

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

  const handleSave = () => {
    if (!formName.trim()) {
      setFormError('Please enter a business area name.');
      return;
    }

    const newAreaId = editingArea?.id || `ba-${Date.now()}`;
    
    // Build the new/updated area object
    const newArea: BusinessArea = {
      id: newAreaId,
      name: formName.trim(),
      categories: formCategories
    };

    let updatedAreas = [...areas];

    if (editingArea) {
      // Re-map category allocations to ensure exclusivity:
      // Remove newly assigned categories from all other business areas
      updatedAreas = updatedAreas.map(area => {
        if (area.id === editingArea.id) return newArea;
        return {
          ...area,
          categories: area.categories.filter(cat => !formCategories.includes(cat))
        };
      });
    } else {
      // Add new business area
      // Remove newly assigned categories from all other business areas
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

  const handleDelete = (areaId: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the business area "${name}"? Categories in this area will become unassigned.`)) {
      const updatedAreas = areas.filter(a => a.id !== areaId);
      saveBusinessAreas(updatedAreas);
      setAreas(updatedAreas);
      showToast(`Business Area "${name}" deleted.`, 'info');
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all business areas back to system defaults? Any custom business areas will be deleted.')) {
      saveBusinessAreas(DEFAULT_BUSINESS_AREAS);
      setAreas(DEFAULT_BUSINESS_AREAS);
      showToast('Settings reset to system defaults.', 'info');
    }
  };

  // Memoized conflict mapping dictionary
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

  if (isLoading) {
    return (
      <div className="bg-[var(--background-secondary)] min-h-full w-full overflow-y-auto font-['Inter',sans-serif] px-4 py-8 md:px-10 md:py-10 relative animate-pulse select-none">
        <div className="max-w-6xl mx-auto flex flex-col gap-8 pb-16">
          {/* Header strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-white border border-[var(--border-subtle)] rounded-2xl shrink-0" />
              <div className="space-y-2">
                <div className="h-3 w-20 bg-gray-200 rounded" />
                <div className="h-7 w-48 bg-gray-200 rounded" />
                <div className="h-4 w-96 bg-gray-200 rounded" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-11 w-32 bg-white border border-[var(--border-subtle)] rounded-xl" />
              <div className="h-11 w-32 bg-white border border-[var(--border-subtle)] rounded-xl" />
            </div>
          </div>

          {/* Cards Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(idx => (
              <div key={idx} className="bg-white border border-[var(--border-subtle)] rounded-2xl h-80 p-6 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="h-6 w-32 bg-gray-200 rounded" />
                  <div className="h-4 w-20 bg-gray-200 rounded" />
                </div>
                <div className="space-y-2 flex-1 mt-6">
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                  <div className="h-10 w-full bg-gray-50 border border-gray-100 rounded-xl" />
                  <div className="h-10 w-full bg-gray-50 border border-gray-100 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--background-secondary)] min-h-full w-full overflow-y-auto font-['Inter',sans-serif] px-4 py-8 md:px-10 md:py-10 relative animate-in fade-in duration-500">
      <div className="max-w-6xl mx-auto flex flex-col gap-8 pb-16">
        
        {/* Header strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <button
              onClick={() => navigate(-1)}
              className="p-3 bg-[var(--background-primary)] border border-[var(--border-subtle)] hover:bg-[var(--background-secondary-hover)] rounded-2xl transition-all cursor-pointer text-[var(--text-primary)] hover:scale-105 active:scale-95 shadow-sm"
              aria-label="Go Back"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--text-placeholder)] mb-0.5">Control Center</span>
                <span className="text-white bg-blue-500 rounded-full p-0.5"><Sparkles size={8} /></span>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-[var(--text-primary)]">Business Areas</h1>
              <p className="text-[13px] text-[var(--text-subtlest)] mt-1 font-medium max-w-xl leading-relaxed">
                Organize categories into Business Area folders to dynamically evaluate logic and deal configurations across the platform.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleResetDefaults}
              className="h-11 px-5 border border-[var(--border-subtle)] bg-[var(--background-primary)] hover:bg-[var(--background-secondary-hover)] text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer text-[var(--text-subtle)] shadow-sm hover:scale-102 active:scale-98"
            >
              <RefreshCw size={14} className="text-[var(--text-placeholder)]" />
              Reset Defaults
            </button>
            <button
              onClick={openCreateDrawer}
              className="h-11 px-6 bg-[#4649e5] hover:bg-[#3b3ec3] text-white text-xs font-extrabold rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-md hover:scale-102 active:scale-98"
            >
              <Plus size={16} />
              Create Area
            </button>
          </div>
        </div>

        {/* Business Areas Cards Grid */}
        {areas.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-12 bg-[var(--background-primary)] rounded-3xl border border-dashed border-[var(--border-subtle)] min-h-[320px] shadow-sm animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-[var(--background-secondary)] rounded-full flex items-center justify-center mb-5 border border-[var(--border-subtlest)]">
              <FolderPlus className="text-[var(--text-placeholder)] animate-pulse" size={24} />
            </div>
            <h3 className="text-lg font-black text-[var(--text-primary)] mb-1.5">No Business Areas Configured</h3>
            <p className="text-[13px] text-[var(--text-subtlest)] max-w-xs leading-relaxed mb-6">
              Create your first Business Area to group category codes together for deal appraisal mapping.
            </p>
            <button
              onClick={openCreateDrawer}
              className="px-5 py-2.5 bg-[#4649e5] hover:bg-[#3b3ec3] text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Plus size={14} /> Create Business Area
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {areas.map(area => (
              <div 
                key={area.id} 
                className="bg-[var(--background-primary)] border border-[var(--border-subtle)] rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex flex-col relative"
              >
                <div className="p-6 flex-1 flex flex-col gap-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-black text-[var(--text-primary)] leading-tight">{area.name}</h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-placeholder)] mt-1 block">
                        {area.categories.length} {area.categories.length === 1 ? 'category' : 'categories'} assigned
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditDrawer(area)}
                        className="p-2 hover:bg-[var(--background-secondary-hover)] text-[var(--text-subtle)] hover:text-[#4649e5] rounded-lg transition-colors cursor-pointer border-none bg-transparent"
                        title="Edit Area"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(area.id, area.name)}
                        className="p-2 hover:bg-red-50 text-[var(--text-subtlest)] hover:text-red-500 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
                        title="Delete Area"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col gap-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-[var(--text-placeholder)]">Mapped Categories</span>
                    {area.categories.length === 0 ? (
                      <div className="py-5 px-4 bg-[var(--background-secondary)]/50 rounded-xl border border-dashed border-[var(--border-subtle)] flex items-center justify-center gap-2">
                        <Info size={13} className="text-[var(--text-placeholder)]" />
                        <span className="text-[11px] text-[var(--text-placeholder)] font-semibold italic">No categories assigned</span>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2.5">
                        {area.categories.map(cat => (
                          <div 
                            key={cat} 
                            className="flex flex-col px-3.5 py-2.5 bg-[var(--background-secondary)]/40 hover:bg-[var(--background-secondary-hover)] rounded-xl border border-[var(--border-subtlest)] transition-colors"
                          >
                            <span className="text-xs font-bold text-[var(--text-primary)]">{CATEGORY_DISPLAY_NAMES[cat] || cat}</span>
                            <span className="text-[9px] font-semibold text-[var(--text-placeholder)] font-mono mt-0.5">{cat}</span>
                          </div>
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

      {/* Dynamic Slide-over drawer (Apple modal) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-[150] flex justify-end">
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-black/45 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Panel Container */}
          <div className="relative w-full max-w-lg bg-[var(--background-primary)] h-full shadow-[0_0_40px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden border-l border-[var(--border-subtle)] animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="px-6 py-5 border-b border-[var(--border-subtle)] bg-[var(--background-secondary)]/60 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-[var(--text-primary)]">
                  {editingArea ? `Edit "${editingArea.name}"` : 'New Business Area'}
                </h3>
                <p className="text-xs text-[var(--text-subtlest)] font-semibold mt-0.5">
                  Configure business area metadata and category maps
                </p>
              </div>
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-white border border-[var(--border-subtle)] hover:bg-[var(--background-secondary-hover)] flex items-center justify-center text-[var(--text-subtlest)] hover:text-[var(--text-primary)] transition-all cursor-pointer shadow-xs active:scale-95 border-none"
              >
                &times;
              </button>
            </div>

            {/* Content Form */}
            <div className="flex-1 overflow-y-auto p-6 space-y-7 slick-scrollbar">
              
              {formError && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 animate-in shake duration-300">
                  <AlertTriangle size={18} className="text-red-500 shrink-0" />
                  <span className="text-xs font-bold text-red-700">{formError}</span>
                </div>
              )}

              {/* Area Name Input */}
              <div className="space-y-2">
                <Input 
                  label="Business Area Name" 
                  placeholder="e.g. Fine Jewelry" 
                  value={formName}
                  onChange={(e) => { setFormName(e.target.value); setFormError(''); }}
                  required
                />
              </div>

              {/* Category assignment mapping list (Tree checkboxes) */}
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-[var(--text-placeholder)]">Category Association Maps</span>
                  <p className="text-[11px] text-[var(--text-subtlest)] font-semibold mt-1 leading-relaxed">
                    Select the category paths that will be routed to this business area. Categories mapped elsewhere will display warning markers and reassign automatically.
                  </p>
                </div>

                <CategoryTreeCheckbox
                  selectedPaths={formCategories}
                  onChange={setFormCategories}
                  warningMap={warningMap}
                />
              </div>

            </div>

            {/* Footer Buttons */}
            <div className="p-6 border-t border-[var(--border-subtle)] bg-[var(--background-secondary)]/40 flex items-center gap-3 shrink-0">
              <Button 
                variant="secondary" 
                onClick={() => setIsDrawerOpen(false)}
                className="flex-1 font-bold h-11 rounded-xl"
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleSave}
                className="flex-1 font-extrabold h-11 bg-[#4649e5] border-none text-white hover:bg-[#3b3ec3] rounded-xl"
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
