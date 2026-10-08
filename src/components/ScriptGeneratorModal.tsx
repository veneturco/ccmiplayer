import React, { useState } from 'react';
import { X, Sparkles, RefreshCw, Wand2, Clock, MessageSquare, Check, ArrowRight } from 'lucide-react';
import { ScriptScene } from '../types';

interface ScriptGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyGeneratedScript: (fullScript: string, generatedScenes?: ScriptScene[], duration?: number) => void;
}

export const ScriptGeneratorModal: React.FC<ScriptGeneratorModalProps> = ({
  isOpen,
  onClose,
  onApplyGeneratedScript,
}) => {
  const [topic, setTopic] = useState<string>('Atención médica y quirúrgica con calidez humana, tecnología de punta y seguridad');
  const [duration, setDuration] = useState<number>(18);
  const [tone, setTone] = useState<string>('Cálido, empático y humano');
  const [audience, setAudience] = useState<string>('Pacientes y familias buscando atención médica confiable');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedResult, setGeneratedResult] = useState<{
    fullScript: string;
    scenes: Array<{
      sceneNumber: number;
      timeRange: string;
      startSeconds: number;
      endSeconds: number;
      text: string;
      title: string;
      highlightWords: string[];
    }>;
  } | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsLoading(true);

    try {
      const response = await fetch('/api/script/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          durationSeconds: duration,
          tone,
          targetAudience: audience,
        }),
      });

      const data = await response.json();
      if (data.fullScript) {
        setGeneratedResult(data);
      }
    } catch (err) {
      console.error('Error generating script:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (!generatedResult) return;
    const formattedScenes: ScriptScene[] = generatedResult.scenes.map((s, idx) => ({
      id: `scene-${Date.now()}-${idx}`,
      sceneNumber: s.sceneNumber,
      timeRange: s.timeRange,
      startSeconds: s.startSeconds,
      endSeconds: s.endSeconds,
      text: s.text,
      title: s.title,
      category: idx === 0 ? 'cuidado' : idx === 1 ? 'atencion' : 'instalaciones',
      highlightWords: s.highlightWords || [],
      visualTag: s.title,
    }));

    onApplyGeneratedScript(generatedResult.fullScript, formattedScenes, duration);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-surface-container-lowest/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl relative overflow-hidden space-y-5 text-on-surface max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-surface-container text-on-surface-variant hover:text-on-surface transition"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-black shadow-lg">
            <span className="material-symbols-outlined text-xl">auto_fix_high</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-on-surface">Generador de Guiones con IA</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/15 border border-primary/30 text-primary uppercase">
                STITCH • GEMINI 3.8
              </span>
            </div>
            <p className="text-xs text-on-surface-variant">
              Crea un guión médico publicitario profesional cronometrado a la medida.
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
              Tema, Campaña o Idea Clave:
            </label>
            <textarea
              rows={2}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ej: Cirugía segura, atención de urgencias 24/7 con empatía y tecnología médica moderna..."
              className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl p-3 text-xs text-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Duración:</span>
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value, 10))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none"
              >
                <option value={15}>15 segundos (Spot Redes)</option>
                <option value={18}>18 segundos (Oficial CCMI)</option>
                <option value={30}>30 segundos (Comercial TV)</option>
                <option value={45}>45 segundos (Institucional)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Tono de Locución:
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none"
              >
                <option value="Cálido, empático y humano">Cálido y Humano</option>
                <option value="Institucional, formal y riguroso">Institucional y Prestigioso</option>
                <option value="Dinámico, entusiasta y moderno">Dinámico y Comercial</option>
                <option value="Sereno, tranquilizador y pacífico">Sereno y Confiable</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading || !topic.trim()}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>Generando Guión con Gemini 3.8 Flash...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>GENERAR GUIÓN CON GOOGLE AI</span>
              </>
            )}
          </button>
        </div>

        {/* Results Preview */}
        {generatedResult && (
          <div className="bg-slate-950 p-4 rounded-2xl border border-cyan-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-white flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" />
                Guión Generado ({generatedResult.scenes.length} escenas)
              </span>
              <span className="text-[10px] font-mono text-cyan-400">{duration} segundos</span>
            </div>

            <p className="text-xs text-slate-300 bg-slate-900/80 p-3 rounded-xl border border-slate-800 leading-relaxed font-sans">
              "{generatedResult.fullScript}"
            </p>

            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {generatedResult.scenes.map((sc, i) => (
                <div key={i} className="text-[11px] p-2 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start justify-between gap-2">
                  <div>
                    <span className="font-bold text-cyan-300">E{sc.sceneNumber}: {sc.title}</span>
                    <p className="text-slate-400 line-clamp-1">{sc.text}</p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 shrink-0">{sc.timeRange}</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleApply}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95"
            >
              <span>Aplicar Guión y Escenas al Proyecto</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
