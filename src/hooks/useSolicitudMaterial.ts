"use client";

import { useState, useCallback } from "react";
import {
    SOLICITUD_MATERIAL_FORM_INICIAL,
    type SolicitudMaterialForm,
    validarSolicitudMaterial,
    requiereCodiExplotacio
} from "@/lib/bovinos/solicitudMaterial";
import { parseGtrResponse } from "@/lib/gtr/errorHandler";
import { getCredentials } from "@/lib/storage/credentials";
import { guardarEnHistorial, obtenerHistorialPorId } from "@/lib/storage/historial";
import { actualizarBorrador, guardarBorrador, obtenerBorradorPorId, eliminarBorrador } from "@/lib/storage/borradores";
import { secureLog } from "@/lib/utils/secureLogger";
import { parseDraft } from "@/lib/storage/parseDraft";
import { useI18n } from "@/hooks/useI18n";
import {GtrBaseResponse} from "@/lib/bovinos/types"; //

interface ApiPayloadMaterial {
    nif: string;
    passwordMobilitat: string;
    especie: string;
    empresaSubministradora: string;
    tipusEnviament: string;
    adrecaLliurament: string;
    tipusMaterial: string;
    unitats?: Array<{ nombreUnitats: string; codiExplotacio: string }>;
    oc?: string;
    adreca?: string;
    poblacio?: string;
    cp?: string;
    municipi?: string;
    telefonContacte?: string;
}

interface SolicitudMaterialError { tipo: "api" | "red"; mensaje?: string; }

interface UseSolicitudMaterialReturn {
    form: SolicitudMaterialForm;
    enviando: boolean;
    exito: boolean;
    codigoSeguimiento: string | null; // NUEVO: Para mostrar "MAT2024..."
    errorApi: SolicitudMaterialError | null;
    isReadOnly: boolean;
    update: (field: Partial<SolicitudMaterialForm>) => void;
    validar: () => { tipo: "validacion", codigo: number } | null;
    enviar: () => Promise<void>;
    cerrarExito: () => void;
    limpiarErrorApi: () => void;
    cargarBorrador: (id: number) => Promise<void>;
    guardarBorradorActual: () => Promise<boolean>;
    cargarDesdeHistorial: (id: number | string) => Promise<void>;
}

export function useSolicitudMaterial(): UseSolicitudMaterialReturn {
    const { lang } = useI18n();
    const [form, setForm] = useState<SolicitudMaterialForm>(SOLICITUD_MATERIAL_FORM_INICIAL);
    const [draftId, setDraftId] = useState<number | null>(null);
    const [isReadOnly, setIsReadOnly] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [exito, setExito] = useState(false);
    const [codigoSeguimiento, setCodigoSeguimiento] = useState<string | null>(null);
    const [errorApi, setErrorApi] = useState<SolicitudMaterialError | null>(null);

    const cargarBorrador = useCallback(async (id: number) => {
        const borrador = await obtenerBorradorPorId(id);
        if (borrador && borrador.tipo === "SOLICITUD_MATERIAL") {
            setForm(parseDraft(borrador.datos, SOLICITUD_MATERIAL_FORM_INICIAL));
            setDraftId(borrador.id!);
        }
    }, []);

    const guardarBorradorActual = useCallback(async () => {
        try {
            if (draftId) {
                await actualizarBorrador(draftId, form as unknown as Record<string, unknown>);
            } else {
                const nuevoId = await guardarBorrador({
                    tipo: "SOLICITUD_MATERIAL",
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
        if (registro && registro.tipo === "SOLICITUD_MATERIAL") {
            setForm(parseDraft(registro.datos, SOLICITUD_MATERIAL_FORM_INICIAL));
            setIsReadOnly(true);
        }
    }, []);

    const update = useCallback((field: Partial<SolicitudMaterialForm>) => {
        setForm((prev) => ({ ...prev, ...field }));
    }, []);

    const validar = useCallback(() => validarSolicitudMaterial(form), [form]);

    const enviar = useCallback(async () => {
        const credentials = getCredentials();
        if (!credentials) {
            setErrorApi({ tipo: "red" }); return;
        }


        setEnviando(true); setErrorApi(null); setExito(false); setCodigoSeguimiento(null);

        const body: ApiPayloadMaterial = {
            nif: credentials.nif,
            passwordMobilitat: credentials.password,
            especie: "01",
            empresaSubministradora: form.empresaSubministradora,
            tipusEnviament: form.tipusEnviament,
            adrecaLliurament: form.adrecaLliurament,
            tipusMaterial: form.tipusMaterial,
        };
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

        const enviarCodiGlobal = form.unitats.length > 1 || requiereCodiExplotacio(form.tipusMaterial);

        body.unitats = form.unitats.map(u => ({
            nombreUnitats: u.nombreUnitats,
            codiExplotacio: enviarCodiGlobal ? u.codiExplotacio.trim() : ""
        }));



        // Añadimos datos de dirección
        if (form.adrecaLliurament === "01") {
            body.oc = form.oc;
        } else if (form.adrecaLliurament === "02" || form.adrecaLliurament === "03") {
            body.adreca = form.adreca; body.poblacio = form.poblacio;
            body.cp = form.cp; body.municipi = form.municipi;
            body.telefonContacte = form.telefonContacte;
        }

        secureLog.group("[GTR] WSSolicitudMaterial →");
        secureLog.request("WSSolicitudMaterial", body as unknown as Record<string, unknown>);

        try {
            const response = await fetch(
                "/api/gtr/proxy?endpoint=WSEnviamentDuplicatES/AppJava/WSSolicitudMaterial",
                {
                    method: "PUT", // Mantengo PUT, si te da 404, prueba a cambiar a POST
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                }
            );

            let data: GtrBaseResponse;
            try { data = await response.json(); } catch {
                setErrorApi({ tipo: "red" }); setEnviando(false); return;
            }

            const errorMsg = parseGtrResponse(data);
            if (errorMsg) {
                setErrorApi({ tipo: "api", mensaje: errorMsg }); setEnviando(false); return;
            }

            const trackingCode = data.codi || "OK";
            setCodigoSeguimiento(trackingCode)
            // ÉXITO: Guardamos el código de seguimiento ("MAT2024000018")
            setCodigoSeguimiento(data.codi || "OK");

            await guardarEnHistorial({
                tipo: "SOLICITUD_MATERIAL",
                // Incluimos el código en el resumen para que se vea en la lista
                resumen: `${lang === "ca" ? "Sol·licitud" : "Solicitud"} — ${trackingCode}`,
                datos: {
                    ...form,
                    codigoSeguimiento: trackingCode // Lo metemos dentro de los datos para el detalle
                } as unknown as Record<string, unknown>,
            });

            if (draftId) { await eliminarBorrador(draftId); setDraftId(null); }

            setForm(SOLICITUD_MATERIAL_FORM_INICIAL);
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
        update, validar, enviar, cerrarExito, limpiarErrorApi,
        cargarBorrador, guardarBorradorActual, cargarDesdeHistorial
    };
}