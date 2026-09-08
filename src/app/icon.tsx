import { ImageResponse } from "next/og"

export const size = { width: 64, height: 64 }
export const contentType = "image/png"

// Mirrors the tuner's visual: a ring with a sine wave across it. All geometry
// is computed: the wave spans the ring's inner diameter with 1.5 cycles,
// phase-shifted by π/2 (a cosine), so it enters at a crest and exits at a
// trough, tucking under the ring, which is drawn on top.
const CENTER = 32
const RADIUS = 26
const RING_STROKE = 5
const WAVE_STROKE = 5
const CYCLES = 1.5
const INNER = RADIUS - RING_STROKE / 2
const AMPLITUDE = INNER * 0.42

const points: string[] = []
for (let x = CENTER - INNER; x <= CENTER + INNER; x += 0.5) {
  const t = (x - (CENTER - INNER)) / (2 * INNER)
  const y = CENTER - AMPLITUDE * Math.sin(CYCLES * 2 * Math.PI * t + Math.PI / 2)
  points.push(`${x.toFixed(2)},${y.toFixed(2)}`)
}

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%" }}>
        <svg width="64" height="64" viewBox="0 0 64 64">
          <circle cx={CENTER} cy={CENTER} r={CENTER} fill="#ffffff" />
          <polyline
            points={points.join(" ")}
            fill="none"
            stroke="#62627a"
            strokeWidth={WAVE_STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            stroke="#000000"
            strokeWidth={RING_STROKE}
          />
        </svg>
      </div>
    ),
    size
  )
}
