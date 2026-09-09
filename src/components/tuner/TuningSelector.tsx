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
      className={`transition-opacity duration-200 ease-[ease] ${disabled ? "opacity-40" : ""}`}
    >
      <ul className="flex gap-1 overflow-x-auto max-lg:-mx-4 max-lg:px-4 max-lg:[mask-image:linear-gradient(to_right,transparent,black_24px,black_calc(100%-24px),transparent)] max-lg:[scrollbar-width:none] max-lg:[&::-webkit-scrollbar]:hidden lg:flex-col lg:overflow-visible">
        {TUNINGS.map((tuning, index) => {
          const selected = tuning.id === selectedId
          return (
            <li
              key={tuning.id}
              className="animate-fade-in-left shrink-0"
              // Sequential entrance: top-to-bottom on desktop, left-to-right
              // on mobile (same DOM order).
              style={{ animationDelay: `${500 + index * 40}ms` }}
            >
              <button
                type="button"
                onClick={() => onSelect(tuning.id)}
                aria-pressed={selected}
                className={`px-2 py-1 text-base whitespace-nowrap transition-[color,transform] duration-200 ease-[ease] hover:text-[var(--strong)] active:scale-[0.97] motion-reduce:transform-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--strong)] lg:-mx-2 ${
                  selected ? "font-semibold text-[var(--strong)]" : "text-[var(--foreground)]"
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
