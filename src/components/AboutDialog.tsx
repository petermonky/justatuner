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
        className="fixed right-4 bottom-4 flex h-8 w-8 items-center justify-center text-sm text-[var(--faint)] transition-[color,transform] duration-200 ease-[ease] hover:text-[var(--strong)] active:scale-90 motion-reduce:transform-none focus-visible:text-[var(--strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--strong)]"
      >
        ?
      </button>

      <dialog
        ref={dialogRef}
        aria-label="About this app"
        onClick={(event) => {
          if (event.target === dialogRef.current) dialogRef.current.close()
        }}
        className="m-auto w-[min(90vw,384px)] border border-[var(--hairline)] bg-[var(--background)] text-[var(--foreground)]"
      >
        <div className="flex flex-col gap-8 p-6 text-base leading-normal">
          <p>
            A guitar tuner that runs locally in your browser. Lower notes make
            longer waves, and vice versa. Audio is processed on your device and
            never leaves it.
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
          onClick={() => dialogRef.current?.close()}
          className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center text-sm text-[var(--faint)] transition-[color,transform] duration-200 ease-[ease] hover:text-[var(--strong)] active:scale-90 motion-reduce:transform-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--strong)]"
        >
          ✕
        </button>
      </dialog>
    </>
  )
}
