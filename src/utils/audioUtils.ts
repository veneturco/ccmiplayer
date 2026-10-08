/**
 * Audio helpers for CCMI Voiceover Studio
 */

// 1. Singleton Global para Web Audio API (Evita crash por límite de contextos)
let sharedCtx: AudioContext | null = null;
export function getAudioContext(): AudioContext {
  if (!sharedCtx) {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    sharedCtx = new AudioCtx();
  }
  if (sharedCtx.state === 'suspended') sharedCtx.resume();
  return sharedCtx;
}

// 2. Funciones Base64 robustas
export function base64ToBlob(base64: string, mimeType = 'audio/wav'): Blob {
  const raw = atob(base64);
  const u8 = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    u8[i] = raw.charCodeAt(i);
  }
  // Slice previene inclusión de memoria residual
  const arrayBuffer = u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength);
  return new Blob([arrayBuffer], { type: mimeType });
}

export function base64ToAudioUrl(base64: string, mimeType = 'audio/wav'): string {
  const blob = base64ToBlob(base64, mimeType);
  return URL.createObjectURL(blob);
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // remove data:audio/*;base64, prefix
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export async function fileToAudioInfo(file: File): Promise<{ url: string; duration: number; base64: string }> {
  const base64 = await fileToBase64(file);
  const url = URL.createObjectURL(file);
  const duration = await getAudioDuration(url);
  return { url, duration, base64 };
}

export async function getAudioDuration(base64OrBlobUrl: string): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.src = base64OrBlobUrl.startsWith('blob:') || base64OrBlobUrl.startsWith('http')
      ? base64OrBlobUrl
      : `data:audio/wav;base64,${base64OrBlobUrl}`;
    audio.addEventListener('loadedmetadata', () => {
      resolve(audio.duration || 0);
    });
    audio.addEventListener('error', () => {
      resolve(0);
    });
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

export function generateSrt(scenes: { startSeconds: number; endSeconds: number; text: string }[]): string {
  return scenes
    .map((scene, index) => {
      const formatTime = (secs: number) => {
        const h = Math.floor(secs / 3600).toString().padStart(2, '0');
        const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
        const s = Math.floor(secs % 60).toString().padStart(2, '0');
        const ms = Math.floor((secs % 1) * 1000).toString().padStart(3, '0');
        return `${h}:${m}:${s},${ms}`;
      };

      return `${index + 1}\n${formatTime(scene.startSeconds)} --> ${formatTime(scene.endSeconds)}\n${scene.text}\n`;
    })
    .join('\n');
}

export function generateVtt(scenes: { startSeconds: number; endSeconds: number; text: string }[]): string {
  const header = 'WEBVTT - CCMI Guión de Voz en Off\n\n';
  const body = scenes
    .map((scene, index) => {
      const formatTime = (secs: number) => {
        const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
        const s = Math.floor(secs % 60).toString().padStart(2, '0');
        const ms = Math.floor((secs % 1) * 1000).toString().padStart(3, '0');
        return `${m}:${s}.${ms}`;
      };

      return `${index + 1}\n${formatTime(scene.startSeconds)} --> ${formatTime(scene.endSeconds)}\n${scene.text}\n`;
    })
    .join('\n');
  return header + body;
}

/**
 * Procedural ambient hospital chord soundtrack generator using Web Audio API.
 * Creates an elegant, warm, reassuring medical piano/ambient pad bed with gentle harmonics.
 */
class AmbientMusicGenerator {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private masterGain: GainNode | null = null;
  private intervalId: any = null;

  start(volume = 0.15) {
    if (this.isPlaying) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.isPlaying = true;
      this.playHarmonicChord();
      this.intervalId = setInterval(() => {
        if (this.isPlaying) this.playHarmonicChord();
      }, 4500);
    } catch (e) {
      console.warn('Ambient music failed to init:', e);
    }
  }

  setVolume(vol: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.1);
    }
  }

  setDucking(isDucking: boolean, normalVol = 0.15) {
    if (this.masterGain && this.ctx) {
      const target = isDucking ? normalVol * 0.25 : normalVol;
      this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.3);
    }
  }

  private playHarmonicChord() {
    if (!this.ctx || !this.masterGain || this.ctx.state === 'closed') return;
    // Calming medical chords: F major 9, C major 7, A minor 7, G sus
    const chords = [
      [174.61, 261.63, 329.63, 392.0], // F3, C4, E4, G4
      [130.81, 196.0, 246.94, 329.63], // C3, G3, B3, E4
      [220.0, 261.63, 329.63, 440.0],  // A3, C4, E4, A4
      [196.0, 293.66, 392.0, 493.88],  // G3, D4, G4, B4
    ];
    const chord = chords[Math.floor(Math.random() * chords.length)];

    chord.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const filter = this.ctx!.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(650 + idx * 100, this.ctx!.currentTime);

      osc.type = idx === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime);

      const now = this.ctx!.currentTime;
      const duration = 4.8;
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.06 / (idx + 1), now + 1.2);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(now);
      osc.stop(now + duration + 0.1);
    });
  }

  stop() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.ctx && this.ctx.state !== 'closed') {
      try {
        this.ctx.close();
      } catch (e) {
        // ignore
      }
      this.ctx = null;
    }
  }
}

