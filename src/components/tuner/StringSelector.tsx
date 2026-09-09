"use client"

import type { TargetNote, TuningPreset } from "@/types/tuner"

interface Props {
  tuning: TuningPreset
  activeTarget: TargetNote | null
  manualTarget: TargetNote | null
  onSelect: (target: TargetNote | null) => void
  disabled: boolean
}

export function StringSelector({
  tuning,
  activeTarget,
  manualTarget,
  onSelect,
  disabled,
}: Props) {
  return (
    <nav
      aria-label="Strings"
      className={`transition-opacity duration-200 ease-[ease] ${disabled ? "opacity-40" : ""}`}
    >
      <ul className="flex gap-2 max-lg:-mx-4 max-lg:overflow-x-auto max-lg:px-4 max-lg:[justify-content:safe_center] max-lg:[scrollbar-width:none] max-lg:[&::-webkit-scrollbar]:hidden lg:flex-col lg:items-end">
        {tuning.strings.map((string, index) => {
          const isManual = manualTarget === string
          const isActive = activeTarget === string
          return (
            <li
              key={index}
              className="animate-fade-in-right"
              // Sequential entrance: top-to-bottom on desktop, left-to-right
              // on mobile (same DOM order).
              style={{ animationDelay: `${500 + index * 40}ms` }}
            >
              <button
                type="button"
                onClick={() => onSelect(isManual ? null : string)}
                aria-pressed={isManual}
                aria-label={`${string.note}${string.octave} string${isManual ? ", selected" : ""}`}
                className={`flex items-center px-2 py-1 text-base tabular-nums transition-[color,transform] duration-200 ease-[ease] hover:text-[var(--strong)] active:scale-[0.97] motion-reduce:transform-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--strong)] lg:-mx-2 ${
                  isActive || isManual
                    ? "font-semibold text-[var(--strong)]"
                    : "text-[var(--foreground)]"
                }`}
              >
                <span>
                  {string.note}
                  <span className="text-[var(--faint)]">{string.octave}</span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
      <div className="mt-2 flex justify-center lg:justify-end">
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={`px-2 py-1 text-xs tracking-[0.1em] uppercase transition-[color,opacity] duration-200 ease-[ease] hover:text-[var(--strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--strong)] lg:-mx-2 ${
            manualTarget ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          Auto
        </button>
      </div>
    </nav>
  )
}
