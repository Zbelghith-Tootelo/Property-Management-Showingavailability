import svgPaths from "./svg-yfgtw6s3jc";

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
    <div className="content-stretch flex flex-col h-full items-center justify-center relative rounded-[6px] shrink-0 w-[38px]" data-name="prev">
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
    <div className="content-stretch flex flex-col h-full items-center justify-center relative rounded-[6px] shrink-0 w-[38px]" data-name="next">
      <ChevronRight />
    </div>
  );
}

function NavArrows() {
  return (
    <div className="bg-[#f4f7fe] content-stretch flex gap-[6px] h-[42px] items-center p-[2px] relative rounded-[8px] shrink-0" data-name="nav-arrows">
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
      <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[#1b2559] text-[18px] whitespace-nowrap">16 Juillet 2026</p>
    </div>
  );
}

function ListViewContainer() {
  return (
    <div className="bg-[#213163] flex-[1_0_0] h-full min-w-px relative rounded-bl-[10px] rounded-tl-[10px]" data-name="List view container">
      <div aria-hidden className="absolute border border-[#e6ebf0] border-solid inset-0 pointer-events-none rounded-bl-[10px] rounded-tl-[10px]" />
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center p-[10px] relative size-full">
          <p className="[word-break:break-word] font-['Lexend:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[14px] text-white whitespace-nowrap">Jour</p>
        </div>
      </div>
    </div>
  );
}

function DayViewContainer() {
  return (
    <div className="bg-white flex-[1_0_0] h-full min-w-px relative rounded-br-[10px] rounded-tr-[10px]" data-name="Day view container">
      <div aria-hidden className="absolute border border-[#d5dde6] border-solid inset-[-0.5px] pointer-events-none rounded-br-[10.5px] rounded-tr-[10.5px]" />
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center p-[10px] relative size-full">
          <p className="[word-break:break-word] font-['Lexend:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#213163] text-[14px] whitespace-nowrap">Semaine</p>
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

function NavigationContainer() {
  return (
    <div className="content-stretch flex gap-[25px] items-center relative shrink-0 w-full" data-name="Navigation container">
      <NavArrows />
      <Frame />
      <ViewOptionsContainer />
    </div>
  );
}

function HourCol() {
  return (
    <div className="content-stretch flex flex-col h-full items-center justify-center relative shrink-0 w-[60px]" data-name="hour-col">
      <p className="[word-break:break-word] font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[#9ca3af] text-[13px] whitespace-nowrap">07h</p>
    </div>
  );
}

function Spacer() {
  return <div className="flex-[1_0_0] min-h-px opacity-0 relative w-full" data-name="spacer" />;
}

function ContentCol() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col h-full items-center justify-center min-w-px relative" data-name="content-col">
      <Spacer />
    </div>
  );
}

function Row() {
  return (
    <div className="content-stretch flex h-[64px] items-center relative shrink-0 w-full" data-name="row-07">
      <div aria-hidden className="absolute border-[#e6ebf0] border-b border-solid inset-0 pointer-events-none" />
      <HourCol />
      <ContentCol />
    </div>
  );
}

function HourCol1() {
  return (
    <div className="content-stretch flex flex-col h-full items-center justify-center relative shrink-0 w-[60px]" data-name="hour-col">
      <p className="[word-break:break-word] font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[#9ca3af] text-[13px] whitespace-nowrap">08h</p>
    </div>
  );
}

function Spacer1() {
  return <div className="flex-[1_0_0] min-h-px opacity-0 relative w-full" data-name="spacer" />;
}

function ContentCol1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col h-full items-center justify-center min-w-px relative" data-name="content-col">
      <Spacer1 />
    </div>
  );
}

function Row1() {
  return (
    <div className="content-stretch flex h-[64px] items-center relative shrink-0 w-full" data-name="row-08">
      <div aria-hidden className="absolute border-[#e6ebf0] border-b border-solid inset-0 pointer-events-none" />
      <HourCol1 />
      <ContentCol1 />
    </div>
  );
}

