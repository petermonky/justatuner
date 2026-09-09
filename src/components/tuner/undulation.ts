/**
 * Per-frame undulation state of the tuner circle, written by RingField's
 * draw loop and read by TunerVisualizer so the wave clip follows the
 * undulating outline exactly. Mutable on purpose — both sides run at 60 FPS
 * outside React.
 */
export const undulation = { phase: 0, amplitude: 0 }

/** Undulation lobes around each ring; shared so the shapes always agree. */
export const LOBES = 6
