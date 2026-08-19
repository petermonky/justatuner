"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { AudioEngine, MicError, type AudioFrame } from "@/audio/audio-engine"
import { PitchSmoother } from "@/audio/smoothing"
import {
  centsBetween,
  correctOctave,
  frequencyToMidi,
  midiToFrequency,
  nearestTarget,
} from "@/audio/pitch-utils"
import { DEFAULT_TUNING_ID, getTuning } from "@/data/tunings"
import type {
  DetectionState,
  LiveReading,
  MicErrorKind,
  TargetNote,
  TuningPreset,
} from "@/types/tuner"

export const IN_TUNE_CENTS = 3
const MIN_CLARITY = 0.5
const STRING_SWITCH_MS = 150
const NOTE_HOLD_MS = 700
const REACT_UPDATE_MS = 80
const STORAGE_KEY = "tuner-tuning"

export interface TunerState {
  status: DetectionState
  micError: MicErrorKind | null
  frequency: number | null
  detectedNote: { note: string; octave: number } | null
  target: TargetNote | null
  cents: number | null
  inTune: boolean
  tuning: TuningPreset
  manualTarget: TargetNote | null
}

export interface Tuner extends TunerState {
  /** Mutable high-frequency values for the canvas renderer. */
  live: React.RefObject<LiveReading>
  start: () => Promise<void>
  stop: () => void
  setTuning: (id: string) => void
  setManualTarget: (target: TargetNote | null) => void
}

const IDLE_STATE: Omit<TunerState, "tuning" | "manualTarget" | "status" | "micError"> = {
  frequency: null,
  detectedNote: null,
  target: null,
  cents: null,
  inTune: false,
}

export function useTuner(): Tuner {
  const [state, setState] = useState<TunerState>({
    ...IDLE_STATE,
    status: "idle",
    micError: null,
    tuning: getTuning(DEFAULT_TUNING_ID),
    manualTarget: null,
  })

  const live = useRef<LiveReading>({
    frequency: null,
    cents: null,
    amplitude: 0,
    confidence: 0,
  })

  const engine = useRef<AudioEngine | null>(null)
  const smoother = useRef(new PitchSmoother())

  // Values the ~30 Hz audio callback needs without re-subscribing.
  const tuningRef = useRef(state.tuning)
  const manualRef = useRef<TargetNote | null>(null)
  const activeTarget = useRef<TargetNote | null>(null)
  const switchCandidate = useRef<{ target: TargetNote; since: number } | null>(null)
  const lastDetectionAt = useRef(0)
  const lastReactUpdateAt = useRef(0)

  const handleFrame = useCallback((frame: AudioFrame) => {
    const now = performance.now()
    const tuning = tuningRef.current
    const manual = manualRef.current

    let reading: {
      frequency: number
      target: TargetNote
      cents: number
    } | null = null

    if (frame.frequency !== null && frame.clarity >= MIN_CLARITY) {
      const targets = manual ? [manual] : tuning.strings
      const corrected = correctOctave(frame.frequency, targets)
      const midi = smoother.current.update(frequencyToMidi(corrected))
      const frequency = midiToFrequency(midi)

      let target: TargetNote
      if (manual) {
        target = manual
      } else {
        // Hysteresis: only switch strings after the new candidate has been
        // consistently closer for a short window, to avoid flicker.
        const nearest = nearestTarget(frequency, tuning.strings).target
        const current = activeTarget.current
        if (!current || !tuning.strings.includes(current)) {
          target = nearest
        } else if (nearest === current) {
          switchCandidate.current = null
          target = current
        } else {
          const candidate = switchCandidate.current
          if (candidate?.target === nearest && now - candidate.since >= STRING_SWITCH_MS) {
            switchCandidate.current = null
            target = nearest
          } else {
            if (candidate?.target !== nearest) {
              switchCandidate.current = { target: nearest, since: now }
            }
            target = current
          }
        }
      }
      activeTarget.current = target
      reading = { frequency, target, cents: centsBetween(frequency, target.frequency) }
      lastDetectionAt.current = now
    }

    const held = now - lastDetectionAt.current < NOTE_HOLD_MS
    if (!reading && !held) {
      smoother.current.reset()
      switchCandidate.current = null
      if (!manual) activeTarget.current = null
    }

    // Feed the canvas: amplitude always tracks the mic, pitch values persist
    // briefly after the signal fades so the wave doesn't collapse abruptly.
    live.current.amplitude = frame.rms
    live.current.confidence = reading ? frame.clarity : held ? live.current.confidence : 0
    if (reading) {
      live.current.frequency = reading.frequency
      live.current.cents = reading.cents
    } else if (!held) {
      live.current.frequency = null
      live.current.cents = null
    }

    // Throttled, low-frequency React updates for the text UI.
    if (now - lastReactUpdateAt.current < REACT_UPDATE_MS) return
    lastReactUpdateAt.current = now

    setState((prev) => {
      if (reading) {
        const { note, octave } = reading.target
        return {
          ...prev,
          status: "stable",
          frequency: reading.frequency,
          detectedNote: { note, octave },
          target: reading.target,
          cents: reading.cents,
          inTune: Math.abs(reading.cents) <= IN_TUNE_CENTS,
        }
      }
      if (held) return prev
      return { ...prev, ...IDLE_STATE, status: "listening" }
    })
  }, [])

  const start = useCallback(async () => {
    if (engine.current) return
    engine.current = new AudioEngine()
    try {
      await engine.current.start(handleFrame)
      setState((prev) => ({ ...prev, status: "listening", micError: null }))
    } catch (error) {
      engine.current = null
      const kind = error instanceof MicError ? error.kind : "unavailable"
      setState((prev) => ({ ...prev, status: "idle", micError: kind }))
    }
  }, [handleFrame])

  const stop = useCallback(() => {
    engine.current?.stop()
    engine.current = null
    smoother.current.reset()
    live.current = { frequency: null, cents: null, amplitude: 0, confidence: 0 }
    setState((prev) => ({ ...prev, ...IDLE_STATE, status: "idle" }))
  }, [])

  const setTuning = useCallback((id: string) => {
    const tuning = getTuning(id)
    tuningRef.current = tuning
    manualRef.current = null
    activeTarget.current = null
    switchCandidate.current = null
    setState((prev) => ({ ...prev, tuning, manualTarget: null }))
    try {
      localStorage.setItem(STORAGE_KEY, id)
    } catch {}
    const url = new URL(window.location.href)
    url.searchParams.set("tuning", id)
    window.history.replaceState(null, "", url)
  }, [])

  const setManualTarget = useCallback((target: TargetNote | null) => {
    manualRef.current = target
    activeTarget.current = target
    switchCandidate.current = null
    setState((prev) => ({ ...prev, manualTarget: target }))
  }, [])

  // Restore tuning from URL or localStorage; clean up microphone on unmount.
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("tuning")
    let stored: string | null = null
    try {
      stored = localStorage.getItem(STORAGE_KEY)
    } catch {}
    const id = fromUrl ?? stored
    if (id && id !== DEFAULT_TUNING_ID) {
      const tuning = getTuning(id)
      tuningRef.current = tuning
      // One-time hydration-safe restore; reading localStorage during render
      // would mismatch the server-rendered default.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState((prev) => ({ ...prev, tuning }))
    }
    return () => {
      engine.current?.stop()
      engine.current = null
    }
  }, [])

  return { ...state, live, start, stop, setTuning, setManualTarget }
}
