"use client";

import { useState, useCallback, useEffect } from "react";
import { useI18n } from "@/hooks/useI18n";
import { ALTA_GUIA_FORM_INICIAL, type AltaGuiaForm, CATEGORIAS_PORCINOS } from "@/lib/porcinos/altaGuias";
import { getCredentials } from "@/lib/storage/credentials";
import { guardarEnHistorial, obtenerHistorialPorId } from "@/lib/storage/historial";
import { actualizarBorrador, guardarBorrador, obtenerBorradorPorId, eliminarBorrador } from "@/lib/storage/borradores";
import { secureLog } from "@/lib/utils/secureLogger";
import { parseDraft } from "@/lib/storage/parseDraft";
import { guardarValorAutocomplete } from "@/lib/storage/historial";


// Interfaz estricta para el Payload de la API
interface ApiPayloadGuia {
    nif: string;
    password: string; // o "password", ajusta según pida tu API real
    tipusEspecie: string;
    tipusAccio: string;
    tipusMoviment: string;
    explotacioSortida: string;
    explotacioEntrada: string;
    codiCategoria: string;
    numAnimals: string;
    dataSortida: string;
    dataArribada: string;
    codiSirentra?: string;
    mitjaTransport?: string;
    matricula?: string;
    nifConductor?: string;
    mobilitat: string;
}

interface AltaGuiaError { tipo: "api" | "red" | "validacion"; mensaje?: string; }

