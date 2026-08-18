import { detectPitch } from "./pitch-detector"
import type { MicErrorKind } from "@/types/tuner"

export interface AudioFrame {
  frequency: number | null
  clarity: number
  rms: number
}

export class MicError extends Error {
  constructor(public kind: MicErrorKind) {
    super(kind)
  }
}

const FFT_SIZE = 2048
const ANALYSIS_INTERVAL_MS = 33 // ~30 Hz — detection does not need display rate.
const RMS_GATE = 0.005

/**
 * Owns the single AudioContext / MediaStream / AnalyserNode for the app and
 * runs pitch analysis on an interval, reporting frames to a callback.
 */
export class AudioEngine {
  private context: AudioContext | null = null
  private stream: MediaStream | null = null
  private analyser: AnalyserNode | null = null
  private buffer = new Float32Array(FFT_SIZE)
  private timer: ReturnType<typeof setInterval> | null = null

  async start(onFrame: (frame: AudioFrame) => void): Promise<void> {
    if (this.context) return
    if (!navigator.mediaDevices?.getUserMedia || typeof AudioContext === "undefined") {
      throw new MicError("unsupported")
    }

    try {
      // Voice processing interferes with musical pitch detection.
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      })
    } catch (error) {
      const name = error instanceof DOMException ? error.name : ""
      throw new MicError(
        name === "NotAllowedError" || name === "SecurityError" ? "denied" : "unavailable",
      )
    }

    this.context = new AudioContext()
    await this.context.resume()
    const source = this.context.createMediaStreamSource(this.stream)
    this.analyser = this.context.createAnalyser()
    this.analyser.fftSize = FFT_SIZE
    source.connect(this.analyser)

    this.timer = setInterval(() => this.analyze(onFrame), ANALYSIS_INTERVAL_MS)
  }

  private analyze(onFrame: (frame: AudioFrame) => void): void {
    if (!this.analyser || !this.context) return
    this.analyser.getFloatTimeDomainData(this.buffer)

    let sum = 0
    for (let i = 0; i < this.buffer.length; i++) sum += this.buffer[i] * this.buffer[i]
    const rms = Math.sqrt(sum / this.buffer.length)

    if (rms < RMS_GATE) {
      onFrame({ frequency: null, clarity: 0, rms })
      return
    }

    const pitch = detectPitch(this.buffer, this.context.sampleRate)
    onFrame({
      frequency: pitch?.frequency ?? null,
      clarity: pitch?.clarity ?? 0,
      rms,
    })
  }

  stop(): void {
    if (this.timer !== null) clearInterval(this.timer)
    this.timer = null
    this.stream?.getTracks().forEach((track) => track.stop())
    this.stream = null
    this.analyser = null
    void this.context?.close()
    this.context = null
  }
}
