import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check, Zap, Clock, Layers, Sliders, Play, RotateCcw, Film, Eye, Image as ImageIcon } from 'lucide-react';
import { ClipTransitionType, MediaClip } from '../types';
import { TRANSITION_PRESETS } from '../data/initialScript';

interface TransitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  clip: MediaClip | null;
  clipIndex: number;
  nextClipName?: string;
  nextClipUrl?: string;
  onApplyTransition: (clipId: string, transition: ClipTransitionType, duration: number) => void;
  onApplyToAllClips: (transition: ClipTransitionType, duration: number) => void;
}

// Two high-contrast, visually unmistakable photographic reference scenes:
// Scene 1: Emergency ambulance arrival (cool blue/cyan outdoor daylight)
const DEMO_PHOTO_1 = 'https://images.unsplash.com/photo-1587745416684-47953f16f02f?auto=format&fit=crop&w=400&q=80';
// Scene 2: Friendly doctor with smiling patient (warm golden/amber clinical room)
const DEMO_PHOTO_2 = 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=400&q=80';

// Mini Animated Transition Cinema Thumbnail
const AnimatedTransitionIcon: React.FC<{
  type: ClipTransitionType;
  isSelected: boolean;
  photo1Url?: string;
  photo2Url?: string;
}> = ({
  type,
  isSelected,
  photo1Url = DEMO_PHOTO_1,
  photo2Url = DEMO_PHOTO_2,
}) => {
  return (
    <div
      className={`relative w-16 h-11 rounded-lg overflow-hidden border shrink-0 bg-slate-950 flex items-center justify-center shadow-md select-none ${
        isSelected ? 'border-cyan-400 ring-2 ring-cyan-400/50 shadow-cyan-950/50' : 'border-slate-800'
      }`}
    >
      {/* Layer 1: First Scene (Ambulance / Urgencias - Cool Blue) */}
      <div
        style={{ backgroundImage: `url(${photo1Url})` }}
        className="absolute inset-0 bg-cover bg-center flex items-end p-0.5"
      >
        <span className="bg-blue-950/90 text-cyan-200 border border-blue-500/50 text-[8px] font-black px-1 py-0.2 rounded leading-none shadow">
          🚑 1
        </span>
      </div>

      {/* Layer 2: Second Scene (Doctor & Paciente - Warm Golden) with CSS animations */}
      {type === 'fade' && (
        <div
          style={{ backgroundImage: `url(${photo2Url})` }}
          className="absolute inset-0 bg-cover bg-center flex items-end p-0.5 animate-[fadeLoop_2.2s_ease-in-out_infinite]"
        >
          <span className="bg-amber-950/90 text-amber-200 border border-amber-500/50 text-[8px] font-black px-1 py-0.2 rounded leading-none shadow">
            👨‍⚕️ 2
          </span>
        </div>
      )}

      {type === 'flash-white' && (
        <>
          <div
            style={{ backgroundImage: `url(${photo2Url})` }}
            className="absolute inset-0 bg-cover bg-center flex items-end p-0.5 animate-[toggleB_2.2s_steps(1)_infinite]"
          >
            <span className="bg-amber-950/90 text-amber-200 border border-amber-500/50 text-[8px] font-black px-1 py-0.2 rounded leading-none shadow">
              👨‍⚕️ 2
            </span>
          </div>
          <div className="absolute inset-0 bg-white animate-[flashWhite_2.2s_ease-in-out_infinite] pointer-events-none" />
        </>
      )}

      {type === 'flash-black' && (
        <>
          <div
            style={{ backgroundImage: `url(${photo2Url})` }}
            className="absolute inset-0 bg-cover bg-center flex items-end p-0.5 animate-[toggleB_2.2s_steps(1)_infinite]"
          >
            <span className="bg-amber-950/90 text-amber-200 border border-amber-500/50 text-[8px] font-black px-1 py-0.2 rounded leading-none shadow">
              👨‍⚕️ 2
            </span>
          </div>
          <div className="absolute inset-0 bg-black animate-[flashBlack_2.2s_ease-in-out_infinite] pointer-events-none" />
        </>
      )}

      {type === 'zoom-in' && (
        <div
          style={{ backgroundImage: `url(${photo2Url})` }}
          className="absolute inset-0 bg-cover bg-center flex items-end p-0.5 animate-[zoomInLoop_2.2s_ease-out_infinite]"
        >
          <span className="bg-amber-950/90 text-amber-200 border border-amber-500/50 text-[8px] font-black px-1 py-0.2 rounded leading-none shadow">
            👨‍⚕️ 2
          </span>
        </div>
      )}

      {type === 'zoom-out' && (
        <div
          style={{ backgroundImage: `url(${photo2Url})` }}
          className="absolute inset-0 bg-cover bg-center flex items-end p-0.5 animate-[zoomOutLoop_2.2s_ease-out_infinite]"
        >
          <span className="bg-amber-950/90 text-amber-200 border border-amber-500/50 text-[8px] font-black px-1 py-0.2 rounded leading-none shadow">
            👨‍⚕️ 2
          </span>
        </div>
      )}

      {type === 'slide-left' && (
        <div
          style={{ backgroundImage: `url(${photo2Url})` }}
          className="absolute inset-0 bg-cover bg-center flex items-end p-0.5 animate-[slideLeftLoop_2.2s_cubic-bezier(0.4,0,0.2,1)_infinite]"
        >
          <span className="bg-amber-950/90 text-amber-200 border border-amber-500/50 text-[8px] font-black px-1 py-0.2 rounded leading-none shadow">
            👨‍⚕️ 2
          </span>
        </div>
      )}

      {type === 'slide-right' && (
        <div
          style={{ backgroundImage: `url(${photo2Url})` }}
          className="absolute inset-0 bg-cover bg-center flex items-end p-0.5 animate-[slideRightLoop_2.2s_cubic-bezier(0.4,0,0.2,1)_infinite]"
        >
          <span className="bg-amber-950/90 text-amber-200 border border-amber-500/50 text-[8px] font-black px-1 py-0.2 rounded leading-none shadow">
            👨‍⚕️ 2
          </span>
        </div>
      )}

      {type === 'blur-fade' && (
        <div
          style={{ backgroundImage: `url(${photo2Url})` }}
          className="absolute inset-0 bg-cover bg-center flex items-end p-0.5 animate-[blurFadeLoop_2.2s_ease-in-out_infinite]"
        >
          <span className="bg-amber-950/90 text-amber-200 border border-amber-500/50 text-[8px] font-black px-1 py-0.2 rounded leading-none shadow">
            👨‍⚕️ 2
          </span>
        </div>
      )}

      {type === 'glitch' && (
        <div
          style={{ backgroundImage: `url(${photo2Url})` }}
          className="absolute inset-0 bg-cover bg-center flex items-end p-0.5 animate-[glitchLoop_2.2s_steps(2)_infinite]"
        >
          <span className="bg-amber-950/90 text-amber-200 border border-amber-500/50 text-[8px] font-black px-1 py-0.2 rounded leading-none shadow">
            👨‍⚕️ 2
          </span>
        </div>
      )}

      {type === 'none' && (
        <div
          style={{ backgroundImage: `url(${photo2Url})` }}
          className="absolute inset-0 bg-cover bg-center flex items-end p-0.5 animate-[toggleB_2.2s_steps(1)_infinite]"
        >
          <span className="bg-amber-950/90 text-amber-200 border border-amber-500/50 text-[8px] font-black px-1 py-0.2 rounded leading-none shadow">
            👨‍⚕️ 2
          </span>
        </div>
      )}

      {/* Top Tag Icon */}
      <div className="absolute top-0.5 right-0.5 px-1 py-0.2 rounded bg-black/80 backdrop-blur text-[8px] text-white z-10 font-bold border border-white/20 pointer-events-none">
        {type === 'none' && 'Corte'}
        {type === 'fade' && 'Fade'}
        {type === 'flash-white' && 'Flash'}
        {type === 'flash-black' && 'Negro'}
        {type === 'zoom-in' && 'Zoom +'}
        {type === 'zoom-out' && 'Zoom -'}
        {type === 'slide-left' && 'Slide ◀'}
        {type === 'slide-right' && 'Slide ▶'}
        {type === 'blur-fade' && 'Blur'}
        {type === 'glitch' && 'Glitch'}
      </div>
    </div>
  );
};

