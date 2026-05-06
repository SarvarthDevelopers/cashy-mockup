import svgPaths from "./svg-4o201vrq4p";

function Menu() {
  return (
    <div className="content-stretch flex font-['Inter:Regular',sans-serif] font-normal gap-[32px] items-center leading-[1.4] not-italic relative shrink-0 text-[#fbfcfc] text-[16px] whitespace-nowrap" data-name="Menu">
      <p className="relative shrink-0">Deals</p>
      <p className="relative shrink-0">Items</p>
      <p className="relative shrink-0">Customers</p>
      <p className="relative shrink-0">Cashbook</p>
    </div>
  );
}

function Left() {
  return (
    <div className="content-stretch flex gap-[48px] items-center relative shrink-0" data-name="Left">
      <div className="h-[26px] overflow-clip relative shrink-0 w-[87px]" data-name="Cashy_Logo">
        <div className="absolute inset-[3.52%_72.41%_3.52%_0]" data-name="Vector">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24.1684">
            <path d={svgPaths.p31dad700} fill="var(--fill-0, white)" id="Vector" />
          </svg>
        </div>
        <div className="absolute inset-[33.77%_0.47%_33.92%_37.64%]" data-name="Vector">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 53.8469 8.4">
            <path d={svgPaths.p2dfd2f70} fill="var(--fill-0, white)" id="Vector" />
          </svg>
        </div>
      </div>
      <Menu />
    </div>
  );
}

function ButtonContent() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Button / Content">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-end leading-[0] not-italic relative shrink-0 text-[14px] text-white whitespace-nowrap">
        <p className="leading-[1.4]">Create a Deal</p>
      </div>
    </div>
  );
}

function ButtonContent1() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Button / Content">
      <div className="overflow-clip relative shrink-0 size-[20px]" data-name="icon">
        <div className="absolute inset-[4.17%]" data-name="Icon">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 22">
            <g id="Icon">
              <path clipRule="evenodd" d={svgPaths.p2b793800} fill="var(--fill-0, #FBFCFC)" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.p29839e80} fill="var(--fill-0, #FBFCFC)" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.p12593c00} fill="var(--fill-0, #FBFCFC)" fillRule="evenodd" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}

function ButtonContent2() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Button / Content">
      <div className="overflow-clip relative shrink-0 size-[20px]" data-name="icon">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
          <g id="Icon">
            <path clipRule="evenodd" d={svgPaths.p30a1d300} fill="var(--fill-0, #FBFCFC)" fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p3b47d500} fill="var(--fill-0, #FBFCFC)" fillRule="evenodd" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function ButtonContent3() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Button / Content">
      <div className="overflow-clip relative shrink-0 size-[20px]" data-name="icon">
        <div className="absolute inset-[8.33%]" data-name="Icon">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
            <g id="Icon">
              <path clipRule="evenodd" d={svgPaths.p1069e600} fill="var(--fill-0, #FBFCFC)" fillRule="evenodd" />
              <path d={svgPaths.pc221200} fill="var(--fill-0, #FBFCFC)" />
              <path d={svgPaths.p32e48500} fill="var(--fill-0, #FBFCFC)" />
              <path d={svgPaths.p131d8900} fill="var(--fill-0, #FBFCFC)" />
              <path d={svgPaths.p32559200} fill="var(--fill-0, #FBFCFC)" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}

function Buttons2() {
  return (
    <div className="content-stretch flex gap-[10px] items-center justify-end relative shrink-0" data-name="Buttons">
      <div className="bg-[#131518] content-stretch flex items-center justify-center max-h-[40px] max-w-[40px] min-h-[40px] min-w-[40px] p-[12px] relative rounded-[8px] shrink-0 size-[40px]" data-name="Button Icon">
        <div aria-hidden="true" className="absolute border border-[#4c5564] border-solid inset-0 pointer-events-none rounded-[8px]" />
        <ButtonContent1 />
      </div>
      <div className="bg-[#131518] content-stretch flex items-center justify-center max-h-[40px] max-w-[40px] min-h-[40px] min-w-[40px] p-[12px] relative rounded-[8px] shrink-0 size-[40px]" data-name="Button Icon">
        <div aria-hidden="true" className="absolute border border-[#4c5564] border-solid inset-0 pointer-events-none rounded-[8px]" />
        <ButtonContent2 />
      </div>
      <div className="bg-[#131518] content-stretch flex items-center justify-center max-h-[40px] max-w-[40px] min-h-[40px] min-w-[40px] p-[12px] relative rounded-[8px] shrink-0 size-[40px]" data-name="Button Icon">
        <div aria-hidden="true" className="absolute border border-[#4c5564] border-solid inset-0 pointer-events-none rounded-[8px]" />
        <ButtonContent3 />
      </div>
    </div>
  );
}

function Buttons1() {
  return (
    <div className="content-stretch flex gap-[10px] items-center justify-end relative shrink-0" data-name="Buttons">
      <div className="bg-[#4649e5] content-stretch flex h-[40px] items-center justify-center p-[12px] relative rounded-[8px] shrink-0" data-name="Button Base">
        <ButtonContent />
      </div>
      <Buttons2 />
    </div>
  );
}

function Buttons() {
  return (
    <div className="content-stretch flex items-center justify-end relative shrink-0" data-name="Buttons">
      <Buttons1 />
    </div>
  );
}

function ButtonContent4() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-center relative shrink-0" data-name="Button / Content">
      <div className="overflow-clip relative shrink-0 size-[20px]" data-name="icon">
        <div className="absolute inset-[4.17%]" data-name="Icon">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.3333 18.3333">
            <g id="Icon">
              <path clipRule="evenodd" d={svgPaths.p65eb700} fill="var(--fill-0, #3D444F)" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.p39867c80} fill="var(--fill-0, #3D444F)" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.p1fdc0100} fill="var(--fill-0, #3D444F)" fillRule="evenodd" />
            </g>
          </svg>
        </div>
      </div>
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-end leading-[0] not-italic relative shrink-0 text-[#3d444f] text-[14px] text-right whitespace-nowrap">
        <p className="leading-[1.4]">Back to Wizards List</p>
      </div>
    </div>
  );
}

