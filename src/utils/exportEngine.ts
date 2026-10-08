import * as Mp4Muxer from 'mp4-muxer';
import { MultiClipRenderOptions, drawCoverImage, drawCanvasSubtitles, drawCanvasCustomText, drawCanvasSticker } from './videoRecorder';

export async function renderMp4Video(options: MultiClipRenderOptions): Promise<Blob> {
  const {
    mediaClips, audioElement, scenes, totalDuration, aspectRatio,
    subtitleConfig, textOverlays, stickers, filterSettings,
    backgroundText, resolution = '720p', onProgress
  } = options;

  const is1080 = resolution === '1080p';
  let width = is1080 ? 1920 : 1280;
  let height = is1080 ? 1080 : 720;

  if (aspectRatio === '9:16') {
    width = is1080 ? 1080 : 720;
    height = is1080 ? 1920 : 1280;
  } else if (aspectRatio === '1:1') {
    width = is1080 ? 1080 : 720;
    height = is1080 ? 1080 : 720;
  } else if (aspectRatio === '4:5') {
    width = is1080 ? 1080 : 720;
    height = is1080 ? 1350 : 900;
  }

  // Ensure width and height are even numbers for H.264
  width = Math.floor(width / 2) * 2;
  height = Math.floor(height / 2) * 2;

  const fps = 60;
  const totalFrames = Math.ceil(totalDuration * fps);

  // Preload Media
  const loadedMedia = await Promise.all(
    mediaClips.map(async (clip) => {
      if (clip.type === 'image') {
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.src = clip.url;
        await new Promise((res) => { img.onload = res; img.onerror = res; });
        return { clip, element: img, isVideo: false };
      } else {
        const vid = document.createElement('video');
        vid.crossOrigin = 'anonymous';
        vid.src = clip.url;
        vid.muted = true;
        vid.playsInline = true;
        await new Promise((res) => { vid.onloadeddata = res; vid.onerror = res; });
        return { clip, element: vid, isVideo: true };
      }
    })
  );

  // Process Audio Track if available
  let audioBuffer: AudioBuffer | null = null;
  if (audioElement && audioElement.src) {
    try {
      const response = await fetch(audioElement.src);
      const arrayBuffer = await response.arrayBuffer();
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass({ sampleRate: 44100 });
      audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    } catch (e) {
      console.warn('Could not decode audio for WebCodecs export:', e);
    }
  }

  const hasAudio = audioBuffer !== null && typeof (window as any).AudioEncoder !== 'undefined';

  // Muxer config
  const muxer = new Mp4Muxer.Muxer({
    target: new Mp4Muxer.ArrayBufferTarget(),
    video: {
      codec: 'avc',
      width,
      height,
    },
    audio: hasAudio ? {
      codec: 'aac',
      numberOfChannels: 2,
      sampleRate: 44100,
    } : undefined,
    fastStart: 'in-memory',
  });

  // Video Encoder setup
  const VideoEncoderClass = (window as any).VideoEncoder || (globalThis as any).VideoEncoder;
  if (!VideoEncoderClass) {
    throw new Error('WebCodecs VideoEncoder is not supported in this browser environment.');
  }

  const videoEncoder = new VideoEncoderClass({
    output: (chunk: any, meta: any) => muxer.addVideoChunk(chunk, meta),
    error: (e: any) => console.error('VideoEncoder error:', e),
  });

  videoEncoder.configure({
    codec: 'avc1.42E01F', // Baseline profile
    width,
    height,
    bitrate: is1080 ? 8_000_000 : 4_000_000,
    framerate: fps,
  });

  // Prepare Canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
  if (!ctx) throw new Error('Failed to get 2D context');

  // Encode Audio if available
  if (hasAudio && audioBuffer) {
    const AudioEncoderClass = (window as any).AudioEncoder || (globalThis as any).AudioEncoder;
    const AudioDataClass = (window as any).AudioData || (globalThis as any).AudioData;

    if (AudioEncoderClass && AudioDataClass) {
      const audioEncoder = new AudioEncoderClass({
        output: (chunk: any, meta: any) => muxer.addAudioChunk(chunk, meta),
        error: (e: any) => console.error('AudioEncoder error:', e),
      });

      audioEncoder.configure({
        codec: 'mp4a.40.2', // AAC LC
        numberOfChannels: 2,
        sampleRate: 44100,
        bitrate: 128_000,
      });

      const numberOfChannels = Math.min(2, audioBuffer.numberOfChannels);
      const length = Math.floor(totalDuration * 44100);
      const pcmData = new Float32Array(length * numberOfChannels);

      for (let channel = 0; channel < numberOfChannels; channel++) {
        const channelData = audioBuffer.getChannelData(channel);
        for (let i = 0; i < length; i++) {
          pcmData[i * numberOfChannels + channel] = channelData[i] || 0;
        }
      }

      const audioData = new AudioDataClass({
        format: 'f32-planar',
        sampleRate: 44100,
        numberOfFrames: length,
        numberOfChannels: numberOfChannels,
        timestamp: 0,
        data: pcmData,
      });

      audioEncoder.encode(audioData);
      audioData.close();
      await audioEncoder.flush();
    }
  }

  const VideoFrameClass = (window as any).VideoFrame || (globalThis as any).VideoFrame;

  // Frame-by-Frame Video Generation Loop
  for (let frame = 0; frame < totalFrames; frame++) {
    const elapsed = frame / fps;
    const timestampUs = Math.round(elapsed * 1_000_000);

    onProgress(Math.round((frame / totalFrames) * 100));

    // Backpressure control: hold if queue is full
    while (videoEncoder.encodeQueueSize > 5) {
      await new Promise((res) => setTimeout(res, 10));
    }

    let acc = 0;
    let activeLoaded = loadedMedia[0];
    let clipLocalElapsed = 0;
    for (const item of loadedMedia) {
      if (elapsed >= acc && elapsed < acc + item.clip.duration) {
        activeLoaded = item;
        clipLocalElapsed = elapsed - acc;
        break;
      }
      acc += item.clip.duration;
    }

    ctx.save();
    ctx.filter = `brightness(${filterSettings.brightness}) contrast(${filterSettings.contrast}) saturate(${filterSettings.saturation})`;

    if (activeLoaded && activeLoaded.element) {
      const el = activeLoaded.element;
      const fitMode = activeLoaded.clip.fitMode || 'contain';
      const clipScale = activeLoaded.clip.scale || 1.0;

      if (activeLoaded.isVideo) {
        const vid = el as HTMLVideoElement;
        const targetVidTime = (activeLoaded.clip.trimStart || 0) + (clipLocalElapsed % activeLoaded.clip.duration);
        
        // Seek video deterministically
        if (Math.abs(vid.currentTime - targetVidTime) > 0.05) {
          vid.currentTime = targetVidTime;
          await new Promise((res) => {
            const onSeek = () => {
              vid.removeEventListener('seeked', onSeek);
              res(null);
            };
            vid.addEventListener('seeked', onSeek, { once: true });
            setTimeout(res, 30); // fallback timeout
          });
        }
        drawCoverImage(ctx, vid, width, height, clipScale, fitMode);
      } else {
        const img = el as HTMLImageElement;
        const zoomScale = activeLoaded.clip.kenBurns
          ? clipScale * (1.0 + (clipLocalElapsed / activeLoaded.clip.duration) * 0.1)
          : clipScale;
        drawCoverImage(ctx, img, width, height, zoomScale, fitMode);
      }
    } else {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);
    }
    ctx.restore();

    // Vignette
    const vignette = ctx.createLinearGradient(0, 0, 0, height);
    vignette.addColorStop(0, 'rgba(0,0,0,0.25)');
    vignette.addColorStop(0.5, 'rgba(0,0,0,0.05)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);

    // Transitions
    if (activeLoaded && activeLoaded.clip) {
      const tDur = activeLoaded.clip.transitionDuration || 0.5;
      const timeLeft = activeLoaded.clip.duration - clipLocalElapsed;
      if (timeLeft <= tDur && activeLoaded.clip.transition && activeLoaded.clip.transition !== 'none') {
        const intensity = Math.sin(Math.max(0, Math.min(1, (tDur - timeLeft) / tDur)) * Math.PI);
        ctx.save();
        if (activeLoaded.clip.transition === 'flash-white') {
          ctx.fillStyle = `rgba(255, 255, 255, ${intensity * 0.95})`;
          ctx.fillRect(0, 0, width, height);
        } else if (activeLoaded.clip.transition === 'flash-black' || activeLoaded.clip.transition === 'fade') {
          ctx.fillStyle = `rgba(0, 0, 0, ${intensity * (activeLoaded.clip.transition === 'fade' ? 0.75 : 0.95)})`;
          ctx.fillRect(0, 0, width, height);
        }
        ctx.restore();
      }
    }

    // Background Text
    if (backgroundText && backgroundText.enabled && backgroundText.text) {
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `900 ${height * 0.1}px "Inter", sans-serif`;
      ctx.fillStyle = `rgba(255, 255, 255, ${backgroundText.opacity})`;
      ctx.fillText(backgroundText.text.toUpperCase(), width / 2, (backgroundText.y / 100) * height);
      ctx.restore();
    }

    // Active Subtitles (Karaoke)
    if (subtitleConfig.enabled) {
      const currentScene = scenes.find((s) => elapsed >= s.startSeconds && elapsed < s.endSeconds);
      if (currentScene) drawCanvasSubtitles(ctx, currentScene, elapsed, width, height, subtitleConfig);
    }

    // Overlays
    textOverlays.forEach((t) => {
      if (elapsed >= t.startTime && elapsed <= t.endTime) drawCanvasCustomText(ctx, t, width, height);
    });
    stickers.forEach((stk) => {
      if (elapsed >= stk.startTime && elapsed <= stk.endTime) drawCanvasSticker(ctx, stk, width, height);
    });

    // Create VideoFrame from Canvas
    const frameData = new VideoFrameClass(canvas, {
      timestamp: timestampUs,
      duration: Math.round(1_000_000 / fps),
    });

    videoEncoder.encode(frameData, { keyFrame: frame % (fps * 2) === 0 });
    frameData.close();
  }

  await videoEncoder.flush();
  muxer.finalize();

  const { buffer } = muxer.target;
  onProgress(100);

  return new Blob([buffer], { type: 'video/mp4' });
}
