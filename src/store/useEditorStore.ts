// src/store/useEditorStore.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { temporal } from 'zundo';
import { 
  ScriptScene, MediaClip, SubtitleConfig, TextOverlay, 
  StickerOverlay, VideoFilterSettings, AspectRatio, BackgroundTextConfig 
} from '../types';
import { 
  INITIAL_SCENES, INITIAL_MEDIA_CLIPS, INITIAL_SUBTITLE_CONFIG
} from '../data/initialScript';

interface EditorState {
  scenes: ScriptScene[];
  mediaClips: MediaClip[];
  totalDuration: number;
  aspectRatio: AspectRatio;
  subtitleConfig: SubtitleConfig;
  textOverlays: TextOverlay[];
  stickers: StickerOverlay[];
  filterSettings: VideoFilterSettings;
  backgroundText: BackgroundTextConfig;
  rawScriptText: string;
}

interface EditorActions {
  // Actions with functional update support
  setScenes: (scenes: ScriptScene[] | ((prev: ScriptScene[]) => ScriptScene[])) => void;
  setMediaClips: (clips: MediaClip[] | ((prev: MediaClip[]) => MediaClip[])) => void;
  updateMediaClip: (id: string, updates: Partial<MediaClip>) => void;
  deleteMediaClip: (id: string) => void;
  setTotalDuration: (duration: number) => void;
  setAspectRatio: (ratio: AspectRatio) => void;
  setSubtitleConfig: (cfg: SubtitleConfig | Partial<SubtitleConfig> | ((prev: SubtitleConfig) => SubtitleConfig)) => void;
  updateSubtitleConfig: (cfg: Partial<SubtitleConfig>) => void;
  setTextOverlays: (overlays: TextOverlay[] | ((prev: TextOverlay[]) => TextOverlay[])) => void;
  addTextOverlay: (overlay: TextOverlay) => void;
  updateTextOverlay: (id: string, updates: Partial<TextOverlay>) => void;
  deleteTextOverlay: (id: string) => void;
  setStickers: (stickers: StickerOverlay[] | ((prev: StickerOverlay[]) => StickerOverlay[])) => void;
  addSticker: (sticker: StickerOverlay) => void;
  updateSticker: (id: string, updates: Partial<StickerOverlay>) => void;
  deleteSticker: (id: string) => void;
  setFilterSettings: (settings: VideoFilterSettings | Partial<VideoFilterSettings> | ((prev: VideoFilterSettings) => VideoFilterSettings)) => void;
  updateFilterSettings: (settings: Partial<VideoFilterSettings>) => void;
  setBackgroundText: (cfg: BackgroundTextConfig | Partial<BackgroundTextConfig> | ((prev: BackgroundTextConfig) => BackgroundTextConfig)) => void;
  updateBackgroundText: (cfg: Partial<BackgroundTextConfig>) => void;
  setRawScriptText: (text: string) => void;
}

export const useEditorStore = create<EditorState & EditorActions>()(
  temporal(
    immer((set) => ({
      // --- ESTADO INICIAL ---
      scenes: INITIAL_SCENES,
      mediaClips: INITIAL_MEDIA_CLIPS,
      totalDuration: 18,
      aspectRatio: '16:9',
      subtitleConfig: INITIAL_SUBTITLE_CONFIG,
      textOverlays: [],
      stickers: [],
      filterSettings: {
        preset: 'medical-clean', brightness: 1.05, contrast: 1.15, 
        saturation: 0.95, warmth: -5, vignette: 0.3,
      },
      backgroundText: {
        enabled: false, text: 'CCMI SALUD', opacity: 0.15, 
        fontSize: 72, color: '#ffffff', y: 50,
      },
      rawScriptText: '',

      // --- MUTACIONES CON SOPORTE FUNCIONAL (prev => next) ---
      setScenes: (scenes) =>
        set((state) => {
          state.scenes = typeof scenes === 'function' ? scenes(state.scenes) : scenes;
        }),
      setMediaClips: (clips) =>
        set((state) => {
          state.mediaClips = typeof clips === 'function' ? clips(state.mediaClips) : clips;
        }),
      updateMediaClip: (id, updates) =>
        set((state) => {
          const clip = state.mediaClips.find((c) => c.id === id);
          if (clip) Object.assign(clip, updates);
        }),
      deleteMediaClip: (id) =>
        set((state) => {
          state.mediaClips = state.mediaClips.filter((c) => c.id !== id);
        }),
      setTotalDuration: (dur) =>
        set((state) => {
          state.totalDuration = dur;
        }),
      setAspectRatio: (ratio) =>
        set((state) => {
          state.aspectRatio = ratio;
        }),
      setSubtitleConfig: (cfg) =>
        set((state) => {
          const next = typeof cfg === 'function' ? cfg(state.subtitleConfig) : cfg;
          Object.assign(state.subtitleConfig, next);
        }),
      updateSubtitleConfig: (cfg) =>
        set((state) => {
          Object.assign(state.subtitleConfig, cfg);
        }),

      setTextOverlays: (overlays) =>
        set((state) => {
          state.textOverlays = typeof overlays === 'function' ? overlays(state.textOverlays) : overlays;
        }),
      addTextOverlay: (overlay) =>
        set((state) => {
          state.textOverlays.push(overlay);
        }),
      updateTextOverlay: (id, updates) =>
        set((state) => {
          const txt = state.textOverlays.find((t) => t.id === id);
          if (txt) Object.assign(txt, updates);
        }),
      deleteTextOverlay: (id) =>
        set((state) => {
          state.textOverlays = state.textOverlays.filter((t) => t.id !== id);
        }),

      setStickers: (stickers) =>
        set((state) => {
          state.stickers = typeof stickers === 'function' ? stickers(state.stickers) : stickers;
        }),
      addSticker: (sticker) =>
        set((state) => {
          state.stickers.push(sticker);
        }),
      updateSticker: (id, updates) =>
        set((state) => {
          const stk = state.stickers.find((s) => s.id === id);
          if (stk) Object.assign(stk, updates);
        }),
      deleteSticker: (id) =>
        set((state) => {
          state.stickers = state.stickers.filter((s) => s.id !== id);
        }),

      setFilterSettings: (settings) =>
        set((state) => {
          const next = typeof settings === 'function' ? settings(state.filterSettings) : settings;
          Object.assign(state.filterSettings, next);
        }),
      updateFilterSettings: (settings) =>
        set((state) => {
          Object.assign(state.filterSettings, settings);
        }),
      setBackgroundText: (cfg) =>
        set((state) => {
          const next = typeof cfg === 'function' ? cfg(state.backgroundText) : cfg;
          Object.assign(state.backgroundText, next);
        }),
      updateBackgroundText: (cfg) =>
        set((state) => {
          Object.assign(state.backgroundText, cfg);
        }),
      setRawScriptText: (text) =>
        set((state) => {
          state.rawScriptText = text;
        }),
    })),
    {
      limit: 50, // Guardamos los últimos 50 pasos para Deshacer
      partialize: (state) => {
        const { rawScriptText, ...rest } = state;
        return rest;
      },
    }
  )
);