function Frame15() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0">
      <div className="bg-[#edeef1] content-stretch flex items-center justify-center pl-[12px] pr-[16px] py-[8px] relative rounded-[8px] shrink-0" data-name="Button Base">
        <div aria-hidden="true" className="absolute border border-[#b4bbc5] border-solid inset-0 pointer-events-none rounded-[8px]" />
        <ButtonContent4 />
      </div>
      <div className="content-stretch flex items-center overflow-clip relative shrink-0" data-name="Breadcrumbs">
        <div className="content-stretch flex items-center relative shrink-0" data-name="Breadcrumb Item">
          <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#6c798b] text-[14px] whitespace-nowrap">
            <p className="leading-[1.4]">Home</p>
          </div>
        </div>
        <div className="content-stretch flex flex-col items-center overflow-clip px-[8px] relative shrink-0" data-name="Components/Separator">
          <div className="flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#6c798b] text-[14px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[22px]">/</p>
          </div>
        </div>
        <div className="content-stretch flex items-center relative shrink-0" data-name="Breadcrumb Item">
          <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#6c798b] text-[14px] whitespace-nowrap">
            <p className="leading-[1.4]">Wizards List</p>
          </div>
        </div>
        <div className="content-stretch flex flex-col items-center overflow-clip px-[8px] relative shrink-0" data-name="Components/Separator">
          <div className="flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-center leading-[0] relative shrink-0 text-[#6c798b] text-[14px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            <p className="leading-[22px]">/</p>
          </div>
        </div>
        <div className="content-stretch flex items-center relative shrink-0" data-name="Breadcrumb Item">
          <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#131518] text-[14px] whitespace-nowrap">
            <p className="leading-[1.4]">Car Wizard</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Title() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0" data-name="title">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#3d444f] text-[14px] whitespace-nowrap">
        <p className="leading-[1.4]">INPUT FIELDS</p>
      </div>
    </div>
  );
}

function Group() {
  return (
    <div className="grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0 w-full">
      <div className="col-1 content-stretch flex gap-[10px] h-[30.476px] items-center ml-0 mt-0 px-[16px] py-[8px] relative rounded-[4px] row-1 w-full" data-name="Menu Item">
        <Title />
      </div>
      <div className="col-1 h-0 ml-0 mt-[38.48px] relative row-1 w-full">
        <div className="absolute inset-[-1px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 260 1">
            <line id="Line 2" stroke="var(--stroke-0, #D7DBE0)" x2="260" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Title1() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0" data-name="title">
      <div className="overflow-clip relative shrink-0 size-[16px]" data-name="type">
        <div className="absolute inset-[12.5%]" data-name="Icon">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
            <g id="Icon">
              <path d={svgPaths.p2af8c680} fill="var(--fill-0, #131518)" />
              <path clipRule="evenodd" d={svgPaths.p2d532b80} fill="var(--fill-0, #131518)" fillRule="evenodd" />
              <path d={svgPaths.p39383280} fill="var(--fill-0, #131518)" />
              <path d={svgPaths.p13ccf000} fill="var(--fill-0, #131518)" />
            </g>
          </svg>
        </div>
      </div>
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#131518] text-[14px] whitespace-nowrap">
        <p className="leading-[1.4]">Text</p>
      </div>
    </div>
  );
}

function Title2() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0" data-name="title">
      <div className="overflow-clip relative shrink-0 size-[16px]" data-name="align-left">
        <div className="absolute inset-[20.83%_8.33%]" data-name="Icon">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.3333 9.33333">
            <g id="Icon">
              <path clipRule="evenodd" d={svgPaths.p211e3571} fill="var(--fill-0, #131518)" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.p51bee80} fill="var(--fill-0, #131518)" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.p2640e040} fill="var(--fill-0, #131518)" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.pedf0f00} fill="var(--fill-0, #131518)" fillRule="evenodd" />
            </g>
          </svg>
        </div>
      </div>
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#131518] text-[14px] whitespace-nowrap">
        <p className="leading-[1.4]">Text Area</p>
      </div>
    </div>
  );
}

function Title3() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0" data-name="title">
      <div className="overflow-clip relative shrink-0 size-[16px]" data-name="link-2">
        <div className="absolute bottom-1/4 left-0 right-0 top-1/4" data-name="Icon">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 8">
            <g id="Icon">
              <path clipRule="evenodd" d={svgPaths.p1f52e940} fill="var(--fill-0, #131518)" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.p2d1df00} fill="var(--fill-0, #131518)" fillRule="evenodd" />
            </g>
          </svg>
        </div>
      </div>
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#131518] text-[14px] whitespace-nowrap">
        <p className="leading-[1.4]">URL</p>
      </div>
    </div>
  );
}

function Title4() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0" data-name="title">
      <div className="overflow-clip relative shrink-0 size-[16px]" data-name="upload">
        <div className="absolute inset-[8.33%]" data-name="Icon">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.3333 13.3333">
            <g id="Icon">
              <path clipRule="evenodd" d={svgPaths.p25937080} fill="var(--fill-0, #131518)" fillRule="evenodd" />
              <path d={svgPaths.p21545400} fill="var(--fill-0, #131518)" />
              <path d={svgPaths.p1e5ff180} fill="var(--fill-0, #131518)" />
              <path clipRule="evenodd" d={svgPaths.p29f95a00} fill="var(--fill-0, #131518)" fillRule="evenodd" />
              <path d={svgPaths.p11b3300} fill="var(--fill-0, #131518)" />
            </g>
          </svg>
        </div>
      </div>
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#131518] text-[14px] whitespace-nowrap">
        <p className="leading-[1.4]">File Upload</p>
      </div>
    </div>
  );
}

function Title5() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0" data-name="title">
      <div className="overflow-clip relative shrink-0 size-[16px]" data-name="image">
        <div className="absolute inset-[8.33%]" data-name="Icon">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.3333 13.3333">
            <g id="Icon">
              <path d={svgPaths.p2c3f0f40} fill="var(--fill-0, #131518)" />
              <path d={svgPaths.p39288500} fill="var(--fill-0, #131518)" />
              <path d={svgPaths.p325cc500} fill="var(--fill-0, #131518)" />
              <path d={svgPaths.p14a28380} fill="var(--fill-0, #131518)" />
              <path d={svgPaths.pfb3b170} fill="var(--fill-0, #131518)" />
              <path clipRule="evenodd" d={svgPaths.p2302c380} fill="var(--fill-0, #131518)" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.p2da7d600} fill="var(--fill-0, #131518)" fillRule="evenodd" />
            </g>
          </svg>
        </div>
      </div>
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#131518] text-[14px] whitespace-nowrap">
        <p className="leading-[1.4]">Image Upload</p>
      </div>
    </div>
  );
}

