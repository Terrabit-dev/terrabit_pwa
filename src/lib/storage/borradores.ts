import { openDB, IDBPDatabase } from "idb";

const DB_NAME = "terrabit_db";
const DB_VERSION = 2;
const STORE_BORRADORES = "borradores";

async function getDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
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

export interface Borrador {
  id?: number;
  tipo: string;
  datos: Record<string, unknown>;
  fecha: number;
}

export async function guardarBorrador(borrador: Omit<Borrador, "id" | "fecha">): Promise<number> {
  const db = await getDB();
  return db.add(STORE_BORRADORES, {
    ...borrador,
    fecha: Date.now(),
  }) as Promise<number>;
}

export async function actualizarBorrador(id: number, datos: Record<string, unknown>): Promise<void> {
  const db = await getDB();
  const existing = await db.get(STORE_BORRADORES, id);
  if (!existing) return;
  await db.put(STORE_BORRADORES, { ...existing, datos, fecha: Date.now() });
}

export async function obtenerBorradores(tipo?: string): Promise<Borrador[]> {
  const db = await getDB();
  if (tipo) {
    const entries = await db.getAllFromIndex(STORE_BORRADORES, "tipo", tipo);
    return entries.reverse();
  }
  const entries = await db.getAll(STORE_BORRADORES);
  return entries.reverse();
}

export async function obtenerBorradorPorId(id: number): Promise<Borrador | undefined> {
  const db = await getDB();
  return db.get(STORE_BORRADORES, id);
}

export async function eliminarBorrador(id: number): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_BORRADORES, id);
}