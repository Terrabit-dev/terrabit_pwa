"use client";

import { useState, useCallback, useEffect } from "react";
import { getCredentials } from "@/lib/storage/credentials";
import { secureLog } from "@/lib/utils/secureLogger";
import { guardarEnHistorial } from "@/lib/storage/historial";
import { type ConfirmarMovimientoForm, validarConfirmarMovimiento } from "@/lib/porcinos/confirmarMovimientoPorcino";

export function useConfirmarMovimientoPorcino() {
    const [form, setForm] = useState<ConfirmarMovimientoForm | null>(null);
    const [origenExtra, setOrigenExtra] = useState<string>(""); // Solo visual
    const [enviando, setEnviando] = useState(false);
    const [exito, setExito] = useState(false);
    const [errorApi, setErrorApi] = useState<string | null>(null);

    // Cargar el movimiento desde el sessionStorage
    useEffect(() => {
        const stored = sessionStorage.getItem("movimientoPorcinoSeleccionado");
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setOrigenExtra(parsed.moOrigen || "");
                setForm({
                    remo: parsed.codiRemo || "",
                    moDesti: parsed.moDesti || "",
                    nombreAnimals: parsed.nombreAnimals ? String(parsed.nombreAnimals) : "",
                    codiAtes: parsed.codiAtes || "",
                    nifConductor: parsed.nifConductor || "",
                    matricula: parsed.matricula || "",
                });
            } catch (e) {
                console.error("Error leyendo sessionStorage", e);
            }
        }
    }, []);

    const update = useCallback((field: Partial<ConfirmarMovimientoForm>) => {
        setForm((prev) => prev ? { ...prev, ...field } : null);
    }, []);

    const enviar = useCallback(async (lang: "es" | "ca") => {
        if (!form) return;

        const errorVal = validarConfirmarMovimiento(form, lang);
        if (errorVal) {
            setErrorApi(errorVal);
            return;
        }

        const credentials = getCredentials();
        if (!credentials) {
            setErrorApi(lang === "ca" ? "Error de credencials" : "Error de credenciales");
            return;
        }

        setEnviando(true);
        setErrorApi(null);
        setExito(false);

        // Construir el body sin nulos
        const body = {
            nif: credentials.nif,
            password: credentials.password,
            moDesti: form.moDesti.toUpperCase().trim(),
            remo: form.remo.trim(),
            codiAtes: form.codiAtes.toUpperCase().trim(),
            nifConductor: form.nifConductor.toUpperCase().trim(),
            matricula: form.matricula.toUpperCase().trim(),
            nombreAnimals: form.nombreAnimals
        };

        secureLog.group("[GTR] WSConfirmarMoviment →");
        secureLog.request("WSConfirmarMoviment", body as unknown as Record<string, unknown>);

        try {
            const response = await fetch(
                "/api/gtr/proxy?endpoint=WSConfirmacioMoviments/AppJava/WSConfirmarMoviment",
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                }
            );

            let data: {
                codi?: string;
                descripcio?: string;
                guiaSolicitudResponse?: Array<{ codi?: string; descripcio?: string }>;
            };

            try {
                data = await response.json();
            } catch {
                setErrorApi(lang === "ca" ? "Error llegint la resposta" : "Error leyendo la respuesta");
                setEnviando(false);
                return;
            }

            secureLog.response(data);

            // Verificar si el error viene en guiaSolicitudResponse
            if (data.guiaSolicitudResponse && Array.isArray(data.guiaSolicitudResponse) && data.guiaSolicitudResponse.length > 0) {
                setErrorApi(data.guiaSolicitudResponse[0].descripcio || "Error en la confirmació");
                setEnviando(false);
                secureLog.groupEnd();
                return;
            }

            // Éxito
            if (data.codi === "OK") {
                setExito(true);
                sessionStorage.removeItem("movimientoPorcinoSeleccionado");

                // 1. Borramos este movimiento de la caché de la lista
                const cacheStr = sessionStorage.getItem("cacheListaMovimientosPorcinos");
                if (cacheStr) {
                    try {
                        const cache = JSON.parse(cacheStr);
                        // Filtramos por REMO
                        cache.lista = cache.lista.filter((m: { codiRemo: string }) => m.codiRemo !== form.remo);
                        sessionStorage.setItem("cacheListaMovimientosPorcinos", JSON.stringify(cache));
                    } catch (e) {}
                }

                // 2. Guardamos en el historial
                await guardarEnHistorial({
                    tipo: "CONFIRMACION_MOVIMIENTO_PORCINO",
                    resumen: `REMO: ${form.remo}`,
                    datos: { ...form, origen: origenExtra, codigoSeguimiento: "OK" } as unknown as Record<string, unknown>,
                });

            } else {
                setErrorApi(data.descripcio || "Error desconegut");
            }

        } catch (err) {
            setErrorApi(lang === "ca" ? "Error de xarxa" : "Error de red");
        } finally {
            setEnviando(false);
            secureLog.groupEnd();
        }
    }, [form, origenExtra]);

    const cerrarExito = useCallback(() => setExito(false), []);
    const limpiarErrorApi = useCallback(() => setErrorApi(null), []);

    return {
        form, origenExtra, enviando, exito, errorApi,
        update, enviar, cerrarExito, limpiarErrorApi
    };
}