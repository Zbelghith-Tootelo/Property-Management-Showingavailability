function RadioUnselected() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="radio-unselected">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="radio-unselected">
          <rect fill="var(--fill-0, white)" height="14" rx="7" width="14" x="1" y="1" />
          <rect height="14" rx="7" stroke="var(--stroke-0, #C8102E)" strokeWidth="2" width="14" x="1" y="1" />
          <circle cx="8" cy="8" fill="var(--fill-0, #C8102E)" id="Ellipse 2013" r="4" />
        </g>
      </svg>
    </div>
  );
}

export default function ChipImpossible() {
  return (
    <div className="bg-[#c8102e] content-stretch flex gap-[8px] items-center justify-center px-[12px] py-[8px] relative rounded-[999px] size-full" data-name="chip-impossible">
      <div aria-hidden className="absolute border border-[#c8102e] border-solid inset-0 pointer-events-none rounded-[999px]" />
      <RadioUnselected />
      <p className="[word-break:break-word] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] not-italic relative shrink-0 text-[14px] text-white whitespace-nowrap">Impossible</p>
    </div>
  );
}