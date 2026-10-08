import React from 'react';
import { X, Sparkles, Check, Crown, Zap, Mic, Film, Scissors, Type, ShieldCheck, ArrowRight, Wand2 } from 'lucide-react';
import { UserPlanTier } from '../types';

interface PremiumUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: UserPlanTier;
  onSelectTier: (tier: UserPlanTier) => void;
  featureRequested?: string | null;
}

export const PremiumUpgradeModal: React.FC<PremiumUpgradeModalProps> = ({
  isOpen,
  onClose,
  currentTier,
  onSelectTier,
  featureRequested,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-surface-container-lowest/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6 text-on-surface">
        {/* Glow ambient background */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-surface-container text-on-surface-variant hover:text-on-surface transition"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-black uppercase tracking-wider">
            <span className="material-symbols-outlined text-base">workspace_premium</span>
            <span>Planes de Estudio • 100% Ecosistema Google</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {featureRequested ? (
              <>
                Desbloquea <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-400 to-cyan-400">"{featureRequested}"</span> con el Plan Premium
              </>
            ) : (
              <>
                Elige tu Nivel de Edición: <span className="text-cyan-400">Básico</span> o <span className="text-amber-400">PRO (Google AI)</span>
              </>
            )}
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
            Todas las funciones de IA están potenciadas exclusivamente con tu suscripción de <strong>Google / Gemini API</strong>, sin costes de herramientas externas.
          </p>
        </div>

        {/* Dual Plans Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* PLAN BÁSICO */}
          <div
            className={`rounded-2xl p-5 border transition flex flex-col justify-between ${
              currentTier === 'basic'
                ? 'bg-slate-950/80 border-cyan-500/60 ring-2 ring-cyan-500/30'
                : 'bg-slate-950/50 border-slate-800'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-sm text-white">Plan Básico</h3>
                  <span className="text-[11px] text-slate-400">Edición local completa</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                  Sin IA
                </span>
              </div>

              <div className="text-xl font-black text-cyan-400">
                0% Coste <span className="text-xs text-slate-500 font-normal">/ Local GPU</span>
              </div>

              <ul className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800/80">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Editor CapCut (Dividir, Cortar, Duplicar)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Transiciones, Filtros LUT y Color</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Importar tus propios audios MP3/WAV</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Limpieza de Voz DSP & EQ local</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Subtítulos y Stickers manuales</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Exportación de video en 720p HD</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => {
                onSelectTier('basic');
                onClose();
              }}
              className={`mt-4 w-full py-2.5 rounded-xl font-bold text-xs transition active:scale-95 ${
                currentTier === 'basic'
                  ? 'bg-slate-800 text-cyan-300 border border-cyan-500/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {currentTier === 'basic' ? '✓ Plan Actual Activo' : 'Seleccionar Modo Básico'}
            </button>
          </div>

          {/* PLAN PREMIUM GOOGLE AI */}
          <div
            className={`rounded-2xl p-5 border transition flex flex-col justify-between relative overflow-hidden ${
              currentTier === 'premium'
                ? 'bg-gradient-to-b from-amber-950/40 via-slate-950 to-slate-950 border-amber-400 ring-2 ring-amber-400/50 shadow-lg'
                : 'bg-gradient-to-b from-amber-950/20 via-slate-950 to-slate-950 border-amber-500/50'
            }`}
          >
            <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-rose-500 text-slate-950 font-black text-[9px] px-3 py-0.5 rounded-bl-lg uppercase tracking-wider">
              Google AI Pro
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-sm text-white flex items-center gap-1.5">
                    <span>Plan Premium</span>
                    <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  </h3>
                  <span className="text-[11px] text-amber-300/80">Todo de Básico + Google AI</span>
                </div>
              </div>

              <div className="text-xl font-black text-amber-400 flex items-baseline gap-1">
                Plan Google <span className="text-xs text-slate-400 font-normal">/ Incluido</span>
              </div>

              <ul className="space-y-2 text-xs text-slate-200 pt-2 border-t border-slate-800/80">
                <li className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span><strong>gemini-3.8-flash-tts</strong>: Locución ultra-realista</span>
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span><strong>Auto-Sincronización de Cortes con IA</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span><strong>Generador de Guiones con Gemini</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span><strong>Director IA de Ritmo y Cadencia</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span><strong>Exportación 1080p Full HD</strong> sin marcas</span>
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Modulación emocional de tono y estilo</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => {
                onSelectTier('premium');
                onClose();
              }}
              className={`mt-4 w-full py-2.5 rounded-xl font-black text-xs transition active:scale-95 shadow-md flex items-center justify-center gap-1.5 ${
                currentTier === 'premium'
                  ? 'bg-amber-400 text-slate-950 shadow-amber-400/20'
                  : 'bg-gradient-to-r from-amber-400 via-rose-500 to-pink-500 text-slate-950 hover:opacity-95'
              }`}
            >
              <Crown className="w-3.5 h-3.5 fill-slate-950" />
              <span>{currentTier === 'premium' ? '✓ Plan Premium Activado' : 'Activar Modo Premium (Google AI)'}</span>
            </button>
          </div>
        </div>

        {/* Guarantee Banner */}
        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>
            <strong>Garantía 100% Google</strong>: No se realizan llamadas a APIs de OpenAI, ElevenLabs ni servicios externos. Tu proyecto opera exclusivamente con tu cuenta de Google Cloud y Gemini.
          </span>
        </div>
      </div>
    </div>
  );
};
