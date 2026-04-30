"use client";

import { useState, useCallback } from "react";
import {
    CONFIRMAR_MOV_FORM_INICIAL,
    ANIMAL_MOV_INICIAL,
    type ConfirmarMovimientoForm,
    type AnimalMovimiento,
    type ConfirmarMovValidationError,
    type ConfirmarMovError,
    type MovimentoPendiente,
    validarConfirmarMov,
    enviarConfirmarMov,
    precargarDesdeMovimiento,
    ESTATS_ESCORXADOR,
} from "@/lib/bovinos/confirmarMovimiento";
import { obtenerHistorialPorId, guardarEnHistorial } from "@/lib/storage/historial";
import {
    actualizarBorrador,
    guardarBorrador,
    obtenerBorradorPorId,
    eliminarBorrador,
} from "@/lib/storage/borradores";
import { parseDraft } from "@/lib/storage/parseDraft";

interface UseConfirmarMovReturn {
    form:                    ConfirmarMovimientoForm;
    enviando:                boolean;
    exito:                   boolean;
    errorApi:                ConfirmarMovError | null;
    isReadOnly:              boolean;
    update:                  (field: Partial<ConfirmarMovimientoForm>) => void;
    agregarAnimal:           () => void;
    eliminarAnimal:          (index: number) => void;
    actualizarAnimal:        (index: number, field: Partial<AnimalMovimiento>) => void;
    seleccionarEstatAnimal:  (index: number, estat: string) => void;
    precargarMovimiento:     (mov: MovimentoPendiente) => void;
    validar:                 () => ConfirmarMovValidationError | null;
    enviar:                  () => Promise<void>;
    cerrarExito:             () => void;
    limpiarErrorApi:         () => void;
    cargarBorrador:          (id: number) => Promise<void>;
    guardarBorradorActual:   () => Promise<boolean>;
    cargarDesdeHistorial:    (id: number | string) => Promise<void>;
}

const TIPO = "CONFIRMAR_MOVIMIENTO";

export function useConfirmarMovimiento(): UseConfirmarMovReturn {
    const [form, setForm]             = useState<ConfirmarMovimientoForm>(CONFIRMAR_MOV_FORM_INICIAL);
    const [draftId, setDraftId]       = useState<number | null>(null);
    const [isReadOnly, setIsReadOnly] = useState(false);
    const [enviando, setEnviando]     = useState(false);
    const [exito, setExito]           = useState(false);
    const [errorApi, setErrorApi]     = useState<ConfirmarMovError | null>(null);

    const update = useCallback((field: Partial<ConfirmarMovimientoForm>) => {
        setForm((prev) => ({ ...prev, ...field }));
    }, []);

    const agregarAnimal = useCallback(() => {
        setForm((prev) => ({ ...prev, animales: [...prev.animales, { ...ANIMAL_MOV_INICIAL }] }));
    }, []);

    const eliminarAnimal = useCallback((index: number) => {
        setForm((prev) => {
            if (prev.animales.length <= 1) return prev;
            return { ...prev, animales: prev.animales.filter((_, i) => i !== index) };
        });
    }, []);

    const actualizarAnimal = useCallback((index: number, field: Partial<AnimalMovimiento>) => {
        setForm((prev) => {
            const next = [...prev.animales];
            if (index >= 0 && index < next.length) {
                next[index] = { ...next[index], ...field };
            }
            return { ...prev, animales: next };
        });
    }, []);

    const seleccionarEstatAnimal = useCallback((index: number, estat: string) => {
        setForm((prev) => {
            const next = [...prev.animales];
            if (index < 0 || index >= next.length) return prev;
            const esSacrificio = estat === ESTATS_ESCORXADOR.SACRIFICI;
            next[index] = {
                ...next[index],
                estatArribada:    estat,
                dataSacrMort:     esSacrificio ? next[index].dataSacrMort     : "",
                pesCanal:         esSacrificio ? next[index].pesCanal         : "",
                classCanal:       esSacrificio ? next[index].classCanal       : "",
                tipusPresentacio: esSacrificio ? next[index].tipusPresentacio : "",
            };
            return { ...prev, animales: next };
        });
    }, []);

    const precargarMovimiento = useCallback((mov: MovimentoPendiente) => {
        setForm(precargarDesdeMovimiento(mov));
        setIsReadOnly(false);
        setDraftId(null);
    }, []);

    const validar = useCallback(() => validarConfirmarMov(form), [form]);

    const cargarBorrador = useCallback(async (id: number) => {
        const borrador = await obtenerBorradorPorId(id);
        if (borrador && borrador.tipo === TIPO) {
            setForm(parseDraft(borrador.datos, CONFIRMAR_MOV_FORM_INICIAL));
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
            setForm(parseDraft(registro.datos, CONFIRMAR_MOV_FORM_INICIAL));
            setIsReadOnly(true);
        }
    }, []);

    const enviar = useCallback(async () => {
        setEnviando(true);
        setErrorApi(null);
        setExito(false);

        const result = await enviarConfirmarMov(form);

        if (!result.exito) {
            if (result.error) setErrorApi(result.error);
            setEnviando(false);
            return;
        }

        if (draftId) {
            await eliminarBorrador(draftId);
            setDraftId(null);
        }

        await guardarEnHistorial({
            tipo:    TIPO,
            resumen: form.codiRemo
                ? `REMO: ${form.codiRemo}`
                : form.explotacioDestinacio
                    ? `Destí: ${form.explotacioDestinacio}`
                    : "Confirmar moviment",
            datos: form as unknown as Record<string, unknown>,
        });

        setForm(CONFIRMAR_MOV_FORM_INICIAL);
        setExito(true);
        setEnviando(false);
    }, [form, draftId]);

    const cerrarExito     = useCallback(() => setExito(false), []);
    const limpiarErrorApi = useCallback(() => setErrorApi(null), []);

    return {
        form, enviando, exito, errorApi, isReadOnly,
        update,
        agregarAnimal, eliminarAnimal, actualizarAnimal, seleccionarEstatAnimal,
        precargarMovimiento,
        validar, enviar, cerrarExito, limpiarErrorApi,
        cargarBorrador, guardarBorradorActual, cargarDesdeHistorial,
    };
}