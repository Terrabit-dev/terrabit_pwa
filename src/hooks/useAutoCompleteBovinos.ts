"use client";

import { useState, useCallback, useRef } from "react";
import type { Animal } from "@/lib/bovinos/types";

export function useAutoCompleteBovinos(listaCompleta: Animal[]) {
    const [suggestions, setSuggestions] = useState<Animal[]>([]);
    const [activeField, setActiveField] = useState<number>(-1);
    const [isLoading, setIsLoading] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const buscar = useCallback(
        (query: string, fieldIndex: number) => {
            setActiveField(fieldIndex);

            if (debounceRef.current) clearTimeout(debounceRef.current);

            if (!query.trim() || query.length < 1) {
                setSuggestions([]);
                return;
            }

            setIsLoading(true);
            debounceRef.current = setTimeout(() => {
                const q = query.toLowerCase();
                const filtered = listaCompleta
                    .filter(
                        (a) =>
                            a.identificador.toLowerCase().includes(q) ||
                            a.identificadorMare?.toLowerCase().includes(q)
                    )
                    .slice(0, 4); // Máximo 10 sugerencias
                setSuggestions(filtered);
                setIsLoading(false);
            }, 300);
        },
        [listaCompleta]
    );

    const limpiarSugerencias = useCallback(() => {
        setSuggestions([]);
        setActiveField(-1);
    }, []);

    return { suggestions, activeField, isLoading, buscar, limpiarSugerencias };
}