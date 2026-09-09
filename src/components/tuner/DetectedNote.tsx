"use client"

import { useEffect, useState } from "react"

interface Props {
  note: { note: string; octave: number } | null
  cents: number | null
  frequency: number | null
  inTune: boolean
}

interface Snapshot {
  note: { note: string; octave: number }
  cents: number | null
  frequency: number | null
}

export function DetectedNote({ note, cents, frequency }: Props) {
  // The last reading is kept on screen when the note stops so it can fade
  // out the way it faded in; `leaving` drives the exit animation.
  const [display, setDisplay] = useState<Snapshot | null>(null)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    if (note) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplay({ note, cents, frequency })
      setLeaving(false)
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLeaving(true)
    }
  }, [note, cents, frequency])

  // Fallback for reduced motion (where the exit animation never fires).
  useEffect(() => {
    if (!leaving) return
    const timeout = window.setTimeout(() => {
      setDisplay(null)
      setLeaving(false)
    }, 400)
    return () => window.clearTimeout(timeout)
  }, [leaving])

  const finishLeave = (event: React.AnimationEvent) => {
    if (leaving && event.animationName === "fade-out") {
      setDisplay(null)
      setLeaving(false)
    }
  }

  return (
    <div className="animate-fade-rise flex flex-col items-center text-center">
      {display ? (
        <div
          onAnimationEnd={finishLeave}
          className={`flex flex-col items-center gap-1 ${leaving ? "animate-fade-out" : ""}`}
        >
          <div className="text-5xl leading-none font-normal tracking-tight text-[var(--strong)]">
            {/* Keyed by note so a change of note (not of cents) re-runs the
                entrance animation. */}
            <span
              key={`${display.note.note}${display.note.octave}`}
              className="animate-fade-rise inline-block"
            >
              {display.note.note}
              <span className="align-baseline text-2xl text-[var(--faint)]">
                {display.note.octave}
              </span>
            </span>
          </div>
          <div className="h-6 text-base tabular-nums text-[var(--foreground)]">
            {display.cents !== null &&
              `${display.cents > 0 ? "+" : "−"}${String(Math.abs(Math.round(display.cents))).padStart(2, "0")}`}
          </div>
          <div className="h-4 text-xs tabular-nums text-[var(--faint)]">
            {display.frequency !== null && `${display.frequency.toFixed(1)} Hz`}
          </div>
        </div>
      ) : (
        <div className="animate-fade-in flex flex-col items-center gap-1">
          <div className="text-5xl leading-none">
            <span className="text-[var(--faint)]">·</span>
          </div>
          <div className="h-6 text-base" />
          <div className="h-4 text-xs" />
        </div>
      )}
    </div>
  )
}
