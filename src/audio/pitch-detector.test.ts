import { describe, expect, it } from "vitest"
import { detectPitch } from "./pitch-detector"

const SAMPLE_RATE = 48000
const BUFFER_SIZE = 2048

function sineBuffer(frequency: number, amplitude = 0.5): Float32Array {
  const buffer = new Float32Array(BUFFER_SIZE)
  for (let i = 0; i < BUFFER_SIZE; i++) {
    buffer[i] = amplitude * Math.sin((2 * Math.PI * frequency * i) / SAMPLE_RATE)
  }
  return buffer
}

// Guitar-relevant fundamentals, D2 through A4.
const FREQUENCIES = [73.42, 82.41, 110, 146.83, 196, 246.94, 329.63, 440]

describe("detectPitch", () => {
  it.each(FREQUENCIES)("detects a %s Hz sine within 1 cent", (frequency) => {
    const result = detectPitch(sineBuffer(frequency), SAMPLE_RATE)
    expect(result).not.toBeNull()
    const cents = 1200 * Math.log2(result!.frequency / frequency)
    expect(Math.abs(cents)).toBeLessThan(1)
    expect(result!.clarity).toBeGreaterThan(0.9)
  })

  it("detects a sine with harmonics (guitar-like) accurately", () => {
    const buffer = sineBuffer(110, 0.4)
    const second = sineBuffer(220, 0.2)
    const third = sineBuffer(330, 0.1)
    for (let i = 0; i < buffer.length; i++) buffer[i] += second[i] + third[i]
    const result = detectPitch(buffer, SAMPLE_RATE)
    expect(result).not.toBeNull()
    const cents = 1200 * Math.log2(result!.frequency / 110)
    expect(Math.abs(cents)).toBeLessThan(2)
  })

  it("returns null for silence", () => {
    expect(detectPitch(new Float32Array(BUFFER_SIZE), SAMPLE_RATE)).toBeNull()
  })

  it("returns null for white noise", () => {
    const buffer = new Float32Array(BUFFER_SIZE)
    let seed = 1
    for (let i = 0; i < BUFFER_SIZE; i++) {
      // Deterministic pseudo-random noise.
      seed = (seed * 16807) % 2147483647
      buffer[i] = (seed / 2147483647) * 0.6 - 0.3
    }
    expect(detectPitch(buffer, SAMPLE_RATE)).toBeNull()
  })
})
