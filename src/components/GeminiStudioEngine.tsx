import React, { useState } from 'react';
import {
  Sparkles, Wand2, Mic, Play, Pause, ChevronRight,
  AlertTriangle, Check, RefreshCw, Volume2, ShieldCheck, Film, Video
} from 'lucide-react';
import { ScriptScene, VoiceOption } from '../types';

interface GeminiStudioEngineProps {
  currentScene?: ScriptScene;
  onAnalyzeScene?: () => void;
  onAutoBrollGen?: () => void;
  selectedVoice?: VoiceOption;
  onSelectVoice?: (voice: VoiceOption) => void;
  onInjectAudio?: (audioName: string) => void;
}

export const GeminiStudioEngine: React.FC<GeminiStudioEngineProps> = ({
  currentScene,
  onAnalyzeScene,
  onAutoBrollGen,
  selectedVoice = 'Kore',
  onSelectVoice,
  onInjectAudio,
}) => {
  const [activeCaptionPreset, setActiveCaptionPreset] = useState<'minimal' | 'mrbeast' | 'hormozi' | 'karaoke'>('minimal');
  const [wordSyncProgress, setWordSyncProgress] = useState<number>(75);
  const [isPlayingAudioPreview, setIsPlayingAudioPreview] = useState<boolean>(false);

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden shadow-2xl flex flex-col font-sans text-on-surface">
      {/* Top Banner Header */}
      <div className="p-3.5 bg-surface-container-low border-b border-outline-variant/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center text-slate-950 font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-bold text-white font-mono tracking-tight">
                Gemini Creative Studio Engine
              </h2>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                ⚡ 9ms TTL
              </span>
            </div>
            <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>MODEL: GEMINI 2.5 / 3.8 FLASH PRO VISION [ULTRA-LATENCY]</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Badges */}
      <div className="flex items-center gap-1.5 p-2 bg-surface-container-low/40 border-b border-outline-variant/20 overflow-x-auto scrollbar-none text-[11px] font-mono">
        <button className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-container text-slate-950 font-bold shrink-0">
          <Video className="w-3.5 h-3.5" />
          <span>Analyze Scene 03</span>
        </button>
        <button className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container-highest text-on-surface hover:text-white shrink-0 border border-outline-variant/30">
          <span>Auto-Captions</span>
        </button>
        <button className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container-highest text-on-surface hover:text-white shrink-0 border border-outline-variant/30">
          <span>AI B-Roll Gen</span>
        </button>
        <button className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container-highest text-on-surface hover:text-white shrink-0 border border-outline-variant/30">
          <span>Voice Clone</span>
        </button>
      </div>

      <div className="p-4 space-y-4 max-h-[640px] overflow-y-auto scrollbar-none">
        {/* CARD 1: ACTIVE SCENE CONTEXTUAL INTELLIGENCE */}
        <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase font-mono">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Active Scene Contextual Intelligence</span>
            </div>
            <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
              SYNCED: TIMELINE
            </span>
          </div>

          <div className="bg-surface-container-lowest p-2 rounded-lg border border-outline-variant/20 space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <div className="flex items-center gap-1.5 text-white font-bold">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>Scene 03: Cyberpunk Alley Confrontation</span>
              </div>
              <span className="text-on-surface-variant text-[10px]">01:14 — 01:28</span>
            </div>

            {/* Video Preview thumbnail with badges */}
            <div className="relative h-28 rounded-lg overflow-hidden bg-slate-950 border border-outline-variant/30 flex items-center justify-center">
              <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-cyan-300 border border-cyan-500/30">
                V-TRACK 02
              </div>
              <div className="text-center space-y-1">
                <Film className="w-6 h-6 text-cyan-400/60 mx-auto" />
                <span className="text-[10px] font-mono text-on-surface-variant block">HERO_SCENE_RENDER_03.raw</span>
              </div>
              <div className="absolute bottom-1.5 left-2 text-[9px] font-mono text-white/70">
                FPS: 59.94
              </div>
              <div className="absolute bottom-1.5 right-2 text-[9px] font-mono text-cyan-300">
                Bitrate: 142 Mbps ProRes
              </div>
            </div>

            {/* PACING ALERT: RETENTION DROPOFF RISK */}
            <div className="bg-amber-950/40 border border-amber-500/40 rounded-lg p-2.5 space-y-1 text-xs">
              <div className="flex items-center gap-1.5 text-amber-300 font-mono font-bold text-[11px]">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>PACING ALERT: RETENTION DROPOFF RISK</span>
              </div>
              <p className="text-[11px] text-amber-100/90 leading-relaxed font-sans">
                Static interval at 01:18 spans 4.2s without subject shift or cutaway motion. Audience churn index spikes +34%.
              </p>
              <div className="text-[10px] text-emerald-300 font-mono flex items-center gap-1 pt-0.5">
                <span>💡</span>
                <span>Recommendation: Insert dynamic cutaway B-roll or kinetic motion push.</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-1.5 pt-1">
              <button
                onClick={onAutoBrollGen}
                className="w-full p-2 rounded-lg bg-surface-container-high hover:bg-surface-bright border border-outline-variant/30 flex items-center justify-between text-xs transition"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-cyan-950 text-cyan-400 flex items-center justify-center font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left">
                    <div className="text-white font-bold text-[11px]">Generate Contextual B-Roll</div>
                    <div className="text-[9px] text-on-surface-variant font-mono">"Rain puddles neon reflection 4K macro"</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-on-surface-variant" />
              </button>

              <button className="w-full p-2 rounded-lg bg-surface-container-high hover:bg-surface-bright border border-outline-variant/30 flex items-center justify-between text-xs transition">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-indigo-950 text-indigo-400 flex items-center justify-center font-bold">
                    <Wand2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left">
                    <div className="text-white font-bold text-[11px]">Dynamic Hook Rewriter</div>
                    <div className="text-[9px] text-on-surface-variant font-mono">3 high-CTR audio variations prepared</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-on-surface-variant" />
              </button>

              <button className="w-full p-2 rounded-lg bg-surface-container-high hover:bg-surface-bright border border-outline-variant/30 flex items-center justify-between text-xs transition">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold">
                    <Volume2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left">
                    <div className="text-white font-bold text-[11px]">Auto Vocal Denoise & Enhance</div>
                    <div className="text-[9px] text-on-surface-variant font-mono">Spectral AI match with alley reverb dampening</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-on-surface-variant" />
              </button>
            </div>
          </div>
        </div>

        {/* CARD 2: AUTO-CAPTIONS & SUBTITLE STYLING ENGINE */}
        <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase font-mono">
              <span className="w-4 h-4 rounded bg-cyan-950 text-cyan-400 flex items-center justify-center text-[10px] font-bold">CC</span>
              <span>Auto-Captions & Subtitle Styling Engine</span>
            </div>
            <span className="text-[9px] font-mono font-bold text-emerald-400">99.8% ACCURACY</span>
          </div>

          <div className="bg-surface-container-lowest p-2.5 rounded-lg border border-outline-variant/20 space-y-2">
            <div className="flex justify-between items-center text-[11px] font-mono">
              <span className="text-cyan-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                CURRENT FRAME AUDIO
              </span>
              <button className="text-on-surface-variant hover:text-white underline text-[10px]">
                ✏️ Edit Script
              </button>
            </div>

            <div className="p-2 bg-surface-container-high/60 rounded-lg text-xs font-medium text-white border border-outline-variant/20">
              <span className="text-on-surface-variant font-mono text-[10px] block mb-0.5">01:24:18 Speaker 01 (Protagonist)</span>
              "In the neon shadows, the <span className="bg-primary-container text-slate-950 px-1 py-0.5 rounded font-black">truth</span> began to render..."
            </div>

            {/* SOCIAL CAPTION PRESETS */}
            <div className="space-y-1.5 pt-1">
              <div className="text-[10px] font-mono text-on-surface-variant">SOCIAL CAPTION STYLING PRESETS</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => setActiveCaptionPreset('mrbeast')}
                  className={`p-2 rounded-lg border text-left flex items-center justify-between ${
                    activeCaptionPreset === 'mrbeast'
                      ? 'bg-primary-container/20 border-primary-container text-white font-bold'
                      : 'bg-surface-container-high border-outline-variant/30 text-on-surface'
                  }`}
                >
                  <span className="text-[11px]">MrBeast Bold Glow</span>
                  <span>🌐</span>
                </button>

                <button
                  onClick={() => setActiveCaptionPreset('minimal')}
                  className={`p-2 rounded-lg border text-left flex items-center justify-between ${
                    activeCaptionPreset === 'minimal'
                      ? 'bg-primary-container/20 border-primary-container text-white font-bold'
                      : 'bg-surface-container-high border-outline-variant/30 text-on-surface'
                  }`}
                >
                  <span className="text-[11px]">Cinematic Minimalism</span>
                  <Check className="w-3.5 h-3.5 text-primary" />
                </button>

                <button
                  onClick={() => setActiveCaptionPreset('hormozi')}
                  className={`p-2 rounded-lg border text-left flex items-center justify-between ${
                    activeCaptionPreset === 'hormozi'
                      ? 'bg-primary-container/20 border-primary-container text-white font-bold'
                      : 'bg-surface-container-high border-outline-variant/30 text-on-surface'
                  }`}
                >
                  <span className="text-[11px]">Hormozi Kinetic</span>
                  <span>⚡</span>
                </button>

                <button
                  onClick={() => setActiveCaptionPreset('karaoke')}
                  className={`p-2 rounded-lg border text-left flex items-center justify-between ${
                    activeCaptionPreset === 'karaoke'
                      ? 'bg-primary-container/20 border-primary-container text-white font-bold'
                      : 'bg-surface-container-high border-outline-variant/30 text-on-surface'
                  }`}
                >
                  <span className="text-[11px]">Karaoke Neon Pulse</span>
                  <span>〰️</span>
                </button>
              </div>
            </div>

            {/* Word Kinetic Beat Sync */}
            <div className="space-y-1 pt-1 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-white font-bold">Word Kinetic Beat Sync</span>
                <span className="text-secondary font-bold">Scale-Pop 1.20x</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={wordSyncProgress}
                onChange={(e) => setWordSyncProgress(parseInt(e.target.value))}
                className="w-full accent-primary h-1.5 bg-surface-container-highest rounded"
              />
              <div className="flex justify-between text-[9px] text-on-surface-variant">
                <span>Soft Fade</span>
                <span className="text-primary font-bold">Kinetic Pop (Active)</span>
                <span>Bounce Impact</span>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: AI VOICE & NARRATION STUDIO */}
        <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase font-mono">
              <Mic className="w-3.5 h-3.5 text-secondary" />
              <span>AI Voice & Narration Studio</span>
            </div>
            <span className="text-[9px] font-mono font-bold text-on-surface-variant">NEURAL 48kHz</span>
          </div>

          <div className="bg-surface-container-lowest p-2.5 rounded-lg border border-outline-variant/20 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-surface-container-highest flex items-center justify-center text-primary font-bold">
                  👤
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1">
                    <span>Nexus English Male</span>
                    <span className="text-emerald-400 text-[10px]">✔</span>
                  </div>
                  <div className="text-[9px] text-on-surface-variant font-mono">Profile: Cinematic Deep · Trait: Gritty / Focused</div>
                </div>
              </div>
              <button className="px-2 py-0.5 rounded text-[10px] font-mono bg-surface-container-highest hover:bg-surface-bright text-white border border-outline-variant/40">
                Change
              </button>
            </div>

            {/* Audio Waveform Track Take Preview */}
            <div className="bg-surface-container-high/80 p-2 rounded-lg border border-outline-variant/30 space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-white font-bold">Take 04_Master_Vocal.wav</span>
                <span className="text-emerald-400">LATENCY 42ms</span>
              </div>

              {/* Graphic Waveform Segments */}
              <div className="h-8 flex items-center justify-between gap-1 px-1">
                {[12, 22, 16, 28, 14, 30, 24, 18, 26, 15, 8, 20, 28, 14, 22, 18, 10, 8].map((val, i) => (
                  <div
                    key={i}
                    style={{ height: `${val}px` }}
                    className={`w-1 rounded-full ${i % 3 === 0 ? 'bg-secondary' : 'bg-primary'}`}
                  />
                ))}
              </div>
            </div>

            {/* Speed, Pitch, Emotion controls */}
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
              <div className="bg-surface-container-high p-1.5 rounded">
                <div className="text-on-surface-variant">Pacing Speed</div>
                <div className="text-white font-bold">1.05x</div>
                <div className="text-secondary text-[8px]">Natural</div>
              </div>

              <div className="bg-surface-container-high p-1.5 rounded">
                <div className="text-on-surface-variant">Pitch Formant</div>
                <div className="text-white font-bold">-1.2 st</div>
                <div className="text-primary text-[8px]">Sub-Bass</div>
              </div>

              <div className="bg-surface-container-high p-1.5 rounded">
                <div className="text-on-surface-variant">Emotion Weight</div>
                <div className="text-white font-bold">Dramatic</div>
                <div className="text-emerald-300 text-[8px]">Intensity 85%</div>
              </div>
            </div>

            {/* Inject into Audio Track Button */}
            <button
              onClick={() => onInjectAudio && onInjectAudio('Take 04_Master_Vocal.wav')}
              className="w-full py-2 rounded-xl bg-primary-container text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow hover:bg-primary-fixed transition active:scale-98"
            >
              <span>+</span>
              <span>Inject into Audio Track A2</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