function Title6() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0" data-name="title">
      <div className="overflow-clip relative shrink-0 size-[16px]" data-name="calendar">
        <div className="absolute inset-[4.17%_8.33%]" data-name="Icon">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.3333 14.6667">
            <g id="Icon">
              <path clipRule="evenodd" d={svgPaths.p2fc59c00} fill="var(--fill-0, #131518)" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.p30900d80} fill="var(--fill-0, #131518)" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.p2d3c6d00} fill="var(--fill-0, #131518)" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.p2640e040} fill="var(--fill-0, #131518)" fillRule="evenodd" />
            </g>
          </svg>
        </div>
      </div>
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#131518] text-[14px] whitespace-nowrap">
        <p className="leading-[1.4]">Date Picker</p>
      </div>
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
      <div className="bg-[#fbfcfc] h-[40px] relative rounded-[4px] shrink-0 w-full" data-name="Menu Item">
        <div aria-hidden="true" className="absolute border border-[#d7dbe0] border-solid inset-0 pointer-events-none rounded-[4px]" />
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex items-center justify-between px-[12px] py-[8px] relative size-full">
            <Title1 />
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
        </div>
      </div>
      <div className="bg-[#fbfcfc] h-[40px] relative rounded-[4px] shrink-0 w-full" data-name="Menu Item">
        <div aria-hidden="true" className="absolute border border-[#d7dbe0] border-solid inset-0 pointer-events-none rounded-[4px]" />
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex items-center justify-between px-[12px] py-[8px] relative size-full">
            <Title2 />
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
        </div>
      </div>
      <div className="bg-[#fbfcfc] h-[40px] relative rounded-[4px] shrink-0 w-full" data-name="Menu Item">
        <div aria-hidden="true" className="absolute border border-[#d7dbe0] border-solid inset-0 pointer-events-none rounded-[4px]" />
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex items-center justify-between px-[12px] py-[8px] relative size-full">
            <Title3 />
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
        </div>
      </div>
      <div className="bg-[#fbfcfc] h-[40px] relative rounded-[4px] shrink-0 w-full" data-name="Menu Item">
        <div aria-hidden="true" className="absolute border border-[#d7dbe0] border-solid inset-0 pointer-events-none rounded-[4px]" />
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex items-center justify-between px-[12px] py-[8px] relative size-full">
            <Title4 />
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
        </div>
      </div>
      <div className="bg-[#fbfcfc] h-[40px] relative rounded-[4px] shrink-0 w-full" data-name="Menu Item">
        <div aria-hidden="true" className="absolute border border-[#d7dbe0] border-solid inset-0 pointer-events-none rounded-[4px]" />
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex items-center justify-between px-[12px] py-[8px] relative size-full">
            <Title5 />
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
        </div>
      </div>
      <div className="bg-[#fbfcfc] h-[40px] relative rounded-[4px] shrink-0 w-full" data-name="Menu Item">
        <div aria-hidden="true" className="absolute border border-[#d7dbe0] border-solid inset-0 pointer-events-none rounded-[4px]" />
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex items-center justify-between px-[12px] py-[8px] relative size-full">
            <Title6 />
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
        </div>
      </div>
    </div>
  );
}

function MenuExamples() {
  return (
    <div className="relative shrink-0 w-full" data-name="Menu examples">
      <div className="content-stretch flex flex-col gap-[16px] items-start px-[16px] py-[8px] relative w-full">
        <Frame />
      </div>
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
      <Group />
      <MenuExamples />
    </div>
  );
}

function Title7() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0" data-name="title">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#3d444f] text-[14px] whitespace-nowrap">
        <p className="leading-[1.4]">{`SELECTION & LOGIC`}</p>
      </div>
    </div>
  );
}

function Group1() {
  return (
    <div className="grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0 w-full">
      <div className="col-1 content-stretch flex gap-[10px] h-[30.476px] items-center ml-0 mt-0 px-[16px] py-[8px] relative rounded-[4px] row-1 w-full" data-name="Menu Item">
        <Title7 />
      </div>
      <div className="col-1 h-0 ml-0 mt-[38.48px] relative row-1 w-full">
        <div className="absolute inset-[-1px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 260 1">
            <line id="Line 2" stroke="var(--stroke-0, #D7DBE0)" x2="260" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Title8() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0" data-name="title">
      <div className="overflow-clip relative shrink-0 size-[16px]" data-name="arrow-down-circle">
        <div className="absolute inset-[4.17%]" data-name="Icon">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.6667 14.6667">
            <g id="Icon">
              <path clipRule="evenodd" d={svgPaths.p24e57c00} fill="var(--fill-0, #131518)" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.p6279b00} fill="var(--fill-0, #131518)" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.p340ca370} fill="var(--fill-0, #131518)" fillRule="evenodd" />
            </g>
          </svg>
        </div>
      </div>
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#131518] text-[14px] whitespace-nowrap">
        <p className="leading-[1.4]">Drop Down</p>
      </div>
    </div>
  );
}

function Title9() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0" data-name="title">
      <div className="overflow-clip relative shrink-0 size-[16px]" data-name="toggle-right">
        <div className="absolute inset-[16.67%_0]" data-name="Icon">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 10.6667">
            <g id="Icon">
              <path clipRule="evenodd" d={svgPaths.p2f687600} fill="var(--fill-0, #1B1D20)" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.p59e2200} fill="var(--fill-0, #1B1D20)" fillRule="evenodd" />
            </g>
          </svg>
        </div>
      </div>
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#131518] text-[14px] whitespace-nowrap">
        <p className="leading-[1.4]">Toggle</p>
      </div>
    </div>
  );
}

function Title10() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0" data-name="title">
      <div className="overflow-clip relative shrink-0 size-[16px]" data-name="toggle-right">
        <div className="absolute inset-[16.67%_0]" data-name="Icon">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 10.6667">
            <g id="Icon">
              <path clipRule="evenodd" d={svgPaths.p2f687600} fill="var(--fill-0, #1B1D20)" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.p59e2200} fill="var(--fill-0, #1B1D20)" fillRule="evenodd" />
            </g>
          </svg>
        </div>
      </div>
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[#131518] text-[14px] whitespace-nowrap">
        <p className="leading-[1.4]">Toggle</p>
      </div>
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
      <div className="bg-[#fbfcfc] h-[40px] relative rounded-[4px] shrink-0 w-full" data-name="Menu Item">
        <div aria-hidden="true" className="absolute border border-[#d7dbe0] border-solid inset-0 pointer-events-none rounded-[4px]" />
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex items-center justify-between px-[12px] py-[8px] relative size-full">
            <Title8 />
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
        </div>
      </div>
      <div className="bg-[#fbfcfc] h-[40px] relative rounded-[4px] shrink-0 w-full" data-name="Menu Item">
        <div aria-hidden="true" className="absolute border border-[#d7dbe0] border-solid inset-0 pointer-events-none rounded-[4px]" />
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex items-center justify-between px-[12px] py-[8px] relative size-full">
            <Title9 />
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
        </div>
      </div>
      <div className="bg-[#fbfcfc] h-[40px] relative rounded-[4px] shrink-0 w-full" data-name="Menu Item">
        <div aria-hidden="true" className="absolute border border-[#d7dbe0] border-solid inset-0 pointer-events-none rounded-[4px]" />
        <div className="flex flex-row items-center size-full">
          <div className="content-stretch flex items-center justify-between px-[12px] py-[8px] relative size-full">
            <Title10 />
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
        </div>
      </div>
    </div>
  );
}

