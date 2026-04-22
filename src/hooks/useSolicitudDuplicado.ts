"use client";

import { useState, useCallback } from "react";
import {
    SOLICITUD_DUPLICADO_FORM_INICIAL,
    type SolicitudDuplicadoForm,
    validarSolicitudDuplicado
} from "@/lib/bovinos/solicitudDuplicado";
import { parseGtrResponse } from "@/lib/gtr/errorHandler";
import { getCredentials } from "@/lib/storage/credentials";
import { guardarEnHistorial, obtenerHistorialPorId } from "@/lib/storage/historial";
import { actualizarBorrador, guardarBorrador, obtenerBorradorPorId, eliminarBorrador } from "@/lib/storage/borradores";
import { secureLog } from "@/lib/utils/secureLogger";
import { parseDraft } from "@/lib/storage/parseDraft";
import { useI18n } from "@/hooks/useI18n"; 


interface SolicitudDuplicadoError { tipo: "api" | "red"; mensaje?: string; }

interface UseSolicitudDuplicadoReturn {
    form: SolicitudDuplicadoForm;
    enviando: boolean;
    exito: boolean;
    codigoSeguimiento: string | null;
    errorApi: SolicitudDuplicadoError | null;
    isReadOnly: boolean;
    update: (field: Partial<SolicitudDuplicadoForm>) => void;
    enviar: () => Promise<void>;
    cerrarExito: () => void;
    limpiarErrorApi: () => void;
    cargarBorrador: (id: number) => Promise<void>;
    guardarBorradorActual: () => Promise<boolean>;
    cargarDesdeHistorial: (id: number | string) => Promise<void>;
}

export function useSolicitudDuplicado(): UseSolicitudDuplicadoReturn {
    const { lang } = useI18n();
    const [form, setForm] = useState<SolicitudDuplicadoForm>(SOLICITUD_DUPLICADO_FORM_INICIAL);
    const [draftId, setDraftId] = useState<number | null>(null);
    const [isReadOnly, setIsReadOnly] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [exito, setExito] = useState(false);
    const [codigoSeguimiento, setCodigoSeguimiento] = useState<string | null>(null);
    const [errorApi, setErrorApi] = useState<SolicitudDuplicadoError | null>(null);

    const cargarBorrador = useCallback(async (id: number) => {
        const borrador = await obtenerBorradorPorId(id);
        if (borrador && borrador.tipo === "SOLICITUD_DUPLICADO") {
            setForm(parseDraft(borrador.datos, SOLICITUD_DUPLICADO_FORM_INICIAL));
            setDraftId(borrador.id!);
        }
    }, []);

    const guardarBorradorActual = useCallback(async () => {
        try {
            if (draftId) {
                await actualizarBorrador(draftId, form as unknown as Record<string, unknown>);
            } else {
                const nuevoId = await guardarBorrador({
                    tipo: "SOLICITUD_DUPLICADO",
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
        if (registro && registro.tipo === "SOLICITUD_DUPLICADO") {
            setForm(parseDraft(registro.datos, SOLICITUD_DUPLICADO_FORM_INICIAL));
            setIsReadOnly(true);
        }
    }, []);

    const update = useCallback((field: Partial<SolicitudDuplicadoForm>) => {
        setForm((prev) => ({ ...prev, ...field }));
    }, []);

    const enviar = useCallback(async () => {
        const credentials = getCredentials();
        if (!credentials) {
            setErrorApi({ tipo: "red" }); return;
        }

        setEnviando(true); setErrorApi(null); setExito(false); setCodigoSeguimiento(null);

        const body: any = {
            nif: credentials.nif,
            passwordMobilitat: credentials.password,
            especie: "01",
            empresaSubministradora: form.empresaSubministradora,
            tipusEnviament: form.tipusEnviament,
            adrecaLliurament: form.adrecaLliurament,
        };

        // Mapeamos el array de identificadores
        body.identificadors = form.identificadors.map(i => ({
            identificador: i.identificador.trim(),
            tipusMaterial: i.tipusMaterial
        }));

        // Añadimos TODOS los datos de dirección (rellenando los vacíos para la API)
        if (form.adrecaLliurament === "01") {
            body.oc              = form.oc;
            body.adreca          = "";
            body.poblacio        = "";
            body.cp              = "";
            body.municipi        = "";
            body.telefonContacte = "";
        } else {
            body.oc              = "";
            body.adreca          = form.adreca;
            body.poblacio        = form.poblacio;
            body.cp              = form.cp;
            body.municipi        = form.municipi;
            body.telefonContacte = form.telefonContacte;
        }

        secureLog.group("[GTR] WSSolicitudDuplicat →");
        secureLog.request("WSSolicitudDuplicat", body);

        try {
            const response = await fetch(
                "/api/gtr/proxy?endpoint=WSBovi/AppJava/Bovi/WSSolicitudDuplicat",
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                }
            );

            let data: any;
            try { data = await response.json(); } catch {
                setErrorApi({ tipo: "red" }); setEnviando(false); return;
            }

            const errorMsg = parseGtrResponse(data);
            if (errorMsg) {
                setErrorApi({ tipo: "api", mensaje: errorMsg }); setEnviando(false); return;
            }

            const trackingCode = data.codi || "OK";
            setCodigoSeguimiento(trackingCode)



            // ÉXITO: Guardamos el código de seguimiento (ej: "DUP2024000003")
            setCodigoSeguimiento(data.codi || "OK");

            await guardarEnHistorial({
                tipo: "SOLICITUD_DUPLICADO", // o "SOLICITUD_DUPLICADO"
                // Incluimos el código en el resumen para que se vea en la lista
                resumen: `${lang === "ca" ? "Sol·licitud" : "Solicitud"} — ${trackingCode}`,
                datos: {
                    ...form,
                    codigoSeguimiento: trackingCode // Lo metemos dentro de los datos para el detalle
                } as unknown as Record<string, unknown>,
            });

            if (draftId) { await eliminarBorrador(draftId); setDraftId(null); }

            setForm(SOLICITUD_DUPLICADO_FORM_INICIAL);
            setExito(true);

        } catch (err) {
            setErrorApi({ tipo: "red" });
        } finally {
            setEnviando(false);
            secureLog.groupEnd();
        }
    }, [form, draftId]);

    const cerrarExito = useCallback(() => setExito(false), []);
    const limpiarErrorApi = useCallback(() => setErrorApi(null), []);

    return {
        form, enviando, exito, codigoSeguimiento, errorApi, isReadOnly,
        update, enviar, cerrarExito, limpiarErrorApi,
        cargarBorrador, guardarBorradorActual, cargarDesdeHistorial
    };
}