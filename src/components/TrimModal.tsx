import React, { useState, useRef, useEffect } from 'react';
import {
  X, Scissors, Play, Pause, RotateCcw, Check, Film,
  Volume2, VolumeX, Split, ArrowLeft, ArrowRight,
  Plus, Copy, ChevronLeft, ChevronRight, Sparkles
} from 'lucide-react';
import { MediaClip } from '../types';

interface TrimModalProps {
  isOpen: boolean;
  onClose: () => void;
  clip: MediaClip | null;
  onApplyTrim: (clipId: string, trimStart: number, trimEnd: number, newDuration: number) => void;
  onSplitClip?: (clipId: string, splitSecond: number) => void;
  onExtractAsNewClip?: (clipId: string, trimStart: number, trimEnd: number) => void;
  onDuplicateClip?: (clipId: string) => void;
}

export const TrimModal: React.FC<TrimModalProps> = ({
  isOpen,
  onClose,
  clip,
  onApplyTrim,
  onSplitClip,
  onExtractAsNewClip,
  onDuplicateClip,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const filmstripRef = useRef<HTMLDivElement | null>(null);

  const [totalVideoDuration, setTotalVideoDuration] = useState<number>(10);
  const [trimStart, setTrimStart] = useState<number>(0);
  const [trimEnd, setTrimEnd] = useState<number>(5);
  const [currentPlayTime, setCurrentPlayTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [loopOnlyTrim, setLoopOnlyTrim] = useState<boolean>(true);

  // Volume inside trimmer
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Dragging state for CapCut handles: 'start' | 'end' | 'needle' | null
  const [dragTarget, setDragTarget] = useState<'start' | 'end' | 'needle' | null>(null);

  // Filmstrip thumbnails
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [isExtractingThumbnails, setIsExtractingThumbnails] = useState<boolean>(false);

  // Initialize values when clip opens
  useEffect(() => {
    if (clip && isOpen) {
      const initialStart = clip.trimStart || 0;
      setTrimStart(initialStart);

      const maxDur = clip.originalDuration || Math.max(10, initialStart + clip.duration);
      setTotalVideoDuration(maxDur);

      const initialEnd = clip.trimEnd !== undefined && clip.trimEnd > initialStart
        ? Math.min(maxDur, clip.trimEnd)
        : Math.min(maxDur, +(initialStart + clip.duration).toFixed(1));

      setTrimEnd(initialEnd);
      setCurrentPlayTime(initialStart);
      setIsPlaying(false);
      extractThumbnails(clip.url);
    }
  }, [clip, isOpen]);

  // Keyboard shortcut: Space to play/pause
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && (e.target as HTMLElement)?.tagName !== 'INPUT') {
        e.preventDefault();
        handleTogglePlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isPlaying, trimStart, trimEnd]);

  // Extract sequential filmstrip thumbnails from video
  const extractThumbnails = async (videoUrl: string) => {
    if (!videoUrl) return;
    setIsExtractingThumbnails(true);
    setThumbnails([]);

    try {
      const tempVideo = document.createElement('video');
      tempVideo.src = videoUrl;
      tempVideo.crossOrigin = 'anonymous';
      tempVideo.muted = true;
      tempVideo.playsInline = true;

      await new Promise<void>((resolve) => {
        tempVideo.onloadedmetadata = () => resolve();
        tempVideo.onerror = () => resolve();
        setTimeout(resolve, 1500);
      });

      const duration = tempVideo.duration && isFinite(tempVideo.duration) ? tempVideo.duration : 10;
      setTotalVideoDuration((prev) => (prev <= 10 && duration > 10 ? duration : prev));

      const count = 10;
      const interval = duration / count;
      const thumbs: string[] = [];
      const canvas = document.createElement('canvas');
      canvas.width = 160;
      canvas.height = 90;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        setIsExtractingThumbnails(false);
        return;
      }

      for (let i = 0; i < count; i++) {
        tempVideo.currentTime = i * interval;
        await new Promise<void>((res) => {
          tempVideo.onseeked = () => res();
          setTimeout(res, 180);
        });
        ctx.drawImage(tempVideo, 0, 0, canvas.width, canvas.height);
        thumbs.push(canvas.toDataURL('image/jpeg', 0.6));
      }

      setThumbnails(thumbs);
    } catch {
      // Fallback placeholder blocks will be rendered
    } finally {
      setIsExtractingThumbnails(false);
    }
  };

  // Video loaded metadata
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      if (dur && !isNaN(dur) && isFinite(dur)) {
        setTotalVideoDuration(dur);
        if (!clip?.trimEnd || clip.trimEnd > dur) {
          const fallbackEnd = clip?.trimStart
            ? Math.min(dur, clip.trimStart + clip.duration)
            : Math.min(dur, clip?.duration || dur);
          setTrimEnd(fallbackEnd);
        }
      }
      videoRef.current.currentTime = trimStart;
      videoRef.current.volume = isMuted ? 0 : volume;
      videoRef.current.muted = isMuted;
    }
  };

  // Video timeupdate listener
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const t = videoRef.current.currentTime;
    setCurrentPlayTime(t);

    if (loopOnlyTrim && isPlaying) {
      if (t >= trimEnd || t < trimStart) {
        videoRef.current.currentTime = trimStart;
        videoRef.current.play().catch(() => {});
      }
    }
  };

  // Format time mm:ss.ms
  const formatSecs = (secs: number) => {
    const safe = Math.max(0, secs);
    const m = Math.floor(safe / 60);
    const s = Math.floor(safe % 60);
    const ms = Math.floor((safe % 1) * 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  const handleTogglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      if (videoRef.current.currentTime >= trimEnd || videoRef.current.currentTime < trimStart) {
        videoRef.current.currentTime = trimStart;
      }
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  // Volume toggles
  const handleVolumeChange = (newVol: number) => {
    const clamped = Math.max(0, Math.min(1.5, newVol));
    setVolume(clamped);
    if (videoRef.current) {
      videoRef.current.volume = Math.min(1, clamped);
      videoRef.current.muted = clamped === 0;
    }
    if (clamped > 0 && isMuted) setIsMuted(false);
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
    }
  };

  // Filmstrip Pointer Drag Handlers
  const handleFilmstripPointerDown = (e: React.PointerEvent) => {
    if (!filmstripRef.current) return;
    const rect = filmstripRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetTime = +(ratio * totalVideoDuration).toFixed(1);

    const startRatio = trimStart / totalVideoDuration;
    const endRatio = trimEnd / totalVideoDuration;

    if (Math.abs(ratio - startRatio) < 0.05) {
      setDragTarget('start');
    } else if (Math.abs(ratio - endRatio) < 0.05) {
      setDragTarget('end');
    } else {
      setDragTarget('needle');
      setCurrentPlayTime(targetTime);
      if (videoRef.current) videoRef.current.currentTime = targetTime;
    }

    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleFilmstripPointerMove = (e: React.PointerEvent) => {
    if (!dragTarget || !filmstripRef.current) return;
    const rect = filmstripRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const sec = +(ratio * totalVideoDuration).toFixed(1);

    if (dragTarget === 'start') {
      const newStart = Math.max(0, Math.min(trimEnd - 0.2, sec));
      setTrimStart(newStart);
      setCurrentPlayTime(newStart);
      if (videoRef.current) videoRef.current.currentTime = newStart;
    } else if (dragTarget === 'end') {
      const newEnd = Math.min(totalVideoDuration, Math.max(trimStart + 0.2, sec));
      setTrimEnd(newEnd);
      setCurrentPlayTime(newEnd);
      if (videoRef.current) videoRef.current.currentTime = newEnd;
    } else if (dragTarget === 'needle') {
      setCurrentPlayTime(sec);
      if (videoRef.current) videoRef.current.currentTime = sec;
    }
  };

  const handleFilmstripPointerUp = (e: React.PointerEvent) => {
    setDragTarget(null);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  // CapCut: Fijar Inicio / Fin directamente en el cabezal
  const handleSetStartAtPlayhead = () => {
    const newStart = Math.min(trimEnd - 0.2, Math.max(0, +currentPlayTime.toFixed(1)));
    setTrimStart(newStart);
    if (videoRef.current) videoRef.current.currentTime = newStart;
  };

  const handleSetEndAtPlayhead = () => {
    const newEnd = Math.max(trimStart + 0.2, Math.min(totalVideoDuration, +currentPlayTime.toFixed(1)));
    setTrimEnd(newEnd);
    if (videoRef.current) videoRef.current.currentTime = newEnd;
  };

  // CapCut: Cortar Inicio / Fin
  const handleCutHead = () => {
    handleSetStartAtPlayhead();
  };

  const handleCutTail = () => {
    handleSetEndAtPlayhead();
  };

  // CapCut: Dividir en dos en el cabezal
  const handleSplitHere = () => {
    if (!clip) return;
    const splitPoint = Math.max(trimStart + 0.2, Math.min(trimEnd - 0.2, currentPlayTime));
    if (onSplitClip) {
      onSplitClip(clip.id, splitPoint);
      onClose();
    }
  };

  // CapCut: Extraer como nuevo clip (mantiene el original y añade este pedazo)
  const handleExtractAsNew = () => {
    if (!clip) return;
    const finalStart = Math.max(0, trimStart);
    const finalEnd = Math.min(totalVideoDuration, Math.max(finalStart + 0.2, trimEnd));
    if (onExtractAsNewClip) {
      onExtractAsNewClip(clip.id, finalStart, finalEnd);
      onClose();
    }
  };

  // CapCut: Duplicar clip
  const handleDuplicate = () => {
    if (!clip) return;
    if (onDuplicateClip) {
      onDuplicateClip(clip.id);
      onClose();
    }
  };

  // Fine Nudge Adjustments
  const handleNudgeStart = (delta: number) => {
    const nextStart = Math.max(0, Math.min(trimEnd - 0.2, +(trimStart + delta).toFixed(1)));
    setTrimStart(nextStart);
    setCurrentPlayTime(nextStart);
    if (videoRef.current) videoRef.current.currentTime = nextStart;
  };

  const handleNudgeEnd = (delta: number) => {
    const nextEnd = Math.min(totalVideoDuration, Math.max(trimStart + 0.2, +(trimEnd + delta).toFixed(1)));
    setTrimEnd(nextEnd);
    setCurrentPlayTime(nextEnd);
    if (videoRef.current) videoRef.current.currentTime = nextEnd;
  };

  const handleResetFull = () => {
    setTrimStart(0);
    setTrimEnd(totalVideoDuration);
    setCurrentPlayTime(0);
    if (videoRef.current) videoRef.current.currentTime = 0;
  };

  const handleSaveTrim = () => {
    const finalStart = Math.max(0, trimStart);
    const finalEnd = Math.min(totalVideoDuration, Math.max(finalStart + 0.2, trimEnd));
    const newDur = +(finalEnd - finalStart).toFixed(1);
    onApplyTrim(clip!.id, finalStart, finalEnd, newDur);
    onClose();
  };

  if (!isOpen || !clip || clip.type !== 'video') return null;

  const selectedDuration = Math.max(0.2, +(trimEnd - trimStart).toFixed(1));
  const startPercent = (trimStart / totalVideoDuration) * 100;
  const endPercent = (trimEnd / totalVideoDuration) * 100;
  const currentPercent = (currentPlayTime / totalVideoDuration) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full shadow-2xl flex flex-col max-h-[96vh] overflow-hidden">
        {/* CapCut Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 shrink-0 bg-slate-900/95">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-yellow-400 via-amber-500 to-rose-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-yellow-500/20">
              <Scissors className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Recortar Video Estilo CapCut
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 text-[10px] font-black uppercase tracking-wider">
                  Tira de Fotogramas
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-xs sm:max-w-md">
                Selecciona la fracción exacta de video arrastrando o usando los botones rápidos
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 scrollbar-thin">
          {/* 1. Large High-Definition Video Monitor */}
          <div className="relative rounded-2xl overflow-hidden bg-black border border-slate-800 aspect-video max-h-[300px] sm:max-h-[350px] mx-auto flex items-center justify-center shadow-2xl group">
            <video
              ref={videoRef}
              src={clip.url}
              playsInline
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
              onClick={handleTogglePlay}
              className="w-full h-full object-contain cursor-pointer"
            />

            {/* Play Button Overlay */}
            {!isPlaying && (
              <button
                type="button"
                onClick={handleTogglePlay}
                className="absolute w-16 h-16 rounded-full bg-yellow-400/90 hover:bg-yellow-300 text-slate-950 flex items-center justify-center shadow-2xl transition hover:scale-105 active:scale-95"
                title="Reproducir / Pausar (Barra espaciadora)"
              >
                <Play className="w-7 h-7 fill-slate-950 ml-1" />
              </button>
            )}

            {/* Current Position & Fraction Timecode Badges */}
            <div className="absolute bottom-3 left-3 bg-slate-950/90 backdrop-blur px-3 py-1.5 rounded-xl text-xs font-mono text-cyan-300 border border-slate-700/80 shadow flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Cabezal: <strong>{formatSecs(currentPlayTime)}</strong></span>
            </div>

            <div className="absolute top-3 right-3 bg-slate-950/90 backdrop-blur px-3 py-1.5 rounded-xl text-xs font-mono text-yellow-300 border border-yellow-500/50 shadow flex items-center gap-1.5">
              <span>Pedazo Seleccionado: <strong>{selectedDuration}s</strong></span>
              <span className="text-slate-400 font-sans">({formatSecs(trimStart)} ➔ {formatSecs(trimEnd)})</span>
            </div>
          </div>

          {/* 2. Quick Set Handles Buttons (Iconic CapCut in/out markers) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <button
              type="button"
              onClick={handleSetStartAtPlayhead}
              className="py-2 px-3 rounded-xl bg-yellow-500/15 hover:bg-yellow-500/25 text-yellow-300 border border-yellow-500/40 font-bold transition flex items-center justify-center gap-1.5 active:scale-95 shadow-sm"
              title="Fijar punto de inicio del pedazo en la posición actual del video"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-yellow-400" />
              <span>Fijar Inicio Aquí ({formatSecs(currentPlayTime)})</span>
            </button>

            <button
              type="button"
              onClick={handleSetEndAtPlayhead}
              className="py-2 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 font-bold transition flex items-center justify-center gap-1.5 active:scale-95 shadow-sm"
              title="Fijar punto de final del pedazo en la posición actual del video"
            >
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
              <span>Fijar Fin Aquí ({formatSecs(currentPlayTime)})</span>
            </button>

            <button
              type="button"
              onClick={handleSplitHere}
              className="py-2 px-3 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 font-bold transition flex items-center justify-center gap-1.5 active:scale-95 shadow-sm"
              title="Dividir este clip en dos pedazos en el segundo del cabezal"
            >
              <Split className="w-3.5 h-3.5 text-cyan-400" />
              <span>Dividir en 2 Clips</span>
            </button>

            <button
              type="button"
              onClick={handleResetFull}
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold transition flex items-center justify-center gap-1.5 active:scale-95"
              title="Restablecer video original completo"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Restablecer Todo</span>
            </button>
          </div>

          {/* 3. CapCut Iconic Yellow Filmstrip Trimmer */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/90 space-y-3 shadow-inner">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-bold flex items-center gap-2 text-white">
                <Film className="w-4 h-4 text-yellow-400" />
                <span>Tira de Video CapCut (Duración Total: {totalVideoDuration.toFixed(1)}s)</span>
              </span>
              <span className="text-[11px] font-mono text-yellow-400 font-bold bg-yellow-950/50 px-2 py-0.5 rounded border border-yellow-500/30">
                Seleccionado: {selectedDuration}s ({Math.round((selectedDuration / totalVideoDuration) * 100)}%)
              </span>
            </div>

            {/* The Tactile Filmstrip Container with Drag Handles */}
            <div
              ref={filmstripRef}
              onPointerDown={handleFilmstripPointerDown}
              onPointerMove={handleFilmstripPointerMove}
              onPointerUp={handleFilmstripPointerUp}
              onPointerCancel={handleFilmstripPointerUp}
              className="relative h-20 sm:h-24 rounded-xl overflow-hidden bg-slate-900 border-2 border-slate-800 select-none cursor-pointer flex items-center touch-none shadow-lg"
            >
              {/* Background Sequential Filmstrip Thumbnails */}
              <div className="absolute inset-0 flex pointer-events-none opacity-85">
                {thumbnails.length > 0 ? (
                  thumbnails.map((thumb, i) => (
                    <div
                      key={i}
                      style={{ backgroundImage: `url(${thumb})` }}
                      className="h-full flex-1 bg-cover bg-center border-r border-black/40"
                    />
                  ))
                ) : (
                  Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-full flex-1 bg-gradient-to-br from-slate-900 to-slate-800 border-r border-slate-950 flex flex-col justify-between p-1 opacity-70"
                    >
                      <div className="w-full h-1 bg-slate-700/50 rounded-sm" />
                      <div className="text-[8px] font-mono text-slate-500 text-center">
                        {((totalVideoDuration / 8) * i).toFixed(1)}s
                      </div>
                      <div className="w-full h-1 bg-slate-700/50 rounded-sm" />
                    </div>
                  ))
                )}
              </div>

              {/* Shaded Left Cut-Out Overlay */}
              <div
                style={{ width: `${startPercent}%` }}
                className="absolute left-0 top-0 bottom-0 bg-black/80 backdrop-blur-[1px] border-r-2 border-yellow-400 z-10 flex items-center justify-center transition-none pointer-events-none"
              >
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
                  Cortado
                </span>
              </div>

              {/* Shaded Right Cut-Out Overlay */}
              <div
                style={{ width: `${100 - endPercent}%` }}
                className="absolute right-0 top-0 bottom-0 bg-black/80 backdrop-blur-[1px] border-l-2 border-yellow-400 z-10 flex items-center justify-center transition-none pointer-events-none"
              >
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
                  Cortado
                </span>
              </div>

              {/* ACTIVE SELECTION BOUNDING BOX (CapCut Yellow Luminous Bracket) */}
              <div
                style={{
                  left: `${startPercent}%`,
                  width: `${Math.max(1, endPercent - startPercent)}%`,
                }}
                className="absolute top-0 bottom-0 border-y-4 border-yellow-400 z-20 pointer-events-none shadow-[0_0_15px_rgba(250,204,21,0.25)] flex items-center justify-center"
              >
                <div className="px-2 py-0.5 rounded-full bg-slate-950/80 border border-yellow-400/80 text-[10px] font-black text-yellow-300 shadow">
                  PEDAZO: {selectedDuration}s
                </div>
              </div>

              {/* Left Handle: CapCut Heavy Yellow Bracket */}
              <div
                style={{ left: `calc(${startPercent}% - 14px)` }}
                className="absolute top-0 bottom-0 w-8 z-30 flex items-center justify-center cursor-ew-resize active:scale-105 select-none"
                title="Arrastra para ajustar inicio"
              >
                <div className="w-5 h-full rounded-l-lg bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black flex flex-col items-center justify-center shadow-2xl border border-yellow-500">
                  <div className="w-1.5 h-6 space-y-1">
                    <div className="w-full h-0.5 bg-slate-950 rounded" />
                    <div className="w-full h-0.5 bg-slate-950 rounded" />
                    <div className="w-full h-0.5 bg-slate-950 rounded" />
                  </div>
                </div>
              </div>

              {/* Right Handle: CapCut Heavy Yellow Bracket */}
              <div
                style={{ left: `calc(${endPercent}% - 6px)` }}
                className="absolute top-0 bottom-0 w-8 z-30 flex items-center justify-center cursor-ew-resize active:scale-105 select-none"
                title="Arrastra para ajustar fin"
              >
                <div className="w-5 h-full rounded-r-lg bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black flex flex-col items-center justify-center shadow-2xl border border-yellow-500">
                  <div className="w-1.5 h-6 space-y-1">
                    <div className="w-full h-0.5 bg-slate-950 rounded" />
                    <div className="w-full h-0.5 bg-slate-950 rounded" />
                    <div className="w-full h-0.5 bg-slate-950 rounded" />
                  </div>
                </div>
              </div>

              {/* Needle Playhead Pin */}
              <div
                style={{ left: `${currentPercent}%` }}
                className="absolute top-0 bottom-0 w-1 bg-white pointer-events-none z-30 shadow-[0_0_10px_#ffffff]"
              >
                <div className="w-3.5 h-3.5 bg-white -ml-1.5 -mt-0.5 rounded-full shadow-md border border-slate-900" />
              </div>
            </div>

            {/* Fine Nudge Controls for In / Out Handles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Inicio controls */}
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-yellow-400 text-xs">Punto de Inicio [</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step={0.1}
                      min={0}
                      max={trimEnd - 0.2}
                      value={trimStart}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) {
                          const safe = Math.max(0, Math.min(trimEnd - 0.2, val));
                          setTrimStart(safe);
                          setCurrentPlayTime(safe);
                          if (videoRef.current) videoRef.current.currentTime = safe;
                        }
                      }}
                      className="w-16 px-1.5 py-0.5 bg-slate-950 border border-slate-700 rounded text-center font-mono font-bold text-yellow-300 text-xs focus:outline-none"
                    />
                    <span className="text-slate-500 font-mono">s</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-1 pt-1">
                  <button
                    type="button"
                    onClick={() => handleNudgeStart(-1.0)}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold"
                    title="-1.0s"
                  >
                    -1s
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNudgeStart(-0.1)}
                    className="flex-1 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-0.5"
                    title="-0.1s"
                  >
                    <ChevronLeft className="w-3 h-3" /> -0.1s
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNudgeStart(0.1)}
                    className="flex-1 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-0.5"
                    title="+0.1s"
                  >
                    +0.1s <ChevronRight className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNudgeStart(1.0)}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold"
                    title="+1.0s"
                  >
                    +1s
                  </button>
                </div>
              </div>

              {/* Fin controls */}
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-400 text-xs">Punto de Fin ]</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step={0.1}
                      min={trimStart + 0.2}
                      max={totalVideoDuration}
                      value={trimEnd}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) {
                          const safe = Math.min(totalVideoDuration, Math.max(trimStart + 0.2, val));
                          setTrimEnd(safe);
                          setCurrentPlayTime(safe);
                          if (videoRef.current) videoRef.current.currentTime = safe;
                        }
                      }}
                      className="w-16 px-1.5 py-0.5 bg-slate-950 border border-slate-700 rounded text-center font-mono font-bold text-emerald-300 text-xs focus:outline-none"
                    />
                    <span className="text-slate-500 font-mono">s</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-1 pt-1">
                  <button
                    type="button"
                    onClick={() => handleNudgeEnd(-1.0)}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold"
                    title="-1.0s"
                  >
                    -1s
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNudgeEnd(-0.1)}
                    className="flex-1 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-0.5"
                    title="-0.1s"
                  >
                    <ChevronLeft className="w-3 h-3" /> -0.1s
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNudgeEnd(0.1)}
                    className="flex-1 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-0.5"
                    title="+0.1s"
                  >
                    +0.1s <ChevronRight className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNudgeEnd(1.0)}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold"
                    title="+1.0s"
                  >
                    +1s
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Playback & Sound Volume Bar */}
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Play/Pause & Loop */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleTogglePlay}
                className="px-4 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black flex items-center gap-1.5 transition active:scale-95 shadow"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-slate-950" /> : <Play className="w-4 h-4 fill-slate-950" />}
                <span>{isPlaying ? 'Pausar' : 'Previsualizar Pedazo'}</span>
              </button>

              <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={loopOnlyTrim}
                  onChange={(e) => setLoopOnlyTrim(e.target.checked)}
                  className="accent-yellow-400 rounded w-4 h-4"
                />
                <span className="text-xs font-medium">Bucle solo de este pedazo</span>
              </label>
            </div>

            {/* Volume Control Inside Trimmer with Explicit Buttons */}
            <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={handleToggleMute}
                className="text-slate-400 hover:text-white transition"
                title="Silenciar / Activar sonido"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                )}
              </button>

              <button
                type="button"
                onClick={() => handleVolumeChange(+(volume - 0.1).toFixed(2))}
                className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center active:scale-95"
                title="Bajar volumen"
              >
                -
              </button>

              <span className="font-mono text-xs font-bold text-cyan-300 w-9 text-center">
                {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
              </span>

              <button
                type="button"
                onClick={() => handleVolumeChange(+(volume + 0.1).toFixed(2))}
                className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center active:scale-95"
                title="Subir volumen"
              >
                +
              </button>

              <input
                type="range"
                min="0"
                max="1.5"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-20 accent-cyan-400 h-1.5 bg-slate-800 rounded cursor-pointer ml-1"
                title="Deslizador de volumen"
              />
            </div>
          </div>
        </div>

        {/* CapCut Footer with Dual Save Options */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/95 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            Pedazo activo a montar: <strong className="text-yellow-400 font-mono text-sm">{selectedDuration}s</strong>
            <span className="text-slate-500 ml-1.5">(de {totalVideoDuration.toFixed(1)}s en total)</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancelar
            </button>

            {onExtractAsNewClip && (
              <button
                type="button"
                onClick={handleExtractAsNew}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition active:scale-95 flex items-center gap-1.5 shadow"
                title="Añade este pedazo a la secuencia sin cambiar el clip original"
              >
                <Plus className="w-4 h-4 text-cyan-400" />
                <span>+ Extraer como Nuevo Clip</span>
              </button>
            )}

            {onDuplicateClip && (
              <button
                type="button"
                onClick={handleDuplicate}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition active:scale-95 flex items-center gap-1.5"
                title="Duplicar este video para recortar otro fragmento"
              >
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Duplicar Clip</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSaveTrim}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-500 to-rose-500 hover:from-yellow-300 hover:to-rose-400 text-slate-950 font-black text-xs shadow-lg shadow-yellow-500/20 transition active:scale-95 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>✓ Aplicar Recorte al Clip</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
