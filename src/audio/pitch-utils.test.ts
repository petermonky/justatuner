import { describe, expect, it } from "vitest"
import {
  centsBetween,
  correctOctave,
  frequencyToMidi,
  midiToNote,
  nearestTarget,
  noteToFrequency,
} from "./pitch-utils"
import { getTuning } from "@/data/tunings"

const standard = getTuning("standard")

describe("frequencyToMidi", () => {
  it("maps A4 to 69", () => {
    expect(frequencyToMidi(440)).toBeCloseTo(69, 6)
  })

  it("maps E2 to 40", () => {
    expect(frequencyToMidi(82.4069)).toBeCloseTo(40, 3)
  })
})

describe("midiToNote", () => {
  it("names A4", () => {
    expect(midiToNote(69)).toEqual({ note: "A", octave: 4 })
  })

  it("names E2", () => {
    expect(midiToNote(40)).toEqual({ note: "E", octave: 2 })
  })
})

describe("noteToFrequency", () => {
  it("computes standard string frequencies", () => {
    expect(noteToFrequency("E", 2)).toBeCloseTo(82.4069, 3)
    expect(noteToFrequency("A", 2)).toBeCloseTo(110, 3)
    expect(noteToFrequency("E", 4)).toBeCloseTo(329.6276, 3)
  })

  it("treats enharmonic names identically", () => {
    expect(noteToFrequency("Eb", 2)).toBeCloseTo(noteToFrequency("D#", 2), 9)
  })
})

describe("centsBetween", () => {
  it("is zero for equal frequencies", () => {
    expect(centsBetween(440, 440)).toBe(0)
  })

  it("is 1200 for an octave", () => {
    expect(centsBetween(880, 440)).toBeCloseTo(1200, 6)
  })

  it("is negative when flat", () => {
    expect(centsBetween(81.94, 82.41)).toBeCloseTo(-9.9, 1)
  })
})

describe("nearestTarget", () => {
  it("finds E2 for 82.41 Hz", () => {
    expect(nearestTarget(82.41, standard.strings).target.note).toBe("E")
    expect(nearestTarget(82.41, standard.strings).target.octave).toBe(2)
  })

  it("finds A2 for 110 Hz", () => {
    const { target } = nearestTarget(110, standard.strings)
    expect(target).toMatchObject({ note: "A", octave: 2 })
  })
})

describe("correctOctave", () => {
  it("keeps a frequency already near a string", () => {
    expect(correctOctave(82.4, standard.strings)).toBeCloseTo(82.4, 6)
  })

  it("halves an octave-up error near low E", () => {
    expect(correctOctave(164.8, standard.strings)).toBeCloseTo(82.4, 6)
  })

  it("doubles an octave-down error near A2", () => {
    expect(correctOctave(55, standard.strings)).toBeCloseTo(110, 6)
  })

  it("corrects a second-harmonic reading of B3", () => {
    expect(correctOctave(493.883, standard.strings)).toBeCloseTo(246.9417, 3)
  })

  it("keeps a true D3 in drop D despite the D2 string", () => {
    const dropD = getTuning("drop-d")
    expect(correctOctave(146.8324, dropD.strings)).toBeCloseTo(146.8324, 3)
  })
})
