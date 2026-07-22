import { useState, useRef, useCallback, useEffect } from "react";
import ModalDisponibilite, { type EventType, type Day, type Recurrence } from "./ModalDisponibilite";
import ImportedSidebar from "../imports/Sidebar/index";

const DAY_NAME_TO_DOW: Record<string, number> = {
  Dim: 0, Lun: 1, Mar: 2, Mer: 3, Jeu: 4, Ven: 5, Sam: 6,
};

const RECURRENCE_CYCLES: Record<Recurrence, number> = { semaine: 12, mois: 12 };

// Every checked day-of-week always produces an occurrence in the base week;
// a recurrence frequency (if any) then projects those same weekdays forward.
function generateRecurringDates(weekStart: Date, days: Day[], recurrence: Recurrence | null): string[] {
  const cycles = recurrence ? RECURRENCE_CYCLES[recurrence] : 1;
  const dates: string[] = [];

  for (const dayName of days) {
    const occurrence0 = new Date(weekStart);
    occurrence0.setDate(weekStart.getDate() + DAY_NAME_TO_DOW[dayName]);

    for (let c = 0; c < cycles; c++) {
      const d = new Date(occurrence0);
      if (recurrence === "semaine") d.setDate(occurrence0.getDate() + c * 7);
      else if (recurrence === "mois") {
        d.setMonth(occurrence0.getMonth() + c);
        // Guard against month overflow (e.g. Jan 31 + 1 month → Mar 3)
        if (d.getDate() !== occurrence0.getDate()) d.setDate(0);
      }
      dates.push(dateToISO(d));
    }
  }

  return [...new Set(dates)]; // deduplicate
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CalendarEvent {
  id: string;
  type: EventType;
  date: string; // YYYY-MM-DD
  startMinutes: number;
  endMinutes: number;
}

type ModalState =
  | { mode: "create"; date: string; startMinutes: number; endMinutes: number }
  | { mode: "edit"; event: CalendarEvent };

interface DragState {
  id: string;
  offsetY: number;     // px from card top where the grab occurred
  origDate: string;
  origStart: number;
  origEnd: number;
  duration: number;
  curDate: string;
  curStart: number;
  invalid: boolean;         // true when the current drop position can't be used
  invalidReason: string;    // why — shown on the ghost card in place of the type label
}

interface ResizeState {
  id: string;
  startY: number;
  origEnd: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const HOUR_START = 7;
const HOUR_END   = 22;
const ROW_HEIGHT = 64;
const TIME_COL_W = 60;
const DAY_NAMES  = ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];
const MONTHS_FR  = [
  "Janvier","Février","Mars","Avril","Mai","Juin",
  "Juillet","Août","Septembre","Octobre","Novembre","Décembre",
];
const HOURS     = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);
const PX_PER_MIN = ROW_HEIGHT / 60;
const SNAP_MIN   = 15;

const CARD_DISPLAY: Record<EventType, { label: string; color: string; bg: string }> = {
  "visite-libre": { label: "Visite libre", color: "#22c55e", bg: "rgba(34,197,94,0.10)" },
  "pre-approuve": { label: "Disponible",   color: "#3b82f6", bg: "#eef4ff"               },
  impossible:     { label: "Impossible",   color: "#ef4444", bg: "rgba(239,68,68,0.10)"  },
};

// Shape-coded per status (not color alone, WCAG 1.4.1) so the status still
// reads once the label truncates on narrow mobile columns.
const STATUS_ICON_PATHS: Record<EventType, string[]> = {
  "visite-libre": ["M22 11.08V12a10 10 0 11-5.93-9.14", "M22 4L12 14.01l-3-3"], // check-circle
  "pre-approuve": ["M12 2a10 10 0 110 20A10 10 0 0112 2z", "M12 6v6l4 2"],      // clock
  impossible:     ["M12 2a10 10 0 110 20A10 10 0 0112 2z", "M15 9l-6 6", "M9 9l6 6"], // x-circle
};