function MenuExamples1() {
  return (
    <div className="relative shrink-0 w-full" data-name="Menu examples">
      <div className="content-stretch flex flex-col gap-[16px] items-start px-[16px] py-[8px] relative w-full">
        <Frame1 />
      </div>
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full">
      <Group1 />
      <MenuExamples1 />
    </div>
  );
}

function Title11() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0" data-name="title">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#3d444f] text-[14px] whitespace-nowrap">
        <p className="leading-[1.4]">QUICK LINKS</p>
      </div>
    </div>
  );
}

function Group2() {
  return (
    <div className="grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0 w-full">
      <div className="col-1 content-stretch flex gap-[10px] h-[30.476px] items-center ml-0 mt-0 px-[16px] py-[8px] relative rounded-[4px] row-1 w-full" data-name="Menu Item">
        <Title11 />
      </div>
      <div className="col-1 h-0 ml-0 mt-[38.48px] relative row-1 w-full">
        <div className="absolute inset-[-1px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 260 1">
            <line id="Line 2" stroke="var(--stroke-0, #D7DBE0)" x2="260" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Title12() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0" data-name="title">
      <div className="overflow-clip relative shrink-0 size-[16px]" data-name="settings">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
          <g id="Icon">
            <path clipRule="evenodd" d={svgPaths.p22647380} fill="var(--fill-0, #3D444F)" fillRule="evenodd" />
            <path clipRule="evenodd" d={svgPaths.p22d4a000} fill="var(--fill-0, #3D444F)" fillRule="evenodd" />
          </g>
        </svg>
      </div>
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#3d444f] text-[14px] whitespace-nowrap">
        <p className="leading-[1.4]">Business Areas</p>
      </div>
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
      <div className="content-stretch flex gap-[10px] h-[40px] items-center py-[8px] relative rounded-[4px] shrink-0 w-full" data-name="Menu Item">
        <Title12 />
      </div>
    </div>
  );
}

function MenuExamples2() {
  return (
    <div className="relative shrink-0 w-full" data-name="Menu examples">
      <div className="content-stretch flex flex-col gap-[16px] items-start px-[16px] py-[8px] relative w-full">
        <Frame2 />
      </div>
    </div>
  );
}

function Frame5() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0 w-full">
      <Group2 />
      <MenuExamples2 />
    </div>
  );
}

function Sidebar() {
  return (
    <div className="bg-white h-full relative rounded-[8px] shrink-0 w-[260px]" data-name="Sidebar">
      <div className="content-stretch flex flex-col gap-[24px] items-start py-[8px] relative size-full">
        <Frame3 />
        <Frame4 />
        <Frame5 />
      </div>
    </div>
  );
}

function Frame10() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-end leading-[0] not-italic relative shrink-0 text-[24px] text-black text-right whitespace-nowrap">
        <p className="leading-[1.2]">Car Wizard</p>
      </div>
      <div className="overflow-clip relative shrink-0 size-[20px]" data-name="icon">
        <div className="absolute inset-[7.83%_8.33%_12.5%_8.33%]" data-name="Icon">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.6667 15.9345">
            <g id="Icon">
              <path clipRule="evenodd" d={svgPaths.p3fd37dc0} fill="var(--fill-0, #1B1D20)" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.p1a7edd00} fill="var(--fill-0, #1B1D20)" fillRule="evenodd" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}

