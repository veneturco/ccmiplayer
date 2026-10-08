// src/hooks/useProjectAutoSave.ts
import { useEffect, useRef, useState } from 'react';
import { saveWorkspace, loadWorkspace } from '../utils/projectDB';

export function useProjectAutoSave(
  currentState: any,
  onLoad: (savedData: any) => void
) {
  const [isRestored, setIsRestored] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1. Cargar el estado guardado al montar la aplicación
  useEffect(() => {
    loadWorkspace('current-project').then((data) => {
      if (data) {
        onLoad(data);
        console.log('📦 Proyecto restaurado desde IndexedDB');
      }
      setIsRestored(true); // Marca que la carga inicial terminó
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Guardar automáticamente cuando el estado cambia (Debounced)
  useEffect(() => {
    if (!isRestored) return; // No sobrescribir con el estado inicial vacío

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      saveWorkspace('current-project', currentState);
    }, 1500); // Espera 1.5s de inactividad antes de escribir en disco

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [currentState, isRestored]);

  return isRestored;
}
