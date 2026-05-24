import { useState } from 'react';
import svgPaths from "../../imports/svg-4o201vrq4p";
import type { WizardState, Field } from './DealWizardBuilder';
import { DraggableFieldItem } from './DraggableFieldItem';
import { DraggableStepTab } from './DraggableStepTab';
import { Breadcrumb } from './Breadcrumb';
import { InlineEdit } from './InlineEdit';

import { useToast } from '../Toast/useToast';

interface MainContentProps {
  wizardState: WizardState;
  onRemoveField: (fieldId: string) => void;
  onUpdateField: (fieldId: string, updates: Partial<Field>) => void;
  onSetCurrentStep: (stepId: string) => void;
  onToggleActive: () => void;
  onReorderFields: (dragIndex: number, hoverIndex: number, stepId: string) => void;
  onUpdateWizardName: (name: string) => void;
  onBack: () => void;
}

export function MainContent({
  wizardState,
  onRemoveField,
  onUpdateField,
  onSetCurrentStep,
  onToggleActive,
  onReorderFields,
  onUpdateWizardName,
  onBack
}: MainContentProps) {
  const { showToast } = useToast();
  const currentStepFields = wizardState.fields.filter(f => f.stepId === wizardState.currentStep);
  const currentStep = wizardState.steps.find(s => s.id === wizardState.currentStep);
  const [lastSelectedFieldId, setLastSelectedFieldId] = useState<string | null>(null);

  const hasExpandedFields = currentStepFields.some(field => field.expanded);

  const handleCollapseAll = () => {
    currentStepFields.forEach(field => {
      if (field.expanded) {
        onUpdateField(field.id, { expanded: false });
      }
    });
  };

  return (
    <div className="content-stretch flex flex-col gap-[10px] h-full relative flex-1 min-w-0 overflow-hidden">
      {/* Breadcrumb */}
      <div className="shrink-0">
        <Breadcrumb wizardName={wizardState.name} onBack={onBack} />
      </div>
      
      {/* Wizard Header */}
      <div className="bg-[var(--background-primary)] relative rounded-[8px] shrink-0 w-full border border-[var(--border-subtle)]">
        <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
          <div className="content-stretch flex items-center justify-between p-[24px] relative w-full">
            <InlineEdit
              value={wizardState.name}
              onSave={onUpdateWizardName}
              textClassName="font-['Inter',sans-serif] font-bold text-[24px] text-[var(--text-primary)]"
              containerClassName="content-stretch flex gap-[8px] items-center justify-center relative shrink-0 hover:bg-[var(--background-secondary-hover)] rounded-[4px] px-2 py-1 -ml-2 transition-colors"
              iconNode={
                <div className="absolute inset-[7.83%_8.33%_12.5%_8.33%]">
                  <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.6667 15.9345">
                    <g>
                      <path clipRule="evenodd" d={svgPaths.p3fd37dc0} fill="#1B1D20" fillRule="evenodd" />
                      <path clipRule="evenodd" d={svgPaths.p1a7edd00} fill="#1B1D20" fillRule="evenodd" />
                    </g>
                  </svg>
                </div>
              }
            />
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  if (!wizardState.active && !wizardState.category) {
                    showToast('Please select an Item Category in the Assignments panel before activating this wizard.', 'error');
                    return;
                  }
                  onToggleActive();
                }}
                className={`content-stretch flex gap-[12px] items-center py-[2px] relative shrink-0 transition-opacity ${(!wizardState.active && !wizardState.category) ? 'opacity-50' : ''}`}
                title={(!wizardState.active && !wizardState.category) ? "Select a category to activate" : ""}
              >
                <div className="flex flex-col font-['Inter',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[var(--text-primary)] text-[16px] whitespace-nowrap">
                  <p className="leading-[1.4]">{wizardState.active ? 'Active' : 'Inactive'}</p>
                </div>
                <div
                  className={`${
                    wizardState.active ? 'bg-[var(--background-brand-solid)]' : 'bg-[var(--background-disabled)]'
                  } h-[20px] overflow-clip relative rounded-[19px] shrink-0 w-[40px] transition-colors`}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 size-[16px] transition-all" style={{
                    right: wizardState.active ? '3px' : 'calc(100% - 19px)'
                  }}>
                    <div className="absolute inset-[-12.5%_-18.75%_-25%_-18.75%]">
                      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 22">
                        <g filter="url(#filter0_dd)" style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.08)) drop-shadow(0 1px 2px rgba(0,0,0,0.04))' }}>
                          <circle cx="11" cy="10" fill="white" r="8" />
                        </g>
                      </svg>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="bg-[var(--background-primary)] relative rounded-[8px] border border-[var(--border-subtle)] w-full flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* Fixed Header Area (Tabs + Divider) */}
        <div className="flex flex-col gap-[24px] items-stretch pt-[24px] px-[24px] relative w-full shrink-0 z-10 bg-[var(--background-primary)] rounded-t-[8px]">
          {/* Step Tabs */}
          <div className="flex gap-[12px] items-center w-full flex-nowrap overflow-x-auto pb-[4px] slick-scrollbar">
            {wizardState.steps.map((step, index) => (
              <DraggableStepTab
                key={step.id}
                step={step}
                index={index}
                isActive={step.id === wizardState.currentStep}
                onClick={() => onSetCurrentStep(step.id)}
                onReorder={() => {}} // Disabled reordering for fixed global steps
              />
            ))}
          </div>

          {/* Divider */}
          <div className="h-0 relative shrink-0 w-full">
            <div className="absolute inset-[-1px_0_0_0] border-t border-[var(--border-subtle)]" />
          </div>
        </div>

        {/* Scrollable Step Content */}
        <div className="flex-1 overflow-y-auto slick-scrollbar bg-[var(--background-secondary)]">
          <div className="flex flex-col gap-[24px] items-stretch p-[24px] relative w-full min-h-[500px]">
            <div className="content-stretch flex h-[40px] items-center justify-between relative shrink-0 w-full">
              <div className="content-stretch flex gap-[8px] items-center justify-center relative shrink-0 px-2 py-1 -ml-2">
                <h3 className="font-['Inter',sans-serif] font-bold text-[24px] text-[var(--text-primary)]">
                  {currentStep?.name || ''}
                </h3>
              </div>
              <div className="content-stretch flex gap-[12px] items-center justify-end relative shrink-0">
                {hasExpandedFields && (
                  <button
                    onClick={handleCollapseAll}
                    className="bg-[var(--background-primary)] border border-[var(--border-primary)] hover:bg-[var(--background-secondary-hover)] transition-colors content-stretch flex items-center justify-center px-[12px] py-[8px] relative rounded-[8px] shrink-0"
                  >
                    <div className="content-stretch flex items-center justify-center relative shrink-0">
                      <div className="flex flex-col font-['Inter',sans-serif] font-bold justify-end leading-[0] relative shrink-0 text-[var(--text-subtle)] text-[14px] whitespace-nowrap">
                        <p className="leading-[1.4]">Collapse All</p>
                      </div>
                    </div>
                  </button>
                )}
              </div>
            </div>

            {/* Field List */}
            <div className="flex flex-col gap-[12px] items-stretch relative shrink-0 w-full">
              {currentStepFields.map((field, index) => (
                <DraggableFieldItem
                  key={field.id}
                  field={field}
                  index={index}
                  onRemove={onRemoveField}
                  onUpdate={onUpdateField}
                  onReorder={onReorderFields}
                  stepId={wizardState.currentStep}
                  isSelected={lastSelectedFieldId === field.id}
                  onSelect={() => setLastSelectedFieldId(field.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}