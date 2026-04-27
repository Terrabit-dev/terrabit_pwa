import { parseGtrResponse } from "@/lib/gtr/errorHandler";
import { getCredentials } from "@/lib/storage/credentials";
import { guardarEnHistorial } from "@/lib/storage/historial";
import { secureLog } from "@/lib/utils/secureLogger";
import type { GtrBaseResponse } from "@/lib/api/endpoints";
import type { Guia } from "@/lib/bovinos/listarGuias";
import {
    getTransportes,
    type OpcionDisplay,
    type Lang,
} from "@/lib/bovinos/confirmarMovimiento";

// ─── Re-exportamos para que el page solo importe de aquí ──────────────────────
export type { OpcionDisplay, Lang };
export { getTransportes };

// ─── Tipos del formulario ─────────────────────────────────────────────────────
export interface ConfirmarGuiaForm {
    // Solo lectura (cabecera)
    explotacioOrigen:     string;
    explotacioDestinacio: string;
    remo:                 string;
    numeroAnimals:        number;
    // Editables
    dataSortida:          string;   // "YYYY-MM-DD"
    horaSortida:          string;   // "HH:mm"
    dataArribada:         string;   // "YYYY-MM-DD"
    horaArribada:         string;   // "HH:mm"
    codiAtes:             string;
    nomTransportista:     string;
    mitjaTransport:       string;
    mitjaTransportNombre: string;
    matricula:            string;
    nifConductor:         string;
    nomConductor:         string;
    identificadors:       string[];
}

export const CONFIRMAR_GUIA_FORM_INICIAL: ConfirmarGuiaForm = {
    explotacioOrigen:     "",
    explotacioDestinacio: "",
    remo:                 "",
    numeroAnimals:        0,
    dataSortida:          "",
    horaSortida:          "",
    dataArribada:         "",
    horaArribada:         "",
    codiAtes:             "",
    nomTransportista:     "",
    mitjaTransport:       "",
    mitjaTransportNombre: "",
    matricula:            "",
    nifConductor:         "",
    nomConductor:         "",
    identificadors:       [""],
};

// ─── Límites (verificados contra servidor real, igual que alta_guia) ──────────
export const CONFIRMAR_GUIA_LIMITES = {
    CODI_ATES:         15,
    NOM_TRANSPORTISTA: 100,
    MATRICULA:         20,
    NIF_CONDUCTOR:     9,
    NOM_CONDUCTOR:     40,
    IDENTIFICADOR:     20,
} as const;

// ─── Errores ──────────────────────────────────────────────────────────────────
export const CONFIRMAR_GUIA_ERRORES = {
    DATA_SORTIDA:  22,
    HORA_SORTIDA:  23,
    DATA_ARRIBADA: 15,
    HORA_ARRIBADA: 16,
    SIN_IDS:       12,
} as const;

export interface ConfirmarGuiaValidationError {
    tipo:   "validacion";
    codigo: number;
}

interface ConfirmarGuiaApiError     { tipo: "api"; mensaje: string; }
interface ConfirmarGuiaNetworkError { tipo: "red"; }
export type ConfirmarGuiaError = ConfirmarGuiaApiError | ConfirmarGuiaNetworkError;

export interface EnviarConfirmarGuiaResult {
    exito:  boolean;
    error?: ConfirmarGuiaError;
}

// ─── Validación ───────────────────────────────────────────────────────────────
export function validarConfirmarGuia(form: ConfirmarGuiaForm): ConfirmarGuiaValidationError | null {
    if (!form.dataSortida)  return { tipo: "validacion", codigo: CONFIRMAR_GUIA_ERRORES.DATA_SORTIDA };
    if (!form.horaSortida)  return { tipo: "validacion", codigo: CONFIRMAR_GUIA_ERRORES.HORA_SORTIDA };
    if (!form.dataArribada) return { tipo: "validacion", codigo: CONFIRMAR_GUIA_ERRORES.DATA_ARRIBADA };
    if (!form.horaArribada) return { tipo: "validacion", codigo: CONFIRMAR_GUIA_ERRORES.HORA_ARRIBADA };
    const idsValidos = form.identificadors.filter((id) => id.trim().length > 0);
    if (idsValidos.length === 0) return { tipo: "validacion", codigo: CONFIRMAR_GUIA_ERRORES.SIN_IDS };
    return null;
}

// ─── Helpers de formato ───────────────────────────────────────────────────────
// "YYYY-MM-DD" + "HH:mm" → "yyyyMMddHHmm"
export function formatearFechaHoraAPI(fecha: string, hora: string): string {
    return `${fecha.replace(/-/g, "")}${hora.replace(":", "")}`;
}

