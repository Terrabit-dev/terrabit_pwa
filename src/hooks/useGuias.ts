"use client";

import { useState, useCallback } from "react";
import {
    GUIA_FORM_INICIAL,
    type GuiaForm,
    type GuiaValidationError,
    validarGuia,
    formatearFechaHoraAPI,
    limpiarIdentificadores,
} from "@/lib/bovinos/guias";
import { parseGtrResponse } from "@/lib/gtr/errorHandler";
import { getCredentials } from "@/lib/storage/credentials";
import { guardarEnHistorial, obtenerHistorialPorId } from "@/lib/storage/historial";
import { actualizarBorrador, guardarBorrador, obtenerBorradorPorId, eliminarBorrador } from "@/lib/storage/borradores";
import { secureLog } from "@/lib/utils/secureLogger";
import type { GtrBaseResponse } from "@/lib/api/endpoints";
import { parseDraft } from "@/lib/storage/parseDraft";

interface GuiaApiError     { tipo: "api";  mensaje: string; }
interface GuiaNetworkError { tipo: "red"; }
export type GuiaError = GuiaApiError | GuiaNetworkError;

interface UseGuiasReturn {
    form:                    GuiaForm;
    enviando:                boolean;
    exito:                   boolean;
    errorApi:                GuiaError | null;
    isReadOnly:              boolean;
    update:                  (field: Partial<GuiaForm>) => void;
    agregarIdentificador:    () => void;
    eliminarIdentificador:   (index: number) => void;
    actualizarIdentificador: (index: number, valor: string) => void;
    validar:                 () => GuiaValidationError | null;
    enviar:                  () => Promise<void>;
    cerrarExito:             () => void;
    limpiarErrorApi:         () => void;
    cargarBorrador:          (id: number) => Promise<void>;
    guardarBorradorActual:   () => Promise<boolean>;
    cargarDesdeHistorial:    (id: number | string) => Promise<void>;
}

const TIPO_GUIA = "GUIA";
const ESPECIE   = "01";
const ENDPOINT  = "WSBoviGuies/AppJava/guies/WSAltaGuia";

export function useGuias(): UseGuiasReturn {
    const [form, setForm]             = useState<GuiaForm>(GUIA_FORM_INICIAL);
    const [draftId, setDraftId]       = useState<number | null>(null);
    const [isReadOnly, setIsReadOnly] = useState(false);
    const [enviando, setEnviando]     = useState(false);
    const [exito, setExito]           = useState(false);
    const [errorApi, setErrorApi]     = useState<GuiaError | null>(null);

    const cargarBorrador = useCallback(async (id: number) => {
        const borrador = await obtenerBorradorPorId(id);
        if (borrador && borrador.tipo === TIPO_GUIA) {
            setForm(parseDraft(borrador.datos, GUIA_FORM_INICIAL));
            setDraftId(borrador.id!);
        }
    }, []);

    const guardarBorradorActual = useCallback(async () => {
        try {
            if (draftId) {
                await actualizarBorrador(draftId, form as unknown as Record<string, unknown>);
            } else {
                const nuevoId = await guardarBorrador({
                    tipo: TIPO_GUIA,
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
        if (registro && registro.tipo === TIPO_GUIA) {
            setForm(parseDraft(registro.datos, GUIA_FORM_INICIAL));
            setIsReadOnly(true);
        }
    }, []);

    const update = useCallback((field: Partial<GuiaForm>) => {
        setForm((prev) => ({ ...prev, ...field }));
    }, []);

    const agregarIdentificador = useCallback(() => {
        setForm((prev) => ({ ...prev, identificadors: [...prev.identificadors, ""] }));
    }, []);

    const eliminarIdentificador = useCallback((index: number) => {
        setForm((prev) => {
            if (prev.identificadors.length <= 1) return prev;
            return { ...prev, identificadors: prev.identificadors.filter((_, i) => i !== index) };
        });
    }, []);

    const actualizarIdentificador = useCallback((index: number, valor: string) => {
        setForm((prev) => {
            const next = [...prev.identificadors];
            if (index >= 0 && index < next.length) next[index] = valor;
            return { ...prev, identificadors: next };
        });
    }, []);

    const validar = useCallback(() => validarGuia(form), [form]);

    const enviar = useCallback(async () => {
        const credentials = getCredentials();
        if (!credentials) {
            setErrorApi({ tipo: "red" });
            return;
        }

        setEnviando(true);
        setErrorApi(null);
        setExito(false);

        const ids = limpiarIdentificadores(form.identificadors);

        // Omitir campos opcionales vacíos — GTR rechaza ""
        const body: Record<string, unknown> = {
            nif:                  credentials.nif,
            passwordMobilitat:    credentials.password,
            especie:              ESPECIE,
            explotacioOrigen:     form.explotacioOrigen.trim(),
            explotacioDestinacio: form.explotacioDestinacio.trim(),
            temporal:             form.temporal,
            dataSortida:          formatearFechaHoraAPI(form.dataSortida, form.horaSortida),
            dataArribada:         formatearFechaHoraAPI(form.dataArribada, form.horaArribada),
            mobilitat:            form.mobilitat,
        };

        if (form.esCentroInspeccion) {
            if (form.pais.trim())           body.pais           = form.pais.trim();
            if (form.codiExplotacio.trim()) body.codiExplotacio = form.codiExplotacio.trim();
        }
        if (form.codiAtes.trim())         body.codiAtes         = form.codiAtes.trim();
        if (form.nomTransportista.trim()) body.nomTransportista = form.nomTransportista.trim();
        if (form.mitjaTransport)          body.mitjaTransport   = form.mitjaTransport;
        if (form.matricula.trim())        body.matricula        = form.matricula.trim();
        if (form.nifConductor.trim())     body.nifConductor     = form.nifConductor.trim();
        if (form.nomConductor.trim())     body.nomConductor     = form.nomConductor.trim();
        if (ids.length > 0)               body.identificadors   = ids;

        secureLog.group("[GTR] WSAltaGuia →");
        secureLog.request("WSAltaGuia", body);

        try {
            const response = await fetch(
                `/api/gtr/proxy?endpoint=${ENDPOINT}`,
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
                secureLog.error("No se pudo parsear el body de la respuesta");
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
                tipo:    TIPO_GUIA,
                resumen: `Guia — ${form.explotacioOrigen} → ${form.explotacioDestinacio}`,
                datos:   form as unknown as Record<string, unknown>,
            });

            if (draftId) {
                await eliminarBorrador(draftId);
                setDraftId(null);
            }

            setForm(GUIA_FORM_INICIAL);
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
        form, enviando, exito, errorApi, isReadOnly,
        update,
        agregarIdentificador, eliminarIdentificador, actualizarIdentificador,
        validar, enviar, cerrarExito, limpiarErrorApi,
        cargarBorrador, guardarBorradorActual, cargarDesdeHistorial,
    };
}