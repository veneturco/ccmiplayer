/**
 * High-performance browser video rendering engine
 * Combines Multi-Clip Sequence + Audio + Active Subtitles (Karaoke) + Overlays
 */
import { MediaClip, SubtitleConfig, TextOverlay, StickerOverlay, VideoFilterSettings, AspectRatio, ScriptScene, BackgroundTextConfig, RenderResolution } from '../types';

export interface MultiClipRenderOptions {
  mediaClips: MediaClip[];
  audioElement: HTMLAudioElement | null;
  scenes: ScriptScene[];
  totalDuration: number;
  aspectRatio: AspectRatio;
  subtitleConfig: SubtitleConfig;
  textOverlays: TextOverlay[];
  stickers: StickerOverlay[];
  filterSettings: VideoFilterSettings;
  backgroundText?: BackgroundTextConfig;
  resolution?: RenderResolution;
  onProgress: (pct: number) => void;
}

export async function renderMultiClipVideo(options: MultiClipRenderOptions): Promise<Blob> {
  const {
    mediaClips, audioElement, scenes, totalDuration, aspectRatio,
    subtitleConfig, textOverlays, stickers, filterSettings,
    backgroundText, resolution = '720p', onProgress,
  } = options;

  return new Promise(async (resolve, reject) => {
    try {
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

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
      if (!ctx) throw new Error('Canvas 2D context creation failed');

      const loadedMedia = await Promise.all(
        mediaClips.map(async (clip) => {
          if (clip.type === 'image') {
            const img = new window.Image();
            img.crossOrigin = 'anonymous';
            img.src = clip.url;
            await new Promise(res => { img.onload = res; img.onerror = res; });
            return { clip, element: img, isVideo: false };
          } else {
            const vid = document.createElement('video');
            vid.crossOrigin = 'anonymous';
            vid.src = clip.url;
            vid.muted = true;
            vid.playsInline = true;
            await new Promise(res => { vid.onloadeddata = res; vid.onerror = res; });
            return { clip, element: vid, isVideo: true };
          }
        })
      );

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const actx = new AudioCtx();
      const dest = actx.createMediaStreamDestination();

      if (audioElement && audioElement.src) {
        try {
          const source = actx.createMediaElementSource(audioElement);
          source.connect(dest);
          source.connect(actx.destination);
        } catch (e) {
          console.warn('Audio node connection notice:', e);
        }
      }

      const canvasStream = canvas.captureStream(is1080 ? 60 : 30);
      const combinedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...dest.stream.getAudioTracks(),
      ]);

      // Maximizando el Bitrate para 1080p
      let mimeType = 'video/webm;codecs=vp09.00.10.08,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm;codecs=vp8,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm';

      const recorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: is1080 ? 8000000 : 4000000 // 8 Mbps para 1080p
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = () => { resolve(new Blob(chunks, { type: mimeType || 'video/webm' })); };

      if (audioElement) {
        audioElement.currentTime = 0;
        await audioElement.play().catch(() => {});
      }

      recorder.start(100);
      const startTime = performance.now();

      const drawLoop = () => {
        // Anclaje determinista: El tiempo lo dicta el audio si existe, si no, el reloj de performance
        const elapsed = audioElement && !audioElement.paused 
            ? audioElement.currentTime 
            : (performance.now() - startTime) / 1000;
            
        const progress = Math.min(1, elapsed / totalDuration);
        onProgress(Math.round(progress * 100));

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
            if (Math.abs(vid.currentTime - targetVidTime) > 0.3) vid.currentTime = targetVidTime;
            if (vid.paused && elapsed < totalDuration) vid.play().catch(() => {});
            drawCoverImage(ctx, vid, width, height, clipScale, fitMode);
          } else {
            const img = el as HTMLImageElement;
            const zoomScale = activeLoaded.clip.kenBurns ? clipScale * (1.0 + (clipLocalElapsed / activeLoaded.clip.duration) * 0.1) : clipScale;
            drawCoverImage(ctx, img, width, height, zoomScale, fitMode);
          }
        } else {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, 0, width, height);
        }
        ctx.restore();

        const vignette = ctx.createLinearGradient(0, 0, 0, height);
        vignette.addColorStop(0, 'rgba(0,0,0,0.25)');
        vignette.addColorStop(0.5, 'rgba(0,0,0,0.05)');
        vignette.addColorStop(1, 'rgba(0,0,0,0.6)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, width, height);

        // Transiciones
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

        if (backgroundText && backgroundText.enabled && backgroundText.text) {
          ctx.save();
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = `900 ${height * 0.1}px "Inter", sans-serif`;
          ctx.fillStyle = `rgba(255, 255, 255, ${backgroundText.opacity})`;
          ctx.fillText(backgroundText.text.toUpperCase(), width / 2, (backgroundText.y / 100) * height);
          ctx.restore();
        }

        // Subtítulos Activos (Karaoke)
        if (subtitleConfig.enabled) {
          const currentScene = scenes.find((s) => elapsed >= s.startSeconds && elapsed < s.endSeconds);
          if (currentScene) drawCanvasSubtitles(ctx, currentScene, elapsed, width, height, subtitleConfig);
        }

        textOverlays.forEach((t) => { if (elapsed >= t.startTime && elapsed <= t.endTime) drawCanvasCustomText(ctx, t, width, height); });
        stickers.forEach((stk) => { if (elapsed >= stk.startTime && elapsed <= stk.endTime) drawCanvasSticker(ctx, stk, width, height); });

        if (elapsed < totalDuration) {
          requestAnimationFrame(drawLoop);
        } else {
          recorder.stop();
          if (audioElement) audioElement.pause();
        }
      };

      requestAnimationFrame(drawLoop);
    } catch (err) {
      reject(err);
    }
  });
}

