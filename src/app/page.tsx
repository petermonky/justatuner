"use client"

import { useEffect } from "react"
import { useTuner } from "@/hooks/useTuner"
import { TUNINGS } from "@/data/tunings"
import { Tuner } from "@/components/tuner/Tuner"
import { TuningSelector } from "@/components/tuner/TuningSelector"
import { StringSelector } from "@/components/tuner/StringSelector"
import { AboutDialog } from "@/components/AboutDialog"
import { ThemeToggle } from "@/components/ThemeToggle"

export default function Home() {
  const tuner = useTuner()
  const { status, tuning, start, setTuning, setManualTarget } = tuner
  const running = status !== "idle"

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target as HTMLElement
      if (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return
      if (target.closest('[role="dialog"]')) return

      if (event.key >= "1" && event.key <= "6") {
        setManualTarget(tuning.strings[Number(event.key) - 1] ?? null)
      } else if (event.key === "Escape") {
        setManualTarget(null)
      } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault()
        const index = TUNINGS.findIndex((t) => t.id === tuning.id)
        const next = index + (event.key === "ArrowDown" ? 1 : -1)
        setTuning(TUNINGS[(next + TUNINGS.length) % TUNINGS.length].id)
      } else if (event.key === " " && !running && target.tagName !== "BUTTON") {
        event.preventDefault()
        void start()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [tuning, running, start, setTuning, setManualTarget])

  return (
    // Mobile: presets on top (horizontal scroll), circle centered, strings at
    // the bottom, all locked to the viewport. Desktop: three columns.
    <main className="grid h-dvh grid-rows-[auto_1fr_auto] gap-4 overflow-hidden p-4 pt-14 lg:grid-cols-[1fr_minmax(0,2.4fr)_1fr] lg:grid-rows-1 lg:items-center lg:gap-10 lg:p-10">
      <h1 className="sr-only">justatuner — free online tuner</h1>
      {/* Center glow, fading in with the rest of the load sequence. */}
      <div
        aria-hidden="true"
        className="center-glow animate-glow-in pointer-events-none fixed inset-0 -z-20"
      />
      <span
        aria-hidden="true"
        className="fixed top-4 left-4 z-10 text-xl font-black tracking-tight text-[var(--strong)] select-none lg:top-10 lg:left-10"
      >
        justatuner
      </span>
      <div className="max-lg:min-w-0 lg:max-h-full lg:overflow-x-hidden lg:overflow-y-auto lg:px-1">
        <TuningSelector selectedId={tuning.id} onSelect={setTuning} disabled={!running} />
      </div>

      <div className="flex min-h-0 items-center justify-center lg:h-full">
        <Tuner tuner={tuner} />
      </div>

      <div className="max-lg:min-w-0 lg:max-h-full lg:overflow-x-hidden lg:overflow-y-auto lg:px-1">
        <StringSelector
          tuning={tuning}
          activeTarget={tuner.target}
          manualTarget={tuner.manualTarget}
          onSelect={setManualTarget}
          disabled={!running}
        />
      </div>

      <ThemeToggle />
      <AboutDialog />
    </main>
  )
}
