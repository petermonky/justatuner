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
    // On desktop the circle sits in the center row of a 1fr/auto/1fr grid so it
    // is exactly vertically centered; the readout hangs in the row below it.
    <div className="flex flex-col items-center gap-6 lg:grid lg:h-full lg:grid-rows-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:justify-items-center lg:gap-0">
      <div className="relative aspect-square w-[clamp(240px,70vw,340px)] lg:row-start-2 lg:w-[clamp(280px,34vw,520px)]">
        <TunerVisualizer live={tuner.live} running={running} />
      </div>

      <div className="lg:row-start-3 lg:self-start lg:pt-6">
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