export function drawCoverImage(ctx: CanvasRenderingContext2D, img: any, w: number, h: number, scale = 1.0, fitMode: 'cover' | 'contain' = 'contain') {
  const naturalW = img.videoWidth || img.naturalWidth || w;
  const naturalH = img.videoHeight || img.naturalHeight || h;
  
  ctx.save();
  if (fitMode === 'contain') {
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, w, h);
  }
  
  const baseScale = fitMode === 'contain' ? Math.min(w / naturalW, h / naturalH) : Math.max(w / naturalW, h / naturalH);
  const finalScale = baseScale * scale;
  const dw = naturalW * finalScale;
  const dh = naturalH * finalScale;
  const dx = (w - dw) / 2;
  const dy = (h - dh) / 2;
  
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();
}

// MOTOR KARAOKE EN CANVAS
export function drawCanvasSubtitles(
  ctx: CanvasRenderingContext2D, scene: ScriptScene, elapsed: number,
  width: number, height: number, cfg: SubtitleConfig
) {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const x = (cfg.x / 100) * width;
  const y = (cfg.y / 100) * height;
  const fontSize = Math.round((cfg.fontSize / 1000) * width * 1.3);
  ctx.font = `900 ${fontSize}px ${cfg.fontFamily}`;

  const text = cfg.uppercase ? scene.text.toUpperCase() : scene.text;
  const words = text.split(/\s+/);
  const sceneDur = scene.endSeconds - scene.startSeconds;
  const elapsedInScene = elapsed - scene.startSeconds;
  
  // Cálculo de índice de palabra activa
  const activeIdx = Math.max(0, Math.min(words.length - 1, Math.floor((elapsedInScene / sceneDur) * words.length)));

  const maxWidth = width * 0.85;
  const spaceWidth = ctx.measureText(' ').width;
  const lines: { words: { word: string; active: boolean }[] }[] = [];
  let currentLineWords: { word: string; active: boolean }[] = [];
  let currentLineWidth = 0;

  // Envoltorio de líneas dinámico
  words.forEach((word, i) => {
    const isActive = cfg.wordHighlight && i === activeIdx;
    const wordWidth = ctx.measureText(word).width;
    const testWidth = currentLineWidth + wordWidth + (currentLineWords.length > 0 ? spaceWidth : 0);

    if (testWidth > maxWidth && currentLineWords.length > 0) {
      lines.push({ words: currentLineWords });
      currentLineWords = [{ word, active: isActive }];
      currentLineWidth = wordWidth;
    } else {
      currentLineWords.push({ word, active: isActive });
      currentLineWidth = testWidth;
    }
  });
  if (currentLineWords.length > 0) lines.push({ words: currentLineWords });

  const lineHeight = fontSize * 1.35;
  const totalH = lines.length * lineHeight;
  const startY = y - totalH / 2 + lineHeight / 2;

  // Renderizado de fondo si aplica
  if (cfg.bgColor && cfg.bgColor !== 'transparent') {
     let maxLineWidth = 0;
     lines.forEach(line => {
         const lw = line.words.reduce((sum, w) => sum + ctx.measureText(w.word).width, 0) + (line.words.length - 1) * spaceWidth;
         if (lw > maxLineWidth) maxLineWidth = lw;
     });
     ctx.fillStyle = cfg.bgColor;
     ctx.beginPath();
     ctx.roundRect(x - maxLineWidth / 2 - 20, startY - lineHeight / 2 - 10, maxLineWidth + 40, totalH + 20, 12);
     ctx.fill();
  }

  // Renderizado palabra por palabra
  lines.forEach((line, i) => {
    const ly = startY + i * lineHeight;
    const totalLineWidth = line.words.reduce((sum, w) => sum + ctx.measureText(w.word).width, 0) + (line.words.length - 1) * spaceWidth;
    let cursorX = x - totalLineWidth / 2;

    line.words.forEach(w => {
      const wWidth = ctx.measureText(w.word).width;
      const displayScale = w.active ? 1.15 : 1.0; // Pop Effect
      const offsetY = w.active ? -fontSize * 0.08 : 0; // Bounce Effect

      ctx.save();
      ctx.translate(cursorX + wWidth / 2, ly + offsetY);
      ctx.scale(displayScale, displayScale);

      ctx.fillStyle = w.active ? '#ffffff' : cfg.color;
      
      if (w.active && cfg.wordHighlight) {
         ctx.shadowColor = 'rgba(255,255,255,0.9)';
         ctx.shadowBlur = 15;
      } else if (cfg.shadowBlur > 0) {
         ctx.shadowColor = cfg.shadowColor;
         ctx.shadowBlur = cfg.shadowBlur;
      }

      if (cfg.outlineWidth > 0) {
        ctx.lineWidth = cfg.outlineWidth * 2;
        ctx.strokeStyle = w.active ? '#ffffff' : cfg.outlineColor;
        ctx.lineJoin = 'round';
        ctx.strokeText(w.word, 0, 0);
      }
      ctx.fillText(w.word, 0, 0);
      ctx.restore();

      cursorX += wWidth + spaceWidth;
    });
  });

  ctx.restore();
}

