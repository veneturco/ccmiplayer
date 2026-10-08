import React, { useState } from 'react';
import { Mic2, Volume2, Sparkles, UserCheck, Play, Pause, RefreshCw, CheckCircle2 } from 'lucide-react';
import { VoicePreset, VoiceOption } from '../types';
import { STYLE_PRESETS } from '../data/initialScript';
import { base64ToAudioUrl } from '../utils/audioUtils';

interface VoiceSettingsProps {
  voices: VoicePreset[];
  selectedVoice: VoiceOption;
  onSelectVoice: (voice: VoiceOption) => void;
  selectedStyleId: string;
  onSelectStyle: (styleId: string) => void;
  customStylePrompt: string;
  onChangeCustomPrompt: (prompt: string) => void;
  bgMusicEnabled: boolean;
  onToggleBgMusic: () => void;
  bgMusicVolume: number;
  onChangeBgVolume: (vol: number) => void;
  playbackSpeed: number;
  onChangePlaybackSpeed: (speed: number) => void;
}

export const VoiceSettings: React.FC<VoiceSettingsProps> = ({
  voices,
  selectedVoice,
  onSelectVoice,
  selectedStyleId,
  onSelectStyle,
  customStylePrompt,
  onChangeCustomPrompt,
  bgMusicEnabled,
  onToggleBgMusic,
  bgMusicVolume,
  onChangeBgVolume,
  playbackSpeed,
  onChangePlaybackSpeed,
}) => {
  const [testingVoiceId, setTestingVoiceId] = useState<string | null>(null);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const testAudioRef = React.useRef<HTMLAudioElement | null>(null);

  // Quick test sample audio for each voice persona
  const handleTestVoice = async (voice: VoicePreset) => {
    if (playingVoiceId === voice.id && testAudioRef.current) {
      testAudioRef.current.pause();
      setPlayingVoiceId(null);
      return;
    }

    setTestingVoiceId(voice.id);

    try {
      const res = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: voice.sampleText,
          voice: voice.id,
          style: 'Clear, reassuring medical voice in Spanish',
          sceneTitle: `Prueba ${voice.name}`,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.audioBase64) {
        throw new Error(data.error || 'Fallo de síntesis');
      }

      const url = base64ToAudioUrl(data.audioBase64, data.mimeType || 'audio/wav');
      if (!testAudioRef.current) {
        testAudioRef.current = new Audio();
      }

      testAudioRef.current.src = url;
      testAudioRef.current.onended = () => setPlayingVoiceId(null);
      testAudioRef.current.play();
      setPlayingVoiceId(voice.id);
    } catch (err) {
      console.warn('Voice preview error:', err);
    } finally {
      setTestingVoiceId(null);
    }
  };

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-xl space-y-5 text-on-surface">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Mic2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Motor de Voces Gemini 3.8 Flash TTS
            </h3>
            <p className="text-xs text-slate-400">Prueba y selecciona la voz de locución clínica</p>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          gemini-3.8-flash-tts
        </span>
      </div>

      {/* Voice Selection with Live Previews */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Voces Preconfiguradas (Haz clic para seleccionar o probar)
        </label>
        <div className="space-y-2">
          {voices.map((v) => {
            const isSelected = v.id === selectedVoice;
            const isTesting = testingVoiceId === v.id;
            const isPlayingThis = playingVoiceId === v.id;

            return (
              <div
                key={v.id}
                onClick={() => onSelectVoice(v.id)}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-cyan-950/70 border-cyan-500 shadow-md shadow-cyan-950/40 text-white'
                    : 'bg-slate-950/50 hover:bg-slate-800/60 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm text-white flex items-center gap-1.5">
                      {v.name}
                      {isSelected && <UserCheck className="w-3.5 h-3.5 text-cyan-400" />}
                    </span>
                    <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {v.gender}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    {v.description}
                  </p>
                  <p className="text-[10px] text-cyan-300/80 italic mt-0.5">
                    &ldquo;{v.sampleText}&rdquo;
                  </p>
                </div>

                {/* Test Voice Sample Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTestVoice(v);
                  }}
                  disabled={isTesting}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 hover:border-cyan-500/50 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition"
                  title="Escuchar muestra de esta voz con gemini-3.8-flash-tts"
                >
                  {isTesting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : isPlayingThis ? (
                    <Pause className="w-3.5 h-3.5 fill-current" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current" />
                  )}
                  <span>{isPlayingThis ? 'Pausar' : 'Probar'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Style & Emotion Presets */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Estilo Emocional & Registro Clínico
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {STYLE_PRESETS.map((st) => {
            const isSelected = st.id === selectedStyleId;
            return (
              <button
                key={st.id}
                onClick={() => {
                  onSelectStyle(st.id);
                  onChangeCustomPrompt(st.prompt);
                }}
                className={`px-3 py-2 rounded-lg text-xs font-medium border text-left transition ${
                  isSelected
                    ? 'bg-teal-950/70 border-teal-500 text-teal-200'
                    : 'bg-slate-950/40 hover:bg-slate-800/50 border-slate-800 text-slate-400'
                }`}
              >
                {st.label}
              </button>
            );
          })}
        </div>

        {/* Custom Speech prompt */}
        <div className="mt-2.5">
          <label className="block text-[11px] text-slate-400 mb-1">
            Instrucción de Dirección (speechMetadata.style enviada a Gemini TTS):
          </label>
          <input
            type="text"
            value={customStylePrompt}
            onChange={(e) => onChangeCustomPrompt(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Playback Controls & Ambient Music */}
      <div className="pt-2 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Playback Speed */}
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span className="font-medium">Velocidad de Lectura</span>
            <span className="font-mono text-cyan-300 font-bold">{playbackSpeed}x</span>
          </div>
          <div className="flex items-center gap-1.5">
            {[0.8, 0.9, 1.0, 1.1, 1.25].map((spd) => (
              <button
                key={spd}
                onClick={() => onChangePlaybackSpeed(spd)}
                className={`flex-1 py-1 rounded text-xs font-medium border transition ${
                  playbackSpeed === spd
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Ambient Bed Slider */}
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span className="flex items-center gap-1 font-medium">
              <Volume2 className="w-3.5 h-3.5 text-teal-400" /> Música de Fondo (Auto-Ducking)
            </span>
            <button
              onClick={onToggleBgMusic}
              className={`text-[10px] font-bold px-2 py-0.5 rounded transition ${
                bgMusicEnabled
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                  : 'bg-slate-800 text-slate-500'
              }`}
            >
              {bgMusicEnabled ? 'ACTIVADA' : 'DESACTIVADA'}
            </button>
          </div>
          <input
            type="range"
            min="0"
            max="0.4"
            step="0.02"
            disabled={!bgMusicEnabled}
            value={bgMusicVolume}
            onChange={(e) => onChangeBgVolume(parseFloat(e.target.value))}
            className="w-full accent-teal-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer disabled:opacity-40"
          />
        </div>
      </div>
    </div>
  );
};
