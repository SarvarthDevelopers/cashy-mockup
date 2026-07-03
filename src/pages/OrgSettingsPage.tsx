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
  AlertTriangle,
  GitCommit,
  ArrowRight,
  Lock
} from 'lucide-react';
import { useToast } from '../components/Toast/useToast';
import { Button } from '../components/Button/Button';
import { Input } from '../components/Input/Input';
import { ShopLabel } from '../components/Card/ShopLabel';
import { Tooltip } from '../components/Tooltip/Tooltip';
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

import {
  getWorkflowGates,
  saveWorkflowGates,
  ALL_DEAL_STATUSES,
  type WorkflowGate
} from '../data/workflowGates';

type TabId = 'business-areas' | 'branch-colors' | 'workflow-gates';

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

  // Deal Checkpoints State
  const [gates, setGates] = useState<WorkflowGate[]>(() => getWorkflowGates());
  const [editingGate, setEditingGate] = useState<WorkflowGate | null>(null);
  const [isGateDrawerOpen, setIsGateDrawerOpen] = useState(false);
  const [gateName, setGateName] = useState('');
  const [gateTriggers, setGateTriggers] = useState<string[]>([]);
  const [gateTitle, setGateTitle] = useState('');
  const [gateDescription, setGateDescription] = useState('');
  const [gateButtonText, setGateButtonText] = useState('');
  const [gateFormError, setGateFormError] = useState('');

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
    const handleGatesUpdate = () => {
      setGates(getWorkflowGates());
    };

    window.addEventListener('cashy_business_areas_updated', handleAreasUpdate as EventListener);
    window.addEventListener('cashy_branch_colors_updated', handleColorsUpdate as EventListener);
    window.addEventListener('cashy_workflow_gates_updated', handleGatesUpdate as EventListener);

    return () => {
      window.removeEventListener('cashy_business_areas_updated', handleAreasUpdate as EventListener);
      window.removeEventListener('cashy_branch_colors_updated', handleColorsUpdate as EventListener);
      window.removeEventListener('cashy_workflow_gates_updated', handleGatesUpdate as EventListener);
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

  // --- Deal Checkpoints Logic ---
  const openCreateGateDrawer = () => {
    setEditingGate(null);
    setGateName('');
    setGateTriggers([]);
    setGateTitle('');
    setGateDescription('');
    setGateButtonText('');
    setGateFormError('');
    setIsGateDrawerOpen(true);
  };

  const openEditGateDrawer = (gate: WorkflowGate) => {
    setEditingGate(gate);
    setGateName(gate.name);
    setGateTriggers([...gate.triggers]);
    setGateTitle(gate.title);
    setGateDescription(gate.description);
    setGateButtonText(gate.buttonText);
    setGateFormError('');
    setIsGateDrawerOpen(true);
  };

  const handleSaveGate = () => {
    if (!gateName.trim()) {
      setGateFormError('Please enter a checkpoint name.');
      return;
    }
    if (gateTriggers.length === 0) {
      setGateFormError('Please select at least one deal status trigger.');
      return;
    }
    if (!gateTitle.trim()) {
      setGateFormError('Please enter a staff modal title.');
      return;
    }
    if (!gateDescription.trim()) {
      setGateFormError('Please enter a staff modal description.');
      return;
    }
    if (!gateButtonText.trim()) {
      setGateFormError('Please enter a button label.');
      return;
    }

    const newGateId = editingGate?.id || `GATE-${Date.now()}`;
    const newGate: WorkflowGate = {
      id: newGateId,
      name: gateName.trim(),
      triggers: gateTriggers,
      title: gateTitle.trim(),
      description: gateDescription.trim(),
      buttonText: gateButtonText.trim(),
      system: editingGate?.system || false
    };

    let updatedGates = [...gates];

    if (editingGate) {
      updatedGates = updatedGates.map(g => g.id === editingGate.id ? newGate : g);
    } else {
      updatedGates.push(newGate);
    }

    saveWorkflowGates(updatedGates);
    setGates(updatedGates);
    setIsGateDrawerOpen(false);
    showToast(`Deal Checkpoint "${newGate.name}" saved successfully!`, 'success');
  };

  const handleDeleteGate = (gateId: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the deal checkpoint "${name}"? Steps mapped to this checkpoint in the Deal Wizard Builder will revert to default behavior.`)) {
      const updatedGates = gates.filter(g => g.id !== gateId);
      saveWorkflowGates(updatedGates);
      setGates(updatedGates);
      showToast(`Deal Checkpoint "${name}" deleted.`, 'info');
    }
  };

  const handleToggleTriggerStatus = (status: string) => {
    setGateTriggers(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status) 
        : [...prev, status]
    );
    setGateFormError('');
  };

  // --- Inline Rendering Helpers for High Density Tables ---
  
  const renderBusinessAreasTable = () => {
    if (areas.length === 0) {
      return (
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
      );
    }

    return (
      <div className="border border-[var(--border-subtle)] rounded-lg overflow-hidden bg-[var(--background-primary)]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--border-subtle)] bg-[var(--background-secondary)]/50">
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-[var(--text-subtlest)] w-1/4">Business Area</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-[var(--text-subtlest)] w-2/3">Mapped Categories</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-[var(--text-subtlest)] text-right w-1/12">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtlest)]">
            {areas.map(area => (
              <tr key={area.id} className="hover:bg-[var(--background-hover)] transition-colors group">
                <td className="p-4 align-top">
                  <div className="font-semibold text-sm text-[var(--text-primary)]">{area.name}</div>
                  <div className="text-xs text-[var(--text-subtlest)] mt-1">
                    {area.categories.length} {area.categories.length === 1 ? 'category' : 'categories'} assigned
                  </div>
                </td>
                <td className="p-4 align-top">
                  {area.categories.length === 0 ? (
                    <span className="text-xs text-[var(--text-placeholder)] italic">No categories assigned</span>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {area.categories.map(cat => (
                        <span 
                          key={cat}
                          className="px-2.5 py-1 bg-[var(--background-secondary)] border border-[var(--border-subtlest)] text-xs font-medium rounded-lg text-[var(--text-subtle)] flex items-center gap-1.5 shadow-2xs"
                          title={cat}
                        >
                          <span>{CATEGORY_DISPLAY_NAMES[cat] || cat}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </td>
                <td className="p-4 align-middle text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                    <Tooltip content="Edit business area" side="top">
                      <button
                        onClick={() => openEditDrawer(area)}
                        className="p-1.5 hover:bg-[var(--background-secondary-hover)] text-[var(--text-subtle)] hover:text-[#4649e5] rounded cursor-pointer border-none bg-transparent"
                      >
                        <Edit3 size={15} />
                      </button>
                    </Tooltip>
                    <Tooltip content="Delete business area" side="top">
                      <button
                        onClick={() => handleDeleteArea(area.id, area.name)}
                        className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded cursor-pointer border-none bg-transparent"
                      >
                        <Trash2 size={15} />
                      </button>
                    </Tooltip>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderBranchColorsTable = () => {
    if (filteredBranches.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-12 bg-[var(--background-secondary)]/30 rounded-xl border border-dashed border-[var(--border-subtle)] min-h-[300px]">
          <Palette className="text-[var(--text-placeholder)] mb-4" size={36} />
          <h3 className="text-lg font-black text-[var(--text-primary)] mb-1.5">No Shops Found</h3>
          <p className="text-sm text-[var(--text-placeholder)]">
            No branch matches your search term. Try another query.
          </p>
        </div>
      );
    }

    return (
      <div className="border border-[var(--border-subtle)] rounded-lg overflow-hidden bg-[var(--background-primary)]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--border-subtle)] bg-[var(--background-secondary)]/50">
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-[var(--text-subtlest)] w-1/4">Shop / Branch</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-[var(--text-subtlest)] w-1/4">Badge Preview</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-[var(--text-subtlest)] w-1/3">Customize Highlight Color</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-[var(--text-subtlest)] text-right w-1/6">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtlest)]">
            {filteredBranches.map(branchName => {
              const activeColor = branchColors[branchName];
              const country = getCountryForBranch(branchName);
              return (
                <tr key={branchName} className="hover:bg-[var(--background-hover)] transition-colors group">
                  <td className="p-4 align-middle">
                    <div className="font-semibold text-sm text-[var(--text-primary)]">{branchName}</div>
                    <div className="text-xs text-[var(--text-subtlest)] mt-0.5">
                      {country === 'AT' ? 'Austria Region' : 'Germany Region'}
                    </div>
                  </td>
                  <td className="p-4 align-middle">
                    <div className="w-fit">
                      <ShopLabel branch={branchName} country={country} />
                    </div>
                  </td>
                  <td className="p-4 align-middle">
                    <div className="flex items-center gap-2">
                      {PASTEL_COLORS.map(colorOpt => {
                        const isActive = activeColor === colorOpt.value;
                        return (
                          <button
                            key={colorOpt.value}
                            onClick={() => handleColorSelect(branchName, colorOpt.value)}
                            title={colorOpt.label}
                            className={`w-6 h-6 rounded-[6px] border transition-all hover:scale-110 cursor-pointer flex items-center justify-center ${
                              isActive ? 'border-[var(--border-brand)] ring-1 ring-[var(--border-brand)]/30' : 'border-[var(--border-subtle)]'
                            }`}
                            style={{ backgroundColor: colorOpt.bg }}
                            aria-label={`Set ${colorOpt.label}`}
                          >
                            {isActive && (
                              <Check size={12} style={{ color: '#111827' }} strokeWidth={3.5} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                  <td className="p-4 align-middle text-right">
                    {activeColor && (
                      <button
                        onClick={() => handleResetBranch(branchName)}
                        className="text-xs font-bold text-[var(--text-subtlest)] hover:text-red-500 transition-colors border-none bg-transparent cursor-pointer opacity-0 group-hover:opacity-100 focus-within:opacity-100"
                      >
                        Reset
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderWorkflowGatesTable = () => {
    if (gates.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-12 bg-[var(--background-secondary)]/30 rounded-xl border border-dashed border-[var(--border-subtle)] min-h-[300px]">
          <GitCommit className="text-[var(--text-placeholder)] mb-4" size={36} />
          <h3 className="text-lg font-black text-[var(--text-primary)] mb-1.5">No Deal Checkpoints Configured</h3>
          <p className="text-sm text-[var(--text-placeholder)] max-w-xs mb-6">
            Create your first Deal Checkpoint to assign to Deal Wizard stages.
          </p>
          <button
            onClick={openCreateGateDrawer}
            className="px-5 py-2.5 bg-[var(--background-brand-solid)] text-white text-sm font-bold rounded-lg cursor-pointer"
          >
            Create Checkpoint
          </button>
        </div>
      );
    }

    return (
      <div className="border border-[var(--border-subtle)] rounded-lg overflow-hidden bg-[var(--background-primary)]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--border-subtle)] bg-[var(--background-secondary)]/50">
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-[var(--text-subtlest)] w-1/3">Deal Checkpoint</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-[var(--text-subtlest)] w-1/2">Legacy Status Triggers Sequence</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-[var(--text-subtlest)] text-right w-1/6">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtlest)]">
            {gates.map(gate => (
              <tr key={gate.id} className="hover:bg-[var(--background-hover)] transition-colors group">
                <td className="p-4 align-top">
                  <div className="font-semibold text-sm text-[var(--text-primary)]">{gate.name}</div>
                  <div className="text-[11px] text-[var(--text-subtlest)] mt-1">
                    ID: <code className="font-mono bg-[var(--background-secondary)] px-1 py-0.5 rounded text-[10px] text-[var(--text-subtle)]">{gate.id}</code>
                  </div>
                </td>
                <td className="p-4 align-top">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {gate.triggers.map((trig, idx) => (
                      <React.Fragment key={trig}>
                        {idx > 0 && <ArrowRight size={12} className="text-[var(--text-placeholder)]" />}
                        <span className="px-2 py-0.5 bg-[var(--background-primary)] border border-[var(--border-subtle)] text-xs font-medium rounded text-[var(--text-subtle)] shadow-2xs">
                          {trig}
                        </span>
                      </React.Fragment>
                    ))}
                  </div>
                </td>
                <td className="p-4 align-middle text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                    <Tooltip content="Edit deal checkpoint" side="top">
                      <button
                        onClick={() => openEditGateDrawer(gate)}
                        className="p-1.5 hover:bg-[var(--background-secondary-hover)] text-[var(--text-subtle)] hover:text-[#4649e5] rounded cursor-pointer border-none bg-transparent"
                      >
                        <Edit3 size={15} />
                      </button>
                    </Tooltip>
                    <Tooltip content="Delete deal checkpoint" side="top">
                      <button
                        onClick={() => handleDeleteGate(gate.id, gate.name)}
                        className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded cursor-pointer border-none bg-transparent"
                      >
                        <Trash2 size={15} />
                      </button>
                    </Tooltip>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
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
      
      {/* Header section */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Organization Settings</h1>
        <p className="text-[var(--text-subtle)] text-sm font-medium">
          Configure your organization's business hierarchies, appraisal routes, and visual branding tags
        </p>
      </div>

      {/* Main layout */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-start">
        
        {/* Navigation Sidebar Selector */}
        <div className="w-full md:w-[240px] shrink-0 flex flex-col gap-4 md:sticky md:top-8">
          
          {/* Desktop Side Nav Tab Buttons */}
          <div className="hidden md:flex w-full flex-col gap-1 overflow-hidden h-fit">
             <button
              onClick={() => setActiveTab('business-areas')}
              className={`w-full text-left py-2.5 px-3 flex items-center justify-between rounded-lg transition-all cursor-pointer focus:outline-none border ${
                activeTab === 'business-areas'
                  ? 'bg-[var(--background-primary)] border-[var(--border-subtle)] text-[var(--text-brand)] font-semibold shadow-2xs hover:border-[var(--border-brand)]'
                  : 'bg-transparent border-transparent text-[var(--text-subtle)] font-medium hover:bg-white/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Layers className={`size-4 ${activeTab === 'business-areas' ? 'text-[var(--text-brand)]' : 'text-[var(--text-subtle)]'}`} />
                <span className="text-sm">Business Areas</span>
              </div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                activeTab === 'business-areas' ? 'bg-[var(--background-brand-solid)] text-white' : 'bg-[var(--background-secondary-hover)] text-[var(--text-subtle)]'
              }`}>
                {areas.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('branch-colors')}
              className={`w-full text-left py-2.5 px-3 flex items-center justify-between rounded-lg transition-all cursor-pointer focus:outline-none border ${
                activeTab === 'branch-colors'
                  ? 'bg-[var(--background-primary)] border-[var(--border-subtle)] text-[var(--text-brand)] font-semibold shadow-2xs hover:border-[var(--border-brand)]'
                  : 'bg-transparent border-transparent text-[var(--text-subtle)] font-medium hover:bg-white/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Palette className={`size-4 ${activeTab === 'branch-colors' ? 'text-[var(--text-brand)]' : 'text-[var(--text-subtle)]'}`} />
                <span className="text-sm">Branch Colors</span>
              </div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                activeTab === 'branch-colors' ? 'bg-[var(--background-brand-solid)] text-white' : 'bg-[var(--background-secondary-hover)] text-[var(--text-subtle)]'
              }`}>
                {ALL_BRANCHES_SHOPS.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('workflow-gates')}
              className={`w-full text-left py-2.5 px-3 flex items-center justify-between rounded-lg transition-all cursor-pointer focus:outline-none border ${
                activeTab === 'workflow-gates'
                  ? 'bg-[var(--background-primary)] border-[var(--border-subtle)] text-[var(--text-brand)] font-semibold shadow-2xs hover:border-[var(--border-brand)]'
                  : 'bg-transparent border-transparent text-[var(--text-subtle)] font-medium hover:bg-white/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <GitCommit className={`size-4 ${activeTab === 'workflow-gates' ? 'text-[var(--text-brand)]' : 'text-[var(--text-subtle)]'}`} />
                <span className="text-sm">Deal Checkpoints</span>
              </div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                activeTab === 'workflow-gates' ? 'bg-[var(--background-brand-solid)] text-white' : 'bg-[var(--background-secondary-hover)] text-[var(--text-subtle)]'
              }`}>
                {gates.length}
              </span>
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
              Branch Colors
            </button>
            <button
              onClick={() => setActiveTab('workflow-gates')}
              className={`flex-1 text-center py-2.5 px-2 rounded-[6px] text-xs font-bold transition-all cursor-pointer border-none ${
                activeTab === 'workflow-gates'
                  ? 'bg-[var(--background-brand-solid)] text-white'
                  : 'text-[var(--text-subtle)] hover:bg-[var(--background-secondary-hover)] bg-transparent'
              }`}
            >
              Deal Checkpoints
            </button>
          </div>

        </div>

        {/* Content Panel Area */}
        <div className="flex-1 w-full bg-[var(--background-primary)] border border-[var(--border-subtle)] rounded-xl p-6 shadow-xs">
          
          {activeTab === 'business-areas' ? (
            <div className="space-y-6">
              
              {/* Panel Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtlest)]">
                <div>
                  <h2 className="text-xl font-extrabold text-[var(--text-primary)]">Business Areas</h2>
                  <p className="text-xs text-[var(--text-subtle)] mt-1 font-medium">
                    Define logical partitions for dealing appraisal scopes.
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={handleResetAreasDefaults}
                    className="h-9 px-3 border border-[var(--border-subtle)] bg-[var(--background-primary)] hover:bg-[var(--background-secondary-hover)] text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer text-[var(--text-subtle)] shadow-2xs"
                  >
                    <RefreshCw size={13} className="text-[var(--text-placeholder)]" />
                    Reset Defaults
                  </button>
                  <button
                    onClick={openCreateDrawer}
                    className="h-9 px-4 bg-[var(--background-brand-solid)] hover:bg-[var(--background-brand-solid-hover)] text-white text-xs font-extrabold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    <Plus size={14} />
                    Create Area
                  </button>
                </div>
              </div>

              {renderBusinessAreasTable()}

            </div>
          ) : activeTab === 'branch-colors' ? (
            <div className="space-y-6">

              {/* Panel Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtlest)]">
                <div>
                  <h2 className="text-xl font-extrabold text-[var(--text-primary)]">Branch Colors</h2>
                  <p className="text-xs text-[var(--text-subtle)] mt-1 font-medium">
                    Configure badge highlight colors assigned to shops and branches.
                  </p>
                </div>
                <div>
                  <button
                    onClick={handleResetAllColors}
                    disabled={Object.keys(branchColors).length === 0}
                    className="h-9 px-3 border border-[var(--border-subtle)] bg-[var(--background-primary)] hover:bg-[var(--background-secondary-hover)] disabled:opacity-40 disabled:pointer-events-none text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer text-[var(--text-subtle)] shadow-2xs"
                  >
                    <RefreshCw size={13} className="text-[var(--text-placeholder)]" />
                    Reset All Colors
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative w-full max-w-sm">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[var(--text-placeholder)]">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  placeholder="Search shops or branches..."
                  value={branchSearchQuery}
                  onChange={(e) => setBranchSearchQuery(e.target.value)}
                  className="w-full h-9 pl-9 pr-4 bg-[var(--background-primary)] border border-[var(--border-subtle)] rounded-lg text-xs font-medium focus:outline-none focus:border-[var(--border-brand)] focus:ring-1 focus:ring-[var(--border-brand)]/20 transition-all text-[var(--text-primary)]"
                />
              </div>

              {renderBranchColorsTable()}

            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Panel Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtlest)]">
                <div>
                  <h2 className="text-xl font-extrabold text-[var(--text-primary)]">Deal Checkpoints</h2>
                  <p className="text-xs text-[var(--text-subtle)] mt-1 font-medium">
                    Map legacy backend status mutations to custom wizard checkpoints.
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={openCreateGateDrawer}
                    className="h-9 px-4 bg-[var(--background-brand-solid)] hover:bg-[var(--background-brand-solid-hover)] text-white text-xs font-extrabold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    <Plus size={14} />
                    Create Checkpoint
                  </button>
                </div>
              </div>

              {renderWorkflowGatesTable()}

            </div>
          )}

        </div>

      </div>

      {/* Slide-over drawer modal for Business Area edit forms */}
      {isDrawerOpen && activeTab === 'business-areas' && (
        <div className="fixed inset-0 z-[150] flex justify-end">
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
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

      {/* Slide-over drawer modal for Deal Checkpoint edit forms */}
      {isGateDrawerOpen && activeTab === 'workflow-gates' && (
        <div className="fixed inset-0 z-[150] flex justify-end font-['Inter',sans-serif]">
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
            onClick={() => setIsGateDrawerOpen(false)}
          />
          <div className="relative w-full max-w-xl bg-[var(--background-primary)] h-full shadow-lg flex flex-col overflow-hidden border-l border-[var(--border-subtle)] animate-in slide-in-from-right duration-300">
            
            {/* Drawer Header */}
            <div className="px-6 py-5 border-b border-[var(--border-subtle)] bg-[var(--background-secondary)]/60 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-[var(--text-primary)]">
                  {editingGate ? `Edit "${editingGate.name}"` : 'New Deal Checkpoint'}
                </h3>
                <p className="text-xs text-[var(--text-subtle)] font-medium mt-0.5">
                  Configure checkpoint triggers and staff modal appearance
                </p>
              </div>
              <button 
                onClick={() => setIsGateDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-white border border-[var(--border-subtle)] hover:bg-[var(--background-secondary-hover)] flex items-center justify-center text-[var(--text-subtlest)] hover:text-[var(--text-primary)] transition-all cursor-pointer border-none text-lg font-bold"
              >
                &times;
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 slick-scrollbar">
              {gateFormError && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3">
                  <AlertTriangle size={18} className="text-red-500 shrink-0" />
                  <span className="text-xs font-bold text-red-700">{gateFormError}</span>
                </div>
              )}

              {/* Checkpoint Name */}
              <div className="space-y-2">
                <Input 
                  label="Deal Checkpoint Name (Admin)" 
                  placeholder="e.g. Check In & Verify" 
                  value={gateName}
                  onChange={(e) => { setGateName(e.target.value); setGateFormError(''); }}
                  required
                />
              </div>

              {/* Status Triggers Checklist */}
              <div className="space-y-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-placeholder)]">Legacy Deal Status Triggers</span>
                  <p className="text-xs text-[var(--text-subtlest)] font-semibold mt-1 leading-relaxed">
                    Select one or more backend status updates triggered when staff unlocks this checkpoint.
                  </p>
                </div>
                
                <div className="border border-[var(--border-subtle)] rounded-xl overflow-hidden max-h-[200px] overflow-y-auto bg-gray-50/50 p-2 space-y-1 slick-scrollbar">
                  {ALL_DEAL_STATUSES.map(statusInfo => {
                    const isChecked = gateTriggers.includes(statusInfo.status);
                    return (
                      <div 
                        key={statusInfo.status}
                        onClick={() => handleToggleTriggerStatus(statusInfo.status)}
                        className={`
                          p-3 rounded-lg border transition-all cursor-pointer flex items-start gap-3
                          ${isChecked 
                            ? 'bg-white border-[var(--border-brand)] shadow-xs' 
                            : 'bg-transparent border-transparent hover:bg-gray-100'}
                        `}
                      >
                        <input 
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // Handled by div click
                          className="mt-1 accent-[#4649e5] pointer-events-none"
                        />
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-gray-900">{statusInfo.status}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                              statusInfo.type === 'Manual' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                            }`}>
                              {statusInfo.type}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400 font-medium leading-relaxed">
                            {statusInfo.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gray-100 my-4" />

              {/* Staff Modal Settings */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-placeholder)]">Staff-Facing Modal Presentation</span>
                <p className="text-xs text-[var(--text-subtlest)] font-semibold mt-1 mb-4 leading-relaxed">
                  Customize the message and button text shown in the Deal Wizard modal.
                </p>
                
                <div className="space-y-4">
                  <Input 
                    label="Staff Card Title" 
                    placeholder="e.g. Verify & Unlock Gate" 
                    value={gateTitle}
                    onChange={(e) => { setGateTitle(e.target.value); setGateFormError(''); }}
                    required
                  />

                  <div className="space-y-1.5">
                    <label className="text-[13px] font-bold text-[var(--text-subtle)]">Staff Modal Description</label>
                    <textarea 
                      rows={3}
                      placeholder="Explain to staff what this checkpoint verifies and transitions..."
                      value={gateDescription}
                      onChange={(e) => { setGateDescription(e.target.value); setGateFormError(''); }}
                      className="w-full p-3 bg-[var(--background-primary)] border border-[var(--border-subtle)] rounded-lg text-sm focus:outline-none focus:border-[var(--border-brand)] focus:ring-2 focus:ring-[var(--border-brand)]/20 transition-all text-[var(--text-primary)] resize-none"
                    />
                  </div>

                  <Input 
                    label="Button Text Label" 
                    placeholder="e.g. Unlock Checkpoint" 
                    value={gateButtonText}
                    onChange={(e) => { setGateButtonText(e.target.value); setGateFormError(''); }}
                    required
                  />
                </div>
              </div>

              {/* Live Staff Interface Preview Section */}
              <div className="border border-[var(--border-subtle)] rounded-xl p-4 bg-[var(--background-secondary)]/50 mt-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-placeholder)] block mb-3">Live Staff Interface Preview</span>
                <div className="rounded-lg p-4 border border-[var(--border-subtle)] bg-[var(--background-primary)] text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[var(--background-brand-subtle)] text-[var(--text-brand)] flex items-center justify-center shrink-0 mt-0.5">
                      <Lock size={13} />
                    </div>
                    <div>
                      <h4 className="text-[12px] font-bold text-[var(--text-primary)] m-0">{gateTitle || 'Verify & Unlock Checkpoint'}</h4>
                      <p className="text-[11px] text-[var(--text-subtle)] mt-0.5 mb-0 leading-relaxed max-w-sm">
                        {gateDescription || 'Explain to staff what this checkpoint verifies and transitions...'}
                      </p>
                    </div>
                  </div>
                  <button className="h-8 px-4 text-[11px] font-bold text-white bg-[var(--background-brand-solid)] hover:bg-[var(--background-brand-solid-hover)] transition-colors rounded-lg shrink-0 border-none self-end sm:self-center">
                    {gateButtonText || 'Unlock Checkpoint'}
                  </button>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-6 border-t border-[var(--border-subtle)] bg-[var(--background-secondary)]/40 flex items-center gap-3 shrink-0">
              <Button 
                variant="secondary" 
                onClick={() => setIsGateDrawerOpen(false)}
                className="flex-1 font-bold h-11 rounded-xl text-sm"
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleSaveGate}
                className="flex-1 font-extrabold h-11 bg-[#4649e5] border-none text-white hover:bg-[#3b3ec3] rounded-xl text-sm"
              >
                {editingGate ? 'Save Changes' : 'Create Checkpoint'}
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
