import React, { useRef, useState } from 'react';
import {
  Film, Image, Plus, Trash2, ArrowUp, ArrowDown, Type, Sparkles, Sliders, Palette,
  Eye, EyeOff, Scissors, Download, RefreshCw, Sticker, Clock, Layers, Move, CheckCircle2,
  Heart, Phone, Calendar, Star, ShieldCheck, Activity, Award, Flame, Zap, Volume2, VolumeX, Split, Copy, Crown
} from 'lucide-react';
import {
  MediaClip, SubtitleConfig, TextOverlay, StickerOverlay, VideoFilterSettings,
  AspectRatio, VoiceOption, BackgroundTextConfig, CapCutTemplate, UserPlanTier
} from '../types';
import { SUBTITLE_STYLES, STICKER_CATALOG, CAPCUT_TEMPLATES, StickerTemplate } from '../data/initialScript';

interface CapCutPanelProps {
  mediaClips: MediaClip[];
  onAddMediaClip: (clip: MediaClip) => void;
  onUpdateMediaClip: (id: string, updates: Partial<MediaClip>) => void;
  onDeleteMediaClip: (id: string) => void;
  onReorderMediaClips: (fromIndex: number, toIndex: number) => void;
  totalDuration: number;
  onChangeTotalDuration: (dur: number) => void;
  onAutoFitDuration: () => void;
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
  onApplyTemplate: (template: CapCutTemplate) => void;
  rawScriptText: string;
  onChangeRawScript: (text: string) => void;
  onLoadOfficialScript: () => void;
  onGenerateAudioAndMount: () => void;
  isGeneratingAudio: boolean;
  onExportVideo: () => void;
  isExportingVideo: boolean;
  exportProgress: number;
  selectedVoice: VoiceOption;
  onSelectVoice: (voice: VoiceOption) => void;
  onOpenTransitionModal: (clipId: string, index: number) => void;
  onOpenTrimModal: (clipId: string) => void;
  onSplitClip?: (clipId?: string, splitSecond?: number) => void;
  onDuplicateClip?: (clipId: string) => void;
  volume?: number;
  onVolumeChange?: (vol: number) => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
  onAutoSyncCuts?: () => void;
  isAutoSyncing?: boolean;
  userPlanTier?: UserPlanTier;
  onOpenUpgradeModal?: (feature?: string) => void;
}

