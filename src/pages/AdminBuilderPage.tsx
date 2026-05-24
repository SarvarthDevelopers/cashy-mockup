import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { DealWizardBuilder } from '../components/WizardBuilderAdmin/DealWizardBuilder';
import { WizardBuilderCatalog } from '../components/WizardBuilderAdmin/WizardBuilderCatalog';
import { useToast } from '../components/Toast/useToast';
import { MOCK_WIZARDS } from '../data/wizardData';
import type { WizardConfig } from '../data/wizardData';

export const WizardBuilderPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [wizards, setWizards] = useState<WizardConfig[]>(() => {
        const saved = localStorage.getItem('cashy_wizards_v2');
        return saved ? JSON.parse(saved) : MOCK_WIZARDS;
    });
    const selectedWizard = useMemo(() => {
        if (!id) return null;
        return wizards.find(w => w.id === id) ?? null;
    }, [id, wizards]);

    const { showToast } = useToast();

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

    const handleBack = () => {
        navigate('/wizard-builder');
    };

    if (!selectedWizard) {
        return (
            <div className="h-full w-full">
                <WizardBuilderCatalog 
                    wizards={wizards}
                    onEditWizard={handleEditWizard} 
                    onCreateNew={handleCreateNewWizard}
                    onDeleteWizards={handleDeleteWizards}
                    onDeactivateWizards={handleDeactivateWizards}
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
