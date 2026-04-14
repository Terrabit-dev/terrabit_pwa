"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    ReactNode,
} from "react";
import { apiGetListaBovinos } from "@/lib/api/endpoints";
import { getCredentials } from "@/lib/storage/credentials";
import type { Animal } from "@/lib/api/endpoints";

interface AnimalesContextValue {
    animales: Animal[];
    loading: boolean;
    error: string | null;
    /** Fuerza un re-fetch manual (útil tras registrar un nacimiento, etc.) */
    refresh: () => Promise<void>;
}

const AnimalesContext = createContext<AnimalesContextValue | null>(null);

export function AnimalesProvider({ children }: { children: ReactNode }) {
    const [animales, setAnimales] = useState<Animal[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAnimales = useCallback(async () => {
        const creds = getCredentials();
        if (!creds) return;

        setLoading(true);
        setError(null);

        try {
            const res = await apiGetListaBovinos(creds.nif, creds.password, creds.codiMO);
            setAnimales(res.animals ?? []);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Error desconocido");
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch al montar (cuando el usuario entra al home)
    useEffect(() => {
        fetchAnimales();
    }, [fetchAnimales]);

    return (
        <AnimalesContext.Provider
            value={{ animales, loading, error, refresh: fetchAnimales }}
        >
            {children}
        </AnimalesContext.Provider>
    );
}

export function useAnimales(): AnimalesContextValue {
    const ctx = useContext(AnimalesContext);
    if (!ctx) {
        throw new Error("useAnimales debe usarse dentro de <AnimalesProvider>");
    }
    return ctx;
}
