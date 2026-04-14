import type { NacimientoForm, GtrBaseResponse } from "./types";
import { getCredentials } from "@/lib/storage/credentials";
import { guardarEnHistorial } from "@/lib/storage/historial";

// Códigos de error de validación — equivalente a los códigos en alertsErrosScreens
export const NACIMIENTO_ERRORES = {
    MADRE:       1,
    CRIA:        2,
    FECHA_NAC:   3,
    SEXO:        4,
    RAZA:        5,
    APTITUD:     6,
};

export interface NacimientoValidationError {
    tipo: "validacion";
    codigo: number;
}

export interface NacimientoApiError {
    tipo: "api";
    mensaje: string;
}

export interface NacimientoNetworkError {
    tipo: "red";
}

export type NacimientoError =
    | NacimientoValidationError
    | NacimientoApiError
    | NacimientoNetworkError;

export function validarNacimiento(form: NacimientoForm): NacimientoValidationError | null {
    if (!form.idMadre.trim())   return { tipo: "validacion", codigo: NACIMIENTO_ERRORES.MADRE };
    if (!form.idCria.trim())    return { tipo: "validacion", codigo: NACIMIENTO_ERRORES.CRIA };
    if (!form.fechaNacimiento)  return { tipo: "validacion", codigo: NACIMIENTO_ERRORES.FECHA_NAC };
    if (!form.sexoCodigo)       return { tipo: "validacion", codigo: NACIMIENTO_ERRORES.SEXO };
    if (!form.razaCodigo)       return { tipo: "validacion", codigo: NACIMIENTO_ERRORES.RAZA };
    if (!form.aptitudCodigo)    return { tipo: "validacion", codigo: NACIMIENTO_ERRORES.APTITUD };
    return null;
}

// "2024-03-15" → "20240315"
function formatearFechaAPI(fecha: string): string {
    return fecha.replace(/-/g, "");
}

// "2024-03-15" → "15/03/2024"
export function formatearFechaDisplay(fecha: string): string {
    if (!fecha) return "";
    const [year, month, day] = fecha.split("-");
    return `${day}/${month}/${year}`;
}

// "15/03/2024" → "2024-03-15" (para el input date)
export function parsearFechaInput(fecha: string): string {
    if (!fecha) return "";
    const [day, month, year] = fecha.split("/");
    return `${year}-${month}-${day}`;
}

export async function enviarNacimiento(
    form: NacimientoForm
): Promise<{ exito: boolean; error?: NacimientoApiError | NacimientoNetworkError }> {
    const credentials = getCredentials();
    if (!credentials) return { exito: false, error: { tipo: "red" } };

    const body = {
        nif:               credentials.nif,
        passwordMobilitat: credentials.password,
        identificador:     form.idCria,
        identificadorMare: form.idMadre,
        dataNaixement:     formatearFechaAPI(form.fechaNacimiento),
        dataIdentificacio: form.fechaIdentificacion
            ? formatearFechaAPI(form.fechaIdentificacion)
            : "",
        sexe:    form.sexoCodigo,
        raca:    form.razaCodigo,
        aptitud: form.aptitudCodigo,
    };

    try {
        const response = await fetch(
            "/api/gtr/proxy?endpoint=WSBovi/AppJava/Bovi/WSEnregistramentNaixement/",
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            }
        );

        if (!response.ok) return { exito: false, error: { tipo: "red" } };

        const data: GtrBaseResponse = await response.json();

        if (data.errors && data.errors.length > 0) {
            return {
                exito: false,
                error: { tipo: "api", mensaje: data.errors[0].descripcio },
            };
        }

        const esExito =
            data.codi === "0" ||
            data.descripcio === "OK" ||
            data.descripcio === "correcte";

        if (!esExito) {
            return {
                exito: false,
                error: { tipo: "api", mensaje: data.descripcio ?? "Error desconocido" },
            };
        }

        await guardarEnHistorial({
            tipo:    "NACIMIENTO",
            resumen: `Naixement registrat — ${form.idCria}`,
            datos:   form as unknown as Record<string, unknown>,
        });

        return { exito: true };
    } catch {
        return { exito: false, error: { tipo: "red" } };
    }
}