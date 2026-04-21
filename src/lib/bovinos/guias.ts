import { parseGtrResponse } from "@/lib/gtr/errorHandler";
import { getCredentials } from "@/lib/storage/credentials";
import { guardarEnHistorial } from "@/lib/storage/historial";
import { secureLog } from "@/lib/utils/secureLogger";
import type { GtrBaseResponse } from "@/lib/api/endpoints";

// ─── Tipos del formulario ─────────────────────────────────────────────────────
export interface GuiaForm {
    // Obligatorios
    explotacioOrigen:     string;
    explotacioDestinacio: string;
    temporal:             string;   // "SI" | "NO"
    temporalNombre:       string;
    dataSortida:          string;   // "YYYY-MM-DD"
    horaSortida:          string;   // "HH:mm"
    dataArribada:         string;
    horaArribada:         string;
    mobilitat:            string;   // "SI" | "NO"
    mobilitatNombre:      string;
    // Centro inspección
    esCentroInspeccion:   boolean;
    pais:                 string;
    codiExplotacio:       string;
    // Opcionales
    codiAtes:             string;
    nomTransportista:     string;
    mitjaTransport:       string;   // "04"|"05"|"06"|"07"|"08"|"99"
    mitjaTransportNombre: string;
    matricula:            string;
    nifConductor:         string;
    nomConductor:         string;
    identificadors:       string[];
}

export const GUIA_FORM_INICIAL: GuiaForm = {
    explotacioOrigen:     "",
    explotacioDestinacio: "",
    temporal:             "",
    temporalNombre:       "",
    dataSortida:          "",
    horaSortida:          "",
    dataArribada:         "",
    horaArribada:         "",
    mobilitat:            "",
    mobilitatNombre:      "",
    esCentroInspeccion:   false,
    pais:                 "",
    codiExplotacio:       "",
    codiAtes:             "",
    nomTransportista:     "",
    mitjaTransport:       "",
    mitjaTransportNombre: "",
    matricula:            "",
    nifConductor:         "",
    nomConductor:         "",
    identificadors:       [""],
};

// ─── Límites de longitud 9 en el NIF────────────────
export const GUIA_LIMITES = {
    EXPLOTACIO:        14,
    PAIS:              3,
    CODI_EXPLOTACIO:   20,
    CODI_ATES:         15,
    NOM_TRANSPORTISTA: 100,
    MATRICULA:         20,
    NIF_CONDUCTOR:     9,
    NOM_CONDUCTOR:     40,
} as const;

// ─── Valores de enumerados  ──────────────
export const GUIA_SI_NO = {
    SI: "SI",
    NO: "NO",
} as const;

export const MITJA_TRANSPORT_VALUES = ["04", "05", "06", "07", "08", "99"] as const;

// ─── Errores ──────────────────────────────────────────────────────────────────
export const GUIA_ERRORES = {
    EXPLOTACIO_ORIGEN:     20,
    EXPLOTACIO_DESTINACIO: 18,
    TEMPORAL:              21,
    DATA_SORTIDA:          22,
    HORA_SORTIDA:          23,
    DATA_ARRIBADA:         15,
    HORA_ARRIBADA:         16,
    MOBILITAT:             24,
} as const;

export interface GuiaValidationError {
    tipo:   "validacion";
    codigo: number;
}

interface GuiaApiError     { tipo: "api";  mensaje: string; }
interface GuiaNetworkError { tipo: "red"; }
export type GuiaError = GuiaApiError | GuiaNetworkError;

export interface EnviarGuiaResult {
    exito:  boolean;
    error?: GuiaError;
}

// ─── Validación ───────────────────────────────────────────────────────────────
export function validarGuia(form: GuiaForm): GuiaValidationError | null {
    if (!form.explotacioOrigen.trim())     return { tipo: "validacion", codigo: GUIA_ERRORES.EXPLOTACIO_ORIGEN };
    if (!form.explotacioDestinacio.trim()) return { tipo: "validacion", codigo: GUIA_ERRORES.EXPLOTACIO_DESTINACIO };
    if (!form.temporal)                    return { tipo: "validacion", codigo: GUIA_ERRORES.TEMPORAL };
    if (!form.dataSortida)                 return { tipo: "validacion", codigo: GUIA_ERRORES.DATA_SORTIDA };
    if (!form.horaSortida)                 return { tipo: "validacion", codigo: GUIA_ERRORES.HORA_SORTIDA };
    if (!form.dataArribada)                return { tipo: "validacion", codigo: GUIA_ERRORES.DATA_ARRIBADA };
    if (!form.horaArribada)                return { tipo: "validacion", codigo: GUIA_ERRORES.HORA_ARRIBADA };
    if (!form.mobilitat)                   return { tipo: "validacion", codigo: GUIA_ERRORES.MOBILITAT };
    return null;
}

