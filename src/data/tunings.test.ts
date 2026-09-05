import { describe, expect, it } from "vitest"
import { TUNINGS, getTuning } from "./tunings"

describe("tuning presets", () => {
  it("all have unique ids and six strings", () => {
    const ids = new Set(TUNINGS.map((t) => t.id))
    expect(ids.size).toBe(TUNINGS.length)
    for (const tuning of TUNINGS) {
      expect(tuning.strings).toHaveLength(6)
    }
  })

  it("orders strings from low to high", () => {
    for (const tuning of TUNINGS) {
      for (let i = 1; i < tuning.strings.length; i++) {
        expect(tuning.strings[i].frequency).toBeGreaterThan(
          tuning.strings[i - 1].frequency,
        )
      }
    }
  })

  it("standard tuning has the expected frequencies", () => {
    const expected = [82.4069, 110, 146.8324, 195.9977, 246.9417, 329.6276]
    getTuning("standard").strings.forEach((string, i) => {
      expect(string.frequency).toBeCloseTo(expected[i], 3)
    })
  })

  it("falls back to standard for unknown ids", () => {
    expect(getTuning("nope").id).toBe("standard")
  })
})
