import React, { useState } from 'react';
import { Play, Pause, Sparkles, Check, Clock, Download, Edit3, Volume2, AlertTriangle } from 'lucide-react';
import { ScriptScene } from '../types';

interface SceneListProps {
  scenes: ScriptScene[];
  activeSceneId: string;
  onSelectScene: (id: string) => void;
  onUpdateSceneText: (id: string, text: string) => void;
  onGenerateSceneAudio: (scene: ScriptScene) => Promise<void>;
  generatingSceneId: string | null;
  onPlaySingleScene: (scene: ScriptScene) => void;
  playingSingleSceneId: string | null;
  onDownloadSceneAudio: (scene: ScriptScene) => void;
}

export const SceneList: React.FC<SceneListProps> = ({
  scenes,
  activeSceneId,
  onSelectScene,
  onUpdateSceneText,
  onGenerateSceneAudio,
  generatingSceneId,
  onPlaySingleScene,
  playingSingleSceneId,
  onDownloadSceneAudio,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>('');

  const startEdit = (scene: ScriptScene) => {
    setEditingId(scene.id);
    setEditText(scene.text);
  };

  const saveEdit = (id: string) => {
    onUpdateSceneText(id, editText);
    setEditingId(null);
  };

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-xl space-y-4 text-on-surface">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            Escenas del Guión y Locución
          </h3>
          <p className="text-xs text-slate-400">
            Segmentos sincronizados para CCMI / CSMI
          </p>
        </div>
        <span className="text-xs text-cyan-400 font-semibold bg-cyan-950/70 border border-cyan-800/60 px-2.5 py-1 rounded-lg">
          4 Escenas + Pausa Sonora
        </span>
      </div>

      <div className="space-y-3">
        {scenes.map((scene) => {
          const isActive = scene.id === activeSceneId;
          const isGeneratingThis = generatingSceneId === scene.id;
          const isPlayingThis = playingSingleSceneId === scene.id;
          const duration = scene.endSeconds - scene.startSeconds;
          const words = scene.text.trim().split(/\s+/).length;
          const wpm = Math.round((words / duration) * 60);
          const isFastPace = wpm > 240;

          return (
            <div
              key={scene.id}
              onClick={() => onSelectScene(scene.id)}
              className={`rounded-xl p-4 border transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-850 border-cyan-500 shadow-md shadow-cyan-950/30'
                  : 'bg-slate-950/60 hover:bg-slate-850/60 border-slate-800'
              }`}
            >
              {/* Scene top bar */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold text-xs border border-cyan-500/30">
                    Escena {scene.sceneNumber}
                  </span>
                  <span className="font-mono text-xs font-semibold text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    {scene.timeRange} ({duration}s)
                  </span>
                  <span className="text-xs font-medium text-slate-200">
                    {scene.title}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Pacing indicator */}
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-mono flex items-center gap-1 ${
                      isFastPace
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    }`}
                    title={isFastPace ? 'Ritmo acelerado para locución; se recomienda hablar fluido o reducir palabras' : 'Ritmo óptimo de locución'}
                  >
                    {isFastPace && <AlertTriangle className="w-2.5 h-2.5 text-amber-400" />}
                    {words} pal / {wpm} wpm
                  </span>

                  {/* Play audio clip button if generated */}
                  {scene.audioBase64 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlaySingleScene(scene);
                      }}
                      className="p-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 transition"
                      title={isPlayingThis ? 'Pausar escena' : 'Escuchar audio de escena'}
                    >
                      {isPlayingThis ? <Pause className="w-3.5 h-3.5 fill-cyan-300" /> : <Play className="w-3.5 h-3.5 fill-cyan-300 ml-0.5" />}
                    </button>
                  )}

                  {/* Download single clip */}
                  {scene.audioBase64 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDownloadSceneAudio(scene);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                      title="Descargar audio WAV de esta escena"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Generate audio for this scene button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onGenerateSceneAudio(scene);
                    }}
                    disabled={isGeneratingThis}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 hover:border-cyan-500/40 text-xs font-medium transition disabled:opacity-50"
                    title="Generar locución de esta escena con gemini-3.8-flash-tts"
                  >
                    <Sparkles className={`w-3 h-3 ${isGeneratingThis ? 'animate-spin text-cyan-400' : ''}`} />
                    <span>{isGeneratingThis ? 'Generando...' : scene.audioBase64 ? 'Regenerar' : 'Generar'}</span>
                  </button>
                </div>
              </div>

              {/* Text area / editor */}
              {editingId === scene.id ? (
                <div className="mt-2 space-y-2" onClick={(e) => e.stopPropagation()}>
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-900 border border-cyan-500 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-2.5 py-1 rounded text-xs text-slate-400 hover:text-white"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => saveEdit(scene.id)}
                      className="px-3 py-1 rounded bg-cyan-500 text-slate-950 font-semibold text-xs flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" /> Guardar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="group/text flex items-start justify-between gap-2 mt-1">
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                    &ldquo;{scene.text}&rdquo;
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEdit(scene);
                    }}
                    className="opacity-0 group-hover/text:opacity-100 p-1 text-slate-400 hover:text-white transition shrink-0"
                    title="Editar texto del guión"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Key highlighted words */}
              <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                <span className="text-[10px] uppercase font-bold text-slate-500">
                  Énfasis clínico:
                </span>
                {scene.highlightWords.map((word, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800/80 text-cyan-300 border border-slate-700/60"
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
