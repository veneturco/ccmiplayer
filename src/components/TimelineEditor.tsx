import React, { useState, useRef } from 'react';
import { Layers, Music, Mic, Film, Image, Split, ArrowLeft, ArrowRight, Magnet, Scissors } from 'lucide-react';
import { ScriptScene, MediaClip, UserPlanTier } from '../types';
import { useEditorShortcuts } from '../hooks/useEditorShortcuts';

interface TimelineEditorProps {
  mediaClips: MediaClip[];
  scenes: ScriptScene[];
  currentTime: number;
  totalDuration: number;
  onSeek: (seconds: number) => void;
  activeSceneId: string;
  onSelectScene: (sceneId: string) => void;
  bgMusicEnabled: boolean;
  onOpenTransitionModal: (clipId: string, index: number) => void;
  onOpenAudioTab?: () => void;
  customAudioName?: string | null;
  onOpenTrimModal?: (clipId: string) => void;
  onSplitClip?: (clipId?: string, splitSecond?: number) => void;
  onDuplicateClip?: (clipId: string) => void;
  onTrimLeft?: (clipId?: string) => void;
  onTrimRight?: (clipId?: string) => void;
  onAutoSyncCuts?: () => void;
  isAutoSyncing?: boolean;
  userPlanTier?: UserPlanTier;
  onOpenUpgradeModal?: (feature?: string) => void;
  // Nuevas props para Drag & Drop y Teclado
  onReorderMediaClips?: (fromIndex: number, toIndex: number) => void;
  onDeleteActiveClip?: () => void;
  onTogglePlay?: () => void;
}

