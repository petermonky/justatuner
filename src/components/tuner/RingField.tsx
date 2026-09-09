"use client"

import { useEffect, useRef } from "react"
import type { LiveReading } from "@/types/tuner"
import { IN_TUNE_CENTS } from "@/hooks/useTuner"

interface Props {
  live: React.RefObject<LiveReading>
  /** The circle wrapper the rings are centered on. */
  anchorRef: React.RefObject<HTMLDivElement | null>
}

const RING_COUNT = 12
const SPEED = 9 // rings per second
const SIGMA = 1.3 // wavefront width, in rings
const WAVE_AMPLITUDE = 7 // px of stroke undulation at a full-strength crest
const LOBES = 6 // undulation lobes around each ring

/**
 * Canvas ring field: the equidistant rings around the tuner circle, with the
 * app's exponential fade and staggered entrance. A note attack spawns a
 * wavefront that travels outward, and rings under it undulate — the stroke
 * itself ripples rather than the ring merely scaling.
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
    const fronts: { p: number; s: number }[] = []
    let slowEnv = 0
    let lastSpawn = 0
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
        // Continuous undulation follows the smoothed level; its speed tracks
        // the detected frequency so higher notes shimmer faster.
        level += (raw - level) * 0.08
        const frequency = live.current.frequency
        if (frequency) waveSpeed += (frequency / 40 - waveSpeed) * 0.05
        wavePhase += dt * waveSpeed
        const cents = live.current.cents
        const inTune = frequency !== null && cents !== null && Math.abs(cents) <= IN_TUNE_CENTS
        lock += ((inTune ? 1 : 0) - lock) * 0.08
        // An attack is a fast rise above the slow-moving envelope.
        if (raw > 0.12 && raw > slowEnv * 1.25 && time - lastSpawn > 280) {
          fronts.push({ p: -1, s: raw })
          lastSpawn = time
        }
        slowEnv += (raw - slowEnv) * 0.04
        for (let f = fronts.length - 1; f >= 0; f--) {
          fronts[f].p += dt * SPEED
          if (fronts[f].p > RING_COUNT + 3) fronts.splice(f, 1)
        }
      }

      ctx.clearRect(0, 0, width, height)

      // Undulating stroke shared by the circle (index -1) and the rings:
      // attack-ripple displacement plus the continuous level-driven wobble.
      const strokeRing = (index: number, radius: number) => {
        let displacement = 0
        for (const front of fronts) {
          const d = index - front.p
          displacement +=
            front.s *
            Math.exp(-(d * d) / (2 * SIGMA * SIGMA)) *
            Math.exp(-Math.max(0, front.p) * 0.06)
        }
        const amplitude =
          Math.min(1.5, displacement) * WAVE_AMPLITUDE + level * 4 * Math.pow(0.92, index)
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
