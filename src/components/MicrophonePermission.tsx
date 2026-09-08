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
    <div className="animate-fade-rise flex flex-col items-center gap-4 text-center [animation-delay:500ms]">
      <button
        type="button"
        onClick={onStart}
        className="bg-[var(--strong)] px-4 py-2 text-base text-[var(--background)] transition-[opacity,transform] duration-200 ease-[ease] hover:opacity-80 active:scale-[0.97] motion-reduce:transform-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--strong)]"
      >
        Enable microphone
      </button>
      {micError && (
        <p
          role="alert"
          className="animate-fade-rise max-w-64 text-xs leading-relaxed text-[var(--strong)]"
        >
          {ERROR_MESSAGES[micError]}
        </p>
      )}
    </div>
  )
}
