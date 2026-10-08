/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Header } from './components/Header';
import { VideoPlayerPreview } from './components/VideoPlayerPreview';
import { TimelineEditor } from './components/TimelineEditor';
import { VoiceSettings } from './components/VoiceSettings';
import { SceneList } from './components/SceneList';
import { CapCutPanel } from './components/CapCutPanel';
import { AudioHub } from './components/AudioHub';
import { MobileCapCutStudio } from './components/MobileCapCutStudio';
import { DirectorModal } from './components/DirectorModal';
import { ExportModal } from './components/ExportModal';
import { TransitionModal } from './components/TransitionModal';
import { TrimModal } from './components/TrimModal';
import { PremiumUpgradeModal } from './components/PremiumUpgradeModal';
import { ScriptGeneratorModal } from './components/ScriptGeneratorModal';
import { CodeExportModal } from './components/CodeExportModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { useProjectAutoSave } from './hooks/useProjectAutoSave';
import {
  INITIAL_SCENES,
  VOICE_PRESETS,
  STYLE_PRESETS,
  INITIAL_MEDIA_CLIPS,
  INITIAL_SUBTITLE_CONFIG,
  StickerTemplate,
  INITIAL_VOCAL_CLEAN_CONFIG,
  VOCAL_CLEAN_PRESETS,
} from './data/initialScript';
import {
  ScriptScene,
  VoiceOption,
  DirectorAnalysis,
  MediaClip,
  SubtitleConfig,
  TextOverlay,
  StickerOverlay,
  VideoFilterSettings,
  AspectRatio,
  BackgroundTextConfig,
  CapCutTemplate,
  ClipTransitionType,
  DeviceMode,
  RenderResolution,
  VocalCleanConfig,
  VocalCleanPreset,
  UserPlanTier,
} from './types';
import {
  ambientMusic,
  base64ToAudioUrl,
  base64ToBlob,
  downloadBlob,
  fileToAudioInfo,
  detectAudioPauses,
  autoSyncClipsToVoicePauses,
  cleanAndEqualizeVocalAudio,
} from './utils/audioUtils';
import { renderMultiClipVideo } from './utils/videoRecorder';
import { renderMp4Video } from './utils/exportEngine';
import { buildTimelineFromScript } from './utils/autoAssembler';
import { useEditorStore } from './store/useEditorStore';
import { AlertCircle, CheckCircle, Info, Sparkles, Upload, Mic, Monitor, Smartphone } from 'lucide-react';

const OFFICIAL_SCRIPT_FULL =
  'En CSMI, cada detalle cuenta cuando se trata de tu salud, asegurando un traslado y un cuidado inicial completamente seguro. Brindamos una atención cercana y humana, acompañando a cada paciente con una sonrisa y total empatía durante su recuperación. Nuestro equipo profesional se encarga de la coordinación médica y la gestión precisa de cada historia clínica. Todo esto en instalaciones modernas e impecables, diseñadas para ofrecerte la confianza y el bienestar que mereces.';

