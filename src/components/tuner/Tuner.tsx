"use client"

import type { Tuner as TunerData } from "@/hooks/useTuner"
import { TunerVisualizer } from "./TunerVisualizer"
import { DetectedNote } from "./DetectedNote"
import { MicrophonePermission } from "@/components/MicrophonePermission"

interface Props {
  tuner: TunerData
}

export function Tuner({ tuner }: Props) {
  const running = tuner.status !== "idle"

  // Cents are bucketed to 5 so the polite live region doesn't re-announce
  // on every throttled state update.
  const srStatus =
    tuner.detectedNote && tuner.cents !== null
      ? `${tuner.detectedNote.note}${tuner.detectedNote.octave}, ${
          tuner.inTune
            ? "in tune"
            : `${Math.abs(Math.round(tuner.cents / 5) * 5)} cents ${tuner.cents < 0 ? "flat" : "sharp"}`
        }`
      : ""

  return (
    // The circle sits in the center row of a 1fr/auto/1fr grid so it stays
    // exactly centered regardless of the readout's height; the readout is
    // centered within the bottom track, i.e. halfway between the circle's
    // bottom and the bottom of the available space.
    <div className="grid h-full grid-rows-[minmax(0,1fr)_auto_minmax(0,1fr)] justify-items-center">
      <div className="relative row-start-2 aspect-square w-[min(70vw,42dvh,340px)] lg:w-[clamp(280px,34vw,520px)]">
        {/* Equidistant rings nested around the circle, fading as they progress
            outward (clipped by the page's overflow-hidden). Kept to 12: the
            exponential fade makes further rings invisible, and each ring is a
            large compositor layer that would slow every animation on the page. */}
        {Array.from({ length: 12 }, (_, i) => (
          <div
            key={i}
            aria-hidden="true"
            className="animate-ring-in pointer-events-none absolute top-1/2 left-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--faint)]"
            style={{
              width: `calc(100% + ${i + 1} * var(--ring-step))`,
              height: `calc(100% + ${i + 1} * var(--ring-step))`,
              opacity: 0.5 * Math.pow(0.75, i),
              animationDelay: `${500 + i * 30}ms`,
            }}
          />
        ))}
        <TunerVisualizer live={tuner.live} running={running} />
      </div>

      <div className="row-start-3 self-center">
        {running ? (
          <DetectedNote
            note={tuner.detectedNote}
            cents={tuner.cents}
            frequency={tuner.frequency}
            inTune={tuner.inTune}
          />
        ) : (
          <MicrophonePermission micError={tuner.micError} onStart={tuner.start} />
        )}
      </div>

      <div aria-live="polite" className="sr-only">
        {srStatus}
      </div>
    </div>
  )
}
