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
    <div className="flex flex-col items-center gap-6">
      <div className="relative aspect-square w-[clamp(240px,70vw,340px)] lg:w-[clamp(280px,34vw,520px)]">
        <TunerVisualizer live={tuner.live} running={running} />
      </div>

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

      <div aria-live="polite" className="sr-only">
        {srStatus}
      </div>
    </div>
  )
}
