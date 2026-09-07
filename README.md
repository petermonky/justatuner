# Guitar Tuner

A minimal, browser-based guitar tuner. The central element is a circle containing
a pitch-derived waveform: lower notes produce longer waves, volume drives
amplitude, flat notes drift left, sharp notes drift right, and an in-tune note
settles and locks with a subtle accent.

All audio processing happens on-device with the Web Audio API — no backend, no
uploads, no recordings.

## Features

- Real-time YIN pitch detection (client-side, ~30 Hz analysis)
- Automatic string detection with hysteresis, plus manual string lock
- Octave-error correction against the active tuning
- 10 tuning presets (Standard, Drop D, DADGAD, open tunings, …)
- Canvas waveform at 60 FPS, rendered outside the React render loop
- Keyboard controls: `1–6` select a string, `Esc` returns to auto,
  `↑/↓` change tuning, `Space` starts the microphone
- Light/dark via system preference, reduced-motion support
- Tuning persisted to `localStorage` and shareable via `?tuning=drop-d`

## Development

```bash
pnpm install
pnpm dev     # http://localhost:3000
pnpm test    # unit tests for the DSP helpers and YIN detector
pnpm build
```

Built with Next.js (App Router), TypeScript, Tailwind CSS, the Web Audio API,
and the Canvas API. No runtime dependencies beyond React and Next.
