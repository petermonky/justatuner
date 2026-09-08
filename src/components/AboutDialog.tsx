"use client"

import { useEffect, useState } from "react"

export function AboutDialog() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open])

  return (
    <>
      <button
        type="button"
        aria-label="About this app"
        onClick={() => setOpen(true)}
        className="fixed right-4 bottom-4 flex h-8 w-8 items-center justify-center text-sm text-[var(--faint)] transition-[color,transform] duration-200 ease-[ease] hover:text-[var(--strong)] active:scale-90 motion-reduce:transform-none focus-visible:text-[var(--strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--strong)]"
      >
        ?
      </button>

      {open && (
        <div
          role="presentation"
          onClick={() => setOpen(false)}
          className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="About this app"
            onClick={(event) => event.stopPropagation()}
            className="animate-fade-rise relative w-[min(90vw,384px)] border border-[var(--hairline)] bg-[var(--background)] text-[var(--foreground)]"
          >
            <div className="flex flex-col gap-8 p-6 text-base leading-relaxed">
              <p>
                <span className="font-black tracking-tight text-[var(--strong)]">
                  justatuner
                </span>{" "}
                is a guitar tuner that runs locally in your browser. Lower
                notes make longer waves, and vice versa. Audio is processed on
                your device and never leaves it.
              </p>
              <p>
                Suggestions or bugs?{" "}
                <a
                  href="https://github.com/petermonky/justatuner/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4 transition-colors duration-200 ease-[ease] hover:text-[var(--strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--strong)]"
                >
                  Open an issue
                </a>
                .
              </p>
            </div>
            <button
              type="button"
              aria-label="Close"
              autoFocus
              onClick={() => setOpen(false)}
              className="absolute top-1 right-1 flex h-8 w-8 items-center justify-center text-sm text-[var(--faint)] transition-[color,transform] duration-200 ease-[ease] hover:text-[var(--strong)] active:scale-90 motion-reduce:transform-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--strong)]"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  )
}