export const ambientMusic = new AmbientMusicGenerator();

/**
 * Detect silence/pause boundaries in an audio buffer or blob
 */
export async function detectAudioPauses(
  audioBlobOrUrl: Blob | string,
  minSilenceDuration = 0.2,
  thresholdDb = -32
): Promise<number[]> {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    let arrayBuffer: ArrayBuffer;
    if (typeof audioBlobOrUrl === 'string') {
      const resp = await fetch(audioBlobOrUrl);
      arrayBuffer = await resp.arrayBuffer();
    } else {
      arrayBuffer = await audioBlobOrUrl.arrayBuffer();
    }
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    const channelData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    const threshold = Math.pow(10, thresholdDb / 20); // linear amplitude
    const windowSize = Math.floor(sampleRate * 0.05); // 50ms window
    const minSilenceSamples = Math.floor(sampleRate * minSilenceDuration);

    const pauses: number[] = [];
    let inSilence = false;
    let silenceStartSample = 0;

    for (let i = 0; i < channelData.length; i += windowSize) {
      let sum = 0;
      const end = Math.min(i + windowSize, channelData.length);
      for (let j = i; j < end; j++) {
        sum += channelData[j] * channelData[j];
      }
      const rms = Math.sqrt(sum / (end - i));

      if (rms < threshold) {
        if (!inSilence) {
          inSilence = true;
          silenceStartSample = i;
        }
      } else {
        if (inSilence) {
          inSilence = false;
          const silenceDurationSamples = i - silenceStartSample;
          if (silenceDurationSamples >= minSilenceSamples) {
            const pauseTime = +((silenceStartSample + silenceDurationSamples / 2) / sampleRate).toFixed(1);
            if (pauseTime > 0.5) {
              pauses.push(pauseTime);
            }
          }
        }
      }
    }

    if (inSilence && channelData.length - silenceStartSample >= minSilenceSamples) {
      const pauseTime = +((silenceStartSample + (channelData.length - silenceStartSample) / 2) / sampleRate).toFixed(1);
      if (pauseTime > 0.5) {
        pauses.push(pauseTime);
      }
    }

    audioCtx.close().catch(() => {});
    return pauses;
  } catch (err) {
    console.warn('Audio pause detection fallback to scene timestamps:', err);
    return [];
  }
}

export interface AutoSyncResult {
  updatedClips: any[];
  newTotalDuration: number;
  pauseTimestamps: number[];
  syncedCount: number;
}

/**
 * Automatically calculates and synchronizes clip in/out boundaries and durations
 * to match detected speech pauses in the voiceover track.
 */