export const TimelineEditor: React.FC<TimelineEditorProps> = ({
  mediaClips,
  scenes,
  currentTime,
  totalDuration,
  onSeek,
  activeSceneId,
  onSelectScene,
  bgMusicEnabled,
  onOpenTransitionModal,
  onOpenAudioTab,
  customAudioName,
  onOpenTrimModal,
  onSplitClip,
  onDuplicateClip,
  onTrimLeft,
  onTrimRight,
  onAutoSyncCuts,
  isAutoSyncing,
  userPlanTier = 'premium',
  onOpenUpgradeModal,
  onReorderMediaClips,
  onDeleteActiveClip,
  onTogglePlay,
}) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isSnappingEnabled, setIsSnappingEnabled] = useState(true);
  const [draggedClipIndex, setDraggedClipIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Registro de Atajos de teclado (Space = Play, S = Split, Backspace/Del = Delete)
  useEditorShortcuts({
    onTogglePlay: onTogglePlay || (() => {}),
    onSplitClip: () => onSplitClip && onSplitClip(),
    onDeleteActiveClip: () => onDeleteActiveClip && onDeleteActiveClip(),
  });

  // Generar marcas de la regla de tiempo
  const step = totalDuration <= 20 ? 2 : totalDuration <= 60 ? 5 : 10;
  const rulerMarks: number[] = [];
  for (let s = 0; s <= totalDuration; s += step) {
    rulerMarks.push(s);
  }

  // Motor Magnético (Snapping)
  const calculateSnap = (targetTime: number): number => {
    if (!isSnappingEnabled) return targetTime;

    const SNAP_TOLERANCE = 0.4; // Segundos de imantación
    const snapPoints = new Set<number>([0, totalDuration]);

    let acc = 0;
    mediaClips.forEach((c) => {
      acc += c.duration;
      snapPoints.add(acc);
    });
    scenes.forEach((s) => {
      snapPoints.add(s.startSeconds);
      snapPoints.add(s.endSeconds);
    });

    let closestTime = targetTime;
    let minDiff = SNAP_TOLERANCE;

    snapPoints.forEach((pt) => {
      const diff = Math.abs(pt - targetTime);
      if (diff < minDiff) {
        minDiff = diff;
        closestTime = pt;
      }
    });

    return closestTime;
  };

  // Lógica de interacción con el cabezal (Scrubbing)
  const updatePlayhead = (e: React.PointerEvent) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const ratio = clickX / rect.width;
    const targetTime = ratio * totalDuration;
    onSeek(calculateSnap(targetTime));
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    updatePlayhead(e);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (e.buttons !== 1) return; // Solo si se mantiene presionado el click
    updatePlayhead(e);
  };

  // Motor Drag & Drop de Clips
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedClipIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(null);
    if (draggedClipIndex !== null && draggedClipIndex !== index && onReorderMediaClips) {
      onReorderMediaClips(draggedClipIndex, index);
    }
    setDraggedClipIndex(null);
  };

  const playheadPercent = Math.min(100, Math.max(0, (currentTime / totalDuration) * 100));

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 shadow-xl select-none text-on-surface">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-xl">layers</span>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            Línea de Tiempo ({totalDuration}s)
          </h3>
        </div>

        {/* Acciones de Edición Rápidas */}
        <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800 text-xs">
          {/* Toggle Imantación */}
          <button
            type="button"
            onClick={() => setIsSnappingEnabled(!isSnappingEnabled)}
            className={`p-1.5 rounded-lg font-bold transition active:scale-95 shadow-sm text-[11px] ${
              isSnappingEnabled
                ? 'bg-cyan-900/50 text-cyan-400 border border-cyan-700/60'
                : 'text-slate-500 hover:text-slate-400'
            }`}
            title="Imantación Magnética de Cabezal"
          >
            <Magnet className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onSplitClip && onSplitClip()}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 font-bold transition active:scale-95 shadow-sm text-[11px]"
            title="Dividir clip (Atajo: S)"
          >
            <Split className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Dividir (S)</span>
          </button>
          <button
            type="button"
            onClick={() => onTrimLeft && onTrimLeft()}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-yellow-950/80 hover:bg-yellow-900 text-yellow-300 border border-yellow-700/60 font-bold transition active:scale-95 shadow-sm text-[11px]"
            title="Cortar inicio"
          >
            <ArrowLeft className="w-3 h-3 text-yellow-400" />
            <span className="hidden sm:inline">Cortar In</span>
          </button>
          <button
            type="button"
            onClick={() => onTrimRight && onTrimRight()}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 font-bold transition active:scale-95 shadow-sm text-[11px]"
            title="Cortar fin"
          >
            <ArrowRight className="w-3 h-3 text-emerald-400" />
            <span className="hidden sm:inline">Cortar Out</span>
          </button>
        </div>
      </div>

      <div className="relative">
        {/* Regla Temporal */}
        <div className="h-6 relative border-b border-slate-800 text-[10px] font-mono text-slate-400 flex items-center">
          {rulerMarks.map((sec) => {
            const leftPercent = (sec / totalDuration) * 100;
            return (
              <div
                key={sec}
                className="absolute -translate-x-1/2 flex flex-col items-center"
                style={{ left: `${leftPercent}%` }}
              >
                <span>{sec}s</span>
                <div className="h-1.5 w-px bg-slate-700 mt-0.5" />
              </div>
            );
          })}
        </div>

        {/* Contenedor Principal (Scrubber) */}
        <div
          ref={timelineRef}
          className="relative mt-2 space-y-2 cursor-col-resize pb-2"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
        >
          {/* TRACK 1: Video y Fotos (DRAGGABLE) + Transiciones */}
          <div className="relative h-11 bg-slate-950/70 rounded-xl border border-slate-800/80 overflow-hidden flex items-center px-1">
            <div className="absolute left-2 text-[10px] uppercase font-bold text-slate-500 tracking-wider pointer-events-none z-10 flex items-center gap-1">
              <Film className="w-3 h-3 text-cyan-400" />
              Medios
            </div>

            {(() => {
              let clipAcc = 0;
              return mediaClips.map((clip, index) => {
                const clipStart = clipAcc;
                clipAcc += clip.duration;
                const leftPercent = (clipStart / totalDuration) * 100;
                const widthPercent = (clip.duration / totalDuration) * 100;
                const isCurrent = currentTime >= clipStart && currentTime < clipAcc;
                const isDragged = draggedClipIndex === index;
                const isDragOver = dragOverIndex === index;
                const isLastClip = index === mediaClips.length - 1;

                return (
                  <React.Fragment key={clip.id}>
                    {/* Bloque Clip Drag & Drop */}
                    <div
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, index)}
                      onPointerDown={(e) => e.stopPropagation()} // Previene scrub al arrastrar
                      style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}
                      className={`absolute h-8 top-1.5 rounded-lg px-2 flex items-center justify-between text-xs transition border overflow-hidden cursor-grab active:cursor-grabbing ${
                        isDragged
                          ? 'opacity-40 border-dashed border-cyan-400 scale-95'
                          : isDragOver
                          ? 'ring-2 ring-rose-400 scale-[1.02] z-20'
                          : isCurrent
                          ? 'bg-cyan-600/90 border-cyan-300 text-white shadow-md z-10'
                          : 'bg-slate-850 hover:bg-slate-800 border-slate-700/80 text-slate-300'
                      }`}
                      title={`${clip.name} (${clip.duration}s)`}
                    >
                      <div className="flex items-center gap-1 truncate text-[11px] font-semibold">
                        {clip.type === 'video' ? (
                          <Film className="w-3 h-3 text-cyan-300 shrink-0" />
                        ) : (
                          <Image className="w-3 h-3 text-amber-300 shrink-0" />
                        )}
                        <span className="truncate">{clip.name}</span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {clip.type === 'video' && onOpenTrimModal && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenTrimModal(clip.id);
                            }}
                            className="p-0.5 rounded bg-black/40 hover:bg-rose-500 hover:text-slate-950 text-rose-300 transition"
                            title="Recortar clip"
                          >
                            <Scissors className="w-2.5 h-2.5" />
                          </button>
                        )}
                        <span className="text-[10px] opacity-75">{clip.duration}s</span>
                      </div>
                    </div>

                    {/* Transition Pill Badge Between Clips */}
                    {!isLastClip && onOpenTransitionModal && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenTransitionModal(clip.id, index);
                        }}
                        style={{ left: `calc(${((clipStart + clip.duration) / totalDuration) * 100}% - 9px)` }}
                        className="absolute h-6 w-5 top-2.5 rounded-md bg-amber-500/90 hover:bg-amber-400 text-slate-950 flex items-center justify-center text-[10px] font-extrabold z-20 shadow-md transition hover:scale-110 active:scale-95 border border-amber-300 cursor-pointer"
                        title={`Editar transición: ${clip.transition} (${clip.transitionDuration}s)`}
                      >
                        ⚡
                      </button>
                    )}
                  </React.Fragment>
                );
              });
            })()}
          </div>

          {/* TRACK 2: Audio IA / Voz */}
          <div className="relative h-11 bg-slate-950/70 rounded-xl border border-slate-800/80 overflow-hidden flex items-center px-1">
            <div className="absolute left-2 text-[10px] uppercase font-bold text-slate-400 tracking-wider z-10 flex items-center gap-1.5 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800 pointer-events-auto">
              <Mic className="w-3 h-3 text-teal-400" />
              <span className="truncate max-w-[140px] text-white">
                {customAudioName ? `Audio: ${customAudioName}` : 'Voz en Off (IA)'}
              </span>
            </div>
            {scenes.map((scene) => {
              const leftPercent = (scene.startSeconds / totalDuration) * 100;
              const widthPercent = ((scene.endSeconds - scene.startSeconds) / totalDuration) * 100;
              const isCurrent = currentTime >= scene.startSeconds && currentTime < scene.endSeconds;
              return (
                <div
                  key={scene.id}
                  style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}
                  className={`absolute h-8 top-1.5 rounded-lg px-2 flex items-center justify-between text-xs transition border overflow-hidden ${
                    isCurrent
                      ? 'bg-teal-600/90 border-teal-300 text-white shadow-md z-10'
                      : 'bg-slate-850 border-slate-700 text-slate-400'
                  }`}
                >
                  <span className="truncate text-[11px] font-medium">
                    E{scene.sceneNumber}: {scene.title}
                  </span>
                </div>
              );
            })}
          </div>

          {/* TRACK 3: BGM */}
          <div className="relative h-7 bg-slate-950/70 rounded-xl border border-slate-800/80 overflow-hidden flex items-center px-3">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 pointer-events-none">
              <Music className={`w-3 h-3 ${bgMusicEnabled ? 'text-indigo-400' : 'text-slate-600'}`} />
              <span className={bgMusicEnabled ? 'text-indigo-300' : 'text-slate-500'}>
                {bgMusicEnabled ? 'Música de Fondo (Auto-Ducking Activo)' : 'Silenciada'}
              </span>
            </div>
          </div>

          {/* Aguja Playhead (Stitch Electric Cyan Needle) */}
          <div
            className="absolute top-0 bottom-0 pointer-events-none z-30 flex flex-col items-center transition-[left] duration-75"
            style={{ left: `${playheadPercent}%` }}
          >
            <div className="w-3.5 h-3.5 bg-primary rotate-45 -mt-1 shadow-md shadow-primary/60 border border-slate-950" />
            <div className="w-0.5 h-full bg-primary shadow-[0_0_12px_rgba(0,229,255,0.9)]" />
          </div>
        </div>
      </div>
    </div>
  );
};
