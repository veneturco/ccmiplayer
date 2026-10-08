import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Download, Eye, EyeOff, Layers, Plus, Trash2, Heart, Activity, Award, Film, Phone, Calendar, Star, Clock, Scissors, Split, ArrowLeft, ArrowRight, Copy } from 'lucide-react';
import { ScriptScene, MediaClip, SubtitleConfig, TextOverlay, StickerOverlay, VideoFilterSettings, AspectRatio, BackgroundTextConfig } from '../types';

interface VideoPlayerPreviewProps {
  mediaClips: MediaClip[];
  scenes: ScriptScene[];
  currentScene: ScriptScene | null;
  currentTime: number;
  totalDuration: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onRestart: () => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  hasAudio: boolean;
  selectedVoiceName: string;
  aspectRatio: AspectRatio;
  subtitleConfig: SubtitleConfig;
  onUpdateSubtitleConfig: (cfg: Partial<SubtitleConfig>) => void;
  textOverlays: TextOverlay[];
  onUpdateTextOverlay: (id: string, updates: Partial<TextOverlay>) => void;
  onDeleteTextOverlay: (id: string) => void;
  onSelectOverlay: (id: string | null) => void;
  selectedOverlayId: string | null;
  stickers: StickerOverlay[];
  onUpdateSticker: (id: string, updates: Partial<StickerOverlay>) => void;
  onDeleteSticker: (id: string) => void;
  filterSettings: VideoFilterSettings;
  backgroundText: BackgroundTextConfig;
  onOpenExportModal: () => void;
  onQuickDownloadAudio: () => void;
  videoRefForward: React.RefObject<HTMLVideoElement | null>;
  onUpdateMediaClip?: (id: string, updates: Partial<MediaClip>) => void;
  onOpenTrimModal?: (clipId: string) => void;
  onSplitClip?: (clipId?: string, splitSecond?: number) => void;
  onDuplicateClip?: (clipId: string) => void;
  onTrimLeft?: (clipId?: string) => void;
  onTrimRight?: (clipId?: string) => void;
}

