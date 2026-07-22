import { useState } from "react";
import svgPaths from "../imports/ModalDisponibilite/svg-2jpbtmv37i";

export type EventType = "visite-libre" | "pre-approuve" | "impossible";
export type Recurrence = "jour" | "semaine" | "mois" | "annee";
export type Day = "Lun" | "Mar" | "Mer" | "Jeu" | "Ven" | "Sam" | "Dim";
export type RecurrenceData = { recurrence: Recurrence; days: Day[] } | null;

const ALL_DAYS: Day[] = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const RECURRENCES: { label: string; value: Recurrence }[] = [
  { label: "Chaque jour", value: "jour" },
  { label: "Chaque semaine", value: "semaine" },
  { label: "Chaque mois", value: "mois" },
  { label: "Chaque année", value: "annee" },
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
  error?: string | null;
  onClose: () => void;
  onSave: (type: EventType, start: string, end: string, recurrenceData: RecurrenceData) => void;
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

export default function ModalDisponibilite({
  mode = "create",
  initialType = "visite-libre",
  startTime = "09:00",
  endTime = "10:00",
  error,
  onClose,
  onSave,
  onDelete,
}: ModalProps) {
  const [type, setType] = useState<EventType | null>(mode === "edit" ? initialType : null);
  const [debut, setDebut] = useState(startTime);
  const [fin, setFin] = useState(endTime);
  const [repetitionOpen, setRepetitionOpen] = useState(mode === "edit");
  const [selectedDays, setSelectedDays] = useState<Day[]>([]);
  const [recurrence, setRecurrence] = useState<Recurrence | null>(null);

  const toggleDay = (day: Day) =>
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );

  const toggleRecurrence = (r: Recurrence) =>
    setRecurrence((prev) => (prev === r ? null : r));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white flex flex-col rounded-[12px] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.18)]"
        style={{ width: 600, maxWidth: "95vw" }}
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
            <div className="flex flex-1 gap-[8px]">
              {(Object.keys(TYPE_CONFIG) as EventType[]).map((t) => {
                const cfg = TYPE_CONFIG[t];
                const active = type !== null && type === t;
                return (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className="flex-1 h-[36px] rounded-[999px] flex items-center justify-center gap-[8px] px-[12px] cursor-pointer transition-colors"
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
                      className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[14px] whitespace-nowrap"
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
              <input
                type="time"
                value={debut}
                onChange={(e) => setDebut(e.target.value)}
                className="font-['Inter:Regular',sans-serif] text-[#111] text-[14px] border-0 outline-none bg-transparent flex-1"
              />
            </div>
          </div>

          {/* Fin */}
          <div className="flex gap-[12px] items-center w-full">
            <p className="font-['Inter:Bold',sans-serif] font-bold text-[#213163] text-[14px] w-[77px] shrink-0">Fin</p>
            <div className="flex-1 h-[36px] bg-white rounded-[6px] border border-[#cacfd6] flex items-center pl-[12px] pr-[10px]">
              <input
                type="time"
                value={fin}
                onChange={(e) => setFin(e.target.value)}
                className="font-['Inter:Regular',sans-serif] text-[#111] text-[14px] border-0 outline-none bg-transparent flex-1"
              />
            </div>
          </div>

          {/* Répétition accordion */}
          <div className="bg-white rounded-[8px] border border-[#e6ebf0] w-full overflow-hidden">
            <button
              onClick={() => setRepetitionOpen((v) => !v)}
              className="w-full flex items-center justify-between pl-[20px] pr-[10px] py-[12px] cursor-pointer bg-transparent border-0"
            >
              <span className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#213163] text-[16px]">
                {repetitionOpen ? "Répétition" : "Récurrence"}
              </span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d={repetitionOpen ? "M12 10L8 6L4 10" : "M6 12L10 8L6 4"}
                  stroke="#1B2559" strokeLinecap="round" strokeWidth="2"
                />
              </svg>
            </button>

            {repetitionOpen && (
              <div className="flex flex-col gap-[12px] pl-[20px] pr-[10px] pb-[14px]">
                {/* Jours */}
                <div className="flex items-center gap-[12px] w-full">
                  <p className="font-['Inter:Bold',sans-serif] font-bold text-[#213163] text-[14px] w-[88px] shrink-0">Jours</p>
                  <div className="flex flex-1 gap-[8px]">
                    {ALL_DAYS.map((day) => {
                      const active = selectedDays.includes(day);
                      return (
                        <button
                          key={day}
                          onClick={() => toggleDay(day)}
                          className="flex-1 h-[28px] rounded-[999px] flex items-center justify-center px-[10px] cursor-pointer border transition-colors text-[13px] whitespace-nowrap"
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

                {/* Récurrence */}
                <div className="flex items-start gap-[12px] w-full">
                  <p className="font-['Inter:Bold',sans-serif] font-bold text-[#213163] text-[14px] shrink-0 w-[88px] h-[28px] flex items-center">Récurrence</p>
                  <div className="flex flex-1 gap-[8px] flex-wrap">
                    {RECURRENCES.map((r) => {
                      const active = recurrence === r.value;
                      return (
                        <button
                          key={r.value}
                          onClick={() => toggleRecurrence(r.value)}
                          className="flex-1 h-[28px] rounded-[999px] flex items-center justify-center px-[10px] cursor-pointer border transition-colors text-[13px] whitespace-nowrap"
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
            )}
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
              onClick={() => {
                if (!type) return;
                const recurrenceData: RecurrenceData =
                  repetitionOpen && recurrence ? { recurrence, days: selectedDays } : null;
                onSave(type, debut, fin, recurrenceData);
              }}
              className="bg-[#213163] h-full px-[16px] rounded-[6px] font-['Inter:Bold',sans-serif] font-bold text-white text-[14px] cursor-pointer whitespace-nowrap border-0 hover:bg-[#1a2750] transition-colors"
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
