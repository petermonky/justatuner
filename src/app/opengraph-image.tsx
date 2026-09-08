import { ImageResponse } from "next/og"
import { SITE_TITLE } from "@/lib/site"

export const alt = SITE_TITLE
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 40,
          background: "#ffffff",
          color: "#000000",
        }}
      >
        <svg width="720" height="120" viewBox="0 0 720 120" fill="none">
          <path
            d="M0 60 C 45 10, 90 10, 135 60 S 225 110, 270 60 S 360 10, 405 60 S 495 110, 540 60 S 630 10, 675 60 L 720 60"
            stroke="#62627a"
            strokeWidth="6"
          />
        </svg>
        <div style={{ fontSize: 88, fontWeight: 900, letterSpacing: -2 }}>justatuner</div>
        <div style={{ fontSize: 34, color: "#62627a" }}>
          Free online tuner. Private, instant, in your browser.
        </div>
      </div>
    ),
    size
  )
}
