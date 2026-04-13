import { openDB, IDBPDatabase } from "idb";

const DB_NAME = "terrabit_db";
const DB_VERSION = 1;
const STORE_HISTORIAL = "historial";
const STORE_AUTOCOMPLETE = "autocomplete";

async function getDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_HISTORIAL)) {
        const store = db.createObjectStore(STORE_HISTORIAL, {
          keyPath: "id",
          autoIncrement: true,
        });
        store.createIndex("tipo", "tipo");
        store.createIndex("fecha", "fecha");
      }
      if (!db.objectStoreNames.contains(STORE_AUTOCOMPLETE)) {
        db.createObjectStore(STORE_AUTOCOMPLETE);
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