"use client"

import { useEffect, useRef } from "react"
import type { LiveReading } from "@/types/tuner"
import { IN_TUNE_CENTS } from "@/hooks/useTuner"

interface Props {
  live: React.RefObject<LiveReading>
  running: boolean
}

// Map the guitar range to a controlled number of visible wave cycles so
// pitch → wavelength stays elegant instead of literal.
const MIN_FREQ = 70
const MAX_FREQ = 330
const MIN_CYCLES = 1.5
const MAX_CYCLES = 5

function frequencyToCycles(frequency: number): number {
  const t =
    (Math.log2(frequency) - Math.log2(MIN_FREQ)) /
    (Math.log2(MAX_FREQ) - Math.log2(MIN_FREQ))
  return MIN_CYCLES + Math.min(1, Math.max(0, t)) * (MAX_CYCLES - MIN_CYCLES)
}

function lerp(current: number, target: number, factor: number): number {
  return current + (target - current) * factor
}

/**
 * Renders the pitch-derived waveform inside the circle. Runs its own
 * requestAnimationFrame loop and reads high-frequency values from the
 * mutable `live` ref — React state never drives per-frame animation.
 */
export function TunerVisualizer({ live, running }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const runningRef = useRef(running)

  useEffect(() => {
    runningRef.current = running
  }, [running])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let width = 0
    let height = 0
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      width = rect.width
      height = rect.height
      canvas.width = Math.round(rect.width * dpr)
      canvas.height = Math.round(rect.height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")

    let foreground = "#62627a"
    let accent = "#000000"
    const readColors = () => {
      const style = getComputedStyle(canvas)
      foreground = style.getPropertyValue("--foreground").trim() || foreground
      accent = style.getPropertyValue("--accent").trim() || accent
    }
    readColors()
    const scheme = window.matchMedia("(prefers-color-scheme: dark)")
    scheme.addEventListener("change", readColors)
    // The theme toggle swaps CSS variables via data-theme on <html>.
    const themeObserver = new MutationObserver(readColors)
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    })

    // Mutable render state, interpolated toward targets each frame for
    // organic motion even though pitch only updates ~30 times per second.
    const wave = { phase: 0, cycles: 2, amplitude: 0, drift: 0, opacity: 0.4, lock: 0 }
    // Faint wave at the target note's wavelength. It shares the detected
    // wave's phase and amplitude, so the two travel together and coincide
    // exactly when the pitch matches.
    const ref = { cycles: 2, amplitude: 0, opacity: 0 }
    let lastTime = performance.now()
    let raf = 0

    const draw = (time: number) => {
      raf = requestAnimationFrame(draw)
      const dt = Math.min((time - lastTime) / 1000, 0.1)
      lastTime = time

      const reading = live.current
      const hasPitch = runningRef.current && reading.frequency !== null
      const hasTarget = runningRef.current && reading.targetFrequency !== null
      const cents = reading.cents ?? 0
      const inTune = hasPitch && Math.abs(cents) <= IN_TUNE_CENTS

      // Targets derived from the current reading; idle state breathes gently.
      const targetCycles = hasPitch ? frequencyToCycles(reading.frequency!) : 2
      const targetAmplitude = runningRef.current
        ? hasPitch
          ? Math.min(1, Math.pow(reading.amplitude * 8, 0.7))
          : 0.05 + 0.025 * Math.sin(time / 1600)
        : 0.04
      const targetOpacity = hasPitch ? 0.45 + 0.55 * reading.confidence : 0.35
      // Flat drifts left, sharp drifts right; settles inside the lock window.
      const targetDrift = !hasPitch || inTune ? 0 : Math.max(-1, Math.min(1, cents / 50))

      wave.cycles = lerp(wave.cycles, targetCycles, 0.08)
      wave.amplitude = lerp(wave.amplitude, targetAmplitude, 0.12)
      wave.drift = lerp(wave.drift, targetDrift, 0.06)
      wave.opacity = lerp(wave.opacity, targetOpacity, 0.1)
      wave.lock = lerp(wave.lock, inTune ? 1 : 0, 0.08)

      // The reference matches the detected wave's amplitude while a note
      // sounds so the two can overlap exactly; alone it holds a calm size.
      ref.cycles = lerp(
        ref.cycles,
        hasTarget ? frequencyToCycles(reading.targetFrequency!) : targetCycles,
        0.08
      )
      ref.amplitude = lerp(ref.amplitude, hasTarget ? (hasPitch ? targetAmplitude : 0.3) : 0.04, 0.12)
      ref.opacity = lerp(ref.opacity, hasTarget ? 0.15 : 0, 0.1)

      if (reducedMotion.matches) {
        wave.drift = 0
      } else {
        const idleFlow = hasPitch ? 0 : 0.15
        wave.phase += (-wave.drift * 4 + idleFlow) * dt
      }

      ctx.clearRect(0, 0, width, height)
      const cx = width / 2
      const cy = height / 2
      const radius = Math.min(width, height) / 2 - 1

      // Circle outline, slightly stronger when locked in tune.
      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      ctx.strokeStyle = wave.lock > 0.5 ? accent : foreground
      ctx.globalAlpha = 0.14 + 0.4 * wave.lock
      ctx.lineWidth = 3
      ctx.stroke()

      // Waveform, clipped to the circle.
      ctx.save()
      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      ctx.clip()

      const maxAmplitude = radius * 0.5
      const color = wave.lock > 0.5 ? accent : foreground

      const strokeWave = (
        cycles: number,
        amplitude: number,
        phase: number,
        alpha: number,
        lineWidth: number
      ) => {
        const amp = amplitude * maxAmplitude
        const k = (cycles * 2 * Math.PI) / (radius * 2)
        ctx.beginPath()
        for (let x = cx - radius; x <= cx + radius; x += 1.5) {
          const angle = (x - cx + radius) * k + phase
          let y = Math.sin(angle) * amp
          y += Math.sin(angle * 2 + phase * 2) * amp * 0.08
          if (x === cx - radius) ctx.moveTo(x, cy + y)
          else ctx.lineTo(x, cy + y)
        }
        ctx.globalAlpha = alpha
        ctx.strokeStyle = color
        ctx.lineWidth = lineWidth
        ctx.stroke()
      }

      if (ref.opacity > 0.01) {
        strokeWave(ref.cycles, ref.amplitude, wave.phase, ref.opacity, 3)
      }
      strokeWave(wave.cycles, wave.amplitude, wave.phase, wave.opacity, 4)
      ctx.restore()
      ctx.globalAlpha = 1
    }
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
      themeObserver.disconnect()
      scheme.removeEventListener("change", readColors)
    }
  }, [live])

  return <canvas ref={canvasRef} className="h-full w-full" aria-hidden="true" />
}
