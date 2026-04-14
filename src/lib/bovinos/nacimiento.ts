import type { GtrBaseResponse } from "@/lib/api/endpoints";
import { getCredentials } from "@/lib/storage/credentials";
import type { NacimientoForm } from "@/lib/bovinos/types";
import { guardarEnHistorial } from "@/lib/storage/historial";
import { parseGtrResponse, getNetworkError } from "@/lib/gtr/errorHandler";
import type { GtrLang } from "@/lib/gtr/types";

export const NACIMIENTO_ERRORES = {
    MADRE:     1,
    CRIA:      2,
    FECHA_NAC: 3,
    SEXO:      4,
    RAZA:      5,
    APTITUD:   6,
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
    if (!form.idMadre.trim())  return { tipo: "validacion", codigo: NACIMIENTO_ERRORES.MADRE };
    if (!form.idCria.trim())   return { tipo: "validacion", codigo: NACIMIENTO_ERRORES.CRIA };
    if (!form.fechaNacimiento) return { tipo: "validacion", codigo: NACIMIENTO_ERRORES.FECHA_NAC };
    if (!form.sexoCodigo)      return { tipo: "validacion", codigo: NACIMIENTO_ERRORES.SEXO };
    if (!form.razaCodigo)      return { tipo: "validacion", codigo: NACIMIENTO_ERRORES.RAZA };
    if (!form.aptitudCodigo)   return { tipo: "validacion", codigo: NACIMIENTO_ERRORES.APTITUD };
    return null;
}

function formatearFechaAPI(fecha: string): string {
    return fecha.replace(/-/g, "");
}

export function formatearFechaDisplay(fecha: string): string {
    if (!fecha) return "";
    const [year, month, day] = fecha.split("-");
    return `${day}/${month}/${year}`;
}

export function parsearFechaInput(fecha: string): string {
    if (!fecha) return "";
    const [day, month, year] = fecha.split("/");
    return `${year}-${month}-${day}`;
}

export async function enviarNacimiento(
    form: NacimientoForm,
    lang: GtrLang = "es"
): Promise<{ exito: boolean; error?: NacimientoApiError | NacimientoNetworkError }> {
    const credentials = getCredentials();
    if (!credentials) return { exito: false, error: { tipo: "red" } };

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

        // Parseo universal — muestra la descripcio del server tal cual
        const errorMsg = parseGtrResponse(data, lang);
        if (errorMsg) {
            return { exito: false, error: { tipo: "api", mensaje: errorMsg } };
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