import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import svgPaths from "../imports/ModalDisponibilite/svg-2jpbtmv37i";

const MOBILE_MODAL_BREAKPOINT = 1000;

function useIsMobileModal(): boolean {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth <= MOBILE_MODAL_BREAKPOINT
  );
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_MODAL_BREAKPOINT}px)`);
    const onChange = () => setIsMobile(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return isMobile;
}

export type EventType = "visite-libre" | "pre-approuve" | "impossible";
export type Recurrence = "semaine" | "mois";
export type Day = "Lun" | "Mar" | "Mer" | "Jeu" | "Ven" | "Sam" | "Dim";

const ALL_DAYS: Day[] = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

// Snaps a "HH:MM" value to the nearest 15-minute mark (0/15/30/45), since
// availabilities are only ever booked on quarter-hour boundaries.
function roundToQuarterHour(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const rounded = Math.max(0, Math.min(23 * 60 + 45, Math.round((h * 60 + m) / 15) * 15));
  const hh = String(Math.floor(rounded / 60)).padStart(2, "0");
  const mm = String(rounded % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}
const RECURRENCES: { label: string; value: Recurrence }[] = [
  { label: "Chaque semaine", value: "semaine" },
  { label: "Chaque mois", value: "mois" },
];

export const TYPE_CONFIG: Record<EventType, { label: string; color: string; bg: string; border: string; textActive: string }> = {
  "visite-libre": { label: "Visite libre", color: "#16a34a", bg: "#16a34a", border: "#16a34a", textActive: "white" },
  "pre-approuve":  { label: "Pre-Approuve", color: "#3b82f6", bg: "#3b82f6", border: "#3b82f6", textActive: "white" },
  impossible:      { label: "Impossible",   color: "#ef4444", bg: "#ef4444", border: "#ef4444", textActive: "white" },
};

export interface ModalProps {
  mode?: "create" | "edit";
  initialType?: EventType;
  startTime?: string;
  endTime?: string;
  dayOfWeek: Day;
  error?: string | null;
  onClose: () => void;
  onSave: (type: EventType, start: string, end: string, days: Day[], recurrence: Recurrence | null) => void;
  onDelete?: () => void;
}


function CloseIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="4" fill="#F3F8FF" />
      <path d={svgPaths.p3ebcdf00} fill="#B1B1B1" />
    </svg>
  );
}

// Glyph only, no background — the mobile close button draws its own bg-[#f3f8ff] pill.
function CloseGlyph({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <path d={svgPaths.p3ebcdf00} fill="#B1B1B1" />
    </svg>
  );
}

// Accepts "10:45", "1045", "945", "10" while typing and resolves it to a
// 24h "HH:MM" string. Returns null if nothing sensible can be read from it.
function parseTimeInput(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  let h: number, m: number;
  if (digits.length <= 2) { h = parseInt(digits, 10); m = 0; }
  else if (digits.length === 3) { h = parseInt(digits.slice(0, 1), 10); m = parseInt(digits.slice(1), 10); }
  else { h = parseInt(digits.slice(0, 2), 10); m = parseInt(digits.slice(2, 4), 10); }
  if (Number.isNaN(h) || Number.isNaN(m) || h > 23 || m > 59) return null;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// Every quarter-hour mark in a day, for the click-to-pick list.
const QUICK_TIMES = Array.from({ length: 96 }, (_, i) => {
  const total = i * 15;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
});

function ClockIcon({ size = 14, color = "#8a94a6" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}

// A free-text field for typing a time directly, plus a click-to-pick list of
// quarter-hour marks for browsing instead. Typing the digits and clicking the
// empty area/clock icon both live on the same control, so there's no native
// picker (whose minute list ignores `step` on some browsers/OSes) and no
// separate hour/minute dropdowns to click through one at a time.
function TimeField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [draft, setDraft] = useState(value);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; right: number } | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setDraft(value), [value]);

  useEffect(() => {
    if (!open) return;
    selectedRef.current?.scrollIntoView({ block: "center" });

    const isOutside = (target: Node) =>
      !wrapRef.current?.contains(target) && !popoverRef.current?.contains(target);
    const onDocMouseDown = (e: MouseEvent) => { if (isOutside(e.target as Node)) setOpen(false); };
    // Scrolling the popover's own list (e.g. the scrollIntoView above) must not
    // count as "the page scrolled" — only close for scrolls outside it.
    const onScroll = (e: Event) => { if (e.target instanceof Node && isOutside(e.target)) setOpen(false); };
    const onResize = () => setOpen(false);

    document.addEventListener("mousedown", onDocMouseDown);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  const commit = (raw: string) => {
    const parsed = parseTimeInput(raw);
    const next = parsed ? roundToQuarterHour(parsed) : value;
    onChange(next);
    setDraft(next);
  };

  const step = (deltaMinutes: number) => {
    const [h, m] = value.split(":").map(Number);
    const total = (((h * 60 + m + deltaMinutes) % 1440) + 1440) % 1440;
    const next = `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
    onChange(next);
    setDraft(next);
  };

  const pick = (t: string) => {
    onChange(t);
    setDraft(t);
    setOpen(false);
  };

  const toggleOpen = () => {
    if (open) { setOpen(false); return; }
    const rect = wrapRef.current?.getBoundingClientRect();
    if (rect) setCoords({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    setOpen(true);
  };

  return (
    <div ref={wrapRef} className="relative flex items-center gap-[6px] flex-1 min-w-0 h-full">
      <input
        type="text"
        inputMode="numeric"
        placeholder="HH:MM"
        value={draft}
        onFocus={(e) => e.target.select()}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") { commit(e.currentTarget.value); e.currentTarget.blur(); }
          else if (e.key === "ArrowUp") { e.preventDefault(); step(15); }
          else if (e.key === "ArrowDown") { e.preventDefault(); step(-15); }
        }}
        className="font-['Inter:Regular',sans-serif] border-0 outline-none bg-transparent text-[#111] text-[14px] w-[52px] shrink-0"
      />
      {/* Empty part of the field: click it (or the clock) to browse quarter-hours instead of typing. */}
      <button
        type="button"
        aria-label="Choisir une heure"
        onClick={toggleOpen}
        className="flex-1 h-full flex items-center justify-end bg-transparent border-0 p-0 cursor-pointer"
      >
        <ClockIcon />
      </button>
      {open && coords && createPortal(
        <div
          ref={popoverRef}
          style={{ position: "fixed", top: coords.top, right: coords.right }}
          className="w-[92px] max-h-[176px] overflow-y-auto bg-white border border-[#e6ebf0] rounded-[8px] shadow-[0px_8px_20px_rgba(0,0,0,0.16)] py-[4px] z-[999]"
        >
          {QUICK_TIMES.map((t) => {
            const active = t === value;
            return (
              <button
                key={t}
                type="button"
                ref={active ? selectedRef : undefined}
                onClick={() => pick(t)}
                className="w-full text-left px-[10px] py-[6px] text-[13px] border-0 cursor-pointer transition-colors"
                style={{
                  backgroundColor: active ? "#eef4ff" : "transparent",
                  color: active ? "#213163" : "#111",
                  fontWeight: active ? 700 : 400,
                }}
              >
                {t}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </div>
  );
}

export default function ModalDisponibilite({
  mode = "create",
  initialType = "visite-libre",
  startTime = "09:00",
  endTime = "10:00",
  dayOfWeek,
  error,
  onClose,
  onSave,
  onDelete,
}: ModalProps) {
  const isMobile = useIsMobileModal();
  const [type, setType] = useState<EventType | null>(mode === "edit" ? initialType : null);
  const [debut, setDebut] = useState(() => roundToQuarterHour(startTime));
  const [fin, setFin] = useState(() => roundToQuarterHour(endTime));
  const [selectedDays, setSelectedDays] = useState<Day[]>([dayOfWeek]);
  const [recurrence, setRecurrence] = useState<Recurrence | null>(null);
  const canSave = type !== null && selectedDays.length > 0;

  const toggleDay = (day: Day) =>
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );

  const toggleRecurrence = (r: Recurrence) =>
    setRecurrence((prev) => (prev === r ? null : r));

  // Mobile matches a dedicated Figma layout: stacked fields, Jours/Récurrence
  // always visible (no accordion), and full-width stacked footer buttons.
  if (isMobile) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div
          className="bg-white flex flex-col rounded-[16px] shadow-[0px_8px_24px_-4px_rgba(0,0,0,0.24)]"
          style={{ width: 398, maxWidth: "calc(100vw - 24px)", maxHeight: "calc(100vh - 32px)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-[16px] shrink-0">
            <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#213163] text-[18px] truncate pr-[8px]">
              Disponibilité de la propriété
            </p>
            <button onClick={onClose} className="bg-[#f3f8ff] size-[32px] rounded-[8px] flex items-center justify-center cursor-pointer border-0 shrink-0">
              <CloseGlyph size={14} />
            </button>
          </div>

          <div className="bg-[#e6ebf0] h-px w-full shrink-0" />

          {/* Body */}
          <div className="flex flex-col gap-[16px] p-[16px] overflow-y-auto">
            {/* Type */}
            <div className="flex flex-col gap-[8px] items-start w-full">
              <p className="font-['Inter:Bold',sans-serif] font-bold text-[#213163] text-[14px]">Type</p>
              <div className="flex flex-wrap gap-[6px] items-start w-full">
                {(Object.keys(TYPE_CONFIG) as EventType[]).map((t) => {
                  const cfg = TYPE_CONFIG[t];
                  const active = type === t;
                  return (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className="flex items-center gap-[6px] px-[10px] py-[8px] rounded-[999px] cursor-pointer transition-colors"
                      style={{ backgroundColor: active ? cfg.bg : "white", border: `1.5px solid ${cfg.border}` }}
                    >
                      <span className="block size-[8px] rounded-full shrink-0" style={{ backgroundColor: active ? "white" : cfg.color }} />
                      <span className="font-['Inter:Bold',sans-serif] font-bold text-[12px] whitespace-nowrap" style={{ color: active ? "white" : cfg.color }}>
                        {cfg.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Début / Fin */}
            <div className="flex gap-[12px] items-start w-full">
              <div className="flex flex-col gap-[8px] flex-1 min-w-0">
                <p className="font-['Inter:Bold',sans-serif] font-bold text-[#213163] text-[14px]">Début</p>
                <div className="w-full h-[40px] bg-white border border-[#e6ebf0] rounded-[8px] flex items-center px-[12px]">
                  <TimeField value={debut} onChange={setDebut} />
                </div>
              </div>
              <div className="flex flex-col gap-[8px] flex-1 min-w-0">
                <p className="font-['Inter:Bold',sans-serif] font-bold text-[#213163] text-[14px]">Fin</p>
                <div className="w-full h-[40px] bg-white border border-[#e6ebf0] rounded-[8px] flex items-center px-[12px]">
                  <TimeField value={fin} onChange={setFin} />
                </div>
              </div>
            </div>

            {/* Jours */}
            <div className="flex flex-col gap-[8px] items-start w-full">
              <p className="font-['Inter:Bold',sans-serif] font-bold text-[#213163] text-[14px]">Jours</p>
              <div className="flex flex-wrap gap-[6px] items-start w-full">
                {ALL_DAYS.map((day) => {
                  const active = selectedDays.includes(day);
                  return (
                    <button
                      key={day}
                      onClick={() => toggleDay(day)}
                      className="flex-1 min-w-0 flex items-center justify-center px-[10px] py-[8px] rounded-[8px] cursor-pointer transition-colors text-[12px] whitespace-nowrap"
                      style={{
                        backgroundColor: active ? "#213163" : "white",
                        border: active ? "none" : "1px solid #e6ebf0",
                        color: active ? "white" : "#213163",
                        fontFamily: active ? "'Inter:Bold', sans-serif" : "'Inter:Medium', sans-serif",
                        fontWeight: active ? 700 : 500,
                      }}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
              {selectedDays.length === 0 && (
                <p className="text-[#c8102e] text-[12px]">Sélectionnez au moins un jour.</p>
              )}
            </div>

            {/* Récurrence */}
            <div className="flex flex-col gap-[8px] items-start w-full">
              <p className="font-['Inter:Bold',sans-serif] font-bold text-[#213163] text-[14px]">Récurrence</p>
              <div className="flex flex-wrap gap-[6px] items-start w-full">
                {RECURRENCES.map((r) => {
                  const active = recurrence === r.value;
                  return (
                    <button
                      key={r.value}
                      onClick={() => toggleRecurrence(r.value)}
                      className="flex-1 min-w-0 flex items-center justify-center px-[12px] py-[6px] rounded-[16px] cursor-pointer transition-colors text-[12px] whitespace-nowrap"
                      style={{
                        backgroundColor: active ? "#213163" : "white",
                        border: active ? "none" : "1px solid #e6ebf0",
                        color: active ? "white" : "#111",
                        fontFamily: active ? "'Inter:Semi_Bold', sans-serif" : "'Inter:Regular', sans-serif",
                        fontWeight: active ? 600 : 400,
                      }}
                    >
                      {r.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Overlap / validation error */}
            {error && (
              <div className="w-full px-[12px] py-[10px] rounded-[8px] bg-[#fff1f2] border border-[#fecdd3] flex items-start gap-[8px]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-[1px]">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p className="font-['Inter:Regular',sans-serif] text-[#c8102e] text-[13px] leading-snug">{error}</p>
              </div>
            )}
          </div>

          <div className="bg-[#e6ebf0] h-px w-full shrink-0" />

          {/* Footer */}
          <div className="flex flex-col gap-[10px] items-start w-full p-[16px] shrink-0">
            <button
              disabled={!canSave}
              title={!canSave ? "Choisissez un type et au moins un jour avant d'enregistrer." : undefined}
              onClick={() => { if (!canSave || !type) return; onSave(type, debut, fin, selectedDays, recurrence); }}
              className={`w-full py-[12px] rounded-[8px] font-['Inter:Bold',sans-serif] font-bold text-white text-[14px] border-0 transition-colors ${
                canSave ? "bg-[#213163] cursor-pointer hover:bg-[#1a2750]" : "bg-[#a8b0c4] cursor-not-allowed"
              }`}
            >
              Sauvegarder
            </button>
            <button
              onClick={onClose}
              className="w-full py-[10px] rounded-[8px] border border-[#e6ebf0] bg-white font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#111] text-[13px] cursor-pointer"
            >
              Annuler
            </button>
            {mode === "edit" && onDelete && (
              <button
                onClick={onDelete}
                className="w-full h-[42px] rounded-[6px] border border-[#c8102e] bg-white font-['Inter:Medium',sans-serif] font-medium text-[#c8102e] text-[14px] cursor-pointer hover:bg-[#fff5f5] transition-colors"
              >
                Supprimer
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white flex flex-col rounded-[12px] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.18)]"
        style={{ width: 600, maxWidth: "calc(100vw - 16px)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-[16px] pl-[24px] pr-[20px] pt-[20px]">
          <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#213163] text-[20px]">
            Disponibilité de la propriété
          </p>
          <button onClick={onClose} className="cursor-pointer bg-transparent border-0 p-0 shrink-0">
            <CloseIcon />
          </button>
        </div>

        <div className="bg-[#e6ebf0] h-px w-full shrink-0" />

        {/* Body */}
        <div className="flex flex-col gap-[14px] px-[24px] py-[20px]">

          {/* Type */}
          <div className="flex gap-[12px] items-center w-full">
            <p className="font-['Inter:Bold',sans-serif] font-bold text-[#213163] text-[14px] w-[77px] shrink-0">Type</p>
            <div className="flex flex-1 gap-[8px] min-w-0">
              {(Object.keys(TYPE_CONFIG) as EventType[]).map((t) => {
                const cfg = TYPE_CONFIG[t];
                const active = type !== null && type === t;
                return (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className="flex-1 min-w-0 h-[36px] rounded-[999px] flex items-center justify-center gap-[8px] px-[12px] cursor-pointer transition-colors"
                    style={{
                      backgroundColor: active ? cfg.bg : "white",
                      border: `1px solid ${cfg.border}`,
                    }}
                  >
                    <div className="relative shrink-0 size-[16px]">
                      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
                        <rect fill="white" height="14" rx="7" width="14" x="1" y="1" />
                        <rect height="14" rx="7" stroke={active ? "white" : cfg.color} strokeWidth="2" width="14" x="1" y="1" />
                        {active && <circle cx="8" cy="8" fill={cfg.color} r="4" />}
                      </svg>
                    </div>
                    <span
                      className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[14px] truncate min-w-0"
                      style={{ color: active ? "white" : cfg.color }}
                    >
                      {cfg.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Début */}
          <div className="flex gap-[12px] items-center w-full">
            <p className="font-['Inter:Bold',sans-serif] font-bold text-[#213163] text-[14px] w-[77px] shrink-0">Début</p>
            <div className="flex-1 h-[36px] bg-white rounded-[6px] border border-[#cacfd6] flex items-center pl-[12px] pr-[10px]">
              <TimeField value={debut} onChange={setDebut} />
            </div>
          </div>

          {/* Fin */}
          <div className="flex gap-[12px] items-center w-full">
            <p className="font-['Inter:Bold',sans-serif] font-bold text-[#213163] text-[14px] w-[77px] shrink-0">Fin</p>
            <div className="flex-1 h-[36px] bg-white rounded-[6px] border border-[#cacfd6] flex items-center pl-[12px] pr-[10px]">
              <TimeField value={fin} onChange={setFin} />
            </div>
          </div>

          {/* Jours */}
          <div className="flex items-center gap-[12px] w-full">
            <p className="font-['Inter:Bold',sans-serif] font-bold text-[#213163] text-[14px] w-[77px] shrink-0">Jours</p>
            <div className="flex flex-1 gap-[8px] min-w-0">
              {ALL_DAYS.map((day) => {
                const active = selectedDays.includes(day);
                return (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    className="flex-1 min-w-0 h-[36px] rounded-[999px] flex items-center justify-center px-[10px] cursor-pointer border transition-colors text-[13px] whitespace-nowrap"
                    style={{
                      backgroundColor: active ? "#213163" : "white",
                      borderColor: active ? "#213163" : "#cacfd6",
                      color: active ? "white" : "#111",
                      fontFamily: "'Inter:Medium', sans-serif",
                      fontWeight: 500,
                    }}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
          {selectedDays.length === 0 && (
            <p className="text-[#c8102e] text-[12px] pl-[89px] -mt-[8px]">Sélectionnez au moins un jour.</p>
          )}

          {/* Récurrence */}
          <div className="flex items-center gap-[12px] w-full">
            <p className="font-['Inter:Bold',sans-serif] font-bold text-[#213163] text-[14px] w-[77px] shrink-0">Récurrence</p>
            <div className="flex flex-1 gap-[8px] min-w-0">
              {RECURRENCES.map((r) => {
                const active = recurrence === r.value;
                return (
                  <button
                    key={r.value}
                    onClick={() => toggleRecurrence(r.value)}
                    className="flex-1 min-w-0 h-[36px] rounded-[999px] flex items-center justify-center px-[10px] cursor-pointer border transition-colors text-[13px] whitespace-nowrap"
                    style={{
                      backgroundColor: active ? "#213163" : "white",
                      borderColor: active ? "#213163" : "#cacfd6",
                      color: active ? "white" : "#111",
                      fontFamily: "'Inter:Medium', sans-serif",
                      fontWeight: 500,
                    }}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Overlap / validation error */}
        {error && (
          <div className="mx-[24px] mb-[4px] px-[12px] py-[10px] rounded-[8px] bg-[#fff1f2] border border-[#fecdd3] flex items-start gap-[8px]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-[1px]">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="font-['Inter:Regular',sans-serif] text-[#c8102e] text-[13px] leading-snug">{error}</p>
          </div>
        )}

        <div className="bg-[#e6ebf0] h-px w-full shrink-0" />

        {/* Footer */}
        <div className="flex items-center justify-between px-[24px] py-[14px]">
          <div className="flex gap-[8px] h-[42px] items-center">
            <button
              onClick={onClose}
              className="bg-white h-full px-[16px] rounded-[6px] border border-[#cacfd6] font-['Inter:Medium',sans-serif] font-medium text-[#111] text-[14px] cursor-pointer whitespace-nowrap"
            >
              Annuler
            </button>
            <button
              disabled={!canSave}
              title={!canSave ? "Choisissez un type et au moins un jour avant d'enregistrer." : undefined}
              onClick={() => {
                if (!canSave || !type) return;
                onSave(type, debut, fin, selectedDays, recurrence);
              }}
              className={`h-full px-[16px] rounded-[6px] font-['Inter:Bold',sans-serif] font-bold text-white text-[14px] whitespace-nowrap border-0 transition-colors ${
                canSave ? "bg-[#213163] cursor-pointer hover:bg-[#1a2750]" : "bg-[#a8b0c4] cursor-not-allowed"
              }`}
            >
              Sauvegarder
            </button>
          </div>

          {mode === "edit" && onDelete && (
            <button
              onClick={onDelete}
              className="bg-white h-[42px] px-[16px] rounded-[6px] border border-[#c8102e] font-['Inter:Medium',sans-serif] font-medium text-[#c8102e] text-[14px] cursor-pointer whitespace-nowrap hover:bg-[#fff5f5] transition-colors"
            >
              Supprimer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
