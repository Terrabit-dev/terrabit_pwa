"use client";

import { useState, useCallback } from "react";
import { NACIMIENTO_FORM_INICIAL, type NacimientoForm } from "@/lib/bovinos/types";
import { validarNacimiento, formatearFechaAPI, type NacimientoValidationError } from "@/lib/bovinos/nacimiento";
import { parseGtrResponse } from "@/lib/gtr/errorHandler";
import { getCredentials } from "@/lib/storage/credentials";
import { guardarEnHistorial } from "@/lib/storage/historial";
import { secureLog } from "@/lib/utils/secureLogger";
import type { GtrBaseResponse } from "@/lib/api/endpoints";

interface NacimientoApiError     { tipo: "api";  mensaje: string; }
interface NacimientoNetworkError { tipo: "red"; }
export type NacimientoError = NacimientoApiError | NacimientoNetworkError;

interface UseNacimientoReturn {
    form:            NacimientoForm;
    enviando:        boolean;
    exito:           boolean;          // éxito → mostrar SuccessModal
    errorApi:        NacimientoError | null;
    update:          (field: Partial<NacimientoForm>) => void;
    validar:         () => NacimientoValidationError | null;
    enviar:          () => Promise<void>;
    cerrarExito:     () => void;       // cierra SuccessModal y limpia form
    limpiarErrorApi: () => void;
}

export function useNacimiento(): UseNacimientoReturn {
    const [form, setForm]         = useState<NacimientoForm>(NACIMIENTO_FORM_INICIAL);
    const [enviando, setEnviando] = useState(false);
    const [exito, setExito]       = useState(false);
    const [errorApi, setErrorApi] = useState<NacimientoError | null>(null);

    const update = useCallback((field: Partial<NacimientoForm>) => {
        setForm((prev) => ({ ...prev, ...field }));
    }, []);

    const validar = useCallback(() => validarNacimiento(form), [form]);

    const enviar = useCallback(async () => {
        const credentials = getCredentials();
        if (!credentials) {
            setErrorApi({ tipo: "red" });
            return;
        }

        setEnviando(true);
        setErrorApi(null);
        setExito(false);

        const body: Record<string, string> = {
            nif:               credentials.nif,
            passwordMobilitat: credentials.password,
            identificador:     form.idCria.trim(),
            identificadorMare: form.idMadre.trim(),
            dataNaixement:     formatearFechaAPI(form.fechaNacimiento),
            sexe:              form.sexoCodigo,
            raca:              form.razaCodigo,
            aptitud:           form.aptitudCodigo,
        };

        if (form.fechaIdentificacion?.trim()) {
            body.dataIdentificacio = formatearFechaAPI(form.fechaIdentificacion);
        }

        secureLog.group("[GTR] WSEnregistramentNaixement →");
        secureLog.request("WSEnregistramentNaixement", body as Record<string, unknown>);

        try {
            const response = await fetch(
                "/api/gtr/proxy?endpoint=WSBovi/AppJava/Bovi/WSEnregistramentNaixement/",
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
                tipo:    "NACIMIENTO",
                resumen: `Naixement registrat — ${form.idCria}`,
                datos:   form as unknown as Record<string, unknown>,
            });

            // Éxito: vaciar formulario y mostrar modal
            setForm(NACIMIENTO_FORM_INICIAL);
            setExito(true);

        } catch (err) {
            secureLog.error("Error de red", err);
            secureLog.groupEnd();
            setErrorApi({ tipo: "red" });
        } finally {
            setEnviando(false);
        }
    }, [form]);

    // Cierra el modal de éxito (el form ya se limpió al hacer setExito)
    const cerrarExito     = useCallback(() => setExito(false), []);
    const limpiarErrorApi = useCallback(() => setErrorApi(null), []);

    return { form, enviando, exito, errorApi, update, validar, enviar, cerrarExito, limpiarErrorApi };
}