"use client"

import { TUNINGS } from "@/data/tunings"

interface Props {
  selectedId: string
  onSelect: (id: string) => void
  disabled: boolean
}

export function TuningSelector({ selectedId, onSelect, disabled }: Props) {
  return (
    <nav
      aria-label="Tunings"
      className={`transition-opacity duration-300 ${disabled ? "opacity-40" : ""}`}
    >
      <h2 className="mb-3 text-[11px] uppercase tracking-[0.2em] opacity-40 max-lg:hidden">
        Tuning
      </h2>
      <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
        {TUNINGS.map((tuning) => {
          const selected = tuning.id === selectedId
          return (
            <li key={tuning.id} className="shrink-0">
              <button
                type="button"
                onClick={() => onSelect(tuning.id)}
                aria-pressed={selected}
                className={`rounded px-2 py-1 text-sm whitespace-nowrap transition-[opacity,transform] duration-200 hover:opacity-90 active:scale-[0.97] motion-reduce:transform-none focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)] lg:-mx-2 ${
                  selected ? "opacity-100" : "opacity-40"
                }`}
              >
                {tuning.name}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
