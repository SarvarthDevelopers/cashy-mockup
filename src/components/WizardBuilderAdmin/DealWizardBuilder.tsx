import { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { Sidebar } from './Sidebar';
import { MainContent } from './MainContent';
import { AssignmentsPanel } from './AssignmentsPanel';
import { GLOBAL_STEPS } from '../../data/wizardData';
import type { WizardConfig } from '../../data/wizardData';

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

  const [wizardState, setWizardState] = useState<WizardState>({
    name: wizardConfig.name,
    active: wizardConfig.active,
    category: wizardConfig.category,
    shop: 'Global',
    steps: GLOBAL_STEPS.map((s, idx) => ({
      id: s.id,
      name: s.defaultTitle,
      order: idx + 1
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
      required: false,
      stepId: f.stepId,
      expanded: false,
      options: f.options
    })),
    currentStep: GLOBAL_STEPS[0].id
  });

  const handleSave = () => {
    const updatedWizard: WizardConfig = {
      ...wizardConfig,
      name: wizardState.name,
      active: wizardState.active,
      category: wizardState.category,
      updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      fields: wizardState.fields.map(f => ({
        id: f.id,
        type: f.fieldType.type as WizardConfig['fields'][number]['type'],
        label: f.label,
        placeholder: f.placeholder,
        stepId: f.stepId,
        options: f.options
      })),
      stepNames: wizardState.steps.reduce((acc, step) => {
        acc[step.id] = step.name;
        return acc;
      }, {} as Record<string, string>)
    };
    onSave(updatedWizard);
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
      <div className="bg-[#edeef1] h-full w-full overflow-hidden flex flex-col">
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
            />
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
