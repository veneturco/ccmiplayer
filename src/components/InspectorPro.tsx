import React, { useState } from 'react';
import {
  Sliders, Wand2, Volume2, Sparkles, Move, RotateCcw,
  Layers, Check, ChevronRight, Activity, ShieldCheck, Flame
} from 'lucide-react';
import { MediaClip, VocalCleanConfig } from '../types';

interface InspectorProProps {
  activeClip: MediaClip | null;
  onUpdateClip: (id: string, updates: Partial<MediaClip>) => void;
  vocalCleanConfig?: VocalCleanConfig;
  onApplyVocalClean?: (presetId?: any) => Promise<void>;
  isCleaningVocal?: boolean;
}

export const InspectorPro: React.FC<InspectorProProps> = ({
  activeClip,
  onUpdateClip,
  vocalCleanConfig,
  onApplyVocalClean,
  isCleaningVocal = false,
}) => {
  const [activeTab, setActiveTab] = useState<'transform' | 'color' | 'vocal' | 'curves'>('transform');

  // Transform states
  const [posX, setPosX] = useState(1920.0);
  const [posY, setPosY] = useState(1080.0);
  const [scale, setScale] = useState(activeClip?.scale ? Math.round(activeClip.scale * 100) : 105);
  const [rotation, setRotation] = useState(1.5);
  const [opacity, setOpacity] = useState(94);
  const [blendMode, setBlendMode] = useState<'normal' | 'luminosity' | 'screen' | 'overlay'>('luminosity');

  // Color Grade & LUT states
  const [lutIntensity, setLutIntensity] = useState(85);
  const [liftX, setLiftX] = useState(-0.08);
  const [liftY, setLiftY] = useState(0.04);
  const [gammaX, setGammaX] = useState(0.12);
  const [gammaY, setGammaY] = useState(-0.05);
  const [gainX, setGainX] = useState(-0.02);
  const [gainY, setGainY] = useState(-0.14);
  const [temp, setTemp] = useState(-12);
  const [tint, setTint] = useState(4);
  const [contrast, setContrast] = useState(1.18);
  const [saturation, setSaturation] = useState(108);

  // Vocal DSP states
  const [dspEnabled, setDspEnabled] = useState(true);
  const [noiseReduction, setNoiseReduction] = useState(-18.5);
  const [deEsserNotch, setDeEsserNotch] = useState(6.2);
  const [threshold, setThreshold] = useState(-14.0);
  const [ratio, setRatio] = useState('3.5 : 1');
  const [attackRel, setAttackRel] = useState('12ms / 85ms');
  const [activeVocalPreset, setActiveVocalPreset] = useState<'podcast' | 'denoise' | 'cinema'>('denoise');

  const clipTitle = activeClip?.name || 'HERO_CYBERPUNK_SCENE_03';

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden shadow-2xl flex flex-col font-sans text-on-surface">
      {/* Header bar */}
      <div className="p-3 bg-surface-container-low border-b border-outline-variant/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-primary-container text-slate-950 flex items-center justify-center font-bold text-xs">
            <Sliders className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-white uppercase truncate max-w-[190px]">
                {clipTitle}
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-surface-container-highest text-primary border border-outline-variant/40">
                4K PRORES 422HQ
              </span>
            </div>
            <div className="text-[10px] font-mono text-on-surface-variant flex items-center gap-2">
              <span>23.98 fps</span>
              <span>•</span>
              <span className="text-secondary-fixed">00:04:18:14</span>
              <span>•</span>
              <span>Rec.709-A</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-[10px] font-mono font-bold text-emerald-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          ACTIVE
        </div>
      </div>

      {/* Segmented Tab Controls */}
      <div className="flex items-center gap-1 p-1.5 bg-surface-container-low/50 border-b border-outline-variant/30 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('transform')}
          className={`flex-1 py-1.5 rounded-lg text-center font-bold transition text-[11px] ${
            activeTab === 'transform'
              ? 'bg-primary-container text-slate-950 shadow'
              : 'text-on-surface-variant hover:text-white'
          }`}
        >
          Transform
        </button>
        <button
          onClick={() => setActiveTab('color')}
          className={`flex-1 py-1.5 rounded-lg text-center font-bold transition text-[11px] ${
            activeTab === 'color'
              ? 'bg-primary-container text-slate-950 shadow'
              : 'text-on-surface-variant hover:text-white'
          }`}
        >
          Color Grade
        </button>
        <button
          onClick={() => setActiveTab('vocal')}
          className={`flex-1 py-1.5 rounded-lg text-center font-bold transition text-[11px] ${
            activeTab === 'vocal'
              ? 'bg-primary-container text-slate-950 shadow'
              : 'text-on-surface-variant hover:text-white'
          }`}
        >
          Vocal Clean
        </button>
        <button
          onClick={() => setActiveTab('curves')}
          className={`flex-1 py-1.5 rounded-lg text-center font-bold transition text-[11px] ${
            activeTab === 'curves'
              ? 'bg-primary-container text-slate-950 shadow'
              : 'text-on-surface-variant hover:text-white'
          }`}
        >
          Curve FX
        </button>
      </div>

      {/* Main Tab Views */}
      <div className="p-4 space-y-4 max-h-[640px] overflow-y-auto scrollbar-none">
        {/* TAB 1: SPATIAL TRANSFORM & MOTION */}
        {activeTab === 'transform' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase tracking-wider font-mono">
                <Move className="w-3.5 h-3.5 text-primary" />
                <span>Spatial Transform & Motion</span>
              </div>
              <button className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-primary/10 text-primary border border-primary/30">
                <span>+◇</span> KEYFRAME
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* POS X */}
              <div className="bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/30 space-y-1.5">
                <div className="flex justify-between text-[11px] font-mono text-on-surface-variant">
                  <span>POS X (CANVAS)</span>
                  <span className="text-primary font-bold">◇</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-white">{posX.toFixed(1)}</span>
                  <span className="text-[10px] text-on-surface-variant font-mono">px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="3840"
                  value={posX}
                  onChange={(e) => setPosX(parseFloat(e.target.value))}
                  className="w-full accent-primary h-1 bg-surface-container-highest rounded"
                />
              </div>

              {/* POS Y */}
              <div className="bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/30 space-y-1.5">
                <div className="flex justify-between text-[11px] font-mono text-on-surface-variant">
                  <span>POS Y (CANVAS)</span>
                  <span className="text-primary font-bold">◇</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-white">{posY.toFixed(1)}</span>
                  <span className="text-[10px] text-on-surface-variant font-mono">px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2160"
                  value={posY}
                  onChange={(e) => setPosY(parseFloat(e.target.value))}
                  className="w-full accent-primary h-1 bg-surface-container-highest rounded"
                />
              </div>
            </div>

            {/* UNIFORM SCALE */}
            <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/30 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-on-surface-variant">UNIFORM SCALE</span>
                <span className="text-primary font-bold">{scale.toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="250"
                value={scale}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setScale(val);
                  if (activeClip) onUpdateClip(activeClip.id, { scale: val / 100 });
                }}
                className="w-full accent-primary h-1.5 bg-surface-container-highest rounded"
              />
              <div className="flex justify-between text-[10px] font-mono text-on-surface-variant">
                <span>50%</span>
                <span>100% (Fit)</span>
                <span>250%</span>
              </div>
            </div>

            {/* ROTATION */}
            <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/30 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-on-surface-variant">ROTATION</span>
                <span className="text-primary font-bold">+{rotation.toFixed(1)}°</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={rotation}
                  onChange={(e) => setRotation(parseFloat(e.target.value))}
                  className="flex-1 accent-primary h-1 bg-surface-container-highest rounded"
                />
                <div className="flex gap-1">
                  {[-1, 0, 1, 90].map((deg) => (
                    <button
                      key={deg}
                      onClick={() => setRotation(deg)}
                      className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-surface-container-highest hover:bg-surface-bright text-white"
                    >
                      {deg > 0 ? `+${deg}°` : `${deg}°`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* OPACITY & BLEND MODE */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/30 space-y-1.5">
                <div className="flex justify-between text-[11px] font-mono text-on-surface-variant">
                  <span>OPACITY</span>
                  <span className="text-primary font-bold">{opacity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={opacity}
                  onChange={(e) => setOpacity(parseInt(e.target.value))}
                  className="w-full accent-primary h-1 bg-surface-container-highest rounded"
                />
              </div>

              <div className="bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/30 space-y-1.5">
                <div className="text-[11px] font-mono text-on-surface-variant">BLEND MODE</div>
                <select
                  value={blendMode}
                  onChange={(e) => setBlendMode(e.target.value as any)}
                  className="w-full bg-surface-container-highest border border-outline-variant/40 rounded px-2 py-1 text-xs text-white font-mono"
                >
                  <option value="luminosity">Luminosity</option>
                  <option value="normal">Normal</option>
                  <option value="screen">Screen</option>
                  <option value="overlay">Overlay</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: 3-WAY COLOR WHEELS & LUT PIPELINE */}
        {activeTab === 'color' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase tracking-wider font-mono">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>3-Way Color Wheels & LUT Pipeline</span>
              </div>
              <span className="text-[10px] font-mono text-on-surface-variant">Rec. 709</span>
            </div>

            {/* 3D LUT Selector */}
            <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/30 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-white truncate">CCMI_SciFi_Blade_Matrix.cube</span>
                <span className="text-secondary font-bold">{lutIntensity}%</span>
              </div>
              <p className="text-[10px] text-on-surface-variant font-mono">33-Point Precision 3D LUT</p>
              <input
                type="range"
                min="0"
                max="100"
                value={lutIntensity}
                onChange={(e) => setLutIntensity(parseInt(e.target.value))}
                className="w-full accent-secondary h-1.5 bg-surface-container-highest rounded"
              />
            </div>

            {/* 3 Color Wheels Display */}
            <div className="grid grid-cols-3 gap-2 text-center">
              {/* LIFT (Dark) */}
              <div className="bg-surface-container-low p-2 rounded-xl border border-outline-variant/30 flex flex-col items-center">
                <span className="text-[10px] font-mono text-on-surface-variant mb-1">LIFT (Dark)</span>
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-900/40 via-surface-container-highest to-slate-900 border border-outline-variant relative flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm" />
                </div>
                <span className="text-[9px] font-mono text-on-surface-variant mt-1.5">
                  X:{liftX} Y:+{liftY}
                </span>
              </div>

              {/* GAMMA (Mids) */}
              <div className="bg-surface-container-low p-2 rounded-xl border border-outline-variant/30 flex flex-col items-center">
                <span className="text-[10px] font-mono text-on-surface-variant mb-1">GAMMA (Mids)</span>
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-900/40 via-surface-container-highest to-slate-900 border border-outline-variant relative flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm" />
                </div>
                <span className="text-[9px] font-mono text-on-surface-variant mt-1.5">
                  X:+{gammaX} Y:{gammaY}
                </span>
              </div>

              {/* GAIN (High) */}
              <div className="bg-surface-container-low p-2 rounded-xl border border-outline-variant/30 flex flex-col items-center">
                <span className="text-[10px] font-mono text-on-surface-variant mb-1">GAIN (High)</span>
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-900/40 via-surface-container-highest to-slate-900 border border-outline-variant relative flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-300 shadow-sm" />
                </div>
                <span className="text-[9px] font-mono text-on-surface-variant mt-1.5">
                  X:{gainX} Y:{gainY}
                </span>
              </div>
            </div>

            {/* Sliders Temp, Tint, Contrast, Saturation */}
            <div className="grid grid-cols-2 gap-3 text-[11px] font-mono">
              <div className="bg-surface-container-low p-2 rounded-xl border border-outline-variant/30 space-y-1">
                <div className="flex justify-between text-on-surface-variant">
                  <span>TEMP</span>
                  <span className="text-cyan-300">{temp} (Cool)</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={temp}
                  onChange={(e) => setTemp(parseInt(e.target.value))}
                  className="w-full accent-cyan-400 h-1 bg-surface-container-highest rounded"
                />
              </div>

              <div className="bg-surface-container-low p-2 rounded-xl border border-outline-variant/30 space-y-1">
                <div className="flex justify-between text-on-surface-variant">
                  <span>TINT</span>
                  <span className="text-emerald-300">+{tint} (Magenta)</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={tint}
                  onChange={(e) => setTint(parseInt(e.target.value))}
                  className="w-full accent-emerald-400 h-1 bg-surface-container-highest rounded"
                />
              </div>

              <div className="bg-surface-container-low p-2 rounded-xl border border-outline-variant/30 space-y-1">
                <div className="flex justify-between text-on-surface-variant">
                  <span>CONTRAST</span>
                  <span className="text-primary">{contrast.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.05"
                  value={contrast}
                  onChange={(e) => setContrast(parseFloat(e.target.value))}
                  className="w-full accent-primary h-1 bg-surface-container-highest rounded"
                />
              </div>

              <div className="bg-surface-container-low p-2 rounded-xl border border-outline-variant/30 space-y-1">
                <div className="flex justify-between text-on-surface-variant">
                  <span>SATURATION</span>
                  <span className="text-secondary">{saturation}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={saturation}
                  onChange={(e) => setSaturation(parseInt(e.target.value))}
                  className="w-full accent-secondary h-1 bg-surface-container-highest rounded"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: VOCAL CLEAN PRO DSP ENGINE */}
        {activeTab === 'vocal' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase tracking-wider font-mono">
                  <Activity className="w-3.5 h-3.5 text-secondary" />
                  <span>Vocal Clean Pro DSP Engine</span>
                </div>
                <p className="text-[10px] text-on-surface-variant font-mono">Neural Isolation & Phase Coherence</p>
              </div>

              <button
                onClick={() => setDspEnabled(!dspEnabled)}
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 ${
                  dspEnabled
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                    : 'bg-surface-container-highest text-slate-500'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${dspEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                DSP ON
              </button>
            </div>

            {/* 4-Band Parametric EQ Curve Graphic */}
            <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/30 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-white font-bold">4-BAND PARAMETRIC EQ CURVE</span>
                <span className="text-primary font-semibold">B3 NOTCH: 6.2 kHz (-4.2dB)</span>
              </div>

              {/* Graphic SVG EQ Curve */}
              <div className="h-20 bg-surface-container-lowest rounded-lg border border-outline-variant/20 relative overflow-hidden flex items-center px-2">
                <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                  {/* Grid lines */}
                  <line x1="0" y1="50" x2="400" y2="50" stroke="#242B35" strokeDasharray="3 3" />
                  <line x1="80" y1="0" x2="80" y2="100" stroke="#242B35" strokeWidth="0.5" />
                  <line x1="160" y1="0" x2="160" y2="100" stroke="#242B35" strokeWidth="0.5" />
                  <line x1="260" y1="0" x2="260" y2="100" stroke="#242B35" strokeWidth="0.5" />
                  <line x1="340" y1="0" x2="340" y2="100" stroke="#242B35" strokeWidth="0.5" />

                  {/* Parametric Curve Path */}
                  <path
                    d="M 0 50 Q 50 30, 80 40 T 160 65 T 260 25 T 320 80 T 400 50"
                    fill="none"
                    stroke="#00E5FF"
                    strokeWidth="2.5"
                  />
                  {/* Nodes */}
                  <circle cx="80" cy="40" r="3.5" fill="#c3f5ff" />
                  <circle cx="160" cy="65" r="3.5" fill="#00e5ff" />
                  <circle cx="260" cy="25" r="4" fill="#00daf3" stroke="#fff" strokeWidth="1" />
                  <circle cx="320" cy="80" r="3.5" fill="#ffffff" />
                </svg>
              </div>

              <div className="flex justify-between text-[9px] font-mono text-on-surface-variant">
                <span>80 Hz</span>
                <span>250 Hz</span>
                <span>1.2 kHz</span>
                <span>6.2 kHz (De-Ess)</span>
                <span>16 kHz</span>
              </div>
            </div>

            {/* Denoise & De-Esser Controls */}
            <div className="grid grid-cols-2 gap-3 text-[11px] font-mono">
              <div className="bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/30 space-y-1.5">
                <div className="flex justify-between text-on-surface-variant">
                  <span>NOISE REDUCTION</span>
                  <span className="text-secondary font-bold">{noiseReduction} dB</span>
                </div>
                <input
                  type="range"
                  min="-36"
                  max="0"
                  value={noiseReduction}
                  onChange={(e) => setNoiseReduction(parseFloat(e.target.value))}
                  className="w-full accent-secondary h-1 bg-surface-container-highest rounded"
                />
                <div className="flex justify-between text-[9px] text-on-surface-variant">
                  <span>Mode: AI Spectral</span>
                  <span className="text-emerald-400 font-bold">ROOM LEARNED</span>
                </div>
              </div>

              <div className="bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/30 space-y-1.5">
                <div className="flex justify-between text-on-surface-variant">
                  <span>DE-ESSER NOTCH</span>
                  <span className="text-primary font-bold">{deEsserNotch} kHz</span>
                </div>
                <input
                  type="range"
                  min="3.0"
                  max="10.0"
                  step="0.1"
                  value={deEsserNotch}
                  onChange={(e) => setDeEsserNotch(parseFloat(e.target.value))}
                  className="w-full accent-primary h-1 bg-surface-container-highest rounded"
                />
                <div className="flex justify-between text-[9px] text-on-surface-variant">
                  <span>Width: Narrow 0.8Q</span>
                  <span className="text-primary font-bold">S-REDUCTION ON</span>
                </div>
              </div>
            </div>

            {/* Dynamics & Compressor */}
            <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/30 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-white font-bold">DYNAMICS & COMPRESSOR</span>
                <span className="text-amber-300 font-bold">Gain Redux (GR): -3.2 dB</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                <div className="bg-surface-container-highest p-1.5 rounded">
                  <div className="text-on-surface-variant">THRESHOLD</div>
                  <div className="text-white font-bold text-xs">{threshold} dB</div>
                </div>
                <div className="bg-surface-container-highest p-1.5 rounded">
                  <div className="text-on-surface-variant">RATIO</div>
                  <div className="text-white font-bold text-xs">{ratio}</div>
                </div>
                <div className="bg-surface-container-highest p-1.5 rounded">
                  <div className="text-on-surface-variant">ATTACK / REL</div>
                  <div className="text-white font-bold text-xs">{attackRel}</div>
                </div>
              </div>

              {/* TRUE PEAK COMPLIANCE - BROADCAST SAFE LED BAR */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-on-surface-variant">TRUE PEAK COMPLIANCE</span>
                  <span className="text-secondary font-bold">-0.1 dBTP (Broadcast Safe)</span>
                </div>
                <div className="h-2 bg-surface-container-lowest rounded-full overflow-hidden flex gap-0.5 p-0.5 border border-outline-variant/30">
                  <div className="h-full flex-1 bg-secondary rounded-sm" />
                  <div className="h-full flex-1 bg-secondary rounded-sm" />
                  <div className="h-full flex-1 bg-secondary rounded-sm" />
                  <div className="h-full flex-1 bg-secondary rounded-sm" />
                  <div className="h-full flex-1 bg-primary rounded-sm" />
                  <div className="h-full w-4 bg-amber-400 rounded-sm" />
                  <div className="h-full w-2 bg-rose-500 rounded-sm opacity-20" />
                </div>
                <div className="flex justify-between text-[8px] font-mono text-on-surface-variant">
                  <span>-48 dB</span>
                  <span>-24 dB</span>
                  <span>-12 dB</span>
                  <span>-6 dB</span>
                  <span>-0.1 dBTP</span>
                  <span className="text-rose-400">0.0 CLIP</span>
                </div>
              </div>
            </div>

            {/* Vocal FX Master Presets Cards */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-white font-bold">Vocal FX Master Presets</span>
                <button className="text-primary text-[10px] hover:underline">Save New 🗎</button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setActiveVocalPreset('podcast')}
                  className={`p-2 rounded-xl text-center space-y-1 transition border ${
                    activeVocalPreset === 'podcast'
                      ? 'bg-surface-container-high border-primary text-white shadow'
                      : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant'
                  }`}
                >
                  <Activity className="w-4 h-4 mx-auto text-primary" />
                  <div className="text-[11px] font-bold">Podcast Studio</div>
                  <div className="text-[9px] text-on-surface-variant">Warm Punch</div>
                </button>

                <button
                  onClick={() => setActiveVocalPreset('denoise')}
                  className={`p-2 rounded-xl text-center space-y-1 transition border ${
                    activeVocalPreset === 'denoise'
                      ? 'bg-primary-container/20 border-primary-container text-white shadow'
                      : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant'
                  }`}
                >
                  <Sliders className="w-4 h-4 mx-auto text-primary-container" />
                  <div className="text-[11px] font-bold">Cyber De-Noise</div>
                  <div className="text-[9px] text-primary-container font-mono">Active Engine</div>
                </button>

                <button
                  onClick={() => setActiveVocalPreset('cinema')}
                  className={`p-2 rounded-xl text-center space-y-1 transition border ${
                    activeVocalPreset === 'cinema'
                      ? 'bg-surface-container-high border-secondary text-white shadow'
                      : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant'
                  }`}
                >
                  <Volume2 className="w-4 h-4 mx-auto text-secondary" />
                  <div className="text-[11px] font-bold">Cinema Dialogue</div>
                  <div className="text-[9px] text-on-surface-variant">Wide Dynamic</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CURVE FX */}
        {activeTab === 'curves' && (
          <div className="p-4 text-center text-xs font-mono text-on-surface-variant space-y-2">
            <Flame className="w-8 h-8 text-primary mx-auto animate-pulse" />
            <div className="text-white font-bold">Bezier Speed Ramps & Keyframe Curves</div>
            <p className="text-[11px]">Control dinámico de interpolación suave entre cortes y transiciones cinemáticas.</p>
          </div>
        )}
      </div>
    </div>
  );
};
