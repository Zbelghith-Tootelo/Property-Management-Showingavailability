import { useState, useRef, useCallback, useEffect } from "react";
import ModalDisponibilite, { type EventType, type RecurrenceData } from "./ModalDisponibilite";
import ImportedSidebar from "../imports/Sidebar/index";

const DAY_NAME_TO_DOW: Record<string, number> = {
  Dim: 0, Lun: 1, Mar: 2, Mer: 3, Jeu: 4, Ven: 5, Sam: 6,
};

function generateRecurringDates(baseDate: string, rd: RecurrenceData): string[] {
  if (!rd) return [baseDate];
  const base = new Date(baseDate + "T00:00:00");
  const dates: string[] = [];

  if (rd.recurrence === "jour") {
    // Every selected day-of-week within the same week as baseDate
    const sun = new Date(base);
    sun.setDate(base.getDate() - base.getDay()); // Sunday of that week
    const daysToUse = rd.days.length > 0 ? rd.days : [Object.keys(DAY_NAME_TO_DOW).find(k => DAY_NAME_TO_DOW[k] === base.getDay()) ?? "Lun"];
    for (const dayName of daysToUse) {
      const d = new Date(sun);
      d.setDate(sun.getDate() + DAY_NAME_TO_DOW[dayName]);
      dates.push(dateToISO(d));
    }
    if (!dates.includes(baseDate)) dates.unshift(baseDate);
  } else if (rd.recurrence === "semaine") {
    for (let w = 0; w < 12; w++) {
      const d = new Date(base);
      d.setDate(base.getDate() + w * 7);
      dates.push(dateToISO(d));
    }
  } else if (rd.recurrence === "mois") {
    for (let m = 0; m < 12; m++) {
      const d = new Date(base);
      d.setMonth(base.getMonth() + m);
      // Guard against month overflow (e.g. Jan 31 + 1 month → Mar 3)
      if (d.getDate() !== base.getDate()) d.setDate(0);
      dates.push(dateToISO(d));
    }
  } else if (rd.recurrence === "annee") {
    for (let y = 0; y < 3; y++) {
      const d = new Date(base);
      d.setFullYear(base.getFullYear() + y);
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

function GhostCard({ type, start, duration }: { type: EventType; start: number; duration: number }) {
  const cfg = CARD_DISPLAY[type];
  const top    = ((start - HOUR_START * 60) / 60) * ROW_HEIGHT;
  const height = Math.max((duration / 60) * ROW_HEIGHT - 4, 24);
  return (
    <div
      className="absolute inset-x-[3px] rounded-[4px] pointer-events-none"
      style={{
        top,
        height,
        backgroundColor: cfg.bg,
        borderLeft: `3px solid ${cfg.color}`,
        opacity: 0.85,
        boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
        outline: `2px solid ${cfg.color}`,
        outlineOffset: 1,
        zIndex: 30,
      }}
    >
      <div className="p-[6px]">
        <span className="text-[11px] font-bold block truncate" style={{ color: cfg.color }}>{cfg.label}</span>
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

function Sidebar() {
  return (
    <div className="shrink-0 h-full" style={{width:292}}>
      <ImportedSidebar />
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
    <div className="flex bg-white rounded-[16px] border border-[#e5e7eb] shrink-0 mx-[32px]" style={{height:56}}>
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
        <span className="text-[11px] font-['Inter:Bold',sans-serif] font-bold truncate leading-tight block" style={{color:cfg.color}}>
          {cfg.label}
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
  const weekStart = view==="semaine" ? viewDate : getWeekStart(viewDate);
  const weekDays  = Array.from({length:7},(_,i)=>{ const d=new Date(weekStart); d.setDate(d.getDate()+i); return d; });
  const weekDaysRef = useRef(weekDays); weekDaysRef.current = weekDays;

  // Navigation
  const navigate = (delta:number) => setViewDate(d=>{ const n=new Date(d); n.setDate(d.getDate()+delta*(view==="jour"?1:7)); return n; });
  const goToday  = () => { const t=new Date(today); setViewDate(view==="semaine"?getWeekStart(t):t); };
  const handleViewChange = (v:"semaine"|"jour") => { setView(v); setViewDate(p=>v==="semaine"?getWeekStart(p):p); };
  const handleDateSelect = (d:Date) => setViewDate(view==="semaine"?getWeekStart(d):d);

  // Grid click → create
  const handleColumnClick = (e:React.MouseEvent<HTMLDivElement>, date:string) => {
    if ((e.target as HTMLElement).closest("[data-event]")) return;
    if (draggingRef.current || resizingRef.current) return;
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

      // Horizontal → new day (week view only)
      let newDate = dragging.origDate;
      if (view === "semaine") {
        const colW   = (rect.width - TIME_COL_W) / 7;
        const relX   = e.clientX - rect.left - TIME_COL_W;
        const dayIdx = clamp(Math.floor(relX/colW), 0, 6);
        newDate = dateToISO(weekDaysRef.current[dayIdx]);
      }

      setDragging(prev => prev ? {...prev, curDate:newDate, curStart:newStart} : null);
    };

    const onUp = (e:MouseEvent) => {
      const d = draggingRef.current;
      if (!d) { setDragging(null); return; }
      const moved = d.curDate!==d.origDate || Math.abs(d.curStart-d.origStart)>=SNAP_MIN;
      if (moved) {
        const newEnd = d.curStart + d.duration;
        setEvents(prev=>prev.map(ev=>ev.id===id?{...ev,date:d.curDate,startMinutes:d.curStart,endMinutes:newEnd}:ev));
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
  }, [dragging?.id, view]); // eslint-disable-line

  // ── Resize effect ──────────────────────────────────────────────────────────
  useEffect(()=>{
    if (!resizing) return;
    const {id, startY, origEnd} = resizing;
    const onMove = (e:MouseEvent) => {
      const deltaY   = e.clientY - startY;
      const deltaMin = snap(deltaY / PX_PER_MIN);
      const newEnd   = clamp(origEnd+deltaMin, origEnd-origEnd+HOUR_START*60+15, HOUR_END*60);
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

  // Save
  const handleSave = (type: EventType, start: string, end: string, recurrenceData: RecurrenceData) => {
    const startMin = timeToMinutes(start), endMin = timeToMinutes(end);
    if (startMin >= endMin) { setOverlapError("L'heure de fin doit être après l'heure de début."); return; }

    const baseDate  = modal!.mode === "create" ? (modal as any).date : (modal as any).event.date;
    const excludeId = modal!.mode === "edit"   ? (modal as any).event.id : undefined;

    if (!recurrenceData) {
      // Single event — show error on overlap
      if (hasOverlap(events, baseDate, startMin, endMin, excludeId)) {
        setOverlapError("Cette plage horaire chevauche une disponibilité existante. Veuillez choisir un autre créneau.");
        return;
      }
      if (modal!.mode === "create") {
        setEvents(prev => [...prev, { id: newId(), type, date: baseDate, startMinutes: startMin, endMinutes: endMin }]);
      } else {
        const target = (modal as any).event as CalendarEvent;
        setEvents(prev => prev.map(ev => ev.id === target.id ? { ...ev, type, startMinutes: startMin, endMinutes: endMin } : ev));
      }
    } else {
      // Recurring — generate all dates and skip overlapping ones silently
      const dates = generateRecurringDates(baseDate, recurrenceData);
      if (modal!.mode === "create") {
        const newEvs = dates
          .filter(date => !hasOverlap(events, date, startMin, endMin))
          .map(date => ({ id: newId(), type, date, startMinutes: startMin, endMinutes: endMin }));
        setEvents(prev => [...prev, ...newEvs]);
      } else {
        const target = (modal as any).event as CalendarEvent;
        setEvents(prev => {
          const updated = prev.map(ev =>
            ev.id === target.id ? { ...ev, type, startMinutes: startMin, endMinutes: endMin } : ev
          );
          const extra = dates
            .filter(date => date !== baseDate)
            .filter(date => !hasOverlap(updated, date, startMin, endMin))
            .map(date => ({ id: newId(), type, date, startMinutes: startMin, endMinutes: endMin }));
          return [...updated, ...extra];
        });
      }
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
      <Sidebar/>
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        <TopBar viewDate={viewDate} view={view} onPrev={()=>navigate(-1)} onNext={()=>navigate(1)} onToday={goToday} onViewChange={handleViewChange} onDateSelect={handleDateSelect}/>
        {view==="semaine"&&<DayHeaders weekDays={weekDays} today={today}/>}

        <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden px-[32px] py-[8px]">
          {view==="semaine" ? (
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
                      <GhostCard type={ghostType} start={dragging.curStart} duration={dragging.duration}/>
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
                      <GhostCard type={ghostType} start={dragging.curStart} duration={dragging.duration}/>
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
          error={overlapError}
          onClose={()=>{setModal(null);setOverlapError(null);}}
          onSave={handleSave}
          onDelete={modal.mode==="edit"?handleDelete:undefined}
        />
      )}
    </div>
  );
}
