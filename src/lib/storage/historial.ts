import { openDB, IDBPDatabase } from "idb";

const DB_NAME = "terrabit_db";
const DB_VERSION = 3; // <-- Subimos a 3 para arreglar el conflicto

export const STORE_HISTORIAL = "historial";
export const STORE_AUTOCOMPLETE = "autocomplete";
export const STORE_BORRADORES = "borradores"; // <-- Añadimos los borradores aquí

export async function getDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // 1. Tabla de Historial
      if (!db.objectStoreNames.contains(STORE_HISTORIAL)) {
        const store = db.createObjectStore(STORE_HISTORIAL, {
          keyPath: "id",
          autoIncrement: true,
        });
        store.createIndex("tipo", "tipo");
        store.createIndex("fecha", "fecha");
      }

      // 2. Tabla de Autocomplete
      if (!db.objectStoreNames.contains(STORE_AUTOCOMPLETE)) {
        db.createObjectStore(STORE_AUTOCOMPLETE);
      }

      // 3. Tabla de Borradores (¡Todos juntos en el mismo sitio!)
      if (!db.objectStoreNames.contains(STORE_BORRADORES)) {
        const store = db.createObjectStore(STORE_BORRADORES, {
          keyPath: "id",
          autoIncrement: true,
        });
        store.createIndex("tipo", "tipo");
        store.createIndex("fecha", "fecha");
      }
    },
  });
}

// ─── Historial de registros enviados ─────────────────────────────────────────

export interface HistorialEntry {
  id?: number;
  tipo: string;
  resumen: string;
  datos: Record<string, unknown>;
  fecha: number;
}

export async function guardarEnHistorial(entry: Omit<HistorialEntry, "id" | "fecha">): Promise<void> {
  const db = await getDB();
  await db.add(STORE_HISTORIAL, {
    ...entry,
    fecha: Date.now(),
  });
}

export async function obtenerHistorial(): Promise<HistorialEntry[]> {
  const db = await getDB();
  const entries = await db.getAllFromIndex(STORE_HISTORIAL, "fecha");
  return entries.reverse();
}

export async function eliminarEntradaHistorial(id: number): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_HISTORIAL, id);
}

export async function obtenerTodoHistorial() {
  const db = await openDB(DB_NAME, DB_VERSION);
  const entries = await db.getAll(STORE_HISTORIAL);
  return entries.reverse(); // Para mostrar los más recientes primero
}

export async function obtenerHistorialPorId(id: number | string) {
  const db = await openDB(DB_NAME, DB_VERSION);
  return db.get(STORE_HISTORIAL, id);
}

// ─── Autocompletado de campos ─────────────────────────────────────────────────

export async function guardarValorAutocomplete(key: string, valor: string): Promise<void> {
  const db = await getDB();
  const existing: string[] = (await db.get(STORE_AUTOCOMPLETE, key)) ?? [];
  const actualizado = [valor, ...existing.filter((v) => v !== valor)].slice(0, 10);
  await db.put(STORE_AUTOCOMPLETE, actualizado, key);
}

export async function obtenerHistorialAutocomplete(key: string): Promise<string[]> {
  const db = await getDB();
  return (await db.get(STORE_AUTOCOMPLETE, key)) ?? [];
}

export async function eliminarValorAutocomplete(key: string, valor: string): Promise<void> {
  const db = await getDB();
  const existing: string[] = (await db.get(STORE_AUTOCOMPLETE, key)) ?? [];
  await db.put(STORE_AUTOCOMPLETE, existing.filter((v) => v !== valor), key);
}
export async function eliminarHistorialMultiple(ids: number[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(STORE_HISTORIAL, 'readwrite');
  await Promise.all(ids.map(id => tx.store.delete(id)));
  await tx.done;
}