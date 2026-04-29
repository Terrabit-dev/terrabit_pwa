"use client";

import { useState, useCallback, useEffect } from "react";
import {
    LISTAR_GUIAS_PORCINOS_FILTROS_INICIAL,
    type ListarGuiasPorcinosFiltros,
    type GuiaPorcino,
    consultarGuiasPorcinos,
    validarFiltrosGuiasPorcinos,
} from "@/lib/porcinos/listarGuiasPorcinos";
import { guardarValorAutocomplete } from "@/lib/storage/historial";

export function useListarGuiasPorcinos() {
    const [filtros, setFiltros] = useState<ListarGuiasPorcinosFiltros>(LISTAR_GUIAS_PORCINOS_FILTROS_INICIAL);
    const [lista, setLista] = useState<GuiaPorcino[]>([]);
    const [cargando, setCargando] = useState(false);
    const [consultaIniciada, setConsultaIniciada] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [guiaSeleccionada, setGuiaSeleccionada] = useState<GuiaPorcino | null>(null);

    //  Recuperar de la caché SOLO si venimos de editar
    useEffect(() => {
        const volver = sessionStorage.getItem("volverAListaPorcinos");
        const guardado = sessionStorage.getItem("cacheListaGuiasPorcinos");

        if (volver && guardado) {
            // Bajamos la bandera para la próxima vez
            sessionStorage.removeItem("volverAListaPorcinos");
            try {
                const parsed = JSON.parse(guardado);
                /* eslint-disable react-hooks/set-state-in-effect */
                setFiltros(parsed.filtros);
                setLista(parsed.lista);
                setConsultaIniciada(parsed.consultaIniciada);
                /* eslint-enable react-hooks/set-state-in-effect */
            } catch (e) {}
        } else {
            // Entramos desde el menú principal: Limpiamos todo para empezar de cero
            sessionStorage.removeItem("cacheListaGuiasPorcinos");
            sessionStorage.removeItem("volverAListaPorcinos");
        }
    }, []);

    const onRegaChange = useCallback((valor: string) => {
        setFiltros((prev) => ({ ...prev, codiRega: valor }));
    }, []);

    const onFechaChange = useCallback((display: string) => {
        setFiltros((prev) => ({ ...prev, fechaDisplay: display }));
    }, []);

    const cargarDatos = useCallback(async () => {
        setCargando(true);
        const result = await consultarGuiasPorcinos(filtros);
        if (result.exito) {
            setLista(result.guias ?? []);
            setError(null);
            //  Guardar REGA en el historial para autocompletado
            if (filtros.codiRega) {
                await guardarValorAutocomplete("porcinos_rega", filtros.codiRega);
            }
            // Guardar en caché cuando hay éxito
            sessionStorage.setItem("cacheListaGuiasPorcinos", JSON.stringify({
                filtros,
                lista: result.guias,
                consultaIniciada: true
            }));
        } else {
            setError(result.error ?? "Error desconegut");
            setConsultaIniciada(false);
        }
        setCargando(false);
    }, [filtros]);

    const validarPeticion = useCallback((lang: "es" | "ca") => {
        const errMsg = validarFiltrosGuiasPorcinos(filtros, lang);
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
        setFiltros(LISTAR_GUIAS_PORCINOS_FILTROS_INICIAL);
        sessionStorage.removeItem("cacheListaGuiasPorcinos"); // Limpiar caché
    }, []);

    const seleccionarGuia = useCallback((guia: GuiaPorcino) => {
        setGuiaSeleccionada(guia);
    }, []);

    return {
        filtros, lista, cargando, consultaIniciada, error, guiaSeleccionada,
        onRegaChange, onFechaChange, validarPeticion, resetearConsulta, seleccionarGuia
    };
}