function ToggleStatus() {
  return (
    <div className="content-stretch flex gap-[10px] items-center py-[2px] relative shrink-0" data-name="Toggle Status">
      <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#131518] text-[16px] whitespace-nowrap">
        <p className="leading-[1.4]">Active</p>
      </div>
      <div className="bg-[#16a34a] h-[20px] overflow-clip relative rounded-[19px] shrink-0 w-[40px]" data-name="Toggle">
        <div className="-translate-y-1/2 absolute right-[3px] size-[16px] top-1/2" data-name="Toggle">
          <div className="absolute inset-[-12.5%_-18.75%_-25%_-18.75%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 22">
              <g filter="url(#filter0_dd_1_2219)" id="Toggle">
                <circle cx="11" cy="10" fill="var(--fill-0, white)" r="8" />
              </g>
              <defs>
                <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="22" id="filter0_dd_1_2219" width="22" x="0" y="0">
                  <feFlood floodOpacity="0" result="BackgroundImageFix" />
                  <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                  <feOffset dy="1" />
                  <feGaussianBlur stdDeviation="1.5" />
                  <feComposite in2="hardAlpha" operator="out" />
                  <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0" />
                  <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_1_2219" />
                  <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                  <feOffset dy="1" />
                  <feGaussianBlur stdDeviation="1" />
                  <feComposite in2="hardAlpha" operator="out" />
                  <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.04 0" />
                  <feBlend in2="effect1_dropShadow_1_2219" mode="normal" result="effect2_dropShadow_1_2219" />
                  <feBlend in="SourceGraphic" in2="effect2_dropShadow_1_2219" mode="normal" result="shape" />
                </filter>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame13() {
  return (
    <div className="bg-white relative rounded-[8px] shrink-0 w-full">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-center justify-between p-[24px] relative w-full">
          <Frame10 />
          <ToggleStatus />
        </div>
      </div>
    </div>
  );
}

function ButtonContent5() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-center relative shrink-0" data-name="Button / Content">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-end leading-[0] not-italic relative shrink-0 text-[#131518] text-[14px] text-right whitespace-nowrap">
        <p className="leading-[1.4]">Research</p>
      </div>
      <div className="relative shrink-0 size-[20px]" data-name="icon">
        <div className="absolute inset-[20.83%_29.17%]" data-name="Vector">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.33333 11.6667">
            <path d={svgPaths.pec0fb80} fill="var(--fill-0, #6C798B)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function ButtonContent6() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-center relative shrink-0" data-name="Button / Content">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-end leading-[0] not-italic relative shrink-0 text-[14px] text-right text-white whitespace-nowrap">
        <p className="leading-[1.4]">Verification</p>
      </div>
      <div className="relative shrink-0 size-[20px]" data-name="icon">
        <div className="absolute inset-[20.83%_29.17%]" data-name="Vector">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.33333 11.6667">
            <path d={svgPaths.pec0fb80} fill="var(--fill-0, #6C798B)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function ButtonContent7() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-center relative shrink-0" data-name="Button / Content">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-end leading-[0] not-italic relative shrink-0 text-[#131518] text-[14px] text-right whitespace-nowrap">
        <p className="leading-[1.4]">Research</p>
      </div>
      <div className="relative shrink-0 size-[20px]" data-name="icon">
        <div className="absolute inset-[20.83%_29.17%]" data-name="Vector">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.33333 11.6667">
            <path d={svgPaths.pec0fb80} fill="var(--fill-0, #6C798B)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function ButtonContent8() {
  return (
    <div className="content-stretch flex gap-[8px] items-center justify-center relative shrink-0" data-name="Button / Content">
      <div className="overflow-clip relative shrink-0 size-[20px]" data-name="icon">
        <div className="absolute inset-[16.67%]" data-name="Icon">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.3333 13.3333">
            <g id="Icon">
              <path clipRule="evenodd" d={svgPaths.p1fe19500} fill="var(--fill-0, #3D444F)" fillRule="evenodd" />
              <path d={svgPaths.p1c76ed00} fill="var(--fill-0, #3D444F)" />
            </g>
          </svg>
        </div>
      </div>
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-end leading-[0] not-italic relative shrink-0 text-[#3d444f] text-[14px] text-right whitespace-nowrap">
        <p className="leading-[1.4]">Add Step</p>
      </div>
    </div>
  );
}

function Stepper() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative rounded-[6px] shrink-0 w-full" data-name="Stepper">
      <div className="bg-white content-stretch flex h-[40px] items-center justify-center pl-[16px] pr-[12px] py-[12px] relative rounded-[8px] shrink-0" data-name="Button Base">
        <div aria-hidden="true" className="absolute border border-[#b4bbc5] border-solid inset-0 pointer-events-none rounded-[8px]" />
        <ButtonContent5 />
      </div>
      <div className="bg-[#17142b] content-stretch flex h-[40px] items-center justify-center pl-[16px] pr-[12px] py-[12px] relative rounded-[8px] shrink-0" data-name="Button Base">
        <ButtonContent6 />
      </div>
      <div className="bg-white content-stretch flex h-[40px] items-center justify-center pl-[16px] pr-[12px] py-[12px] relative rounded-[8px] shrink-0" data-name="Button Base">
        <div aria-hidden="true" className="absolute border border-[#b4bbc5] border-solid inset-0 pointer-events-none rounded-[8px]" />
        <ButtonContent7 />
      </div>
      <div className="bg-[#edeef1] content-stretch flex h-[40px] items-center justify-center pl-[12px] pr-[16px] py-[12px] relative rounded-[8px] shrink-0" data-name="Button Base">
        <div aria-hidden="true" className="absolute border border-[#b4bbc5] border-solid inset-0 pointer-events-none rounded-[8px]" />
        <ButtonContent8 />
      </div>
    </div>
  );
}

function Frame11() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-end leading-[0] not-italic relative shrink-0 text-[24px] text-black text-right whitespace-nowrap">
        <p className="leading-[1.2]">Verification</p>
      </div>
      <div className="overflow-clip relative shrink-0 size-[20px]" data-name="icon">
        <div className="absolute inset-[7.83%_8.33%_12.5%_8.33%]" data-name="Icon">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.6667 15.9345">
            <g id="Icon">
              <path clipRule="evenodd" d={svgPaths.p3fd37dc0} fill="var(--fill-0, #1B1D20)" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.p1a7edd00} fill="var(--fill-0, #1B1D20)" fillRule="evenodd" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}

function ButtonContent9() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Button / Content">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-end leading-[0] not-italic relative shrink-0 text-[#b91d1c] text-[14px] whitespace-nowrap">
        <p className="leading-[1.4]">Remove Step</p>
      </div>
    </div>
  );
}

function Frame9() {
  return (
    <div className="content-stretch flex items-center justify-end relative shrink-0 w-[603px]">
      <div className="bg-[#fef2f2] content-stretch flex items-center justify-center px-[12px] py-[8px] relative rounded-[8px] shrink-0" data-name="Button Base">
        <ButtonContent9 />
      </div>
    </div>
  );
}

function Frame8() {
  return (
    <div className="content-stretch flex h-[40px] items-center justify-between relative shrink-0 w-full">
      <Frame11 />
      <Frame9 />
    </div>
  );
}

function Container1() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <div className="relative shrink-0 size-[20px]" data-name="icon">
          <div className="absolute inset-[20.83%_29.17%]" data-name="Vector">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.33333 11.6667">
              <path d={svgPaths.pec0fb80} fill="var(--fill-0, #6C798B)" id="Vector" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame14() {
  return (
    <div className="bg-[#d7dbe0] relative rounded-[8px] shrink-0">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip p-[10px] relative rounded-[inherit]">
        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="type">
          <div className="absolute inset-[12.5%]" data-name="Icon">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
              <g id="Icon">
                <path d={svgPaths.p2af8c680} fill="var(--fill-0, #131518)" />
                <path clipRule="evenodd" d={svgPaths.p2d532b80} fill="var(--fill-0, #131518)" fillRule="evenodd" />
                <path d={svgPaths.p39383280} fill="var(--fill-0, #131518)" />
                <path d={svgPaths.p13ccf000} fill="var(--fill-0, #131518)" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="h-[21px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[21px] left-0 not-italic text-[#131518] text-[14px] top-0 whitespace-nowrap">VIN Number</p>
    </div>
  );
}

function Container4() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16.5px] left-0 not-italic text-[#6c798b] text-[11px] top-[0.5px] whitespace-nowrap">Text Input • Enter VIN</p>
    </div>
  );
}

function Container2() {
  return (
    <div className="flex-[597.094_0_0] h-[41.5px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-start relative size-full">
        <Container3 />
        <Container4 />
      </div>
    </div>
  );
}

