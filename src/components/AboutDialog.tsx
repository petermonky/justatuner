"use client"

import { useRef } from "react"

export function AboutDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null)

  return (
    <>
      <button
        type="button"
        aria-label="About this app"
        onClick={() => dialogRef.current?.showModal()}
        className="fixed right-4 bottom-4 flex h-8 w-8 items-center justify-center rounded-full text-sm opacity-30 transition-[opacity,transform] duration-200 hover:opacity-100 active:scale-90 motion-reduce:transform-none focus-visible:opacity-100 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)]"
      >
        ?
      </button>

      <dialog
        ref={dialogRef}
        aria-label="About this app"
        onClick={(event) => {
          if (event.target === dialogRef.current) dialogRef.current.close()
        }}
        className="m-auto w-[min(90vw,380px)] rounded-lg border border-[color-mix(in_srgb,var(--foreground)_15%,transparent)] bg-[var(--background)] text-[var(--foreground)] shadow-lg backdrop:bg-black/40"
      >
        <div className="flex flex-col gap-4 p-6 text-sm leading-relaxed">
          <p className="opacity-70">
            A guitar tuner that runs in your browser. It listens through the
            microphone, detects pitch, and draws it as a waveform: lower notes
            make longer waves, flat drifts left, sharp drifts right, and an
            in-tune note settles and locks.
          </p>
          <p className="opacity-70">
            Audio is processed on your device and never leaves it.
          </p>
          <a
            href="https://github.com/petermonky"
            target="_blank"
            rel="noopener noreferrer"
            className="self-start underline underline-offset-4 opacity-70 transition-opacity duration-200 hover:opacity-100 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)]"
          >
            @petermonky
          </a>
        </div>
        <button
          type="button"
          aria-label="Close"
          onClick={() => dialogRef.current?.close()}
          className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full text-sm opacity-40 transition-[opacity,transform] duration-200 hover:opacity-100 active:scale-90 motion-reduce:transform-none focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-[var(--foreground)]"
        >
          ✕
        </button>
      </dialog>
    </>
  )
}
