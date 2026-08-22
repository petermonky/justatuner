"use client"

interface Props {
  note: { note: string; octave: number } | null
  cents: number | null
  frequency: number | null
  inTune: boolean
}

export function DetectedNote({ note, cents, frequency, inTune }: Props) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <div
        className={`text-6xl font-extralight leading-none tracking-tight transition-colors duration-300 sm:text-7xl ${
          inTune ? "text-[var(--accent)]" : "text-[var(--foreground)]"
        }`}
      >
        {note ? (
          <>
            {note.note}
            <span className="text-2xl align-baseline opacity-40 sm:text-3xl">
              {note.octave}
            </span>
          </>
        ) : (
          <span className="opacity-15">·</span>
        )}
      </div>
      <div className="h-5 text-sm tabular-nums opacity-60">
        {cents !== null &&
          `${cents > 0 ? "+" : "−"}${String(Math.abs(Math.round(cents))).padStart(2, "0")}`}
      </div>
      <div className="h-4 text-xs tabular-nums opacity-30">
        {frequency !== null && `${frequency.toFixed(1)} Hz`}
      </div>
    </div>
  )
}
