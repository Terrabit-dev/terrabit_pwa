import type { NacimientoForm, GtrBaseResponse } from "./types";
import { getCredentials } from "@/lib/storage/credentials";
import { guardarEnHistorial } from "@/lib/storage/historial";

export function validarNacimiento(form: NacimientoForm): string | null {
    if (!form.idCria.trim())    return "El identificador de la cría es obligatorio";
    if (!form.idMadre.trim())   return "El identificador de la madre es obligatorio";
    if (!form.fechaNacimiento)  return "La fecha de nacimiento es obligatoria";
    if (!form.sexoCodigo)       return "El sexo es obligatorio";
    if (!form.razaCodigo)       return "La raza es obligatoria";
    if (!form.aptitudCodigo)    return "La aptitud es obligatoria";
    return null;
}

// Convierte "2024-03-15" → "20240315"
function formatearFechaAPI(fecha: string): string {
    return fecha.replace(/-/g, "");
}

export async function enviarNacimiento(form: NacimientoForm): Promise<GtrBaseResponse> {
    const credentials = getCredentials();
    if (!credentials) throw new Error("Sin credenciales");

    const body = {
        nif:                credentials.nif,
        passwordMobilitat:  credentials.password,
        identificador:      form.idCria,
        identificadorMare:  form.idMadre,
        dataNaixement:      formatearFechaAPI(form.fechaNacimiento),
        dataIdentificacio:  form.fechaIdentificacion
            ? formatearFechaAPI(form.fechaIdentificacion)
            : "",
        sexe:    form.sexoCodigo,
        raca:    form.razaCodigo,
        aptitud: form.aptitudCodigo,
    };

    const response = await fetch(
        "/api/gtr/proxy?endpoint=WSBovi/AppJava/Bovi/WSEnregistramentNaixement/",
        {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        }
    );

    if (!response.ok) throw new Error("network");

    const data: GtrBaseResponse = await response.json();

    // Éxito si no hay errores o codi es "0" / descripcio es "OK"
    const esExito =
        (!data.errors || data.errors.length === 0) &&
        (data.codi === "0" || data.descripcio === "OK" || data.descripcio === "correcte");

    if (esExito) {
        await guardarEnHistorial({
            tipo:    "NACIMIENTO",
            resumen: `Naixement registrat — ${form.idCria}`,
            datos:   form as unknown as Record<string, unknown>,
        });
    }

    return data;
}