"use client"

import { useEffect } from "react"
import { useTuner } from "@/hooks/useTuner"
import { TUNINGS } from "@/data/tunings"
import { Tuner } from "@/components/tuner/Tuner"
import { TuningSelector } from "@/components/tuner/TuningSelector"
import { StringSelector } from "@/components/tuner/StringSelector"
import { AboutDialog } from "@/components/AboutDialog"

export default function Home() {
  const tuner = useTuner()
  const { status, tuning, start, setTuning, setManualTarget } = tuner
  const running = status !== "idle"

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target as HTMLElement
      if (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return
      if (target.closest("dialog")) return

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
    <main className="grid min-h-dvh grid-rows-[auto_1fr_auto] gap-6 p-5 lg:h-dvh lg:grid-cols-[1fr_minmax(0,2.4fr)_1fr] lg:grid-rows-1 lg:items-center lg:gap-10 lg:overflow-hidden lg:p-10">
      <div className="lg:max-h-full lg:overflow-y-auto">
        <TuningSelector selectedId={tuning.id} onSelect={setTuning} disabled={!running} />
      </div>

      <div className="flex items-center justify-center lg:h-full">
        <Tuner tuner={tuner} />
      </div>

      <div className="lg:max-h-full lg:overflow-y-auto">
        <StringSelector
          tuning={tuning}
          activeTarget={tuner.target}
          manualTarget={tuner.manualTarget}
          cents={tuner.cents}
          onSelect={setManualTarget}
          disabled={!running}
        />
      </div>

      <AboutDialog />
    </main>
  )
}
