// src/hooks/useEditorShortcuts.ts
import { useEffect } from 'react';
import { useEditorStore } from '../store/useEditorStore';

export interface EditorShortcutsProps {
  onTogglePlay: () => void;
  onSplitClip: () => void;
  onDeleteActiveClip: () => void;
}

export function useEditorShortcuts({
  onTogglePlay,
  onSplitClip,
  onDeleteActiveClip,
}: EditorShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if (isTyping) return;

      // Extraer motor de viaje en el tiempo de Zundo
      const { undo, redo } = useEditorStore.temporal.getState();

      // Ctrl + Z (Deshacer) / Ctrl + Shift + Z o Ctrl + Y (Rehacer)
      if ((e.ctrlKey || e.metaKey) && (e.code === 'KeyZ' || e.code === 'KeyY')) {
        e.preventDefault();
        if (e.shiftKey || e.code === 'KeyY') {
          redo();
          console.log('🔄 Rehacer');
        } else {
          undo();
          console.log('↩️ Deshacer');
        }
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          onTogglePlay();
          break;
        case 'KeyS':
          e.preventDefault();
          onSplitClip();
          break;
        case 'Backspace':
        case 'Delete':
          e.preventDefault();
          onDeleteActiveClip();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onTogglePlay, onSplitClip, onDeleteActiveClip]);
}
