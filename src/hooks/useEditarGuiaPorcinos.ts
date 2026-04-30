"use client";

import { useState, useCallback, useEffect } from "react";
import { getCredentials } from "@/lib/storage/credentials";
import { secureLog } from "@/lib/utils/secureLogger";
import { guardarEnHistorial } from "@/lib/storage/historial";
import {
    type EditarGuiaPorcinoForm,
    apiToDatetimeLocal,
    datetimeLocalToApi,
    validarEditarGuiaPorcino
} from "@/lib/porcinos/editarGuiaPorcinos";
import { guardarValorAutocomplete } from "@/lib/storage/historial";

export function useEditarGuiaPorcinos() {
    const [form, setForm] = useState<EditarGuiaPorcinoForm | null>(null);
    const [enviando, setEnviando] = useState(false);
    const [exito, setExito] = useState(false);
    const [errorApi, setErrorApi] = useState<string | null>(null);

    // Cargar la guía desde el sessionStorage al montar el componente
    useEffect(() => {
        const stored = sessionStorage.getItem("guiaPorcinoSeleccionada");
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setForm({
                    remo: parsed.remo || "",
                    categoria: parsed.categoria || "",
                    nombreAnimals: parsed.nombreAnimals ? String(parsed.nombreAnimals) : "",
                    dataSortida: apiToDatetimeLocal(parsed.dataSortida),
                    dataArribada: apiToDatetimeLocal(parsed.dataArribada),
                    transportista: parsed.transportista || "", // Puede venir null, ponemos ""
                    responsable: parsed.responsable || "",     // Puede venir null, ponemos ""
                    vehicle: parsed.vehicle || ""              // Puede venir null, ponemos ""
                });
            } catch (e) {
                console.error("Error leyendo sessionStorage", e);
            }
        }
    }, []);

    const update = useCallback((field: Partial<EditarGuiaPorcinoForm>) => {
        setForm((prev) => prev ? { ...prev, ...field } : null);
    }, []);

    const enviar = useCallback(async (lang: "es" | "ca") => {
        if (!form) return;

        const errorVal = validarEditarGuiaPorcino(form, lang);
        if (errorVal) {
            setErrorApi(errorVal);
            return;
        }

        const credentials = getCredentials();
        if (!credentials) {
            setErrorApi(lang === "ca" ? "Error de credencials" : "Error de credenciales");
            return;
        }

        setEnviando(true);
        setErrorApi(null);
        setExito(false);

        const body = {
            nif: credentials.nif,
            password: credentials.password,
            remo: form.remo,
            categoria: form.categoria,
            nombreAnimals: form.nombreAnimals,
            transportista: form.transportista.toUpperCase().trim(),
            responsable: form.responsable.toUpperCase().trim(),
            vehicle: form.vehicle.toUpperCase().trim(),
            dataSortida: datetimeLocalToApi(form.dataSortida),
            dataArribada: datetimeLocalToApi(form.dataArribada)
        };

        secureLog.group("[GTR] WSModificarGuiasMovilitat →");
        secureLog.request("WSModificarGuiasMovilitat", body as unknown as Record<string, unknown>);

        try {
            const response = await fetch(
                "/api/gtr/proxy?endpoint=WSMobilitat/AppJava/WSModificarGuiasMovilitat",
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                }
            );

            // Le decimos que "data" es un objeto que podría tener "codi" y "descripcio"
            let data: { codi?: string; descripcio?: string };
            try { data = await response.json(); } catch {
                setErrorApi(lang === "ca" ? "Error llegint la resposta" : "Error leyendo la respuesta");
                setEnviando(false);
                return;
            }

            secureLog.response(data);

            // Analizamos el código de respuesta (OK vs 002)
            if (data.codi === "OK") {
                if (form.transportista){
                    await guardarValorAutocomplete("transportista", form.transportista);
                }
                if (form.vehicle){
                    await guardarValorAutocomplete("matricula", form.vehicle);
                }
                if (form.responsable){
                    await guardarValorAutocomplete("nif_conductor", form.responsable);
                }
                setExito(true);
                sessionStorage.removeItem("guiaPorcinoSeleccionada");

                //  Borramos esta guía específica de la caché de la lista
                const cacheStr = sessionStorage.getItem("cacheListaGuiasPorcinos");
                if (cacheStr) {
                    try {
                        const cache = JSON.parse(cacheStr);
                        // Filtramos la lista para quedarnos con todas MENOS la que acabamos de emitir
                        // Le decimos que "g" es un objeto que, como mínimo, tiene la propiedad "remo" de tipo string
                        cache.lista = cache.lista.filter((g: { remo: string }) => g.remo !== form.remo);
                        sessionStorage.setItem("cacheListaGuiasPorcinos", JSON.stringify(cache));
                    } catch (e) {}
                }

                // GUARDAMOS EN EL HISTORIAL
                await guardarEnHistorial({
                    tipo: "EMISION_GUIA_PORCINO",
                    resumen: `${lang === "ca" ? "Emissió Guia" : "Emisión Guía"} — REMO: ${form.remo}`,
                    datos: { ...form, codigoSeguimiento: "OK" } as unknown as Record<string, unknown>,
                });

            } else {
                setErrorApi(data.descripcio || "Error desconegut");
            }

        } catch (err) {
            setErrorApi(lang === "ca" ? "Error de xarxa" : "Error de red");
        } finally {
            setEnviando(false);
            secureLog.groupEnd();
        }
    }, [form]);

    const cerrarExito = useCallback(() => setExito(false), []);
    const limpiarErrorApi = useCallback(() => setErrorApi(null), []);

    return {
        form, enviando, exito, errorApi,
        update, enviar, cerrarExito, limpiarErrorApi
    };
}