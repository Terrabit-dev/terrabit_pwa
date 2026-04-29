import { getDB, STORE_BORRADORES } from "./historial";

export interface Borrador {
  id?: number;
  tipo: string;
  datos: Record<string, unknown>;
  fecha: number;
}

export async function guardarBorrador(borrador: Omit<Borrador, "id" | "fecha">): Promise<number> {
  const db = await getDB();
  return db.put(STORE_BORRADORES, {
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
export async function eliminarBorradoresMultiples(ids: number[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(STORE_BORRADORES, 'readwrite');
  await Promise.all(ids.map(id => tx.store.delete(id)));
  await tx.done;
}