function ToggleStatus1() {
  return (
    <div className="h-full relative shrink-0" data-name="Toggle Status">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[10px] h-full items-center py-[2px] relative">
          <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#131518] text-[16px] whitespace-nowrap">
            <p className="leading-[1.4]">Required</p>
          </div>
          <div className="bg-[#151027] h-[20px] overflow-clip relative rounded-[19px] shrink-0 w-[40px]" data-name="Toggle">
            <div className="-translate-y-1/2 absolute right-[3px] size-[16px] top-1/2" data-name="Toggle">
              <div className="absolute inset-[-12.5%_-18.75%_-25%_-18.75%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 22">
                  <g filter="url(#filter0_dd_1_2219)" id="Toggle">
                    <circle cx="11" cy="10" fill="var(--fill-0, white)" r="8" />
                  </g>
                  <defs>
                    <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="22" id="filter0_dd_1_2219" width="22" x="0" y="0">
                      <feFlood floodOpacity="0" result="BackgroundImageFix" />
                      <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                      <feOffset dy="1" />
                      <feGaussianBlur stdDeviation="1.5" />
                      <feComposite in2="hardAlpha" operator="out" />
                      <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0" />
                      <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_1_2219" />
                      <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                      <feOffset dy="1" />
                      <feGaussianBlur stdDeviation="1" />
                      <feComposite in2="hardAlpha" operator="out" />
                      <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.04 0" />
                      <feBlend in2="effect1_dropShadow_1_2219" mode="normal" result="effect2_dropShadow_1_2219" />
                      <feBlend in="SourceGraphic" in2="effect2_dropShadow_1_2219" mode="normal" result="shape" />
                    </filter>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ButtonContent10() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 w-[16px]" data-name="Button / Content">
      <div className="overflow-clip relative shrink-0 size-[16px]" data-name="icon">
        <div className="absolute inset-[4.17%_8.33%]" data-name="Icon">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.3333 14.6667">
            <g id="Icon">
              <path clipRule="evenodd" d={svgPaths.p38ef9c80} fill="var(--fill-0, #131518)" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.p3d5ca800} fill="var(--fill-0, #131518)" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.p732ef00} fill="var(--fill-0, #131518)" fillRule="evenodd" />
              <path d={svgPaths.p35b9a200} fill="var(--fill-0, #131518)" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}

function ButtonIcon() {
  return (
    <div className="bg-white content-stretch flex items-center justify-center p-[8px] relative rounded-[8px] shrink-0" data-name="Button Icon">
      <div aria-hidden="true" className="absolute border border-[#b4bbc5] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <ButtonContent10 />
    </div>
  );
}

function Frame17() {
  return (
    <div className="h-full relative shrink-0">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[16px] h-full items-center relative">
        <ToggleStatus1 />
        <ButtonIcon />
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="bg-white flex-[1_0_0] h-[71.5px] min-h-px min-w-px relative rounded-[8px]" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[#b4bbc5] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[15px] py-px relative size-full">
          <Container1 />
          <Frame14 />
          <Container2 />
          <Frame17 />
        </div>
      </div>
    </div>
  );
}

function Frame7() {
  return (
    <div className="content-stretch flex items-start overflow-clip relative shrink-0 w-full">
      <Container />
    </div>
  );
}

function Container6() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <div className="relative shrink-0 size-[20px]" data-name="icon">
          <div className="absolute inset-[20.83%_29.17%]" data-name="Vector">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.33333 11.6667">
              <path d={svgPaths.pec0fb80} fill="var(--fill-0, #6C798B)" id="Vector" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame19() {
  return (
    <div className="bg-[#d7dbe0] relative rounded-[8px] shrink-0">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip p-[10px] relative rounded-[inherit]">
        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="arrow-down-circle">
          <div className="absolute inset-[4.17%]" data-name="Icon">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.6667 14.6667">
              <g id="Icon">
                <path clipRule="evenodd" d={svgPaths.p24e57c00} fill="var(--fill-0, #131518)" fillRule="evenodd" />
                <path clipRule="evenodd" d={svgPaths.p6279b00} fill="var(--fill-0, #131518)" fillRule="evenodd" />
                <path clipRule="evenodd" d={svgPaths.p340ca370} fill="var(--fill-0, #131518)" fillRule="evenodd" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="h-[21px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[21px] left-0 not-italic text-[#131518] text-[14px] top-0 whitespace-nowrap">Roadworthiness</p>
    </div>
  );
}

function Container9() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16.5px] left-0 not-italic text-[#6c798b] text-[11px] top-[0.5px] whitespace-nowrap">Checkbox • Select</p>
    </div>
  );
}

function Container7() {
  return (
    <div className="flex-[597.094_0_0] h-[41.5px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-start relative size-full">
        <Container8 />
        <Container9 />
      </div>
    </div>
  );
}

function ToggleStatus2() {
  return (
    <div className="h-full relative shrink-0" data-name="Toggle Status">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[10px] h-full items-center py-[2px] relative">
          <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#131518] text-[16px] whitespace-nowrap">
            <p className="leading-[1.4]">Required</p>
          </div>
          <div className="bg-[#151027] h-[20px] overflow-clip relative rounded-[19px] shrink-0 w-[40px]" data-name="Toggle">
            <div className="-translate-y-1/2 absolute right-[3px] size-[16px] top-1/2" data-name="Toggle">
              <div className="absolute inset-[-12.5%_-18.75%_-25%_-18.75%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 22">
                  <g filter="url(#filter0_dd_1_2219)" id="Toggle">
                    <circle cx="11" cy="10" fill="var(--fill-0, white)" r="8" />
                  </g>
                  <defs>
                    <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="22" id="filter0_dd_1_2219" width="22" x="0" y="0">
                      <feFlood floodOpacity="0" result="BackgroundImageFix" />
                      <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                      <feOffset dy="1" />
                      <feGaussianBlur stdDeviation="1.5" />
                      <feComposite in2="hardAlpha" operator="out" />
                      <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0" />
                      <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_1_2219" />
                      <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                      <feOffset dy="1" />
                      <feGaussianBlur stdDeviation="1" />
                      <feComposite in2="hardAlpha" operator="out" />
                      <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.04 0" />
                      <feBlend in2="effect1_dropShadow_1_2219" mode="normal" result="effect2_dropShadow_1_2219" />
                      <feBlend in="SourceGraphic" in2="effect2_dropShadow_1_2219" mode="normal" result="shape" />
                    </filter>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ButtonContent11() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 w-[16px]" data-name="Button / Content">
      <div className="overflow-clip relative shrink-0 size-[16px]" data-name="icon">
        <div className="absolute inset-[4.17%_8.33%]" data-name="Icon">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.3333 14.6667">
            <g id="Icon">
              <path clipRule="evenodd" d={svgPaths.p38ef9c80} fill="var(--fill-0, #131518)" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.p3d5ca800} fill="var(--fill-0, #131518)" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.p732ef00} fill="var(--fill-0, #131518)" fillRule="evenodd" />
              <path d={svgPaths.p35b9a200} fill="var(--fill-0, #131518)" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}

