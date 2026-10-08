import React, { useRef } from 'react';
import {
  Activity, Sparkles, Volume2, VolumeX, Film, Download, FileText, Music, Scissors,
  Upload, Monitor, Smartphone, Mic, Crown, Wand2, Code
} from 'lucide-react';
import { DeviceMode, UserPlanTier } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  totalDuration: number;
  wordCount: number;
  isGeneratingAll: boolean;
  onGenerateAll: () => void;
  onOpenExport: () => void;
  onOpenDirector: () => void;
  onImportAudioFile: (file: File) => void;
  bgMusicEnabled: boolean;
  onToggleBgMusic: () => void;
  hasAudio: boolean;
  customAudioName: string | null;
  activeTab: 'capcut' | 'audio' | 'scenes' | 'voice' | 'inspector' | 'gemini';
  onSelectTab: (tab: 'capcut' | 'audio' | 'scenes' | 'voice' | 'inspector' | 'gemini') => void;
  deviceMode: DeviceMode;
  onToggleDeviceMode: (mode: DeviceMode) => void;
  volume?: number;
  onVolumeChange?: (vol: number) => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
  onAutoSyncCuts?: () => void;
  isAutoSyncing?: boolean;
  userPlanTier: UserPlanTier;
  onOpenUpgradeModal: (feature?: string) => void;
  onOpenScriptGenerator?: () => void;
  onOpenCodeModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalDuration,
  wordCount,
  isGeneratingAll,
  onGenerateAll,
  onOpenExport,
  onOpenDirector,
  onImportAudioFile,
  bgMusicEnabled,
  onToggleBgMusic,
  hasAudio,
  customAudioName,
  activeTab,
  onSelectTab,
  deviceMode,
  onToggleDeviceMode,
  volume,
  onVolumeChange,
  isMuted,
  onToggleMute,
  onAutoSyncCuts,
  isAutoSyncing,
  userPlanTier,
  onOpenUpgradeModal,
  onOpenScriptGenerator,
  onOpenCodeModal,
}) => {
  const audioInputRef = useRef<HTMLInputElement | null>(null);

  const handleFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportAudioFile(file);
    }
    // reset input value so re-picking same file triggers onChange
    if (e.target) e.target.value = '';
  };

  return (
    <header className="bg-surface-container-lowest border-b border-outline-variant/30 text-on-surface sticky top-0 z-30 shadow-xl backdrop-blur-md">
      {/* Hidden audio file picker */}
      <input
        type="file"
        ref={audioInputRef}
        accept="audio/mp3,audio/wav,audio/m4a,audio/aac,audio/ogg,audio/*"
        className="hidden"
        onChange={handleFilePicked}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logo & Model */}
          <div className="flex items-center justify-between md:justify-start gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-teal-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-950/50 border border-cyan-400/40 shrink-0">
                <span className="material-symbols-outlined text-xl text-slate-950 font-bold">auto_awesome</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                    CCMI <span className="text-primary font-light text-xs sm:text-sm">Studio</span>
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-primary/10 text-primary border border-primary/30 shadow-sm">
                    <span className="material-symbols-outlined text-xs">auto_awesome</span>
                    STITCH UI • GEMINI 3.8 FLASH
                  </span>
                </div>
                <p className="text-[11px] text-on-surface-variant font-mono line-clamp-1">
                  Estudio de Producción Audiovisual, Locución en Off & MP4 Engine
                </p>
              </div>
            </div>

            {/* Mobile-only device toggle in top right */}
            <div className="md:hidden flex items-center gap-1 bg-surface-container-low p-1 rounded-lg border border-outline-variant/30 text-xs">
              <button
                onClick={() => onToggleDeviceMode('desktop')}
                className={`p-1.5 rounded-md ${deviceMode === 'desktop' ? 'bg-primary text-slate-950 font-bold' : 'text-on-surface-variant'}`}
                title="Modo Computadora"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onToggleDeviceMode('mobile')}
                className={`p-1.5 rounded-md ${deviceMode === 'mobile' ? 'bg-rose-500 text-slate-950 font-bold' : 'text-on-surface-variant'}`}
                title="Modo Móvil"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs (Computadora & Desktop Bar) */}
          <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl border border-outline-variant/30 overflow-x-auto scrollbar-none self-stretch sm:self-auto">
            {/* 1. CapCut Video */}
            <button
              onClick={() => onSelectTab('capcut')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap shrink-0 ${
                activeTab === 'capcut'
                  ? 'bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 shadow-md shadow-cyan-950/50 font-extrabold'
                  : 'text-on-surface-variant hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-base">movie</span>
              <span>Timeline Master</span>
            </button>

            {/* 2. INSPECTOR PRO & COLOR / DSP */}
            <button
              onClick={() => onSelectTab('inspector')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap shrink-0 ${
                activeTab === 'inspector'
                  ? 'bg-primary-container text-slate-950 shadow-md font-extrabold'
                  : 'text-on-surface-variant hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-base">tune</span>
              <span>Inspector Pro</span>
            </button>

            {/* 3. GEMINI AI STUDIO ENGINE */}
            <button
              onClick={() => onSelectTab('gemini')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap shrink-0 ${
                activeTab === 'gemini'
                  ? 'bg-gradient-to-r from-indigo-500 to-primary text-white shadow-md font-extrabold'
                  : 'text-on-surface-variant hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-base">auto_awesome</span>
              <span>Gemini AI Studio</span>
            </button>

            {/* 4. TEXTO A VOZ & AUDIO */}
            <button
              onClick={() => onSelectTab('audio')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition whitespace-nowrap shrink-0 relative ${
                activeTab === 'audio'
                  ? 'bg-gradient-to-r from-primary to-primary-container text-slate-950 shadow-md shadow-cyan-950/50'
                  : 'text-primary hover:text-white bg-primary/10 border border-primary/20'
              }`}
            >
              <span className="material-symbols-outlined text-base">graphic_eq</span>
              <span>Vocal Clean & DSP</span>
              <span className={`w-2 h-2 rounded-full ${hasAudio ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            </button>

            {/* 3. Escenas */}
            <button
              onClick={() => onSelectTab('scenes')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap shrink-0 ${
                activeTab === 'scenes'
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'text-on-surface-variant hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-base">description</span>
              <span>Guión Oficial</span>
            </button>

            {/* 4. Voces */}
            <button
              onClick={() => onSelectTab('voice')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap shrink-0 ${
                activeTab === 'voice'
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'text-on-surface-variant hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-base">tune</span>
              <span>Config. Voces</span>
            </button>
          </div>

          {/* Actions: Importar Audio, Exportar, Device Switcher, Música, Director */}
          <div className="flex items-center gap-2 flex-wrap justify-between md:justify-end">
            {/* Desktop Switcher: Computadora vs Móvil */}
            <div className="hidden md:flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => onToggleDeviceMode('desktop')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold transition ${
                  deviceMode === 'desktop'
                    ? 'bg-slate-800 text-cyan-300 shadow-sm border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Modo pantalla ancha para computadoras"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Computadora</span>
              </button>

              <button
                onClick={() => onToggleDeviceMode('mobile')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold transition ${
                  deviceMode === 'mobile'
                    ? 'bg-rose-500/20 text-rose-300 shadow-sm border border-rose-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Modo vertical táctil estilo CapCut Móvil"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Móvil</span>
              </button>
            </div>

            {/* Background Music toggle */}
            <button
              onClick={onToggleBgMusic}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${
                bgMusicEnabled
                  ? 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
              title="Música clínica de fondo con atenuación automática"
            >
              <Music className="w-3 h-3" />
              <span className="hidden xl:inline">Música:</span> {bgMusicEnabled ? 'ON' : 'OFF'}
            </button>

            {/* Quick Volume Control in Header - Accessible Everywhere */}
            {onVolumeChange && (
              <div className="flex items-center gap-1 bg-slate-950 px-2 py-1.5 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={onToggleMute}
                  className="text-slate-400 hover:text-white transition"
                  title="Silenciar / Activar sonido"
                >
                  {isMuted || (volume ?? 1) === 0 ? (
                    <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => onVolumeChange(Math.max(0, +((volume ?? 1) - 0.1).toFixed(2)))}
                  className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center active:scale-95"
                  title="Bajar volumen (-10%)"
                >
                  -
                </button>
                <span className="font-mono text-[10px] font-bold text-cyan-300 w-7 text-center">
                  {isMuted ? '0%' : `${Math.round((volume ?? 1) * 100)}%`}
                </span>
                <button
                  type="button"
                  onClick={() => onVolumeChange(Math.min(1, +((volume ?? 1) + 0.1).toFixed(2)))}
                  className="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center active:scale-95"
                  title="Subir volumen (+10%)"
                >
                  +
                </button>
              </div>
            )}

            {/* Plan Tier Selector / Badge */}
            <div className="flex items-center">
              {userPlanTier === 'premium' ? (
                <button
                  type="button"
                  onClick={() => onOpenUpgradeModal()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/25 via-rose-500/20 to-purple-500/25 text-amber-300 border border-amber-400/50 text-xs font-black shadow-md shadow-amber-950/40 transition hover:scale-105 active:scale-95"
                  title="Plan Actual: PREMIUM (Google AI) - Haz clic para ver beneficios o alternar a Básico"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="hidden sm:inline">PRO (Google AI)</span>
                  <span className="sm:hidden">PRO</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onOpenUpgradeModal()}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition hover:border-amber-400/50 active:scale-95 shadow-sm"
                  title="Plan Actual: BÁSICO - Haz clic para activar el Modo Premium con Google AI"
                >
                  <span className="w-2 h-2 rounded-full bg-slate-500" />
                  <span>BÁSICO</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-400 to-rose-400 text-slate-950 font-black ml-0.5">
                    👑 PRO
                  </span>
                </button>
              )}
            </div>

            {/* AI Script Generator Button (PRO) */}
            {onOpenScriptGenerator && (
              <button
                type="button"
                onClick={() => {
                  if (userPlanTier === 'basic') {
                    onOpenUpgradeModal('Generador de Guiones con Gemini');
                  } else {
                    onOpenScriptGenerator();
                  }
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/60 transition active:scale-95"
                title="Generar guión y escenas con Google Gemini 3.8 Flash"
              >
                <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden xl:inline">Guión IA</span>
                {userPlanTier === 'basic' && (
                  <span className="text-[9px] bg-amber-400 text-slate-950 px-1 rounded font-black">PRO</span>
                )}
              </button>
            )}

            {/* AI Director */}
            <button
              onClick={() => {
                if (userPlanTier === 'basic') {
                  onOpenUpgradeModal('Director de Voz IA con Gemini');
                } else {
                  onOpenDirector();
                }
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              title="Analizar cadencia y ritmo con Director IA (Google Gemini)"
            >
              <Film className="w-3 h-3 text-amber-400" />
              <span className="hidden lg:inline">Director IA</span>
              {userPlanTier === 'basic' && (
                <span className="text-[9px] bg-amber-400 text-slate-950 px-1 rounded font-black">PRO</span>
              )}
            </button>

            {/* Auto-Sync Cuts Button */}
            {onAutoSyncCuts && (
              <button
                type="button"
                onClick={() => {
                  if (userPlanTier === 'basic') {
                    onOpenUpgradeModal('Auto-Sincronización de Cortes con IA');
                  } else {
                    onAutoSyncCuts();
                  }
                }}
                disabled={isAutoSyncing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 shadow-md shadow-cyan-950/40 transition active:scale-95 disabled:opacity-50"
                title="Ajustar automáticamente los cortes de video a las pausas de la voz en off"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isAutoSyncing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{isAutoSyncing ? 'Sincronizando...' : 'Auto-Sincronizar Cortes'}</span>
                <span className="sm:hidden">{isAutoSyncing ? '...' : 'Auto-Sync'}</span>
                {userPlanTier === 'basic' && (
                  <span className="text-[9px] bg-amber-400 text-slate-950 px-1 rounded font-black">PRO</span>
                )}
              </button>
            )}

            {/* BUTTON: CODIGO FUENTE PARA IA */}
            {onOpenCodeModal && (
              <button
                type="button"
                onClick={onOpenCodeModal}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 transition active:scale-95 shadow-sm"
                title="Ver y copiar todo el código de la aplicación para pasárselo a otras IAs"
              >
                <Code className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Código IA</span>
              </button>
            )}

            {/* 1. BUTTON: IMPORTAR AUDIO - EXACT REQUEST FROM USER */}
            <button
              onClick={() => audioInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/50 transition active:scale-95 border border-emerald-400/40"
              title="Importar archivo de audio MP3, WAV, M4A o nota de voz"
            >
              <Upload className="w-3.5 h-3.5 text-white" />
              <span>Importar Audio</span>
            </button>

            {/* PWA Install Button */}
            <PWAInstallButton />

            {/* 2. BUTTON: EXPORTAR */}
            <button
              onClick={onOpenExport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black bg-gradient-to-r from-amber-500 via-rose-500 to-pink-500 hover:opacity-95 text-slate-950 shadow-md shadow-rose-950/40 transition active:scale-95"
              title="Abrir menú de exportación de video, audio y subtítulos"
            >
              <Download className="w-3.5 h-3.5 fill-slate-950" />
              <span>Exportar</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
