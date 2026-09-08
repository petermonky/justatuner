"use client"

import type { MicErrorKind } from "@/types/tuner"

interface Props {
  micError: MicErrorKind | null
  onStart: () => void
}

const ERROR_MESSAGES: Record<MicErrorKind, string> = {
  denied: "Microphone access is required to tune. Enable it in your browser settings.",
  unavailable: "Microphone unavailable.",
  unsupported: "This browser does not support the required audio features.",
}

export function MicrophonePermission({ micError, onStart }: Props) {
  return (
    <div className="animate-fade-rise flex flex-col items-center gap-4 text-center">
      <button
        type="button"
        onClick={onStart}
        className="rounded px-3 py-1.5 text-sm opacity-60 transition-[opacity,transform] duration-200 hover:opacity-100 active:scale-[0.97] motion-reduce:transform-none focus-visible:outline focus-visible:outline-offset-4 focus-visible:outline-[var(--foreground)]"
      >
        Enable microphone
      </button>
      {micError && (
        <p role="alert" className="animate-fade-rise max-w-60 text-xs leading-relaxed opacity-50">
          {ERROR_MESSAGES[micError]}
        </p>
      )}
      <p className="text-[11px] opacity-30">Audio stays on your device.</p>
    </div>
  )
}
