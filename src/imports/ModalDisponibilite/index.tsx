import svgPaths from "./svg-2jpbtmv37i";

function CloseBtn() {
  return (
    <div className="relative shrink-0 size-[28px]" data-name="close-btn">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 28">
        <g id="close-btn">
          <rect fill="var(--fill-0, #F3F8FF)" height="28" rx="4" width="28" />
          <path d={svgPaths.p3ebcdf00} fill="var(--fill-0, #B1B1B1)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Header() {
  return (
    <div className="relative shrink-0 w-full" data-name="header">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between pb-[16px] pl-[24px] pr-[20px] pt-[20px] relative size-full">
          <p className="[word-break:break-word] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[100.06999969482422%] not-italic relative shrink-0 text-[#213163] text-[20px] whitespace-nowrap">Disponibilité de la propriété</p>
          <CloseBtn />
        </div>
      </div>
    </div>
  );
}

function RadioSelected() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="radio-selected">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="radio-selected">
          <rect fill="var(--fill-0, white)" height="16" rx="8" width="16" />
          <circle cx="8" cy="8" fill="var(--fill-0, #16A34A)" id="Ellipse 2013" r="4" />
        </g>
      </svg>
    </div>
  );
}

function ChipVisiteLibreSelected() {
  return (
    <div className="bg-[#16a34a] flex-[1_0_0] h-[36px] min-w-px relative rounded-[999px]" data-name="chip-visite-libre-selected">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex gap-[8px] items-center justify-center px-[12px] py-[8px] relative size-full">
          <RadioSelected />
          <p className="[word-break:break-word] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] not-italic relative shrink-0 text-[14px] text-white whitespace-nowrap">Visite libre</p>
        </div>
      </div>
    </div>
  );
}

function RadioUnselected() {
  return (
    <div className="bg-white relative rounded-[8px] shrink-0 size-[16px]" data-name="radio-unselected">
      <div aria-hidden className="absolute border-2 border-[#3b82f6] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function ChipPreApprouve() {
  return (
    <div className="bg-white flex-[1_0_0] h-[36px] min-w-px relative rounded-[999px]" data-name="chip-pre-approuve">
      <div aria-hidden className="absolute border border-[#3b82f6] border-solid inset-0 pointer-events-none rounded-[999px]" />
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex gap-[8px] items-center justify-center px-[12px] py-[8px] relative size-full">
          <RadioUnselected />
          <p className="[word-break:break-word] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] not-italic relative shrink-0 text-[#3b82f6] text-[14px] whitespace-nowrap">Pre-Approuve</p>
        </div>
      </div>
    </div>
  );
}

function RadioUnselected1() {
  return (
    <div className="bg-white relative rounded-[8px] shrink-0 size-[16px]" data-name="radio-unselected">
      <div aria-hidden className="absolute border-2 border-[#ef4444] border-solid inset-0 pointer-events-none rounded-[8px]" />
    </div>
  );
}

function ChipImpossible() {
  return (
    <div className="bg-white flex-[1_0_0] h-[36px] min-w-px relative rounded-[999px]" data-name="chip-impossible">
      <div aria-hidden className="absolute border border-[#ef4444] border-solid inset-0 pointer-events-none rounded-[999px]" />
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex gap-[8px] items-center justify-center px-[12px] py-[8px] relative size-full">
          <RadioUnselected1 />
          <p className="[word-break:break-word] font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] not-italic relative shrink-0 text-[#ef4444] text-[14px] whitespace-nowrap">Impossible</p>
        </div>
      </div>
    </div>
  );
}

function ChipsType() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[8px] items-center min-w-px relative" data-name="chips-type">
      <ChipVisiteLibreSelected />
      <ChipPreApprouve />
      <ChipImpossible />
    </div>
  );
}

function FieldType() {
  return (
    <div className="content-stretch flex gap-[12px] items-center justify-center relative shrink-0 w-full" data-name="field-type">
      <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[#213163] text-[14px] w-[77px]">Type</p>
      <ChipsType />
    </div>
  );
}

function Clock() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="clock">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_1_655)" id="clock">
          <path d={svgPaths.p8765900} id="Vector" stroke="var(--stroke-0, #213163)" strokeLinecap="round" />
        </g>
        <defs>
          <clipPath id="clip0_1_655">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function InputDebut() {
  return (
    <div className="bg-white flex-[1_0_0] h-[36px] min-w-px relative rounded-[6px]" data-name="input-debut">
      <div aria-hidden className="absolute border border-[#e6ebf0] border-solid inset-0 pointer-events-none rounded-[6px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between pl-[12px] pr-[10px] relative size-full">
          <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#111] text-[14px] whitespace-nowrap">06:30</p>
          <Clock />
        </div>
      </div>
    </div>
  );
}