function HourCol2() {
  return (
    <div className="content-stretch flex flex-col h-full items-center justify-center relative shrink-0 w-[60px]" data-name="hour-col">
      <p className="[word-break:break-word] font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[#9ca3af] text-[13px] whitespace-nowrap">09h</p>
    </div>
  );
}

function Spacer2() {
  return <div className="flex-[1_0_0] min-h-px opacity-0 relative w-full" data-name="spacer" />;
}

function ContentCol2() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col h-full items-center justify-center min-w-px relative" data-name="content-col">
      <Spacer2 />
    </div>
  );
}

function Row2() {
  return (
    <div className="content-stretch flex h-[64px] items-center relative shrink-0 w-full" data-name="row-09">
      <div aria-hidden className="absolute border-[#e6ebf0] border-b border-solid inset-0 pointer-events-none" />
      <HourCol2 />
      <ContentCol2 />
    </div>
  );
}

function HourCol3() {
  return (
    <div className="content-stretch flex flex-col h-full items-center justify-center relative shrink-0 w-[60px]" data-name="hour-col">
      <p className="[word-break:break-word] font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[#9ca3af] text-[13px] whitespace-nowrap">10h</p>
    </div>
  );
}

function Details() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start leading-[normal] min-w-px not-italic relative" data-name="details">
      <p className="font-['Inter:Bold',sans-serif] font-bold relative shrink-0 text-[#3b82f6] text-[10px] whitespace-nowrap">Disponible</p>
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold min-w-full relative shrink-0 text-[#1b2559] text-[14px] w-[min-content]">10h00 - 10h30</p>
    </div>
  );
}

function Pencil() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="pencil">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_2_225)" id="pencil">
          <path d={svgPaths.p291f400} id="Vector" stroke="var(--stroke-0, #1B2559)" strokeLinecap="round" />
        </g>
        <defs>
          <clipPath id="clip0_2_225">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Edit() {
  return (
    <div className="bg-[#f4f7fe] content-stretch flex flex-col items-center justify-center relative rounded-[6px] shrink-0 size-[24px]" data-name="edit">
      <Pencil />
    </div>
  );
}

function EventCard() {
  return (
    <div className="bg-white drop-shadow-[0px_1px_1.5px_rgba(0,0,0,0.05)] h-[56px] relative rounded-[8px] shrink-0 w-full" data-name="event-card">
      <div aria-hidden className="absolute border border-[#e5e7eb] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[12px] relative size-full">
          <div className="bg-[#3b82f6] h-[40px] relative rounded-[2px] shrink-0 w-[4px]" data-name="indicator" />
          <Details />
          <Edit />
        </div>
      </div>
    </div>
  );
}

function ContentCol3() {
  return (
    <div className="flex-[1_0_0] h-full min-w-px relative" data-name="content-col">
      <div className="flex flex-col justify-center size-full">
        <div className="content-stretch flex flex-col items-start justify-center px-[16px] relative size-full">
          <EventCard />
        </div>
      </div>
    </div>
  );
}

function Row3() {
  return (
    <div className="content-stretch flex h-[64px] items-center relative shrink-0 w-full" data-name="row-10">
      <HourCol3 />
      <ContentCol3 />
    </div>
  );
}

function HourCol4() {
  return (
    <div className="content-stretch flex flex-col h-full items-center justify-center relative shrink-0 w-[60px]" data-name="hour-col">
      <p className="[word-break:break-word] font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[#9ca3af] text-[13px] whitespace-nowrap">11h</p>
    </div>
  );
}

function Spacer3() {
  return <div className="flex-[1_0_0] min-h-px opacity-0 relative w-full" data-name="spacer" />;
}

function ContentCol4() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col h-full items-center justify-center min-w-px relative" data-name="content-col">
      <Spacer3 />
    </div>
  );
}

function Row4() {
  return (
    <div className="content-stretch flex h-[64px] items-center relative shrink-0 w-full" data-name="row-11">
      <div aria-hidden className="absolute border-[#e6ebf0] border-b border-solid border-t inset-0 pointer-events-none" />
      <HourCol4 />
      <ContentCol4 />
    </div>
  );
}