export const TransitionModal: React.FC<TransitionModalProps> = ({
  isOpen,
  onClose,
  clip,
  clipIndex,
  nextClipName,
  nextClipUrl,
  onApplyTransition,
  onApplyToAllClips,
}) => {
  const [selectedType, setSelectedType] = useState<ClipTransitionType>(clip?.transition || 'fade');
  const [duration, setDuration] = useState<number>(clip?.transitionDuration || 0.5);
  const [previewPhase, setPreviewPhase] = useState<'scene1' | 'transition' | 'scene2'>('scene1');
  const [useProjectClips, setUseProjectClips] = useState<boolean>(false);

  useEffect(() => {
    if (clip) {
      setSelectedType(clip.transition || 'fade');
      setDuration(clip.transitionDuration || 0.5);
    }
  }, [clip]);

  // Loop simulation between Scene 1 and Scene 2
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setPreviewPhase((prev) => {
        if (prev === 'scene1') return 'transition';
        if (prev === 'transition') return 'scene2';
        return 'scene1';
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [isOpen, selectedType, duration]);

  if (!isOpen || !clip) return null;

  // Active preview images
  const activeImg1 = useProjectClips && clip.url ? clip.url : DEMO_PHOTO_1;
  const activeImg2 = useProjectClips && nextClipUrl ? nextClipUrl : DEMO_PHOTO_2;
  const label1 = useProjectClips ? `Clip #${clipIndex + 1}: ${clip.name}` : 'Toma 1: Urgencias & Ambulancia (Azul)';
  const label2 = useProjectClips ? `Clip #${clipIndex + 2}: ${nextClipName || 'Siguiente'}` : 'Toma 2: Doctor & Paciente (Cálido)';

  const categories = ['Básicas', 'Luz & Color', 'Movimiento', 'Efectos'] as const;

  const handleApplySingle = () => {
    onApplyTransition(clip.id, selectedType, duration);
    onClose();
  };

  const handleApplyAll = () => {
    onApplyToAllClips(selectedType, duration);
    onClose();
  };

  const handleManualReplay = () => {
    setPreviewPhase('scene1');
    setTimeout(() => setPreviewPhase('transition'), 400);
    setTimeout(() => setPreviewPhase('scene2'), 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      {/* Sizing adjusted comfortably for desktop, tablet and mobile */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 shrink-0 bg-slate-900/95">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-rose-500 flex items-center justify-center text-slate-950 font-bold shadow-md">
              <Zap className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                Selector de Transiciones CapCut
              </h3>
              <p className="text-xs text-slate-400 truncate max-w-[280px] sm:max-w-md">
                Transición entre Clip #{clipIndex + 1} ({clip.name}) {nextClipName ? `y "${nextClipName}"` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 scrollbar-thin">
          {/* 1. Live Interactive Visual Preview Theater with Real Contrasting Photos */}
          <div className="bg-slate-950 rounded-2xl p-3.5 border border-slate-800/90 space-y-2.5 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-black text-white uppercase text-[11px] flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5 text-cyan-400" />
                Demostración Visual en Movimiento (Toma 1 ➔ Toma 2)
              </span>

              {/* Toggle: Demo Photos vs Project Clips */}
              <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[10px]">
                <button
                  type="button"
                  onClick={() => setUseProjectClips(false)}
                  className={`px-2 py-0.5 rounded font-bold transition ${
                    !useProjectClips ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Fotos de Alto Contraste (Recomendado)
                </button>
                <button
                  type="button"
                  onClick={() => setUseProjectClips(true)}
                  className={`px-2 py-0.5 rounded font-bold transition ${
                    useProjectClips ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Clips del Proyecto
                </button>
              </div>
            </div>

            {/* Screen Simulator Window */}
            <div className="relative h-36 sm:h-44 w-full rounded-xl overflow-hidden border border-slate-800 bg-black flex items-center justify-center shadow-inner group">
              {/* Scene 1 (Ambulance / Urgencias - Cool Blue) */}
              <div
                style={{ backgroundImage: `url(${activeImg1})` }}
                className={`absolute inset-0 bg-cover bg-center transition-all duration-500 ${
                  previewPhase === 'scene2' ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-2.5">
                  <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-950/90 border border-blue-400/50 text-white font-bold text-xs w-fit shadow">
                    <span>🚑</span>
                    <span>{label1}</span>
                  </div>
                </div>
              </div>

              {/* Scene 2 (Doctor & Patient - Warm Golden) */}
              <div
                style={{ backgroundImage: `url(${activeImg2})` }}
                className={`absolute inset-0 bg-cover bg-center transition-all duration-500 ${
                  previewPhase === 'scene2' ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-2.5">
                  <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-950/90 border border-amber-400/50 text-white font-bold text-xs w-fit shadow">
                    <span>👨‍⚕️</span>
                    <span>{label2}</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Transition Overlay FX */}
              {previewPhase === 'transition' && selectedType === 'flash-white' && (
                <div className="absolute inset-0 bg-white animate-ping opacity-95 z-20 pointer-events-none" />
              )}
              {previewPhase === 'transition' && selectedType === 'flash-black' && (
                <div className="absolute inset-0 bg-black opacity-95 z-20 pointer-events-none transition-opacity duration-300" />
              )}
              {previewPhase === 'transition' && selectedType === 'fade' && (
                <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-xs z-20 pointer-events-none" />
              )}
              {previewPhase === 'transition' && selectedType === 'blur-fade' && (
                <div className="absolute inset-0 backdrop-blur-lg bg-cyan-950/30 z-20 pointer-events-none" />
              )}
              {previewPhase === 'transition' && selectedType === 'glitch' && (
                <div className="absolute inset-0 bg-cyan-500/20 mix-blend-color-dodge z-20 pointer-events-none animate-pulse" />
              )}

              {/* Floating Status & Replay Button */}
              <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-2">
                <span className="bg-slate-950/85 backdrop-blur px-2.5 py-1 rounded-lg text-[10px] font-mono text-cyan-300 border border-slate-700 shadow">
                  Efecto: <strong>{selectedType}</strong> ({duration}s)
                </span>
                <button
                  type="button"
                  onClick={handleManualReplay}
                  className="p-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 shadow transition"
                  title="Repetir animación ahora"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                </button>
              </div>

              {/* Active Step Indicator Pill */}
              <div className="absolute top-2.5 left-2.5 z-20 bg-slate-950/85 backdrop-blur px-2 py-0.5 rounded text-[10px] font-bold text-white border border-slate-700">
                {previewPhase === 'scene1' && 'Paso: 1. Mostrando Ambulancia'}
                {previewPhase === 'transition' && `Paso: ⚡ Transición (${selectedType})`}
                {previewPhase === 'scene2' && 'Paso: 2. Mostrando Doctor'}
              </div>
            </div>
          </div>

          {/* 2. Transition Duration Slider */}
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Duración del Efecto de Transición
              </span>
              <span className="font-mono text-cyan-300 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                {duration.toFixed(1)} segundos
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[10px] text-slate-500 font-mono">0.2s</span>
              <input
                type="range"
                min={0.2}
                max={1.5}
                step={0.1}
                value={duration}
                onChange={(e) => setDuration(parseFloat(e.target.value))}
                className="flex-1 accent-cyan-400 h-2 bg-slate-800 rounded cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 font-mono">1.5s</span>
            </div>

            {/* Quick Presets */}
            <div className="flex gap-1.5 justify-center pt-1">
              {[0.3, 0.5, 0.8, 1.0, 1.2].map((quick) => (
                <button
                  key={quick}
                  type="button"
                  onClick={() => setDuration(quick)}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold border transition ${
                    duration === quick
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {quick}s
                </button>
              ))}
            </div>
          </div>

          {/* 3. Transitions Grid with Live Animated Real-Photo Thumbnails */}
          <div className="space-y-4">
            {categories.map((cat) => {
              const presetsInCat = TRANSITION_PRESETS.filter((p) => p.category === cat);
              if (presetsInCat.length === 0) return null;

              return (
                <div key={cat} className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                    {cat}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {presetsInCat.map((preset) => {
                      const isSelected = selectedType === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setSelectedType(preset.id)}
                          className={`p-2.5 rounded-xl border text-left transition flex items-center gap-3 group ${
                            isSelected
                              ? 'bg-cyan-950/70 border-cyan-400 shadow-md shadow-cyan-950/40 text-white ring-1 ring-cyan-400/40'
                              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                          }`}
                        >
                          {/* Animated Movement Cinema Thumbnail using realistic contrasting photos */}
                          <AnimatedTransitionIcon
                            type={preset.id}
                            isSelected={isSelected}
                            photo1Url={activeImg1}
                            photo2Url={activeImg2}
                          />

                          <div className="flex-1 overflow-hidden min-w-0">
                            <div className="font-bold text-xs flex items-center justify-between">
                              <span className="truncate group-hover:text-cyan-300 transition">{preset.name}</span>
                              {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0 ml-1" />}
                            </div>
                            <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5 leading-snug">
                              {preset.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/95 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <button
            onClick={handleApplyAll}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition"
            title="Aplica esta misma transición a todos los cortes del video"
          >
            Aplicar a TODOS los Clips
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleApplySingle}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-black text-xs shadow-md transition active:scale-95"
            >
              Aplicar Transición
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
