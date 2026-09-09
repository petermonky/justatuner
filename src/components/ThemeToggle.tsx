"use client"

import { useSyncExternalStore } from "react"

const STORAGE_KEY = "tuner-theme"

// The theme lives on <html data-theme>, set before paint by the layout's
// inline script; subscribe to attribute changes so the icon stays in sync.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  })
  return () => observer.disconnect()
}

function getTheme() {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light"
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getTheme, () => "light")

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark"
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {}
  }

  return (
    <button
      type="button"
      aria-label="Toggle dark mode"
      aria-pressed={theme === "dark"}
      onClick={toggle}
      className="fixed right-12 bottom-4 flex h-8 w-8 items-center justify-center text-[var(--faint)] transition-[color,scale] duration-200 ease-[ease] hover:text-[var(--strong)] active:scale-90 motion-reduce:active:scale-100 focus-visible:text-[var(--strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--strong)]"
    >
      {theme === "dark" ? (
        <svg
          aria-hidden="true"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4m11.4-11.4 1.4-1.4" />
        </svg>
      ) : (
        <svg
          aria-hidden="true"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
        </svg>
      )}
    </button>
  )
}
