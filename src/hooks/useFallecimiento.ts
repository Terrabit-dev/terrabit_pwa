"use client";

import { useState, useCallback } from "react";
import { latLonToUTM } from "@/lib/utils/locationUtils";
import {
    FALLECIMIENTO_FORM_INICIAL,
    type FallecimientoForm,
    type FallecimientoValidationError,
    validarFallecimiento,
    formatearFechaAPI,
} from "@/lib/bovinos/fallecimiento"; // <-- Asumo que el form inicial está aquí, como vi en el código anterior
import { parseGtrResponse } from "@/lib/gtr/errorHandler";
import { getCredentials } from "@/lib/storage/credentials";
import { guardarEnHistorial, obtenerHistorialPorId } from "@/lib/storage/historial";
import { actualizarBorrador, guardarBorrador, obtenerBorradorPorId, eliminarBorrador } from "@/lib/storage/borradores";
import { secureLog } from "@/lib/utils/secureLogger";
import type { GtrBaseResponse } from "@/lib/api/endpoints";

// IMPORTAMOS PARSE DRAFT AL IGUAL QUE EN NACIMIENTOS
import { parseDraft } from "@/lib/storage/parseDraft";

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
    isReadOnly:         boolean;
    update:             (field: Partial<FallecimientoForm>) => void;
    validar:            () => FallecimientoValidationError | null;
    enviar:             () => Promise<void>;
    obtenerCoordenadas: () => void;
    cerrarExito:        () => void;
    limpiarErrorApi:    () => void;
    cargarBorrador:     (id: number) => Promise<void>;
    guardarBorradorActual: () => Promise<boolean>;
    cargarDesdeHistorial: (id: number | string) => Promise<void>;
}

export function useFallecimiento(): UseFallecimientoReturn {
    const [form, setForm]                 = useState<FallecimientoForm>(FALLECIMIENTO_FORM_INICIAL);
    const [draftId, setDraftId]           = useState<number | null>(null);
    const [isReadOnly, setIsReadOnly]     = useState(false);
    const [enviando, setEnviando]         = useState(false);
    const [exito, setExito]               = useState(false);
    const [errorApi, setErrorApi]         = useState<FallecimientoError | null>(null);
    const [obtenendoGps, setObtenendoGps] = useState(false);
    const [resetKey, setResetKey]         = useState(0);

    const cargarBorrador = useCallback(async (id: number) => {
        const borrador = await obtenerBorradorPorId(id);
        if (borrador && borrador.tipo === "FALLECIMIENTO") {
            // APLICAMOS PARSEDRAFT AQUÍ
            setForm(parseDraft(borrador.datos, FALLECIMIENTO_FORM_INICIAL));
            setDraftId(borrador.id!);
        }
    }, []);

    const guardarBorradorActual = useCallback(async () => {
        try {
            if (draftId) {
                await actualizarBorrador(draftId, form as unknown as Record<string, unknown>);
            } else {
                const nuevoId = await guardarBorrador({
                    tipo: "FALLECIMIENTO",
                    datos: form as unknown as Record<string, unknown>,
                });
                setDraftId(nuevoId);
            }
            return true;
        } catch (error) {
            console.error("Error al guardar el borrador", error);
            return false;
        }
    }, [form, draftId]);

    const cargarDesdeHistorial = useCallback(async (id: number | string) => {
        const registro = await obtenerHistorialPorId(id);
        if (registro && registro.tipo === "FALLECIMIENTO") {
            // Y APLICAMOS PARSEDRAFT AQUÍ TAMBIÉN
            setForm(parseDraft(registro.datos, FALLECIMIENTO_FORM_INICIAL));
            setIsReadOnly(true);
        }
    }, []);

    const update = useCallback((field: Partial<FallecimientoForm>) => {
        setForm((prev) => ({ ...prev, ...field }));
    }, []);

    const validar = useCallback(() => validarFallecimiento(form), [form]);

    const obtenerCoordenadas = useCallback(() => {
        if (!navigator.geolocation || isReadOnly) return;
        setObtenendoGps(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const utm = latLonToUTM(pos.coords.latitude, pos.coords.longitude);
                setForm((prev) => ({
                    ...prev,
                    latitud:  utm.x,
                    longitud: utm.y,
                }));
                setObtenendoGps(false);
            },
            () => { setObtenendoGps(false); },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }, [isReadOnly]);

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
                "/api/gtr/proxy?endpoint=WSBovi/AppJava/Bovi/WSEnregistramentMort",
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

            if (draftId) {
                await eliminarBorrador(draftId);
                setDraftId(null);
            }

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
    }, [form, draftId]);

    const cerrarExito     = useCallback(() => setExito(false), []);
    const limpiarErrorApi = useCallback(() => setErrorApi(null), []);

    return {
        form, enviando, exito, errorApi, obtenendoGps, resetKey, isReadOnly,
        update, validar, enviar, obtenerCoordenadas,
        cerrarExito, limpiarErrorApi,
        cargarBorrador, guardarBorradorActual, cargarDesdeHistorial
    };
}