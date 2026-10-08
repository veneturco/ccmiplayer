// src/utils/projectDB.ts
import { openDB, DBSchema } from 'idb';

interface CCMIStudioDB extends DBSchema {
  workspace: {
    key: string;
    value: any; // Almacenará el estado consolidado del proyecto
  };
}

// Inicialización diferida para evitar bloqueos en el hilo principal
const dbPromise = openDB<CCMIStudioDB>('ccmi-capcut-studio-db', 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('workspace')) {
      db.createObjectStore('workspace');
    }
  },
});

export async function saveWorkspace(id: string, data: any): Promise<void> {
  try {
    const db = await dbPromise;
    await db.put('workspace', JSON.parse(JSON.stringify(data)), id);
  } catch (error) {
    console.warn('Error al guardar el proyecto en IndexedDB:', error);
  }
}

export async function loadWorkspace(id: string): Promise<any | undefined> {
  try {
    const db = await dbPromise;
    return await db.get('workspace', id);
  } catch (error) {
    console.warn('Error al cargar el proyecto desde IndexedDB:', error);
    return undefined;
  }
}