export function autoSyncClipsToVoicePauses(
  mediaClips: any[],
  scenes: { startSeconds: number; endSeconds: number; text: string }[],
  detectedPauses: number[] = [],
  totalAudioDuration?: number
): AutoSyncResult {
  if (!mediaClips || mediaClips.length === 0) {
    return { updatedClips: [], newTotalDuration: 0, pauseTimestamps: [], syncedCount: 0 };
  }

  // 1. Gather all candidate pause timestamps
  let cutPoints: number[] = [];

  if (detectedPauses && detectedPauses.length >= 2) {
    cutPoints = [...detectedPauses];
  } else {
    // Scene speech boundaries
    cutPoints = scenes.map((s) => +(s.endSeconds).toFixed(1));
  }

  // Target total duration
  const lastSceneEnd = scenes.length > 0 ? scenes[scenes.length - 1].endSeconds : 18;
  const targetTotalDuration = totalAudioDuration && totalAudioDuration > 0
    ? +totalAudioDuration.toFixed(1)
    : lastSceneEnd;

  // Add final boundary
  cutPoints.push(targetTotalDuration);

  // Clean, sort, and deduplicate points (keep points separated by at least 0.8s)
  cutPoints = Array.from(new Set(cutPoints.map((p) => +p.toFixed(1)))).sort((a, b) => a - b);
  cutPoints = cutPoints.filter((p, idx) => idx === 0 || p > cutPoints[idx - 1] + 0.6);

  if (cutPoints.length === 0 || Math.abs(cutPoints[cutPoints.length - 1] - targetTotalDuration) > 0.4) {
    cutPoints.push(targetTotalDuration);
  } else {
    cutPoints[cutPoints.length - 1] = targetTotalDuration;
  }

  const numClips = mediaClips.length;
  let updatedClips: any[] = [];

  if (numClips === 1) {
    const orig = mediaClips[0];
    const newDur = targetTotalDuration;
    const inPoint = orig.trimStart || 0;
    updatedClips = [{
      ...orig,
      duration: newDur,
      trimStart: inPoint,
      trimEnd: +(inPoint + newDur).toFixed(1),
    }];
  } else if (numClips === cutPoints.length) {
    let prevPoint = 0;
    updatedClips = mediaClips.map((clip, idx) => {
      const currentPoint = cutPoints[idx];
      const segmentDuration = Math.max(0.5, +(currentPoint - prevPoint).toFixed(1));
      const inPoint = clip.trimStart || 0;
      prevPoint = currentPoint;
      return {
        ...clip,
        duration: segmentDuration,
        trimStart: inPoint,
        trimEnd: +(inPoint + segmentDuration).toFixed(1),
      };
    });
  } else {
    // Distribute cuts among pause points as evenly as possible
    const selectedCuts: number[] = [];
    const idealStep = targetTotalDuration / numClips;

    let searchStartIdx = 0;
    for (let c = 1; c < numClips; c++) {
      const idealTime = c * idealStep;
      let bestPoint = -1;
      let minDiff = Infinity;
      let bestIdx = -1;

      for (let i = searchStartIdx; i < cutPoints.length - 1; i++) {
        const pt = cutPoints[i];
        const lastSelected = selectedCuts[selectedCuts.length - 1] || 0;
        if (pt > lastSelected + 0.8) {
          const diff = Math.abs(pt - idealTime);
          if (diff < minDiff) {
            minDiff = diff;
            bestPoint = pt;
            bestIdx = i;
          }
        }
      }

      if (bestPoint !== -1) {
        selectedCuts.push(bestPoint);
        searchStartIdx = bestIdx + 1;
      } else {
        const lastSelected = selectedCuts[selectedCuts.length - 1] || 0;
        selectedCuts.push(Math.max(lastSelected + 1, +idealTime.toFixed(1)));
      }
    }
    selectedCuts.push(targetTotalDuration);

    let prevPoint = 0;
    updatedClips = mediaClips.map((clip, idx) => {
      const currentPoint = selectedCuts[idx];
      const segmentDuration = Math.max(0.5, +(currentPoint - prevPoint).toFixed(1));
      const inPoint = clip.trimStart || 0;
      prevPoint = currentPoint;
      return {
        ...clip,
        duration: segmentDuration,
        trimStart: inPoint,
        trimEnd: +(inPoint + segmentDuration).toFixed(1),
      };
    });
  }

  return {
    updatedClips,
    newTotalDuration: targetTotalDuration,
    pauseTimestamps: cutPoints,
    syncedCount: updatedClips.length,
  };
}

/**
 * Encodes an AudioBuffer into standard 16-bit PCM WAV Blob
 */
export function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const out = new DataView(new ArrayBuffer(length));
  const channels: Float32Array[] = [];
  const sampleRate = buffer.sampleRate;
  let offset = 0;
  let pos = 0;

  function setUint16(data: number) {
    out.setUint16(pos, data, true);
    pos += 2;
  }
  function setUint32(data: number) {
    out.setUint32(pos, data, true);
    pos += 4;
  }

  // write WAVE header
  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8); // file length - 8
  setUint32(0x45564157); // "WAVE"

  setUint32(0x20746d66); // "fmt " chunk
  setUint32(16); // length = 16
  setUint16(1); // PCM (uncompressed)
  setUint16(numOfChan);
  setUint32(sampleRate);
  setUint32(sampleRate * 2 * numOfChan); // avg. bytes/sec
  setUint16(numOfChan * 2); // block-align
  setUint16(16); // 16-bit precision

  setUint32(0x61746164); // "data" - chunk
  setUint32(length - pos - 4); // chunk length

  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (offset < buffer.length) {
    for (let i = 0; i < numOfChan; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      out.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([out.buffer], { type: 'audio/wav' });
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(blob);
  });
}

