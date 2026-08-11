export interface TargetNote {
  note: string
  octave: number
  frequency: number
}

export interface TuningPreset {
  id: string
  name: string
  strings: TargetNote[]
}

export type DetectionState = "idle" | "listening" | "detecting" | "stable"

export type MicErrorKind = "denied" | "unavailable" | "unsupported"

/**
 * High-frequency values written by the audio pipeline (~30 Hz) and read by
 * the canvas renderer (60 FPS). Kept outside React state on purpose.
 */
export interface LiveReading {
  frequency: number | null
  cents: number | null
  amplitude: number
  confidence: number
}