// "yyyyMMddHHmm" → { fecha: "YYYY-MM-DD", hora: "HH:mm" }
// "yyyyMMddHHmm" → { fecha: "YYYY-MM-DD", hora: "HH:mm" }
// "dd/MM/yyyy HH:mm" → { fecha: "YYYY-MM-DD", hora: "HH:mm" }
export function parsearFechaHoraAPI(raw: string): { fecha: string; hora: string } {
    if (!raw) return { fecha: "", hora: "" };

    // Formato "dd/MM/yyyy HH:mm"
    if (raw.includes("/")) {
        const [fechaPart, horaPart = ""] = raw.trim().split(" ");
        const [dia, mes, anio] = fechaPart.split("/");
        return {
            fecha: `${anio}-${mes}-${dia}`,
            hora:  horaPart,
        };
    }

    // Formato "yyyyMMddHHmm" (12 chars, historial)
    if (raw.length >= 12) {
        return {
            fecha: `${raw.substring(0, 4)}-${raw.substring(4, 6)}-${raw.substring(6, 8)}`,
            hora:  `${raw.substring(8, 10)}:${raw.substring(10, 12)}`,
        };
    }

    return { fecha: "", hora: "" };
}

// ─── Precarga desde la guía seleccionada ──────────────────────────────────────
export function precargarDesdeGuia(guia: Guia): ConfirmarGuiaForm {
    const sortida  = parsearFechaHoraAPI(guia.dataSortida);
    const arribada = parsearFechaHoraAPI(guia.dataArribada);

    return {
        ...CONFIRMAR_GUIA_FORM_INICIAL,
        explotacioOrigen:     guia.explotacioOrigen,
        explotacioDestinacio: guia.explotacioDestinacio,
        remo:                 guia.remo,
        numeroAnimals:        guia.numeroAnimals,
        dataSortida:          sortida.fecha,
        horaSortida:          sortida.hora,
        dataArribada:         arribada.fecha,
        horaArribada:         arribada.hora,
        nomTransportista:     guia.codiTransportista ?? "",
        matricula:            guia.matricula         ?? "",
        nifConductor:         guia.nifConductor      ?? "",
        identificadors:       guia.identificadors.length > 0
            ? [...guia.identificadors]
            : [""],
    };
}

// Construccion Body Request
function construirBody(
    form: ConfirmarGuiaForm,
    nif: string,
    password: string
): Record<string, unknown> {
    const ids = form.identificadors
        .map((id) => id.trim())
        .filter((id) => id.length > 0);

    return {
        nif,
        passwordMobilitat: password,
        especie:           "01",
        codiRemo:          form.remo,
        dataSortida:       formatearFechaHoraAPI(form.dataSortida, form.horaSortida),
        dataArribada:      formatearFechaHoraAPI(form.dataArribada, form.horaArribada),
        identificadors:    ids,
        codiAtes:          form.codiAtes.trim(),
        nomTransportista:  form.nomTransportista.trim(),
        mitjaTransport:    form.mitjaTransport,
        matricula:         form.matricula.trim(),
        nifConductor:      form.nifConductor.trim(),
        nomConductor:      form.nomConductor.trim(),
    };
}
// ─── Envío al endpoint WSModificarGuiaMobilitat ───────────────────────────────
const ENDPOINT = "WSBoviGuies/AppJava/guies/WSModificarGuiaMobilitat";

export async function enviarConfirmarGuia(
    form: ConfirmarGuiaForm
): Promise<EnviarConfirmarGuiaResult> {
    const credentials = getCredentials();
    if (!credentials) return { exito: false, error: { tipo: "red" } };

    const body = construirBody(form, credentials.nif, credentials.password);

    secureLog.group("[GTR] WSModificarGuiaMobilitat →");
    secureLog.request("WSModificarGuiaMobilitat", body);

    try {
        const response = await fetch(
            `/api/gtr/proxy?endpoint=${ENDPOINT}`,
            {
                method:  "PUT",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify(body),
            }
        );

        secureLog.status(response.status, response.statusText);

        let data: GtrBaseResponse = {};
        if (response.headers.get("content-type")?.includes("application/json")) {
            try {
                data = await response.json() as GtrBaseResponse;
            } catch {
                secureLog.error("No se pudo parsear el body");
                secureLog.groupEnd();
                return { exito: false, error: { tipo: "red" } };
            }
        }

        secureLog.response(data);
        secureLog.groupEnd();

        const errorMsg = parseGtrResponse(data);
        if (errorMsg) {
            return { exito: false, error: { tipo: "api", mensaje: errorMsg } };
        }

        await guardarEnHistorial({
            tipo:    "CONFIRMAR_GUIA",
            resumen: `Guia modificada — ${form.remo} (${form.explotacioOrigen} → ${form.explotacioDestinacio})`,
            datos:   form as unknown as Record<string, unknown>,
        });

        return { exito: true };
    } catch (err) {
        secureLog.error("Error de red", err);
        secureLog.groupEnd();
        return { exito: false, error: { tipo: "red" } };
    }
}