import React, { useState, useRef } from 'react';
import {
  Play, Pause, RotateCcw, Download, Scissors, Sparkles, Mic, Upload,
  Film, Type, Palette, Sticker, Layers, ChevronUp, ChevronDown, Check,
  X, Volume2, VolumeX, Music, RefreshCw, Smartphone, Monitor, ShieldCheck, Heart,
  ArrowLeftRight, FileAudio, Split, ArrowLeft, ArrowRight, Copy, Plus, Trash2, Crown
} from 'lucide-react';
import {
  MediaClip, ScriptScene, SubtitleConfig, TextOverlay, StickerOverlay,
  VideoFilterSettings, BackgroundTextConfig, AspectRatio, VoiceOption, VoicePreset,
  CapCutTemplate, ClipTransitionType, VocalCleanConfig, VocalCleanPreset, UserPlanTier
} from '../types';
import { SUBTITLE_STYLES, STICKER_CATALOG, STYLE_PRESETS, StickerTemplate } from '../data/initialScript';
import { InspectorPro } from './InspectorPro';
import { GeminiStudioEngine } from './GeminiStudioEngine';
import { ExportProEngine } from './ExportProEngine';

interface MobileCapCutStudioProps {
  mediaClips: MediaClip[];
  scenes: ScriptScene[];
  currentScene: ScriptScene;
  currentTime: number;
  totalDuration: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onRestart: () => void;
  hasAudio: boolean;
  customAudioName: string | null;
  masterAudioUrl: string | null;
  selectedVoiceName: VoiceOption;
  aspectRatio: AspectRatio;
  onChangeAspectRatio: (ratio: AspectRatio) => void;
  subtitleConfig: SubtitleConfig;
  onUpdateSubtitleConfig: (cfg: Partial<SubtitleConfig>) => void;
  textOverlays: TextOverlay[];
  onAddTextOverlay: () => void;
  onUpdateTextOverlay: (id: string, updates: Partial<TextOverlay>) => void;
  onDeleteTextOverlay: (id: string) => void;
  stickers: StickerOverlay[];
  onAddStickerFromCatalog: (template: StickerTemplate) => void;
  onUpdateSticker: (id: string, updates: Partial<StickerOverlay>) => void;
  onDeleteSticker: (id: string) => void;
  filterSettings: VideoFilterSettings;
  onUpdateFilterSettings: (settings: Partial<VideoFilterSettings>) => void;
  backgroundText: BackgroundTextConfig;
  onUpdateBackgroundText: (cfg: Partial<BackgroundTextConfig>) => void;
  onAddMediaClip: (clip: MediaClip) => void;
  onUpdateMediaClip: (id: string, updates: Partial<MediaClip>) => void;
  onDeleteMediaClip: (id: string) => void;
  onReorderMediaClips: (fromIndex: number, toIndex: number) => void;
  onOpenTransitionModal: (clipId: string, index: number) => void;
  rawScriptText: string;
  onChangeRawScript: (text: string) => void;
  onLoadOfficialScript: () => void;
  selectedVoice: VoiceOption;
  onSelectVoice: (v: VoiceOption) => void;
  voices: VoicePreset[];
  selectedStyleId: string;
  onSelectStyle: (id: string) => void;
  customStylePrompt: string;
  onChangeCustomPrompt: (prompt: string) => void;
  onGenerateAudio: () => void;
  isGeneratingAudio: boolean;
  onImportAudioFile: (file: File) => void;
  onResetAudio: () => void;
  onSyncDurationToAudio: () => void;
  onOpenExportModal: () => void;
  onExportVideo: () => void;
  isExportingVideo: boolean;
  exportProgress: number;
  onSwitchToDesktop: () => void;
  onOpenTrimModal: (clipId: string) => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  bgMusicVolume: number;
  onChangeBgVolume: (vol: number) => void;
  bgMusicEnabled: boolean;
  onToggleBgMusic: () => void;
  onSplitClip?: (clipId?: string, splitSecond?: number) => void;
  onDuplicateClip?: (clipId: string) => void;
  onTrimLeft?: (clipId?: string) => void;
  onTrimRight?: (clipId?: string) => void;
  onAutoSyncCuts?: () => void;
  isAutoSyncing?: boolean;
  vocalCleanConfig?: VocalCleanConfig;
  onApplyVocalClean?: (presetId?: VocalCleanPreset) => Promise<void>;
  isCleaningVocal?: boolean;
  hasCleanedAudio?: boolean;
  isShowingCleaned?: boolean;
  onToggleOriginalVsCleaned?: () => void;
  userPlanTier?: UserPlanTier;
  onOpenUpgradeModal?: (feature?: string) => void;
}

