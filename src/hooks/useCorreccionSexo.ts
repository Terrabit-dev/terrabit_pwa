"use client";

import { useState, useCallback } from "react";
import {
    CORRECCION_SEXO_FORM_INICIAL,
    type CorreccionSexoForm,
    type CorreccionSexoValidationError,
    validarCorreccionSexo,
} from "@/lib/bovinos/correccionSexo";
import { parseGtrResponse } from "@/lib/gtr/errorHandler";
import { getCredentials } from "@/lib/storage/credentials";
import { guardarEnHistorial } from "@/lib/storage/historial";
import { secureLog } from "@/lib/utils/secureLogger";
import type { GtrBaseResponse } from "@/lib/api/endpoints";

interface CorreccionSexoApiError     { tipo: "api";  mensaje: string; }
interface CorreccionSexoNetworkError { tipo: "red"; }
export type CorreccionSexoError = CorreccionSexoApiError | CorreccionSexoNetworkError;

interface UseCorreccionSexoReturn {
    form:            CorreccionSexoForm;
    enviando:        boolean;
    exito:           boolean;
    errorApi:        CorreccionSexoError | null;
    update:          (field: Partial<CorreccionSexoForm>) => void;
    validar:         () => CorreccionSexoValidationError | null;
    enviar:          () => Promise<void>;
    cerrarExito:     () => void;
    limpiarErrorApi: () => void;
}

export function useCorreccionSexo(): UseCorreccionSexoReturn {
    const [form, setForm]         = useState<CorreccionSexoForm>(CORRECCION_SEXO_FORM_INICIAL);
    const [enviando, setEnviando] = useState(false);
    const [exito, setExito]       = useState(false);
    const [errorApi, setErrorApi] = useState<CorreccionSexoError | null>(null);

    const update = useCallback((field: Partial<CorreccionSexoForm>) => {
        setForm((prev) => ({ ...prev, ...field }));
    }, []);

    const validar = useCallback(() => validarCorreccionSexo(form), [form]);

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
            identificador:     form.identificador.trim(),
            sexe:              form.sexoCodigo,
        };

        secureLog.group("[GTR] WSModificarAnimal →");
        secureLog.request("WSModificarAnimal", body as Record<string, unknown>);

        try {
            const response = await fetch(
                "/api/gtr/proxy?endpoint=WSBovi/AppJava/Bovi/WSModificacioAnimal",
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                }
            );

            secureLog.status(response.status, response.statusText);

            // Si el servidor devuelve HTML (404/500) tratar como error de red
            const contentType = response.headers.get("content-type") ?? "";
            if (!contentType.includes("application/json")) {
                secureLog.error(`Respuesta no-JSON del servidor: ${response.status}`);
                secureLog.groupEnd();
                setErrorApi({ tipo: "red" });
                setEnviando(false);
                return;
            }

            let data: GtrBaseResponse;
            try {
                data = await response.json();
            } catch {
                secureLog.error("No se pudo parsear el body");
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
                tipo:    "CORRECCION_SEXO",
                resumen: `Correcció de sexe — ${form.identificador}`,
                datos:   form as unknown as Record<string, unknown>,
            });

            setForm(CORRECCION_SEXO_FORM_INICIAL);
            setExito(true);

        } catch (err) {
            secureLog.error("Error de red", err);
            secureLog.groupEnd();
            setErrorApi({ tipo: "red" });
        } finally {
            setEnviando(false);
        }
    }, [form]);

    const cerrarExito     = useCallback(() => setExito(false), []);
    const limpiarErrorApi = useCallback(() => setErrorApi(null), []);

    return { form, enviando, exito, errorApi, update, validar, enviar, cerrarExito, limpiarErrorApi };
}