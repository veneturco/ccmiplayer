import React, { useState } from 'react';
import {
  Download, Cpu, Zap, Pause, Play, X, RefreshCw,
  HardDrive, Youtube, Share2, Film, CheckCircle2, ShieldCheck, Layers
} from 'lucide-react';
import { RenderResolution, AspectRatio } from '../types';

interface ExportProEngineProps {
  onStartRender?: (res: RenderResolution) => void;
  isRendering?: boolean;
  renderProgress?: number;
  onAbort?: () => void;
}

export const ExportProEngine: React.FC<ExportProEngineProps> = ({
  onStartRender,
  isRendering = false,
  renderProgress = 68,
  onAbort,
}) => {
  const [resolution, setResolution] = useState<'720p' | '1080p' | '4k' | '8k'>('4k');
  const [fps, setFps] = useState<number>(60);
  const [framingRatio, setFramingRatio] = useState<AspectRatio>('16:9');
  const [codec, setCodec] = useState<'mp4' | 'mov' | 'hevc'>('hevc');
  const [bitrateMbps, setBitrateMbps] = useState<number>(65.0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden shadow-2xl flex flex-col font-sans text-on-surface">
      {/* Header bar */}
      <div className="p-3.5 bg-surface-container-low border-b border-outline-variant/30 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
              PRO RENDER ENGINE ONLINE
            </span>
          </div>
          <h2 className="text-sm font-bold text-white font-mono tracking-tight mt-0.5">
            Export Pro Master Engine
          </h2>
          <div className="text-[10px] font-mono text-on-surface-variant flex items-center gap-1.5 mt-0.5">
            <Film className="w-3 h-3 text-cyan-400" />
            <span className="text-cyan-300 font-bold">CYBER_TRAILER_4K_MASTER_FINAL.mp4</span>
          </div>
        </div>

        <div className="px-2 py-1 rounded-lg bg-surface-container-highest border border-outline-variant/40 text-[10px] font-mono text-primary flex items-center gap-1">
          <Cpu className="w-3 h-3" />
          <span>NODE_ACCEL_01</span>
        </div>
      </div>

      {/* Meta Telemetry Row */}
      <div className="px-4 py-2 bg-surface-container-low/40 border-b border-outline-variant/20 flex items-center justify-between text-[11px] font-mono">
        <div className="flex items-center gap-1 text-on-surface-variant">
          <span>FILE EST.</span>
          <strong className="text-white">1.42 GB</strong>
        </div>
        <div className="flex items-center gap-1 text-on-surface-variant">
          <span>RENDER ETA</span>
          <strong className="text-emerald-400">00:01:14</strong>
        </div>
      </div>

      <div className="p-4 space-y-4 max-h-[640px] overflow-y-auto scrollbar-none">
        {/* CARD 1: ACTIVE HARDWARE PIPELINE */}
        <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase font-mono">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Active Hardware Pipeline</span>
            </div>
            <span className="text-xs font-mono font-bold text-primary">{renderProgress}% COMPLETED</span>
          </div>

          {/* Mini Monitor live out & hardware stats */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            {/* Live out frame */}
            <div className="sm:col-span-5 relative h-24 rounded-lg overflow-hidden bg-slate-950 border border-outline-variant/40 flex items-center justify-center">
              <div className="absolute top-1 left-1 px-1.5 py-0.2 rounded bg-rose-950/80 text-[8px] font-mono font-bold text-rose-300 border border-rose-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                LIVE_OUT
              </div>
              <Film className="w-8 h-8 text-cyan-400/40" />
              <div className="absolute bottom-1 left-1.5 text-[9px] font-mono text-primary font-bold">
                TC 00:01:42:18
              </div>
            </div>

            {/* Hardware metrics bars */}
            <div className="sm:col-span-7 space-y-2 text-[10px] font-mono">
              <div className="space-y-1">
                <div className="flex justify-between text-on-surface-variant">
                  <span className="flex items-center gap-1">⚡ GPU Metal Accel</span>
                  <span className="text-primary font-bold">94%</span>
                </div>
                <div className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '94%' }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-on-surface-variant">
                  <span className="flex items-center gap-1">🧠 Neural Engine</span>
                  <span className="text-secondary font-bold">82%</span>
                </div>
                <div className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-secondary rounded-full" style={{ width: '82%' }} />
                </div>
              </div>

              <div className="flex justify-between pt-1 text-[9px] text-on-surface-variant">
                <span>Codec Route:</span>
                <span className="text-cyan-300 font-bold bg-surface-container-highest px-1.5 py-0.2 rounded">
                  ProRes &gt; HEVC HW
                </span>
              </div>
            </div>
          </div>

          {/* Master Progress Bar */}
          <div className="space-y-1">
            <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary via-cyan-400 to-secondary rounded-full shadow-[0_0_10px_rgba(0,229,255,0.8)]"
                style={{ width: `${renderProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-on-surface-variant">
              <span>Frame 2,448 / 3,600</span>
              <span className="text-secondary font-bold">🔄 59.94 FPS REALTIME</span>
            </div>
          </div>
        </div>

        {/* CARD 2: MASTER MASTERING PARAMETERS */}
        <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/30 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="text-white font-bold uppercase tracking-wider">Master Mastering Parameters</span>
            <button className="text-[10px] text-primary hover:underline">LOAD PRESET ⚙</button>
          </div>

          {/* CANVAS RESOLUTION */}
          <div className="space-y-1.5">
            <div className="text-[10px] text-on-surface-variant">CANVAS RESOLUTION</div>
            <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
              {(['720p', '1080p', '4k', '8k'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setResolution(r)}
                  className={`py-1.5 rounded-lg font-bold border transition ${
                    resolution === r
                      ? 'bg-primary-container text-slate-950 border-primary shadow'
                      : 'bg-surface-container-high border-outline-variant/30 text-on-surface hover:text-white'
                  }`}
                >
                  {r === '4k' ? '4K UHD' : r === '8k' ? '8K RAW' : r === '1080p' ? '1080p FHD' : '720p'}
                </button>
              ))}
            </div>
          </div>

          {/* TIMEBASE FRAME RATE */}
          <div className="space-y-1.5">
            <div className="text-[10px] text-on-surface-variant">TIMEBASE FRAME RATE</div>
            <div className="grid grid-cols-5 gap-1 text-center text-xs">
              {[24, 25, 30, 50, 60].map((f) => (
                <button
                  key={f}
                  onClick={() => setFps(f)}
                  className={`py-1 rounded-lg font-bold border transition ${
                    fps === f
                      ? 'bg-secondary text-slate-950 border-secondary font-black shadow'
                      : 'bg-surface-container-high border-outline-variant/30 text-on-surface hover:text-white'
                  }`}
                >
                  {f} fps
                </button>
              ))}
            </div>
          </div>

          {/* ASPECT FRAMING RATIO */}
          <div className="space-y-1.5">
            <div className="text-[10px] text-on-surface-variant">ASPECT FRAMING RATIO</div>
            <div className="grid grid-cols-4 gap-1.5 text-center text-[11px]">
              {[
                { id: '16:9', label: '16:9 Wide' },
                { id: '9:16', label: '9:16 Reel' },
                { id: '1:1', label: '1:1 Post' },
                { id: '4:5', label: '4:5 Feed' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setFramingRatio(item.id as AspectRatio)}
                  className={`p-2 rounded-lg border font-bold flex flex-col items-center gap-1 transition ${
                    framingRatio === item.id
                      ? 'bg-primary-container/20 border-primary text-primary shadow'
                      : 'bg-surface-container-high border-outline-variant/30 text-on-surface'
                  }`}
                >
                  <div className="w-4 h-3 border border-current rounded-xs" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* CODEC ENGINE & PRECISION */}
          <div className="space-y-1.5">
            <div className="text-[10px] text-on-surface-variant">CODEC ENGINE & PRECISION</div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <button
                onClick={() => setCodec('mp4')}
                className={`p-2 rounded-lg border text-left space-y-0.5 ${
                  codec === 'mp4'
                    ? 'bg-primary-container/20 border-primary text-white'
                    : 'bg-surface-container-high border-outline-variant/30 text-on-surface'
                }`}
              >
                <div className="font-bold">MP4</div>
                <div className="text-[9px] text-on-surface-variant">H.264 Universal</div>
              </button>

              <button
                onClick={() => setCodec('mov')}
                className={`p-2 rounded-lg border text-left space-y-0.5 ${
                  codec === 'mov'
                    ? 'bg-primary-container/20 border-primary text-white'
                    : 'bg-surface-container-high border-outline-variant/30 text-on-surface'
                }`}
              >
                <div className="font-bold">MOV</div>
                <div className="text-[9px] text-on-surface-variant">ProRes 422 HQ</div>
              </button>

              <button
                onClick={() => setCodec('hevc')}
                className={`p-2 rounded-lg border text-left space-y-0.5 relative ${
                  codec === 'hevc'
                    ? 'bg-primary-container/20 border-primary text-white'
                    : 'bg-surface-container-high border-outline-variant/30 text-on-surface'
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>HEVC</span>
                  <span className="text-secondary text-[10px]">✔</span>
                </div>
                <div className="text-[9px] text-on-surface-variant">H.265 10-Bit HDR</div>
              </button>
            </div>
          </div>

          {/* QUALITY PROFILE & BITRATE */}
          <div className="space-y-2 pt-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-on-surface-variant">QUALITY PROFILE:</span>
              <span className="text-secondary font-bold">● MAX PRODUCTION (VBR 2-PASS)</span>
            </div>

            <div className="flex justify-between text-[11px]">
              <span className="text-on-surface-variant">Target Bitrate Rate</span>
              <span className="text-white font-bold">{bitrateMbps.toFixed(1)} Mbps</span>
            </div>

            <input
              type="range"
              min="10"
              max="150"
              value={bitrateMbps}
              onChange={(e) => setBitrateMbps(parseFloat(e.target.value))}
              className="w-full accent-primary h-1.5 bg-surface-container-highest rounded"
            />

            <div className="flex justify-between text-[10px] text-on-surface-variant pt-1 border-t border-outline-variant/20">
              <span className="flex items-center gap-1 text-emerald-400">
                <span>🔊</span> Master Audio Bus
              </span>
              <span>PCM/AAC 320k 48kHz 24b</span>
            </div>
          </div>
        </div>

        {/* CARD 3: EXPORT DISPATCH DESTINATIONS */}
        <div className="bg-surface-container-low p-3.5 rounded-xl border border-outline-variant/30 space-y-2.5 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="text-white font-bold uppercase tracking-wider">Export Dispatch Destinations</span>
            <span className="text-[10px] text-on-surface-variant">MULTI-TARGET</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-lg bg-surface-container-high border border-outline-variant/30 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-primary" />
              <div>
                <div className="text-white font-bold text-[11px]">Local Storage</div>
                <div className="text-[9px] text-on-surface-variant">Master Raw Save</div>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-surface-container-high border border-outline-variant/30 flex items-center gap-2">
              <Youtube className="w-4 h-4 text-rose-500" />
              <div>
                <div className="text-white font-bold text-[11px]">YouTube 4K</div>
                <div className="text-[9px] text-on-surface-variant">Direct Broadcast</div>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-surface-container-high border border-outline-variant/30 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <div>
                <div className="text-white font-bold text-[11px]">Cloud Sync</div>
                <div className="text-[9px] text-on-surface-variant">CCMI Vault Archive</div>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-surface-container-high border border-outline-variant/30 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <div>
                <div className="text-white font-bold text-[11px]">TikTok Studio</div>
                <div className="text-[9px] text-on-surface-variant">Auto-Slice &amp; Tag</div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM ACTION BUTTONS: ABORT vs PAUSE & PRIORITIZE */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={onAbort}
            className="py-3 px-4 rounded-xl bg-surface-container-high hover:bg-surface-bright text-white border border-outline-variant/40 font-mono font-bold text-xs flex items-center justify-center gap-2 transition active:scale-98"
          >
            <X className="w-4 h-4 text-rose-400" />
            <span>ABORT</span>
          </button>

          <button
            onClick={() => setIsPaused(!isPaused)}
            className="py-3 px-4 rounded-xl bg-primary-container hover:bg-primary-fixed text-slate-950 font-mono font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/40 transition active:scale-98"
          >
            <RefreshCw className={`w-4 h-4 text-slate-950 ${isPaused ? '' : 'animate-spin'}`} />
            <span>{isPaused ? 'RESUME EXPORT' : 'PAUSE & PRIORITIZE'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