function StatusIcon({ type, color, size = 10 }: { type: EventType; size?: number; color: string }) {
  return <Icon paths={STATUS_ICON_PATHS[type]} color={color} size={size} />;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

function dateToISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

// "YYYY-MM-DD" is zero-padded, so a plain string comparison against today
// correctly answers "is this date before today" without parsing either side.
function isPastDate(iso: string, today: Date): boolean {
  return iso < dateToISO(today);
}

function formatWeekLabel(ws: Date): string {
  const we = new Date(ws);
  we.setDate(ws.getDate() + 6);
  if (ws.getMonth() === we.getMonth())
    return `Semaine du ${ws.getDate()} – ${we.getDate()} ${MONTHS_FR[we.getMonth()]} ${we.getFullYear()}`;
  return `${ws.getDate()} ${MONTHS_FR[ws.getMonth()]} – ${we.getDate()} ${MONTHS_FR[we.getMonth()]} ${we.getFullYear()}`;
}

function formatDayLabel(d: Date): string {
  return `${d.getDate()} ${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function minutesToTime(m: number): string {
  const h = Math.floor(m / 60), min = m % 60;
  return `${h.toString().padStart(2,"0")}:${min.toString().padStart(2,"0")}`;
}

function minutesToDisplay(m: number): string {
  const h = Math.floor(m / 60), min = m % 60;
  return `${h}h${min.toString().padStart(2,"0")}`;
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function snap(minutes: number): number {
  return Math.round(minutes / SNAP_MIN) * SNAP_MIN;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function newId(): string { return Math.random().toString(36).slice(2); }

function hasOverlap(events: CalendarEvent[], date: string, start: number, end: number, excludeId?: string): boolean {
  return events.some(ev => ev.date === date && ev.id !== excludeId && ev.startMinutes < end && ev.endMinutes > start);
}

// Resize can never grow into a later card on the same day — this is the hard ceiling for its end time.
function nextEventStart(events: CalendarEvent[], date: string, afterStart: number, excludeId: string): number {
  const laterStarts = events
    .filter(ev => ev.date === date && ev.id !== excludeId && ev.startMinutes > afterStart)
    .map(ev => ev.startMinutes);
  return laterStarts.length ? Math.min(...laterStarts) : HOUR_END * 60;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function Icon({ paths, color = "currentColor", size = 20 }: { paths: string[]; color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {paths.map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
}

const ICONS = {
  inbox:    ["M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2z","M22 8l-10 7L2 8"],
  send:     ["M22 2L11 13","M22 2L15 22l-4-9-9-4 20-7z"],
  clock:    ["M12 2a10 10 0 110 20A10 10 0 0112 2z","M12 6v6l4 2"],
  home:     ["M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z","M9 22V12h6v10"],
  report:   ["M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z","M14 2v6h6","M16 13H8","M16 17H8","M10 9H8"],
  calendar: ["M8 2v4m8-4v4M3 10h18","M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z"],
  map:      ["M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7z","M12 11a2 2 0 100-4 2 2 0 000 4z"],
  settings: ["M12 15a3 3 0 100-6 3 3 0 000 6z","M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"],
  info:     ["M12 2a10 10 0 110 20A10 10 0 0112 2z","M12 8h.01","M11 12h1v4h1"],
  logout:   ["M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4","M16 17l5-5-5-5","M21 12H9"],
  pencil:   ["M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7","M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"],
  chevL:    ["M15 18l-6-6 6-6"],
  chevR:    ["M9 18l6-6-6-6"],
};

// ─── Ghost card (drag preview) ────────────────────────────────────────────────

function GhostCard({ type, start, duration, invalid, invalidReason }: { type: EventType; start: number; duration: number; invalid?: boolean; invalidReason?: string }) {
  const cfg = CARD_DISPLAY[type];
  const color = invalid ? "#ef4444" : cfg.color;
  const bg    = invalid ? "rgba(239,68,68,0.16)" : cfg.bg;
  const top    = ((start - HOUR_START * 60) / 60) * ROW_HEIGHT;
  const height = Math.max((duration / 60) * ROW_HEIGHT - 4, 24);
  return (
    <div
      className="absolute inset-x-[3px] rounded-[4px] pointer-events-none"
      style={{
        top,
        height,
        backgroundColor: bg,
        borderLeft: `3px solid ${color}`,
        opacity: 0.85,
        boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
        outline: `2px solid ${color}`,
        outlineOffset: 1,
        zIndex: 30,
      }}
    >
      <div className="p-[6px]">
        <span className="flex items-center gap-[4px] text-[11px] font-bold leading-tight" style={{ color }}>
          {!invalid && <span className="shrink-0 flex"><StatusIcon type={type} color={color} size={9} /></span>}
          <span className="truncate min-w-0">{invalid ? (invalidReason ?? "Chevauchement impossible") : cfg.label}</span>
        </span>
        {height >= 34 && (
          <span className="text-[14px] font-semibold text-[#1b2559] block truncate mt-[1px]">
            {minutesToDisplay(start)} – {minutesToDisplay(start + duration)}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Mini calendar ────────────────────────────────────────────────────────────

function MiniCalendar({ selectedDate, onSelect, onClose }: { selectedDate: Date; onSelect: (d: Date) => void; onClose: () => void }) {
  const [month, setMonth] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  const todayDate = new Date(); todayDate.setHours(0,0,0,0);
  const daysInMonth = new Date(month.getFullYear(), month.getMonth()+1, 0).getDate();
  const firstDow    = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const cells: (number|null)[] = [...Array(firstDow).fill(null), ...Array.from({length:daysInMonth},(_,i)=>i+1)];
  while (cells.length % 7 !== 0) cells.push(null);
  return (
    <div className="absolute z-50 bg-white rounded-[12px] shadow-[0_8px_32px_rgba(0,0,0,0.18)] p-[16px] border border-[#e6ebf0]" style={{top:"calc(100% + 8px)",left:0,width:280}}>
      <div className="flex items-center justify-between mb-[12px]">
        <button onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()-1,1))} className="size-[28px] flex items-center justify-center rounded-[6px] hover:bg-[#f4f7fe] cursor-pointer border-0 bg-transparent">
          <Icon paths={ICONS.chevL} color="#1B2559" size={14}/>
        </button>
        <span className="font-semibold text-[#1b2559] text-[14px]">{MONTHS_FR[month.getMonth()]} {month.getFullYear()}</span>
        <button onClick={()=>setMonth(new Date(month.getFullYear(),month.getMonth()+1,1))} className="size-[28px] flex items-center justify-center rounded-[6px] hover:bg-[#f4f7fe] cursor-pointer border-0 bg-transparent">
          <Icon paths={ICONS.chevR} color="#1B2559" size={14}/>
        </button>
      </div>
      <div className="grid grid-cols-7 mb-[2px]">
        {DAY_NAMES.map(d=><div key={d} className="flex items-center justify-center h-[26px]"><span className="text-[13px] font-semibold text-[#9ca3af]">{d}</span></div>)}
      </div>
      <div className="grid grid-cols-7 gap-y-[2px]">
        {cells.map((day,i)=>{
          if(!day) return <div key={i}/>;
          const d=new Date(month.getFullYear(),month.getMonth(),day); d.setHours(0,0,0,0);
          const isSel=isSameDay(d,selectedDate), isT=isSameDay(d,todayDate);
          return <button key={i} onClick={()=>{onSelect(d);onClose();}} className="flex items-center justify-center h-[32px] rounded-[6px] cursor-pointer border-0 transition-colors text-[14px]" style={{backgroundColor:isSel?"#213163":isT?"#eef4ff":"transparent",color:isSel?"white":isT?"#213163":"#1b2559",fontWeight:isSel?600:400}}>{day}</button>;
        })}
      </div>
    </div>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
// Just two states: the full Figma sidebar above the mobile breakpoint, or no
// sidebar at all below the mobile breakpoint (mobile shows the calendar only, reachable instead
// through the mobile header's grid button). No reduced/icon-only in-between.

function Sidebar({ hidden }: { hidden: boolean }) {
  if (hidden) return null;
  return (
    <div className="shrink-0 h-full" style={{width:292}}>
      <ImportedSidebar />
    </div>
  );
}

// ─── Responsive breakpoint ───────────────────────────────────────────────────

const MOBILE_BREAKPOINT = 1000;

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth <= MOBILE_BREAKPOINT
  );
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
    const onChange = () => setIsMobile(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return isMobile;
}

// ─── Mobile header ────────────────────────────────────────────────────────────
// Back and grid actions are visual-only placeholders: there is no properties
// list or off-canvas nav to wire them to yet. Everything else — the date
// picker, the Jour/Semaine toggle, prev/next/today — behaves exactly like the
// desktop TopBar, just restyled as icon buttons across three stacked rows.

function GridIcon({ color = "#1B2559", size = 20 }: { color?: string; size?: number }) {
  const pos = [0, 7.5, 15];
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      {pos.flatMap((y) => pos.map((x) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="5" height="5" rx="1.5" fill={color} />
      )))}
    </svg>
  );
}

function ViewWeekIcon({ color = "#1B2559", size = 18 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M21 12L21 17C21 19.2091 19.2091 21 17 21L15.1765 21M21 12L21 7C21 4.79086 19.2091 3 17 3L15.1765 3M21 12L3 12M3 12L3 7C3 4.79086 4.79086 3 7 3L8.82353 3M3 12L3 17C3 19.2091 4.79086 21 7 21L8.82353 21M8.82353 3L8.82353 21M8.82353 3L12.5294 3L15.1765 3M8.82353 21L12.5294 21L15.1765 21M15.1765 3L15.1765 21" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ViewDayIcon({ color = "#1B2559", size = 18 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M19 3L5 3M19 21H5M3 10L3 14C3 15.6569 4.34315 17 6 17L18 17C19.6569 17 21 15.6569 21 14V10C21 8.34315 19.6569 7 18 7L6 7C4.34315 7 3 8.34315 3 10Z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function MobileHeader({ viewDate, view, onPrev, onNext, onToday, onViewChange, onDateSelect }: {
  viewDate: Date; view: "semaine"|"jour";
  onPrev: () => void; onNext: () => void; onToday: () => void;
  onViewChange: (v: "semaine"|"jour") => void; onDateSelect: (d: Date) => void;
}) {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!showPicker) return;
    const h = (e: MouseEvent) => { if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setShowPicker(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [showPicker]);
  const label = view === "jour" ? formatDayLabel(viewDate) : formatWeekLabel(viewDate);

  return (
    <div className="flex flex-col shrink-0" style={{backgroundColor:"#f4f7fe"}}>
      {/* Row 1 — back / title / menu */}
      <div className="flex items-center justify-between px-[12px]" style={{height:56}}>
        <button type="button" aria-label="Retour" className="size-[44px] flex items-center justify-center rounded-[10px] cursor-pointer border-0 bg-transparent hover:bg-[#e8eef8] transition-colors shrink-0">
          <Icon paths={ICONS.chevL} color="#1B2559" size={20}/>
        </button>
        <span className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#1b2559] text-[16px] truncate px-[8px]">
          Adresse de la propriété
        </span>
        <button type="button" aria-label="Menu" className="size-[44px] flex items-center justify-center rounded-[10px] cursor-pointer border-0 bg-transparent hover:bg-[#e8eef8] transition-colors shrink-0">
          <GridIcon/>
        </button>
      </div>

      {/* Row 2 — date picker + Jour/Semaine icon toggle */}
      <div className="relative flex items-center gap-[8px] px-[12px] pb-[10px]" ref={pickerRef}>
        <button onClick={()=>setShowPicker(v=>!v)} type="button" aria-label="Choisir une date" className="bg-white rounded-[10px] size-[38px] flex items-center justify-center cursor-pointer border-0 hover:bg-[#e8eef8] transition-colors shrink-0">
          <Icon paths={ICONS.calendar} color="#111111" size={18}/>
        </button>
        <span className="font-['Inter:Bold',sans-serif] font-bold text-[#1b2559] text-[14px] flex-1 truncate min-w-0">
          {label}
        </span>
        <div className="flex items-center gap-[6px] shrink-0">
          <button
            onClick={()=>onViewChange("semaine")}
            type="button" aria-label="Vue semaine"
            className="size-[38px] rounded-[10px] flex items-center justify-center border-0 cursor-pointer transition-colors"
            style={{backgroundColor: view==="semaine" ? "#213163" : "white"}}
          >
            <ViewWeekIcon color={view==="semaine" ? "white" : "#1B2559"}/>
          </button>
          <button
            onClick={()=>onViewChange("jour")}
            type="button" aria-label="Vue jour"
            className="size-[38px] rounded-[10px] flex items-center justify-center border-0 cursor-pointer transition-colors"
            style={{backgroundColor: view==="jour" ? "#213163" : "white"}}
          >
            <ViewDayIcon color={view==="jour" ? "white" : "#1B2559"}/>
          </button>
        </div>
        {showPicker && <MiniCalendar selectedDate={viewDate} onSelect={d=>{onDateSelect(d);setShowPicker(false);}} onClose={()=>setShowPicker(false)}/>}
      </div>

      {/* Row 3 — prev / Aujourd'hui / next */}
      <div className="flex items-center gap-[8px] px-[12px] pb-[10px]">
        <button onClick={onPrev} type="button" aria-label="Précédent" className="w-[38px] h-[38px] flex items-center justify-center rounded-[10px] bg-white hover:bg-[#e8eef8] cursor-pointer border-0 transition-colors shrink-0">
          <Icon paths={ICONS.chevL} color="#1B2559" size={16}/>
        </button>
        <button onClick={onToday} type="button" className="flex-1 h-[38px] rounded-[10px] cursor-pointer border-0 font-['Lexend:Regular',sans-serif] text-[14px] text-white transition-colors hover:opacity-90" style={{backgroundColor:"#1aa41d"}}>
          {"Aujourd'hui"}
        </button>
        <button onClick={onNext} type="button" aria-label="Suivant" className="w-[38px] h-[38px] flex items-center justify-center rounded-[10px] bg-white hover:bg-[#e8eef8] cursor-pointer border-0 transition-colors shrink-0">
          <Icon paths={ICONS.chevR} color="#1B2559" size={16}/>
        </button>
      </div>
    </div>
  );
}

// ─── TopBar ──────────────────────────────────────────────────────────────────

function TopBar({ viewDate, view, onPrev, onNext, onToday, onViewChange, onDateSelect }: {
  viewDate: Date; view: "semaine"|"jour";
  onPrev:()=>void; onNext:()=>void; onToday:()=>void;
  onViewChange:(v:"semaine"|"jour")=>void; onDateSelect:(d:Date)=>void;
}) {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  useEffect(()=>{
    if(!showPicker) return;
    const h=(e:MouseEvent)=>{ if(pickerRef.current&&!pickerRef.current.contains(e.target as Node)) setShowPicker(false); };
    document.addEventListener("mousedown",h);
    return ()=>document.removeEventListener("mousedown",h);
  },[showPicker]);
  const label = view==="jour" ? formatDayLabel(viewDate) : formatWeekLabel(viewDate);
  return (
    <div className="flex items-center gap-[25px] px-[32px] pt-[24px] pb-[12px] shrink-0">
      {/* Nav arrows */}
      <div className="flex items-center p-[2px] h-[42px] gap-[6px] rounded-[8px]">
        <button onClick={onPrev} className="w-[38px] h-full flex items-center justify-center rounded-[6px] cursor-pointer border-0 bg-[#f3f8ff] hover:bg-[#e8eef8] transition-colors shrink-0">
          <Icon paths={ICONS.chevL} color="#1B2559" size={16}/>
        </button>
        <button onClick={onToday} className="h-full rounded-[10px] cursor-pointer border-0 font-['Lexend:Regular',sans-serif] text-[14px] text-white transition-colors hover:opacity-90" style={{backgroundColor:"#1aa41d",width:158}}>
          {"Aujourd'hui"}
        </button>
        <button onClick={onNext} className="w-[38px] h-full flex items-center justify-center rounded-[6px] cursor-pointer border-0 bg-[#f3f8ff] hover:bg-[#e8eef8] transition-colors shrink-0">
          <Icon paths={ICONS.chevR} color="#1B2559" size={16}/>
        </button>
      </div>
      {/* Date label + mini calendar */}
      <div className="relative flex items-center gap-[8px] flex-1" ref={pickerRef}>
        <button onClick={()=>setShowPicker(v=>!v)} className="bg-[#f3f8ff] rounded-[12px] size-[40px] flex items-center justify-center cursor-pointer border-0 hover:bg-[#e8eef8] transition-colors shrink-0">
          <Icon paths={ICONS.calendar} color="#111111" size={24}/>
        </button>
        <span className="font-['Inter:Bold',sans-serif] font-bold text-[#1b2559] text-[18px] whitespace-nowrap">{label}</span>
        {showPicker && <MiniCalendar selectedDate={viewDate} onSelect={d=>{onDateSelect(d);setShowPicker(false);}} onClose={()=>setShowPicker(false)}/>}
      </div>
      {/* View toggle */}
      <div className="flex h-[42px]" style={{minWidth:200}}>
        <button
          onClick={()=>onViewChange("jour")}
          className="flex-1 flex items-center justify-center px-[10px] cursor-pointer border border-[#e6ebf0] rounded-bl-[10px] rounded-tl-[10px] font-['Lexend:Regular',sans-serif] text-[14px] transition-colors"
          style={{backgroundColor:view==="jour"?"#213163":"white", color:view==="jour"?"white":"#213163", borderRight:"none"}}
        >
          Jour
        </button>
        <button
          onClick={()=>onViewChange("semaine")}
          className="flex-1 flex items-center justify-center px-[10px] cursor-pointer border border-[#d5dde6] rounded-br-[10px] rounded-tr-[10px] font-['Lexend:Regular',sans-serif] text-[14px] transition-colors"
          style={{backgroundColor:view==="semaine"?"#213163":"white", color:view==="semaine"?"white":"#213163"}}
        >
          Semaine
        </button>
      </div>
    </div>
  );
}

// ─── DayHeaders ───────────────────────────────────────────────────────────────

function DayHeaders({ weekDays, today }: { weekDays: Date[]; today: Date }) {
  return (
    <div className="flex bg-white rounded-[16px] border border-[#e5e7eb] shrink-0 mx-[32px] max-[1000px]:mx-[12px]" style={{height:56}}>
      <div style={{width:TIME_COL_W}} className="shrink-0"/>
      {weekDays.map((d,i)=>{
        const isToday=isSameDay(d,today);
        return (
          <div key={i} className="flex-1 flex flex-col items-center justify-center gap-[2px] border-l border-[#f0f0f0]">
            <span className="font-semibold text-[#9ca3af] text-[13px]">{DAY_NAMES[i]}</span>
            {isToday
              ? <div className="bg-[#213163] size-[28px] rounded-[14px] flex items-center justify-center"><span className="text-white font-bold text-[14px]">{d.getDate()}</span></div>
              : <span className="font-bold text-[#1b2559] text-[16px]">{d.getDate()}</span>
            }
          </div>
        );
      })}
    </div>
  );
}

// ─── Event card ───────────────────────────────────────────────────────────────

interface CardProps {
  event: CalendarEvent;
  isDragging: boolean;
  onMoveStart: (e: React.MouseEvent) => void;
  onResizeStart: (e: React.MouseEvent) => void;
  onEditClick: () => void;
}

function EventCard({ event, isDragging, onMoveStart, onResizeStart, onEditClick }: CardProps) {
  const cfg    = CARD_DISPLAY[event.type];
  const top    = ((event.startMinutes - HOUR_START * 60) / 60) * ROW_HEIGHT + 2;
  const height = Math.max(((event.endMinutes - event.startMinutes) / 60) * ROW_HEIGHT - 4, 24);

  return (
    <div
      data-event="true"
      className="absolute inset-x-[3px] rounded-[4px] overflow-hidden select-none group"
      style={{
        top,
        height,
        backgroundColor: cfg.bg,
        borderLeft: `3px solid ${cfg.color}`,
        opacity: isDragging ? 0.35 : 1,
        cursor: isDragging ? "grabbing" : "grab",
        zIndex: isDragging ? 0 : 10,
        transition: isDragging ? "none" : "opacity 0.1s",
      }}
      onMouseDown={onMoveStart}
    >
      <div className="p-[6px] h-full flex flex-col justify-start">
        <span className="flex items-center gap-[4px] text-[11px] font-['Inter:Bold',sans-serif] font-bold leading-tight" style={{color:cfg.color}}>
          <span className="shrink-0 flex"><StatusIcon type={event.type} color={cfg.color} size={9} /></span>
          <span className="truncate min-w-0">{cfg.label}</span>
        </span>
        {height >= 34 && (
          <span className="text-[14px] font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#1b2559] block truncate leading-tight mt-[1px]">
            {minutesToDisplay(event.startMinutes)} – {minutesToDisplay(event.endMinutes)}
          </span>
        )}
        {/* Edit button */}
        <button
          data-edit="true"
          onMouseDown={e=>e.stopPropagation()}
          onClick={e=>{e.stopPropagation();onEditClick();}}
          className="absolute top-[4px] right-[4px] bg-white/80 size-[18px] flex items-center justify-center rounded-[4px] cursor-pointer border-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Icon paths={ICONS.pencil} color={cfg.color} size={10}/>
        </button>
      </div>
      {/* Resize handle */}
      <div
        data-resize="true"
        className="absolute bottom-0 left-0 right-0 h-[8px] cursor-ns-resize flex items-end justify-center pb-[1px]"
        onMouseDown={e=>{e.stopPropagation();onResizeStart(e);}}
      >
        <div className="w-[20px] h-[2px] rounded-full bg-current opacity-0 group-hover:opacity-40 transition-opacity" style={{color:cfg.color}}/>
      </div>
    </div>
  );
}

// ─── Main Calendar ────────────────────────────────────────────────────────────

export default function Calendar() {
  const todayRef = useRef(new Date()); todayRef.current.setHours(0,0,0,0);
  const today = todayRef.current;

  const [viewDate, setViewDate] = useState<Date>(()=>getWeekStart(new Date()));
  const [view, setView]         = useState<"semaine"|"jour">("semaine");
  const isMobile = useIsMobile();
  // Mobile now exposes the same Jour/Semaine toggle as desktop (as icons in
  // MobileHeader), so it follows the `view` state exactly like desktop does.
  const isDayView = view === "jour";
  const [events, setEvents]     = useState<CalendarEvent[]>([]);
  const [modal, setModal]       = useState<ModalState|null>(null);
  const [overlapError, setOverlapError] = useState<string|null>(null);

  const [dragging, setDragging]     = useState<DragState|null>(null);
  const [resizing, setResizing]     = useState<ResizeState|null>(null);

  const draggingRef = useRef(dragging); draggingRef.current = dragging;
  const resizingRef = useRef(resizing); resizingRef.current = resizing;
  const eventsRef   = useRef(events);   eventsRef.current = events;

  // Grid refs for coordinate math
  const gridRef   = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Derived week data
  const weekStart = isDayView ? getWeekStart(viewDate) : viewDate;
  const weekDays  = Array.from({length:7},(_,i)=>{ const d=new Date(weekStart); d.setDate(d.getDate()+i); return d; });
  const weekDaysRef = useRef(weekDays); weekDaysRef.current = weekDays;

  // Navigation
  const navigate = (delta:number) => setViewDate(d=>{ const n=new Date(d); n.setDate(d.getDate()+delta*(isDayView?1:7)); return n; });
  const goToday  = () => { const t=new Date(today); setViewDate(isDayView?t:getWeekStart(t)); };
  const handleViewChange = (v:"semaine"|"jour") => { setView(v); setViewDate(p=>v==="semaine"?getWeekStart(p):p); };
  const handleDateSelect = (d:Date) => setViewDate(isDayView?d:getWeekStart(d));

  // Grid click → create
  const handleColumnClick = (e:React.MouseEvent<HTMLDivElement>, date:string) => {
    if ((e.target as HTMLElement).closest("[data-event]")) return;
    if (draggingRef.current || resizingRef.current) return;
    if (isPastDate(date, today)) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const y    = e.clientY - rect.top;
    const rawMin  = HOUR_START*60 + (y/ROW_HEIGHT)*60;
    const startMin = clamp(snap(rawMin), HOUR_START*60, (HOUR_END-1)*60);
    const endMin   = clamp(startMin+60, startMin+15, (HOUR_END-1)*60);
    setOverlapError(null);
    setModal({mode:"create",date,startMinutes:startMin,endMinutes:endMin});
  };

  const openEdit = (ev:CalendarEvent) => { setOverlapError(null); setModal({mode:"edit",event:ev}); };

  // ── Drag-to-move start ──────────────────────────────────────────────────────
  const handleMoveStart = useCallback((e:React.MouseEvent, eventId:string) => {
    if ((e.target as HTMLElement).closest("[data-resize]")) return;
    if ((e.target as HTMLElement).closest("[data-edit]")) return;
    e.preventDefault();
    e.stopPropagation();
    const ev = eventsRef.current.find(ev=>ev.id===eventId);
    if (!ev) return;
    const grid = gridRef.current;
    if (!grid) return;
    const rect     = grid.getBoundingClientRect();
    const scrollTop = scrollRef.current?.scrollTop ?? 0;
    const cardTopPx = ((ev.startMinutes - HOUR_START*60) / 60) * ROW_HEIGHT;
    const offsetY   = (e.clientY - rect.top + scrollTop) - cardTopPx;
    setDragging({
      id: eventId,
      offsetY,
      origDate:  ev.date,
      origStart: ev.startMinutes,
      origEnd:   ev.endMinutes,
      duration:  ev.endMinutes - ev.startMinutes,
      curDate:   ev.date,
      curStart:  ev.startMinutes,
      invalid:   false,
      invalidReason: "",
    });
  }, []);

  // ── Drag-to-resize start ───────────────────────────────────────────────────
  const handleResizeStart = useCallback((e:React.MouseEvent, eventId:string) => {
    e.preventDefault();
    e.stopPropagation();
    const ev = eventsRef.current.find(ev=>ev.id===eventId);
    if (!ev) return;
    setResizing({id:eventId, startY:e.clientY, origEnd:ev.endMinutes});
  }, []);

  // ── Drag move effect ───────────────────────────────────────────────────────
  useEffect(()=>{
    if (!dragging) return;
    const {id, offsetY, duration} = dragging;

    const onMove = (e:MouseEvent) => {
      const grid = gridRef.current;
      if (!grid) return;
      const rect      = grid.getBoundingClientRect();
      const scrollTop = scrollRef.current?.scrollTop ?? 0;

      // Vertical → new start time
      const relY     = (e.clientY - rect.top + scrollTop) - offsetY;
      const rawStart = HOUR_START*60 + (relY/ROW_HEIGHT)*60;
      const newStart = clamp(snap(rawStart), HOUR_START*60, HOUR_END*60 - duration);

      // Horizontal → new day (week view only; single column in day view)
      let newDate = dragging.origDate;
      if (!isDayView) {
        const colW   = (rect.width - TIME_COL_W) / 7;
        const relX   = e.clientX - rect.left - TIME_COL_W;
        const dayIdx = clamp(Math.floor(relX/colW), 0, 6);
        newDate = dateToISO(weekDaysRef.current[dayIdx]);
      }

      // A card can never be dropped into the past — same rule as creating one.
      const invalidReason = isPastDate(newDate, today)
        ? "Impossible dans le passé"
        : hasOverlap(eventsRef.current, newDate, newStart, newStart + duration, id)
          ? "Chevauchement impossible"
          : "";
      setDragging(prev => prev ? {...prev, curDate:newDate, curStart:newStart, invalid: !!invalidReason, invalidReason} : null);
    };

    const onUp = () => {
      const d = draggingRef.current;
      if (!d) { setDragging(null); return; }
      const moved = d.curDate!==d.origDate || Math.abs(d.curStart-d.origStart)>=SNAP_MIN;
      if (moved) {
        // Two cards can never overlap — an invalid drop snaps back to the original slot.
        if (!d.invalid) {
          const newEnd = d.curStart + d.duration;
          setEvents(prev=>prev.map(ev=>ev.id===id?{...ev,date:d.curDate,startMinutes:d.curStart,endMinutes:newEnd}:ev));
        }
      } else {
        // treat as click → open edit
        const ev = eventsRef.current.find(ev=>ev.id===id);
        if (ev) openEdit(ev);
      }
      setDragging(null);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return ()=>{ window.removeEventListener("mousemove",onMove); window.removeEventListener("mouseup",onUp); };
  }, [dragging?.id, isDayView]); // eslint-disable-line

  // ── Resize effect ──────────────────────────────────────────────────────────
  useEffect(()=>{
    if (!resizing) return;
    const {id, startY, origEnd} = resizing;
    const onMove = (e:MouseEvent) => {
      const deltaY   = e.clientY - startY;
      const deltaMin = snap(deltaY / PX_PER_MIN);
      const ev0      = eventsRef.current.find(ev=>ev.id===id);
      if (!ev0) return;
      // Two cards can never overlap — cap growth at the start of the next card on this day.
      const ceiling = Math.min(HOUR_END*60, nextEventStart(eventsRef.current, ev0.date, ev0.startMinutes, id));
      const newEnd  = clamp(origEnd+deltaMin, ev0.startMinutes+15, ceiling);
      setEvents(prev=>prev.map(ev=>{
        if (ev.id!==id) return ev;
        return {...ev, endMinutes: Math.max(newEnd, ev.startMinutes+15)};
      }));
    };
    const onUp = ()=>setResizing(null);
    window.addEventListener("mousemove",onMove);
    window.addEventListener("mouseup",onUp);
    return ()=>{ window.removeEventListener("mousemove",onMove); window.removeEventListener("mouseup",onUp); };
  }, [resizing]);

  // ── Set cursor on body during drag ─────────────────────────────────────────
  useEffect(()=>{
    if (dragging) { document.body.style.cursor="grabbing"; document.body.style.userSelect="none"; }
    else          { document.body.style.cursor=""; document.body.style.userSelect=""; }
    return ()=>{ document.body.style.cursor=""; document.body.style.userSelect=""; };
  },[!!dragging]);

  // Save — every checked day in the modal always yields a visible slot on the calendar,
  // regardless of whether a recurrence frequency was also chosen.
  const handleSave = (type: EventType, start: string, end: string, days: Day[], recurrence: Recurrence | null) => {
    const startMin = timeToMinutes(start), endMin = timeToMinutes(end);
    if (startMin >= endMin) { setOverlapError("L'heure de fin doit être après l'heure de début."); return; }

    const baseDate  = modal!.mode === "create" ? (modal as any).date : (modal as any).event.date;
    const weekStart = getWeekStart(new Date(baseDate + "T00:00:00"));
    const dates     = generateRecurringDates(weekStart, days, recurrence);

    if (modal!.mode === "create") {
      // A checked day (e.g. Lundi) can fall earlier in the current week than
      // the day that was clicked to open the modal — filter those out too.
      const futureDates = dates.filter(date => !isPastDate(date, today));
      const newEvs = futureDates
        .filter(date => !hasOverlap(events, date, startMin, endMin))
        .map(date => ({ id: newId(), type, date, startMinutes: startMin, endMinutes: endMin }));
      if (newEvs.length === 0) {
        setOverlapError(futureDates.length === 0
          ? "Impossible de créer une disponibilité dans le passé."
          : dates.length > 1
            ? "Toutes les plages sélectionnées chevauchent une disponibilité existante."
            : "Cette plage horaire chevauche une disponibilité existante. Veuillez choisir un autre créneau.");
        return;
      }
      setEvents(prev => [...prev, ...newEvs]);
    } else {
      const target = (modal as any).event as CalendarEvent;
      if (hasOverlap(events, target.date, startMin, endMin, target.id)) {
        setOverlapError("Cette plage horaire chevauche une disponibilité existante. Veuillez choisir un autre créneau.");
        return;
      }
      setEvents(prev => {
        const updated = prev.map(ev =>
          ev.id === target.id ? { ...ev, type, startMinutes: startMin, endMinutes: endMin } : ev
        );
        const extra = dates
          .filter(date => date !== target.date)
          .filter(date => !hasOverlap(updated, date, startMin, endMin))
          .map(date => ({ id: newId(), type, date, startMinutes: startMin, endMinutes: endMin }));
        return [...updated, ...extra];
      });
    }

    setOverlapError(null);
    setModal(null);
  };

  const handleDelete = () => {
    if (modal?.mode==="edit") { const t=(modal as any).event as CalendarEvent; setEvents(prev=>prev.filter(ev=>ev.id!==t.id)); }
    setModal(null);
  };

  const gridHeight = (HOUR_END-HOUR_START)*ROW_HEIGHT;
  const editEvent  = modal?.mode==="edit" ? (modal as any).event as CalendarEvent : null;
  const modalDate  = modal ? (modal.mode==="create" ? modal.date : modal.event.date) : null;
  const modalDayOfWeek = modalDate ? (DAY_NAMES[new Date(modalDate + "T00:00:00").getDay()] as Day) : null;

  // Time column
  const TimeCol = () => (
    <div style={{width:TIME_COL_W}} className="shrink-0 border-r border-[#f0f0f0]">
      {HOURS.map(h=>(
        <div key={h} className="flex items-center justify-center border-b border-[#f0f0f0]" style={{height:ROW_HEIGHT}}>
          <span className="font-medium text-[#9ca3af] text-[14px]">{h}h</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{backgroundColor:"#f4f7fe"}}>
      <Sidebar hidden={isMobile}/>
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        {isMobile
          ? <MobileHeader viewDate={viewDate} view={view} onPrev={()=>navigate(-1)} onNext={()=>navigate(1)} onToday={goToday} onViewChange={handleViewChange} onDateSelect={handleDateSelect}/>
          : <TopBar viewDate={viewDate} view={view} onPrev={()=>navigate(-1)} onNext={()=>navigate(1)} onToday={goToday} onViewChange={handleViewChange} onDateSelect={handleDateSelect}/>}
        {!isDayView&&<DayHeaders weekDays={weekDays} today={today}/>}

        <div ref={scrollRef} className={`flex-1 overflow-y-auto overflow-x-hidden py-[8px] ${isMobile ? "px-[12px]" : "px-[32px]"}`}>
          {!isDayView ? (
            <div ref={gridRef} className="flex bg-white rounded-[16px] border border-[#e5e7eb] overflow-hidden" style={{minHeight:gridHeight}}>
              <TimeCol/>
              {weekDays.map((dayDate,dayIdx)=>{
                const isoDate  = dateToISO(dayDate);
                const dayEvts  = events.filter(ev=>ev.date===isoDate);
                const ghostHere = dragging && dragging.curDate===isoDate;
                const ghostType = dragging ? eventsRef.current.find(ev=>ev.id===dragging.id)?.type : undefined;
                return (
                  <div key={dayIdx} className="flex-1 relative border-l border-[#f0f0f0]" style={{minHeight:gridHeight,cursor:dragging?"grabbing":"pointer"}} onClick={e=>handleColumnClick(e,isoDate)}>
                    {HOURS.map(h=><div key={h} className="border-b border-[#f0f0f0] hover:bg-[#f9fbff] transition-colors" style={{height:ROW_HEIGHT}}/>)}
                    {dayEvts.map(ev=>(
                      <EventCard
                        key={ev.id}
                        event={ev}
                        isDragging={dragging?.id===ev.id}
                        onMoveStart={e=>handleMoveStart(e,ev.id)}
                        onResizeStart={e=>handleResizeStart(e,ev.id)}
                        onEditClick={()=>openEdit(ev)}
                      />
                    ))}
                    {ghostHere && ghostType && dragging && (
                      <GhostCard type={ghostType} start={dragging.curStart} duration={dragging.duration} invalid={dragging.invalid} invalidReason={dragging.invalidReason}/>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div ref={gridRef} className="flex bg-white rounded-[16px] border border-[#e5e7eb] overflow-hidden" style={{minHeight:gridHeight}}>
              <TimeCol/>
              {(()=>{
                const isoDate = dateToISO(viewDate);
                const dayEvts = events.filter(ev=>ev.date===isoDate);
                const ghostType = dragging ? eventsRef.current.find(ev=>ev.id===dragging.id)?.type : undefined;
                return (
                  <div className="flex-1 relative" style={{minHeight:gridHeight,cursor:dragging?"grabbing":"pointer"}} onClick={e=>handleColumnClick(e,isoDate)}>
                    {HOURS.map(h=><div key={h} className="border-b border-[#f0f0f0] hover:bg-[#f9fbff] transition-colors" style={{height:ROW_HEIGHT}}/>)}
                    {dayEvts.map(ev=>(
                      <EventCard
                        key={ev.id}
                        event={ev}
                        isDragging={dragging?.id===ev.id}
                        onMoveStart={e=>handleMoveStart(e,ev.id)}
                        onResizeStart={e=>handleResizeStart(e,ev.id)}
                        onEditClick={()=>openEdit(ev)}
                      />
                    ))}
                    {dragging && ghostType && (
                      <GhostCard type={ghostType} start={dragging.curStart} duration={dragging.duration} invalid={dragging.invalid} invalidReason={dragging.invalidReason}/>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {modal&&(
        <ModalDisponibilite
          mode={modal.mode}
          initialType={editEvent?.type??"visite-libre"}
          startTime={modal.mode==="create"?minutesToTime(modal.startMinutes):minutesToTime(editEvent!.startMinutes)}
          endTime={modal.mode==="create"?minutesToTime(modal.endMinutes):minutesToTime(editEvent!.endMinutes)}
          dayOfWeek={modalDayOfWeek!}
          error={overlapError}
          onClose={()=>{setModal(null);setOverlapError(null);}}
          onSave={handleSave}
          onDelete={modal.mode==="edit"?handleDelete:undefined}
        />
      )}
    </div>
  );
}
