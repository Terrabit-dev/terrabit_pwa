"use client";

import { useState, useCallback } from "react";
import { getCredentials } from "@/lib/storage/credentials";

export interface Animal {
  identificador: string;
  identificadorElectronic?: string;
  tipusIdentificadorElectronic?: string;
  dataNaixement: string;
  sexe: string;
  raza: string;
  identificadorMare?: string;
  explotacioNaixement?: string;
  paisNaixement?: string;
}

interface ListaBovinosResponse {
  codi?: string;
  identificadors?: Animal[];
  errors?: { codi: string; descripcio: string }[];
}

export function useListarBovinos() {
  const [lista, setLista] = useState<Animal[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarBovinos = useCallback(async () => {
    const credentials = getCredentials();
    if (!credentials) {
      setError("Sin credenciales");
      return;
    }

    setCargando(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        nif:        credentials.nif,
        password:   credentials.password,
        explotacio: credentials.codiMO,
      });

      const response = await fetch(`/api/gtr/bovinos/listar?${params.toString()}`);
      if (!response.ok) throw new Error("network");

      const data: ListaBovinosResponse = await response.json();

      if (data.errors && data.errors.length > 0) {
        setError(data.errors[0].descripcio);
        return;
      }

      setLista(data.identificadors ?? []);
    } catch {
      setError("Error de connexió");
    } finally {
      setCargando(false);
    }
  }, []);

  const filtrar = useCallback((lista: Animal[], busqueda: string): Animal[] => {
    if (!busqueda.trim()) return lista;
    const q = busqueda.toLowerCase();
    return lista.filter(
      (a) =>
        a.identificador.toLowerCase().includes(q) ||
        a.raza?.toLowerCase().includes(q) ||
        a.identificadorMare?.toLowerCase().includes(q)
    );
  }, []);

  return { lista, cargando, error, cargarBovinos, filtrar };
}