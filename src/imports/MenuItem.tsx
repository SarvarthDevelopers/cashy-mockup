import svgPaths from "./svg-jusezbzcm9";

function Title() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0" data-name="title">
      <div className="overflow-clip relative shrink-0 size-[16px]" data-name="check-square">
        <div className="absolute inset-[8.33%_4.17%_8.33%_8.33%]" data-name="Icon">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 13.3333">
            <g id="Icon">
              <path clipRule="evenodd" d={svgPaths.p2e52cc00} fill="var(--fill-0, #1B1D20)" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.pd7544a0} fill="var(--fill-0, #1B1D20)" fillRule="evenodd" />
            </g>
          </svg>
        </div>
      </div>
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#131518] text-[14px] whitespace-nowrap">
        <p className="leading-[1.4]">Checkbox</p>
      </div>
    </div>
  );
}

export default function MenuItem() {
  return (
    <div className="bg-[#fbfcfc] content-stretch flex items-center justify-between px-[12px] py-[8px] relative rounded-[4px] size-full" data-name="Menu Item">
      <div aria-hidden="true" className="absolute border border-[#d7dbe0] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <Title />
      <div className="overflow-clip relative shrink-0 size-[16px]" data-name="plus">
        <div className="absolute inset-[16.67%]" data-name="Icon">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.6667 10.6667">
            <g id="Icon">
              <path clipRule="evenodd" d={svgPaths.p33ab2580} fill="var(--fill-0, #8A95A6)" fillRule="evenodd" />
              <path d={svgPaths.p6d82800} fill="var(--fill-0, #8A95A6)" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}