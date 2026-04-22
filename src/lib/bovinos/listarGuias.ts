import { getCredentials } from "@/lib/storage/credentials";
import { getActiveCodiMO } from "@/lib/storage/credentials";
import { secureLog } from "@/lib/utils/secureLogger";

// ─── Tipos de la respuesta GTR ────────────────────────────────────────────────
export interface Guia {
    codiTransportista:    string;
    dataArribada:         string;   // "yyyymmddHHmm" tal cual del servidor
    dataSortida:          string;
    explotacioDestinacio: string;
    explotacioOrigen:     string;
    identificadors:       string[];
    matricula:            string;
    nifConductor:         string;
    numeroAnimals:        number;
    remo:                 string;
}

interface GuiesResponse {
    guies?:      Guia[];
    errors?:     Array<{ codi?: string; descripcio: string }>;
    codi?:       string;
    descripcio?: string;
}

// ─── Filtros del formulario ───────────────────────────────────────────────────
export interface ListarGuiasFiltros {
    codiRega:     string;
    fechaDisplay: string;   // "dd/MM/yyyy HH:mm" como el Android
}

export const LISTAR_GUIAS_FILTROS_INICIAL: ListarGuiasFiltros = {
    codiRega:     "",
    fechaDisplay: "",
};

// ─── Validación ───────────────────────────────────────────────────────────────
export function validarFiltrosGuias(filtros: ListarGuiasFiltros, lang: "es" | "ca"): string | null {
    if (!filtros.codiRega.trim()) {
        return lang === "ca"
            ? "El codi REGA és obligatori."
            : "El código REGA es obligatorio.";
    }
    if (!filtros.fechaDisplay.trim()) {
        return lang === "ca"
            ? "La data de sortida és obligatòria."
            : "La fecha de salida es obligatoria.";
    }
    return null;
}

// ─── Helpers de formato ───────────────────────────────────────────────────────
// "dd/MM/yyyy HH:mm" → "yyyyMMddHHmm" (formato GTR)
export function displayToApiFormat(display: string): string {
    try {
        const [fecha, hora] = display.trim().split(" ");
        const [dia, mes, anio] = fecha.split("/");
        const [h, m] = hora.split(":");
        return `${anio}${mes}${dia}${h}${m}`;
    } catch {
        return "";
    }
}

// "yyyymmddHHmm" → "dd/MM/yyyy HH:mm" (display)
export function apiFormatToDisplay(apiDate: string): string {
    if (apiDate.length < 12) return "";
    const year  = apiDate.substring(0, 4);
    const month = apiDate.substring(4, 6);
    const day   = apiDate.substring(6, 8);
    const hh    = apiDate.substring(8, 10);
    const mm    = apiDate.substring(10, 12);
    return `${day}/${month}/${year} ${hh}:${mm}`;
}

// "yyyymmddHHmm" → "dd/MM/yyyy" (sin hora, para cards)
export function apiFormatToDisplayFecha(apiDate: string): string {
    if (apiDate.length < 8) return "";
    const year  = apiDate.substring(0, 4);
    const month = apiDate.substring(4, 6);
    const day   = apiDate.substring(6, 8);
    return `${day}/${month}/${year}`;
}

// Extrae el mensaje de error de un body GTR (JSON string) con fallback a código HTTP.
export function extraerDescripcion(rawJson: string, httpCode: number): string {
    if (!rawJson.trim()) return `Error ${httpCode}`;
    try {
        const parsed = JSON.parse(rawJson);

        // Caso array de errores sueltos
        if (Array.isArray(parsed)) {
            const msgs = parsed
                .map((e: { descripcio?: string }) => e?.descripcio)
                .filter((d): d is string => !!d && d.trim().length > 0);
            return msgs.length > 0 ? msgs.join("\n") : `Error ${httpCode}`;
        }

        // Caso objeto con "errors" o "descripcio"
        if (parsed && typeof parsed === "object") {
            const errors = (parsed as { errors?: Array<{ descripcio?: string }> }).errors;
            if (Array.isArray(errors)) {
                const msgs = errors
                    .map((e) => e?.descripcio)
                    .filter((d): d is string => !!d && d.trim().length > 0);
                if (msgs.length > 0) return msgs.join("\n");
            }
            const descripcio = (parsed as { descripcio?: string }).descripcio;
            if (descripcio && descripcio.trim().length > 0) return descripcio;
        }

        return `Error ${httpCode}`;
    } catch {
        return `Error ${httpCode}`;
    }
}

// ─── Consulta de guías ────────────────────────────────────────────────────────
export interface ConsultarGuiasResult {
    exito:  boolean;
    guias?: Guia[];
    error?: string;   // mensaje ya listo para mostrar
}

const ENDPOINT = "WSBoviGuies/AppJava/guies/WSGuiaMobilitat";

export async function consultarGuias(filtros: ListarGuiasFiltros): Promise<ConsultarGuiasResult> {
    const credentials = getCredentials();
    if (!credentials) {
        return { exito: false, error: "Credenciales no disponibles" };
    }
    const codiMo = getActiveCodiMO();

    const dataSortida = displayToApiFormat(filtros.fechaDisplay);

    const params = new URLSearchParams({
        nif:               credentials.nif,
        passwordMobilitat: credentials.password,
        codiMo,
        codiRega:          filtros.codiRega.trim(),
        dataSortida,
    });

    secureLog.group("[GTR] WSGuiaMobilitat ←");
    secureLog.request("WSGuiaMobilitat", { codiMo, codiRega: filtros.codiRega, dataSortida });

    try {
        const response = await fetch(
            `/api/gtr/proxy?endpoint=${ENDPOINT}&${params.toString()}`,
            { method: "GET" }
        );
        secureLog.status(response.status, response.statusText);

        const raw = await response.text();

        let data: GuiesResponse | null = null;
        try {
            data = raw ? (JSON.parse(raw) as GuiesResponse) : null;
        } catch {
            secureLog.error("Body no es JSON válido", raw);
            secureLog.groupEnd();
            return { exito: false, error: extraerDescripcion(raw, response.status) };
        }

        secureLog.response(data ?? {});
        secureLog.groupEnd();

        // Error: status no OK, o body con errors/descripcio negativo
        if (!response.ok || (data?.errors && data.errors.length > 0)) {
            return { exito: false, error: extraerDescripcion(raw, response.status) };
        }

        return { exito: true, guias: data?.guies ?? [] };
    } catch (err) {
        secureLog.error("Error de red", err);
        secureLog.groupEnd();
        const msg = err instanceof Error ? err.message : "Error desconocido";
        return { exito: false, error: `Error de conexión: ${msg}` };
    }
}