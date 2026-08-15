export interface PitchResult {
  frequency: number
  /** 0–1, derived from the YIN aperiodicity at the chosen lag. */
  clarity: number
}

const MIN_FREQUENCY = 50
const MAX_FREQUENCY = 1000
const YIN_THRESHOLD = 0.15

/**
 * YIN pitch detection (de Cheveigné & Kawahara, 2002): cumulative mean
 * normalized difference over candidate lags, absolute threshold, then
 * parabolic interpolation for sub-sample precision.
 */
export function detectPitch(
  buffer: Float32Array,
  sampleRate: number,
): PitchResult | null {
  const windowSize = Math.floor(buffer.length / 2)
  const tauMin = Math.max(2, Math.floor(sampleRate / MAX_FREQUENCY))
  const tauMax = Math.min(windowSize, Math.floor(sampleRate / MIN_FREQUENCY))
  if (tauMax <= tauMin) return null

  // Difference function d(tau).
  const diff = new Float32Array(tauMax)
  for (let tau = 1; tau < tauMax; tau++) {
    let sum = 0
    for (let i = 0; i < windowSize; i++) {
      const delta = buffer[i] - buffer[i + tau]
      sum += delta * delta
    }
    diff[tau] = sum
  }

  // Cumulative mean normalized difference d'(tau).
  const cmnd = new Float32Array(tauMax)
  cmnd[0] = 1
  let runningSum = 0
  for (let tau = 1; tau < tauMax; tau++) {
    runningSum += diff[tau]
    cmnd[tau] = runningSum === 0 ? 1 : (diff[tau] * tau) / runningSum
  }

  // First lag under threshold, then descend to its local minimum.
  let tau = -1
  for (let t = tauMin; t < tauMax; t++) {
    if (cmnd[t] < YIN_THRESHOLD) {
      while (t + 1 < tauMax && cmnd[t + 1] < cmnd[t]) t++
      tau = t
      break
    }
  }
  if (tau === -1) return null

  // Parabolic interpolation around the minimum.
  let betterTau = tau
  if (tau > 0 && tau < tauMax - 1) {
    const s0 = cmnd[tau - 1]
    const s1 = cmnd[tau]
    const s2 = cmnd[tau + 1]
    const denominator = 2 * (2 * s1 - s2 - s0)
    if (denominator !== 0) betterTau = tau + (s2 - s0) / denominator
  }

  return {
    frequency: sampleRate / betterTau,
    clarity: Math.max(0, Math.min(1, 1 - cmnd[tau])),
  }
}