function HourCol5() {
  return (
    <div className="content-stretch flex flex-col h-full items-center justify-center relative shrink-0 w-[60px]" data-name="hour-col">
      <p className="[word-break:break-word] font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[#9ca3af] text-[13px] whitespace-nowrap">12h</p>
    </div>
  );
}

function Details1() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start leading-[normal] min-w-px not-italic relative" data-name="details">
      <p className="font-['Inter:Bold',sans-serif] font-bold relative shrink-0 text-[#22c55e] text-[10px] whitespace-nowrap">Visite libre</p>
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold min-w-full relative shrink-0 text-[#1b2559] text-[14px] w-[min-content]">12h00 - 12h30</p>
    </div>
  );
}

function Pencil1() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="pencil">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_2_225)" id="pencil">
          <path d={svgPaths.p291f400} id="Vector" stroke="var(--stroke-0, #1B2559)" strokeLinecap="round" />
        </g>
        <defs>
          <clipPath id="clip0_2_225">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Edit1() {
  return (
    <div className="bg-[#f4f7fe] content-stretch flex flex-col items-center justify-center relative rounded-[6px] shrink-0 size-[24px]" data-name="edit">
      <Pencil1 />
    </div>
  );
}

function EventCard1() {
  return (
    <div className="bg-white drop-shadow-[0px_1px_1.5px_rgba(0,0,0,0.05)] h-[56px] relative rounded-[8px] shrink-0 w-full" data-name="event-card">
      <div aria-hidden className="absolute border border-[#e5e7eb] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[12px] relative size-full">
          <div className="bg-[#22c55e] h-[40px] relative rounded-[2px] shrink-0 w-[4px]" data-name="indicator" />
          <Details1 />
          <Edit1 />
        </div>
      </div>
    </div>
  );
}

function ContentCol5() {
  return (
    <div className="flex-[1_0_0] h-full min-w-px relative" data-name="content-col">
      <div className="flex flex-col justify-center size-full">
        <div className="content-stretch flex flex-col items-start justify-center px-[16px] relative size-full">
          <EventCard1 />
        </div>
      </div>
    </div>
  );
}

function Row5() {
  return (
    <div className="content-stretch flex h-[64px] items-center relative shrink-0 w-full" data-name="row-12">
      <HourCol5 />
      <ContentCol5 />
    </div>
  );
}

function HourCol6() {
  return (
    <div className="content-stretch flex flex-col h-full items-center justify-center relative shrink-0 w-[60px]" data-name="hour-col">
      <p className="[word-break:break-word] font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[#9ca3af] text-[13px] whitespace-nowrap">13h</p>
    </div>
  );
}

function Spacer4() {
  return <div className="flex-[1_0_0] min-h-px opacity-0 relative w-full" data-name="spacer" />;
}

function ContentCol6() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col h-full items-center justify-center min-w-px relative" data-name="content-col">
      <Spacer4 />
    </div>
  );
}

function Row6() {
  return (
    <div className="content-stretch flex h-[64px] items-center relative shrink-0 w-full" data-name="row-13">
      <div aria-hidden className="absolute border-[#e6ebf0] border-b border-solid inset-0 pointer-events-none" />
      <HourCol6 />
      <ContentCol6 />
    </div>
  );
}

function HourCol7() {
  return (
    <div className="content-stretch flex flex-col h-full items-center justify-center relative shrink-0 w-[60px]" data-name="hour-col">
      <p className="[word-break:break-word] font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[#9ca3af] text-[13px] whitespace-nowrap">14h</p>
    </div>
  );
}

function Details2() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start leading-[normal] min-w-px not-italic relative" data-name="details">
      <p className="font-['Inter:Bold',sans-serif] font-bold relative shrink-0 text-[#ef4444] text-[12px] whitespace-nowrap">Impossible</p>
      <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold min-w-full relative shrink-0 text-[#1b2559] text-[14px] w-[min-content]">14h00 - 14h30</p>
    </div>
  );
}

