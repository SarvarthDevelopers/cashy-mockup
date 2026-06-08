import { useState } from 'react';
import svgPaths from "../../imports/svg-4o201vrq4p";
import svgPathsCheckbox from "../../imports/svg-jusezbzcm9";
import type { FieldType } from './DealWizardBuilder';

interface SidebarProps {
  onAddField: (fieldType: FieldType) => void;
}

const inputFields: FieldType[] = [
  { id: 'text', type: 'text', label: 'Text', icon: 'text' },
  { id: 'textarea', type: 'textarea', label: 'Text Area', icon: 'textarea' },
  { id: 'url', type: 'url', label: 'URL', icon: 'url' },
  { id: 'fileUpload', type: 'fileUpload', label: 'File Upload', icon: 'upload' },
  { id: 'imageUpload', type: 'imageUpload', label: 'Image Upload', icon: 'image' },
  { id: 'datePicker', type: 'datePicker', label: 'Date Picker', icon: 'calendar' },
];

const selectionFields: FieldType[] = [
  { id: 'dropdown', type: 'dropdown', label: 'Drop Down', icon: 'dropdown' },
  { id: 'checkbox', type: 'checkbox', label: 'Checkbox', icon: 'checkbox' },
  { id: 'toggle1', type: 'toggle', label: 'Toggle', icon: 'toggle' },
];

