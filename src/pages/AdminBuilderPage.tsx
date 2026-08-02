import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { DealWizardBuilder } from '../components/WizardBuilderAdmin/DealWizardBuilder';
import { WizardBuilderCatalog } from '../components/WizardBuilderAdmin/WizardBuilderCatalog';
import { useToast } from '../components/Toast/useToast';
import { MOCK_WIZARDS } from '../data/wizardData';
import type { WizardConfig } from '../data/wizardData';
import { duplicateWizard } from '../utils/wizardUtils';

export const WizardBuilderPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [wizards, setWizards] = useState<WizardConfig[]>(() => {
        const saved = localStorage.getItem('cashy_wizards_v2');
        const parsed: WizardConfig[] = saved ? JSON.parse(saved) : MOCK_WIZARDS;
        
        let hasChanges = false;
        const activeKeys = new Set<string>();
        const cleaned = parsed.map(w => {
            if (w.active && w.category) {
                const key = `${w.category.toLowerCase().trim()}_${(w.shop || 'Global').toLowerCase().trim()}`;
                if (activeKeys.has(key)) {
                    hasChanges = true;
                    return { ...w, active: false };
                }
                activeKeys.add(key);
            }
            return w;
        });

        if (hasChanges) {
            localStorage.setItem('cashy_wizards_v2', JSON.stringify(cleaned));
        }
        return cleaned;
    });
    const selectedWizard = useMemo(() => {
        if (!id) return null;
        return wizards.find(w => w.id === id) ?? null;
    }, [id, wizards]);

    const { showToast } = useToast();

    const [isLoading, setIsLoading] = useState(true);
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 600);
        return () => clearTimeout(timer);
    }, []);

    const handleEditWizard = (wizard: WizardConfig) => {
        navigate(`/wizard-builder/builder/${wizard.id}`);
    };

    const handleSaveWizard = (updatedWizard: WizardConfig) => {
        const newWizards = wizards.map(w => w.id === updatedWizard.id ? updatedWizard : w);
        setWizards(newWizards);
        localStorage.setItem('cashy_wizards_v2', JSON.stringify(newWizards));
        showToast(`Wizard "${updatedWizard.name}" saved successfully!`);
        navigate('/wizard-builder');
    };

    const handleCreateNewWizard = () => {
        const newId = `WIZ-${String(wizards.length + 1).padStart(3, '0')}`;
        const newWizard: WizardConfig = {
            id: newId,
            name: 'New Wizard',
            businessArea: 'General', // Added default business area
            category: '', // No default category
            active: false,
            updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            updatedBy: 'Wizard Builder',
            fields: [],
            stepNames: {}
        };
        
        const newWizards = [...wizards, newWizard];
        setWizards(newWizards);
        localStorage.setItem('cashy_wizards_v2', JSON.stringify(newWizards));
        navigate(`/wizard-builder/builder/${newId}`);
    };

    const handleDeleteWizards = (ids: string[]) => {
        const deletedCount = ids.length;
        const newWizards = wizards.filter(w => !ids.includes(w.id));
        setWizards(newWizards);
        localStorage.setItem('cashy_wizards_v2', JSON.stringify(newWizards));
        showToast(`${deletedCount} Wizard${deletedCount > 1 ? 's' : ''} deleted successfully.`, 'info');
    };

    const handleDeleteSingleWizard = (id: string) => {
        const wizard = wizards.find(w => w.id === id);
        const newWizards = wizards.filter(w => w.id !== id);
        setWizards(newWizards);
        localStorage.setItem('cashy_wizards_v2', JSON.stringify(newWizards));
        showToast(`Wizard "${wizard?.name || id}" deleted successfully.`, 'info');
        navigate('/wizard-builder');
    };

    const handleDeactivateWizards = (ids: string[]) => {
        const newWizards = wizards.map(w => ids.includes(w.id) ? { ...w, active: false } : w);
        setWizards(newWizards);
        localStorage.setItem('cashy_wizards_v2', JSON.stringify(newWizards));
    };

    const handleDuplicateWizard = (wizardToDuplicate: WizardConfig): WizardConfig => {
        const { updatedWizards, newWizard } = duplicateWizard(wizardToDuplicate, wizards);
        setWizards(updatedWizards);
        localStorage.setItem('cashy_wizards_v2', JSON.stringify(updatedWizards));
        showToast(`Wizard "${newWizard.name}" duplicated successfully!`, 'success');
        return newWizard;
    };

    const handleBack = () => {
        navigate('/wizard-builder');
    };

    if (isLoading) {
        if (!selectedWizard) {
            return (
                <div className="bg-[var(--background-tertiary)] h-full w-full p-8 flex flex-col gap-8 animate-pulse select-none">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                            <div className="h-6 w-36 bg-gray-200 rounded" />
                            <div className="h-4 w-60 bg-gray-200 rounded" />
                        </div>
                        <div className="h-11 w-32 bg-gray-200 rounded-xl" />
                    </div>
                    {/* Catalog Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(idx => (
                            <div key={idx} className="bg-white border border-[var(--border-subtle)] rounded-2xl h-44 p-6 flex flex-col justify-between">
                                <div className="space-y-2">
                                    <div className="h-5 w-28 bg-gray-200 rounded" />
                                    <div className="h-4 w-40 bg-gray-200 rounded" />
                                </div>
                                <div className="flex justify-between items-center mt-6">
                                    <div className="h-4 w-20 bg-gray-200 rounded" />
                                    <div className="h-8 w-16 bg-gray-100 rounded-lg" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        } else {
            return (
                <div className="h-full w-full flex bg-[var(--background-primary)] animate-pulse select-none">
                    {/* Field Sidebar Skeleton */}
                    <div className="w-80 border-r border-[var(--border-subtle)] h-full p-6 flex flex-col gap-6 shrink-0">
                        <div className="h-5 w-32 bg-gray-200 rounded" />
                        <div className="h-10 w-full bg-gray-50 border border-gray-100 rounded-xl" />
                        <div className="space-y-3 flex-1 mt-4">
                            {[1, 2, 3, 4, 5].map(idx => (
                                <div key={idx} className="h-12 w-full bg-gray-50 border border-gray-100 rounded-xl" />
                            ))}
                        </div>
                    </div>
                    {/* Main Editor Skeleton */}
                    <div className="flex-grow h-full flex flex-col">
                        <div className="h-16 border-b border-[var(--border-subtle)] flex items-center justify-between px-8">
                            <div className="h-5 w-40 bg-gray-200 rounded" />
                            <div className="flex gap-2">
                                <div className="h-10 w-24 bg-gray-200 rounded-xl" />
                                <div className="h-10 w-24 bg-gray-200 rounded-xl" />
                            </div>
                        </div>
                        <div className="flex-grow p-8 bg-[var(--background-tertiary)] flex flex-col gap-6 overflow-hidden">
                            <div className="h-12 w-full bg-white border border-[var(--border-subtle)] rounded-xl flex gap-3 p-2 shrink-0">
                                {[1, 2, 3].map(idx => (
                                    <div key={idx} className="h-8 w-24 bg-gray-100 rounded-lg" />
                                ))}
                            </div>
                            <div className="flex-grow bg-white border border-[var(--border-subtle)] rounded-2xl p-8 flex flex-col gap-6 overflow-hidden">
                                <div className="h-6 w-48 bg-gray-200 rounded shrink-0" />
                                <div className="h-4 w-96 bg-gray-200 rounded shrink-0" />
                                <div className="grid grid-cols-2 gap-6 mt-4 flex-grow overflow-hidden">
                                    {[1, 2, 3, 4].map(idx => (
                                        <div key={idx} className="h-16 bg-gray-50 border border-gray-100 rounded-xl" />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    }

    if (!selectedWizard) {
        return (
            <div className="h-full w-full">
                <WizardBuilderCatalog 
                    wizards={wizards}
                    onEditWizard={handleEditWizard} 
                    onCreateNew={handleCreateNewWizard}
                    onDeleteWizards={handleDeleteWizards}
                    onDeactivateWizards={handleDeactivateWizards}
                    onDuplicateWizard={handleDuplicateWizard}
                />
            </div>
        );
    }

    return (
        <div className="h-full w-full relative">
            <DealWizardBuilder 
                wizardConfig={selectedWizard} 
                onBack={handleBack}
                onSave={handleSaveWizard}
                onDelete={handleDeleteSingleWizard}
            />
        </div>
    );
};
