import svgPaths from "./svg-hs16wvxn65";

function Frame4() {
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
              <g filter="url(#filter0_dd_2_948)" id="Toggle">
                <circle cx="11" cy="10" fill="var(--fill-0, white)" r="8" />
              </g>
              <defs>
                <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="22" id="filter0_dd_2_948" width="22" x="0" y="0">
                  <feFlood floodOpacity="0" result="BackgroundImageFix" />
                  <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                  <feOffset dy="1" />
                  <feGaussianBlur stdDeviation="1.5" />
                  <feComposite in2="hardAlpha" operator="out" />
                  <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0" />
                  <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_2_948" />
                  <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                  <feOffset dy="1" />
                  <feGaussianBlur stdDeviation="1" />
                  <feComposite in2="hardAlpha" operator="out" />
                  <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.04 0" />
                  <feBlend in2="effect1_dropShadow_2_948" mode="normal" result="effect2_dropShadow_2_948" />
                  <feBlend in="SourceGraphic" in2="effect2_dropShadow_2_948" mode="normal" result="shape" />
                </filter>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame7() {
  return (
    <div className="bg-white relative rounded-[8px] shrink-0 w-full">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex items-center justify-between p-[24px] relative w-full">
          <Frame4 />
          <ToggleStatus />
        </div>
      </div>
    </div>
  );
}

function ButtonContent() {
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

function ButtonContent1() {
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

function ButtonContent2() {
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

function ButtonContent3() {
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
        <ButtonContent />
      </div>
      <div className="bg-[#17142b] content-stretch flex h-[40px] items-center justify-center pl-[16px] pr-[12px] py-[12px] relative rounded-[8px] shrink-0" data-name="Button Base">
        <ButtonContent1 />
      </div>
      <div className="bg-white content-stretch flex h-[40px] items-center justify-center pl-[16px] pr-[12px] py-[12px] relative rounded-[8px] shrink-0" data-name="Button Base">
        <div aria-hidden="true" className="absolute border border-[#b4bbc5] border-solid inset-0 pointer-events-none rounded-[8px]" />
        <ButtonContent2 />
      </div>
      <div className="bg-[#edeef1] content-stretch flex h-[40px] items-center justify-center pl-[12px] pr-[16px] py-[12px] relative rounded-[8px] shrink-0" data-name="Button Base">
        <div aria-hidden="true" className="absolute border border-[#b4bbc5] border-solid inset-0 pointer-events-none rounded-[8px]" />
        <ButtonContent3 />
      </div>
    </div>
  );
}

function Frame5() {
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

function ButtonContent4() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0" data-name="Button / Content">
      <div className="flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-end leading-[0] not-italic relative shrink-0 text-[#b91d1c] text-[14px] whitespace-nowrap">
        <p className="leading-[1.4]">Remove Step</p>
      </div>
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex items-center justify-end relative shrink-0 w-[603px]">
      <div className="bg-[#fef2f2] content-stretch flex items-center justify-center px-[12px] py-[8px] relative rounded-[8px] shrink-0" data-name="Button Base">
        <ButtonContent4 />
      </div>
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex h-[40px] items-center justify-between relative shrink-0 w-full">
      <Frame5 />
      <Frame3 />
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

function Frame8() {
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
                  <g filter="url(#filter0_dd_2_948)" id="Toggle">
                    <circle cx="11" cy="10" fill="var(--fill-0, white)" r="8" />
                  </g>
                  <defs>
                    <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="22" id="filter0_dd_2_948" width="22" x="0" y="0">
                      <feFlood floodOpacity="0" result="BackgroundImageFix" />
                      <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                      <feOffset dy="1" />
                      <feGaussianBlur stdDeviation="1.5" />
                      <feComposite in2="hardAlpha" operator="out" />
                      <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0" />
                      <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_2_948" />
                      <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                      <feOffset dy="1" />
                      <feGaussianBlur stdDeviation="1" />
                      <feComposite in2="hardAlpha" operator="out" />
                      <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.04 0" />
                      <feBlend in2="effect1_dropShadow_2_948" mode="normal" result="effect2_dropShadow_2_948" />
                      <feBlend in="SourceGraphic" in2="effect2_dropShadow_2_948" mode="normal" result="shape" />
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

function ButtonContent5() {
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
      <ButtonContent5 />
    </div>
  );
}

function Frame9() {
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
          <Frame8 />
          <Container2 />
          <Frame9 />
        </div>
      </div>
    </div>
  );
}

function Frame1() {
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

function Frame12() {
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
          <div className="bg-[#d7dbe0] h-[20px] overflow-clip relative rounded-[19px] shrink-0 w-[40px]" data-name="Toggle">
            <div className="-translate-y-1/2 absolute left-[3px] size-[16px] top-1/2" data-name="Toggle">
              <div className="absolute inset-[-12.5%_-37.5%_-62.5%_-37.5%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 28">
                  <g filter="url(#filter0_dd_2_946)" id="Toggle">
                    <circle cx="14" cy="10" fill="var(--fill-0, white)" r="8" />
                  </g>
                  <defs>
                    <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="28" id="filter0_dd_2_946" width="28" x="0" y="0">
                      <feFlood floodOpacity="0" result="BackgroundImageFix" />
                      <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                      <feMorphology in="SourceAlpha" operator="erode" radius="2" result="effect1_dropShadow_2_946" />
                      <feOffset dy="2" />
                      <feGaussianBlur stdDeviation="2" />
                      <feColorMatrix type="matrix" values="0 0 0 0 0.0627451 0 0 0 0 0.0941176 0 0 0 0 0.156863 0 0 0 0.06 0" />
                      <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_2_946" />
                      <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                      <feMorphology in="SourceAlpha" operator="erode" radius="2" result="effect2_dropShadow_2_946" />
                      <feOffset dy="4" />
                      <feGaussianBlur stdDeviation="4" />
                      <feColorMatrix type="matrix" values="0 0 0 0 0.0627451 0 0 0 0 0.0941176 0 0 0 0 0.156863 0 0 0 0.1 0" />
                      <feBlend in2="effect1_dropShadow_2_946" mode="normal" result="effect2_dropShadow_2_946" />
                      <feBlend in="SourceGraphic" in2="effect2_dropShadow_2_946" mode="normal" result="shape" />
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

function ButtonContent6() {
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
      <ButtonContent6 />
    </div>
  );
}

function Frame13() {
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
          <Frame12 />
          <Container7 />
          <Frame13 />
        </div>
      </div>
    </div>
  );
}

function Frame11() {
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

function Frame15() {
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
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[21px] left-0 not-italic text-[#131518] text-[14px] top-0 whitespace-nowrap">Car Photos</p>
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
                  <g filter="url(#filter0_dd_2_948)" id="Toggle">
                    <circle cx="11" cy="10" fill="var(--fill-0, white)" r="8" />
                  </g>
                  <defs>
                    <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="22" id="filter0_dd_2_948" width="22" x="0" y="0">
                      <feFlood floodOpacity="0" result="BackgroundImageFix" />
                      <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                      <feOffset dy="1" />
                      <feGaussianBlur stdDeviation="1.5" />
                      <feComposite in2="hardAlpha" operator="out" />
                      <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0" />
                      <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_2_948" />
                      <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                      <feOffset dy="1" />
                      <feGaussianBlur stdDeviation="1" />
                      <feComposite in2="hardAlpha" operator="out" />
                      <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.04 0" />
                      <feBlend in2="effect1_dropShadow_2_948" mode="normal" result="effect2_dropShadow_2_948" />
                      <feBlend in="SourceGraphic" in2="effect2_dropShadow_2_948" mode="normal" result="shape" />
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

function ButtonContent7() {
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
      <ButtonContent7 />
    </div>
  );
}

function Frame16() {
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
          <Frame15 />
          <Container12 />
          <Frame16 />
        </div>
      </div>
    </div>
  );
}

function Frame14() {
  return (
    <div className="content-stretch flex items-start overflow-clip relative shrink-0 w-full">
      <Container10 />
    </div>
  );
}

function Frame10() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start relative shrink-0 w-full">
      <Frame1 />
      <Frame11 />
      <Frame14 />
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] h-[494px] items-start overflow-clip relative rounded-[8px] shrink-0 w-full">
      <Frame2 />
      <Frame10 />
    </div>
  );
}

function Body() {
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
          <Frame />
        </div>
      </div>
    </div>
  );
}

export default function Frame6() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] items-start relative size-full">
      <Frame7 />
      <Body />
    </div>
  );
}