import { ImageResponse } from "next/og"
import { SITE_TITLE } from "@/lib/site"

export const alt = SITE_TITLE
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

// A faithful still of the app: the tuner circle with the detected wave and
// the faint reference wave inside, and rings propagating outward with the
// same exponential fade. All geometry is computed.
const CX = 600
const CY = 315
const RADIUS = 200
const RING_STEP = 90
const RING_COUNT = 8

// Waves use half-integer cycle counts so sin(cycles · 2π) = 0 at both ends,
// pinning the endpoints to the circle's horizontal diameter.
function wavePoints(cycles: number, amplitude: number): string {
  const pts: string[] = []
  for (let x = CX - RADIUS; x <= CX + RADIUS; x += 2) {
    const t = (x - (CX - RADIUS)) / (2 * RADIUS)
    const y = CY - amplitude * Math.sin(cycles * 2 * Math.PI * t)
    pts.push(`${x},${y.toFixed(2)}`)
  }
  return pts.join(" ")
}

const detectedWave = wavePoints(2.5, RADIUS * 0.35)
const referenceWave = wavePoints(3.5, RADIUS * 0.35)

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#ffffff" }}>
        <svg width="1200" height="630" viewBox="0 0 1200 630">
          {Array.from({ length: RING_COUNT }, (_, i) => (
            <circle
              key={i}
              cx={CX}
              cy={CY}
              r={RADIUS + (i + 1) * RING_STEP}
              fill="none"
              stroke="#9d9daf"
              strokeWidth={2}
              opacity={0.5 * Math.pow(0.75, i)}
            />
          ))}
          <circle
            cx={CX}
            cy={CY}
            r={RADIUS}
            fill="none"
            stroke="#62627a"
            strokeWidth={3}
            opacity={0.5}
          />
          <polyline
            points={referenceWave}
            fill="none"
            stroke="#62627a"
            strokeWidth={3}
            opacity={0.15}
            strokeLinecap="round"
          />
          <polyline
            points={detectedWave}
            fill="none"
            stroke="#62627a"
            strokeWidth={4}
            strokeLinecap="round"
          />
        </svg>
      </div>
    ),
    size
  )
}
