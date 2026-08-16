/**
 * Smooths pitch in MIDI space (linear in perceived pitch, unlike Hz).
 * A single wildly different reading is treated as an outlier and ignored;
 * two consecutive readings that agree with each other are accepted as a
 * genuine note change.
 */
export class PitchSmoother {
  private midi: number | null = null
  private outlier: number | null = null

  update(incoming: number): number {
    if (this.midi === null) {
      this.midi = incoming
      return incoming
    }
    if (Math.abs(incoming - this.midi) > 0.6) {
      if (this.outlier !== null && Math.abs(incoming - this.outlier) < 0.3) {
        // Confirmed jump to a different note — reset instead of gliding.
        this.midi = incoming
        this.outlier = null
        return incoming
      }
      this.outlier = incoming
      return this.midi
    }
    this.outlier = null
    this.midi = this.midi * 0.75 + incoming * 0.25
    return this.midi
  }

  reset(): void {
    this.midi = null
    this.outlier = null
  }
}
