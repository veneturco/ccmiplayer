/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Timecode = string; // Format: "HH:MM:SS:FF" or "MM:SS:FF"
export type FrameNumber = number;

export function framesToTimecode(frames: number, fps: number = 60): Timecode {
  const totalSeconds = Math.floor(frames / fps);
  const ff = String(Math.floor(frames % fps)).padStart(2, '0');
  const ss = String(totalSeconds % 60).padStart(2, '0');
  const mm = String(Math.floor(totalSeconds / 60) % 60).padStart(2, '0');
  const hh = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');

  return `${hh}:${mm}:${ss}:${ff}`;
}

export function timecodeToFrames(timecode: Timecode, fps: number = 60): number {
  const parts = timecode.split(':').map(Number);
  if (parts.length === 4) {
    const [hh, mm, ss, ff] = parts;
    return hh * 3600 * fps + mm * 60 * fps + ss * fps + ff;
  }
  const [mm, ss, ff] = parts;
  return mm * 60 * fps + ss * fps + ff;
}

export function frameToPixelOffset(frame: number, zoomLevel: number): number {
  return frame * zoomLevel;
}

export function pixelOffsetToFrame(pixels: number, zoomLevel: number): number {
  return Math.max(0, Math.round(pixels / zoomLevel));
}