function ButtonIcon1() {
  return (
    <div className="bg-white content-stretch flex items-center justify-center p-[8px] relative rounded-[8px] shrink-0" data-name="Button Icon">
      <div aria-hidden="true" className="absolute border border-[#b4bbc5] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <ButtonContent11 />
    </div>
  );
}

function Frame20() {
  return (
    <div className="h-full relative shrink-0">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[16px] h-full items-center relative">
        <ToggleStatus2 />
        <ButtonIcon1 />
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="bg-white flex-[1_0_0] h-[71.5px] min-h-px min-w-px relative rounded-[8px]" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[#b4bbc5] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[15px] py-px relative size-full">
          <Container6 />
          <Frame19 />
          <Container7 />
          <Frame20 />
        </div>
      </div>
    </div>
  );
}

function Frame18() {
  return (
    <div className="content-stretch flex items-start overflow-clip relative shrink-0 w-full">
      <Container5 />
    </div>
  );
}

function Container11() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <div className="relative shrink-0 size-[20px]" data-name="icon">
          <div className="absolute inset-[20.83%_29.17%]" data-name="Vector">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.33333 11.6667">
              <path d={svgPaths.pec0fb80} fill="var(--fill-0, #6C798B)" id="Vector" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame22() {
  return (
    <div className="bg-[#d7dbe0] relative rounded-[8px] shrink-0">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip p-[10px] relative rounded-[inherit]">
        <div className="overflow-clip relative shrink-0 size-[16px]" data-name="upload">
          <div className="absolute inset-[8.33%]" data-name="Icon">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.3333 13.3333">
              <g id="Icon">
                <path clipRule="evenodd" d={svgPaths.p25937080} fill="var(--fill-0, #131518)" fillRule="evenodd" />
                <path d={svgPaths.p21545400} fill="var(--fill-0, #131518)" />
                <path d={svgPaths.p1e5ff180} fill="var(--fill-0, #131518)" />
                <path clipRule="evenodd" d={svgPaths.p29f95a00} fill="var(--fill-0, #131518)" fillRule="evenodd" />
                <path d={svgPaths.p11b3300} fill="var(--fill-0, #131518)" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="h-[21px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[21px] left-0 not-italic text-[#131518] text-[14px] top-0 whitespace-nowrap">Roadworthiness</p>
    </div>
  );
}

function Container14() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16.5px] left-0 not-italic text-[#6c798b] text-[11px] top-[0.5px] whitespace-nowrap">Image Upload • Upload</p>
    </div>
  );
}

function Container12() {
  return (
    <div className="flex-[597.094_0_0] h-[41.5px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-start relative size-full">
        <Container13 />
        <Container14 />
      </div>
    </div>
  );
}

function ToggleStatus3() {
  return (
    <div className="h-full relative shrink-0" data-name="Toggle Status">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[10px] h-full items-center py-[2px] relative">
          <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#131518] text-[16px] whitespace-nowrap">
            <p className="leading-[1.4]">Required</p>
          </div>
          <div className="bg-[#151027] h-[20px] overflow-clip relative rounded-[19px] shrink-0 w-[40px]" data-name="Toggle">
            <div className="-translate-y-1/2 absolute right-[3px] size-[16px] top-1/2" data-name="Toggle">
              <div className="absolute inset-[-12.5%_-18.75%_-25%_-18.75%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 22">
                  <g filter="url(#filter0_dd_1_2219)" id="Toggle">
                    <circle cx="11" cy="10" fill="var(--fill-0, white)" r="8" />
                  </g>
                  <defs>
                    <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="22" id="filter0_dd_1_2219" width="22" x="0" y="0">
                      <feFlood floodOpacity="0" result="BackgroundImageFix" />
                      <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                      <feOffset dy="1" />
                      <feGaussianBlur stdDeviation="1.5" />
                      <feComposite in2="hardAlpha" operator="out" />
                      <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0" />
                      <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_1_2219" />
                      <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                      <feOffset dy="1" />
                      <feGaussianBlur stdDeviation="1" />
                      <feComposite in2="hardAlpha" operator="out" />
                      <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.04 0" />
                      <feBlend in2="effect1_dropShadow_1_2219" mode="normal" result="effect2_dropShadow_1_2219" />
                      <feBlend in="SourceGraphic" in2="effect2_dropShadow_1_2219" mode="normal" result="shape" />
                    </filter>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ButtonContent12() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 w-[16px]" data-name="Button / Content">
      <div className="overflow-clip relative shrink-0 size-[16px]" data-name="icon">
        <div className="absolute inset-[4.17%_8.33%]" data-name="Icon">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.3333 14.6667">
            <g id="Icon">
              <path clipRule="evenodd" d={svgPaths.p38ef9c80} fill="var(--fill-0, #131518)" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.p3d5ca800} fill="var(--fill-0, #131518)" fillRule="evenodd" />
              <path clipRule="evenodd" d={svgPaths.p732ef00} fill="var(--fill-0, #131518)" fillRule="evenodd" />
              <path d={svgPaths.p35b9a200} fill="var(--fill-0, #131518)" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}

function ButtonIcon2() {
  return (
    <div className="bg-white content-stretch flex items-center justify-center p-[8px] relative rounded-[8px] shrink-0" data-name="Button Icon">
      <div aria-hidden="true" className="absolute border border-[#b4bbc5] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <ButtonContent12 />
    </div>
  );
}

function Frame23() {
  return (
    <div className="h-full relative shrink-0">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[16px] h-full items-center relative">
        <ToggleStatus3 />
        <ButtonIcon2 />
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="bg-white flex-[1_0_0] h-[71.5px] min-h-px min-w-px relative rounded-[8px]" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[#b4bbc5] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[15px] py-px relative size-full">
          <Container11 />
          <Frame22 />
          <Container12 />
          <Frame23 />
        </div>
      </div>
    </div>
  );
}

function Frame21() {
  return (
    <div className="content-stretch flex items-start overflow-clip relative shrink-0 w-full">
      <Container10 />
    </div>
  );
}

function Frame16() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
      <Frame7 />
      <Frame18 />
      <Frame21 />
    </div>
  );
}

function Frame6() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] h-[494px] items-start overflow-clip relative rounded-[8px] shrink-0 w-full">
      <Frame8 />
      <Frame16 />
    </div>
  );
}

