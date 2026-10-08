import React, { useRef, useState } from 'react';
import {
  Mic, Upload, Sparkles, Volume2, Music, CheckCircle2, Play, Pause, RefreshCw,
  FileAudio, Clock, Sliders, AlertCircle, Trash2, Copy, FileText, ChevronRight,
  Zap, Activity, ShieldCheck, Waves, Filter, ArrowRightLeft, Radio, Crown, Wand2
} from 'lucide-react';
import { VoicePreset, VoiceOption, VocalCleanConfig, VocalCleanPreset, UserPlanTier } from '../types';
import { STYLE_PRESETS, VOCAL_CLEAN_PRESETS } from '../data/initialScript';

interface AudioHubProps {
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
  customAudioName: string | null;
  onResetAudio: () => void;
  hasAudio: boolean;
  masterAudioUrl: string | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  totalDuration: number;
  onSyncDurationToAudio: () => void;
  vocalCleanConfig: VocalCleanConfig;
  onUpdateVocalCleanConfig: (cfg: Partial<VocalCleanConfig>) => void;
  onApplyVocalClean: (presetId?: VocalCleanPreset) => Promise<void>;
  isCleaningVocal: boolean;
  hasCleanedAudio: boolean;
  isShowingCleaned: boolean;
  onToggleOriginalVsCleaned: () => void;
  userPlanTier?: UserPlanTier;
  onOpenUpgradeModal?: (feature?: string) => void;
  onOpenScriptGenerator?: () => void;
}

