"use client";

import { useState } from "react";
import { getCredentials, addCodiMO, setActiveCodiMO } from "@/lib/storage/credentials";

export function useAddMO() {
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [exito, setExito] = useState(false);

    const añadirYSeleccionarMO = async (nuevoMO: string, lang: "es" | "ca") => {
        const cleanMO = nuevoMO.toUpperCase().trim();
        if (!cleanMO) {
            setError(lang === "ca" ? "El codi no pot estar buit" : "El código no puede estar vacío");
            return;
        }

        const credentials = getCredentials();
        if (!credentials) {
            setError(lang === "ca" ? "Sessió no vàlida" : "Sesión no válida");
            return;
        }

        // Evitar duplicados — si ya existe, solo lo activamos
        if (credentials.codiMOList.includes(cleanMO)) {
            setActiveCodiMO(cleanMO);
            setExito(true);
            return;
        }

        setCargando(true);
        setError(null);
        setExito(false);

        try {
            const response = await fetch("/api/gtr/identificadors", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nif: credentials.nif,
                    passwordMobilitat: credentials.password,
                    codiMO: cleanMO,
                }),
            });

            let data: { valid?: boolean; errors?: Array<{ codi?: string; descripcio?: string }> };
            try {
                data = await response.json();
            } catch {
                setError(lang === "ca" ? "Error llegint la resposta" : "Error leyendo la respuesta");
                return;
            }

            if (data.errors && data.errors.length > 0) {
                const apiError = data.errors[0].descripcio ?? (lang === "ca" ? "Codi invàlid" : "Código inválido");
                setError(apiError);
                return;
            }

            if (data.valid === false) {
                setError(lang === "ca" ? "Codi MO no vàlid" : "Código MO no válido");
                return;
            }

            addCodiMO(cleanMO);
            setActiveCodiMO(cleanMO);
            setExito(true);

        } catch {
            setError(lang === "ca" ? "Error de connexió" : "Error de conexión");
        } finally {
            setCargando(false);
        }
    };

    const reset = () => {
        setError(null);
        setExito(false);
    };

    return { cargando, error, exito, añadirYSeleccionarMO, reset };
}