"use client";

import { useState, useCallback } from "react";
import {
    IDENTIFICACION_FORM_INICIAL,
    type IdentificacionForm,
    type IdentificacionValidationError,
    validarIdentificacion,
    formatearFechaAPI,
} from "@/lib/bovinos/identificacion";
import { parseGtrResponse } from "@/lib/gtr/errorHandler";
import { getCredentials } from "@/lib/storage/credentials";
import { guardarEnHistorial, obtenerHistorialPorId } from "@/lib/storage/historial";
import { secureLog } from "@/lib/utils/secureLogger";
import type { GtrBaseResponse } from "@/lib/api/endpoints";
import {
    actualizarBorrador,
    eliminarBorrador,
    guardarBorrador,
    obtenerBorradorPorId,
} from "@/lib/storage/borradores";
import { parseDraft } from "@/lib/storage/parseDraft";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface IdentificacionApiError     { tipo: "api";  mensaje: string; }
interface IdentificacionNetworkError { tipo: "red"; }
export type IdentificacionError = IdentificacionApiError | IdentificacionNetworkError;

interface UseIdentificacionReturn {
    form:            IdentificacionForm;
    enviando:        boolean;
    exito:           boolean;
    errorApi:        IdentificacionError | null;
    resetKey:        number;
    isReadOnly:      boolean;
    update:          (field: Partial<IdentificacionForm>) => void;
    validar:         () => IdentificacionValidationError | null;
    enviar:          () => Promise<void>;
    cerrarExito:     () => void;
    limpiarErrorApi: () => void;
    cargarBorrador:        (id: number) => Promise<void>;
    guardarBorradorActual: () => Promise<boolean>;
    cargarDesdeHistorial:  (id: number | string) => Promise<void>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useIdentificacion(): UseIdentificacionReturn {
    const [form, setForm]             = useState<IdentificacionForm>(IDENTIFICACION_FORM_INICIAL);
    const [draftId, setDraftId]       = useState<number | null>(null);
    const [enviando, setEnviando]     = useState(false);
    const [exito, setExito]           = useState(false);
    const [errorApi, setErrorApi]     = useState<IdentificacionError | null>(null);
    const [resetKey, setResetKey]     = useState(0);
    const [isReadOnly, setIsReadOnly] = useState(false);

    const cargarDesdeHistorial = useCallback(async (id: number | string) => {
        const registro = await obtenerHistorialPorId(id);
        if (registro && registro.tipo === "IDENTIFICACION") {
            setForm(parseDraft(registro.datos, IDENTIFICACION_FORM_INICIAL));
            setIsReadOnly(true);
        }
    }, []);

    const cargarBorrador = useCallback(async (id: number) => {
        const borrador = await obtenerBorradorPorId(id);
        if (borrador && borrador.tipo === "IDENTIFICACION") {
            setForm(parseDraft(borrador.datos, IDENTIFICACION_FORM_INICIAL));
            setDraftId(borrador.id!);
        }
    }, []);

    const guardarBorradorActual = useCallback(async () => {
        try {
            if (draftId) {
                await actualizarBorrador(draftId, form as unknown as Record<string, unknown>);
            } else {
                const nuevoId = await guardarBorrador({
                    tipo:  "IDENTIFICACION",
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

    const update = useCallback((field: Partial<IdentificacionForm>) => {
        setForm((prev) => ({ ...prev, ...field }));
    }, []);

    const validar = useCallback(() => validarIdentificacion(form), [form]);

    const enviar = useCallback(async () => {
        const credentials = getCredentials();
        if (!credentials) {
            setErrorApi({ tipo: "red" });
            return;
        }

        setEnviando(true);
        setErrorApi(null);
        setExito(false);

        const body = {
            nif:               credentials.nif,
            passwordMobilitat: credentials.password,
            identificador:     form.identificador.trim(),
            dataIdentificacio: formatearFechaAPI(form.dataIdentificacio),
        };

        secureLog.group("[GTR] WSModificacioDataIdentificacioAnimal →");
        secureLog.request("WSModificacioDataIdentificacioAnimal", body);

        try {
            const response = await fetch(
                "/api/gtr/proxy?endpoint=WSBovi/AppJava/Bovi/WSModificacioDataIdentificacioAnimal/",
                {
                    method:  "PUT",
                    headers: { "Content-Type": "application/json" },
                    body:    JSON.stringify(body),
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
                tipo:    "IDENTIFICACION",
                resumen: `Identificació registrada — ${form.identificador}`,
                datos:   form as unknown as Record<string, unknown>,
            });

            if (draftId) {
                await eliminarBorrador(draftId);
                setDraftId(null);
            }

            setForm(IDENTIFICACION_FORM_INICIAL);
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
        form, enviando, exito, errorApi, resetKey, isReadOnly,
        update, validar, enviar, cerrarExito, limpiarErrorApi,
        cargarBorrador, guardarBorradorActual, cargarDesdeHistorial,
    };
}