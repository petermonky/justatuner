import type { TargetNote } from "@/types/tuner"

export const A4 = 440

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

const NAME_TO_SEMITONE: Record<string, number> = {
  C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, F: 5,
  "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11,
}

export function frequencyToMidi(frequency: number): number {
  return 69 + 12 * Math.log2(frequency / A4)
}

export function midiToFrequency(midi: number): number {
  return A4 * 2 ** ((midi - 69) / 12)
}

export function midiToNote(midi: number): { note: string; octave: number } {
  const rounded = Math.round(midi)
  return {
    note: NOTE_NAMES[((rounded % 12) + 12) % 12],
    octave: Math.floor(rounded / 12) - 1,
  }
}

export function noteToFrequency(note: string, octave: number): number {
  const semitone = NAME_TO_SEMITONE[note]
  if (semitone === undefined) throw new Error(`Unknown note: ${note}`)
  return midiToFrequency(12 * (octave + 1) + semitone)
}

export function centsBetween(frequency: number, target: number): number {
  return 1200 * Math.log2(frequency / target)
}

export function nearestTarget(
  frequency: number,
  targets: TargetNote[],
): { target: TargetNote; cents: number } {
  let best = targets[0]
  let bestCents = centsBetween(frequency, best.frequency)
  for (const target of targets) {
    const cents = centsBetween(frequency, target.frequency)
    if (Math.abs(cents) < Math.abs(bestCents)) {
      best = target
      bestCents = cents
    }
  }
  return { target: best, cents: bestCents }
}

/**
 * Pitch detectors occasionally report an octave above or below the played
 * note. Prefer the candidate (f/2, f, f*2) that lands closest to a string in
 * the active tuning, but only when it lands reasonably close to one.
 */
export function correctOctave(frequency: number, targets: TargetNote[]): number {
  let best = frequency
  let bestDistance = Infinity
  // The raw detection is checked first with an improvement margin, so an
  // alternative octave only wins when it is meaningfully closer to a string
  // — near-ties (e.g. a true D3 in Drop D) keep the detector's reading.
  for (const candidate of [frequency, frequency / 2, frequency * 2]) {
    const distance = Math.abs(nearestTarget(candidate, targets).cents)
    if (distance < bestDistance - 0.5) {
      best = candidate
      bestDistance = distance
    }
  }
  return bestDistance < 150 ? best : frequency
}