// ─── Helpers de formato ───────────────────────────────────────────────────────
// "YYYY-MM-DD" + "HH:mm" → "yyyyMMddHHmm" (formato GTR 5.4.3, mida 12)
export function formatearFechaHoraAPI(fecha: string, hora: string): string {
    const fechaPlana = fecha.replace(/-/g, "");
    const horaPlana  = hora.replace(":", "");
    return `${fechaPlana}${horaPlana}`;
}

function limpiarIdentificadores(ids: string[]): string[] {
    return ids.map((id) => id.trim()).filter((id) => id.length > 0);
}

// ─── Construcción del body ────────────────────────────────────────────────────
function construirBody(form: GuiaForm, nif: string, password: string): Record<string, unknown> {
    const ids = limpiarIdentificadores(form.identificadors);

    const body: Record<string, unknown> = {
        nif,
        passwordMobilitat:    password,
        especie:              "01",                          // Boví
        explotacioOrigen:     form.explotacioOrigen.trim(),
        explotacioDestinacio: form.explotacioDestinacio.trim(),
        temporal:             form.temporal,                 // "SI" | "NO"
        dataSortida:          formatearFechaHoraAPI(form.dataSortida, form.horaSortida),
        dataArribada:         formatearFechaHoraAPI(form.dataArribada, form.horaArribada),
        mobilitat:            form.mobilitat,                // "SI" | "NO"
    };

    // Campos opcionales: omitir si están vacíos (GTR rechaza "")
    if (form.esCentroInspeccion) {
        if (form.pais.trim())           body.pais           = form.pais.trim();
        if (form.codiExplotacio.trim()) body.codiExplotacio = form.codiExplotacio.trim();
    }
    if (form.codiAtes.trim())         body.codiAtes         = form.codiAtes.trim();
    if (form.nomTransportista.trim()) body.nomTransportista = form.nomTransportista.trim();
    if (form.mitjaTransport)          body.mitjaTransport   = form.mitjaTransport;
    if (form.matricula.trim())        body.matricula        = form.matricula.trim();
    if (form.nifConductor.trim())     body.nifConductor     = form.nifConductor.trim();
    if (form.nomConductor.trim())     body.nomConductor     = form.nomConductor.trim();
    if (ids.length > 0)               body.identificadors   = ids;

    return body;
}

// ─── Envío al endpoint WSAltaGuia ─────────────────────────────────────────────
export async function enviarGuia(form: GuiaForm): Promise<EnviarGuiaResult> {
    const credentials = getCredentials();
    if (!credentials) return { exito: false, error: { tipo: "red" } };

    const body = construirBody(form, credentials.nif, credentials.password);

    secureLog.group("[GTR] WSAltaGuia →");
    secureLog.request("WSAltaGuia", body);

    try {
        const response = await fetch(
            "/api/gtr/proxy?endpoint=WSBoviGuies/AppJava/guies/WSAltaGuia",
            {
                method:  "PUT",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify(body),
            }
        );

        secureLog.status(response.status, response.statusText);

        let data: GtrBaseResponse;
        try {
            data = await response.json();
        } catch {
            secureLog.error("No se pudo parsear el body de la respuesta");
            secureLog.groupEnd();
            return { exito: false, error: { tipo: "red" } };
        }

        secureLog.response(data);
        secureLog.groupEnd();

        const errorMsg = parseGtrResponse(data);
        if (errorMsg) {
            return { exito: false, error: { tipo: "api", mensaje: errorMsg } };
        }

        await guardarEnHistorial({
            tipo:    "GUIA",
            resumen: `Guia — ${form.explotacioOrigen} → ${form.explotacioDestinacio}`,
            datos:   form as unknown as Record<string, unknown>,
        });

        return { exito: true };
    } catch (err) {
        secureLog.error("Error de red", err);
        secureLog.groupEnd();
        return { exito: false, error: { tipo: "red" } };
    }
}