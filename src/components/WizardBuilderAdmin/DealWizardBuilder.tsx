import { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { Sidebar } from './Sidebar';
import { MainContent } from './MainContent';
import { AssignmentsPanel } from './AssignmentsPanel';
import { ConfirmationModal } from './ConfirmationModal';
import { GLOBAL_STEPS } from '../../data/wizardData';
import type { WizardConfig, AssociatedAction } from '../../data/wizardData';
import { getWorkflowGates } from '../../data/workflowGates';
import type { WorkflowGate } from '../../data/workflowGates';

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

  const [wizardState, setWizardState] = useState<WizardState>({
    name: wizardConfig.name,
    active: wizardConfig.active,
    category: wizardConfig.category,
    shop: 'Global',
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
    if (wizardConfig.active && !wizardState.active) {
      setShowDeactivateConfirmation(true);
      return;
    }
    executeSave();
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
    setWizardState(prev => ({
      ...prev,
      active: !prev.active
    }));
  };

  const updateCategory = (category: string) => {
    setWizardState(prev => ({
      ...prev,
      category
    }));
  };

  const updateShop = (shop: string) => {
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
              onBack={onBack}
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
    </DndProvider>
  );
}