function Pencil2() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="pencil">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_2_228)" id="pencil">
          <path d={svgPaths.p291f400} id="Vector" stroke="var(--stroke-0, #1B2559)" strokeLinecap="round" />
        </g>
        <defs>
          <clipPath id="clip0_2_228">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Edit2() {
  return (
    <div className="bg-[#f4f7fe] content-stretch flex flex-col items-center justify-center relative rounded-[6px] shrink-0 size-[24px]" data-name="edit">
      <Pencil2 />
    </div>
  );
}

function EventCard2() {
  return (
    <div className="bg-white drop-shadow-[0px_1px_1.5px_rgba(0,0,0,0.05)] h-[56px] relative rounded-[8px] shrink-0 w-full" data-name="event-card">
      <div aria-hidden className="absolute border border-[#e5e7eb] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[12px] relative size-full">
          <div className="bg-[#ef4444] h-[40px] relative rounded-[2px] shrink-0 w-[4px]" data-name="indicator" />
          <Details2 />
          <Edit2 />
        </div>
      </div>
    </div>
  );
}

function ContentCol7() {
  return (
    <div className="flex-[1_0_0] h-full min-w-px relative" data-name="content-col">
      <div className="flex flex-col justify-center size-full">
        <div className="content-stretch flex flex-col items-start justify-center px-[16px] relative size-full">
          <EventCard2 />
        </div>
      </div>
    </div>
  );
}

function Row7() {
  return (
    <div className="content-stretch flex h-[64px] items-center relative shrink-0 w-full" data-name="row-14">
      <div aria-hidden className="absolute border-[#e6ebf0] border-b border-solid inset-0 pointer-events-none" />
      <HourCol7 />
      <ContentCol7 />
    </div>
  );
}

function HourCol8() {
  return (
    <div className="content-stretch flex flex-col h-full items-center justify-center relative shrink-0 w-[60px]" data-name="hour-col">
      <p className="[word-break:break-word] font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[#9ca3af] text-[13px] whitespace-nowrap">15h</p>
    </div>
  );
}

function Spacer5() {
  return <div className="flex-[1_0_0] min-h-px opacity-0 relative w-full" data-name="spacer" />;
}

function ContentCol8() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col h-full items-center justify-center min-w-px relative" data-name="content-col">
      <Spacer5 />
    </div>
  );
}

function Row8() {
  return (
    <div className="content-stretch flex h-[64px] items-center relative shrink-0 w-full" data-name="row-15">
      <div aria-hidden className="absolute border-[#e6ebf0] border-b border-solid inset-0 pointer-events-none" />
      <HourCol8 />
      <ContentCol8 />
    </div>
  );
}

function HourCol9() {
  return (
    <div className="content-stretch flex flex-col h-full items-center justify-center relative shrink-0 w-[60px]" data-name="hour-col">
      <p className="[word-break:break-word] font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[#9ca3af] text-[13px] whitespace-nowrap">16h</p>
    </div>
  );
}

function ContentCol9() {
  return (
    <div className="flex-[1_0_0] h-full min-w-px relative" data-name="content-col">
      <div className="flex flex-col justify-center size-full">
        <div className="relative size-full" />
      </div>
    </div>
  );
}

function Row9() {
  return (
    <div className="content-stretch flex h-[64px] items-center relative shrink-0 w-full" data-name="row-16">
      <div aria-hidden className="absolute border-[#e6ebf0] border-b border-solid inset-0 pointer-events-none" />
      <HourCol9 />
      <ContentCol9 />
    </div>
  );
}

function HourCol10() {
  return (
    <div className="content-stretch flex flex-col h-full items-center justify-center relative shrink-0 w-[60px]" data-name="hour-col">
      <p className="[word-break:break-word] font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[#9ca3af] text-[13px] whitespace-nowrap">17h</p>
    </div>
  );
}

function Spacer6() {
  return <div className="flex-[1_0_0] min-h-px opacity-0 relative w-full" data-name="spacer" />;
}

