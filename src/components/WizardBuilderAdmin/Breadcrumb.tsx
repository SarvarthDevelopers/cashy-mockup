import svgPaths from "../../imports/svg-4o201vrq4p";

interface BreadcrumbProps {
  wizardName: string;
  onBack?: () => void;
}

export function Breadcrumb({ wizardName, onBack }: BreadcrumbProps) {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0">
      <button 
        onClick={onBack}
        className="bg-[var(--background-secondary)] border border-[var(--border-subtle)] content-stretch flex items-center justify-center pl-[12px] pr-[16px] py-[8px] relative rounded-[8px] shrink-0 hover:bg-[var(--background-secondary-hover)] transition-colors shadow-sm"
      >
        <div className="content-stretch flex gap-[8px] items-center justify-center relative shrink-0">
          <div className="overflow-clip relative shrink-0 size-[20px] text-[var(--text-subtle)]">
            <div className="absolute inset-[4.17%]">
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.3333 18.3333">
                <g>
                  <path clipRule="evenodd" d={svgPaths.p65eb700} fill="currentColor" fillRule="evenodd" />
                  <path clipRule="evenodd" d={svgPaths.p39867c80} fill="currentColor" fillRule="evenodd" />
                  <path clipRule="evenodd" d={svgPaths.p1fdc0100} fill="currentColor" fillRule="evenodd" />
                </g>
              </svg>
            </div>
          </div>
          <div className="flex flex-col font-['Inter',sans-serif] font-bold justify-end leading-[0] relative shrink-0 text-[var(--text-subtle)] text-[14px] text-right whitespace-nowrap">
            <p className="leading-[1.4]">Back to Wizards List</p>
          </div>
        </div>
      </button>
      <div className="content-stretch flex items-center overflow-clip relative shrink-0">
        <div className="content-stretch flex items-center relative shrink-0">
          <div className="flex flex-col font-['Inter',sans-serif] justify-center leading-[0] relative shrink-0 text-[var(--text-subtlest)] text-[14px] whitespace-nowrap">
            <p className="leading-[1.4]">Home</p>
          </div>
        </div>
        <div className="content-stretch flex flex-col items-center overflow-clip px-[8px] relative shrink-0">
          <div className="flex flex-col font-['Roboto',sans-serif] justify-center leading-[0] relative shrink-0 text-[var(--text-subtlest)] text-[14px] whitespace-nowrap">
            <p className="leading-[22px]">/</p>
          </div>
        </div>
        <div className="content-stretch flex items-center relative shrink-0">
          <div className="flex flex-col font-['Inter',sans-serif] justify-center leading-[0] relative shrink-0 text-[var(--text-subtlest)] text-[14px] whitespace-nowrap">
            <p className="leading-[1.4]">Wizards List</p>
          </div>
        </div>
        <div className="content-stretch flex flex-col items-center overflow-clip px-[8px] relative shrink-0">
          <div className="flex flex-col font-['Roboto',sans-serif] justify-center leading-[0] relative shrink-0 text-[var(--text-subtlest)] text-[14px] whitespace-nowrap">
            <p className="leading-[22px]">/</p>
          </div>
        </div>
        <div className="content-stretch flex items-center relative shrink-0">
          <div className="flex flex-col font-['Inter',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[var(--text-primary)] text-[14px] whitespace-nowrap">
            <p className="leading-[1.4]">{wizardName}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