export const AudioHub: React.FC<AudioHubProps> = ({
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
  customAudioName,
  onResetAudio,
  hasAudio,
  masterAudioUrl,
  isPlaying,
  onTogglePlay,
  totalDuration,
  onSyncDurationToAudio,
  vocalCleanConfig,
  onUpdateVocalCleanConfig,
  onApplyVocalClean,
  isCleaningVocal,
  hasCleanedAudio,
  isShowingCleaned,
  onToggleOriginalVsCleaned,
  userPlanTier = 'premium',
  onOpenUpgradeModal,
  onOpenScriptGenerator,
}) => {
  const [activeMode, setActiveMode] = useState<'tts' | 'import' | 'clean'>('tts');
  const [showAdvancedEQ, setShowAdvancedEQ] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const wordCount = rawScriptText.trim() ? rawScriptText.trim().split(/\s+/).length : 0;
  const charCount = rawScriptText.length;
  // Estimated reading time at ~130 WPM
  const estimatedSeconds = Math.max(1, Math.round((wordCount / 130) * 60));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportAudioFile(file);
    }
    if (e.target) e.target.value = '';
  };

  const handleQuickPasteSample = (text: string) => {
    onChangeRawScript(text);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-5">
      {/* Top Banner: Unmissable Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-teal-400 to-emerald-400 flex items-center justify-center text-slate-950 font-black shadow-md shadow-cyan-950/40">
            <Mic className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              Locución & Centro de Audio
            </h3>
            <p className="text-xs text-slate-400">
              Transforma texto a voz con IA o importa tu archivo de audio grabado
            </p>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-stretch sm:self-auto overflow-x-auto">
          <button
            onClick={() => setActiveMode('tts')}
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              activeMode === 'tts'
                ? 'bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>1. Texto a Voz (IA)</span>
            <span className="text-[9px] px-1 py-0.2 rounded font-black bg-amber-400 text-slate-950">
              PRO
            </span>
          </button>

          <button
            onClick={() => setActiveMode('import')}
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              activeMode === 'import'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>2. Importar Archivo</span>
          </button>

          <button
            onClick={() => setActiveMode('clean')}
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition whitespace-nowrap relative ${
              activeMode === 'clean'
                ? 'bg-gradient-to-r from-amber-400 via-rose-500 to-indigo-500 text-slate-950 shadow-md shadow-rose-950/40'
                : vocalCleanConfig.enabled
                ? 'bg-rose-950/80 text-rose-300 border border-rose-500/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Waves className="w-3.5 h-3.5" />
            <span>3. Limpieza de Voz & DSP</span>
            {vocalCleanConfig.enabled && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            )}
          </button>
        </div>
      </div>

      {/* Live Audio Status Bar with Limpieza de Voz Indicator */}
      <div className="bg-surface-container-lowest p-3.5 rounded-xl border border-slate-800 space-y-2.5 text-xs shadow-inner">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-3.5 h-3.5 rounded-full shrink-0 ${hasAudio ? 'bg-emerald-400 animate-pulse ring-4 ring-emerald-500/20' : 'bg-slate-600'}`} />
            <div>
              <span className="font-bold text-white block">
                {customAudioName
                  ? `🎵 Audio Importado: ${customAudioName}`
                  : hasAudio
                  ? `🎙️ Audio Generado con IA (${selectedVoice} • gemini-3.8-flash-tts)`
                  : '⚠️ Sin audio cargado actualmente en el proyecto'}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {hasAudio
                  ? `DSP ENGINE: 48.000 kHz / 32-bit Float • LUFS TARGET: -14.0 EBU R128 • Duración: ${totalDuration}s`
                  : 'Pega tu texto abajo para generar la voz o importa un archivo de audio.'}
              </span>
            </div>
          </div>

          {hasAudio && (
            <div className="flex items-center gap-2">
              <button
                onClick={onTogglePlay}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary-container text-slate-950 font-black shadow transition active:scale-95 cursor-pointer"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Pausar Audio' : 'Escuchar Audio'}</span>
              </button>

              {customAudioName && (
                <button
                  onClick={onResetAudio}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-slate-800 transition cursor-pointer"
                  title="Quitar audio importado"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* FFT Spectrum Analyzer Graphic from Google Stitch */}
        {hasAudio && (
          <div className="bg-slate-950 rounded-lg p-2 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-primary font-bold flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-primary" /> FFT SPECTRUM ANALYZER & MASTER BUS CURVE
              </span>
              <span className="text-secondary font-semibold">PEAK HOLD: ON (-14 LUFS)</span>
            </div>
            <div className="relative w-full h-16 bg-surface-dim rounded overflow-hidden flex items-center px-1">
              <svg className="w-full h-full text-primary-fixed-dim" preserveAspectRatio="none" viewBox="0 0 500 60">
                <defs>
                  <linearGradient id="spectrumGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#00daf3" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#101419" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0,60 L0,45 Q40,40 70,30 T140,20 T210,10 T280,22 T350,12 T420,30 T480,45 L500,55 L500,60 Z" fill="url(#spectrumGrad)" />
                <path d="M0,45 Q40,40 70,30 T140,20 T210,10 T280,22 T350,12 T420,30 T480,45 L500,55" fill="none" stroke="#00daf3" strokeWidth="1.5" />
                <path d="M0,40 Q40,35 70,25 T140,15 T210,5 T280,18 T350,8 T420,25 T480,40 L500,50" fill="none" stroke="#7dffa2" strokeWidth="1" strokeDasharray="3,3" opacity="0.8" />
                <circle cx="70" cy="30" r="3" fill="#00e5ff" />
                <circle cx="210" cy="10" r="3" fill="#7dffa2" />
                <circle cx="350" cy="12" r="3" fill="#e8ecff" />
              </svg>
            </div>
          </div>
        )}

        {/* Limpieza de Voz quick badge & A/B switch if audio is loaded */}
        {hasAudio && (
          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black border ${
                vocalCleanConfig.enabled
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                <ShieldCheck className="w-3 h-3" />
                {vocalCleanConfig.enabled
                  ? `Filtro Limpieza ACTIVO (${vocalCleanConfig.preset})`
                  : 'Filtro de Limpieza: DESACTIVADO'}
              </span>

              {hasCleanedAudio && (
                <button
                  type="button"
                  onClick={onToggleOriginalVsCleaned}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold border border-slate-700 transition active:scale-95"
                  title="Alternar entre escuchar la pista original o la pista procesada con DSP"
                >
                  <ArrowRightLeft className="w-3 h-3 text-cyan-400" />
                  <span>Escuchando: <strong>{isShowingCleaned ? 'Audio Limpio & Ecualizado' : 'Audio Original (Raw)'}</strong></span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveMode('clean');
              }}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold underline flex items-center gap-1"
            >
              <Sliders className="w-3 h-3" />
              <span>{vocalCleanConfig.enabled ? 'Ajustar Ecualizador & Ruido' : '⚡ Configurar Limpieza de Voz'}</span>
            </button>
          </div>
        )}
      </div>

      {/* ========================================================
          MODE 1: TEXT TO SPEECH (IA GEMINI-3.8-FLASH-TTS)
          ======================================================== */}
      {activeMode === 'tts' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Pega o Escribe aquí el texto que se transformará en voz:
              </label>

              {/* Fast Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onLoadOfficialScript}
                  className="px-2 py-1 rounded bg-teal-950 border border-teal-700/60 text-[11px] text-teal-300 hover:bg-teal-900 font-semibold transition"
                >
                  📋 Guión Oficial CCMI (18s)
                </button>
                <button
                  type="button"
                  onClick={() => onChangeRawScript('')}
                  className="text-[11px] text-slate-400 hover:text-slate-200 transition"
                >
                  Limpiar
                </button>
              </div>
            </div>

            {/* The Text Box */}
            <div className="relative">
              <textarea
                rows={5}
                value={rawScriptText}
                onChange={(e) => onChangeRawScript(e.target.value)}
                placeholder="Escribe o pega aquí el escrito que deseas que la voz de Inteligencia Artificial narre en tu video..."
                className="w-full bg-slate-950 border-2 border-slate-700 focus:border-cyan-400 rounded-xl p-3.5 text-xs sm:text-sm text-slate-100 focus:outline-none leading-relaxed font-sans shadow-inner transition"
              />
              <div className="flex items-center justify-between px-2 pt-1 text-[11px] text-slate-400">
                <span>{wordCount} palabras • {charCount} caracteres</span>
                <span>⏱️ Duración estimada: ~{estimatedSeconds}s</span>
              </div>
            </div>
          </div>

          {/* Quick presets samples */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
            <span className="text-slate-400 shrink-0 font-medium">Textos rápidos:</span>
            <button
              onClick={() => handleQuickPasteSample('En CSMI cuidamos cada detalle de tu salud. Conócenos y agenda tu cita hoy.')}
              className="px-2 py-0.5 rounded-md bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 shrink-0"
            >
              Cita Médica Rápida (6s)
            </button>
            <button
              onClick={() => handleQuickPasteSample('Instalaciones modernas y equipo especializado para tu recuperación y tranquilidad.')}
              className="px-2 py-0.5 rounded-md bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 shrink-0"
            >
              Instalaciones (5s)
            </button>
          </div>

          {/* Voice Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Selecciona la Voz del Locutor (gemini-3.8-flash-tts)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {voices.map((v) => {
                const isSelected = v.id === selectedVoice;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => onSelectVoice(v.id)}
                    className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-cyan-950/70 border-cyan-400 text-white shadow-md shadow-cyan-950/40 ring-1 ring-cyan-400/50'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs flex items-center gap-1.5 text-white">
                        <span>{v.name}</span>
                        {isSelected && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />}
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{v.description}</p>
                    </div>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                      v.gender === 'Femenina' ? 'bg-pink-950/60 text-pink-300 border-pink-800/40' : 'bg-blue-950/60 text-blue-300 border-blue-800/40'
                    }`}>
                      {v.gender}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Emotional Style Presets */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Tono y Estilo Emocional
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs">
              {STYLE_PRESETS.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => {
                    onSelectStyle(st.id);
                    onChangeCustomPrompt(st.prompt);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg border text-left transition truncate text-[11px] font-semibold ${
                    selectedStyleId === st.id
                      ? 'bg-teal-950/70 border-teal-500 text-teal-200 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* BIG GLOWING BUTTON TO GENERATE AUDIO */}
          <button
            onClick={() => {
              if (userPlanTier === 'basic' && onOpenUpgradeModal) {
                onOpenUpgradeModal('Locución y Texto a Voz con IA (Google Gemini TTS)');
              } else {
                onGenerateAudio();
              }
            }}
            disabled={isGeneratingAudio || !rawScriptText.trim()}
            className={`w-full py-4 px-4 rounded-xl font-black text-sm shadow-xl flex items-center justify-center gap-2 transition active:scale-[0.99] disabled:opacity-50 cursor-pointer ${
              userPlanTier === 'basic'
                ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-400/50 shadow-slate-950/40'
                : 'bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 shadow-cyan-950/40'
            }`}
          >
            {isGeneratingAudio ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin text-slate-950" />
                <span>Transformando Texto en Audio con IA...</span>
              </>
            ) : userPlanTier === 'basic' ? (
              <>
                <Crown className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span>TRANSFORMAR TEXTO EN AUDIO CON IA (GOOGLE PRO)</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-slate-950" />
                <span>TRANSFORMAR TEXTO EN AUDIO CON IA</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* ========================================================
          MODE 2: IMPORT CUSTOM AUDIO FILE (MP3, WAV, M4A)
          ======================================================== */}
      {activeMode === 'import' && (
        <div className="space-y-4">
          <input
            type="file"
            ref={fileInputRef}
            accept="audio/mp3,audio/wav,audio/m4a,audio/aac,audio/ogg,audio/*"
            className="hidden"
            onChange={handleFileChange}
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-emerald-500/50 hover:border-emerald-400 bg-slate-950/80 hover:bg-slate-950 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition group"
          >
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-105 transition shadow-lg shadow-emerald-950/40">
              <Upload className="w-8 h-8" />
            </div>
            <h4 className="text-sm sm:text-base font-black text-white mb-1">
              Haz clic aquí para Importar tu Archivo de Audio
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mb-3">
              Arrastra o selecciona un archivo <strong>MP3, WAV, M4A, OGG</strong> o una nota de voz grabada desde tu celular o computadora.
            </p>
            <button
              type="button"
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg transition"
            >
              Seleccionar Audio desde tu Dispositivo
            </button>
          </div>

          {customAudioName && (
            <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/40 flex flex-wrap items-center justify-between gap-3 text-xs shadow-md">
              <div className="flex items-center gap-3">
                <FileAudio className="w-7 h-7 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold text-white text-sm block">{customAudioName}</span>
                  <span className="text-[11px] text-emerald-300 font-medium">
                    Audio importado y sincronizado con el video.
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onSyncDurationToAudio}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold border border-slate-700 transition"
                  title="Ajustar la duración total del video para que coincida exactamente con la del audio"
                >
                  Sincronizar Duración ({totalDuration}s)
                </button>

                <button
                  onClick={onResetAudio}
                  className="px-2.5 py-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300 font-bold border border-rose-800 transition"
                >
                  Quitar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          MODE 3: VOCAL CLEANING & STUDIO EQUALIZER (DSP PRE-PROCESSING)
          ======================================================== */}
      {activeMode === 'clean' && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/60 border border-cyan-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold border border-cyan-400/30">
                  <Waves className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    Pre-Procesador de Limpieza de Voz & EQ de Estudio
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Filtra ruidos de fondo, elimina resonancias y ecualiza la voz para un acabado profesional.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onUpdateVocalCleanConfig({ enabled: !vocalCleanConfig.enabled })}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition active:scale-95 flex items-center gap-1.5 ${
                    vocalCleanConfig.enabled
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/50'
                      : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{vocalCleanConfig.enabled ? 'FILTRO ACTIVADO' : 'ACTIVAR FILTRO'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Preset Cards Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Preajustes de Limpieza de Voz (Algoritmos DSP)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {VOCAL_CLEAN_PRESETS.map((preset) => {
                const isSelected = vocalCleanConfig.preset === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      onUpdateVocalCleanConfig({
                        preset: preset.id,
                        noiseReductionAmount: preset.noiseReductionAmount,
                        warmthBoost: preset.warmthBoost,
                        presenceBoost: preset.presenceBoost,
                        airBoost: preset.airBoost,
                      });
                      if (hasAudio) {
                        onApplyVocalClean(preset.id);
                      }
                    }}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between gap-1.5 ${
                      isSelected
                        ? 'bg-gradient-to-br from-cyan-950/80 to-slate-900 border-cyan-400 text-white shadow-md ring-1 ring-cyan-400/50'
                        : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white flex items-center gap-1.5">
                        {preset.name}
                        {isSelected && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        {preset.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">{preset.description}</p>
                    <div className="text-[10px] font-mono text-cyan-400/80 bg-slate-950/80 px-2 py-1 rounded border border-slate-800">
                      {preset.eqDescription}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fine Tuning Sliders */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3.5">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                Ajustes Finos de Reducción de Ruido & Ecualización
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Paso de Pre-Procesamiento WAV 16-Bit
              </span>
            </div>

            {/* 1. Noise Reduction */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">
                  Reducción de Ruido de Fondo & Filtro Pasa-Altos (AC / Zumbidos)
                </span>
                <span className="font-mono text-cyan-300 font-bold">
                  {Math.round(vocalCleanConfig.noiseReductionAmount * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={vocalCleanConfig.noiseReductionAmount}
                onChange={(e) => onUpdateVocalCleanConfig({ noiseReductionAmount: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0% (Natural)</span>
                <span>50% (Equilibrado)</span>
                <span>100% (Aislamiento Máximo)</span>
              </div>
            </div>

            {/* 2. Warmth / Chest Presence */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">
                  Calidez & Cuerpo Vocal (200Hz - 250Hz)
                </span>
                <span className="font-mono text-cyan-300 font-bold">
                  {vocalCleanConfig.warmthBoost > 0 ? `+${vocalCleanConfig.warmthBoost} dB` : `${vocalCleanConfig.warmthBoost} dB`}
                </span>
              </div>
              <input
                type="range"
                min="-6"
                max="6"
                step="0.5"
                value={vocalCleanConfig.warmthBoost}
                onChange={(e) => onUpdateVocalCleanConfig({ warmthBoost: parseFloat(e.target.value) })}
                className="w-full accent-teal-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* 3. Presence & Articulation */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">
                  Presencia & Claridad de Dicción (3.6kHz)
                </span>
                <span className="font-mono text-cyan-300 font-bold">
                  +{vocalCleanConfig.presenceBoost} dB
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="8"
                step="0.5"
                value={vocalCleanConfig.presenceBoost}
                onChange={(e) => onUpdateVocalCleanConfig({ presenceBoost: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* 4. Air & Sheen */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">
                  Brillo & Aire de Estudio (10.5kHz Shelf)
                </span>
                <span className="font-mono text-cyan-300 font-bold">
                  +{vocalCleanConfig.airBoost} dB
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="6"
                step="0.5"
                value={vocalCleanConfig.airBoost}
                onChange={(e) => onUpdateVocalCleanConfig({ airBoost: parseFloat(e.target.value) })}
                className="w-full accent-indigo-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Toggles: De-Esser & Compression */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-800">
              <label className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer">
                <span className="text-xs font-semibold text-slate-300">De-Esser (Atenuar 'S' estridentes)</span>
                <input
                  type="checkbox"
                  checked={vocalCleanConfig.deEsser}
                  onChange={(e) => onUpdateVocalCleanConfig({ deEsser: e.target.checked })}
                  className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer">
                <span className="text-xs font-semibold text-slate-300">Compresor Dinámico de Broadcast</span>
                <input
                  type="checkbox"
                  checked={vocalCleanConfig.normalize}
                  onChange={(e) => onUpdateVocalCleanConfig({ normalize: e.target.checked })}
                  className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Big Action Button to Apply / Pre-Process */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <button
              type="button"
              onClick={() => onApplyVocalClean()}
              disabled={isCleaningVocal || !hasAudio}
              className="flex-1 w-full py-3.5 px-4 rounded-xl font-black text-xs sm:text-sm bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:opacity-95 text-slate-950 shadow-xl shadow-cyan-950/50 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isCleaningVocal ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Pre-procesando Limpieza de Voz & DSP...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>APLICAR FILTRO DE LIMPIEZA DE VOZ (DSP)</span>
                </>
              )}
            </button>

            {hasCleanedAudio && (
              <button
                type="button"
                onClick={onToggleOriginalVsCleaned}
                className="w-full sm:w-auto px-4 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-black text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition active:scale-95"
              >
                <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
                <span>{isShowingCleaned ? 'Escuchar Original (A/B)' : 'Escuchar Limpio (A/B)'}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