// 3. Motor DSP Refactorizado
export async function cleanAndEqualizeVocalAudio(
  audioBlobOrUrlOrBase64: Blob | string,
  config: any = {}
): Promise<{ cleanedBlob: Blob; cleanedBase64: string; cleanedUrl: string; duration: number }> {
  const ctx = getAudioContext();
  let arrayBuffer: ArrayBuffer;

  if (typeof audioBlobOrUrlOrBase64 === 'string') {
    if (audioBlobOrUrlOrBase64.startsWith('blob:') || audioBlobOrUrlOrBase64.startsWith('http')) {
      const resp = await fetch(audioBlobOrUrlOrBase64);
      arrayBuffer = await resp.arrayBuffer();
    } else {
      const cleanB64 = audioBlobOrUrlOrBase64.includes(',')
        ? audioBlobOrUrlOrBase64.split(',')[1]
        : audioBlobOrUrlOrBase64;
      arrayBuffer = await base64ToBlob(cleanB64, 'audio/wav').arrayBuffer();
    }
  } else {
    arrayBuffer = await (audioBlobOrUrlOrBase64 as Blob).arrayBuffer();
  }

  const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

  // Forzar procesamiento en Estéreo mínimo para evitar errores con MediaRecorder
  const offlineCtx = new (window.OfflineAudioContext || (window as any).webkitOfflineAudioContext)(
    Math.max(2, audioBuffer.numberOfChannels),
    audioBuffer.length,
    audioBuffer.sampleRate
  );

  const source = offlineCtx.createBufferSource();
  source.buffer = audioBuffer;

  const nrAmount = config.noiseReductionAmount ?? 0.65;
  const deEsserEnabled = config.deEsser ?? true;
  const normalizeEnabled = config.normalize ?? true;

  // Filtros Básicos
  const hpFilter = offlineCtx.createBiquadFilter();
  hpFilter.type = 'highpass';
  hpFilter.frequency.value = 80 + nrAmount * 35;

  // De-Esser Real (Atenúa sibilancias agresivas a 6.5kHz)
  const deEsserFilter = offlineCtx.createBiquadFilter();
  deEsserFilter.type = 'peaking';
  deEsserFilter.frequency.value = 6500;
  deEsserFilter.Q.value = 3.0; // Campana estrecha
  deEsserFilter.gain.value = deEsserEnabled ? -4.5 : 0;

  const compressor = offlineCtx.createDynamicsCompressor();
  compressor.threshold.value = -18 - nrAmount * 4;
  compressor.ratio.value = 3.2;

  // Conexión en Cadena
  source.connect(hpFilter);
  hpFilter.connect(deEsserFilter);
  deEsserFilter.connect(compressor);
  compressor.connect(offlineCtx.destination);

  source.start(0);
  const rendered = await offlineCtx.startRendering();

  // Peak Normalization a -1 dBFS
  if (normalizeEnabled) {
    let peak = 0;
    for (let c = 0; c < rendered.numberOfChannels; c++) {
      const channel = rendered.getChannelData(c);
      for (let i = 0; i < channel.length; i++) {
        const abs = Math.abs(channel[i]);
        if (abs > peak) peak = abs;
      }
    }
    const targetPeak = Math.pow(10, -1 / 20); // -1 dB lineal
    if (peak > 0) {
      const gain = targetPeak / peak;
      for (let c = 0; c < rendered.numberOfChannels; c++) {
        const channel = rendered.getChannelData(c);
        for (let i = 0; i < channel.length; i++) {
          channel[i] *= gain;
        }
      }
    }
  }

  // Envolvente RMS real para Noise Gate (Evita cortes abruptos destructivos)
  if (nrAmount > 0.4) {
    const gateThreshold = 0.005 * nrAmount;
    const attack = 0.02;
    const release = 0.08;
    let envelope = 0;

    for (let c = 0; c < rendered.numberOfChannels; c++) {
      const data = rendered.getChannelData(c);
      for (let i = 0; i < data.length; i++) {
        const target = Math.abs(data[i]) < gateThreshold ? 0.1 : 1.0;
        envelope += (target - envelope) * (target > envelope ? attack : release);
        data[i] *= envelope;
      }
    }
  }

  const cleanedBlob = audioBufferToWav(rendered);
  const cleanedBase64 = await blobToBase64(cleanedBlob);

  return {
    cleanedBlob,
    cleanedBase64,
    cleanedUrl: URL.createObjectURL(cleanedBlob),
    duration: rendered.duration,
  };
}