export const VideoPlayerPreview: React.FC<VideoPlayerPreviewProps> = ({
  mediaClips,
  scenes,
  currentScene,
  currentTime,
  totalDuration,
  isPlaying,
  onTogglePlay,
  onSeek,
  onRestart,
  volume,
  onVolumeChange,
  isMuted,
  onToggleMute,
  hasAudio,
  selectedVoiceName,
  aspectRatio,
  subtitleConfig,
  onUpdateSubtitleConfig,
  textOverlays,
  onUpdateTextOverlay,
  onDeleteTextOverlay,
  onSelectOverlay,
  selectedOverlayId,
  stickers,
  onUpdateSticker,
  onDeleteSticker,
  filterSettings,
  backgroundText,
  onOpenExportModal,
  onQuickDownloadAudio,
  videoRefForward,
  onUpdateMediaClip,
  onOpenTrimModal,
  onSplitClip,
  onDuplicateClip,
  onTrimLeft,
  onTrimRight,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  // Dragging state
  const [draggingTarget, setDraggingTarget] = useState<'subtitle' | { type: 'text' | 'sticker'; id: string } | null>(null);

  // Determine current active media clip from timeline
  let accumulatedTime = 0;
  let activeClipIndex = 0;
  let activeClip: MediaClip = mediaClips[0] || {
    id: 'fallback',
    type: 'video',
    url: '',
    name: 'Default',
    duration: 5,
    transition: 'fade',
    transitionDuration: 0.5,
  };

  for (let i = 0; i < mediaClips.length; i++) {
    const clip = mediaClips[i];
    if (currentTime >= accumulatedTime && currentTime < accumulatedTime + clip.duration) {
      activeClip = clip;
      activeClipIndex = i;
      break;
    }
    accumulatedTime += clip.duration;
  }

  // Calculate active transition effect at the end of the current clip
  const activeClipStart = mediaClips.slice(0, activeClipIndex).reduce((sum, c) => sum + c.duration, 0);
  const activeClipEnd = activeClipStart + activeClip.duration;
  const transDur = activeClip.transitionDuration || 0.5;

  let transitionType = 'none';
  let transitionProgress = 0; // 0 to 1

  if (activeClipIndex < mediaClips.length - 1 && currentTime >= activeClipEnd - transDur && currentTime < activeClipEnd) {
    transitionType = activeClip.transition;
    transitionProgress = Math.max(0, Math.min(1, (currentTime - (activeClipEnd - transDur)) / transDur));
  }

  // Forward video ref
  const setVideoRef = (el: HTMLVideoElement | null) => {
    localVideoRef.current = el;
    if (videoRefForward) {
      (videoRefForward as React.MutableRefObject<HTMLVideoElement | null>).current = el;
    }
  };

  // Sync video play/pause and playback position with trimStart offset
  useEffect(() => {
    const video = localVideoRef.current;
    if (!video || activeClip.type !== 'video') return;

    const clipStart = mediaClips.slice(0, activeClipIndex).reduce((sum, c) => sum + c.duration, 0);
    const localElapsed = Math.max(0, currentTime - clipStart);
    const inPoint = activeClip.trimStart || 0;
    const targetVideoTime = inPoint + (localElapsed % activeClip.duration);

    if (Math.abs(video.currentTime - targetVideoTime) > 0.35) {
      video.currentTime = targetVideoTime;
    }

    if (isPlaying) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isPlaying, currentTime, activeClip, activeClipIndex, mediaClips]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  const progressPercent = Math.min(100, Math.max(0, (currentTime / totalDuration) * 100));

  // Aspect ratio classes
  const aspectClass =
    aspectRatio === '9:16'
      ? 'aspect-[9/16] max-w-xs sm:max-w-sm mx-auto'
      : aspectRatio === '1:1'
      ? 'aspect-square max-w-md mx-auto'
      : aspectRatio === '4:5'
      ? 'aspect-[4/5] max-w-sm mx-auto'
      : 'aspect-video w-full';

  // CSS Filter string from filter settings including warmth
  const warmthHue = filterSettings.warmth ? `hue-rotate(${filterSettings.warmth * 0.5}deg)` : '';
  const filterStyle: React.CSSProperties = {
    filter: `brightness(${filterSettings.brightness}) contrast(${filterSettings.contrast}) saturate(${filterSettings.saturation}) ${warmthHue}`,
  };

  // Pointer drag handling for on-screen elements
  const handlePointerDown = (
    e: React.PointerEvent,
    target: 'subtitle' | { type: 'text' | 'sticker'; id: string }
  ) => {
    e.stopPropagation();
    setDraggingTarget(target);
    if (typeof target === 'object') {
      onSelectOverlay(target.id);
    } else {
      onSelectOverlay('subtitle');
    }
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingTarget || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xPct = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100));
    const yPct = Math.max(5, Math.min(95, ((e.clientY - rect.top) / rect.height) * 100));

    if (draggingTarget === 'subtitle') {
      onUpdateSubtitleConfig({ x: Math.round(xPct), y: Math.round(yPct) });
    } else if (draggingTarget.type === 'text') {
      onUpdateTextOverlay(draggingTarget.id, { x: Math.round(xPct), y: Math.round(yPct) });
    } else if (draggingTarget.type === 'sticker') {
      onUpdateSticker(draggingTarget.id, { x: Math.round(xPct), y: Math.round(yPct) });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingTarget) {
      setDraggingTarget(null);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (err) {}
    }
  };

  // Render sticker icon
  const renderStickerIcon = (type: string) => {
    switch (type) {
      case 'ecg-heart':
        return <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500 animate-pulse" />;
      case 'emergency-247':
        return <Clock className="w-3.5 h-3.5 text-cyan-400" />;
      case 'doctor-badge':
        return <Activity className="w-3.5 h-3.5 text-emerald-400" />;
      case 'iso-certified':
        return <Award className="w-3.5 h-3.5 text-amber-400" />;
      case 'ambulance':
        return <Film className="w-3.5 h-3.5 text-rose-400" />;
      case 'call-cta':
        return <Phone className="w-3.5 h-3.5 text-green-400" />;
      case 'calendar-appointment':
        return <Calendar className="w-3.5 h-3.5 text-purple-400" />;
      case 'star-rating':
        return <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-teal-400" />;
    }
  };

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
      {/* Visual Monitor Canvas */}
      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`relative ${aspectClass} bg-slate-950 overflow-hidden select-none transition-all duration-300 group`}
      >
        {/* Active Media Clip (Image or Video) with No-Zoom Support */}
        {activeClip.type === 'video' ? (
          <div className="absolute inset-0 w-full h-full flex items-center justify-center">
            {/* Ambient blurred backdrop when fitMode is contain */}
            {activeClip.fitMode !== 'cover' && (
              <video
                src={activeClip.url}
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover blur-xl opacity-35 scale-110 pointer-events-none"
              />
            )}
            <video
              ref={setVideoRef}
              src={activeClip.url}
              playsInline
              muted
              loop
              style={filterStyle}
              className={`relative z-10 w-full h-full transition-opacity duration-300 ${
                activeClip.fitMode === 'cover' ? 'object-cover' : 'object-contain'
              }`}
            />
          </div>
        ) : (
          <div className="absolute inset-0 w-full h-full flex items-center justify-center">
            {/* Ambient blurred backdrop when fitMode is contain */}
            {activeClip.fitMode !== 'cover' && (
              <div
                style={{
                  backgroundImage: `url(${activeClip.url})`,
                  ...filterStyle,
                }}
                className="absolute inset-0 bg-cover bg-center blur-xl opacity-35 scale-110 pointer-events-none"
              />
            )}
            <div
              style={{
                backgroundImage: `url(${activeClip.url})`,
                ...filterStyle,
              }}
              className={`relative z-10 w-full h-full transition-all duration-700 ${
                activeClip.fitMode === 'cover'
                  ? 'bg-cover bg-center'
                  : 'bg-contain bg-center bg-no-repeat'
              } ${
                activeClip.kenBurns && isPlaying
                  ? 'scale-105 duration-[6000ms] ease-out'
                  : 'scale-100'
              }`}
            />
          </div>
        )}

        {/* Media Framing Controls: Ajustar (Sin Zoom) vs Rellenar (Cover) */}
        {onUpdateMediaClip && (
          <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1 bg-slate-950/85 backdrop-blur-md px-2 py-1 rounded-xl border border-slate-800 text-[11px] shadow-lg">
            <span className="text-[10px] text-slate-400 font-semibold mr-1">Encuadre:</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onUpdateMediaClip(activeClip.id, {
                  fitMode: activeClip.fitMode === 'cover' ? 'contain' : 'cover',
                });
              }}
              className={`px-2 py-0.5 rounded font-bold transition flex items-center gap-1 ${
                activeClip.fitMode !== 'cover'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
              title="Ajustar imagen o video completo sin recortar ni zoom"
            >
              {activeClip.fitMode !== 'cover' ? 'Ajustar (Sin Zoom)' : 'Rellenar (Cover)'}
            </button>

            {activeClip.type === 'image' && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateMediaClip(activeClip.id, { kenBurns: !activeClip.kenBurns });
                }}
                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition ${
                  activeClip.kenBurns
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                }`}
                title="Activar o desactivar animación de zoom continuo en fotos"
              >
                Zoom KenBurns: {activeClip.kenBurns ? 'ON' : 'OFF'}
              </button>
            )}
          </div>
        )}

        {/* Cinematic Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/40 pointer-events-none" />

        {/* Dynamic CapCut Visual Transitions */}
        {transitionType === 'flash-white' && (
          <div
            style={{ opacity: Math.sin(transitionProgress * Math.PI) * 0.95 }}
            className="absolute inset-0 bg-white pointer-events-none z-20 transition-opacity"
          />
        )}
        {transitionType === 'flash-black' && (
          <div
            style={{ opacity: Math.sin(transitionProgress * Math.PI) * 0.95 }}
            className="absolute inset-0 bg-black pointer-events-none z-20 transition-opacity"
          />
        )}
        {transitionType === 'fade' && (
          <div
            style={{ opacity: Math.sin(transitionProgress * Math.PI) * 0.75 }}
            className="absolute inset-0 bg-black pointer-events-none z-20 transition-opacity"
          />
        )}
        {transitionType === 'blur-fade' && (
          <div
            style={{ backdropFilter: `blur(${Math.sin(transitionProgress * Math.PI) * 16}px)` }}
            className="absolute inset-0 pointer-events-none z-20"
          />
        )}
        {transitionType === 'glitch' && (
          <div
            style={{ opacity: Math.sin(transitionProgress * Math.PI) * 0.8 }}
            className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 via-rose-500/30 to-amber-500/30 mix-blend-color-dodge pointer-events-none z-20 animate-pulse"
          />
        )}
        {transitionType !== 'none' && transitionProgress > 0 && (
          <div className="absolute bottom-4 left-4 bg-amber-500/90 text-slate-950 font-extrabold px-2.5 py-1 rounded-lg text-[10px] z-30 shadow-lg flex items-center gap-1 border border-amber-300">
            <span>⚡ Transición: {transitionType} ({transDur}s)</span>
          </div>
        )}

        {/* Large Background Text Watermark (if enabled) */}
        {backgroundText.enabled && (
          <div
            style={{
              top: `${backgroundText.y}%`,
              opacity: backgroundText.opacity,
              color: backgroundText.color,
            }}
            className="absolute left-0 right-0 -translate-y-1/2 text-center pointer-events-none select-none z-10"
          >
            <span className="font-black text-4xl sm:text-6xl md:text-7xl uppercase tracking-widest drop-shadow-2xl">
              {backgroundText.text}
            </span>
          </div>
        )}

        {/* Top Badges: Current Clip & Format */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-20">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-bold text-cyan-400 border border-cyan-500/30 shadow-md">
              Clip: {activeClip.name} ({activeClip.type === 'image' ? 'Foto Estática' : 'Video'})
            </span>
            <span className="bg-slate-900/80 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-semibold text-rose-300 border border-rose-500/30">
              {aspectRatio}
            </span>
          </div>

          <div className="flex items-center gap-1.5 pointer-events-auto">
            {/* Quick Volume Monitor Pill */}
            <button
              onClick={onToggleMute}
              className={`p-1.5 px-2 rounded-lg text-xs font-bold backdrop-blur-md border transition flex items-center gap-1 shadow ${
                isMuted || volume === 0
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
              }`}
              title="Clic para silenciar o activar sonido"
            >
              {isMuted || volume === 0 ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
              <span className="font-mono text-[10px]">{isMuted ? 'MUTE' : `${Math.round(volume * 100)}%`}</span>
            </button>

            {/* Quick Subtitle toggle */}
            <button
              onClick={() => onUpdateSubtitleConfig({ enabled: !subtitleConfig.enabled })}
              className={`p-1.5 rounded-lg text-xs font-semibold backdrop-blur-md border transition ${
                subtitleConfig.enabled
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-950/80 text-slate-500 border-slate-700 hover:text-white'
              }`}
              title={subtitleConfig.enabled ? 'Ocultar subtítulos' : 'Mostrar subtítulos'}
            >
              {subtitleConfig.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* DRAGGABLE SUBTITLES (Karaoke en vivo) */}
        {subtitleConfig.enabled && currentScene && (
          <div
            onPointerDown={(e) => handlePointerDown(e, 'subtitle')}
            style={{
              left: `${subtitleConfig.x}%`,
              top: `${subtitleConfig.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
            className={`absolute z-30 cursor-grab active:cursor-grabbing max-w-[85%] text-center px-4 py-2 rounded-xl transition-[transform] select-none ${
              selectedOverlayId === 'subtitle'
                ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950 bg-black/40'
                : ''
            }`}
          >
            <p
              style={{
                fontSize: `${subtitleConfig.fontSize}px`,
                color: subtitleConfig.color,
                fontFamily: subtitleConfig.fontFamily,
                backgroundColor: subtitleConfig.bgColor !== 'transparent' ? subtitleConfig.bgColor : undefined,
                WebkitTextStroke: subtitleConfig.outlineWidth > 0
                  ? `${subtitleConfig.outlineWidth}px ${subtitleConfig.outlineColor}`
                  : undefined,
                textTransform: subtitleConfig.uppercase ? 'uppercase' : 'none',
                filter: subtitleConfig.shadowBlur > 0 ? `drop-shadow(0 0 ${subtitleConfig.shadowBlur}px ${subtitleConfig.shadowColor})` : undefined,
              }}
              className="font-black leading-snug drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] tracking-wide inline-flex flex-wrap justify-center gap-[0.3em] px-3 py-1.5 rounded-xl"
            >
              {(() => {
                const words = currentScene.text.split(/\s+/);
                const sceneDur = currentScene.endSeconds - currentScene.startSeconds;
                const elapsedInScene = currentTime - currentScene.startSeconds;
                const activeIdx = Math.max(0, Math.min(words.length - 1, Math.floor((elapsedInScene / sceneDur) * words.length)));

                return words.map((word, i) => {
                  const isActive = subtitleConfig.wordHighlight && i === activeIdx;
                  return (
                    <span
                      key={i}
                      className={`transition-all duration-150 ${
                        isActive ? 'scale-110 text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.9)] -translate-y-1' : ''
                      }`}
                      style={{ color: isActive ? '#ffffff' : subtitleConfig.color }}
                    >
                      {word}
                    </span>
                  );
                });
              })()}
            </p>
            {selectedOverlayId === 'subtitle' && (
              <span className="block text-[9px] text-cyan-300 font-mono mt-2 opacity-80">
                Arrastra para mover libremente ({subtitleConfig.x}%, {subtitleConfig.y}%)
              </span>
            )}
          </div>
        )}

        {/* DRAGGABLE CUSTOM FLOATING TEXTS */}
        {textOverlays
          .filter((t) => currentTime >= t.startTime && currentTime <= t.endTime)
          .map((textItem) => {
            const isSelected = selectedOverlayId === textItem.id;
            return (
              <div
                key={textItem.id}
                onPointerDown={(e) => handlePointerDown(e, { type: 'text', id: textItem.id })}
                style={{
                  left: `${textItem.x}%`,
                  top: `${textItem.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className={`absolute z-30 cursor-grab active:cursor-grabbing px-3 py-1.5 rounded-lg select-none ${
                  isSelected ? 'ring-2 ring-rose-400 ring-offset-2 ring-offset-slate-950' : ''
                }`}
              >
                <span
                  style={{
                    fontSize: `${textItem.fontSize}px`,
                    color: textItem.color,
                    fontFamily: textItem.fontFamily,
                    backgroundColor: textItem.bgColor,
                    WebkitTextStroke: textItem.strokeWidth > 0 ? `${textItem.strokeWidth}px ${textItem.strokeColor}` : undefined,
                  }}
                  className="font-extrabold drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] px-2.5 py-1 rounded-lg block tracking-wide"
                >
                  {textItem.text}
                </span>
                {isSelected && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteTextOverlay(textItem.id);
                    }}
                    className="absolute -top-3 -right-3 w-5 h-5 bg-rose-600 hover:bg-rose-500 rounded-full text-white flex items-center justify-center text-xs shadow-lg"
                    title="Eliminar este texto"
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}

        {/* DRAGGABLE STICKERS / REAL CLINICAL BADGES */}
        {stickers
          .filter((s) => currentTime >= s.startTime && currentTime <= s.endTime)
          .map((sticker) => {
            const isSelected = selectedOverlayId === sticker.id;
            return (
              <div
                key={sticker.id}
                onPointerDown={(e) => handlePointerDown(e, { type: 'sticker', id: sticker.id })}
                style={{
                  left: `${sticker.x}%`,
                  top: `${sticker.y}%`,
                  transform: `translate(-50%, -50%) scale(${sticker.scale})`,
                }}
                className={`absolute z-30 cursor-grab active:cursor-grabbing select-none group/sticker ${
                  isSelected ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-950' : ''
                }`}
              >
                <div className="bg-slate-950/90 border border-teal-500/70 rounded-xl px-3 py-1.5 shadow-2xl flex items-center gap-2 backdrop-blur-md">
                  {renderStickerIcon(sticker.type)}
                  <div>
                    <div className="text-[11px] font-bold text-white">{sticker.title}</div>
                    {sticker.subtitle && (
                      <div className="text-[9px] text-teal-300 font-medium">{sticker.subtitle}</div>
                    )}
                  </div>
                </div>
                {isSelected && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSticker(sticker.id);
                    }}
                    className="absolute -top-2.5 -right-2.5 w-5 h-5 bg-rose-600 hover:bg-rose-500 rounded-full text-white flex items-center justify-center text-xs shadow-lg"
                    title="Eliminar sticker"
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}

        {/* Bottom Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-900/60 z-30 pointer-events-none">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-teal-400 shadow-[0_0_8px_#22d3ee] transition-[width] duration-75"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Play Overlay Button */}
        {!isPlaying && (
          <button
            onClick={onTogglePlay}
            className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center shadow-2xl shadow-cyan-500/40 transition hover:scale-105 active:scale-95 z-40"
            title="Reproducir video"
          >
            <Play className="w-7 h-7 fill-slate-950 ml-1" />
          </button>
        )}
      </div>

      {/* Scrubber & Player Controls Bar */}
      <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-3">
        {/* Scrubber */}
        <div
          className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden cursor-pointer relative group"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const ratio = Math.max(0, Math.min(1, clickX / rect.width));
            onSeek(ratio * totalDuration);
          }}
        >
          {/* Clip divider marks on scrubber */}
          {mediaClips.map((clip, i) => {
            const clipStart = mediaClips.slice(0, i).reduce((sum, c) => sum + c.duration, 0);
            const leftPct = (clipStart / totalDuration) * 100;
            return (
              <div
                key={clip.id}
                className="absolute top-0 bottom-0 border-r border-slate-900 z-10"
                style={{ left: `${leftPct}%` }}
              />
            );
          })}

          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-amber-400 rounded-full transition-[width] duration-75"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Buttons Row with REPLAY AND DIRECT EXPORT */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-slate-300">
          <div className="flex items-center gap-2">
            <button
              onClick={onTogglePlay}
              className="w-9 h-9 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center font-bold transition shadow-sm"
              title={isPlaying ? 'Pausar' : 'Reproducir'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-slate-950" /> : <Play className="w-4 h-4 fill-slate-950 ml-0.5" />}
            </button>

            {/* Replay Button */}
            <button
              onClick={onRestart}
              className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition border border-slate-700"
              title="Volver a escuchar desde el inicio (00:00)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <div className="text-xs font-mono font-medium ml-1">
              <span className="text-cyan-400 font-bold">{formatTime(currentTime)}</span>
              <span className="text-slate-600 mx-1">/</span>
              <span>{formatTime(totalDuration)}</span>
            </div>

            {/* Volume Controls with Stepper Buttons and Readout - Highly Visible */}
            <div className="flex items-center gap-1.5 ml-1 bg-slate-950 px-2.5 py-1 rounded-xl border border-cyan-500/40 shadow-sm">
              <button
                onClick={onToggleMute}
                className="text-slate-400 hover:text-white transition"
                title="Silenciar / Activar sonido"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
              </button>

              <button
                onClick={() => onVolumeChange(Math.max(0, +(volume - 0.1).toFixed(2)))}
                className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-0.5 active:scale-95 border border-slate-700"
                title="Bajar volumen (-10%)"
              >
                <span>-</span>
                <span className="text-[9px] text-slate-400 hidden sm:inline">Bajar</span>
              </button>

              <span className="font-mono text-xs font-black text-cyan-300 w-9 text-center">
                {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
              </span>

              <button
                onClick={() => onVolumeChange(Math.min(1.5, +(volume + 0.1).toFixed(2)))}
                className="px-1.5 py-0.5 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black flex items-center gap-0.5 active:scale-95 shadow"
                title="Subir volumen (+10%)"
              >
                <span>+</span>
                <span className="text-[9px] text-slate-900 font-bold hidden sm:inline">Subir</span>
              </button>

              <input
                type="range"
                min="0"
                max="1.5"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="w-16 sm:w-20 accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer ml-1"
                title="Ajustar nivel de volumen"
              />
            </div>
          </div>

          {/* Action Export Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onQuickDownloadAudio}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                hasAudio
                  ? 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border-cyan-500/40 shadow-sm'
                  : 'bg-slate-800/40 text-slate-500 border-slate-800 hover:text-slate-400'
              }`}
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Bajar Audio WAV</span>
            </button>

            <button
              onClick={onOpenExportModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 shadow-md shadow-amber-950/40 transition active:scale-95"
            >
              <Download className="w-3.5 h-3.5 fill-slate-950" />
              <span>Exportar Video</span>
            </button>
          </div>
        </div>

        {/* CapCut Quick Action Bar: Dividir, Cortar Inicio, Cortar Fin, Filmstrip, Duplicar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
              <Scissors className="w-3.5 h-3.5 text-yellow-400" />
              <span>Edición CapCut:</span>
            </span>

            <button
              type="button"
              onClick={() => onSplitClip && onSplitClip(activeClip.id)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 font-bold transition active:scale-95 shadow-sm"
              title="Dividir clip en el punto actual del reproductor"
            >
              <Split className="w-3.5 h-3.5 text-cyan-400" />
              <span>Dividir (✂️)</span>
            </button>

            <button
              type="button"
              onClick={() => onTrimLeft && onTrimLeft(activeClip.id)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-yellow-950/80 hover:bg-yellow-900 text-yellow-300 border border-yellow-700/60 font-bold transition active:scale-95 shadow-sm"
              title="Cortar todo lo que está antes de esta posición"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-yellow-400" />
              <span>Cortar Inicio</span>
            </button>

            <button
              type="button"
              onClick={() => onTrimRight && onTrimRight(activeClip.id)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 font-bold transition active:scale-95 shadow-sm"
              title="Cortar todo lo que está después de esta posición"
            >
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cortar Fin</span>
            </button>

            {activeClip.type === 'video' && onOpenTrimModal && (
              <button
                type="button"
                onClick={() => onOpenTrimModal(activeClip.id)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-700/60 font-bold transition active:scale-95 shadow-sm"
                title="Abrir editor de tira de fotogramas CapCut"
              >
                <Scissors className="w-3.5 h-3.5 text-rose-400" />
                <span>Filmstrip</span>
              </button>
            )}

            {onDuplicateClip && (
              <button
                type="button"
                onClick={() => onDuplicateClip(activeClip.id)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold transition active:scale-95 shadow-sm"
                title="Duplicar este clip para recortar otro fragmento del mismo video"
              >
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Duplicar Clip</span>
              </button>
            )}
          </div>

          <div className="text-[11px] text-slate-400 font-mono">
            Clip: <strong className="text-white">{activeClip.name}</strong> ({activeClip.duration}s)
          </div>
        </div>
      </div>
    </div>
  );
};
