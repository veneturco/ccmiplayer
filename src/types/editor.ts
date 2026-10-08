/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Timecode = string; // Format: "HH:MM:SS:FF" or "MM:SS:FF"
export type FrameNumber = number;

export type TrackType = 'video' | 'audio' | 'overlay' | 'caption';

export interface Keyframe {
  id: string;
  frame: FrameNumber;
  value: number;
  easing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
}

export interface TransformProperties {
  positionX: number; // in pixels
  positionY: number; // in pixels
  scale: number;     // 100 = 100%
  uniformScale: boolean;
  rotation: number;  // degrees
  opacity: number;   // 0.0 to 1.0
  blendMode: 'normal' | 'screen' | 'multiply' | 'overlay' | 'luminosity';
  keyframes?: {
    positionX?: Keyframe[];
    positionY?: Keyframe[];
    scale?: Keyframe[];
    rotation?: Keyframe[];
    opacity?: Keyframe[];
  };
}

export interface AudioDSPProperties {
  volume: number; // in dB (-60 to +12)
  pan: number;    // -100 (L) to +100 (R)
  spectralDenoiseDb: number; // e.g. -18.5
  deEsserNotchKhz: number;   // e.g. 6.2
  compressorThresholdDb: number;
  compressorRatio: number;
  eqBands: {
    freq: number;
    gain: number;
    q: number;
  }[];
}

export interface Clip {
  id: string;
  assetId: string;
  trackId: string;
  name: string;
  type: 'video' | 'audio' | 'image' | 'text';
  startFrame: FrameNumber;
  durationFrames: FrameNumber;
  inPointFrame: FrameNumber;
  outPointFrame: FrameNumber;
  waveformUrl?: string;
  thumbnailUrls?: string[];
  transform: TransformProperties;
  audio?: AudioDSPProperties;
}

export interface Track {
  id: string;
  index: number;
  label: string;
  type: TrackType;
  locked: boolean;
  muted: boolean;
  solo?: boolean;
  visible: boolean;
  heightPx: number;
  clips: Clip[];
}

export interface TimelineState {
  playheadFrame: FrameNumber;
  fps: 24 | 25 | 30 | 50 | 60;
  totalDurationFrames: FrameNumber;
  zoomLevel: number; // pixels per frame
  isSnapping: boolean;
  isRippleActive: boolean;
  selectedClipIds: string[];
  inPoint?: FrameNumber;
  outPoint?: FrameNumber;
}

export interface ProjectSession {
  id: string;
  name: string;
  saveStatus: 'saved' | 'saving' | 'offline';
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:5';
  resolution: {
    width: number;
    height: number;
    label: '720p' | '1080p' | '4K DCI' | '8K RAW';
  };
  audioPeakL: number; // in dB
  audioPeakR: number; // in dB
}
