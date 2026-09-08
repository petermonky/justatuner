# justatuner

**justatuner** is a tuner that runs locally in your browser. The central
element is a circle containing a pitch-derived waveform: lower notes produce
longer waves, volume drives amplitude, flat notes drift left, sharp notes drift
right. A faint reference wave shows the target note's wavelength, and when the
string is in tune the two waves merge into one and lock black. Concentric
rings radiate from the circle, fading as they go.

All audio processing happens on-device with the Web Audio API — no backend, no
uploads, no recordings. The deployed page makes no runtime network requests at
all.

## Features

- Real-time YIN pitch detection (client-side, ~30 Hz analysis)
- Automatic string detection with hysteresis, plus manual string lock
- Octave-error correction against the active tuning
- 10 tuning presets (Standard, Drop D, DADGAD, open tunings, …)
- Canvas waveform at 60 FPS, rendered outside the React render loop; a shared
  mutable ref carries readings from the audio callback to the renderer
- Faint reference wave at the target pitch that overlaps exactly when in tune
- Keyboard controls: `1–6` select a string, `Esc` returns to auto,
  `↑/↓` change tuning, `Space` starts the microphone
- Monochrome five-shade design (white, hairline, faint, muted purple-gray,
  black), hierarchy from color rather than opacity, no corner radii
- Dark mode toggle persisted to `localStorage`, defaulting to the system
  preference, applied before paint to avoid a flash
- Responsive mobile layout: presets on top (horizontal scroll with edge
  fades), circle centered, strings at the bottom, locked to the viewport
- Reduced-motion support across all animations
- Tuning persisted to `localStorage` and shareable via `?tuning=drop-d`
- SEO: metadata, Open Graph image, JSON-LD, `robots.txt`, `sitemap.xml`
- Security headers (CSP, Permissions-Policy, frame denial) via `next.config.ts`

## Development

```bash
pnpm install
pnpm dev     # http://localhost:3000
pnpm lint
pnpm test    # unit tests for the DSP helpers, YIN detector, and presets
pnpm build
```

Built with Next.js (App Router), TypeScript, Tailwind CSS, the Web Audio API,
and the Canvas API. Inter via `next/font`; no runtime dependencies beyond React
and Next. Fully static build, ready for Vercel — set `SITE_URL` in
`src/lib/site.ts` when the domain changes.

## Feedback

Suggestions or bugs? [Open an issue](https://github.com/petermonky/justatuner/issues).
