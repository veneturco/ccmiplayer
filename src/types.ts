export * from './types/editor';

export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:5';

export type DeviceMode = 'desktop' | 'mobile';

export type UserPlanTier = 'basic' | 'premium';

export type RenderResolution = '720p' | '1080p';

export type ClipTransitionType =
  | 'none'
  | 'fade'
  | 'flash-white'
  | 'flash-black'
  | 'zoom-in'
  | 'zoom-out'
  | 'slide-left'
  | 'slide-right'
  | 'blur-fade'
  | 'glitch';

export type ClipTransition = ClipTransitionType;

export interface TransitionPreset {
  id: ClipTransitionType;
  name: string;
  category: 'Básicas' | 'Luz & Color' | 'Movimiento' | 'Efectos';
  icon: string;
  description: string;
}

export interface MediaClip {
  id: string;
  type: 'video' | 'image';
  url: string;
  name: string;
  duration: number; // in seconds (active duration on timeline)
  transition: ClipTransitionType;
  transitionDuration: number; // 0.2 to 2.0 seconds
  kenBurns?: boolean; // smooth motion for static images (optional)
  fitMode?: 'cover' | 'contain'; // 'contain' displays entire media without zoom/crop
  scale?: number; // custom zoom level (default 1.0)
  trimStart?: number; // in-point: start offset in seconds from source video (default 0)
  trimEnd?: number; // out-point: end offset in seconds from source video
  originalDuration?: number; // total duration of the original media file in seconds
}

export interface TextOverlay {
  id: string;
  text: string;
  x: number; // 0 to 100 percentage
  y: number; // 0 to 100 percentage
  fontSize: number; // px
  fontFamily: string;
  color: string;
  strokeColor: string;
  strokeWidth: number;
  bgColor: string;
  shadowColor?: string;
  shadowBlur?: number;
  animation: 'none' | 'pop' | 'fade' | 'slide' | 'glow';
  startTime: number;
  endTime: number;
}

export type StickerType =
  | 'ecg-heart'
  | 'medical-cross'
  | 'doctor-badge'
  | 'ambulance'
  | 'iso-certified'
  | 'emergency-247'
  | 'call-cta'
  | 'calendar-appointment'
  | 'arrow-animated'
  | 'verified-badge'
  | 'heart-pulse'
  | 'star-rating'
  | 'like-share';

export interface StickerOverlay {
  id: string;
  type: StickerType;
  title: string;
  subtitle?: string;
  color?: string;
  x: number; // 0 to 100
  y: number; // 0 to 100
  scale: number;
  startTime: number;
  endTime: number;
}

export interface BackgroundTextConfig {
  enabled: boolean;
  text: string;
  opacity: number; // 0.05 to 0.4
  fontSize: number;
  color: string;
  y: number;
}

export interface SubtitleConfig {
  enabled: boolean;
  styleId: string;
  x: number; // 50% center
  y: number; // e.g. 82%
  fontSize: number;
  color: string;
  outlineColor: string;
  outlineWidth: number;
  bgColor: string;
  fontFamily: string;
  uppercase: boolean;
  shadowBlur: number;
  shadowColor: string;
  wordHighlight: boolean; // karaoke-style active word highlighting
  animation: 'pop' | 'fade' | 'slide' | 'glow' | 'none';
}

export interface VideoFilterSettings {
  preset:
    | 'normal'
    | 'medical-clean'
    | 'warm-human'
    | 'cinematic'
    | 'teal-orange'
    | 'vibrant'
    | 'vhs-retro'
    | 'bw-drama'
    | 'emerald-care';
  brightness: number; // 0.6 to 1.4
  contrast: number; // 0.6 to 1.5
  saturation: number; // 0 to 2
  warmth: number; // -30 to 30
  vignette: number; // 0 to 1
}

export interface ScriptScene {
  id: string;
  sceneNumber: number;
  timeRange: string;
  startSeconds: number;
  endSeconds: number;
  text: string;
  title: string;
  category: 'cuidado' | 'atencion' | 'coordinacion' | 'instalaciones' | 'intermedio';
  highlightWords: string[];
  audioBase64?: string;
  audioBlobUrl?: string;
  audioDuration?: number;
  imageUrl?: string;
  videoUrl?: string;
  visualTag: string;
}

export type VoiceOption = 'Kore' | 'Zephyr' | 'Puck' | 'Charon' | 'Fenrir';

export interface VoicePreset {
  id: VoiceOption;
  name: string;
  gender: 'Femenina' | 'Masculino';
  description: string;
  character: string;
  recommendedTone: string;
  sampleText: string;
}

export interface DirectorAnalysis {
  overallPacing: string;
  directorNote: string;
  sceneFeedback?: Array<{
    sceneId: string;
    toneRecommendation: string;
    emphasisWords: string[];
    breathingAdvice: string;
  }>;
}

export interface CapCutTemplate {
  id: string;
  name: string;
  description: string;
  aspectRatio: AspectRatio;
  subtitleStyle: string;
  filterPreset: VideoFilterSettings['preset'];
  duration: number;
  badgeTitle: string;
}

export type VocalCleanPreset = 'studio-pro' | 'noise-reduction' | 'podcast-warm' | 'crisp-broadcast';

export interface VocalCleanPresetInfo {
  id: VocalCleanPreset;
  name: string;
  badge: string;
  description: string;
  eqDescription: string;
  noiseReductionAmount: number;
  warmthBoost: number;
  presenceBoost: number;
  airBoost: number;
}

export interface VocalCleanConfig {
  enabled: boolean;
  preset: VocalCleanPreset;
  noiseReductionAmount: number; // 0 to 1
  warmthBoost: number; // -6 to +6 dB
  presenceBoost: number; // 0 to +8 dB
  airBoost: number; // 0 to +6 dB
  deEsser: boolean;
  normalize: boolean;
}
