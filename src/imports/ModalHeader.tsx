import svgPaths from "./svg-387z6danis";

export default function ModalHeader() {
  return (
    <div className="bg-white content-stretch flex gap-[8px] items-center p-[16px] relative rounded-tl-[8px] rounded-tr-[8px] size-full" data-name="Modal Header">
      <div aria-hidden="true" className="absolute border-[#d7dbe0] border-b border-solid inset-0 pointer-events-none rounded-tl-[8px] rounded-tr-[8px]" />
      <div className="content-stretch flex gap-[12px] items-center relative shrink-0" data-name="Title">
        <div className="overflow-clip relative shrink-0 size-[24px]" data-name="chevron-down">
          <div className="absolute inset-[33.33%_20.83%]" data-name="Icon">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 8">
              <path clipRule="evenodd" d={svgPaths.pc0a6900} fill="var(--fill-0, #131518)" fillRule="evenodd" id="Icon" />
            </svg>
          </div>
        </div>
        <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#131518] text-[16px] whitespace-nowrap">
          <p className="leading-[1.4]">Input Fields</p>
        </div>
      </div>
    </div>
  );
}