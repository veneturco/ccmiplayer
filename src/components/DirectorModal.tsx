import React from 'react';
import { X, Film, Sparkles, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { DirectorAnalysis, ScriptScene } from '../types';

interface DirectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: DirectorAnalysis | null;
  isLoading: boolean;
  onReanalyze: () => void;
  scenes: ScriptScene[];
}

export const DirectorModal: React.FC<DirectorModalProps> = ({
  isOpen,
  onClose,
  analysis,
  isLoading,
  onReanalyze,
  scenes,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-container-lowest/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl p-6 space-y-5 text-on-surface">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shadow-inner">
              <span className="material-symbols-outlined text-xl">movie</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-on-surface">
                  Dirección Artística & Locución IA
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-primary/15 border border-primary/30 text-[10px] font-bold text-primary uppercase">
                  STITCH AI
                </span>
              </div>
              <p className="text-xs text-on-surface-variant">
                Pautas de entonación, cadencia y respiración para CCMI / CSMI
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
            <p className="text-sm font-medium text-slate-300">
              Consultando al Director de Locución IA con Gemini...
            </p>
            <p className="text-xs text-slate-500">
              Evaluando métricas de cadencia, pausas y fonética médica.
            </p>
          </div>
        ) : analysis ? (
          <div className="space-y-4 text-xs">
            {/* Director's Master Note */}
            <div className="bg-cyan-950/40 border border-cyan-500/30 rounded-xl p-4 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Nota Principal de Dirección
              </span>
              <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
                {analysis.directorNote}
              </p>
            </div>

            {/* Pacing Overview */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">
                Cadencia y Duración Total
              </span>
              <p className="text-slate-300 leading-relaxed">
                {analysis.overallPacing}
              </p>
            </div>

            {/* Scene Feedback Breakdown */}
            {analysis.sceneFeedback && (
              <div className="space-y-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Desglose por Escena
                </span>
                <div className="space-y-2">
                  {analysis.sceneFeedback.map((fb, idx) => {
                    const scene = scenes.find((s) => s.id === fb.sceneId) || scenes[idx];
                    return (
                      <div
                        key={idx}
                        className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 space-y-1"
                      >
                        <div className="flex items-center justify-between text-slate-300 font-semibold">
                          <span>
                            Escena {scene?.sceneNumber || idx + 1}: {scene?.title}
                          </span>
                          <span className="font-mono text-cyan-400 text-[11px]">
                            {scene?.timeRange}
                          </span>
                        </div>
                        <p className="text-slate-300">
                          <strong className="text-slate-400">Tono:</strong> {fb.toneRecommendation}
                        </p>
                        {fb.breathingAdvice && (
                          <p className="text-slate-400">
                            <strong className="text-slate-400">Respiración:</strong> {fb.breathingAdvice}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-slate-400 text-xs mb-3">
              No hay análisis disponible en este momento.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onReanalyze}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Re-analizar Guión</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
