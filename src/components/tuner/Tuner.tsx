"use client"

import type { MicErrorKind } from "@/types/tuner"
import type { Tuner as TunerData } from "@/hooks/useTuner"
import { TunerVisualizer } from "./TunerVisualizer"
import { DetectedNote } from "./DetectedNote"

const ERROR_MESSAGES: Record<MicErrorKind, string> = {
  denied: "Microphone access is required to tune. Enable it in your browser settings.",
  unavailable: "Microphone unavailable.",
  unsupported: "This browser does not support the required audio features.",
}

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
        {/* Before the mic starts, the circle itself is the enable button: a
            lightly filled disc under the canvas (which lets clicks through). */}
        {!running && (
          <button
            type="button"
            onClick={() => void tuner.start()}
            className="animate-fade-rise absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-full bg-[var(--strong)] text-[var(--hairline)] transition-[color,background-color,scale] duration-200 ease-[ease] [animation-delay:500ms] hover:bg-[color-mix(in_srgb,var(--strong)_85%,var(--background))] hover:text-[var(--background)] active:scale-[0.98] motion-reduce:active:scale-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--strong)]"
          >
            <svg
              aria-hidden="true"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="22" />
            </svg>
            <span className="text-base">Enable microphone</span>
          </button>
        )}
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
          tuner.micError && (
            <p
              role="alert"
              className="animate-fade-rise max-w-64 text-xs leading-relaxed text-[var(--strong)]"
            >
              {ERROR_MESSAGES[tuner.micError]}
            </p>
          )
        )}
      </div>

      <div aria-live="polite" className="sr-only">
        {srStatus}
      </div>
    </div>
  )
}
