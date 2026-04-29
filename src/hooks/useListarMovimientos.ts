"use client";

import { useState, useCallback } from "react";
import { guardarValorAutocomplete } from "@/lib/storage/historial";
import {
    LISTAR_MOVS_FILTROS_INICIAL,
    type ListarMovimientosFiltros,
    type Moviment,
    consultarMovimientosPendientes,
    validarFiltrosMovimientos,
} from "@/lib/bovinos/listarMovimientos";

interface UseListarMovimientosReturn {
    filtros:                ListarMovimientosFiltros;
    lista:                  Moviment[];
    cargando:               boolean;
    consultaIniciada:       boolean;
    error:                  string | null;
    movimientoSeleccionado: Moviment | null;
    onCodiChange:           (valor: string) => void;
    onFechaChange:          (display: string) => void;
    validarPeticion:        (lang: "es" | "ca") => void;
    resetearConsulta:       () => void;
    seleccionarMovi:        (mov: Moviment) => void;
    limpiarSeleccion:       () => void;
}

export function useListarMovimientos(): UseListarMovimientosReturn {
    const [filtros, setFiltros]                               = useState<ListarMovimientosFiltros>(LISTAR_MOVS_FILTROS_INICIAL);
    const [lista, setLista]                                   = useState<Moviment[]>([]);
    const [cargando, setCargando]                             = useState(false);
    const [consultaIniciada, setConsultaIniciada]             = useState(false);
    const [error, setError]                                   = useState<string | null>(null);
    const [movimientoSeleccionado, setMovimientoSeleccionado] = useState<Moviment | null>(null);

    const onCodiChange = useCallback((valor: string) => {
        setFiltros((prev) => ({ ...prev, explotacioDestinacio: valor }));
    }, []);

    const onFechaChange = useCallback((display: string) => {
        setFiltros((prev) => ({ ...prev, fechaDisplay: display }));
    }, []);

    const cargarDatos = useCallback(async () => {
        setCargando(true);
        const result = await consultarMovimientosPendientes(filtros);

        if (result.exito) {
            setLista(result.movimientos ?? []);
            setError(null);
            if (filtros.explotacioDestinacio) {
                await guardarValorAutocomplete("codi_rega", filtros.explotacioDestinacio);
            }
        } else {
            setError(result.error ?? "Error desconocido");
            setConsultaIniciada(false);
        }
        setCargando(false);
    }, [filtros]);

    const validarPeticion = useCallback((lang: "es" | "ca") => {
        const errMsg = validarFiltrosMovimientos(filtros, lang);
        if (errMsg) {
            setError(errMsg);
            return;
        }
        setError(null);
        setConsultaIniciada(true);
        void cargarDatos();
    }, [filtros, cargarDatos]);

    const resetearConsulta = useCallback(() => {
        setConsultaIniciada(false);
        setError(null);
        setLista([]);
    }, []);

    const seleccionarMovi = useCallback((mov: Moviment) => {
        setMovimientoSeleccionado(mov);
    }, []);

    const limpiarSeleccion = useCallback(() => {
        setMovimientoSeleccionado(null);
    }, []);

    return {
        filtros, lista, cargando, consultaIniciada, error, movimientoSeleccionado,
        onCodiChange, onFechaChange, validarPeticion, resetearConsulta,
        seleccionarMovi, limpiarSeleccion,
    };
}