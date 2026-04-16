"use client";

import { useState, useCallback } from "react";
import { latLonToUTM } from "@/lib/utils/locationUtils";
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
    resetKey:           number;
    update:             (field: Partial<FallecimientoForm>) => void;
    validar:            () => FallecimientoValidationError | null;
    enviar:             () => Promise<void>;
    obtenerCoordenadas: () => void;
    cerrarExito:        () => void;
    limpiarErrorApi:    () => void;
}

export function useFallecimiento(): UseFallecimientoReturn {
    const [form, setForm]                 = useState<FallecimientoForm>(FALLECIMIENTO_FORM_INICIAL);
    const [enviando, setEnviando]         = useState(false);
    const [exito, setExito]               = useState(false);
    const [errorApi, setErrorApi]         = useState<FallecimientoError | null>(null);
    const [obtenendoGps, setObtenendoGps] = useState(false);
    const [resetKey, setResetKey]         = useState(0);

    const update = useCallback((field: Partial<FallecimientoForm>) => {
        setForm((prev) => ({ ...prev, ...field }));
    }, []);

    const validar = useCallback(() => validarFallecimiento(form), [form]);

    const obtenerCoordenadas = useCallback(() => {
        if (!navigator.geolocation) return;
        setObtenendoGps(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const utm = latLonToUTM(pos.coords.latitude, pos.coords.longitude);
                setForm((prev) => ({
                    ...prev,
                    latitud:  utm.x,  // coordenadaX = Easting
                    longitud: utm.y,  // coordenadaY = Northing
                }));
                setObtenendoGps(false);
            },
            () => { setObtenendoGps(false); },
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

        const body: Record<string, string> = {
            nif:                credentials.nif,
            passwordMobilitat:  credentials.password,
            identificador:      form.identificador.trim(),
            tipus:              form.tipus,
            dataMort:           formatearFechaAPI(form.dataMort),
            cadaverInaccesible: form.cadaverInaccesible ? "SI" : "NO",
        };

        if (form.tipus === "02") {
            body.mesosGestacio = form.mesosGestacio.trim();
        }

        if (form.tipus === "01" && form.cadaverInaccesible) {
            body.coordenadaX = form.latitud.trim().replace(".", ",");
            body.coordenadaY = form.longitud.trim().replace(".", ",");
        }

        secureLog.group("[GTR] WSEnregistramentMort →");
        secureLog.request("WSEnregistramentMort", body as Record<string, unknown>);

        try {
            const response = await fetch(
                "/api/gtr/proxy?endpoint=WSBovi/AppJava/Bovi/WSEnregistramentMort/",
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
                resumen: `Mort registrada — ${form.identificador}`,
                datos:   form as unknown as Record<string, unknown>,
            });

            setForm(FALLECIMIENTO_FORM_INICIAL);
            setResetKey((k) => k + 1);
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
        form, enviando, exito, errorApi, obtenendoGps, resetKey,
        update, validar, enviar, obtenerCoordenadas,
        cerrarExito, limpiarErrorApi,
    };
}