function Body1() {
  return (
    <div className="bg-white flex-[1_0_0] min-h-px min-w-px relative rounded-[8px] w-full" data-name="Body">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col gap-[24px] items-start p-[24px] relative size-full">
          <Stepper />
          <div className="h-0 relative shrink-0 w-full">
            <div className="absolute inset-[-1px_0_0_0]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1280 1">
                <line id="Line 2" stroke="var(--stroke-0, #D7DBE0)" x2="1280" y1="0.5" y2="0.5" />
              </svg>
            </div>
          </div>
          <Frame6 />
        </div>
      </div>
    </div>
  );
}

function Frame12() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] h-full items-start relative shrink-0 w-[1328px]">
      <Frame13 />
      <Body1 />
    </div>
  );
}

function Title13() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0" data-name="title">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#3d444f] text-[14px] whitespace-nowrap">
        <p className="leading-[1.4]">ASSIGNMENTS</p>
      </div>
    </div>
  );
}

function Group3() {
  return (
    <div className="grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0 w-full">
      <div className="col-1 content-stretch flex gap-[10px] h-[30.476px] items-center ml-0 mt-0 px-[16px] py-[8px] relative rounded-[4px] row-1 w-full" data-name="Menu Item">
        <Title13 />
      </div>
      <div className="col-1 h-0 ml-0 mt-[38.48px] relative row-1 w-full">
        <div className="absolute inset-[-1px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 260 1">
            <line id="Line 2" stroke="var(--stroke-0, #D7DBE0)" x2="260" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Content() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[8px] items-center min-h-px min-w-px relative" data-name="Content">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.4] not-italic relative shrink-0 text-[#131518] text-[16px] whitespace-nowrap">{`Automotive > Car`}</p>
    </div>
  );
}

function Input() {
  return (
    <div className="bg-white h-[40px] relative rounded-[8px] shrink-0 w-full" data-name="Input">
      <div aria-hidden="true" className="absolute border border-[#b4bbc5] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center px-[12px] py-[8px] relative size-full">
          <Content />
          <div className="overflow-clip relative shrink-0 size-[20px]" data-name="chevron-down">
            <div className="absolute inset-[33.33%_20.83%]" data-name="Icon">
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.6667 6.66667">
                <path clipRule="evenodd" d={svgPaths.p2a5900} fill="var(--fill-0, #3D444F)" fillRule="evenodd" id="Icon" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InputWithLabel() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full" data-name="Input with label">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[1.4] not-italic relative shrink-0 text-[#3d444f] text-[14px] whitespace-nowrap">Apply to Category</p>
      <Input />
    </div>
  );
}

function Content1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[8px] items-center min-h-px min-w-px relative" data-name="Content">
      <div className="overflow-clip relative shrink-0 size-[20px]" data-name="globe">
        <div className="absolute inset-[4.17%]" data-name="Icon">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.3333 18.3333">
            <g id="Icon">
              <path d={svgPaths.p358c3400} fill="var(--fill-0, #151027)" />
              <path clipRule="evenodd" d={svgPaths.p39b61e40} fill="var(--fill-0, #151027)" fillRule="evenodd" />
              <path d={svgPaths.p210dae00} fill="var(--fill-0, #151027)" />
            </g>
          </svg>
        </div>
      </div>
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[1.4] not-italic relative shrink-0 text-[#131518] text-[16px] whitespace-nowrap">Global</p>
    </div>
  );
}

function Input1() {
  return (
    <div className="bg-white h-[40px] relative rounded-[8px] shrink-0 w-full" data-name="Input">
      <div aria-hidden="true" className="absolute border border-[#b4bbc5] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[8px] items-center px-[12px] py-[8px] relative size-full">
          <Content1 />
          <div className="overflow-clip relative shrink-0 size-[20px]" data-name="chevron-down">
            <div className="absolute inset-[33.33%_20.83%]" data-name="Icon">
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.6667 6.66667">
                <path clipRule="evenodd" d={svgPaths.p2a5900} fill="var(--fill-0, #3D444F)" fillRule="evenodd" id="Icon" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InputWithLabel1() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full" data-name="Input with label">
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[1.4] not-italic relative shrink-0 text-[#3d444f] text-[14px] whitespace-nowrap">Apply to Shop / Branch</p>
      <Input1 />
    </div>
  );
}

function MenuExamples3() {
  return (
    <div className="relative shrink-0 w-full" data-name="Menu examples">
      <div className="content-stretch flex flex-col gap-[24px] items-start px-[16px] py-[8px] relative w-full">
        <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Dropdown Input">
          <InputWithLabel />
        </div>
        <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Dropdown Input">
          <InputWithLabel1 />
        </div>
      </div>
    </div>
  );
}

function Frame24() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative shrink-0 w-full">
      <Group3 />
      <MenuExamples3 />
    </div>
  );
}

function ButtonContent13() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Button / Content">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-end leading-[0] not-italic relative shrink-0 text-[14px] text-white whitespace-nowrap">
        <p className="leading-[1.4]">Save and Close</p>
      </div>
    </div>
  );
}

function Frame25() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="flex flex-row items-center justify-end size-full">
        <div className="content-stretch flex items-center justify-end px-[16px] py-[8px] relative w-full">
          <div className="bg-[#17142b] flex-[1_0_0] h-[40px] min-h-px min-w-px relative rounded-[8px]" data-name="Button Base">
            <div className="flex flex-row items-center justify-center size-full">
              <div className="content-stretch flex items-center justify-center p-[12px] relative size-full">
                <ButtonContent13 />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Sidebar1() {
  return (
    <div className="bg-white h-full relative rounded-[8px] shrink-0 w-[260px]" data-name="Sidebar">
      <div className="content-stretch flex flex-col items-start justify-between py-[12px] relative size-full">
        <Frame24 />
        <Frame25 />
      </div>
    </div>
  );
}

function Main1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[12px] items-start min-h-px min-w-px relative w-full" data-name="Main">
      <Sidebar />
      <Frame12 />
      <Sidebar1 />
    </div>
  );
}

function Body() {
  return (
    <div className="bg-[#edeef1] h-[956px] relative shrink-0 w-full" data-name="body">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col gap-[12px] items-start p-[24px] relative size-full">
          <Frame15 />
          <Main1 />
        </div>
      </div>
    </div>
  );
}

function Main() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 top-0 w-[1920px]" data-name="Main">
      <div className="bg-[#131518] h-[60px] relative shrink-0 w-full" data-name="headerWebLight">
        <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
          <div className="content-stretch flex items-center justify-between px-[24px] relative size-full">
            <Left />
            <Buttons />
          </div>
        </div>
      </div>
      <Body />
    </div>
  );
}

export default function Component9DealWizardBuilder() {
  return (
    <div className="relative size-full" data-name="9 / Deal Wizard Builder">
      <Main />
    </div>
  );
}