function SidebarSection({ title, children, defaultExpanded = false }: { title: string, children?: React.ReactNode, defaultExpanded?: boolean }) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="Section">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-[var(--background-primary)] relative shrink-0 w-full cursor-pointer hover:bg-[var(--background-secondary-hover)] transition-colors" 
        data-name="Modal Header"
      >
        <div aria-hidden="true" className="absolute border-[var(--border-subtle)] border-b border-solid inset-0 pointer-events-none" />
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex gap-[8px] items-center p-[16px] relative w-full">
            <div className="content-stretch flex gap-[12px] items-center relative shrink-0" data-name="Title">
              <div className="relative shrink-0 size-[24px] flex items-center justify-center text-[var(--text-primary)]">
                {isExpanded ? (
                  <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L7 7L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L7 7L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <div className="flex flex-col font-['Inter',sans-serif] font-bold justify-center leading-[0] not-italic relative shrink-0 text-[var(--text-primary)] text-[15px] whitespace-nowrap">
                <p className="leading-[1.4]">{title}</p>
              </div>
            </div>
          </div>
        </div>
      </button>
      {isExpanded && children && (
        <div className="relative shrink-0 w-full pb-[8px]">
          <div className="content-stretch flex flex-col gap-[16px] items-start px-[16px] pt-2 relative w-full">
            <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
              {children}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function Sidebar({ onAddField }: SidebarProps) {
  return (
    <div className="bg-[var(--background-primary)] h-full relative rounded-[8px] shrink-0 w-[260px] overflow-hidden border border-[var(--border-subtle)]">
      <div className="content-stretch flex flex-col gap-[8px] items-start py-[8px] relative w-full h-full overflow-y-auto slick-scrollbar">
        <SidebarSection title="Input Fields" defaultExpanded={true}>
          {inputFields.map((field) => (
            <FieldButton key={field.id} field={field} onAdd={onAddField} />
          ))}
        </SidebarSection>

        <SidebarSection title="Selection & Logic" defaultExpanded={true}>
          {selectionFields.map((field) => (
            <FieldButton key={field.id} field={field} onAdd={onAddField} />
          ))}
        </SidebarSection>
      </div>
    </div>
  );
}

function FieldButton({ field, onAdd }: { field: FieldType; onAdd: (field: FieldType) => void }) {
  const getIcon = () => {
    switch (field.icon) {
      case 'text':
        return (
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
            <g>
              <path d={svgPaths.p2af8c680} fill="#131518" />
              <path clipRule="evenodd" d={svgPaths.p2d532b80} fill="#131518" fillRule="evenodd" />
              <path d={svgPaths.p39383280} fill="#131518" />
              <path d={svgPaths.p13ccf000} fill="#131518" />
            </g>
          </svg>
        );
      case 'textarea':
        return (
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.3333 9.33333">
            <g>
              <path clipRule="evenodd" d={svgPaths.p211e3571} fill="#131518" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.p51bee80} fill="#131518" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.p2640e040} fill="#131518" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.pedf0f00} fill="#131518" fillRule="evenodd" />
            </g>
          </svg>
        );
      case 'url':
        return (
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 8">
            <g>
              <path clipRule="evenodd" d={svgPaths.p1f52e940} fill="#131518" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.p2d1df00} fill="#131518" fillRule="evenodd" />
            </g>
          </svg>
        );
      case 'upload':
        return (
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.3333 13.3333">
            <g>
              <path clipRule="evenodd" d={svgPaths.p25937080} fill="#131518" fillRule="evenodd" />
              <path d={svgPaths.p21545400} fill="#131518" />
              <path d={svgPaths.p1e5ff180} fill="#131518" />
              <path clipRule="evenodd" d={svgPaths.p29f95a00} fill="#131518" fillRule="evenodd" />
              <path d={svgPaths.p11b3300} fill="#131518" />
            </g>
          </svg>
        );
      case 'image':
        return (
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.3333 13.3333">
            <g>
              <path d={svgPaths.p2c3f0f40} fill="#131518" />
              <path d={svgPaths.p39288500} fill="#131518" />
              <path d={svgPaths.p325cc500} fill="#131518" />
              <path d={svgPaths.p14a28380} fill="#131518" />
              <path d={svgPaths.pfb3b170} fill="#131518" />
              <path clipRule="evenodd" d={svgPaths.p2302c380} fill="#131518" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.p2da7d600} fill="#131518" fillRule="evenodd" />
            </g>
          </svg>
        );
      case 'calendar':
        return (
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.3333 14.6667">
            <g>
              <path clipRule="evenodd" d={svgPaths.p2fc59c00} fill="#131518" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.p30900d80} fill="#131518" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.p2d3c6d00} fill="#131518" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.p2640e040} fill="#131518" fillRule="evenodd" />
            </g>
          </svg>
        );
      case 'dropdown':
        return (
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.6667 14.6667">
            <g>
              <path clipRule="evenodd" d={svgPaths.p24e57c00} fill="#131518" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.p6279b00} fill="#131518" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.p340ca370} fill="#131518" fillRule="evenodd" />
            </g>
          </svg>
        );
      case 'toggle':
        return (
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 10.6667">
            <g>
              <path clipRule="evenodd" d={svgPaths.p2f687600} fill="#1B1D20" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.p59e2200} fill="#1B1D20" fillRule="evenodd" />
            </g>
          </svg>
        );
      case 'checkbox':
        return (
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 13.3333">
            <g>
              <path clipRule="evenodd" d={svgPathsCheckbox.p2e52cc00} fill="#1B1D20" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPathsCheckbox.pd7544a0} fill="#1B1D20" fillRule="evenodd" />
            </g>
          </svg>
        );
      default:
        return null;
    }
  };

  const getIconInset = () => {
    switch (field.icon) {
      case 'text':
        return 'inset-[12.5%]';
      case 'textarea':
        return 'inset-[20.83%_8.33%]';
      case 'url':
        return 'bottom-1/4 left-0 right-0 top-1/4';
      case 'upload':
      case 'image':
        return 'inset-[8.33%]';
      case 'calendar':
        return 'inset-[4.17%_8.33%]';
      case 'dropdown':
        return 'inset-[4.17%]';
      case 'toggle':
        return 'inset-[16.67%_0]';
      case 'checkbox':
        return 'inset-[8.33%_4.17%_8.33%_8.33%]';
      default:
        return 'inset-0';
    }
  };

  return (
    <button
      onClick={() => onAdd(field)}
      className="bg-[var(--background-secondary)] h-[40px] relative rounded-[6px] shrink-0 w-full border border-[var(--border-subtle)] hover:bg-[var(--background-secondary-hover)] hover:border-[var(--border-brand-hover)] hover:shadow-sm transition-all cursor-pointer group"
    >
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[12px] py-[8px] relative size-full">
          <div className="content-stretch flex gap-[12px] items-center relative shrink-0">
            <div className="overflow-clip relative shrink-0 size-[16px] text-[var(--text-primary)] group-hover:text-[var(--text-brand)] transition-colors">
              <div className={`absolute ${getIconInset()}`}>
                {getIcon()}
              </div>
            </div>
            <div className="flex flex-col font-['Inter',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[var(--text-primary)] text-[14px] whitespace-nowrap group-hover:text-[var(--text-brand)] transition-colors">
              <p className="leading-[1.4]">{field.label}</p>
            </div>
          </div>
          <div className="overflow-clip relative shrink-0 size-[16px] text-[var(--text-subtlest)] opacity-0 group-hover:opacity-100 transition-all transform translate-x-1 group-hover:translate-x-0">
            <div className="absolute inset-[16.67%]">
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.6667 10.6667">
                <g>
                  <path clipRule="evenodd" d={svgPaths.p33ab2580} fill="currentColor" fillRule="evenodd" />
                  <path d={svgPaths.p6d82800} fill="currentColor" />
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
