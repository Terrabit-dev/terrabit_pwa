"use client";

import { useState, useCallback } from "react";
import {
    LISTAR_GUIAS_FILTROS_INICIAL,
    type ListarGuiasFiltros,
    type Guia,
    consultarGuias,
    validarFiltrosGuias,
} from "@/lib/bovinos/listarGuias";
import { guardarValorAutocomplete } from "@/lib/storage/historial";

interface UseListarGuiasReturn {
    filtros:           ListarGuiasFiltros;
    lista:             Guia[];
    cargando:          boolean;
    consultaIniciada:  boolean;
    error:             string | null;
    guiaSeleccionada:  Guia | null;
    onRegaChange:      (valor: string) => void;
    onFechaChange:     (display: string) => void;
    validarPeticion:   (lang: "es" | "ca") => void;
    resetearConsulta:  () => void;
    seleccionarGuia:   (guia: Guia) => void;
    limpiarSeleccion:  () => void;
}

export function useListarGuias(): UseListarGuiasReturn {
    const [filtros, setFiltros]                   = useState<ListarGuiasFiltros>(LISTAR_GUIAS_FILTROS_INICIAL);
    const [lista, setLista]                       = useState<Guia[]>([]);
    const [cargando, setCargando]                 = useState(false);
    const [consultaIniciada, setConsultaIniciada] = useState(false);
    const [error, setError]                       = useState<string | null>(null);
    const [guiaSeleccionada, setGuiaSeleccionada] = useState<Guia | null>(null);

    const onRegaChange = useCallback((valor: string) => {
        setFiltros((prev) => ({ ...prev, codiRega: valor }));
    }, []);

    const onFechaChange = useCallback((display: string) => {
        setFiltros((prev) => ({ ...prev, fechaDisplay: display }));
    }, []);

    const cargarDatos = useCallback(async () => {
        setCargando(true);
        const result = await consultarGuias(filtros);

        if (result.exito) {
            setLista(result.guias ?? []);
            setError(null);
            if (filtros.codiRega) {
                await guardarValorAutocomplete("codi_rega", filtros.codiRega);
            }
        } else {
            setError(result.error ?? "Error desconocido");
            setConsultaIniciada(false);
        }
        setCargando(false);
    }, [filtros]);

    const validarPeticion = useCallback((lang: "es" | "ca") => {
        const errMsg = validarFiltrosGuias(filtros, lang);
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

    const seleccionarGuia = useCallback((guia: Guia) => {
        setGuiaSeleccionada(guia);
    }, []);

    const limpiarSeleccion = useCallback(() => {
        setGuiaSeleccionada(null);
    }, []);

    return {
        filtros, lista, cargando, consultaIniciada, error, guiaSeleccionada,
        onRegaChange, onFechaChange, validarPeticion, resetearConsulta,
        seleccionarGuia, limpiarSeleccion,
    };
}