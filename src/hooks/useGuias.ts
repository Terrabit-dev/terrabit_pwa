"use client";

import { useState, useCallback } from "react";
import {
    GUIA_FORM_INICIAL,
    type GuiaForm,
    type GuiaValidationError,
    type GuiaError,
    validarGuia,
    enviarGuia,
} from "@/lib/bovinos/guias";
import { obtenerHistorialPorId } from "@/lib/storage/historial";
import {
    actualizarBorrador,
    guardarBorrador,
    obtenerBorradorPorId,
    eliminarBorrador,
} from "@/lib/storage/borradores";
import { parseDraft } from "@/lib/storage/parseDraft";

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

const TIPO = "GUIA";

export function useGuias(): UseGuiasReturn {
    const [form, setForm]             = useState<GuiaForm>(GUIA_FORM_INICIAL);
    const [draftId, setDraftId]       = useState<number | null>(null);
    const [isReadOnly, setIsReadOnly] = useState(false);
    const [enviando, setEnviando]     = useState(false);
    const [exito, setExito]           = useState(false);
    const [errorApi, setErrorApi]     = useState<GuiaError | null>(null);

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

    const cargarBorrador = useCallback(async (id: number) => {
        const borrador = await obtenerBorradorPorId(id);
        if (borrador && borrador.tipo === TIPO) {
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
                    tipo:  TIPO,
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
        if (registro && registro.tipo === TIPO) {
            setForm(parseDraft(registro.datos, GUIA_FORM_INICIAL));
            setIsReadOnly(true);
        }
    }, []);

    const enviar = useCallback(async () => {
        setEnviando(true);
        setErrorApi(null);
        setExito(false);

        const result = await enviarGuia(form);

        if (!result.exito) {
            if (result.error) setErrorApi(result.error);
            setEnviando(false);
            return;
        }

        if (draftId) {
            await eliminarBorrador(draftId);
            setDraftId(null);
        }

        setForm(GUIA_FORM_INICIAL);
        setExito(true);
        setEnviando(false);
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