export function useAltaGuias() {
    const { lang } = useI18n();
    const [form, setForm] = useState<AltaGuiaForm>(ALTA_GUIA_FORM_INICIAL);
    const [draftId, setDraftId] = useState<number | null>(null);
    const [isReadOnly, setIsReadOnly] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [exito, setExito] = useState(false);
    const [codigoSeguimiento, setCodigoSeguimiento] = useState<string | null>(null);
    const [errorApi, setErrorApi] = useState<AltaGuiaError | null>(null);

    // Al cargar el hook, pre-rellenamos la explotación de salida con el codiMO del usuario
    useEffect(() => {
        const credentials = getCredentials();
        if (credentials?.codiMO && !form.explotacioSortida && !isReadOnly && !draftId) {
            setForm(prev => ({ ...prev, explotacioSortida: credentials.codiMO }));
        }
    }, [form.explotacioSortida, isReadOnly, draftId]);

    const cargarBorrador = useCallback(async (id: number) => {
        const borrador = await obtenerBorradorPorId(id);
        if (borrador && borrador.tipo === "ALTA_GUIA_PORCINO") {
            setForm(parseDraft(borrador.datos, ALTA_GUIA_FORM_INICIAL));
            setDraftId(borrador.id!);
        }
    }, []);

    const guardarBorradorActual = useCallback(async () => {
        try {
            if (draftId) {
                await actualizarBorrador(draftId, form as unknown as Record<string, unknown>);
            } else {
                const nuevoId = await guardarBorrador({
                    tipo: "ALTA_GUIA_PORCINO",
                    datos: form as unknown as Record<string, unknown>,
                });
                setDraftId(nuevoId);
            }
            return true;
        } catch (error) {
            return false;
        }
    }, [form, draftId]);

    const cargarDesdeHistorial = useCallback(async (id: number | string) => {
        const registro = await obtenerHistorialPorId(id);
        if (registro && registro.tipo === "ALTA_GUIA_PORCINO") {
            setForm(parseDraft(registro.datos, ALTA_GUIA_FORM_INICIAL));
            setIsReadOnly(true);
        }
    }, []);

    const update = useCallback((field: Partial<AltaGuiaForm>) => {
        setForm((prev) => ({ ...prev, ...field }));
    }, []);

    // Helper para transformar "2025-07-29T22:00" a "202507292200"
    const formatearFechaAPI = (fechaISO: string) => {
        if (!fechaISO) return "";
        return fechaISO.replace(/[-T:]/g, "").substring(0, 12);
    };

    const enviar = useCallback(async () => {
        const credentials = getCredentials();
        if (!credentials) {
            setErrorApi({ tipo: "red" }); return;
        }

        setEnviando(true); setErrorApi(null); setExito(false); setCodigoSeguimiento(null);

        const body: ApiPayloadGuia = {
            nif: credentials.nif,
            password: credentials.password,
            // Valores Fijos Ocultos
            tipusEspecie: "02",
            tipusAccio: "NO",
            tipusMoviment: "01",
            mobilitat: "SI",
            // Valores del Formulario
            explotacioSortida: form.explotacioSortida.toUpperCase().trim(),
            explotacioEntrada: form.explotacioEntrada.toUpperCase().trim(),
            codiCategoria: form.codiCategoria,
            numAnimals: form.numAnimals,
            dataSortida: formatearFechaAPI(form.dataSortida),
            dataArribada: formatearFechaAPI(form.dataArribada),
            codiSirentra: form.codiSirentra?.trim(),
            mitjaTransport: form.mitjaTransport,
            matricula: form.matricula?.trim(),
            nifConductor: form.nifConductor?.trim()
        };

        secureLog.group("[GTR] WSAltaGuiaPorcino →");
        secureLog.request("WSAltaGuiaPorcino", body as unknown as Record<string, unknown>);

        try {
            // 1. AHORA APUNTAMOS AL ENDPOINT CORRECTO DE PORCINOS
            const response = await fetch(
                "/api/gtr/proxy?endpoint=WSAltaguies/AppJava/WSAltaGuia",
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                }
            );

            // 2. NUEVO: SI EL SERVIDOR FALLA (404, 500, etc), CORTAMOS DE RAÍZ
            if (!response.ok) {
                console.error("Error HTTP:", response.status, response.statusText);
                setErrorApi({ tipo: "red", mensaje: `Error de connexió (${response.status})` });
                setEnviando(false);
                return;
            }

            let data: {
                Resultat?: Array<{ descripcio?: string }>;
                descripcio?: string[];
            };
            try {
                data = await response.json();
            } catch {
                setErrorApi({ tipo: "red" }); setEnviando(false); return;
            }

            // 1. Comprobar si el error viene en el formato "Resultat" (por si acaso)
            if (data.Resultat && Array.isArray(data.Resultat) && data.Resultat.length > 0) {
                setErrorApi({ tipo: "api", mensaje: data.Resultat[0].descripcio });
                setEnviando(false);
                return;
            }

            // 2. Comprobar el formato array en "descripcio"
            if (data.descripcio && Array.isArray(data.descripcio)) {

                // Si la primera palabra NO es "OK", significa que la API nos ha devuelto una lista de errores
                if (data.descripcio[0] !== "OK") {
                    // Juntamos todos los errores con un salto de línea para mostrarlos en el modal rojo
                    const errorMessage = data.descripcio.join("\n");
                    setErrorApi({ tipo: "api", mensaje: errorMessage });
                    setEnviando(false);
                    return;
                }

                // Si pasamos el IF anterior, es que la primera posición es "OK". ¡ÉXITO REAL!
                const trackingCode = data.descripcio[1] ? data.descripcio[1] : "OK";
                setCodigoSeguimiento(trackingCode);

                const catObj = CATEGORIAS_PORCINOS.find(c => c.codigo === form.codiCategoria);
                const nombreCat = catObj ? (lang === "ca" ? catObj.nombre : (catObj.nombreEs || catObj.nombre)) : form.codiCategoriaNombre;
                await  guardarValorAutocomplete("explotacion_salida",body.explotacioSortida)
                if (body.nifConductor){
                    await guardarValorAutocomplete("matricula", body.nifConductor)
                }
                if (body.matricula){
                    await guardarValorAutocomplete("matricula", body.matricula)
                }
                if (body.codiSirentra){
                    await guardarValorAutocomplete("sirentra", body.codiSirentra)
                }
                await guardarEnHistorial({
                    tipo: "ALTA_GUIA_PORCINO",
                    resumen: `${nombreCat} — ${trackingCode}`,
                    datos: { ...form, codigoSeguimiento: trackingCode } as unknown as Record<string, unknown>,
                });

                if (draftId) { await eliminarBorrador(draftId); setDraftId(null); }

                setForm(ALTA_GUIA_FORM_INICIAL);
                setExito(true);

            } else {
                // Si la API devuelve algo rarísimo que no es ni Resultat ni descripcio
                setErrorApi({ tipo: "red", mensaje: "Format de resposta desconegut" });
            }

        } catch (err) {
            console.error("Error en el fetch:", err);
            setErrorApi({ tipo: "red" });
        } finally {
            setEnviando(false);
            secureLog.groupEnd();
        }
    }, [form, draftId, lang]);

    const cerrarExito = useCallback(() => setExito(false), []);
    const limpiarErrorApi = useCallback(() => setErrorApi(null), []);

    return {
        form, enviando, exito, codigoSeguimiento, errorApi, isReadOnly,
        update, enviar, cerrarExito, limpiarErrorApi,
        cargarBorrador, guardarBorradorActual, cargarDesdeHistorial
    };
}