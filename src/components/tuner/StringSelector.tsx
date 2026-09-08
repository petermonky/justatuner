"use client"

import type { TargetNote, TuningPreset } from "@/types/tuner"

interface Props {
  tuning: TuningPreset
  activeTarget: TargetNote | null
  manualTarget: TargetNote | null
  cents: number | null
  onSelect: (target: TargetNote | null) => void
  disabled: boolean
}

export function StringSelector({
  tuning,
  activeTarget,
  manualTarget,
  cents,
  onSelect,
  disabled,
}: Props) {
  return (
    <nav
      aria-label="Strings"
      className={`transition-opacity duration-300 ${disabled ? "opacity-40" : ""}`}
    >
      <h2 className="mb-3 text-right text-[11px] uppercase tracking-[0.2em] opacity-40 max-lg:hidden">
        Strings
      </h2>
      <ul className="flex justify-center gap-1 lg:flex-col lg:items-end">
        {tuning.strings.map((string, index) => {
          const isManual = manualTarget === string
          const isActive = activeTarget === string
          return (
            <li key={index}>
              <button
                type="button"
                onClick={() => onSelect(isManual ? null : string)}
                aria-pressed={isManual}
                aria-label={`${string.note}${string.octave} string${isManual ? ", selected" : ""}`}
                className={`flex items-center gap-2 rounded px-2 py-1 text-sm tabular-nums transition-[opacity,transform] duration-200 hover:opacity-90 active:scale-[0.97] motion-reduce:transform-none focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)] lg:-mx-2 ${
                  isActive || isManual ? "opacity-100" : "opacity-40"
                }`}
              >
                <span className="w-8 text-left text-xs opacity-50 max-lg:hidden">
                  {isActive && cents !== null
                    ? `${cents > 0 ? "+" : "−"}${String(Math.abs(Math.round(cents))).padStart(2, "0")}`
                    : ""}
                </span>
                <span>
                  {string.note}
                  <span className="opacity-50">{string.octave}</span>
                </span>
                <span
                  aria-hidden="true"
                  className={`h-1 w-1 rounded-full bg-[var(--accent)] transition-[opacity,transform] duration-200 motion-reduce:transform-none ${
                    isManual ? "scale-100 opacity-100" : "scale-50 opacity-0"
                  }`}
                />
              </button>
            </li>
          )
        })}
      </ul>
      <div className="mt-2 flex justify-center lg:justify-end">
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={`rounded px-2 py-1 text-xs uppercase tracking-[0.15em] transition-opacity duration-200 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)] lg:-mx-2 ${
            manualTarget ? "opacity-50 hover:opacity-90" : "pointer-events-none opacity-0"
          }`}
        >
          Auto
        </button>
      </div>
    </nav>
  )
}
