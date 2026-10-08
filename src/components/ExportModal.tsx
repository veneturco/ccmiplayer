import React, { useState, useRef } from 'react';
import {
  X, Download, FileText, Check, Music2, Subtitles, Video, RefreshCw, Scissors,
  Cpu, Zap, Upload, CheckCircle2, ShieldCheck, Crown
} from 'lucide-react';
import { ScriptScene, RenderResolution, UserPlanTier } from '../types';
import { base64ToBlob, downloadBlob, generateSrt, generateVtt } from '../utils/audioUtils';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  masterAudioBase64: string | null;
  scenes: ScriptScene[];
  selectedVoiceName: string;
  onRenderVideo: (resolution?: RenderResolution) => void;
  isRenderingVideo: boolean;
  renderProgress: number;
  onImportAudioFile?: (file: File) => void;
  customAudioName?: string | null;
  userPlanTier?: UserPlanTier;
  onOpenUpgradeModal?: (feature?: string) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  masterAudioBase64,
  scenes,
  selectedVoiceName,
  onRenderVideo,
  isRenderingVideo,
  renderProgress,
  onImportAudioFile,
  customAudioName,
  userPlanTier = 'premium',
  onOpenUpgradeModal,
}) => {
  const [copiedCue, setCopiedCue] = useState(false);
  const [selectedResolution, setSelectedResolution] = useState<RenderResolution>('720p');
  const audioInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // Handle master WAV download
  const handleDownloadMasterWav = () => {
    if (!masterAudioBase64) return;
    const blob = base64ToBlob(masterAudioBase64, 'audio/wav');
    downloadBlob(blob, `CCMI_VozEnOff_Master_18s_${selectedVoiceName}.wav`);
  };

  // Handle SRT download
  const handleDownloadSrt = () => {
    const srtContent = generateSrt(scenes);
    const blob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' });
    downloadBlob(blob, 'CCMI_Subtitulos_VozEnOff.srt');
  };

  // Handle VTT download
  const handleDownloadVtt = () => {
    const vttContent = generateVtt(scenes);
    const blob = new Blob([vttContent], { type: 'text/vtt;charset=utf-8' });
    downloadBlob(blob, 'CCMI_Subtitulos_VozEnOff.vtt');
  };

  const handleCopyCueSheet = () => {
    const text = `GUION DE VOZ EN OFF & VIDEO - CCMI / CSMI
Duración total estimada: 18 segundos
Locutor/Voz IA: gemini-3.8-flash-tts (${selectedVoiceName})
=====================================================
${scenes
  .map(
    (s) =>
      `[${s.timeRange}] (${s.endSeconds - s.startSeconds}s) ${s.title.toUpperCase()}\n"${s.text}"\n`
  )
  .join('\n')}
[0:12 - 0:15] (3s) PAUSA INSTITUCIONAL / TRANSICIÓN SONORA DE MARCA
=====================================================
Generado con CCMI CapCut Studio`;

    navigator.clipboard.writeText(text);
    setCopiedCue(true);
    setTimeout(() => setCopiedCue(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      {/* Hidden input for modal audio import */}
      <input
        type="file"
        ref={audioInputRef}
        accept="audio/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && onImportAudioFile) onImportAudioFile(file);
        }}
      />

      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 via-emerald-400 to-rose-500 flex items-center justify-center text-slate-950 font-black shadow-md">
              <Download className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                CCMI MASTER RENDER CORE
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                TASK ID: ENC-8834-DCI • HW ACCEL WEBCODECS H.264 / MP4
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

        {/* System Diagnostic Bar from Google Stitch */}
        <div className="bg-surface-container-low border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary-container animate-pulse" />
            <span className="font-bold text-white uppercase tracking-wider">HARDWARE ACCEL ACTIVE</span>
            <span className="text-slate-600">|</span>
            <span className="text-primary font-semibold">60 FPS REALTIME</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span>CORE TEMP: <strong className="text-secondary">58°C NOMINAL</strong></span>
            <span>IO WRITE: <strong className="text-primary">482 MB/s</strong></span>
          </div>
        </div>

        {/* Hardware Acceleration Info Banner */}
        <div className="bg-gradient-to-r from-cyan-950/60 to-slate-950 border border-cyan-500/30 rounded-xl p-3 flex items-start gap-3 text-xs">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0">
            <Cpu className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <div className="font-bold text-white flex items-center gap-1.5">
              <span>⚡ Renderizado por Hardware Local (GPU / CPU)</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-semibold">
                100% Privado
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              El video se renderiza y codifica directamente con el chip gráfico de tu computadora o teléfono. No consume servidores externos ni requiere subir tus archivos.
            </p>
          </div>
        </div>

        {/* Audio Track Status / Quick Import in Modal */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 truncate">
            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${masterAudioBase64 ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span className="text-slate-300 truncate">
              {customAudioName
                ? `Pista de audio: ${customAudioName}`
                : masterAudioBase64
                ? `Voz de IA activa (${selectedVoiceName})`
                : 'Sin audio activo'}
            </span>
          </div>

          {onImportAudioFile && (
            <button
              onClick={() => audioInputRef.current?.click()}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 font-bold text-[11px] shrink-0 transition"
            >
              <Upload className="w-3 h-3" />
              <span>Importar otro audio</span>
            </button>
          )}
        </div>

        {/* Export Options Grid */}
        <div className="space-y-3">
          {/* 1. Full Rendered Video (Video + Audio + Captions) */}
          <div className="bg-slate-950/90 border border-amber-500/40 rounded-xl p-4 space-y-3 shadow-lg shadow-amber-950/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                    Video Montado Completo (Estilo CapCut)
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-normal">
                      Recomendado
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Incluye secuencia de clips, voz IA / audio importado, subtítulos y stickers.
                  </p>
                </div>
              </div>

              {/* Quality selector */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-[11px]">
                <button
                  onClick={() => setSelectedResolution('720p')}
                  className={`px-2 py-1 rounded font-bold transition ${
                    selectedResolution === '720p'
                      ? 'bg-amber-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Ideal para móviles y render ultra rápido"
                >
                  720p HD (Básico)
                </button>
                <button
                  onClick={() => {
                    if (userPlanTier === 'basic' && onOpenUpgradeModal) {
                      onOpenUpgradeModal('Exportación en 1080p Full HD');
                    } else {
                      setSelectedResolution('1080p');
                    }
                  }}
                  className={`px-2 py-1 rounded font-bold transition flex items-center gap-1 ${
                    selectedResolution === '1080p'
                      ? 'bg-gradient-to-r from-amber-400 to-rose-400 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Calidad máxima para computadoras y pantallas grandes"
                >
                  <span>1080p Full HD</span>
                  {userPlanTier === 'basic' && (
                    <span className="text-[9px] bg-amber-400 text-slate-950 px-1 rounded font-black">
                      PRO
                    </span>
                  )}
                </button>
              </div>
            </div>

            <button
              onClick={() => onRenderVideo(selectedResolution)}
              disabled={isRenderingVideo}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-pink-500 hover:opacity-95 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50 shadow-md cursor-pointer"
            >
              {isRenderingVideo ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Renderizando por hardware ({renderProgress}%)...</span>
                </>
              ) : (
                <>
                  <Scissors className="w-4 h-4 fill-slate-950" />
                  <span>RENDERIZAR Y DESCARGAR VIDEO ({selectedResolution})</span>
                </>
              )}
            </button>
          </div>

          {/* 2. Master Audio WAV */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <Music2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Audio Master (.WAV)</h4>
                <p className="text-[11px] text-slate-400">
                  WAV sin pérdida 24kHz generado con IA o importado
                </p>
              </div>
            </div>
            <button
              onClick={handleDownloadMasterWav}
              disabled={!masterAudioBase64}
              className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-40 shrink-0"
            >
              <Download className="w-3.5 h-3.5" /> Descargar WAV
            </button>
          </div>

          {/* 3. Subtitles SRT & VTT */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
                <Subtitles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Subtítulos Sincronizados</h4>
                <p className="text-[11px] text-slate-400">
                  Formato .SRT y .VTT con código de tiempo exacto
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleDownloadSrt}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 font-bold text-xs transition"
              >
                .SRT
              </button>
              <button
                onClick={handleDownloadVtt}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 font-bold text-xs transition"
              >
                .VTT
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
          <button
            onClick={handleCopyCueSheet}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition"
          >
            {copiedCue ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <FileText className="w-3.5 h-3.5" />}
            <span>{copiedCue ? '¡Copiado!' : 'Copiar Pauta (Cue Sheet)'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