export const MobileCapCutStudio: React.FC<MobileCapCutStudioProps> = ({
  mediaClips,
  scenes,
  currentScene,
  currentTime,
  totalDuration,
  isPlaying,
  onTogglePlay,
  onSeek,
  onRestart,
  hasAudio,
  customAudioName,
  masterAudioUrl,
  selectedVoiceName,
  aspectRatio,
  onChangeAspectRatio,
  subtitleConfig,
  onUpdateSubtitleConfig,
  textOverlays,
  onAddTextOverlay,
  onUpdateTextOverlay,
  onDeleteTextOverlay,
  stickers,
  onAddStickerFromCatalog,
  onUpdateSticker,
  onDeleteSticker,
  filterSettings,
  onUpdateFilterSettings,
  backgroundText,
  onUpdateBackgroundText,
  onAddMediaClip,
  onUpdateMediaClip,
  onDeleteMediaClip,
  onReorderMediaClips,
  onOpenTransitionModal,
  rawScriptText,
  onChangeRawScript,
  onLoadOfficialScript,
  selectedVoice,
  onSelectVoice,
  voices,
  selectedStyleId,
  onSelectStyle,
  customStylePrompt,
  onChangeCustomPrompt,
  onGenerateAudio,
  isGeneratingAudio,
  onImportAudioFile,
  onResetAudio,
  onSyncDurationToAudio,
  onOpenExportModal,
  onExportVideo,
  isExportingVideo,
  exportProgress,
  onSwitchToDesktop,
  onOpenTrimModal,
  volume,
  onVolumeChange,
  isMuted,
  onToggleMute,
  bgMusicVolume,
  onChangeBgVolume,
  bgMusicEnabled,
  onToggleBgMusic,
  onSplitClip,
  onDuplicateClip,
  onTrimLeft,
  onTrimRight,
  onAutoSyncCuts,
  isAutoSyncing,
  vocalCleanConfig,
  onApplyVocalClean,
  isCleaningVocal,
  hasCleanedAudio,
  isShowingCleaned,
  onToggleOriginalVsCleaned,
  userPlanTier = 'premium',
  onOpenUpgradeModal,
}) => {
  // Mobile active drawer
  const [activeSheet, setActiveSheet] = useState<
    'none' | 'tts' | 'audio-import' | 'clips' | 'subtitles' | 'filters' | 'stickers' | 'volume' | 'inspector' | 'gemini' | 'export'
  >('none');

  const audioFileInputRef = useRef<HTMLInputElement | null>(null);
  const mediaFileInputRef = useRef<HTMLInputElement | null>(null);

  // Format time mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportAudioFile(file);
      setActiveSheet('none');
    }
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file, idx) => {
      const isVideo = file.type.startsWith('video');
      const url = URL.createObjectURL(file);
      const clipId = `m-clip-${Date.now()}-${idx}`;

      if (isVideo) {
        const tempVideo = document.createElement('video');
        tempVideo.preload = 'metadata';
        tempVideo.src = url;
        tempVideo.onloadedmetadata = () => {
          const rawDuration = tempVideo.duration;
          const origDur = rawDuration && !isNaN(rawDuration) && isFinite(rawDuration)
            ? +rawDuration.toFixed(1)
            : 10;
          const initialTrimEnd = Math.min(origDur, 5);
          const newClip: MediaClip = {
            id: clipId,
            type: 'video',
            url,
            name: file.name.slice(0, 20),
            duration: initialTrimEnd,
            originalDuration: origDur,
            trimStart: 0,
            trimEnd: initialTrimEnd,
            transition: 'fade',
            transitionDuration: 0.5,
            kenBurns: false,
          };
          onAddMediaClip(newClip);
          onOpenTrimModal(clipId);
        };
        tempVideo.onerror = () => {
          const newClip: MediaClip = {
            id: clipId,
            type: 'video',
            url,
            name: file.name.slice(0, 20),
            duration: 5,
            originalDuration: 10,
            trimStart: 0,
            trimEnd: 5,
            transition: 'fade',
            transitionDuration: 0.5,
            kenBurns: false,
          };
          onAddMediaClip(newClip);
          onOpenTrimModal(clipId);
        };
      } else {
        const newClip: MediaClip = {
          id: clipId,
          type: 'image',
          url,
          name: file.name.slice(0, 20),
          duration: 4,
          transition: 'fade',
          transitionDuration: 0.5,
          kenBurns: true,
        };
        onAddMediaClip(newClip);
      }
    });
    if (e.target) e.target.value = '';
  };

  // Find active media clip based on currentTime
  let accDuration = 0;
  let activeMedia = mediaClips[0];
  for (const c of mediaClips) {
    if (currentTime >= accDuration && currentTime <= accDuration + c.duration) {
      activeMedia = c;
      break;
    }
    accDuration += c.duration;
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-65px)] bg-slate-950 text-white max-w-lg mx-auto w-full pb-20 select-none relative">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={audioFileInputRef}
        accept="audio/*"
        className="hidden"
        onChange={handleAudioUpload}
      />
      <input
        type="file"
        ref={mediaFileInputRef}
        accept="video/*,image/*"
        multiple
        className="hidden"
        onChange={handleMediaUpload}
      />

      {/* Top Mobile Bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-[57px] z-20">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-xs font-black tracking-tight text-white uppercase">CapCut Móvil</span>
          <button
            onClick={onSwitchToDesktop}
            className="ml-2 text-[10px] text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40 font-semibold"
          >
            Ver en PC 💻
          </button>
        </div>

        {/* Aspect Ratio Picker */}
        <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px]">
          {(['9:16', '16:9', '1:1'] as AspectRatio[]).map((r) => (
            <button
              key={r}
              onClick={() => onChangeAspectRatio(r)}
              className={`px-2 py-0.5 rounded font-bold transition ${
                aspectRatio === r ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Quick Export Button */}
        <button
          onClick={onOpenExportModal}
          disabled={isExportingVideo}
          className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-black bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 shadow transition active:scale-95"
        >
          {isExportingVideo ? (
            <>
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>{exportProgress}%</span>
            </>
          ) : (
            <>
              <Download className="w-3 h-3 fill-slate-950" />
              <span>Exportar</span>
            </>
          )}
        </button>
      </div>

      {/* Mobile Video Player Viewport */}
      <div className="p-3 flex flex-col items-center justify-center bg-black/40">
        {/* Top HUD Telemetry Strip matching Stitch Image 4 */}
        <div className="w-full flex items-center justify-between pb-1.5 text-[10px] font-mono">
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded bg-surface-container-highest border border-outline-variant/30 text-on-surface-variant font-bold">
              REC709 · HDR10
            </span>
            <span className="text-primary font-bold flex items-center gap-1">
              <span>⛶</span> GUIDES: ACTIVE
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-secondary font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              PROG 60.00 FPS
            </span>
          </div>
        </div>

        <div
          className={`relative rounded-xl overflow-hidden bg-slate-950 border border-outline-variant/30 shadow-2xl flex items-center justify-center w-full transition-all ${
            aspectRatio === '9:16'
              ? 'aspect-[9/16] max-h-[420px]'
              : aspectRatio === '16:9'
              ? 'aspect-[16/9]'
              : 'aspect-square max-h-[360px]'
          }`}
          onClick={onTogglePlay}
        >
          {/* Top Overlays inside monitor */}
          <div className="absolute top-2 left-2 z-20 flex items-center gap-1.5 pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider bg-black/60 px-1.5 py-0.5 rounded border border-white/20">
              SCENE 03_SHOT_42
            </span>
          </div>

          <div className="absolute top-2 right-2 z-20 pointer-events-none">
            <span className="text-[10px] font-mono font-bold text-primary bg-black/60 px-1.5 py-0.5 rounded border border-primary/30">
              LUT: NEON_TOKYO_V4
            </span>
          </div>

          {/* Active Clip Render */}
          {activeMedia && (
            activeMedia.type === 'video' ? (
              <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                {activeMedia.fitMode !== 'cover' && (
                  <video
                    src={activeMedia.url}
                    className="absolute inset-0 w-full h-full object-cover blur-xl opacity-35 scale-110 pointer-events-none"
                    muted
                    playsInline
                    loop
                  />
                )}
                <video
                  src={activeMedia.url}
                  className={`w-full h-full pointer-events-none relative z-10 ${
                    activeMedia.fitMode === 'cover' ? 'object-cover' : 'object-contain'
                  }`}
                  muted
                  playsInline
                  loop
                />
              </div>
            ) : (
              <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                {activeMedia.fitMode !== 'cover' && (
                  <img
                    src={activeMedia.url}
                    alt={activeMedia.name}
                    className="absolute inset-0 w-full h-full object-cover blur-xl opacity-35 scale-110 pointer-events-none"
                  />
                )}
                <img
                  src={activeMedia.url}
                  alt={activeMedia.name}
                  className={`w-full h-full pointer-events-none relative z-10 ${
                    activeMedia.fitMode === 'cover' ? 'object-cover' : 'object-contain'
                  }`}
                />
              </div>
            )
          )}

          {/* Quick Framing Toggle Pill on Mobile Player */}
          {activeMedia && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onUpdateMediaClip(activeMedia.id, {
                  fitMode: activeMedia.fitMode === 'cover' ? 'contain' : 'cover',
                });
              }}
              className="absolute top-2 right-2 z-20 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur text-[10px] font-bold text-white border border-white/20 active:scale-95"
            >
              {activeMedia.fitMode !== 'cover' ? 'Ajustar (Sin Zoom)' : 'Rellenar (Cover)'}
            </button>
          )}

          {/* Quick Trim Button on Mobile Player */}
          {activeMedia && activeMedia.type === 'video' && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenTrimModal(activeMedia.id);
              }}
              className="absolute top-2 left-2 z-20 px-2 py-0.5 rounded-lg bg-rose-950/80 backdrop-blur text-[10px] font-bold text-rose-300 border border-rose-500/40 flex items-center gap-1 active:scale-95 shadow"
              title="Recortar pedazo del video"
            >
              <Scissors className="w-3 h-3" />
              <span>Recortar ({activeMedia.duration}s)</span>
            </button>
          )}

          {/* Subtitle Overlay (if enabled) */}
          {subtitleConfig.enabled && currentScene && (
            <div
              className="absolute text-center px-3 max-w-[90%] pointer-events-none select-none transition-all"
              style={{
                top: `${subtitleConfig.y}%`,
                left: `${subtitleConfig.x}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <span
                className="font-black px-2 py-1 rounded-lg tracking-wide leading-tight inline-block"
                style={{
                  fontSize: `${Math.max(13, subtitleConfig.fontSize * 0.75)}px`,
                  color: subtitleConfig.color,
                  backgroundColor: subtitleConfig.bgColor !== 'transparent' ? subtitleConfig.bgColor : undefined,
                  textShadow: `0 2px 4px ${subtitleConfig.outlineColor}`,
                  WebkitTextStroke: `${subtitleConfig.outlineWidth * 0.6}px ${subtitleConfig.outlineColor}`,
                }}
              >
                {currentScene.text}
              </span>
            </div>
          )}

          {/* Draggable Stickers Overlay (Mobile view) */}
          {stickers.map((stk) => (
            <div
              key={stk.id}
              className="absolute pointer-events-none flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900/80 border border-white/20 text-white text-[10px] font-bold"
              style={{
                left: `${stk.x}%`,
                top: `${stk.y}%`,
                transform: `scale(${stk.scale * 0.8})`,
              }}
            >
              <Heart className="w-3 h-3 text-red-400" />
              <span>{stk.title}</span>
            </div>
          ))}

          {/* Big Center Play/Pause Touch Indicator */}
          {!isPlaying && (
            <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40 shadow-xl">
                <Play className="w-7 h-7 text-white fill-white ml-1" />
              </div>
            </div>
          )}

          {/* Time Badge */}
          <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur px-2 py-0.5 rounded text-[10px] font-mono text-cyan-300 border border-slate-800">
            {formatTime(currentTime)} / {formatTime(totalDuration)}
          </div>
        </div>

        {/* STEREO LED DB METERS MATCHING IMAGE 4 */}
        <div className="w-full mt-2 bg-surface-container-low p-2 rounded-lg border border-outline-variant/30 space-y-1 font-mono text-[10px]">
          <div className="flex items-center gap-2">
            <span className="text-on-surface-variant w-3">L</span>
            <div className="flex-1 h-2 bg-surface-container-lowest rounded-sm overflow-hidden flex gap-0.5">
              <div className="h-full bg-emerald-400 rounded-xs" style={{ width: '68%' }} />
              <div className="h-full bg-cyan-400/40 rounded-xs flex-1" />
            </div>
            <span className="text-on-surface-variant w-7 text-right">-3.2</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-on-surface-variant w-3">R</span>
            <div className="flex-1 h-2 bg-surface-container-lowest rounded-sm overflow-hidden flex gap-0.5">
              <div className="h-full bg-emerald-400 rounded-xs" style={{ width: '64%' }} />
              <div className="h-full bg-cyan-400/40 rounded-xs flex-1" />
            </div>
            <span className="text-on-surface-variant w-7 text-right">-4.8</span>
          </div>

          <div className="flex justify-between items-center pt-0.5 text-[9px] text-on-surface-variant border-t border-outline-variant/20">
            <span>TRUE PEAK COMPLIANCE</span>
            <span className="text-secondary font-bold">-3.2 dB</span>
          </div>
        </div>
      </div>

      {/* Scrubber & Play Controls */}
      <div className="px-3.5 py-2.5 bg-slate-900 border-y border-slate-800 space-y-2.5">
        <div className="flex items-center gap-3">
          <button
            onClick={onTogglePlay}
            className="w-11 h-11 rounded-full bg-gradient-to-tr from-cyan-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shrink-0 shadow-lg active:scale-95"
            title={isPlaying ? 'Pausar' : 'Reproducir'}
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-slate-950" /> : <Play className="w-5 h-5 fill-slate-950 ml-0.5" />}
          </button>

          <div className="flex-1 space-y-1">
            <input
              type="range"
              min={0}
              max={totalDuration}
              step={0.1}
              value={currentTime}
              onChange={(e) => onSeek(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span className="text-cyan-400 font-bold">{formatTime(currentTime)}</span>
              <span>{formatTime(totalDuration)} ({totalDuration}s)</span>
            </div>
          </div>

          <button
            onClick={onRestart}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition border border-slate-700"
            title="Reiniciar desde 00:00"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* ========================================================
            BARRA DE VOLUMEN ULTRA VISIBLE EN MÓVIL (SOLUCIÓN DIRECTA)
            ======================================================== */}
        <div className="bg-slate-950 rounded-2xl p-2.5 border-2 border-cyan-500/40 shadow-lg space-y-2">
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onToggleMute}
                className={`p-2 rounded-xl transition font-bold flex items-center gap-1.5 ${
                  isMuted || volume === 0
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                }`}
                title="Silenciar / Activar sonido"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5 text-rose-400" />
                ) : (
                  <Volume2 className="w-5 h-5 text-cyan-400" />
                )}
                <span className="text-xs font-mono">{isMuted ? 'MUTE' : `${Math.round(volume * 100)}%`}</span>
              </button>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">
                  Volumen del Video
                </span>
                <span className="text-[11px] font-bold text-slate-300">
                  {isMuted ? 'Sonido silenciado' : `${Math.round(volume * 100)}% potencia`}
                </span>
              </div>
            </div>

            {/* BOTONES DIRECTOS: SUBIR Y BAJAR VOLUMEN CON TEXTO CLARO */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onVolumeChange(Math.max(0, +(volume - 0.1).toFixed(2)))}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs flex items-center gap-1 active:scale-95 border border-slate-700 shadow"
                title="Bajar volumen (-10%)"
              >
                <span className="text-sm font-black">-</span>
                <span>Bajar</span>
              </button>

              <button
                type="button"
                onClick={() => onVolumeChange(Math.min(1.5, +(volume + 0.1).toFixed(2)))}
                className="px-2.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center gap-1 active:scale-95 shadow"
                title="Subir volumen (+10%)"
              >
                <span className="text-sm font-black">+</span>
                <span>Subir</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSheet('volume')}
                className="p-1.5 rounded-xl bg-slate-800 text-cyan-400 hover:text-white border border-slate-700"
                title="Abrir panel completo de volumen"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Deslizador táctil suave de volumen */}
          <div className="flex items-center gap-2 px-1">
            <span className="text-[10px] font-mono text-slate-500">0%</span>
            <input
              type="range"
              min="0"
              max="1.5"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="flex-1 accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              title="Ajustar nivel con el deslizador"
            />
            <span className="text-[10px] font-mono text-cyan-300 font-bold">{Math.round(volume * 100)}%</span>
          </div>
        </div>

        {/* Auto-Sync Cuts Button on Mobile */}
        {onAutoSyncCuts && (
          <button
            type="button"
            onClick={() => {
              if (userPlanTier === 'basic' && onOpenUpgradeModal) {
                onOpenUpgradeModal('Auto-Sincronización de Cortes con IA');
              } else {
                onAutoSyncCuts();
              }
            }}
            disabled={isAutoSyncing}
            className={`w-full py-2 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 disabled:opacity-50 ${
              userPlanTier === 'basic'
                ? 'bg-slate-800 text-slate-200 border border-slate-700'
                : 'bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 text-slate-950'
            }`}
            title="Ajustar automáticamente los puntos de inicio y fin de los clips de video para que coincidan con las pausas detectadas en la pista de voz en off"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isAutoSyncing ? 'animate-spin' : ''}`} />
            <span>{isAutoSyncing ? 'Sincronizando con pausas...' : '⚡ Auto-Sincronizar Cortes con Voz'}</span>
            {userPlanTier === 'basic' && (
              <span className="text-[9px] bg-gradient-to-r from-amber-400 to-rose-400 text-slate-950 px-1 py-0.2 rounded font-black">
                PRO
              </span>
            )}
          </button>
        )}

        {/* Actions bar matching Stitch Image 4: Split S, Delete Del, Trim, Ripple R */}
        <div className="grid grid-cols-4 gap-1.5 pt-1 font-mono text-[11px]">
          <button
            onClick={() => onSplitClip && onSplitClip(activeMedia?.id)}
            className="py-1.5 px-2 rounded-lg bg-surface-container-high hover:bg-surface-bright text-white border border-outline-variant/40 font-bold flex items-center justify-center gap-1 active:scale-95 shadow"
          >
            <Split className="w-3.5 h-3.5 text-primary" />
            <span>Split</span>
            <span className="text-[9px] text-on-surface-variant bg-surface-container-lowest px-1 rounded">S</span>
          </button>

          <button
            onClick={() => activeMedia && onDeleteMediaClip(activeMedia.id)}
            className="py-1.5 px-2 rounded-lg bg-surface-container-high hover:bg-surface-bright text-rose-300 border border-outline-variant/40 font-bold flex items-center justify-center gap-1 active:scale-95 shadow"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Delete</span>
            <span className="text-[9px] text-on-surface-variant bg-surface-container-lowest px-1 rounded">Del</span>
          </button>

          <button
            onClick={() => activeMedia && onOpenTrimModal(activeMedia.id)}
            className="py-1.5 px-2 rounded-lg bg-surface-container-high hover:bg-surface-bright text-white border border-outline-variant/40 font-bold flex items-center justify-center gap-1 active:scale-95 shadow"
          >
            <Scissors className="w-3.5 h-3.5 text-secondary" />
            <span>Trim</span>
          </button>

          <button
            onClick={() => onAutoSyncCuts && onAutoSyncCuts()}
            className="py-1.5 px-2 rounded-lg bg-primary-container text-slate-950 font-black flex items-center justify-center gap-1 active:scale-95 shadow"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-950" />
            <span>Ripple</span>
            <span className="text-[9px] bg-slate-950/20 px-1 rounded">R</span>
          </button>
        </div>

        {/* Audio status line */}
        <div className="flex items-center justify-between text-[11px] bg-slate-950/60 px-2.5 py-1.5 rounded-lg border border-slate-800">
          <div className="flex items-center gap-1.5 truncate">
            <span className={`w-2 h-2 rounded-full ${hasAudio ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            <span className="text-slate-300 truncate font-medium">
              {customAudioName ? `Audio: ${customAudioName}` : hasAudio ? `Voz IA: ${selectedVoiceName}` : 'Sin audio aún'}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveSheet('tts')}
              className="text-cyan-400 font-bold underline"
            >
              + Voz IA
            </button>
            <button
              onClick={() => audioFileInputRef.current?.click()}
              className="text-emerald-400 font-bold underline"
            >
              + Importar
            </button>
          </div>
        </div>
      </div>

      {/* INSPECTOR MINI-DOCK MATCHING IMAGE 4 BOTTOM SECTION */}
      <div className="px-3 pb-2">
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 space-y-2.5 font-mono text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-white font-bold">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span className="truncate max-w-[200px]">INSPECTOR: {activeMedia?.name || 'HERO_CYBERPUNK_SCENE_03'}</span>
            </div>
            <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
              AUTO-COLOR ON
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-surface-container-highest p-2 rounded flex items-center justify-between">
              <div>
                <span className="text-on-surface-variant block text-[9px]">SCALE</span>
                <span className="text-white font-bold">{Math.round((activeMedia?.scale || 1) * 100)}%</span>
              </div>
              <span className="text-primary text-[9px]">SCRUB ↻</span>
            </div>

            <div className="bg-surface-container-highest p-2 rounded flex items-center justify-between">
              <div>
                <span className="text-on-surface-variant block text-[9px]">POS (X, Y)</span>
                <span className="text-white font-bold">0, 0</span>
              </div>
              <span className="text-secondary text-[9px]">PX ⛶</span>
            </div>

            <div className="bg-surface-container-highest p-2 rounded flex items-center justify-between">
              <div>
                <span className="text-on-surface-variant block text-[9px]">OPACITY</span>
                <span className="text-white font-bold">100%</span>
              </div>
              <span className="text-on-surface-variant text-[9px]">NORMAL ◒</span>
            </div>

            <div className="bg-surface-container-highest p-2 rounded flex items-center justify-between">
              <div>
                <span className="text-on-surface-variant block text-[9px]">SPEED</span>
                <span className="text-primary font-bold">1.00x</span>
              </div>
              <span className="text-primary text-[9px]">OPTICAL ⚡</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mini Sequence of Media Clips on Mobile */}
      <div className="px-3 pb-3 space-y-1.5">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span className="font-bold text-white uppercase text-[11px]">Secuencia de Clips ({mediaClips.length})</span>
          <button
            onClick={() => mediaFileInputRef.current?.click()}
            className="text-cyan-400 font-bold text-[11px] hover:underline"
          >
            + Añadir Video/Foto
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {mediaClips.map((clip, idx) => (
            <div
              key={clip.id}
              onClick={() => onOpenTransitionModal(clip.id, idx)}
              className="relative shrink-0 w-24 h-16 rounded-xl overflow-hidden border border-slate-700 bg-slate-900 group cursor-pointer"
            >
              {clip.type === 'video' ? (
                <video src={clip.url} className="w-full h-full object-cover opacity-75" />
              ) : (
                <img src={clip.url} alt={clip.name} className="w-full h-full object-cover opacity-75" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-1">
                <span className="text-[9px] font-mono text-white truncate">#{idx + 1} {clip.duration}s</span>
                <span className="text-[8px] text-amber-300 capitalize">{clip.transition}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Sticky CapCut Mobile Dock Toolbar (Matching Stitch 5-Screen System) */}
      <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-surface-container-low border-t border-outline-variant/30 z-30 px-2 py-2 flex items-center justify-around text-on-surface-variant shadow-2xl font-mono text-[10px]">
        {/* 1. Timeline */}
        <button
          onClick={() => setActiveSheet('none')}
          className={`flex flex-col items-center gap-1 transition ${
            activeSheet === 'none' ? 'text-primary font-bold' : 'hover:text-white'
          }`}
        >
          <Layers className="w-5 h-5 text-current" />
          <span>Timeline</span>
        </button>

        {/* 2. Assets */}
        <button
          onClick={() => setActiveSheet('clips')}
          className={`flex flex-col items-center gap-1 transition ${
            activeSheet === 'clips' ? 'text-primary font-bold' : 'hover:text-white'
          }`}
        >
          <Film className="w-5 h-5 text-current" />
          <span>Assets</span>
        </button>

        {/* 3. Inspector */}
        <button
          onClick={() => setActiveSheet('inspector')}
          className={`flex flex-col items-center gap-1 transition ${
            activeSheet === 'inspector' ? 'text-primary font-bold' : 'hover:text-white'
          }`}
        >
          <Sliders className="w-5 h-5 text-current" />
          <span>Inspector</span>
        </button>

        {/* 4. Gemini AI */}
        <button
          onClick={() => setActiveSheet('gemini')}
          className={`flex flex-col items-center gap-1 transition ${
            activeSheet === 'gemini' ? 'text-primary font-bold' : 'hover:text-white'
          }`}
        >
          <Sparkles className="w-5 h-5 text-current" />
          <span>Gemini AI</span>
        </button>

        {/* 5. Export Pro */}
        <button
          onClick={() => setActiveSheet('export')}
          className={`flex flex-col items-center gap-1 transition ${
            activeSheet === 'export' ? 'text-primary font-bold' : 'hover:text-white'
          }`}
        >
          <Download className="w-5 h-5 text-current" />
          <span>Export Pro</span>
        </button>
      </div>

      {/* ========================================================
          SLIDE-UP MOBILE BOTTOM SHEETS
          ======================================================== */}
      {activeSheet !== 'none' && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex flex-col justify-end">
          <div className="bg-slate-900 border-t border-slate-700 rounded-t-3xl max-h-[82vh] overflow-y-auto p-4 space-y-4 shadow-2xl animate-slideUp">
            {/* Sheet Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-sm font-black text-white uppercase tracking-wider">
                {activeSheet === 'tts' && '🎙️ Texto a Voz con IA (TTS)'}
                {activeSheet === 'audio-import' && '📁 Importar Archivo de Audio'}
                {activeSheet === 'clips' && '🎬 Gestionar Clips de Video & Fotos'}
                {activeSheet === 'subtitles' && '💬 Estilo de Subtítulos'}
                {activeSheet === 'filters' && '🎨 Filtros y Ajuste de Color'}
                {activeSheet === 'stickers' && '⭐ Stickers y Textos'}
                {activeSheet === 'volume' && '🔊 Control de Volumen & Sonido'}
              </span>
              <button
                onClick={() => setActiveSheet('none')}
                className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SHEET CONTENT: TTS */}
            {activeSheet === 'tts' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-cyan-400 font-bold">Escribe o pega el texto para el locutor:</span>
                  <button
                    onClick={onLoadOfficialScript}
                    className="text-[11px] text-teal-300 underline font-semibold"
                  >
                    Guión CCMI (18s)
                  </button>
                </div>

                <textarea
                  rows={4}
                  value={rawScriptText}
                  onChange={(e) => onChangeRawScript(e.target.value)}
                  placeholder="Escribe el texto que la voz de IA va a narrar..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-400 font-sans"
                />

                <div>
                  <span className="text-xs font-bold text-slate-300 block mb-1.5">Voz del Locutor:</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {voices.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => onSelectVoice(v.id)}
                        className={`p-2 rounded-xl border text-left text-xs font-bold ${
                          selectedVoice === v.id
                            ? 'bg-cyan-950 border-cyan-400 text-cyan-300'
                            : 'bg-slate-950 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div>{v.name} ({v.gender})</div>
                        <div className="text-[10px] text-slate-400 font-normal line-clamp-1">{v.character}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    onGenerateAudio();
                    setActiveSheet('none');
                  }}
                  disabled={isGeneratingAudio || !rawScriptText.trim()}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 font-black text-slate-950 text-sm shadow-lg active:scale-95 disabled:opacity-50"
                >
                  {isGeneratingAudio ? 'Generando Voz...' : '✨ GENERAR VOZ CON IA'}
                </button>
              </div>
            )}

            {/* SHEET CONTENT: AUDIO IMPORT */}
            {activeSheet === 'audio-import' && (
              <div className="space-y-4 text-center py-2">
                <div
                  onClick={() => audioFileInputRef.current?.click()}
                  className="border-2 border-dashed border-emerald-500/60 rounded-2xl p-6 bg-slate-950 flex flex-col items-center justify-center cursor-pointer active:scale-95"
                >
                  <Upload className="w-10 h-10 text-emerald-400 mb-2" />
                  <span className="font-black text-sm text-white">Toca aquí para seleccionar audio</span>
                  <span className="text-xs text-slate-400 mt-1">MP3, WAV, M4A o notas de voz grabadas en tu móvil</span>
                </div>

                {customAudioName && (
                  <div className="bg-slate-950 p-3 rounded-xl border border-emerald-500/40 flex items-center justify-between text-xs text-left">
                    <span className="font-bold text-white truncate max-w-[200px]">{customAudioName}</span>
                    <button
                      onClick={onSyncDurationToAudio}
                      className="text-cyan-400 underline font-semibold"
                    >
                      Ajustar duración
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* SHEET CONTENT: CLIPS */}
            {activeSheet === 'clips' && (
              <div className="space-y-3">
                <button
                  onClick={() => mediaFileInputRef.current?.click()}
                  className="w-full py-3 rounded-xl bg-cyan-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow"
                >
                  <Film className="w-4 h-4" />
                  <span>Subir Videos / Fotos desde la Galería</span>
                </button>

                {onAutoSyncCuts && (
                  <button
                    type="button"
                    onClick={() => {
                      onAutoSyncCuts();
                    }}
                    disabled={isAutoSyncing}
                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow active:scale-95 disabled:opacity-50"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isAutoSyncing ? 'animate-spin' : ''}`} />
                    <span>{isAutoSyncing ? 'Sincronizando...' : '⚡ Auto-Sincronizar Cortes con Voz en Off'}</span>
                  </button>
                )}

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {mediaClips.map((clip, idx) => (
                    <div
                      key={clip.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-mono text-cyan-400">#{idx + 1}</span>
                        <span className="font-bold text-white truncate max-w-[120px]">{clip.name}</span>
                        <span className="text-slate-400">({clip.duration}s)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {clip.type === 'video' && (
                          <button
                            onClick={() => {
                              setActiveSheet('none');
                              onOpenTrimModal(clip.id);
                            }}
                            className="px-2 py-1 rounded-lg bg-rose-950 text-rose-300 font-bold text-[10px] border border-rose-800 flex items-center gap-1 active:scale-95"
                            title="Recortar pedazo del video"
                          >
                            <Scissors className="w-2.5 h-2.5" />
                            <span>Recortar</span>
                          </button>
                        )}
                        {onDuplicateClip && (
                          <button
                            onClick={() => onDuplicateClip(clip.id)}
                            className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 active:scale-95"
                            title="Duplicar clip para recortar otro pedazo del mismo video"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => onOpenTransitionModal(clip.id, idx)}
                          className="px-2 py-1 rounded-lg bg-amber-950 text-amber-300 font-bold text-[10px] border border-amber-800"
                        >
                          Transición
                        </button>
                        {mediaClips.length > 1 && (
                          <button
                            onClick={() => onDeleteMediaClip(clip.id)}
                            className="p-1 rounded bg-rose-950 text-rose-300 text-[10px]"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SHEET CONTENT: SUBTITLES */}
            {activeSheet === 'subtitles' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Activar Subtítulos:</span>
                  <button
                    onClick={() => onUpdateSubtitleConfig({ enabled: !subtitleConfig.enabled })}
                    className={`px-3 py-1 rounded-full text-xs font-black ${
                      subtitleConfig.enabled ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {subtitleConfig.enabled ? 'ACTIVADOS' : 'DESACTIVADOS'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {SUBTITLE_STYLES.map((st) => (
                    <button
                      key={st.id}
                      onClick={() =>
                        onUpdateSubtitleConfig({
                          styleId: st.id,
                          color: st.color,
                          outlineColor: st.outlineColor,
                          outlineWidth: st.outlineWidth,
                          bgColor: st.bgColor,
                          uppercase: st.uppercase,
                          fontFamily: st.fontFamily,
                          shadowColor: st.shadowColor,
                          shadowBlur: st.shadowBlur,
                        })
                      }
                      className={`p-2.5 rounded-xl border text-left text-xs font-bold ${
                        subtitleConfig.styleId === st.id
                          ? 'border-amber-400 bg-amber-950/40 text-amber-200'
                          : 'border-slate-800 bg-slate-950 text-slate-300'
                      }`}
                    >
                      <div>{st.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{st.sample}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* SHEET CONTENT: FILTERS */}
            {activeSheet === 'filters' && (
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-300 block">Filtros de Color CapCut:</span>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  {(['normal', 'medical-clean', 'warm-human', 'cinematic', 'vibrant', 'teal-orange'] as VideoFilterSettings['preset'][]).map((p) => (
                    <button
                      key={p}
                      onClick={() => onUpdateFilterSettings({ preset: p })}
                      className={`p-2 rounded-xl border font-bold text-[11px] capitalize truncate ${
                        filterSettings.preset === p
                          ? 'bg-teal-950 border-teal-400 text-teal-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {p.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* SHEET CONTENT: STICKERS */}
            {activeSheet === 'stickers' && (
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-300 block">Stickers Clínicos Disponibles:</span>
                <div className="grid grid-cols-2 gap-2">
                  {STICKER_CATALOG.map((stk) => (
                    <button
                      key={stk.type}
                      onClick={() => {
                        onAddStickerFromCatalog(stk);
                        setActiveSheet('none');
                      }}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-left hover:border-cyan-400 text-xs"
                    >
                      <div className="font-bold text-white">{stk.title}</div>
                      <div className="text-[10px] text-slate-400">{stk.subtitle}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* SHEET CONTENT: VOLUME - CRITICAL USER REQUEST */}
            {activeSheet === 'volume' && (
              <div className="space-y-4">
                {/* Master Volume */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
                      <span>Volumen Principal (Locución & Audio)</span>
                    </span>
                    <button
                      onClick={onToggleMute}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        isMuted ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      {isMuted ? 'Silenciado' : 'Activo'}
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onVolumeChange(Math.max(0, +(volume - 0.1).toFixed(2)))}
                      className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-lg flex items-center justify-center active:scale-95 shadow"
                      title="Bajar volumen"
                    >
                      -
                    </button>
                    <div className="flex-1 space-y-1">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={isMuted ? 0 : volume}
                        onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                        className="w-full accent-cyan-400 h-2.5 bg-slate-800 rounded-lg cursor-pointer"
                      />
                      <div className="flex justify-between text-[11px] font-mono text-slate-400">
                        <span>0%</span>
                        <span className="font-bold text-cyan-400 text-xs">{isMuted ? '0% (Mudo)' : `${Math.round(volume * 100)}%`}</span>
                        <span>100%</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onVolumeChange(Math.min(1, +(volume + 0.1).toFixed(2)))}
                      className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-lg flex items-center justify-center active:scale-95 shadow"
                      title="Subir volumen"
                    >
                      +
                    </button>
                  </div>

                  {/* Quick Volume Presets */}
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    {[
                      { label: '0%', val: 0 },
                      { label: '30%', val: 0.3 },
                      { label: '70%', val: 0.7 },
                      { label: '100%', val: 1.0 },
                    ].map((p) => (
                      <button
                        key={p.label}
                        onClick={() => onVolumeChange(p.val)}
                        className={`py-1.5 rounded-lg text-xs font-bold border transition ${
                          Math.abs(volume - p.val) < 0.05 && !isMuted
                            ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Vocal Clean & DSP Studio Pre-Processing in Mobile */}
                {onApplyVocalClean && (
                  <div className="bg-slate-950 p-4 rounded-2xl border border-cyan-500/40 space-y-2.5 shadow-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-black text-white block">Filtro Limpieza de Voz (DSP)</span>
                          <span className="text-[10px] text-slate-400">Reduce ruido y ecualiza para tono profesional</span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                        vocalCleanConfig?.enabled
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {vocalCleanConfig?.enabled ? 'ACTIVO' : 'OFF'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => onApplyVocalClean('studio-pro')}
                        disabled={isCleaningVocal || !hasAudio}
                        className="p-2 rounded-xl bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-500/40 text-left active:scale-95 disabled:opacity-50"
                      >
                        <div className="font-bold text-white text-xs">✨ Estudio Pro</div>
                        <div className="text-[10px] text-cyan-300">Voz clara + Compresor</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => onApplyVocalClean('noise-reduction')}
                        disabled={isCleaningVocal || !hasAudio}
                        className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left active:scale-95 disabled:opacity-50"
                      >
                        <div className="font-bold text-white text-xs">🔇 Anti-Ruido</div>
                        <div className="text-[10px] text-slate-400">Corta zumbidos & eco</div>
                      </button>
                    </div>

                    {hasCleanedAudio && onToggleOriginalVsCleaned && (
                      <button
                        type="button"
                        onClick={onToggleOriginalVsCleaned}
                        className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-700 transition active:scale-95"
                      >
                        <span>{isShowingCleaned ? '🔊 Escuchando: Audio Limpio' : '🔈 Escuchando: Audio Original (Raw)'}</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Background Music Volume */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <Music className="w-4 h-4 text-emerald-400" />
                      <span>Música Clínica de Fondo</span>
                    </span>
                    <button
                      onClick={onToggleBgMusic}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        bgMusicEnabled ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {bgMusicEnabled ? 'ACTIVADA' : 'DESACTIVADA'}
                    </button>
                  </div>

                  {bgMusicEnabled && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onChangeBgVolume(Math.max(0, +(bgMusicVolume - 0.05).toFixed(2)))}
                        className="w-9 h-9 rounded-xl bg-slate-800 text-white font-bold text-base flex items-center justify-center active:scale-95"
                      >
                        -
                      </button>
                      <div className="flex-1 space-y-1">
                        <input
                          type="range"
                          min="0"
                          max="0.5"
                          step="0.02"
                          value={bgMusicVolume}
                          onChange={(e) => onChangeBgVolume(parseFloat(e.target.value))}
                          className="w-full accent-emerald-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] font-mono text-slate-400">
                          <span>Suave</span>
                          <span className="font-bold text-emerald-400">{Math.round((bgMusicVolume / 0.5) * 100)}%</span>
                          <span>Fuerte</span>
                        </div>
                      </div>
                      <button
                        onClick={() => onChangeBgVolume(Math.min(0.5, +(bgMusicVolume + 0.05).toFixed(2)))}
                        className="w-9 h-9 rounded-xl bg-slate-800 text-white font-bold text-base flex items-center justify-center active:scale-95"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SHEET: INSPECTOR PRO (IMAGE 3) */}
            {activeSheet === 'inspector' && (
              <div className="space-y-3 pb-2">
                <InspectorPro
                  activeClip={activeMedia || null}
                  onUpdateClip={onUpdateMediaClip}
                  vocalCleanConfig={vocalCleanConfig}
                  onApplyVocalClean={onApplyVocalClean}
                  isCleaningVocal={isCleaningVocal}
                />
              </div>
            )}

            {/* SHEET: GEMINI AI STUDIO (IMAGE 2) */}
            {activeSheet === 'gemini' && (
              <div className="space-y-3 pb-2">
                <GeminiStudioEngine
                  currentScene={currentScene}
                  selectedVoice={selectedVoice}
                  onSelectVoice={onSelectVoice}
                  onAnalyzeScene={onGenerateAudio}
                  onAutoBrollGen={onLoadOfficialScript}
                  onInjectAudio={(audioName) => {
                    setActiveSheet('none');
                  }}
                />
              </div>
            )}

            {/* SHEET: EXPORT PRO MASTER (IMAGE 1) */}
            {activeSheet === 'export' && (
              <div className="space-y-3 pb-2">
                <ExportProEngine
                  onStartRender={(res) => onExportVideo()}
                  isRendering={isExportingVideo}
                  renderProgress={exportProgress}
                  onAbort={() => setActiveSheet('none')}
                />
              </div>
            )}

            {/* Done button */}
            <button
              onClick={() => setActiveSheet('none')}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
