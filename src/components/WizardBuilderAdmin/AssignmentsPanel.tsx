import { useState } from 'react';
import svgPaths from "../../imports/svg-4o201vrq4p";
import { ConfirmationModal } from './ConfirmationModal';
import { CategoryTreeDropdown } from '../CategoryTree/CategoryTreeDropdown';

interface AssignmentsPanelProps {
  wizardId: string;
  category: string;
  shop: string;
  isActive: boolean;
  onUpdateCategory: (category: string) => void;
  onUpdateShop: (shop: string) => void;
  onSave: () => void;
  onDelete: (id: string) => void;
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
  onDelete 
}: AssignmentsPanelProps) {
  const [showShopDropdown, setShowShopDropdown] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [pendingCategory, setPendingCategory] = useState<string | null>(null);

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
