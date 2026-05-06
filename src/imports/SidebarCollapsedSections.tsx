import svgPaths from "./svg-mb13vw54p7";

function Title() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0" data-name="Title">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name="chevron-right">
        <div className="absolute inset-[20.83%_33.33%]" data-name="Icon">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 14">
            <path clipRule="evenodd" d={svgPaths.p1c6e4d00} fill="var(--fill-0, #131518)" fillRule="evenodd" id="Icon" />
          </svg>
        </div>
      </div>
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#131518] text-[16px] whitespace-nowrap">
        <p className="leading-[1.4]">Input Fields</p>
      </div>
    </div>
  );
}

function Section() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="Section">
      <div className="bg-white relative rounded-tl-[8px] rounded-tr-[8px] shrink-0 w-full" data-name="Modal Header">
        <div aria-hidden="true" className="absolute border-[#d7dbe0] border-b border-solid inset-0 pointer-events-none rounded-tl-[8px] rounded-tr-[8px]" />
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex gap-[8px] items-center p-[16px] relative w-full">
            <Title />
          </div>
        </div>
      </div>
    </div>
  );
}

function Title1() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0" data-name="Title">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name="chevron-right">
        <div className="absolute inset-[20.83%_33.33%]" data-name="Icon">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 14">
            <path clipRule="evenodd" d={svgPaths.p1c6e4d00} fill="var(--fill-0, #131518)" fillRule="evenodd" id="Icon" />
          </svg>
        </div>
      </div>
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#131518] text-[16px] whitespace-nowrap">
        <p className="leading-[1.4]">{`Selection & Logic`}</p>
      </div>
    </div>
  );
}

function Section1() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="Section">
      <div className="bg-white relative rounded-tl-[8px] rounded-tr-[8px] shrink-0 w-full" data-name="Modal Header">
        <div aria-hidden="true" className="absolute border-[#d7dbe0] border-b border-solid inset-0 pointer-events-none rounded-tl-[8px] rounded-tr-[8px]" />
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex gap-[8px] items-center p-[16px] relative w-full">
            <Title1 />
          </div>
        </div>
      </div>
    </div>
  );
}

function Title2() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0" data-name="Title">
      <div className="overflow-clip relative shrink-0 size-[24px]" data-name="chevron-right">
        <div className="absolute inset-[20.83%_33.33%]" data-name="Icon">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 14">
            <path clipRule="evenodd" d={svgPaths.p1c6e4d00} fill="var(--fill-0, #131518)" fillRule="evenodd" id="Icon" />
          </svg>
        </div>
      </div>
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#131518] text-[16px] whitespace-nowrap">
        <p className="leading-[1.4]">Dynamic Fields</p>
      </div>
    </div>
  );
}

function Section2() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full" data-name="Section">
      <div className="bg-white relative rounded-tl-[8px] rounded-tr-[8px] shrink-0 w-full" data-name="Modal Header">
        <div aria-hidden="true" className="absolute border-[#d7dbe0] border-b border-solid inset-0 pointer-events-none rounded-tl-[8px] rounded-tr-[8px]" />
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex gap-[8px] items-center p-[16px] relative w-full">
            <Title2 />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SidebarCollapsedSections() {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[8px] items-start py-[8px] relative rounded-[8px] size-full" data-name="Sidebar_CollapsedSections">
      <Section />
      <Section1 />
      <Section2 />
    </div>
  );
}