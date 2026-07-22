import svgPaths from "./svg-l55vfhtjol";

function ChevronLeft() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="chevron-left">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="chevron-left">
          <path d="M10 12L6 8L10 4" id="Vector" stroke="var(--stroke-0, #1B2559)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Prev() {
  return (
    <div className="bg-[#f3f8ff] content-stretch flex flex-col h-full items-center justify-center relative rounded-[6px] shrink-0 w-[38px]" data-name="prev">
      <ChevronLeft />
    </div>
  );
}

function TodayButtonContainer() {
  return (
    <div className="flex h-full items-center justify-center relative shrink-0">
      <div className="-scale-y-100 flex-none h-full rotate-180">
        <div className="bg-[#1aa41d] h-full relative rounded-[10px] w-[158px]" data-name="Today button container">
          <div className="flex flex-row items-center justify-center size-full">
            <div className="content-stretch flex items-center justify-center p-[10px] relative size-full">
              <div className="flex items-center justify-center relative shrink-0">
                <div className="-scale-y-100 flex-none rotate-180">
                  <p className="[word-break:break-word] font-['Lexend:Regular',sans-serif] leading-[normal] not-italic relative text-[14px] text-white whitespace-nowrap">Aujourd’hui</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChevronRight() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="chevron-right">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="chevron-right">
          <path d="M6 12L10 8L6 4" id="Vector" stroke="var(--stroke-0, #1B2559)" strokeLinecap="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Next() {
  return (
    <div className="bg-[#f3f8ff] content-stretch flex flex-col h-full items-center justify-center relative rounded-[6px] shrink-0 w-[38px]" data-name="next">
      <ChevronRight />
    </div>
  );
}

function NavArrows() {
  return (
    <div className="content-stretch flex gap-[6px] h-[42px] items-center p-[2px] relative rounded-[8px] shrink-0" data-name="nav-arrows">
      <Prev />
      <TodayButtonContainer />
      <Next />
    </div>
  );
}

function Elements() {
  return (
    <div className="absolute inset-[8.33%_10.42%]" data-name="elements">
      <div className="absolute inset-[-2%_-2.11%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24.75 26">
          <g id="elements">
            <path d="M19.875 0.5V3M4.875 0.5V3" id="Vector" stroke="var(--stroke-0, #111111)" strokeLinecap="round" strokeLinejoin="round" />
            <path d={svgPaths.p152cc900} id="Vector_2" stroke="var(--stroke-0, #111111)" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M1.75 8H23" id="Vector 4046" stroke="var(--stroke-0, #111111)" strokeLinecap="round" strokeLinejoin="round" />
            <path d={svgPaths.p3fe31a00} id="Vector_3" stroke="var(--stroke-0, #111111)" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M1.125 8H23.625" id="Vector 4049" stroke="var(--stroke-0, #111111)" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Frame1() {
  return (
    <div className="bg-[#f3f8ff] content-stretch flex items-center justify-center relative rounded-[12px] shrink-0 size-[40px]">
      <div className="overflow-clip relative shrink-0 size-[30px]" data-name="Menu icons">
        <Elements />
      </div>
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
      <Frame1 />
      <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[#1b2559] text-[18px] whitespace-nowrap">Semaine du 13 - 19 Juillet 2026</p>
    </div>
  );
}

function ListViewContainer() {
  return (
    <div className="bg-white flex-[1_0_0] h-full min-w-px relative rounded-bl-[10px] rounded-tl-[10px]" data-name="List view container">
      <div aria-hidden className="absolute border border-[#e6ebf0] border-solid inset-0 pointer-events-none rounded-bl-[10px] rounded-tl-[10px]" />
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center p-[10px] relative size-full">
          <p className="[word-break:break-word] font-['Lexend:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#213163] text-[14px] whitespace-nowrap">Jour</p>
        </div>
      </div>
    </div>
  );
}

function DayViewContainer() {
  return (
    <div className="bg-[#213163] flex-[1_0_0] h-full min-w-px relative rounded-br-[10px] rounded-tr-[10px]" data-name="Day view container">
      <div aria-hidden className="absolute border border-[#d5dde6] border-solid inset-[-0.5px] pointer-events-none rounded-br-[10.5px] rounded-tr-[10.5px]" />
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center p-[10px] relative size-full">
          <p className="[word-break:break-word] font-['Lexend:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] text-white whitespace-nowrap">Semaine</p>
        </div>
      </div>
    </div>
  );
}

function ViewOptionsContainer() {
  return (
    <div className="content-stretch flex flex-[1_0_0] h-[42px] items-center min-w-px relative rounded-[10px]" data-name="View options container">
      <ListViewContainer />
      <DayViewContainer />
    </div>
  );
}

export default function NavigationContainer() {
  return (
    <div className="content-stretch flex gap-[25px] items-center relative size-full" data-name="Navigation container">
      <NavArrows />
      <Frame />
      <ViewOptionsContainer />
    </div>
  );
}