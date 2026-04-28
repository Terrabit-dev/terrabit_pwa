"use client";

import { useState, useCallback, useEffect } from "react";
import { getActiveCodiMO } from "@/lib/storage/credentials";
import {
    LISTAR_MOVIMIENTOS_FILTROS_INICIAL,
    type ListarMovimientosFiltros,
    type MovimientoPorcino,
    consultarMovimientosPorcinos,
    validarFiltrosMovimientos,
} from "@/lib/porcinos/listarMovimientosPorcinos";

export function useListarMovimientosPorcinos() {
    const [filtros, setFiltros] = useState<ListarMovimientosFiltros>(LISTAR_MOVIMIENTOS_FILTROS_INICIAL);
    const [lista, setLista] = useState<MovimientoPorcino[]>([]);
    const [cargando, setCargando] = useState(false);
    const [consultaIniciada, setConsultaIniciada] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Pre-rellenar el moDesti al cargar si no venimos de caché
    useEffect(() => {
        const moActivo = getActiveCodiMO();
        if (moActivo && !filtros.moDesti) {
            setFiltros(prev => ({ ...prev, moDesti: moActivo }));
        }
    }, [filtros.moDesti]);

    // Recuperar de la caché SOLO si venimos de confirmar un movimiento
    useEffect(() => {
        const volver = sessionStorage.getItem("volverAListaMovimientosPorcinos");
        const guardado = sessionStorage.getItem("cacheListaMovimientosPorcinos");

        if (volver && guardado) {
            sessionStorage.removeItem("volverAListaMovimientosPorcinos");
            try {
                const parsed = JSON.parse(guardado);
                /* eslint-disable react-hooks/set-state-in-effect */
                setFiltros(parsed.filtros);
                setLista(parsed.lista);
                setConsultaIniciada(parsed.consultaIniciada);
                /* eslint-enable react-hooks/set-state-in-effect */
            } catch (e) {}
        } else {
            sessionStorage.removeItem("cacheListaMovimientosPorcinos");
            sessionStorage.removeItem("volverAListaMovimientosPorcinos");
        }
    }, []);

    const updateFiltro = useCallback((campo: keyof ListarMovimientosFiltros, valor: string) => {
        setFiltros((prev) => ({ ...prev, [campo]: valor }));
    }, []);

    const cargarDatos = useCallback(async () => {
        setCargando(true);
        const result = await consultarMovimientosPorcinos(filtros);

        if (result.exito) {
            setLista(result.movimientos ?? []);
            setError(null);

            // Guardar en caché
            sessionStorage.setItem("cacheListaMovimientosPorcinos", JSON.stringify({
                filtros,
                lista: result.movimientos,
                consultaIniciada: true
            }));
        } else {
            setError(result.error ?? "Error desconegut");
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

        const moActivo = getActiveCodiMO();
        setFiltros({
            ...LISTAR_MOVIMIENTOS_FILTROS_INICIAL,
            moDesti: moActivo || ""
        });
        sessionStorage.removeItem("cacheListaMovimientosPorcinos");
    }, []);

    const seleccionarMovimiento = useCallback((movimiento: MovimientoPorcino) => {
        if (typeof window !== "undefined") {
            sessionStorage.setItem("movimientoPorcinoSeleccionado", JSON.stringify(movimiento));
            sessionStorage.setItem("volverAListaMovimientosPorcinos", "true");
        }
    }, []);

    return {
        filtros, lista, cargando, consultaIniciada, error,
        updateFiltro, validarPeticion, resetearConsulta, seleccionarMovimiento
    };
}