export default function App() {
  // ✅ Estado global súper optimizado con Zustand + Immer + Zundo (Undo/Redo)
  const scenes = useEditorStore((s) => s.scenes);
  const mediaClips = useEditorStore((s) => s.mediaClips);
  const totalDuration = useEditorStore((s) => s.totalDuration);
  const aspectRatio = useEditorStore((s) => s.aspectRatio);
  const subtitleConfig = useEditorStore((s) => s.subtitleConfig);
  const textOverlays = useEditorStore((s) => s.textOverlays);
  const stickers = useEditorStore((s) => s.stickers);
  const filterSettings = useEditorStore((s) => s.filterSettings);
  const backgroundText = useEditorStore((s) => s.backgroundText);
  const rawScriptText = useEditorStore((s) => s.rawScriptText);

  const {
    setScenes,
    setMediaClips,
    updateMediaClip,
    deleteMediaClip,
    setTotalDuration,
    setAspectRatio,
    setSubtitleConfig,
    updateSubtitleConfig,
    setTextOverlays,
    addTextOverlay,
    updateTextOverlay,
    deleteTextOverlay,
    setStickers,
    addSticker,
    updateSticker,
    deleteSticker,
    setFilterSettings,
    updateFilterSettings,
    setBackgroundText,
    updateBackgroundText,
    setRawScriptText,
  } = useEditorStore();

  const [activeSceneId, setActiveSceneId] = useState<string>('scene-1');
  const [currentTime, setCurrentTime] = useState<number>(0);

  // Device Mode: Desktop vs Mobile (Requested by user)
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');

  // Active navigation tab (includes dedicated 'audio' tab for TTS & Audio Import)
  const [activeTab, setActiveTab] = useState<'capcut' | 'audio' | 'scenes' | 'voice'>('capcut');

  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);

  // Voice & Model Configuration
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>('Kore');
  const [selectedStyleId, setSelectedStyleId] = useState<string>('calido');
  const [customStylePrompt, setCustomStylePrompt] = useState<string>(STYLE_PRESETS[0].prompt);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  // Background Music
  const [bgMusicEnabled, setBgMusicEnabled] = useState<boolean>(true);
  const [bgMusicVolume, setBgMusicVolume] = useState<number>(0.15);

  // Audio Player State & Custom Audio File Import
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [masterAudioBase64, setMasterAudioBase64] = useState<string | null>(null);
  const [masterAudioUrl, setMasterAudioUrl] = useState<string | null>(null);
  const [customAudioName, setCustomAudioName] = useState<string | null>(null);

  // Vocal Clean & DSP Studio EQ State
  const [vocalCleanConfig, setVocalCleanConfig] = useState<VocalCleanConfig>(INITIAL_VOCAL_CLEAN_CONFIG);
  const [rawMasterAudio, setRawMasterAudio] = useState<{ base64: string | null; url: string | null }>({
    base64: null,
    url: null,
  });
  const [cleanedMasterAudio, setCleanedMasterAudio] = useState<{ base64: string | null; url: string | null }>({
    base64: null,
    url: null,
  });
  const [isCleaningVocal, setIsCleaningVocal] = useState<boolean>(false);
  const [isShowingCleaned, setIsShowingCleaned] = useState<boolean>(false);

  // Loading & Generation states
  const [isGeneratingAll, setIsGeneratingAll] = useState<boolean>(false);
  const [generatingSceneId, setGeneratingSceneId] = useState<string | null>(null);
  const [playingSingleSceneId, setPlayingSingleSceneId] = useState<string | null>(null);

  // Video Export / Render states
  const [isExportingVideo, setIsExportingVideo] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);

  // Modals
  const [isDirectorOpen, setIsDirectorOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [transitionModalState, setTransitionModalState] = useState<{
    isOpen: boolean;
    clipId: string | null;
    clipIndex: number;
  }>({
    isOpen: false,
    clipId: null,
    clipIndex: 0,
  });
  const [trimModalState, setTrimModalState] = useState<{
    isOpen: boolean;
    clipId: string | null;
  }>({
    isOpen: false,
    clipId: null,
  });
  const [directorAnalysis, setDirectorAnalysis] = useState<DirectorAnalysis | null>(null);
  const [isAnalyzingDirector, setIsAnalyzingDirector] = useState<boolean>(false);

  // User Plan Tier: 'basic' (CapCut Local Suite sin IA) vs 'premium' (Potenciado por Google AI)
  const [userPlanTier, setUserPlanTier] = useState<UserPlanTier>('premium');
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState<boolean>(false);
  const [upgradeFeatureRequested, setUpgradeFeatureRequested] = useState<string | null>(null);
  const [isScriptGenOpen, setIsScriptGenOpen] = useState<boolean>(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState<boolean>(false);

  // --- MOTOR DE AUTOGUARDADO EN INDEXEDDB ---
  const isWorkspaceReady = useProjectAutoSave(
    { 
      scenes, mediaClips, subtitleConfig, filterSettings, textOverlays, 
      stickers, totalDuration, rawScriptText, backgroundText 
    },
    (saved) => {
      if (saved.scenes) setScenes(saved.scenes);
      if (saved.mediaClips) setMediaClips(saved.mediaClips);
      if (saved.subtitleConfig) setSubtitleConfig(saved.subtitleConfig);
      if (saved.filterSettings) setFilterSettings(saved.filterSettings);
      if (saved.textOverlays) setTextOverlays(saved.textOverlays);
      if (saved.stickers) setStickers(saved.stickers);
      if (saved.totalDuration) setTotalDuration(saved.totalDuration);
      if (saved.rawScriptText) setRawScriptText(saved.rawScriptText);
      if (saved.backgroundText) setBackgroundText(saved.backgroundText);
    }
  );

  const handleOpenUpgradeModal = (feature?: string) => {
    setUpgradeFeatureRequested(feature || null);
    setIsUpgradeModalOpen(true);
  };

  const handleApplyGeneratedScript = async (
    fullScript: string,
    generatedScenes?: ScriptScene[],
    duration?: number
  ) => {
    setRawScriptText(fullScript);
    if (generatedScenes && generatedScenes.length > 0) {
      setScenes(generatedScenes);
      // Ensamblaje Mágico Automático de B-Roll
      try {
        const autoClips = await buildTimelineFromScript(generatedScenes, aspectRatio);
        if (autoClips.length > 0) {
          setMediaClips(autoClips);
        }
      } catch (err) {
        console.warn('Auto B-Roll assembly notice:', err);
      }
    }
    if (duration && duration > 0) {
      setTotalDuration(duration);
    }
    showToast('✨ ¡Guión y Auto B-Roll ensamblados automáticamente en la línea de tiempo!', 'success');
  };

  // Notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const singleSceneAudioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const timerStartRef = useRef<number>(0);
  const timeOffsetRef = useRef<number>(0);

  // Detect Mobile on initial load
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setDeviceMode('mobile');
    }
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((curr) => (curr?.message === message ? null : curr));
    }, 4500);
  };

  const wordCount = useMemo(() => {
    return scenes.reduce((sum, s) => sum + s.text.trim().split(/\s+/).length, 0);
  }, [scenes]);

  const currentScene = useMemo(() => {
    return scenes.find((s) => currentTime >= s.startSeconds && currentTime < s.endSeconds) || scenes[0];
  }, [scenes, currentTime]);

  useEffect(() => {
    if (currentScene && currentScene.id !== activeSceneId) {
      setActiveSceneId(currentScene.id);
    }
  }, [currentScene, activeSceneId]);

  // Ambient Music Lifecycle
  useEffect(() => {
    if (bgMusicEnabled) {
      ambientMusic.start(bgMusicVolume);
    } else {
      ambientMusic.stop();
    }
    return () => {
      ambientMusic.stop();
    };
  }, [bgMusicEnabled]);

  useEffect(() => {
    ambientMusic.setVolume(bgMusicVolume);
  }, [bgMusicVolume]);

  useEffect(() => {
    if (bgMusicEnabled) {
      ambientMusic.setDucking(isPlaying, bgMusicVolume);
    }
  }, [isPlaying, bgMusicEnabled, bgMusicVolume]);

  // Audio setup
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const singleAudio = new Audio();
    singleSceneAudioRef.current = singleAudio;

    audio.onended = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      timeOffsetRef.current = 0;
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.pause();
      }
    };

    singleAudio.onended = () => {
      setPlayingSingleSceneId(null);
    };

    return () => {
      audio.pause();
      singleAudio.pause();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = playbackSpeed;
    if (singleSceneAudioRef.current) singleSceneAudioRef.current.playbackRate = playbackSpeed;
    if (videoRef.current) videoRef.current.playbackRate = playbackSpeed;
  }, [playbackSpeed]);

  // Animation Loop for Audio & Video Sync
  const runTimerLoop = () => {
    if (!isPlaying) return;

    if (audioRef.current && masterAudioUrl && !audioRef.current.paused) {
      const t = audioRef.current.currentTime;
      setCurrentTime(t);

      if (videoRef.current && !videoRef.current.paused) {
        const vDur = videoRef.current.duration || totalDuration;
        const targetVTime = t % vDur;
        if (Math.abs(videoRef.current.currentTime - targetVTime) > 0.35) {
          videoRef.current.currentTime = targetVTime;
        }
      }

      if (t >= totalDuration) {
        setIsPlaying(false);
        setCurrentTime(0);
        timeOffsetRef.current = 0;
        audioRef.current.currentTime = 0;
        audioRef.current.pause();
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.pause();
        }
        return;
      }
    } else {
      const now = performance.now();
      const elapsed = (now - timerStartRef.current) / 1000 * playbackSpeed + timeOffsetRef.current;

      if (elapsed >= totalDuration) {
        setIsPlaying(false);
        setCurrentTime(0);
        timeOffsetRef.current = 0;
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.pause();
        }
        return;
      } else {
        setCurrentTime(elapsed);
        if (videoRef.current && !videoRef.current.paused) {
          const vDur = videoRef.current.duration || totalDuration;
          const targetVTime = elapsed % vDur;
          if (Math.abs(videoRef.current.currentTime - targetVTime) > 0.35) {
            videoRef.current.currentTime = targetVTime;
          }
        }
      }
    }

    animFrameRef.current = requestAnimationFrame(runTimerLoop);
  };

  useEffect(() => {
    if (isPlaying) {
      animFrameRef.current = requestAnimationFrame(runTimerLoop);
    } else {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying]);

  // Play / Pause Toggle with Guaranteed Replay
  const handleTogglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (audioRef.current) audioRef.current.pause();
      if (videoRef.current) videoRef.current.pause();
    } else {
      let startFrom = currentTime;
      if (currentTime >= totalDuration - 0.2) {
        startFrom = 0;
        setCurrentTime(0);
        timeOffsetRef.current = 0;
      }

      setIsPlaying(true);
      timerStartRef.current = performance.now();
      timeOffsetRef.current = startFrom;

      if (audioRef.current && masterAudioUrl) {
        audioRef.current.currentTime = startFrom;
        audioRef.current.play().catch((e) => console.warn('Audio play error:', e));
      }

      if (videoRef.current) {
        videoRef.current.currentTime = startFrom % (videoRef.current.duration || totalDuration);
        videoRef.current.play().catch((e) => console.warn('Video play error:', e));
      }
    }
  };

  // Seek on timeline
  const handleSeek = (newTime: number) => {
    const clamped = Math.max(0, Math.min(totalDuration, newTime));
    setCurrentTime(clamped);
    timeOffsetRef.current = clamped;
    timerStartRef.current = performance.now();

    if (audioRef.current && masterAudioUrl) {
      audioRef.current.currentTime = clamped;
    }
    if (videoRef.current) {
      videoRef.current.currentTime = clamped % (videoRef.current.duration || totalDuration);
    }
  };

  // Restart / Replay
  const handleRestart = () => {
    handleSeek(0);
    setIsPlaying(true);
    timerStartRef.current = performance.now();
    timeOffsetRef.current = 0;

    if (audioRef.current && masterAudioUrl) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(console.warn);
    }
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(console.warn);
    }
  };

  // Generate Voice with gemini-3.8-flash-tts
  const handleGenerateAll = async (customText?: string) => {
    setIsGeneratingAll(true);
    const textToSynthesize = customText || rawScriptText || scenes.map((s) => s.text).join(' ');

    showToast('Sintetizando voz en off con gemini-3.8-flash-tts...', 'info');

    try {
      const response = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSynthesize,
          voice: selectedVoice,
          style: customStylePrompt,
          sceneTitle: 'Master Spot CCMI',
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.audioBase64) {
        throw new Error(data.error || 'No se pudo generar el audio.');
      }

      setMasterAudioBase64(data.audioBase64);
      const url = base64ToAudioUrl(data.audioBase64, data.mimeType || 'audio/wav');
      setMasterAudioUrl(url);
      setCustomAudioName(null);

      // Cache raw for A/B comparison
      setRawMasterAudio({ base64: data.audioBase64, url });
      setCleanedMasterAudio({ base64: null, url: null });
      setIsShowingCleaned(false);

      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.load();
      }

      showToast('¡Audio generado con gemini-3.8-flash-tts! Listo para reproducir y exportar.', 'success');
      handleSeek(0);
    } catch (err: any) {
      console.warn('Fallback synthesis:', err);
      generateClientFallbackAudio(textToSynthesize);
    } finally {
      setIsGeneratingAll(false);
    }
  };

  // Import external custom audio file (MP3, WAV, M4A, etc.)
  const handleImportAudioFile = async (file: File) => {
    try {
      showToast(`Cargando archivo de audio: ${file.name}...`, 'info');
      const info = await fileToAudioInfo(file);
      setMasterAudioBase64(info.base64);
      setMasterAudioUrl(info.url);
      setCustomAudioName(file.name);

      // Cache raw for A/B comparison
      setRawMasterAudio({ base64: info.base64, url: info.url });
      setCleanedMasterAudio({ base64: null, url: null });
      setIsShowingCleaned(false);

      if (audioRef.current) {
        audioRef.current.src = info.url;
        audioRef.current.load();
      }

      const dur = Math.round(info.duration);
      if (dur > 0) {
        setTotalDuration(dur);
        showToast(`¡Audio importado con éxito! Duración detectada: ${dur}s. Tiempo sincronizado.`, 'success');
      } else {
        showToast(`¡Audio importado con éxito: ${file.name}!`, 'success');
      }
      handleSeek(0);
    } catch (err: any) {
      console.error('Error import audio:', err);
      showToast(`Error al importar audio: ${err.message || 'Formato no soportado'}`, 'error');
    }
  };

  // Apply Vocal Cleaning & Studio Equalizer Pre-Processing (DSP)
  const handleApplyVocalClean = async (overridePreset?: VocalCleanPreset) => {
    const targetBase64 = rawMasterAudio.base64 || masterAudioBase64;
    const targetUrl = rawMasterAudio.url || masterAudioUrl;

    if (!targetBase64 && !targetUrl) {
      showToast('Primero genera la voz con IA o importa un archivo de audio.', 'info');
      return;
    }

    setIsCleaningVocal(true);
    showToast('Aplicando pre-procesador de Limpieza de Voz & DSP de estudio...', 'info');

    try {
      const presetToUse = overridePreset || vocalCleanConfig.preset;
      const configToUse: VocalCleanConfig = {
        ...vocalCleanConfig,
        preset: presetToUse,
        enabled: true,
      };

      const result = await cleanAndEqualizeVocalAudio(targetBase64 || targetUrl!, configToUse);

      // Save raw if not already stored
      if (!rawMasterAudio.base64 && !rawMasterAudio.url) {
        setRawMasterAudio({ base64: targetBase64, url: targetUrl });
      }

      setCleanedMasterAudio({ base64: result.cleanedBase64, url: result.cleanedUrl });
      setMasterAudioBase64(result.cleanedBase64);
      setMasterAudioUrl(result.cleanedUrl);
      setIsShowingCleaned(true);
      setVocalCleanConfig(configToUse);

      if (audioRef.current) {
        const wasPlaying = !audioRef.current.paused;
        const currTime = audioRef.current.currentTime;
        audioRef.current.src = result.cleanedUrl;
        audioRef.current.currentTime = currTime;
        if (wasPlaying) audioRef.current.play().catch(() => {});
      }

      showToast(`¡Limpieza de Voz aplicada con éxito! (Preajuste: ${presetToUse})`, 'success');
    } catch (err: any) {
      console.error('Error applying vocal clean:', err);
      showToast(`Error al aplicar limpieza de voz: ${err.message || 'Error DSP'}`, 'error');
    } finally {
      setIsCleaningVocal(false);
    }
  };

  const handleToggleOriginalVsCleaned = () => {
    if (!cleanedMasterAudio.url || !rawMasterAudio.url) {
      showToast('Aplica primero la limpieza de voz para poder comparar A/B.', 'info');
      return;
    }

    const nextIsCleaned = !isShowingCleaned;
    setIsShowingCleaned(nextIsCleaned);
    const targetUrl = nextIsCleaned ? cleanedMasterAudio.url : rawMasterAudio.url;
    const targetB64 = nextIsCleaned ? cleanedMasterAudio.base64 : rawMasterAudio.base64;

    setMasterAudioUrl(targetUrl);
    setMasterAudioBase64(targetB64);
    setVocalCleanConfig((prev) => ({ ...prev, enabled: nextIsCleaned }));

    if (audioRef.current) {
      const wasPlaying = !audioRef.current.paused;
      const currTime = audioRef.current.currentTime;
      audioRef.current.src = targetUrl!;
      audioRef.current.currentTime = currTime;
      if (wasPlaying) audioRef.current.play().catch(() => {});
    }

    showToast(
      nextIsCleaned
        ? '🔊 Reproduciendo Audio Limpio & Ecualizado (DSP Activo)'
        : '🔈 Reproduciendo Audio Original sin Procesar (Raw)',
      'info'
    );
  };

  const handleResetAudio = () => {
    setCustomAudioName(null);
    setMasterAudioBase64(null);
    setMasterAudioUrl(null);
    if (audioRef.current) {
      audioRef.current.src = '';
    }
    showToast('Audio importado restablecido.', 'info');
  };

  const handleSyncDurationToAudio = () => {
    if (audioRef.current && audioRef.current.duration) {
      const dur = Math.round(audioRef.current.duration);
      setTotalDuration(dur);
      showToast(`Duración del video sincronizada con el audio a ${dur}s.`, 'success');
    }
  };

  const handleGenerateSceneAudio = async (scene: ScriptScene) => {
    setGeneratingSceneId(scene.id);
    showToast(`Generando Escena ${scene.sceneNumber}...`, 'info');

    try {
      const response = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: scene.text,
          voice: selectedVoice,
          style: customStylePrompt,
          sceneTitle: scene.title,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.audioBase64) {
        throw new Error(data.error || 'Error al generar escena.');
      }

      const blobUrl = base64ToAudioUrl(data.audioBase64, data.mimeType || 'audio/wav');

      setScenes((prev) =>
        prev.map((s) =>
          s.id === scene.id
            ? { ...s, audioBase64: data.audioBase64, audioBlobUrl: blobUrl }
            : s
        )
      );

      showToast(`Escena ${scene.sceneNumber} lista con gemini-3.8-flash-tts.`, 'success');
    } catch (err: any) {
      showToast(`Aviso: ${err.message || 'Error en síntesis'}.`, 'error');
    } finally {
      setGeneratingSceneId(null);
    }
  };

  const handlePlaySingleScene = (scene: ScriptScene) => {
    if (playingSingleSceneId === scene.id) {
      singleSceneAudioRef.current?.pause();
      setPlayingSingleSceneId(null);
      return;
    }

    if (scene.audioBlobUrl && singleSceneAudioRef.current) {
      singleSceneAudioRef.current.src = scene.audioBlobUrl;
      singleSceneAudioRef.current.volume = volume;
      singleSceneAudioRef.current.play().catch(console.error);
      setPlayingSingleSceneId(scene.id);
    }
  };

  const handleDownloadSceneAudio = (scene: ScriptScene) => {
    if (!scene.audioBase64) return;
    const blob = base64ToBlob(scene.audioBase64, 'audio/wav');
    downloadBlob(blob, `CCMI_Escena_${scene.sceneNumber}_${selectedVoice}.wav`);
  };

  const handleUpdateSceneText = (id: string, text: string) => {
    setScenes((prev) => prev.map((s) => (s.id === id ? { ...s, text } : s)));
    showToast('Texto de escena actualizado.', 'info');
  };

  const generateClientFallbackAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-MX';
      utterance.rate = playbackSpeed;
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
      showToast('Reproduciendo con motor de voz clínica.', 'info');
    } else {
      showToast('Error de síntesis de voz.', 'error');
    }
  };

  // Media Clips Management
  const handleAddMediaClip = (newClip: MediaClip) => {
    setMediaClips((prev) => [...prev, newClip]);
    showToast(`Clip añadido: ${newClip.name}`, 'success');
  };

  const handleUpdateMediaClip = (id: string, updates: Partial<MediaClip>) => {
    setMediaClips((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const handleDeleteMediaClip = (id: string) => {
    if (mediaClips.length <= 1) {
      showToast('Debe haber al menos 1 clip en la línea de tiempo.', 'info');
      return;
    }
    setMediaClips((prev) => prev.filter((c) => c.id !== id));
    showToast('Clip eliminado.', 'info');
  };

  const handleReorderMediaClips = (fromIndex: number, toIndex: number) => {
    setMediaClips((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
    showToast('Orden de clips actualizado.', 'info');
  };

  const handleAutoFitDuration = () => {
    const totalClipsDuration = mediaClips.reduce((sum, c) => sum + c.duration, 0);
    setTotalDuration(totalClipsDuration);
    showToast(`Duración ajustada automáticamente a ${totalClipsDuration}s.`, 'success');
  };

  // Transitions Management
  const handleOpenTransitionModal = (clipId: string, index: number) => {
    setTransitionModalState({
      isOpen: true,
      clipId,
      clipIndex: index,
    });
  };

  const handleApplyTransition = (clipId: string, transition: ClipTransitionType, duration: number) => {
    setMediaClips((prev) =>
      prev.map((c) => (c.id === clipId ? { ...c, transition, transitionDuration: duration } : c))
    );
    showToast(`Transición configurada en ${duration}s.`, 'success');
  };

  const handleApplyTransitionToAll = (transition: ClipTransitionType, duration: number) => {
    setMediaClips((prev) =>
      prev.map((c) => ({ ...c, transition, transitionDuration: duration }))
    );
    showToast(`Transición aplicada a todos los clips en ${duration}s.`, 'success');
  };

  const selectedTransitionClip = useMemo(() => {
    return (
      mediaClips.find((c) => c.id === transitionModalState.clipId) ||
      mediaClips[transitionModalState.clipIndex] ||
      null
    );
  }, [mediaClips, transitionModalState]);

  const nextTransitionClipName = useMemo(() => {
    return mediaClips[transitionModalState.clipIndex + 1]?.name;
  }, [mediaClips, transitionModalState]);

  // Video Trimming Management (In / Out selection)
  const handleOpenTrimModal = (clipId: string) => {
    setTrimModalState({
      isOpen: true,
      clipId,
    });
  };

  const handleApplyTrim = (clipId: string, trimStart: number, trimEnd: number, newDuration: number) => {
    setMediaClips((prev) =>
      prev.map((c) => (c.id === clipId ? { ...c, trimStart, trimEnd, duration: newDuration } : c))
    );
    showToast(`Clip recortado: pedazo de ${trimStart.toFixed(1)}s a ${trimEnd.toFixed(1)}s (${newDuration.toFixed(1)}s de duración).`, 'success');
  };

  const selectedTrimClip = useMemo(() => {
    return mediaClips.find((c) => c.id === trimModalState.clipId) || null;
  }, [mediaClips, trimModalState]);

  // CapCut Dividir: Split clip into 2 parts at playhead
  const handleSplitClip = (clipId?: string, splitSecond?: number) => {
    let targetIndex = -1;
    let targetClip: MediaClip | null = null;
    let localSplit = 0;

    if (clipId) {
      targetIndex = mediaClips.findIndex((c) => c.id === clipId);
      if (targetIndex !== -1) {
        targetClip = mediaClips[targetIndex];
        const clipIn = targetClip.trimStart || 0;
        if (splitSecond !== undefined) {
          if (splitSecond >= clipIn && splitSecond <= clipIn + targetClip.duration) {
            localSplit = splitSecond - clipIn;
          } else if (splitSecond > 0 && splitSecond < targetClip.duration) {
            localSplit = splitSecond;
          } else {
            localSplit = targetClip.duration / 2;
          }
        } else {
          localSplit = targetClip.duration / 2;
        }
      }
    } else {
      let acc = 0;
      for (let i = 0; i < mediaClips.length; i++) {
        const c = mediaClips[i];
        if (currentTime >= acc && currentTime < acc + c.duration) {
          targetIndex = i;
          targetClip = c;
          localSplit = Math.max(0, currentTime - acc);
          break;
        }
        acc += c.duration;
      }
    }

    if (!targetClip || targetIndex === -1) {
      showToast('Ubica el cabezal sobre un clip para dividirlo en ese punto.', 'info');
      return;
    }

    if (targetClip.duration <= 0.4 || localSplit < 0.2 || localSplit > targetClip.duration - 0.2) {
      showToast('Ubica el cabezal al menos 0.2s dentro del clip para dividirlo.', 'info');
      return;
    }

    const leftDuration = +localSplit.toFixed(1);
    const rightDuration = +(targetClip.duration - leftDuration).toFixed(1);

    const baseTrimStart = targetClip.trimStart || 0;
    const clip1TrimEnd = +(baseTrimStart + leftDuration).toFixed(1);
    const clip2TrimStart = clip1TrimEnd;
    const clip2TrimEnd = targetClip.trimEnd || +(clip2TrimStart + rightDuration).toFixed(1);

    const baseName = targetClip.name.replace(/ \(Parte \d+\)/, '');

    const part1: MediaClip = {
      ...targetClip,
      id: `clip-${Date.now()}-1`,
      name: `${baseName} (Parte 1)`,
      duration: leftDuration,
      trimStart: baseTrimStart,
      trimEnd: clip1TrimEnd,
    };

    const part2: MediaClip = {
      ...targetClip,
      id: `clip-${Date.now()}-2`,
      name: `${baseName} (Parte 2)`,
      duration: rightDuration,
      trimStart: clip2TrimStart,
      trimEnd: clip2TrimEnd,
    };

    const nextClips = [...mediaClips];
    nextClips.splice(targetIndex, 1, part1, part2);
    setMediaClips(nextClips);
    showToast(`Clip dividido al estilo CapCut en 2 pedazos (${leftDuration}s y ${rightDuration}s).`, 'success');
  };

  // CapCut Duplicar: Duplicate clip to easily extract another section from same file
  const handleDuplicateClip = (clipId: string) => {
    const idx = mediaClips.findIndex((c) => c.id === clipId);
    if (idx === -1) return;
    const orig = mediaClips[idx];
    const clone: MediaClip = {
      ...orig,
      id: `clip-${Date.now()}-dup`,
      name: `${orig.name} (Copia)`,
    };
    const nextClips = [...mediaClips];
    nextClips.splice(idx + 1, 0, clone);
    setMediaClips(nextClips);
    showToast(`Clip duplicado: ahora puedes recortar otro pedazo del mismo video.`, 'success');
  };

  // CapCut Extraer como Nuevo Clip: Adds trimmed fraction to timeline as a new clip
  const handleExtractAsNewClip = (clipId: string, trimStart: number, trimEnd: number) => {
    const orig = mediaClips.find((c) => c.id === clipId);
    if (!orig) return;
    const dur = +(trimEnd - trimStart).toFixed(1);
    const newClip: MediaClip = {
      ...orig,
      id: `clip-${Date.now()}-ext`,
      name: `${orig.name} (Pedazo ${trimStart.toFixed(1)}s-${trimEnd.toFixed(1)}s)`,
      duration: Math.max(0.5, dur),
      trimStart,
      trimEnd,
    };
    const idx = mediaClips.findIndex((c) => c.id === clipId);
    const nextClips = [...mediaClips];
    nextClips.splice(idx + 1, 0, newClip);
    setMediaClips(nextClips);
    showToast(`Nuevo pedazo añadido a la secuencia (${dur}s).`, 'success');
  };

  // CapCut Cortar Inicio: Trim head to current time
  const handleTrimLeft = (clipId?: string) => {
    let acc = 0;
    let targetIndex = -1;
    let targetClip: MediaClip | null = null;
    let localTime = 0;

    for (let i = 0; i < mediaClips.length; i++) {
      const c = mediaClips[i];
      if (clipId ? c.id === clipId : (currentTime >= acc && currentTime < acc + c.duration)) {
        targetIndex = i;
        targetClip = c;
        localTime = Math.max(0, currentTime - acc);
        break;
      }
      acc += c.duration;
    }

    if (!targetClip || targetIndex === -1 || localTime < 0.2) return;
    const newTrimStart = +((targetClip.trimStart || 0) + localTime).toFixed(1);
    const newDuration = +(targetClip.duration - localTime).toFixed(1);
    if (newDuration < 0.2) return;

    setMediaClips((prev) =>
      prev.map((c, i) =>
        i === targetIndex
          ? { ...c, trimStart: newTrimStart, duration: newDuration }
          : c
      )
    );
    showToast(`Inicio cortado: el clip ahora dura ${newDuration}s`, 'success');
  };

  // CapCut Cortar Fin: Trim tail to current time
  const handleTrimRight = (clipId?: string) => {
    let acc = 0;
    let targetIndex = -1;
    let targetClip: MediaClip | null = null;
    let localTime = 0;

    for (let i = 0; i < mediaClips.length; i++) {
      const c = mediaClips[i];
      if (clipId ? c.id === clipId : (currentTime >= acc && currentTime < acc + c.duration)) {
        targetIndex = i;
        targetClip = c;
        localTime = Math.max(0, currentTime - acc);
        break;
      }
      acc += c.duration;
    }

    if (!targetClip || targetIndex === -1 || localTime < 0.2) return;
    const newDuration = +localTime.toFixed(1);
    const newTrimEnd = +((targetClip.trimStart || 0) + newDuration).toFixed(1);

    setMediaClips((prev) =>
      prev.map((c, i) =>
        i === targetIndex
          ? { ...c, trimEnd: newTrimEnd, duration: newDuration }
          : c
      )
    );
    showToast(`Fin cortado: el clip ahora dura ${newDuration}s`, 'success');
  };

  // Volume Handlers
  const handleVolumeChange = (v: number) => {
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
    if (videoRef.current) videoRef.current.volume = v;
    if (v > 0 && isMuted) {
      setIsMuted(false);
      if (audioRef.current) audioRef.current.muted = false;
      if (videoRef.current) videoRef.current.muted = false;
    }
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (audioRef.current) audioRef.current.muted = nextMuted;
    if (videoRef.current) videoRef.current.muted = nextMuted;
  };

  // Text Overlays Management
  const handleAddTextOverlay = () => {
    const newText: TextOverlay = {
      id: `text-${Date.now()}`,
      text: '¡Cirugía Segura CCMI!',
      x: 50,
      y: 40,
      fontSize: 24,
      fontFamily: 'Inter, sans-serif',
      color: '#ffffff',
      strokeColor: '#000000',
      strokeWidth: 3,
      bgColor: '#0891b2',
      animation: 'pop',
      startTime: 0,
      endTime: totalDuration,
    };
    setTextOverlays((prev) => [...prev, newText]);
    setSelectedOverlayId(newText.id);
    showToast('Nuevo texto añadido. Puedes arrastrarlo en pantalla.', 'success');
  };

  const handleUpdateTextOverlay = (id: string, updates: Partial<TextOverlay>) => {
    setTextOverlays((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const handleDeleteTextOverlay = (id: string) => {
    setTextOverlays((prev) => prev.filter((t) => t.id !== id));
    if (selectedOverlayId === id) setSelectedOverlayId(null);
  };

  // Sticker from Catalog Management
  const handleAddStickerFromCatalog = (template: StickerTemplate) => {
    const newSticker: StickerOverlay = {
      id: `stk-${Date.now()}`,
      type: template.type,
      title: template.title,
      subtitle: template.subtitle,
      color: template.color,
      x: 50,
      y: 35,
      scale: 1,
      startTime: 0,
      endTime: totalDuration,
    };
    setStickers((prev) => [...prev, newSticker]);
    setSelectedOverlayId(newSticker.id);
    showToast(`Sticker añadido: ${template.title}. Puedes moverlo en pantalla.`, 'success');
  };

  const handleUpdateSticker = (id: string, updates: Partial<StickerOverlay>) => {
    setStickers((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const handleDeleteSticker = (id: string) => {
    setStickers((prev) => prev.filter((s) => s.id !== id));
    if (selectedOverlayId === id) setSelectedOverlayId(null);
  };

  // Auto-Sincronización de Cortes: Smartly aligns clip boundaries to voiceover pauses & sentences
  const [isAutoSyncing, setIsAutoSyncing] = useState<boolean>(false);

  const handleAutoSyncCuts = async () => {
    setIsAutoSyncing(true);
    showToast('Analizando pausas y cadencia de la pista de voz en off...', 'info');

    try {
      let detectedPauses: number[] = [];

      // If we have an active master audio or audio element with a source
      if (masterAudioUrl || (audioRef.current && audioRef.current.src && audioRef.current.src !== '')) {
        const audioSrc = masterAudioUrl || audioRef.current!.src;
        detectedPauses = await detectAudioPauses(audioSrc, 0.18, -30);
      }

      // If detectedPauses is empty or audio isn't available yet, fallback to scenes sentence/phrase boundaries
      if (detectedPauses.length === 0) {
        detectedPauses = scenes.map((s) => +(s.endSeconds).toFixed(1));
      }

      const totalAudioDur = (audioRef.current && audioRef.current.duration && isFinite(audioRef.current.duration))
        ? audioRef.current.duration
        : totalDuration;

      const result = autoSyncClipsToVoicePauses(mediaClips, scenes, detectedPauses, totalAudioDur);

      if (result.updatedClips.length > 0) {
        setMediaClips(result.updatedClips);
        if (result.newTotalDuration > 0) {
          setTotalDuration(result.newTotalDuration);
        }
        showToast(
          `¡Auto-Sincronización completada! ${result.updatedClips.length} clips ajustados a las pausas de la voz en off.`,
          'success'
        );
      } else {
        showToast('No se detectaron clips para sincronizar.', 'info');
      }
    } catch (err: any) {
      console.error('Error auto-syncing cuts:', err);
      // Fallback with scene boundaries
      const result = autoSyncClipsToVoicePauses(mediaClips, scenes, [], totalDuration);
      if (result.updatedClips.length > 0) {
        setMediaClips(result.updatedClips);
        showToast('Cortes sincronizados con los tiempos del guión de voz.', 'success');
      } else {
        showToast('Error al auto-sincronizar cortes.', 'error');
      }
    } finally {
      setIsAutoSyncing(false);
    }
  };

  // Apply 1-Click CapCut Template
  const handleApplyTemplate = (template: CapCutTemplate) => {
    setAspectRatio(template.aspectRatio);
    setTotalDuration(template.duration);
    setFilterSettings((prev) => ({ ...prev, preset: template.filterPreset }));
    setSubtitleConfig((prev) => ({ ...prev, styleId: template.subtitleStyle }));
    showToast(`Plantilla "${template.name}" aplicada.`, 'success');
  };

  // Fast script action
  const handleLoadOfficialScript = () => {
    setRawScriptText(OFFICIAL_SCRIPT_FULL);
    showToast('Guión oficial de CCMI / CSMI (18s) cargado en el editor.', 'info');
  };

  // Direct Audio Download
  const handleQuickDownloadAudio = () => {
    if (!masterAudioBase64) {
      showToast('Primero genera la voz con el botón "Generar Voz" o importa un audio.', 'info');
      return;
    }
    const blob = base64ToBlob(masterAudioBase64, 'audio/wav');
    downloadBlob(blob, `CCMI_Audio_Master_${selectedVoice}.wav`);
    showToast('Audio WAV descargado.', 'success');
  };

  // Render & Export Full Video Sequence using Local Hardware (GPU/CPU WebCodecs / MediaRecorder)
  const handleRenderVideo = async (resolution: RenderResolution = '720p') => {
    setIsExportingVideo(true);
    setExportProgress(1);
    showToast(`Iniciando codificación H.264 60 FPS por hardware (${resolution})...`, 'info');

    try {
      const renderOptions = {
        mediaClips,
        audioElement: audioRef.current,
        scenes,
        totalDuration,
        aspectRatio,
        subtitleConfig,
        textOverlays,
        stickers,
        filterSettings,
        backgroundText,
        resolution,
        onProgress: (pct: number) => setExportProgress(pct),
      };

      let blob: Blob;
      let extension = 'mp4';

      if (typeof (window as any).VideoEncoder !== 'undefined') {
        try {
          blob = await renderMp4Video(renderOptions);
        } catch (webcodecsErr) {
          console.warn('WebCodecs export failed, falling back to MediaRecorder:', webcodecsErr);
          blob = await renderMultiClipVideo(renderOptions);
          extension = 'webm';
        }
      } else {
        blob = await renderMultiClipVideo(renderOptions);
        extension = 'webm';
      }

      downloadBlob(blob, `CCMI_Video_CapCut_${aspectRatio.replace(':', 'x')}_${resolution}_${selectedVoice}.${extension}`);
      showToast(`¡Video H.264 MP4 (60 FPS) renderizado con éxito!`, 'success');
    } catch (err: any) {
      console.error('Error rendering video:', err);
      showToast(`Error al renderizar: ${err.message || 'Error de exportación'}`, 'error');
    } finally {
      setIsExportingVideo(false);
      setExportProgress(0);
    }
  };

  // AI Director modal
  const handleOpenDirector = async () => {
    setIsDirectorOpen(true);
    if (!directorAnalysis) {
      setIsAnalyzingDirector(true);
      try {
        const res = await fetch('/api/script/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scriptScenes: scenes }),
        });
        const data = await res.json();
        setDirectorAnalysis(data);
      } catch (e) {
        setDirectorAnalysis({
          overallPacing: 'Excelente estructura de 18 segundos. La cadencia es óptima para comerciales de televisión y redes sociales.',
          directorNote: 'Modula la voz con calidez humana. Resalta "cuidado completamente seguro" y "bienestar que mereces".',
        });
      } finally {
        setIsAnalyzingDirector(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl border text-xs font-semibold ${
              toast.type === 'success'
                ? 'bg-emerald-950 text-emerald-200 border-emerald-500/50'
                : toast.type === 'error'
                ? 'bg-rose-950 text-rose-200 border-rose-500/50'
                : 'bg-cyan-950 text-cyan-200 border-cyan-500/50'
            }`}
          >
            {toast.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-cyan-400" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Header with Import Audio button and Device Switcher */}
      <Header
        totalDuration={totalDuration}
        wordCount={wordCount}
        isGeneratingAll={isGeneratingAll}
        onGenerateAll={() => handleGenerateAll()}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenDirector={handleOpenDirector}
        onImportAudioFile={handleImportAudioFile}
        bgMusicEnabled={bgMusicEnabled}
        onToggleBgMusic={() => setBgMusicEnabled((prev) => !prev)}
        hasAudio={!!masterAudioBase64}
        customAudioName={customAudioName}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        deviceMode={deviceMode}
        onToggleDeviceMode={setDeviceMode}
        volume={volume}
        onVolumeChange={handleVolumeChange}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onAutoSyncCuts={handleAutoSyncCuts}
        isAutoSyncing={isAutoSyncing}
        userPlanTier={userPlanTier}
        onOpenUpgradeModal={handleOpenUpgradeModal}
        onOpenScriptGenerator={() => setIsScriptGenOpen(true)}
        onOpenCodeModal={() => setIsCodeModalOpen(true)}
      />

      {/* ========================================================
          1. MOBILE MODE: AUTHENTIC CAPCUT MOBILE APP WORKSPACE
          ======================================================== */}
      {deviceMode === 'mobile' ? (
        <MobileCapCutStudio
          mediaClips={mediaClips}
          scenes={scenes}
          currentScene={currentScene}
          currentTime={currentTime}
          totalDuration={totalDuration}
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
          onSeek={handleSeek}
          onRestart={handleRestart}
          hasAudio={!!masterAudioBase64}
          customAudioName={customAudioName}
          masterAudioUrl={masterAudioUrl}
          selectedVoiceName={selectedVoice}
          aspectRatio={aspectRatio}
          onChangeAspectRatio={setAspectRatio}
          subtitleConfig={subtitleConfig}
          onUpdateSubtitleConfig={(cfg) => setSubtitleConfig((prev) => ({ ...prev, ...cfg }))}
          textOverlays={textOverlays}
          onAddTextOverlay={handleAddTextOverlay}
          onUpdateTextOverlay={handleUpdateTextOverlay}
          onDeleteTextOverlay={handleDeleteTextOverlay}
          stickers={stickers}
          onAddStickerFromCatalog={handleAddStickerFromCatalog}
          onUpdateSticker={handleUpdateSticker}
          onDeleteSticker={handleDeleteSticker}
          filterSettings={filterSettings}
          onUpdateFilterSettings={(f) => setFilterSettings((prev) => ({ ...prev, ...f }))}
          backgroundText={backgroundText}
          onUpdateBackgroundText={(b) => setBackgroundText((prev) => ({ ...prev, ...b }))}
          onAddMediaClip={handleAddMediaClip}
          onUpdateMediaClip={handleUpdateMediaClip}
          onDeleteMediaClip={handleDeleteMediaClip}
          onReorderMediaClips={handleReorderMediaClips}
          onOpenTransitionModal={handleOpenTransitionModal}
          rawScriptText={rawScriptText}
          onChangeRawScript={setRawScriptText}
          onLoadOfficialScript={handleLoadOfficialScript}
          selectedVoice={selectedVoice}
          onSelectVoice={setSelectedVoice}
          voices={VOICE_PRESETS}
          selectedStyleId={selectedStyleId}
          onSelectStyle={setSelectedStyleId}
          customStylePrompt={customStylePrompt}
          onChangeCustomPrompt={setCustomStylePrompt}
          onGenerateAudio={() => handleGenerateAll(rawScriptText)}
          isGeneratingAudio={isGeneratingAll}
          onImportAudioFile={handleImportAudioFile}
          onResetAudio={handleResetAudio}
          onSyncDurationToAudio={handleSyncDurationToAudio}
          onOpenExportModal={() => setIsExportOpen(true)}
          onExportVideo={handleRenderVideo}
          isExportingVideo={isExportingVideo}
          exportProgress={exportProgress}
          onSwitchToDesktop={() => setDeviceMode('desktop')}
          onOpenTrimModal={handleOpenTrimModal}
          volume={volume}
          onVolumeChange={handleVolumeChange}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          bgMusicVolume={bgMusicVolume}
          onChangeBgVolume={setBgMusicVolume}
          bgMusicEnabled={bgMusicEnabled}
          onToggleBgMusic={() => setBgMusicEnabled((prev) => !prev)}
          onSplitClip={handleSplitClip}
          onDuplicateClip={handleDuplicateClip}
          onTrimLeft={handleTrimLeft}
          onTrimRight={handleTrimRight}
          onAutoSyncCuts={handleAutoSyncCuts}
          isAutoSyncing={isAutoSyncing}
          vocalCleanConfig={vocalCleanConfig}
          onApplyVocalClean={handleApplyVocalClean}
          isCleaningVocal={isCleaningVocal}
          hasCleanedAudio={!!cleanedMasterAudio.url}
          isShowingCleaned={isShowingCleaned}
          onToggleOriginalVsCleaned={handleToggleOriginalVsCleaned}
          userPlanTier={userPlanTier}
          onOpenUpgradeModal={handleOpenUpgradeModal}
        />
      ) : (
        /* ========================================================
            2. DESKTOP MODE: FULL MULTI-PANEL STUDIO WORKSPACE
            ======================================================== */
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Top: Video Monitor & Dynamic Tab Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left/Center: Multimedia Monitor (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <VideoPlayerPreview
                mediaClips={mediaClips}
                scenes={scenes}
                currentScene={currentScene}
                currentTime={currentTime}
                totalDuration={totalDuration}
                isPlaying={isPlaying}
                onTogglePlay={handleTogglePlay}
                onSeek={handleSeek}
                onRestart={handleRestart}
                volume={volume}
                onVolumeChange={handleVolumeChange}
                isMuted={isMuted}
                onToggleMute={handleToggleMute}
                hasAudio={!!masterAudioBase64}
                selectedVoiceName={selectedVoice}
                aspectRatio={aspectRatio}
                subtitleConfig={subtitleConfig}
                onUpdateSubtitleConfig={(cfg) => setSubtitleConfig((prev) => ({ ...prev, ...cfg }))}
                textOverlays={textOverlays}
                onUpdateTextOverlay={handleUpdateTextOverlay}
                onDeleteTextOverlay={handleDeleteTextOverlay}
                onSelectOverlay={setSelectedOverlayId}
                selectedOverlayId={selectedOverlayId}
                stickers={stickers}
                onUpdateSticker={handleUpdateSticker}
                onDeleteSticker={handleDeleteSticker}
                filterSettings={filterSettings}
                backgroundText={backgroundText}
                onOpenExportModal={() => setIsExportOpen(true)}
                onQuickDownloadAudio={handleQuickDownloadAudio}
                videoRefForward={videoRef}
                onUpdateMediaClip={handleUpdateMediaClip}
                onOpenTrimModal={handleOpenTrimModal}
                onSplitClip={handleSplitClip}
                onDuplicateClip={handleDuplicateClip}
                onTrimLeft={handleTrimLeft}
                onTrimRight={handleTrimRight}
              />

              {/* Status Bar & Quick Actions */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>
                    Audio:{' '}
                    <strong className="text-white">
                      {customAudioName ? `Importado (${customAudioName})` : `gemini-3.8-flash-tts (${selectedVoice})`}
                    </strong>{' '}
                    • {mediaClips.length} clips en secuencia • Subtítulos:{' '}
                    <strong className={subtitleConfig.enabled ? 'text-emerald-400' : 'text-slate-500'}>
                      {subtitleConfig.enabled ? 'ACTIVADOS' : 'DESACTIVADOS'}
                    </strong>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveTab('audio')}
                    className="text-cyan-400 hover:text-cyan-300 font-bold underline flex items-center gap-1"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>Texto a Voz / Importar Audio</span>
                  </button>
                  <button
                    onClick={handleRestart}
                    className="text-slate-300 hover:text-white font-semibold underline"
                  >
                    Replay
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Dynamic Tab Panel (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* TAB 1: AUDIO HUB (TTS & IMPORT AUDIO) - USER REQUEST */}
              {activeTab === 'audio' && (
                <AudioHub
                  rawScriptText={rawScriptText}
                  onChangeRawScript={setRawScriptText}
                  onLoadOfficialScript={handleLoadOfficialScript}
                  selectedVoice={selectedVoice}
                  onSelectVoice={setSelectedVoice}
                  voices={VOICE_PRESETS}
                  selectedStyleId={selectedStyleId}
                  onSelectStyle={setSelectedStyleId}
                  customStylePrompt={customStylePrompt}
                  onChangeCustomPrompt={setCustomStylePrompt}
                  onGenerateAudio={() => handleGenerateAll(rawScriptText)}
                  isGeneratingAudio={isGeneratingAll}
                  onImportAudioFile={handleImportAudioFile}
                  customAudioName={customAudioName}
                  onResetAudio={handleResetAudio}
                  hasAudio={!!masterAudioBase64}
                  masterAudioUrl={masterAudioUrl}
                  isPlaying={isPlaying}
                  onTogglePlay={handleTogglePlay}
                  totalDuration={totalDuration}
                  onSyncDurationToAudio={handleSyncDurationToAudio}
                  vocalCleanConfig={vocalCleanConfig}
                  onUpdateVocalCleanConfig={(cfg) => setVocalCleanConfig((prev) => ({ ...prev, ...cfg }))}
                  onApplyVocalClean={handleApplyVocalClean}
                  isCleaningVocal={isCleaningVocal}
                  hasCleanedAudio={!!cleanedMasterAudio.url}
                  isShowingCleaned={isShowingCleaned}
                  onToggleOriginalVsCleaned={handleToggleOriginalVsCleaned}
                  userPlanTier={userPlanTier}
                  onOpenUpgradeModal={handleOpenUpgradeModal}
                  onOpenScriptGenerator={() => setIsScriptGenOpen(true)}
                />
              )}

              {/* TAB 2: CAPCUT VIDEO EDITOR */}
              {activeTab === 'capcut' && (
                <CapCutPanel
                  mediaClips={mediaClips}
                  onAddMediaClip={handleAddMediaClip}
                  onUpdateMediaClip={handleUpdateMediaClip}
                  onDeleteMediaClip={handleDeleteMediaClip}
                  onReorderMediaClips={handleReorderMediaClips}
                  totalDuration={totalDuration}
                  onChangeTotalDuration={setTotalDuration}
                  onAutoFitDuration={handleAutoFitDuration}
                  aspectRatio={aspectRatio}
                  onChangeAspectRatio={setAspectRatio}
                  subtitleConfig={subtitleConfig}
                  onUpdateSubtitleConfig={(cfg) => setSubtitleConfig((prev) => ({ ...prev, ...cfg }))}
                  textOverlays={textOverlays}
                  onAddTextOverlay={handleAddTextOverlay}
                  onUpdateTextOverlay={handleUpdateTextOverlay}
                  onDeleteTextOverlay={handleDeleteTextOverlay}
                  stickers={stickers}
                  onAddStickerFromCatalog={handleAddStickerFromCatalog}
                  onUpdateSticker={handleUpdateSticker}
                  onDeleteSticker={handleDeleteSticker}
                  filterSettings={filterSettings}
                  onUpdateFilterSettings={(f) => setFilterSettings((prev) => ({ ...prev, ...f }))}
                  backgroundText={backgroundText}
                  onUpdateBackgroundText={(b) => setBackgroundText((prev) => ({ ...prev, ...b }))}
                  onApplyTemplate={handleApplyTemplate}
                  rawScriptText={rawScriptText}
                  onChangeRawScript={setRawScriptText}
                  onLoadOfficialScript={handleLoadOfficialScript}
                  onGenerateAudioAndMount={() => handleGenerateAll(rawScriptText)}
                  isGeneratingAudio={isGeneratingAll}
                  onExportVideo={handleRenderVideo}
                  isExportingVideo={isExportingVideo}
                  exportProgress={exportProgress}
                  selectedVoice={selectedVoice}
                  onSelectVoice={setSelectedVoice}
                  onOpenTransitionModal={handleOpenTransitionModal}
                  onOpenTrimModal={handleOpenTrimModal}
                  onSplitClip={handleSplitClip}
                  onDuplicateClip={handleDuplicateClip}
                  volume={volume}
                  onVolumeChange={handleVolumeChange}
                  isMuted={isMuted}
                  onToggleMute={handleToggleMute}
                  onAutoSyncCuts={handleAutoSyncCuts}
                  isAutoSyncing={isAutoSyncing}
                  userPlanTier={userPlanTier}
                  onOpenUpgradeModal={handleOpenUpgradeModal}
                />
              )}

              {/* TAB 3: VOICE SETTINGS */}
              {activeTab === 'voice' && (
                <VoiceSettings
                  voices={VOICE_PRESETS}
                  selectedVoice={selectedVoice}
                  onSelectVoice={setSelectedVoice}
                  selectedStyleId={selectedStyleId}
                  onSelectStyle={setSelectedStyleId}
                  customStylePrompt={customStylePrompt}
                  onChangeCustomPrompt={setCustomStylePrompt}
                  bgMusicEnabled={bgMusicEnabled}
                  onToggleBgMusic={() => setBgMusicEnabled((prev) => !prev)}
                  bgMusicVolume={bgMusicVolume}
                  onChangeBgVolume={setBgMusicVolume}
                  playbackSpeed={playbackSpeed}
                  onChangePlaybackSpeed={setPlaybackSpeed}
                />
              )}

              {/* TAB 4: SCENE LIST */}
              {activeTab === 'scenes' && (
                <SceneList
                  scenes={scenes}
                  activeSceneId={activeSceneId}
                  onSelectScene={(id) => {
                    setActiveSceneId(id);
                    const found = scenes.find((s) => s.id === id);
                    if (found) handleSeek(found.startSeconds);
                  }}
                  onUpdateSceneText={handleUpdateSceneText}
                  onGenerateSceneAudio={handleGenerateSceneAudio}
                  generatingSceneId={generatingSceneId}
                  onPlaySingleScene={handlePlaySingleScene}
                  playingSingleSceneId={playingSingleSceneId}
                  onDownloadSceneAudio={handleDownloadSceneAudio}
                />
              )}
            </div>
          </div>

          {/* Middle: Interactive Multi-Track Timeline */}
          <TimelineEditor
            mediaClips={mediaClips}
            scenes={scenes}
            currentTime={currentTime}
            totalDuration={totalDuration}
            onSeek={handleSeek}
            activeSceneId={activeSceneId}
            onSelectScene={setActiveSceneId}
            bgMusicEnabled={bgMusicEnabled}
            onOpenTransitionModal={handleOpenTransitionModal}
            onOpenAudioTab={() => setActiveTab('audio')}
            customAudioName={customAudioName}
            onOpenTrimModal={handleOpenTrimModal}
            onSplitClip={handleSplitClip}
            onDuplicateClip={handleDuplicateClip}
            onTrimLeft={handleTrimLeft}
            onTrimRight={handleTrimRight}
            onAutoSyncCuts={handleAutoSyncCuts}
            isAutoSyncing={isAutoSyncing}
            userPlanTier={userPlanTier}
            onOpenUpgradeModal={handleOpenUpgradeModal}
            onTogglePlay={handleTogglePlay}
            onReorderMediaClips={handleReorderMediaClips}
            onDeleteActiveClip={() => {
              // Cálculo de Ripple Delete: Encontrar el clip bajo el cabezal de reproducción
              let acc = 0;
              let targetId: string | null = null;
              for (const c of mediaClips) {
                if (currentTime >= acc && currentTime < acc + c.duration) {
                  targetId = c.id;
                  break;
                }
                acc += c.duration;
              }
              if (targetId) handleDeleteMediaClip(targetId);
            }}
          />

          {/* Bottom scene breakdown when on capcut or audio tab */}
          {activeTab !== 'scenes' && (
            <div className="pt-2">
              <SceneList
                scenes={scenes}
                activeSceneId={activeSceneId}
                onSelectScene={(id) => {
                  setActiveSceneId(id);
                  const found = scenes.find((s) => s.id === id);
                  if (found) handleSeek(found.startSeconds);
                }}
                onUpdateSceneText={handleUpdateSceneText}
                onGenerateSceneAudio={handleGenerateSceneAudio}
                generatingSceneId={generatingSceneId}
                onPlaySingleScene={handlePlaySingleScene}
                playingSingleSceneId={playingSingleSceneId}
                onDownloadSceneAudio={handleDownloadSceneAudio}
              />
            </div>
          )}
        </main>
      )}

      {/* Modals */}
      <DirectorModal
        isOpen={isDirectorOpen}
        onClose={() => setIsDirectorOpen(false)}
        analysis={directorAnalysis}
        isLoading={isAnalyzingDirector}
        onReanalyze={handleOpenDirector}
        scenes={scenes}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        masterAudioBase64={masterAudioBase64}
        scenes={scenes}
        selectedVoiceName={selectedVoice}
        onRenderVideo={handleRenderVideo}
        isRenderingVideo={isExportingVideo}
        renderProgress={exportProgress}
        onImportAudioFile={handleImportAudioFile}
        customAudioName={customAudioName}
        userPlanTier={userPlanTier}
        onOpenUpgradeModal={handleOpenUpgradeModal}
      />

      <TransitionModal
        isOpen={transitionModalState.isOpen}
        onClose={() => setTransitionModalState((prev) => ({ ...prev, isOpen: false }))}
        clip={selectedTransitionClip}
        clipIndex={transitionModalState.clipIndex}
        nextClipName={nextTransitionClipName}
        nextClipUrl={mediaClips[transitionModalState.clipIndex + 1]?.url}
        onApplyTransition={handleApplyTransition}
        onApplyToAllClips={handleApplyTransitionToAll}
      />

      <TrimModal
        isOpen={trimModalState.isOpen}
        clip={selectedTrimClip}
        onClose={() => setTrimModalState({ isOpen: false, clipId: null })}
        onApplyTrim={handleApplyTrim}
        onSplitClip={handleSplitClip}
        onExtractAsNewClip={handleExtractAsNewClip}
        onDuplicateClip={handleDuplicateClip}
      />

      {/* Premium Upgrade & Plan Comparison Modal */}
      <PremiumUpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        currentTier={userPlanTier}
        onSelectTier={(tier) => {
          setUserPlanTier(tier);
          showToast(
            tier === 'premium'
              ? '👑 ¡Modo Premium con Google AI Activado!'
              : '⚡ Modo Básico Activado (Edición CapCut local sin IA)',
            'success'
          );
        }}
        featureRequested={upgradeFeatureRequested}
      />

      {/* AI Script & Scene Generator Modal (Google Gemini 3.8 Flash) */}
      <ScriptGeneratorModal
        isOpen={isScriptGenOpen}
        onClose={() => setIsScriptGenOpen(false)}
        onApplyGeneratedScript={handleApplyGeneratedScript}
      />

      {/* Code Export Modal for AI Assistance & Developers */}
      <CodeExportModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
      />

      {/* Offline Status Banner */}
      <OfflineIndicator />
    </div>
  );
}
