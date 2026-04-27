import { getCredentials, getActiveCodiMO } from "@/lib/storage/credentials";
import { secureLog } from "@/lib/utils/secureLogger";

// ─── Tipos de la respuesta de Porcinos ────────────────────────────────────────
export interface GuiaPorcino {
    moOrigen:      string;
    remo:          string;
    moDesti:       string;
    categoria:     string;
    nombreAnimals: number;
    transportista: string | null;
    responsable:   string | null;
    vehicle:       string | null;
    dataSortida:   number | string;
    dataArribada:  number | string;
}

// ─── Filtros del formulario ───────────────────────────────────────────────────
export interface ListarGuiasPorcinosFiltros {
    codiRega:     string;
    fechaDisplay: string; // "dd/MM/yyyy HH:mm"
}

export const LISTAR_GUIAS_PORCINOS_FILTROS_INICIAL: ListarGuiasPorcinosFiltros = {
    codiRega:     "",
    fechaDisplay: "",
};

// ─── Validación ───────────────────────────────────────────────────────────────
export function validarFiltrosGuiasPorcinos(filtros: ListarGuiasPorcinosFiltros, lang: "es" | "ca"): string | null {
    if (!filtros.codiRega.trim()) {
        return lang === "ca" ? "El codi REGA és obligatori." : "El código REGA es obligatorio.";
    }
    if (!filtros.fechaDisplay.trim()) {
        return lang === "ca" ? "La data de sortida és obligatòria." : "La fecha de salida es obligatoria.";
    }
    return null;
}

// ─── Helpers de formato ───────────────────────────────────────────────────────
// "dd/MM/yyyy HH:mm" → "yyyyMMddHHmm"
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

// Admite string o number porque la API de porcinos devuelve "202507292200" como número
export function apiFormatToDisplayFecha(apiDate?: string | number): string {
    if (!apiDate) return "";
    const strDate = String(apiDate);
    if (strDate.length < 8) return "";
    const year  = strDate.substring(0, 4);
    const month = strDate.substring(4, 6);
    const day   = strDate.substring(6, 8);
    return `${day}/${month}/${year}`;
}

export function apiFormatToDisplayHora(apiDate?: string | number): string {
    if (!apiDate) return "";
    const strDate = String(apiDate);
    if (strDate.length < 12) return "";
    const hh = strDate.substring(8, 10);
    const mm = strDate.substring(10, 12);
    return `${hh}:${mm}`;
}

// ─── Consulta de guías ────────────────────────────────────────────────────────
export interface ConsultarGuiasPorcinosResult {
    exito:  boolean;
    guias?: GuiaPorcino[];
    error?: string;
}

const ENDPOINT = "WSMobilitat/AppJava/WSCarregaGuiesMobilitat";

export async function consultarGuiasPorcinos(filtros: ListarGuiasPorcinosFiltros): Promise<ConsultarGuiasPorcinosResult> {
    const credentials = getCredentials();
    if (!credentials) return { exito: false, error: "Credenciales no disponibles" };

    const codiMo = getActiveCodiMO();
    const dataSortida = displayToApiFormat(filtros.fechaDisplay);

    const params = new URLSearchParams({
        nif: credentials.nif,
        password: credentials.password, // Nota: Porcinos usa 'password', no 'passwordMobilitat'
        codiMo: codiMo || "",
        codiRega: filtros.codiRega.trim().toUpperCase(),
        dataSortida,
    });

    secureLog.group("[GTR] WSCarregaGuiesMobilitat ←");
    secureLog.request("WSCarregaGuiesMobilitat", { codiMo, codiRega: filtros.codiRega, dataSortida });

    try {
        const response = await fetch(
            `/api/gtr/proxy?endpoint=${ENDPOINT}&${params.toString()}`,
            { method: "GET" }
        );

        const raw = await response.text();
        let data: any = null;

        try {
            data = raw ? JSON.parse(raw) : null;
        } catch {
            return { exito: false, error: `Error ${response.status}: Respuesta no procesable` };
        }

        secureLog.response(data ?? {});
        secureLog.groupEnd();

        if (!response.ok) {
            return { exito: false, error: `Error de servidor: ${response.status}` };
        }

        // Parchear la respuesta de la API de Porcinos (Array directo)
        if (Array.isArray(data)) {
            // Verificar si la primera posición es en realidad un error encubierto
            if (data.length > 0 && data[0].codi && data[0].descripcio) {
                return { exito: false, error: data[0].descripcio };
            }
            // Si no es un error, es nuestra lista de guías
            return { exito: true, guias: data as GuiaPorcino[] };
        }

        return { exito: false, error: "Format de resposta desconegut" };

    } catch (err) {
        secureLog.error("Error de red", err);
        secureLog.groupEnd();
        return { exito: false, error: "Error de connexió" };
    }
}