export const CapCutPanel: React.FC<CapCutPanelProps> = ({
  mediaClips,
  onAddMediaClip,
  onUpdateMediaClip,
  onDeleteMediaClip,
  onReorderMediaClips,
  totalDuration,
  onChangeTotalDuration,
  onAutoFitDuration,
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
  onApplyTemplate,
  rawScriptText,
  onChangeRawScript,
  onLoadOfficialScript,
  onGenerateAudioAndMount,
  isGeneratingAudio,
  onExportVideo,
  isExportingVideo,
  exportProgress,
  selectedVoice,
  onSelectVoice,
  onOpenTransitionModal,
  onOpenTrimModal,
  onSplitClip,
  onDuplicateClip,
  volume,
  onVolumeChange,
  isMuted,
  onToggleMute,
  onAutoSyncCuts,
  isAutoSyncing,
  userPlanTier = 'premium',
  onOpenUpgradeModal,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'clips' | 'subtitles' | 'stickers' | 'filters' | 'templates' | 'script'>('clips');
  const [draggedClipIndex, setDraggedClipIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Upload handler for multiple videos & photos
  const handleFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file, index) => {
      const isVideo = file.type.startsWith('video');
      const url = URL.createObjectURL(file);
      const clipId = `custom-clip-${Date.now()}-${index}`;

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
            name: file.name.substring(0, 26),
            url,
            duration: initialTrimEnd,
            originalDuration: origDur,
            trimStart: 0,
            trimEnd: initialTrimEnd,
            transition: 'fade',
            transitionDuration: 0.5,
            kenBurns: false,
          };
          onAddMediaClip(newClip);
          // Automatically open TrimModal so user can select the exact fraction/pedacito of the video!
          onOpenTrimModal(clipId);
        };
        tempVideo.onerror = () => {
          const newClip: MediaClip = {
            id: clipId,
            type: 'video',
            name: file.name.substring(0, 26),
            url,
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
          name: file.name.substring(0, 26),
          url,
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

  // Drag and drop reordering handlers
  const handleDragStart = (index: number) => {
    setDraggedClipIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (index: number) => {
    if (draggedClipIndex !== null && draggedClipIndex !== index) {
      onReorderMediaClips(draggedClipIndex, index);
    }
    setDraggedClipIndex(null);
  };

  const aspectRatios: { id: AspectRatio; label: string; desc: string }[] = [
    { id: '16:9', label: '16:9', desc: 'Horizontal YouTube / TV' },
    { id: '9:16', label: '9:16', desc: 'Vertical TikTok / Reels / Shorts' },
    { id: '1:1', label: '1:1', desc: 'Cuadrado Instagram' },
    { id: '4:5', label: '4:5', desc: 'Vertical Facebook' },
  ];

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-xl space-y-5 text-on-surface">
      {/* Top Header: Aspect Ratio & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Scissors className="w-4 h-4 text-rose-400" />
            Suite de Edición CapCut
          </h3>
          <p className="text-xs text-slate-400">
            Reorganiza clips y fotos, añade stickers clínicos y personaliza
          </p>
        </div>

        {/* Aspect Ratio Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          {aspectRatios.map((r) => (
            <button
              key={r.id}
              onClick={() => onChangeAspectRatio(r.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                aspectRatio === r.id
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title={r.desc}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sub Tabs Bar */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-800/80 text-xs">
        <button
          onClick={() => setActiveSubTab('script')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold shrink-0 transition ${
            activeSubTab === 'script'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              : 'text-rose-400/80 hover:text-rose-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Voz IA & Texto</span>
        </button>

        <button
          onClick={() => setActiveSubTab('clips')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold shrink-0 transition ${
            activeSubTab === 'clips'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Film className="w-3.5 h-3.5" />
          <span>Clips ({mediaClips.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('stickers')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold shrink-0 transition ${
            activeSubTab === 'stickers'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sticker className="w-3.5 h-3.5" />
          <span>Stickers & Textos ({stickers.length + textOverlays.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('subtitles')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold shrink-0 transition ${
            activeSubTab === 'subtitles'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Type className="w-3.5 h-3.5" />
          <span>Subtítulos {subtitleConfig.enabled ? '✓' : '(Off)'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('filters')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold shrink-0 transition ${
            activeSubTab === 'filters'
              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Filtros & LUT</span>
        </button>

        <button
          onClick={() => setActiveSubTab('templates')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold shrink-0 transition ${
            activeSubTab === 'templates'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Plantillas 1-Clic</span>
        </button>
      </div>

      {/* 1. CLIPS & STATIC IMAGES TAB (With Drag and Drop Reordering!) */}
      {activeSubTab === 'clips' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-200 block">
                Orden de Videos y Fotos
              </span>
              <span className="text-[11px] text-slate-400">
                Arrastra o usa las flechas para alternar posición (1º, 2º, 3º...)
              </span>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="video/*,image/*"
              className="hidden"
              onChange={handleFilesUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir Video/Foto</span>
            </button>
          </div>

          {/* Auto-Sync Cuts to Voiceover Pauses Card */}
          {onAutoSyncCuts && (
            <div className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs shadow-md transition ${
              userPlanTier === 'basic'
                ? 'bg-slate-950/80 border-slate-800'
                : 'bg-gradient-to-r from-cyan-950/70 via-slate-950 to-teal-950/70 border-cyan-500/50'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold shadow-md shrink-0 ${
                  userPlanTier === 'basic'
                    ? 'bg-slate-800 text-amber-400 border border-slate-700'
                    : 'bg-gradient-to-br from-cyan-500 to-teal-400 text-slate-950 shadow-cyan-950/50'
                }`}>
                  <Sparkles className={`w-4 h-4 ${isAutoSyncing ? 'animate-spin' : ''}`} />
                </div>
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    Auto-Sincronización de Cortes
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                      <Crown className="w-2.5 h-2.5 text-amber-400" />
                      Google AI Pro
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Ajusta automáticamente el inicio y fin de cada clip para coincidir con las pausas de la voz en off.
                  </p>
                </div>
              </div>

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
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-black text-xs transition active:scale-95 shadow-md disabled:opacity-50 cursor-pointer ${
                  userPlanTier === 'basic'
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    : 'bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:opacity-95 text-slate-950 shadow-cyan-950/50'
                }`}
              >
                <Sparkles className={`w-3.5 h-3.5 ${isAutoSyncing ? 'animate-spin' : ''}`} />
                <span>{isAutoSyncing ? 'Sincronizando...' : '⚡ Auto-Sincronizar Cortes'}</span>
                {userPlanTier === 'basic' && (
                  <span className="text-[9px] bg-gradient-to-r from-amber-400 to-rose-400 text-slate-950 px-1 py-0.2 rounded font-black">
                    PRO
                  </span>
                )}
              </button>
            </div>
          )}

          {/* Pro Volume and Audio Mixer Card */}
          {onVolumeChange && (
            <div className="bg-slate-950 p-3 rounded-xl border border-cyan-500/40 flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onToggleMute}
                  className="text-slate-400 hover:text-white transition"
                  title="Silenciar / Activar sonido"
                >
                  {isMuted || (volume ?? 1) === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
                </button>
                <span className="font-bold text-white">Volumen de Reproducción:</span>
                <span className="font-mono text-cyan-300 font-bold">{isMuted ? '0% (MUTE)' : `${Math.round((volume ?? 1) * 100)}%`}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onVolumeChange(Math.max(0, +((volume ?? 1) - 0.1).toFixed(2)))}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1 active:scale-95 border border-slate-700"
                  title="Bajar volumen (-10%)"
                >
                  <span>-</span>
                  <span>Bajar</span>
                </button>
                <button
                  type="button"
                  onClick={() => onVolumeChange(Math.min(1.5, +((volume ?? 1) + 0.1).toFixed(2)))}
                  className="px-2 py-1 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1 active:scale-95 shadow"
                  title="Subir volumen (+10%)"
                >
                  <span>+</span>
                  <span>Subir</span>
                </button>
                <input
                  type="range"
                  min="0"
                  max="1.5"
                  step="0.05"
                  value={isMuted ? 0 : (volume ?? 1)}
                  onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                  className="w-24 accent-cyan-400 h-1.5 bg-slate-800 rounded cursor-pointer ml-1"
                />
              </div>
            </div>
          )}

          {/* Draggable Clips List */}
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {mediaClips.map((clip, index) => (
              <React.Fragment key={clip.id}>
                <div
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={() => handleDrop(index)}
                className={`bg-slate-950/80 border rounded-xl p-3 flex items-center justify-between gap-2.5 text-xs transition cursor-grab active:cursor-grabbing ${
                  draggedClipIndex === index
                    ? 'border-cyan-400 bg-cyan-950/40 opacity-70'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden flex-1">
                  <div className="flex items-center gap-1 text-slate-500 font-bold shrink-0">
                    <Move className="w-3.5 h-3.5 text-slate-600" />
                    <span className="w-4 text-center">{index + 1}º</span>
                  </div>

                  <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                    {clip.type === 'video' ? (
                      <Film className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <Image className="w-4 h-4 text-amber-400" />
                    )}
                  </div>

                  <div className="truncate flex-1">
                    <div className="font-semibold text-white truncate">{clip.name}</div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-2 flex-wrap">
                      <span className="uppercase font-bold text-cyan-300">
                        {clip.type === 'video' ? 'Video' : 'Foto Estática'}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateMediaClip(clip.id, {
                            fitMode: clip.fitMode === 'cover' ? 'contain' : 'cover',
                          })
                        }
                        className={`px-1.5 py-0.2 rounded text-[10px] font-semibold border ${
                          clip.fitMode === 'cover'
                            ? 'bg-slate-800 text-slate-400 border-slate-700'
                            : 'bg-cyan-950 text-cyan-300 border-cyan-700 font-bold'
                        }`}
                        title="Cambiar entre ver completo sin zoom y llenar pantalla"
                      >
                        {clip.fitMode === 'cover' ? 'Llenar' : 'Ajustar (Sin Zoom)'}
                      </button>
                      {clip.type === 'video' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenTrimModal(clip.id);
                          }}
                          className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-slate-950 border border-rose-500/40 flex items-center gap-1 transition shadow-sm"
                          title="Recortar pedazo: seleccionar inicio y fin de este video"
                        >
                          <Scissors className="w-2.5 h-2.5" />
                          <span>Recortar ({clip.trimStart ? `${clip.trimStart}s` : '0s'} - {clip.trimEnd ? `${clip.trimEnd}s` : `${clip.duration}s`})</span>
                        </button>
                      )}
                      {onDuplicateClip && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDuplicateClip(clip.id);
                          }}
                          className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 flex items-center gap-1 transition"
                          title="Duplicar este clip para recortar otro pedazo del mismo video"
                        >
                          <Copy className="w-2.5 h-2.5" />
                          <span>Duplicar</span>
                        </button>
                      )}
                      {clip.type === 'image' && (
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={clip.kenBurns || false}
                            onChange={(e) => onUpdateMediaClip(clip.id, { kenBurns: e.target.checked })}
                            className="rounded accent-cyan-400"
                          />
                          <span>Ken Burns (Zoom)</span>
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Duration input */}
                  <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded border border-slate-800 text-[11px]">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={clip.duration}
                      onChange={(e) =>
                        onUpdateMediaClip(clip.id, { duration: Math.max(1, parseInt(e.target.value) || 1) })
                      }
                      className="w-8 bg-transparent text-center font-bold text-cyan-300 focus:outline-none"
                    />
                    <span className="text-slate-500">s</span>
                  </div>

                  {/* Move Up/Down Quick buttons */}
                  <div className="flex flex-col gap-0.5">
                    <button
                      disabled={index === 0}
                      onClick={() => onReorderMediaClips(index, index - 1)}
                      className="p-1 text-slate-400 hover:text-white disabled:opacity-20 rounded hover:bg-slate-800"
                      title="Mover arriba (antes)"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      disabled={index === mediaClips.length - 1}
                      onClick={() => onReorderMediaClips(index, index + 1)}
                      className="p-1 text-slate-400 hover:text-white disabled:opacity-20 rounded hover:bg-slate-800"
                      title="Mover abajo (después)"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Delete Clip */}
                  <button
                    disabled={mediaClips.length <= 1}
                    onClick={() => onDeleteMediaClip(clip.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 transition disabled:opacity-20"
                    title="Eliminar clip"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Transition Connector Button between adjacent clips */}
              {index < mediaClips.length - 1 && (
                <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800/60 rounded-lg px-3 py-1.5 my-1 text-xs">
                  <div className="flex items-center gap-1.5 text-amber-300 font-semibold text-[11px]">
                    <span className="w-4 h-4 rounded bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-[10px]">⚡</span>
                    <span className="capitalize">{clip.transition || 'fade'}</span>
                    <span className="text-slate-400 font-mono">({clip.transitionDuration || 0.5}s)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenTransitionModal(clip.id, index)}
                    className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold hover:bg-amber-500 hover:text-slate-950 transition"
                  >
                    Cambiar Transición
                  </button>
                </div>
              )}
            </React.Fragment>
          ))}
          </div>

          {/* Project Duration Controls */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-semibold text-slate-300 block">Duración Total del Video:</span>
              <span className="text-slate-500 text-[11px]">Actualmente en {totalDuration} segundos</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={5}
                max={180}
                value={totalDuration}
                onChange={(e) => onChangeTotalDuration(Math.max(5, parseInt(e.target.value) || 5))}
                className="w-14 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-center font-bold text-white focus:outline-none"
              />
              <button
                onClick={onAutoFitDuration}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-semibold border border-slate-700"
                title="Ajustar automáticamente a la suma de clips"
              >
                Auto-ajustar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. REAL STICKERS CATALOG & FLOATING TEXTS TAB */}
      {activeSubTab === 'stickers' && (
        <div className="space-y-4">
          {/* Sticker Catalog */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Sticker className="w-3.5 h-3.5" />
                Catálogo de Stickers Médicos & Llamados (1 Clic)
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
              {STICKER_CATALOG.map((stk, i) => (
                <button
                  key={i}
                  onClick={() => onAddStickerFromCatalog(stk)}
                  className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/70 hover:border-emerald-500/60 hover:bg-slate-900 text-left transition group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      style={{ backgroundColor: `${stk.color}20`, borderColor: `${stk.color}40`, color: stk.color }}
                      className="w-6 h-6 rounded-lg border flex items-center justify-center shrink-0"
                    >
                      {stk.iconType === 'heart' && <Heart className="w-3.5 h-3.5 fill-current" />}
                      {stk.iconType === 'doctor' && <Activity className="w-3.5 h-3.5" />}
                      {stk.iconType === 'clock' && <Clock className="w-3.5 h-3.5" />}
                      {stk.iconType === 'iso' && <Award className="w-3.5 h-3.5" />}
                      {stk.iconType === 'ambulance' && <Film className="w-3.5 h-3.5" />}
                      {stk.iconType === 'phone' && <Phone className="w-3.5 h-3.5" />}
                      {stk.iconType === 'calendar' && <Calendar className="w-3.5 h-3.5" />}
                      {stk.iconType === 'star' && <Star className="w-3.5 h-3.5 fill-current" />}
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                      {stk.badgeTag}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-white truncate">{stk.title}</div>
                  {stk.subtitle && (
                    <div className="text-[10px] text-slate-400 truncate">{stk.subtitle}</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Active Stickers on Canvas */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-300 block">
              Stickers Activos en Pantalla ({stickers.length})
            </span>
            {stickers.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic">
                No hay stickers añadidos. Toca cualquiera del catálogo superior para insertarlo.
              </p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {stickers.map((stk) => (
                  <div
                    key={stk.id}
                    className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      <div>
                        <div className="font-bold text-white">{stk.title}</div>
                        <div className="text-[10px] text-slate-400">
                          Posición: ({stk.x}%, {stk.y}%)
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => onDeleteSticker(stk.id)}
                      className="p-1 text-slate-500 hover:text-rose-400"
                      title="Eliminar sticker"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Custom Floating Text Overlays */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">
                Textos Personalizados Libres ({textOverlays.length})
              </span>
              <button
                onClick={onAddTextOverlay}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition"
              >
                <Plus className="w-3 h-3" />
                <span>Añadir Texto Libre</span>
              </button>
            </div>

            <div className="space-y-2">
              {textOverlays.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) => onUpdateTextOverlay(item.id, { text: e.target.value })}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-bold"
                    />
                    <button
                      onClick={() => onDeleteTextOverlay(item.id)}
                      className="p-1 text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1">
                      <span>Color:</span>
                      <input
                        type="color"
                        value={item.color}
                        onChange={(e) => onUpdateTextOverlay(item.id, { color: e.target.value })}
                        className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <span>Tamaño:</span>
                      <input
                        type="number"
                        min={12}
                        max={60}
                        value={item.fontSize}
                        onChange={(e) => onUpdateTextOverlay(item.id, { fontSize: parseInt(e.target.value) || 20 })}
                        className="w-12 bg-slate-900 border border-slate-700 rounded px-1 text-center text-white"
                      />
                    </div>
                    <span className="text-cyan-400 font-mono">({item.x}%, {item.y}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Background Text (Watermark / Big Cinematic Behind Text) */}
          <div className="pt-2 border-t border-slate-800 bg-slate-950 p-3 rounded-xl border space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Texto Gigante de Fondo (Cinematic)</span>
                <span className="text-[11px] text-slate-400">Marca o título estético en segundo plano</span>
              </div>
              <button
                onClick={() => onUpdateBackgroundText({ enabled: !backgroundText.enabled })}
                className={`px-2.5 py-1 rounded text-xs font-bold ${
                  backgroundText.enabled ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {backgroundText.enabled ? 'ACTIVO' : 'INACTIVO'}
              </button>
            </div>

            {backgroundText.enabled && (
              <div className="flex items-center gap-2 pt-1 text-xs">
                <input
                  type="text"
                  value={backgroundText.text}
                  onChange={(e) => onUpdateBackgroundText({ text: e.target.value })}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white uppercase font-black"
                  placeholder="Ej: CCMI SALUD"
                />
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <span>Opacidad:</span>
                  <input
                    type="range"
                    min={0.05}
                    max={0.4}
                    step={0.05}
                    value={backgroundText.opacity}
                    onChange={(e) => onUpdateBackgroundText({ opacity: parseFloat(e.target.value) })}
                    className="w-16 accent-cyan-400"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. SUBTITLES & TYPOGRAPHY TAB */}
      {activeSubTab === 'subtitles' && (
        <div className="space-y-4">
          {/* Main ON / OFF toggle */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white block">Mostrar Subtítulos en Pantalla</span>
              <span className="text-[11px] text-slate-400">
                {subtitleConfig.enabled ? 'Subtítulos activados y visibles' : 'Subtítulos desactivados completamente'}
              </span>
            </div>
            <button
              onClick={() => onUpdateSubtitleConfig({ enabled: !subtitleConfig.enabled })}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                subtitleConfig.enabled
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-950/40'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
              }`}
            >
              {subtitleConfig.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{subtitleConfig.enabled ? 'ACTIVADOS' : 'DESACTIVADOS'}</span>
            </button>
          </div>

          {/* Subtitle Styles Grid */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Estilos de Subtítulo Virales (CapCut Presets)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SUBTITLE_STYLES.map((st) => {
                const isSelected = subtitleConfig.styleId === st.id;
                return (
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
                    className={`p-2.5 rounded-xl border text-left transition ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/60 shadow-md shadow-cyan-950/40'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                    }`}
                  >
                    <div
                      style={{
                        color: st.color,
                        backgroundColor: st.bgColor !== 'transparent' ? st.bgColor : '#0f172a',
                        WebkitTextStroke: st.outlineWidth > 0 ? `1px ${st.outlineColor}` : undefined,
                      }}
                      className="py-1 px-2 rounded text-xs font-black text-center mb-1 drop-shadow"
                    >
                      {st.sample}
                    </div>
                    <span className="text-[11px] font-semibold text-slate-300 block truncate">
                      {st.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subtitle Size & Position Sliders */}
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Tamaño de Letra ({subtitleConfig.fontSize}px)</span>
              <input
                type="range"
                min={16}
                max={44}
                value={subtitleConfig.fontSize}
                onChange={(e) => onUpdateSubtitleConfig({ fontSize: parseInt(e.target.value) })}
                className="w-32 accent-cyan-400"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Posición Vertical ({subtitleConfig.y}%)</span>
              <input
                type="range"
                min={10}
                max={92}
                value={subtitleConfig.y}
                onChange={(e) => onUpdateSubtitleConfig({ y: parseInt(e.target.value) })}
                className="w-32 accent-cyan-400"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Posición Horizontal ({subtitleConfig.x}%)</span>
              <input
                type="range"
                min={15}
                max={85}
                value={subtitleConfig.x}
                onChange={(e) => onUpdateSubtitleConfig({ x: parseInt(e.target.value) })}
                className="w-32 accent-cyan-400"
              />
            </div>

            <p className="text-[10px] text-cyan-300/80 italic">
              💡 Recuerda: También puedes hacer clic y arrastrar los subtítulos directamente con el ratón sobre el video.
            </p>
          </div>
        </div>
      )}

      {/* 4. FILTERS & COLOR GRADING TAB */}
      {activeSubTab === 'filters' && (
        <div className="space-y-4">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Filtros Cinemáticos & Quirúrgicos
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { id: 'normal', name: 'Original', br: 1.0, ct: 1.0, sat: 1.0, wm: 0 },
              { id: 'medical-clean', name: 'Clínico Impecable', br: 1.05, ct: 1.15, sat: 0.95, wm: -5 },
              { id: 'teal-orange', name: 'Teal & Orange Cine', br: 1.0, ct: 1.25, sat: 1.3, wm: 10 },
              { id: 'warm-human', name: 'Cálido Humano', br: 1.05, ct: 1.05, sat: 1.15, wm: 15 },
              { id: 'emerald-care', name: 'Esmeralda Salud', br: 1.02, ct: 1.1, sat: 1.2, wm: -10 },
              { id: 'vibrant', name: 'Vibrante Redes', br: 1.05, ct: 1.1, sat: 1.4, wm: 0 },
              { id: 'bw-drama', name: 'Blanco y Negro HD', br: 1.0, ct: 1.3, sat: 0, wm: 0 },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() =>
                  onUpdateFilterSettings({
                    preset: f.id as any,
                    brightness: f.br,
                    contrast: f.ct,
                    saturation: f.sat,
                    warmth: f.wm,
                  })
                }
                className={`p-2.5 rounded-xl border text-center font-bold transition ${
                  filterSettings.preset === f.id
                    ? 'bg-teal-500/20 text-teal-300 border-teal-500/50'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                {f.name}
              </button>
            ))}
          </div>

          {/* Fine Tuning Sliders */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Brillo ({Math.round(filterSettings.brightness * 100)}%)</span>
              <input
                type="range"
                min={0.6}
                max={1.4}
                step={0.05}
                value={filterSettings.brightness}
                onChange={(e) => onUpdateFilterSettings({ brightness: parseFloat(e.target.value) })}
                className="w-32 accent-teal-400"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Contraste ({Math.round(filterSettings.contrast * 100)}%)</span>
              <input
                type="range"
                min={0.6}
                max={1.5}
                step={0.05}
                value={filterSettings.contrast}
                onChange={(e) => onUpdateFilterSettings({ contrast: parseFloat(e.target.value) })}
                className="w-32 accent-teal-400"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Saturación ({Math.round(filterSettings.saturation * 100)}%)</span>
              <input
                type="range"
                min={0}
                max={2}
                step={0.1}
                value={filterSettings.saturation}
                onChange={(e) => onUpdateFilterSettings({ saturation: parseFloat(e.target.value) })}
                className="w-32 accent-teal-400"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Temperatura Cálida / Fría ({filterSettings.warmth > 0 ? `+${filterSettings.warmth}` : filterSettings.warmth})</span>
              <input
                type="range"
                min={-30}
                max={30}
                step={2}
                value={filterSettings.warmth}
                onChange={(e) => onUpdateFilterSettings({ warmth: parseInt(e.target.value) })}
                className="w-32 accent-teal-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* 5. 1-CLICK CAPCUT TEMPLATES */}
      {activeSubTab === 'templates' && (
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-purple-400 block">
            Plantillas Automáticas de Producción
          </label>
          <div className="space-y-2.5">
            {CAPCUT_TEMPLATES.map((tmpl) => (
              <div
                key={tmpl.id}
                className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 hover:border-purple-500/50 transition flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-purple-400" />
                    {tmpl.name}
                  </h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">{tmpl.description}</p>
                  <div className="flex gap-2 mt-2 text-[10px] font-semibold text-purple-300">
                    <span className="bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800">
                      Formato: {tmpl.aspectRatio}
                    </span>
                    <span className="bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800">
                      Duración: {tmpl.duration}s
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onApplyTemplate(tmpl)}
                  className="px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shrink-0 transition shadow-md shadow-purple-950/40"
                >
                  Aplicar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. QUICK SCRIPT & IA TTS TAB */}
      {activeSubTab === 'script' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-rose-400">
              Pega tu Guión para Voz con IA
            </label>
            <button
              onClick={onLoadOfficialScript}
              className="text-[11px] text-teal-400 hover:text-teal-300 underline font-medium"
            >
              Cargar Guión CCMI (18s)
            </button>
          </div>

          <textarea
            rows={4}
            value={rawScriptText}
            onChange={(e) => onChangeRawScript(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-cyan-500 leading-relaxed font-sans"
            placeholder="Pega cualquier escrito aquí..."
          />

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Voz:</span>
              <select
                value={selectedVoice}
                onChange={(e) => onSelectVoice(e.target.value as VoiceOption)}
                className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-cyan-300 font-semibold focus:outline-none"
              >
                <option value="Kore">Kore (Femenina Cálida)</option>
                <option value="Zephyr">Zephyr (Masculina Confiable)</option>
                <option value="Puck">Puck (Juvenil Dinámica)</option>
                <option value="Charon">Charon (Solemne)</option>
                <option value="Fenrir">Fenrir (Clínica Precisa)</option>
              </select>
            </div>

            <button
              onClick={onGenerateAudioAndMount}
              disabled={isGeneratingAudio || !rawScriptText.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md transition disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGeneratingAudio ? 'animate-spin' : ''}`} />
              <span>{isGeneratingAudio ? 'Sintetizando...' : 'Generar Voz IA'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Render Big Export Button */}
      <div className="pt-2 border-t border-slate-800">
        <button
          onClick={onExportVideo}
          disabled={isExportingVideo}
          className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 via-rose-500 to-cyan-500 hover:opacity-95 text-slate-950 shadow-xl shadow-rose-950/30 flex items-center justify-center gap-2 transition active:scale-[0.99] disabled:opacity-50"
        >
          {isExportingVideo ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Renderizando Video CapCut ({exportProgress}%)...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Renderizar & Exportar Video Completo</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
