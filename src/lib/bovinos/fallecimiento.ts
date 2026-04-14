import { apiPutFallecimiento } from "@/lib/api/endpoints";
import { isGtrSuccess } from "@/lib/api/endpoints";
import { getCredentials } from "@/lib/storage/credentials";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface FallecimientoForm {
    tipus: string;         // "01" | "02"
    tipusNombre: string;
    identificador: string;
    dataMort: string;      // "yyyy-mm-dd"
    cadaverInaccesible: boolean;
    mesosGestacio: string; // solo obligatorio si tipus === "02"
    coordenadaX: string;
    coordenadaY: string;
}

export const FALLECIMIENTO_FORM_INICIAL: FallecimientoForm = {
    tipus: "",
    tipusNombre: "",
    identificador: "",
    dataMort: "",
    cadaverInaccesible: false,
    mesosGestacio: "",
    coordenadaX: "",
    coordenadaY: "",
};

// ─── Constantes ───────────────────────────────────────────────────────────────

export const TIPOS_MUERTE = [
    { codigo: "01", nombre: "Muerto" },
    { codigo: "02", nombre: "Aborto" },
];

export const TIPOS_MUERTE_CA = [
    { codigo: "01", nombre: "Mort" },
    { codigo: "02", nombre: "Avortament" },
];

// ─── Validación ───────────────────────────────────────────────────────────────

export type FallecimientoErrorCodigo =
    | "TIPO_REQUERIDO"
    | "IDENTIFICADOR_REQUERIDO"
    | "FECHA_REQUERIDA"
    | "MESES_GESTACION_REQUERIDOS";

export function validarFallecimiento(
    form: FallecimientoForm
): { codigo: FallecimientoErrorCodigo } | null {
    if (!form.tipus)          return { codigo: "TIPO_REQUERIDO" };
    if (!form.identificador)  return { codigo: "IDENTIFICADOR_REQUERIDO" };
    if (!form.dataMort)       return { codigo: "FECHA_REQUERIDA" };
    if (form.tipus === "02" && !form.mesosGestacio.trim()) {
        return { codigo: "MESES_GESTACION_REQUERIDOS" };
    }
    return null;
}

export function getFallecimientoErrorMessage(
    codigo: FallecimientoErrorCodigo,
    lang: string
): string {
    const es: Record<FallecimientoErrorCodigo, string> = {
        TIPO_REQUERIDO:             "Debes seleccionar el tipo de muerte.",
        IDENTIFICADOR_REQUERIDO:    "El identificador es obligatorio.",
        FECHA_REQUERIDA:            "La fecha de muerte es obligatoria.",
        MESES_GESTACION_REQUERIDOS: "Los meses de gestación son obligatorios para un aborto.",
    };
    const ca: Record<FallecimientoErrorCodigo, string> = {
        TIPO_REQUERIDO:             "Has de seleccionar el tipus de mort.",
        IDENTIFICADOR_REQUERIDO:    "L'identificador és obligatori.",
        FECHA_REQUERIDA:            "La data de mort és obligatòria.",
        MESES_GESTACION_REQUERIDOS: "Els mesos de gestació són obligatoris per a un avortament.",
    };
    return (lang === "ca" ? ca : es)[codigo];
}

// ─── Envío ────────────────────────────────────────────────────────────────────

interface EnviarFallecimientoResult {
    exito: boolean;
    error?: { tipo: "api" | "red"; mensaje: string };
}

export async function enviarFallecimiento(
    form: FallecimientoForm
): Promise<EnviarFallecimientoResult> {
    const creds = getCredentials();
    if (!creds) return { exito: false, error: { tipo: "red", mensaje: "Sin credenciales" } };

    const body: Record<string, unknown> = {
        nif:                creds.nif,
        passwordMobilitat:  creds.password,
        tipus:              form.tipus,
        identificador:      form.identificador,
        dataMort:           form.dataMort,
        cadaverInaccesible: form.cadaverInaccesible ? "true" : "false",
    };

    if (form.tipus === "02" && form.mesosGestacio.trim()) {
        body.mesosGestacio = form.mesosGestacio.trim();
    }
    if (form.coordenadaX.trim()) body.coordenadaX = form.coordenadaX.trim();
    if (form.coordenadaY.trim()) body.coordenadaY = form.coordenadaY.trim();

    try {
        const res = await apiPutFallecimiento(body);
        if (!isGtrSuccess(res)) {
            const msg = res.errors?.[0]?.descripcio ?? res.descripcio ?? "Error desconocido";
            return { exito: false, error: { tipo: "api", mensaje: msg } };
        }
        return { exito: true };
    } catch (e) {
        return {
            exito: false,
            error: { tipo: "red", mensaje: e instanceof Error ? e.message : "Error de red" },
        };
    }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function formatearFechaDisplay(isoDate: string): string {
    if (!isoDate) return "";
    const [y, m, d] = isoDate.split("-");
    return `${d}/${m}/${y}`;
}