function FieldDebut() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-full" data-name="field-debut">
      <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[#213163] text-[14px] w-[77px]">Début</p>
      <InputDebut />
    </div>
  );
}

function Clock1() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="clock">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g clipPath="url(#clip0_1_655)" id="clock">
          <path d={svgPaths.p8765900} id="Vector" stroke="var(--stroke-0, #213163)" strokeLinecap="round" />
        </g>
        <defs>
          <clipPath id="clip0_1_655">
            <rect fill="white" height="16" width="16" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function InputFin() {
  return (
    <div className="bg-white flex-[1_0_0] h-[36px] min-w-px relative rounded-[6px]" data-name="input-fin">
      <div aria-hidden className="absolute border border-[#e6ebf0] border-solid inset-0 pointer-events-none rounded-[6px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between pl-[12px] pr-[10px] relative size-full">
          <p className="[word-break:break-word] font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[#111] text-[14px] whitespace-nowrap">16:00</p>
          <Clock1 />
        </div>
      </div>
    </div>
  );
}

function FieldFin() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-full" data-name="field-fin">
      <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[#213163] text-[14px] w-[77px]">Fin</p>
      <InputFin />
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

function BoutonPrincipal() {
  return (
    <div className="bg-white h-[42px] relative rounded-[8px] shrink-0 w-full" data-name="Bouton principal">
      <div aria-hidden className="absolute border border-[#e6ebf0] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-between pl-[20px] pr-[10px] py-[12px] relative size-full">
          <div className="[word-break:break-word] flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold justify-center leading-[0] not-italic relative shrink-0 text-[#213163] text-[16px] text-center whitespace-nowrap">
            <p className="leading-[24px]">Récurrence</p>
          </div>
          <ChevronRight />
        </div>
      </div>
    </div>
  );
}

function Body() {
  return (
    <div className="relative shrink-0 w-full" data-name="body">
      <div className="flex flex-col justify-center size-full">
        <div className="content-stretch flex flex-col gap-[14px] items-start justify-center px-[24px] py-[20px] relative size-full">
          <FieldType />
          <FieldDebut />
          <FieldFin />
          <BoutonPrincipal />
        </div>
      </div>
    </div>
  );
}

function BtnAnnuler() {
  return (
    <div className="bg-white content-stretch flex h-full items-center justify-center px-[16px] relative rounded-[6px] shrink-0 w-[173px]" data-name="btn-annuler">
      <div aria-hidden className="absolute border border-[#cacfd6] border-solid inset-0 pointer-events-none rounded-[6px]" />
      <p className="[word-break:break-word] font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[#111] text-[14px] whitespace-nowrap">Annuler</p>
    </div>
  );
}

function BtnSauvegarder() {
  return (
    <div className="bg-[#213163] content-stretch flex h-full items-center justify-center px-[16px] relative rounded-[6px] shrink-0 w-[150px]" data-name="btn-sauvegarder">
      <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[14px] text-white whitespace-nowrap">Sauvegarder</p>
    </div>
  );
}

function ActionsRight() {
  return (
    <div className="content-stretch flex gap-[8px] h-[42px] items-center relative shrink-0" data-name="actions-right">
      <BtnAnnuler />
      <BtnSauvegarder />
    </div>
  );
}

function Footer() {
  return (
    <div className="relative shrink-0 w-full" data-name="footer">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[24px] py-[14px] relative size-full">
          <ActionsRight />
        </div>
      </div>
    </div>
  );
}

export default function ModalDisponibilite() {
  return (
    <div className="bg-white content-stretch flex flex-col items-start overflow-clip relative rounded-[12px] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.14)] size-full" data-name="Modal Disponibilité">
      <Header />
      <div className="bg-[#e6ebf0] h-px relative shrink-0 w-full" data-name="divider-top" />
      <Body />
      <div className="bg-[#e6ebf0] h-px relative shrink-0 w-full" data-name="divider-bottom" />
      <Footer />
    </div>
  );
}