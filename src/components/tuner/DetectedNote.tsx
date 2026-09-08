"use client"

interface Props {
  note: { note: string; octave: number } | null
  cents: number | null
  frequency: number | null
  inTune: boolean
}

export function DetectedNote({ note, cents, frequency }: Props) {
  return (
    <div className="animate-fade-rise flex flex-col items-center gap-1 text-center">
      <div className="text-5xl leading-none font-normal tracking-tight text-[var(--strong)]">
        {note ? (
          // Keyed by note so a change of note (not of cents) re-runs the
          // entrance animation.
          <span key={`${note.note}${note.octave}`} className="animate-fade-rise inline-block">
            {note.note}
            <span className="align-baseline text-2xl text-[var(--faint)]">{note.octave}</span>
          </span>
        ) : (
          <span className="text-[var(--faint)]">·</span>
        )}
      </div>
      <div className="h-6 text-base tabular-nums text-[var(--foreground)]">
        {cents !== null &&
          `${cents > 0 ? "+" : "−"}${String(Math.abs(Math.round(cents))).padStart(2, "0")}`}
      </div>
      <div className="h-4 text-xs tabular-nums text-[var(--faint)]">
        {frequency !== null && `${frequency.toFixed(1)} Hz`}
      </div>
    </div>
  )
}
