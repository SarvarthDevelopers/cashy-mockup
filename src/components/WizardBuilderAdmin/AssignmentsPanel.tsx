import { useState } from 'react';
import svgPaths from "../../imports/svg-4o201vrq4p";
import { ConfirmationModal } from './ConfirmationModal';
import { CategoryTreeDropdown } from '../CategoryTree/CategoryTreeDropdown';

import type { AssociatedAction } from '../../data/wizardData';
import type { Step } from './DealWizardBuilder';

interface AssignmentsPanelProps {
  wizardId: string;
  category: string;
  shop: string;
  isActive: boolean;
  onUpdateCategory: (category: string) => void;
  onUpdateShop: (shop: string) => void;
  onSave: () => void;
  onDelete: (id: string) => void;
  steps: Step[];
  onUpdateStepAction: (stepId: string, action: AssociatedAction) => void;
}




const shops = [
  'Global',
  'Downtown Branch',
  'Uptown Branch',
  'West Side Branch',
  'East Side Branch',
];

export function AssignmentsPanel({ 
  wizardId,
  category, 
  shop, 
  isActive,
  onUpdateCategory, 
  onUpdateShop, 
  onSave,
  onDelete,
  steps,
  onUpdateStepAction
}: AssignmentsPanelProps) {
  const [showShopDropdown, setShowShopDropdown] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [pendingCategory, setPendingCategory] = useState<string | null>(null);
  const [activeDropdownStepId, setActiveDropdownStepId] = useState<string | null>(null);

  const getActionIndicator = (associatedAction?: AssociatedAction) => {
    if (!associatedAction || associatedAction === 'NONE') return null;
    switch (associatedAction) {
      case 'SET_REVIEWING':
        return <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />;
      case 'VERIFY_DEAL':
        return <span className="w-2 h-2 rounded-full bg-[#4649E5] shrink-0" />;
      case 'EXECUTE_PAYOUT':
        return <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />;
      case 'DECLINE_DEAL':
        return <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />;
      default:
        return null;
    }
  };

  const handleCategorySelect = (cat: string) => {
    // Only show modal if there's an existing category and it's different
    if (category && category !== cat) {
      setPendingCategory(cat);
      setIsCategoryModalOpen(true);
    } else {
      onUpdateCategory(cat);
    }
  };

  return (
    <div className="bg-[var(--background-primary)] h-full relative rounded-[8px] shrink-0 w-[260px] overflow-hidden border border-[var(--border-subtle)]">
      <div className="content-stretch flex flex-col gap-[24px] items-start py-[8px] relative w-full h-full overflow-y-auto slick-scrollbar">
        <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full">
          {/* Header */}
          <div className="grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0 w-full">
            <div className="col-1 content-stretch flex gap-[10px] h-[30.476px] items-center ml-0 mt-0 px-[16px] py-[8px] relative rounded-[4px] row-1 w-full">
              <div className="content-stretch flex gap-[12px] items-center relative shrink-0">
                <div className="flex flex-col font-['Inter',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[var(--text-subtle)] text-[12px] tracking-widest whitespace-nowrap">
                  <p className="leading-[1.4]">ASSIGNMENTS</p>
                </div>
              </div>
            </div>
            <div className="col-1 h-0 ml-0 mt-[38.48px] relative row-1 w-full">
              <div className="absolute inset-[-1px_0_0_0] border-t border-[var(--border-subtle)]" />
            </div>
          </div>

          {/* Dropdowns */}
          <div className="relative shrink-0 w-full">
            <div className="content-stretch flex flex-col gap-[24px] items-start px-[16px] py-[8px] relative w-full">
              {/* Category Dropdown */}
              <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
                <CategoryTreeDropdown
                  label="Apply to Item Category"
                  value={category}
                  onChange={handleCategorySelect}
                />
              </div>

              {/* Shop Dropdown */}
              <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
                <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full">
                  <p className="font-['Inter',sans-serif] font-bold leading-[1.4] relative shrink-0 text-[var(--text-subtle)] text-[13px] whitespace-nowrap">
                    Apply to Shop / Branch
                  </p>
                  <div className="relative w-full">
                    <button
                      onClick={() => setShowShopDropdown(!showShopDropdown)}
                      className="bg-[var(--background-secondary)] h-[40px] relative rounded-[8px] shrink-0 w-full border border-[var(--border-subtle)] hover:border-[var(--border-brand-hover)] hover:bg-[var(--background-secondary-hover)] transition-all"
                    >
                      <div className="flex flex-row items-center size-full">
                        <div className="content-stretch flex gap-[8px] items-center px-[12px] py-[8px] relative size-full">
                          <div className="content-stretch flex flex-[1_0_0] gap-[8px] items-center min-h-px min-w-px relative">
                            <div className="overflow-clip relative shrink-0 size-[20px] text-[var(--text-primary)]">
                              <div className="absolute inset-[4.17%]">
                                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.3333 18.3333">
                                  <g>
                                    <path d={svgPaths.p358c3400} fill="currentColor" />
                                    <path clipRule="evenodd" d={svgPaths.p39b61e40} fill="currentColor" fillRule="evenodd" />
                                    <path d={svgPaths.p210dae00} fill="currentColor" />
                                  </g>
                                </svg>
                              </div>
                            </div>
                            <p className="font-['Inter',sans-serif] font-medium leading-[1.4] relative shrink-0 text-[var(--text-primary)] text-[15px] whitespace-nowrap">
                              {shop}
                            </p>
                          </div>
                          <div className="overflow-clip relative shrink-0 size-[20px] text-[var(--text-subtle)]">
                            <div className="absolute inset-[33.33%_20.83%]">
                              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.6667 6.66667">
                                <path clipRule="evenodd" d={svgPaths.p2a5900} fill="currentColor" fillRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                    {showShopDropdown && (
                      <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white border border-[#b4bbc5] rounded-[8px] shadow-lg z-10 max-h-[200px] overflow-y-auto">
                        {shops.map((s) => (
                          <button
                            key={s}
                            onClick={() => {
                              onUpdateShop(s);
                              setShowShopDropdown(false);
                            }}
                            className="w-full text-left px-[12px] py-[8px] hover:bg-[#f9fafb] transition-colors flex items-center gap-[8px]"
                          >
                            {s === 'Global' && (
                              <div className="overflow-clip relative shrink-0 size-[20px]">
                                <div className="absolute inset-[4.17%]">
                                  <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.3333 18.3333">
                                    <g>
                                      <path d={svgPaths.p358c3400} fill="#151027" />
                                      <path clipRule="evenodd" d={svgPaths.p39b61e40} fill="#151027" fillRule="evenodd" />
                                      <path d={svgPaths.p210dae00} fill="#151027" />
                                    </g>
                                  </svg>
                                </div>
                              </div>
                            )}
                            <span className="font-['Inter',sans-serif] text-[14px] text-[#131518]">
                              {s}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px w-full bg-[var(--border-subtle)] my-1" />

              {/* Workflow Gates Section */}
              <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
                <div className="flex gap-[10px] items-center relative rounded-[4px] w-full">
                  <div className="font-['Inter',sans-serif] font-bold leading-[0] relative shrink-0 text-[var(--text-subtle)] text-[12px] tracking-widest whitespace-nowrap">
                    <p className="leading-[1.4]">WORKFLOW GATES</p>
                  </div>
                </div>

                <div className="flex flex-col gap-4 w-full">
                  {steps.map((step) => {
                    const currentAction = step.associatedAction || 'NONE';
                    const actionLabelMap: Record<AssociatedAction, string> = {
                      NONE: 'None (Standard Step)',
                      SET_REVIEWING: 'Start Review',
                      VERIFY_DEAL: 'Verify Deal',
                      EXECUTE_PAYOUT: 'Confirm Payout',
                      DECLINE_DEAL: 'Reject & Close'
                    };
                    const isOpen = activeDropdownStepId === step.id;

                    return (
                      <div key={step.id} className="flex flex-col gap-[6px] items-start relative w-full">
                        <div className="flex items-center gap-2">
                          {getActionIndicator(step.associatedAction)}
                          <p className="font-['Inter',sans-serif] font-bold leading-[1.4] relative shrink-0 text-[var(--text-subtle)] text-[13px] whitespace-nowrap truncate max-w-[185px]" title={step.name}>
                            {step.name}
                          </p>
                        </div>
                        
                        <div className="relative w-full">
                          <button
                            type="button"
                            onClick={() => setActiveDropdownStepId(isOpen ? null : step.id)}
                            className="bg-[var(--background-secondary)] h-[40px] relative rounded-[8px] shrink-0 w-full border border-[var(--border-subtle)] hover:border-[var(--border-brand-hover)] hover:bg-[var(--background-secondary-hover)] transition-all text-left"
                          >
                            <div className="flex flex-row items-center size-full">
                              <div className="content-stretch flex gap-[8px] items-center px-[12px] py-[8px] relative size-full">
                                <div className="content-stretch flex flex-[1_0_0] gap-[8px] items-center min-h-px min-w-px relative">
                                  <p className="font-['Inter',sans-serif] font-medium leading-[1.4] relative shrink-0 text-[var(--text-primary)] text-[14px] whitespace-nowrap">
                                    {actionLabelMap[currentAction]}
                                  </p>
                                </div>
                                <div className="overflow-clip relative shrink-0 size-[20px] text-[var(--text-subtle)]">
                                  <div className="absolute inset-[33.33%_20.83%]">
                                    <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.6667 6.66667">
                                      <path clipRule="evenodd" d={svgPaths.p2a5900} fill="currentColor" fillRule="evenodd" />
                                    </svg>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </button>
                          
                          {isOpen && (
                            <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white border border-[#b4bbc5] rounded-[8px] shadow-lg z-20 max-h-[250px] overflow-y-auto py-1">
                              {Object.entries(actionLabelMap).map(([actionKey, label]) => {
                                const action = actionKey as AssociatedAction;
                                const isAssignedToOther = steps.some(s => s.id !== step.id && s.associatedAction === action && action !== 'NONE');
                                
                                return (
                                  <button
                                    key={action}
                                    type="button"
                                    disabled={isAssignedToOther}
                                    onClick={() => {
                                      onUpdateStepAction(step.id, action);
                                      setActiveDropdownStepId(null);
                                    }}
                                    className={`
                                      w-full text-left px-[12px] py-[8px] transition-colors flex items-center gap-[8px]
                                      ${isAssignedToOther 
                                        ? 'opacity-40 cursor-not-allowed bg-gray-50/50' 
                                        : 'hover:bg-[#f9fafb] cursor-pointer'}
                                    `}
                                  >
                                    <span className={`
                                      font-['Inter',sans-serif] text-[13px] 
                                      ${isAssignedToOther ? 'text-gray-400 line-through' : 'text-[#131518] font-medium'}
                                    `}>
                                      {label} {isAssignedToOther && '(Already assigned)'}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Save & Delete Buttons */}
        <div className="px-[16px] py-[16px] w-full flex flex-col gap-3 mt-auto border-t border-[var(--border-subtle)]">
          <button 
            onClick={onSave}
            className="bg-[var(--background-brand-solid)] w-full h-[40px] rounded-[8px] flex items-center justify-center hover:bg-[var(--background-brand-solid-hover)] transition-colors shadow-sm"
          >
            <span className="font-['Inter',sans-serif] font-bold text-[14px] text-[var(--text-white)]">
              Save and Close
            </span>
          </button>
          <button 
            onClick={() => setIsDeleteModalOpen(true)}
            className="w-full h-[40px] rounded-[8px] flex items-center justify-center border border-[var(--border-error-subtle)] text-[var(--text-error)] hover:bg-[var(--background-error-primary)] transition-colors font-bold text-[14px]"
          >
            Delete Wizard
          </button>
        </div>
      </div>

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => onDelete(wizardId)}
        title="Delete Wizard Template?"
        description="This action will permanently remove this wizard template and all its configured fields. This cannot be undone."
        confirmText="Delete Permanently"
        confirmVariant="danger"
        requireTypedConfirmation={isActive}
        typedConfirmationWord="delete"
        warningMessage={isActive ? "Warning: This wizard is currently ACTIVE. Deleting it will impact live deals using this category assignment." : undefined}
      />

      <ConfirmationModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onConfirm={() => {
          if (pendingCategory) onUpdateCategory(pendingCategory);
          setIsCategoryModalOpen(false);
        }}
        title="Change Category Assignment?"
        description={`Are you sure you want to change the category from "${category}" to "${pendingCategory}"?`}
        warningMessage="Warning: Any deals currently using this wizard for the original category will lose access to these custom fields until reassigned."
        confirmText="Confirm Change"
        confirmVariant="primary"
      />
    </div>
  );
}