export function drawCanvasCustomText(ctx: CanvasRenderingContext2D, t: TextOverlay, width: number, height: number) {
  ctx.save();
  const x = (t.x / 100) * width;
  const y = (t.y / 100) * height;
  const fontSize = Math.round((t.fontSize / 1000) * width * 1.1);
  ctx.font = `800 ${fontSize}px "Inter", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (t.strokeWidth > 0) {
    ctx.lineWidth = t.strokeWidth * 2;
    ctx.strokeStyle = t.strokeColor;
    ctx.strokeText(t.text, x, y);
  }
  ctx.fillStyle = t.color;
  ctx.fillText(t.text, x, y);
  ctx.restore();
}

export function drawCanvasSticker(ctx: CanvasRenderingContext2D, s: StickerOverlay, width: number, height: number) {
  ctx.save();
  const x = (s.x / 100) * width;
  const y = (s.y / 100) * height;
  const boxW = 260 * s.scale;
  const boxH = 50 * s.scale;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.strokeStyle = 'rgba(20, 184, 166, 0.8)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x - boxW / 2, y - boxH / 2, boxW, boxH, 12);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#34d399';
  ctx.beginPath();
  ctx.arc(x - boxW / 2 + 18, y, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.font = `bold ${Math.round(14 * s.scale)}px "Inter", sans-serif`;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(s.title, x - boxW / 2 + 32, y - (s.subtitle ? 7 : 0));
  if (s.subtitle) {
    ctx.font = `normal ${Math.round(11 * s.scale)}px "Inter", sans-serif`;
    ctx.fillStyle = '#2dd4bf';
    ctx.fillText(s.subtitle, x - boxW / 2 + 32, y + 10);
  }
  ctx.restore();
}
