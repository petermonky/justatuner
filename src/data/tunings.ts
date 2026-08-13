import type { TuningPreset, TargetNote } from "@/types/tuner"
import { noteToFrequency } from "@/audio/pitch-utils"

function parseNote(spec: string): TargetNote {
  const match = spec.match(/^([A-G][#b]?)(\d)$/)
  if (!match) throw new Error(`Invalid note spec: ${spec}`)
  const note = match[1]
  const octave = Number(match[2])
  return { note, octave, frequency: noteToFrequency(note, octave) }
}

function preset(id: string, name: string, notes: string): TuningPreset {
  return { id, name, strings: notes.split(" ").map(parseNote) }
}

export const TUNINGS: TuningPreset[] = [
  preset("standard", "Standard", "E2 A2 D3 G3 B3 E4"),
  preset("drop-d", "Drop D", "D2 A2 D3 G3 B3 E4"),
  preset("half-step-down", "Half Step Down", "Eb2 Ab2 Db3 Gb3 Bb3 Eb4"),
  preset("whole-step-down", "Whole Step Down", "D2 G2 C3 F3 A3 D4"),
  preset("dadgad", "DADGAD", "D2 A2 D3 G3 A3 D4"),
  preset("open-d", "Open D", "D2 A2 D3 F#3 A3 D4"),
  preset("open-e", "Open E", "E2 B2 E3 G#3 B3 E4"),
  preset("open-g", "Open G", "D2 G2 D3 G3 B3 D4"),
  preset("open-a", "Open A", "E2 A2 E3 A3 C#4 E4"),
  preset("drop-c", "Drop C", "C2 G2 C3 F3 A3 D4"),
]

export const DEFAULT_TUNING_ID = "standard"

export function getTuning(id: string): TuningPreset {
  return TUNINGS.find((t) => t.id === id) ?? TUNINGS[0]
}