function ContentCol10() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col h-full items-center justify-center min-w-px relative" data-name="content-col">
      <Spacer6 />
    </div>
  );
}

function Row10() {
  return (
    <div className="content-stretch flex h-[64px] items-center relative shrink-0 w-full" data-name="row-17">
      <div aria-hidden className="absolute border-[#e6ebf0] border-b border-solid inset-0 pointer-events-none" />
      <HourCol10 />
      <ContentCol10 />
    </div>
  );
}

function HourCol11() {
  return (
    <div className="content-stretch flex flex-col h-full items-center justify-center relative shrink-0 w-[60px]" data-name="hour-col">
      <p className="[word-break:break-word] font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[#9ca3af] text-[13px] whitespace-nowrap">18h</p>
    </div>
  );
}

function Spacer7() {
  return <div className="flex-[1_0_0] min-h-px opacity-0 relative w-full" data-name="spacer" />;
}

function ContentCol11() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col h-full items-center justify-center min-w-px relative" data-name="content-col">
      <Spacer7 />
    </div>
  );
}

function Row11() {
  return (
    <div className="content-stretch flex h-[64px] items-center relative shrink-0 w-full" data-name="row-18">
      <HourCol11 />
      <ContentCol11 />
    </div>
  );
}

function HourCol12() {
  return (
    <div className="content-stretch flex flex-col h-full items-center justify-center relative shrink-0 w-[60px]" data-name="hour-col">
      <p className="[word-break:break-word] font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[#9ca3af] text-[13px] whitespace-nowrap">19h</p>
    </div>
  );
}

function Spacer8() {
  return <div className="flex-[1_0_0] min-h-px opacity-0 relative w-full" data-name="spacer" />;
}

function ContentCol12() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col h-full items-center justify-center min-w-px relative" data-name="content-col">
      <Spacer8 />
    </div>
  );
}

function Row12() {
  return (
    <div className="content-stretch flex h-[64px] items-center relative shrink-0 w-full" data-name="row-19">
      <HourCol12 />
      <ContentCol12 />
      <div className="flex-[1_0_0] h-0 min-w-px relative" data-name="divider">
        <div className="absolute inset-[-1px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 512 1">
            <line id="divider" stroke="var(--stroke-0, #F0F0F0)" x2="512" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function HourCol13() {
  return (
    <div className="content-stretch flex flex-col h-full items-center justify-center relative shrink-0 w-[60px]" data-name="hour-col">
      <p className="[word-break:break-word] font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[#9ca3af] text-[13px] whitespace-nowrap">20h</p>
    </div>
  );
}

function Spacer9() {
  return <div className="flex-[1_0_0] min-h-px opacity-0 relative w-full" data-name="spacer" />;
}

function ContentCol13() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col h-full items-center justify-center min-w-px relative" data-name="content-col">
      <Spacer9 />
    </div>
  );
}

function Row13() {
  return (
    <div className="content-stretch flex h-[64px] items-center relative shrink-0 w-full" data-name="row-20">
      <HourCol13 />
      <ContentCol13 />
    </div>
  );
}

function Rows() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col items-start min-h-px relative w-full" data-name="rows">
      <Row />
      <Row1 />
      <Row2 />
      <Row3 />
      <Row4 />
      <Row5 />
      <Row6 />
      <Row7 />
      <Row8 />
      <Row9 />
      <Row10 />
      <Row11 />
      <Row12 />
      <Row13 />
    </div>
  );
}

function TimelineArea() {
  return (
    <div className="bg-white flex-[1_0_0] min-h-px relative rounded-[16px] w-full" data-name="Timeline-Area">
      <div className="content-stretch flex flex-col items-start overflow-clip relative rounded-[inherit] size-full">
        <Rows />
      </div>
      <div aria-hidden className="absolute border border-[#e5e7eb] border-solid inset-0 pointer-events-none rounded-[16px]" />
    </div>
  );
}

export default function MainContent() {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[16px] items-start p-[32px] relative size-full" data-name="Main-Content">
      <NavigationContainer />
      <TimelineArea />
    </div>
  );
}