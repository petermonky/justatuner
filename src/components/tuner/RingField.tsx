"use client"

import { useEffect, useRef } from "react"
import type { LiveReading } from "@/types/tuner"
import { IN_TUNE_CENTS } from "@/hooks/useTuner"
import { LOBES, undulation } from "./undulation"

interface Props {
  live: React.RefObject<LiveReading>
  /** The circle wrapper the rings are centered on. */
  anchorRef: React.RefObject<HTMLDivElement | null>
}

const RING_COUNT = 12
const UNDULATION = 5 // px of stroke undulation at full level

/**
 * Canvas ring field: the equidistant rings around the tuner circle, with the
 * app's exponential fade and staggered entrance. The strokes undulate with
 * the mic level, rising gradually on a note's attack and easing away as it
 * decays; the shimmer speed follows the detected pitch.
 */
export function RingField({ live, anchorRef }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const anchor = anchorRef.current
    if (!canvas || !anchor) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let width = 0
    let height = 0
    let step = 96
    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const parsed = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--ring-step")
      )
      if (!Number.isNaN(parsed)) step = parsed
    }
    resize()
    window.addEventListener("resize", resize)
    const observer = new ResizeObserver(resize)
    observer.observe(document.documentElement)

    let faint = "#9d9daf"
    let foreground = "#62627a"
    let accent = "#000000"
    const readColors = () => {
      const style = getComputedStyle(canvas)
      faint = style.getPropertyValue("--faint").trim() || faint
      foreground = style.getPropertyValue("--foreground").trim() || foreground
      accent = style.getPropertyValue("--accent").trim() || accent
    }
    readColors()
    const themeObserver = new MutationObserver(readColors)
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    })

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    let level = 0
    let lock = 0
    let waveSpeed = 5.5 // rad/s, modulated by the detected frequency
    let wavePhase = 0
    const mountTime = performance.now()
    let lastTime = mountTime
    let raf = 0

    const draw = (time: number) => {
      raf = requestAnimationFrame(draw)
      const dt = Math.min((time - lastTime) / 1000, 0.1)
      lastTime = time

      // Measured every frame so the rings can never desync from the circle
      // (layout shifts, font swaps, breakpoint changes). One read, no writes.
      const rect = anchor.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const baseRadius = rect.width / 2

      if (!reducedMotion.matches) {
        const raw = Math.min(1, live.current.amplitude * 6)
        // Undulation follows the smoothed level — a gradual rise into the
        // attack, a slightly quicker ease-away — and its shimmer speed
        // tracks the detected frequency so higher notes wobble faster.
        level += (raw - level) * (raw > level ? 0.04 : 0.06)
        const frequency = live.current.frequency
        if (frequency) waveSpeed += (frequency / 40 - waveSpeed) * 0.05
        wavePhase += dt * waveSpeed
        const cents = live.current.cents
        const inTune = frequency !== null && cents !== null && Math.abs(cents) <= IN_TUNE_CENTS
        lock += ((inTune ? 1 : 0) - lock) * 0.08
      }

      ctx.clearRect(0, 0, width, height)

      // Undulating stroke shared by the circle (index -1) and the rings,
      // softening slightly with distance from the center.
      const ringAmplitude = (index: number) => level * UNDULATION * Math.pow(0.92, index)
      const strokeRing = (index: number, radius: number) => {
        const amplitude = ringAmplitude(index)
        ctx.beginPath()
        if (amplitude < 0.05) {
          ctx.arc(cx, cy, radius, 0, Math.PI * 2)
        } else {
          const segments = 140
          for (let k = 0; k <= segments; k++) {
            const theta = (k / segments) * Math.PI * 2
            const r = radius + amplitude * Math.sin(LOBES * theta + wavePhase + index * 0.7)
            const x = cx + r * Math.cos(theta)
            const y = cy + r * Math.sin(theta)
            if (k === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
          }
          ctx.closePath()
        }
        ctx.stroke()
      }

      // Publish the circle's undulation so the visualizer's wave clip can
      // follow the outline exactly.
      undulation.phase = wavePhase
      undulation.amplitude = ringAmplitude(-1)

      // The tuner circle itself, stronger and accented when locked in tune.
      const circleEntrance = reducedMotion.matches
        ? 1
        : Math.min(1, Math.max(0, (time - mountTime - 500) / 400))
      if (circleEntrance > 0) {
        ctx.lineWidth = 3
        ctx.strokeStyle = lock > 0.5 ? accent : foreground
        ctx.globalAlpha = (0.14 + 0.4 * lock) * circleEntrance
        strokeRing(-1, baseRadius - 1)
      }

      ctx.lineWidth = 2
      ctx.strokeStyle = faint
      for (let i = 0; i < RING_COUNT; i++) {
        const radius = baseRadius + ((i + 1) * step) / 2
        const fade = 0.5 * Math.pow(0.75, i)
        const entrance = reducedMotion.matches
          ? 1
          : Math.min(1, Math.max(0, (time - mountTime - 500 - i * 30) / 400))
        if (entrance <= 0) continue
        ctx.globalAlpha = fade * entrance
        strokeRing(i, radius)
      }
      ctx.globalAlpha = 1
    }
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", resize)
      observer.disconnect()
      themeObserver.disconnect()
    }
  }, [live, anchorRef])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      // Explicit CSS size: inset alone doesn't stretch a replaced element,
      // which would leave the canvas at its (dpr-scaled) intrinsic size.
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  )
}
