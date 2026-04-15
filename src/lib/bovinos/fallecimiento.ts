import { apiPutFallecimiento, isGtrSuccess } from "@/lib/api/endpoints";
import { getCredentials } from "@/lib/storage/credentials";
import type { OpcionSelect } from "./constants";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface FallecimientoForm {
    idAnimal:           string;
    tipusMort:          string;   // "01" Muerte | "02" Aborto
    tipusNombre:        string;
    dataMort:           string;
    cadaverInaccesible: boolean;  // solo visible si tipusMort === "01"
    latitud:            string;   // solo si cadaverInaccesible
    longitud:           string;   // solo si cadaverInaccesible
    mesoGestacio:       string;   // solo si tipusMort === "02"
}

export const FALLECIMIENTO_FORM_INICIAL: FallecimientoForm = {
    idAnimal:           "",
    tipusMort:          "",
    tipusNombre:        "",
    dataMort:           "",
    cadaverInaccesible: false,
    latitud:            "",
    longitud:           "",
    mesoGestacio:       "",
};

// ─── Constantes ───────────────────────────────────────────────────────────────

export const TIPOS_MUERTE: OpcionSelect[] = [
    { codigo: "01", nombre: "Muerto" },
    { codigo: "02", nombre: "Aborto" },
];

export const TIPOS_MUERTE_CA: OpcionSelect[] = [
    { codigo: "01", nombre: "Mort" },
    { codigo: "02", nombre: "Avortament" },
];

// ─── Errores ──────────────────────────────────────────────────────────────────

export const FALLECIMIENTO_ERRORES = {
    ANIMAL_ID:   12,
    TIPO_MUERTE: 7,
    FECHA_MORT:  8,
    MESOS_GEST:  9,
    LATITUD:     10,
    LONGITUD:    11,
} as const;

export interface FallecimientoValidationError {
    tipo:   "validacion";
    codigo: number;
}

// ─── Validación ───────────────────────────────────────────────────────────────

export function validarFallecimiento(
    form: FallecimientoForm
): FallecimientoValidationError | null {
    if (!form.idAnimal.trim()) return { tipo: "validacion", codigo: FALLECIMIENTO_ERRORES.ANIMAL_ID };
    if (!form.tipusMort)       return { tipo: "validacion", codigo: FALLECIMIENTO_ERRORES.TIPO_MUERTE };
    if (!form.dataMort)        return { tipo: "validacion", codigo: FALLECIMIENTO_ERRORES.FECHA_MORT };

    // Solo si es Aborto
    if (form.tipusMort === "02") {
        if (!form.mesoGestacio.trim())
            return { tipo: "validacion", codigo: FALLECIMIENTO_ERRORES.MESOS_GEST };
    }

    // Solo si es Muerte + cadáver inaccesible
    if (form.tipusMort === "01" && form.cadaverInaccesible) {
        if (!form.latitud.trim())  return { tipo: "validacion", codigo: FALLECIMIENTO_ERRORES.LATITUD };
        if (!form.longitud.trim()) return { tipo: "validacion", codigo: FALLECIMIENTO_ERRORES.LONGITUD };
    }

    return null;
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
        tipus:              form.tipusMort,
        identificador:      form.idAnimal,
        dataMort:           formatearFechaAPI(form.dataMort),
        cadaverInaccesible: form.cadaverInaccesible ? "true" : "false",
    };

    // Solo si es Aborto
    if (form.tipusMort === "02" && form.mesoGestacio.trim()) {
        body.mesosGestacio = form.mesoGestacio.trim();
    }

    // Solo si cadáver inaccesible
    if (form.tipusMort === "01" && form.cadaverInaccesible) {
        if (form.latitud.trim())  body.coordenadaX = form.latitud.trim();
        if (form.longitud.trim()) body.coordenadaY = form.longitud.trim();
    }

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

export function formatearFechaAPI(fecha: string): string {
    return fecha.replace(/-/g, "");
}

export function formatearFechaDisplay(fecha: string): string {
    if (!fecha) return "";
    const [year, month, day] = fecha.split("-");
    return `${day}/${month}/${year}`;
}