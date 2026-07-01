import { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { Sidebar } from './Sidebar';
import { MainContent } from './MainContent';
import { AssignmentsPanel } from './AssignmentsPanel';
import { ConfirmationModal } from './ConfirmationModal';
import { GLOBAL_STEPS, MOCK_WIZARDS } from '../../data/wizardData';
import type { WizardConfig, AssociatedAction } from '../../data/wizardData';
import { getWorkflowGates, STATUS_ORDER } from '../../data/workflowGates';
import type { WorkflowGate } from '../../data/workflowGates';
import { useToast } from '../Toast/useToast';

export interface FieldType {
  id: string;
  type: 'text' | 'number' | 'select' | 'checkbox' | 'file' | 'textarea' | 'url' | 'date' | 'toggle' | 'image' | 'dropdown' | 'fileUpload' | 'imageUpload' | 'datePicker';
  label: string;
  icon: string;
}

export interface Step {
  id: string;
  name: string;
  order: number;
  associatedAction: AssociatedAction;
}

export interface Field {
  id: string;
  fieldType: FieldType;
  label: string;
  placeholder: string;
  required: boolean;
  stepId: string;
  order?: number;
  expanded?: boolean;
  options?: string[];
  buttonLabel?: string;
  helpText?: string;
  defaultValue?: string;
  maxFileSize?: number;
  allowedFormats?: string;
  defaultChecked?: boolean;
}

export interface WizardState {
  name: string;
  active: boolean;
  category: string;
  shop: string;
  steps: Step[];
  fields: Field[];
  currentStep: string;
}

interface DealWizardBuilderProps {
  wizardConfig: WizardConfig;
  onBack: () => void;
  onSave: (wizard: WizardConfig) => void;
  onDelete: (id: string) => void;
}

export function DealWizardBuilder({ wizardConfig, onBack, onSave, onDelete }: DealWizardBuilderProps) {
  const [gates, setGates] = useState<WorkflowGate[]>(getWorkflowGates);

  useEffect(() => {
    const handleUpdate = () => {
      setGates(getWorkflowGates());
    };
    window.addEventListener('cashy_workflow_gates_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('cashy_workflow_gates_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const { showToast } = useToast();
  const [showBackConfirmation, setShowBackConfirmation] = useState(false);
  const [showCollisionConfirmation, setShowCollisionConfirmation] = useState(false);
  const [conflictingWizard, setConflictingWizard] = useState<WizardConfig | null>(null);
  const [pendingCategoryUpdate, setPendingCategoryUpdate] = useState<string | null>(null);
  const [pendingShopUpdate, setPendingShopUpdate] = useState<string | null>(null);
  const [pendingActiveUpdate, setPendingActiveUpdate] = useState<boolean | null>(null);

  const [wizardState, setWizardState] = useState<WizardState>({
    name: wizardConfig.name,
    active: wizardConfig.active,
    category: wizardConfig.category,
    shop: wizardConfig.shop || 'Global',
    steps: GLOBAL_STEPS.map((s, idx) => ({
      id: s.id,
      name: s.defaultTitle,
      order: idx + 1,
      associatedAction: (wizardConfig.stepActions?.[s.id] || 'NONE') as AssociatedAction
    })),
    fields: wizardConfig.fields.map(f => ({
      id: f.id,
      fieldType: {
        id: f.type,
        type: f.type as FieldType['type'],
        label: f.type.charAt(0).toUpperCase() + f.type.slice(1),
        icon: f.type
      },
      label: f.label,
      placeholder: f.placeholder || '',
      required: f.required || false,
      stepId: f.stepId,
      expanded: false,
      options: f.options
    })),
    currentStep: GLOBAL_STEPS[0].id
  });

  const [showDeactivateConfirmation, setShowDeactivateConfirmation] = useState(false);

  const allWizards: WizardConfig[] = (() => {
    const saved = localStorage.getItem('cashy_wizards_v2');
    return saved ? JSON.parse(saved) : MOCK_WIZARDS;
  })();

  const isStateModified = () => {
    if (wizardState.name !== wizardConfig.name) return true;
    if (wizardState.active !== wizardConfig.active) return true;
    if (wizardState.category !== wizardConfig.category) return true;
    const initialShop = wizardConfig.shop || 'Global';
    if (wizardState.shop !== initialShop) return true;

    for (const step of wizardState.steps) {
      const initialName = wizardConfig.stepNames?.[step.id] || GLOBAL_STEPS.find(s => s.id === step.id)?.defaultTitle || '';
      if (step.name !== initialName) return true;
      const initialAction = wizardConfig.stepActions?.[step.id] || 'NONE';
      if (step.associatedAction !== initialAction) return true;
    }

    if (wizardState.fields.length !== wizardConfig.fields.length) return true;
    for (const fState of wizardState.fields) {
      const fConfig = wizardConfig.fields.find(f => f.id === fState.id);
      if (!fConfig) return true;
      if (fState.label !== fConfig.label) return true;
      if (fState.placeholder !== (fConfig.placeholder || '')) return true;
      if (fState.required !== (fConfig.required || false)) return true;
      if (fState.stepId !== fConfig.stepId) return true;
      if (fState.fieldType.type !== fConfig.type) return true;
      const stateOpts = fState.options || [];
      const configOpts = fConfig.options || [];
      if (stateOpts.length !== configOpts.length) return true;
      for (let j = 0; j < stateOpts.length; j++) {
        if (stateOpts[j] !== configOpts[j]) return true;
      }
    }
    return false;
  };

  const isNameDuplicate = (name: string) => {
    return allWizards.some(w => w.id !== wizardConfig.id && w.name.toLowerCase().trim() === name.toLowerCase().trim());
  };

  const getConflictingActiveWizard = (category: string, shop: string) => {
    if (!category) return null;
    return allWizards.find(w => 
      w.id !== wizardConfig.id && 
      w.active && 
      w.category.toLowerCase().trim() === category.toLowerCase().trim() && 
      (w.shop || 'Global').toLowerCase().trim() === shop.toLowerCase().trim()
    );
  };

  const getActionOrderScore = (action: string): number => {
    if (!action || action === 'NONE') return 0;
    const gate = gates.find(g => g.id === action);
    if (!gate || !gate.triggers || gate.triggers.length === 0) return 0;
    const orders = gate.triggers.map(t => STATUS_ORDER[t]).filter(o => o !== undefined);
    if (orders.length === 0) return 0;
    return Math.max(...orders);
  };

  const validateChronologicalGates = (): string | null => {
    let lastScore = 0;
    let lastStepName = '';
    const sortedSteps = [...wizardState.steps].sort((a, b) => a.order - b.order);
    
    for (const step of sortedSteps) {
      const score = getActionOrderScore(step.associatedAction);
      if (score > 0) {
        if (score < lastScore) {
          const gateName = gates.find(g => g.id === step.associatedAction)?.name || step.associatedAction;
          const prevStep = sortedSteps.find(s => getActionOrderScore(s.associatedAction) === lastScore);
          const prevGateName = gates.find(g => g.id === prevStep?.associatedAction)?.name || 'previous';
          return `Workflow gates must follow chronological status progression. Step "${step.name}" (${gateName}) cannot trigger a status before Step "${lastStepName}" (${prevGateName}).`;
        }
        lastScore = score;
        lastStepName = step.name;
      }
    }
    return null;
  };

  const executeSave = () => {
    const stepActions: Record<string, AssociatedAction> = {};
    wizardState.steps.forEach(s => {
      stepActions[s.id] = s.associatedAction || 'NONE';
    });

    const updatedWizard: WizardConfig = {
      ...wizardConfig,
      name: wizardState.name,
      active: wizardState.active,
      category: wizardState.category,
      shop: wizardState.shop,
      updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      stepActions,
      fields: wizardState.fields.map(f => ({
        id: f.id,
        type: f.fieldType.type as WizardConfig['fields'][number]['type'],
        label: f.label,
        placeholder: f.placeholder,
        stepId: f.stepId,
        options: f.options,
        required: f.required
      })),
      stepNames: wizardState.steps.reduce((acc, step) => {
        acc[step.id] = step.name;
        return acc;
      }, {} as Record<string, string>)
    };
    onSave(updatedWizard);
  };

  const handleSave = () => {
    if (isNameDuplicate(wizardState.name)) {
      showToast(`A wizard named "${wizardState.name}" already exists. Please choose a unique name.`, 'error');
      return;
    }

    if (wizardState.active && !wizardState.category) {
      showToast('Please select an Item Category in the Assignments panel before activating this wizard.', 'error');
      return;
    }

    const gateOrderError = validateChronologicalGates();
    if (gateOrderError) {
      showToast(gateOrderError, 'error');
      return;
    }

    if (wizardConfig.active && !wizardState.active) {
      setShowDeactivateConfirmation(true);
      return;
    }

    const conflict = getConflictingActiveWizard(wizardState.category, wizardState.shop);
    if (wizardState.active && conflict) {
      setConflictingWizard(conflict);
      setPendingCategoryUpdate(null);
      setPendingShopUpdate(null);
      setPendingActiveUpdate(null);
      setShowCollisionConfirmation(true);
      return;
    }

    executeSave();
  };

  const handleBackWithCheck = () => {
    if (isStateModified()) {
      setShowBackConfirmation(true);
    } else {
      onBack();
    }
  };

  const handleCollisionConfirm = () => {
    if (!conflictingWizard) return;
    const updatedWizards = allWizards.map(w => {
      if (w.id === conflictingWizard.id) {
        return { ...w, active: false };
      }
      return w;
    });
    localStorage.setItem('cashy_wizards_v2', JSON.stringify(updatedWizards));
    showToast(`Wizard "${conflictingWizard.name}" has been deactivated to resolve category-shop collision.`, 'info');

    if (pendingCategoryUpdate !== null) {
      setWizardState(prev => ({ ...prev, category: pendingCategoryUpdate }));
      setPendingCategoryUpdate(null);
    } else if (pendingShopUpdate !== null) {
      setWizardState(prev => ({ ...prev, shop: pendingShopUpdate }));
      setPendingShopUpdate(null);
    } else if (pendingActiveUpdate !== null) {
      setWizardState(prev => ({ ...prev, active: true }));
      setPendingActiveUpdate(null);
    } else {
      executeSave();
    }
    
    setShowCollisionConfirmation(false);
    setConflictingWizard(null);
  };

  const handleCollisionCancel = () => {
    setPendingCategoryUpdate(null);
    setPendingShopUpdate(null);
    setPendingActiveUpdate(null);
    setConflictingWizard(null);
    setShowCollisionConfirmation(false);
  };

  const addField = (fieldType: FieldType) => {
    const newField: Field = {
      id: `field-${Date.now()}`,
      fieldType,
      label: fieldType.label,
      placeholder: 'Enter value',
      required: false,
      stepId: wizardState.currentStep,
      expanded: false,
      options: fieldType.type === 'select' ? ['Option 1', 'Option 2'] : undefined,
    };

    setWizardState(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
  };

  const removeField = (fieldId: string) => {
    setWizardState(prev => ({
      ...prev,
      fields: prev.fields.filter(f => f.id !== fieldId)
    }));
  };

  const updateField = (fieldId: string, updates: Partial<Field>) => {
    setWizardState(prev => ({
      ...prev,
      fields: prev.fields.map(f => 
        f.id === fieldId ? { ...f, ...updates } : f
      )
    }));
  };


  const updateWizardName = (name: string) => {
    if (isNameDuplicate(name)) {
      showToast(`A wizard named "${name}" already exists. Please choose a unique name.`, 'error');
      return;
    }
    setWizardState(prev => ({
      ...prev,
      name
    }));
  };

  const setCurrentStep = (stepId: string) => {
    setWizardState(prev => ({
      ...prev,
      currentStep: stepId
    }));
  };

  const toggleWizardActive = () => {
    const newActive = !wizardState.active;
    if (newActive) {
      if (!wizardState.category) {
        showToast('Please select an Item Category in the Assignments panel before activating this wizard.', 'error');
        return;
      }
      const conflict = getConflictingActiveWizard(wizardState.category, wizardState.shop);
      if (conflict) {
        setConflictingWizard(conflict);
        setPendingActiveUpdate(true);
        setShowCollisionConfirmation(true);
        return;
      }
    }
    setWizardState(prev => ({
      ...prev,
      active: newActive
    }));
  };

  const updateCategory = (category: string) => {
    if (wizardState.active) {
      const conflict = getConflictingActiveWizard(category, wizardState.shop);
      if (conflict) {
        setConflictingWizard(conflict);
        setPendingCategoryUpdate(category);
        setShowCollisionConfirmation(true);
        return;
      }
    }
    setWizardState(prev => ({
      ...prev,
      category
    }));
  };

  const updateShop = (shop: string) => {
    if (wizardState.active) {
      const conflict = getConflictingActiveWizard(wizardState.category, shop);
      if (conflict) {
        setConflictingWizard(conflict);
        setPendingShopUpdate(shop);
        setShowCollisionConfirmation(true);
        return;
      }
    }
    setWizardState(prev => ({
      ...prev,
      shop
    }));
  };

  const updateStepAction = (stepId: string, associatedAction: AssociatedAction) => {
    setWizardState(prev => ({
      ...prev,
      steps: prev.steps.map(s => s.id === stepId ? { ...s, associatedAction } : s)
    }));
  };

  const reorderFields = (dragIndex: number, hoverIndex: number, stepId: string) => {
    setWizardState(prev => {
      const stepFields = prev.fields.filter(f => f.stepId === stepId);
      const otherFields = prev.fields.filter(f => f.stepId !== stepId);
      
      const [removed] = stepFields.splice(dragIndex, 1);
      stepFields.splice(hoverIndex, 0, removed);
      
      return {
        ...prev,
        fields: [...otherFields, ...stepFields.map((field, index) => ({ ...field, order: index }))]
      };
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="bg-[var(--background-tertiary)] h-full w-full overflow-hidden flex flex-col">
        <div className="px-[24px] py-[16px] flex-1 min-h-0 min-w-0">
          <div className="flex gap-[24px] items-start h-full min-w-[1200px]">
            <Sidebar onAddField={addField} />
            <MainContent
              wizardState={wizardState}
              onRemoveField={removeField}
              onUpdateField={updateField}
              onSetCurrentStep={setCurrentStep}
              onToggleActive={toggleWizardActive}
              onReorderFields={reorderFields}
              onUpdateWizardName={updateWizardName}
              onBack={handleBackWithCheck}
              gates={gates}
            />
             <AssignmentsPanel
              wizardId={wizardConfig.id}
              category={wizardState.category}
              shop={wizardState.shop}
              onUpdateCategory={updateCategory}
              onUpdateShop={updateShop}
              onSave={handleSave}
              onDelete={onDelete}
              isActive={wizardState.active}
              steps={wizardState.steps}
              onUpdateStepAction={updateStepAction}
              gates={gates}
            />
          </div>
        </div>
      </div>
      <ConfirmationModal
        isOpen={showDeactivateConfirmation}
        onClose={() => setShowDeactivateConfirmation(false)}
        onConfirm={() => {
          setShowDeactivateConfirmation(false);
          executeSave();
        }}
        title="Deactivate Active Wizard?"
        description="Warning: This wizard template is currently active and assigned to a category. Deactivating it will leave that category layout disabled, which will affect step progress validations for active deals in that category."
        confirmText="Yes, Deactivate"
        confirmVariant="danger"
      />
      <ConfirmationModal
        isOpen={showBackConfirmation}
        onClose={() => setShowBackConfirmation(false)}
        onConfirm={() => {
          setShowBackConfirmation(false);
          onBack();
        }}
        title="Discard Unsaved Changes?"
        description="You have unsaved changes. Are you sure you want to go back? Unsaved changes will be permanently lost."
        confirmText="Discard Changes"
        confirmVariant="danger"
      />
      <ConfirmationModal
        isOpen={showCollisionConfirmation}
        onClose={handleCollisionCancel}
        onConfirm={handleCollisionConfirm}
        title="Deactivate Conflicting Active Wizard?"
        description={`This category and shop combination already has an active wizard: "${conflictingWizard?.name || ''}". Activating this wizard will automatically deactivate "${conflictingWizard?.name || ''}". Do you want to proceed?`}
        confirmText="Deactivate and Activate"
        confirmVariant="danger"
      />
    </DndProvider>
  );
}
