"use client";

import { useState, useCallback } from "react";
import {
    FALLECIMIENTO_FORM_INICIAL,
    type FallecimientoForm,
    type FallecimientoValidationError,
    validarFallecimiento,
    formatearFechaAPI,
} from "@/lib/bovinos/fallecimiento";
import { parseGtrResponse } from "@/lib/gtr/errorHandler";
import { getCredentials } from "@/lib/storage/credentials";
import { guardarEnHistorial } from "@/lib/storage/historial";
import { secureLog } from "@/lib/utils/secureLogger";
import type { GtrBaseResponse } from "@/lib/api/endpoints";

interface FallecimientoApiError     { tipo: "api";  mensaje: string; }
interface FallecimientoNetworkError { tipo: "red"; }
export type FallecimientoError = FallecimientoApiError | FallecimientoNetworkError;

interface UseFallecimientoReturn {
    form:               FallecimientoForm;
    enviando:           boolean;
    exito:              boolean;
    errorApi:           FallecimientoError | null;
    obtenendoGps:       boolean;
    update:             (field: Partial<FallecimientoForm>) => void;
    validar:            () => FallecimientoValidationError | null;
    enviar:             () => Promise<void>;
    obtenerCoordenadas: () => void;
    cerrarExito:        () => void;
    limpiarErrorApi:    () => void;
}

export function useFallecimiento(): UseFallecimientoReturn {
    const [form, setForm]               = useState<FallecimientoForm>(FALLECIMIENTO_FORM_INICIAL);
    const [enviando, setEnviando]       = useState(false);
    const [exito, setExito]             = useState(false);
    const [errorApi, setErrorApi]       = useState<FallecimientoError | null>(null);
    const [obtenendoGps, setObtenendoGps] = useState(false);

    const update = useCallback((field: Partial<FallecimientoForm>) => {
        setForm((prev) => ({ ...prev, ...field }));
    }, []);

    const validar = useCallback(() => validarFallecimiento(form), [form]);

    // Geolocalización — equivalente al botón GPS del Android
    const obtenerCoordenadas = useCallback(() => {
        if (!navigator.geolocation) return;
        setObtenendoGps(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setForm((prev) => ({
                    ...prev,
                    latitud:  pos.coords.latitude.toFixed(6),
                    longitud: pos.coords.longitude.toFixed(6),
                }));
                setObtenendoGps(false);
            },
            () => {
                setObtenendoGps(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }, []);

    const enviar = useCallback(async () => {
        const credentials = getCredentials();
        if (!credentials) {
            setErrorApi({ tipo: "red" });
            return;
        }

        setEnviando(true);
        setErrorApi(null);
        setExito(false);

        const body: Record<string, string | boolean> = {
            nif:               credentials.nif,
            passwordMobilitat: credentials.password,
            identificador:     form.idAnimal.trim(),
            tipusMort:         form.tipusMort,
            dataMort:          formatearFechaAPI(form.dataMort),
        };

        // Solo si es Aborto
        if (form.tipusMort === "02") {
            body.mesoGestacio = form.mesoGestacio.trim();
        }

        // Solo si es Muerte
        if (form.tipusMort === "01") {
            body.cadaverInaccessible = form.cadaverInaccesible;
            if (form.cadaverInaccesible) {
                body.latitud  = form.latitud.trim();
                body.longitud = form.longitud.trim();
            }
        }

        secureLog.group("[GTR] WSBaixa →");
        secureLog.request("WSBaixa", body as Record<string, unknown>);

        try {
            const response = await fetch(
                "/api/gtr/proxy?endpoint=WSBovi/AppJava/Bovi/WSBaixa/",
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                }
            );

            secureLog.status(response.status, response.statusText);

            let data: GtrBaseResponse;
            try {
                data = await response.json();
            } catch {
                secureLog.error("No se pudo parsear el body");
                secureLog.groupEnd();
                setErrorApi({ tipo: "red" });
                setEnviando(false);
                return;
            }

            secureLog.response(data);
            secureLog.groupEnd();

            const errorMsg = parseGtrResponse(data);
            if (errorMsg) {
                setErrorApi({ tipo: "api", mensaje: errorMsg });
                setEnviando(false);
                return;
            }

            await guardarEnHistorial({
                tipo:    "FALLECIMIENTO",
                resumen: `Fallecimiento registrat — ${form.idAnimal}`,
                datos:   form as unknown as Record<string, unknown>,
            });

            setForm(FALLECIMIENTO_FORM_INICIAL);
            setExito(true);

        } catch (err) {
            secureLog.error("Error de red", err);
            secureLog.groupEnd();
            setErrorApi({ tipo: "red" });
        } finally {
            setEnviando(false);
        }
    }, [form]);

    const cerrarExito     = useCallback(() => setExito(false), []);
    const limpiarErrorApi = useCallback(() => setErrorApi(null), []);

    return {
        form, enviando, exito, errorApi, obtenendoGps,
        update, validar, enviar, obtenerCoordenadas,
        cerrarExito, limpiarErrorApi,
    };
}