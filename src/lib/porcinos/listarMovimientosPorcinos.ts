import { getCredentials, getActiveCodiMO } from "@/lib/storage/credentials";
import { secureLog } from "@/lib/utils/secureLogger";

// ─── Tipos de la respuesta de Movimientos Porcinos ────────────────────────────
export interface MovimientoPorcino {
    moOrigen:         string;
    regaOrigen:       string;
    moDesti:          string;
    regaDesti:        string;
    codiRemo:         string;
    categoria:        string;
    nombreAnimals:    string | number;
    dataSortida:      string; // La API ya lo devuelve como "dd/MM/yyyy"
    dataArribada:     string; // La API ya lo devuelve como "dd/MM/yyyy"
    codiAtes?:        string;
    nomTransportista?: string;
    matricula?:       string;
    nifConductor?:    string;
}

// ─── Filtros del formulario ───────────────────────────────────────────────────
export interface ListarMovimientosFiltros {
    moDesti:     string;
    fechaDesde:  string; // "YYYY-MM-DD" desde el input HTML
    fechaFins:   string; // "YYYY-MM-DD" desde el input HTML
}

export const LISTAR_MOVIMIENTOS_FILTROS_INICIAL: ListarMovimientosFiltros = {
    moDesti:     "",
    fechaDesde:  "",
    fechaFins:   "",
};

// ─── Validación ───────────────────────────────────────────────────────────────
export function validarFiltrosMovimientos(filtros: ListarMovimientosFiltros, lang: "es" | "ca"): string | null {
    if (!filtros.moDesti.trim()) {
        return lang === "ca" ? "La Marca Oficial Destí és obligatòria." : "La Marca Oficial Destino es obligatoria.";
    }
    if (!filtros.fechaDesde.trim()) {
        return lang === "ca" ? "La data d'inici és obligatòria." : "La fecha de inicio es obligatoria.";
    }
    if (!filtros.fechaFins.trim()) {
        return lang === "ca" ? "La data de fi és obligatòria." : "La fecha de fin es obligatoria.";
    }

    // Validar coherencia de fechas
    if (new Date(filtros.fechaFins) < new Date(filtros.fechaDesde)) {
        return lang === "ca" ? "La data de fi no pot ser anterior a la d'inici." : "La fecha de fin no puede ser anterior a la de inicio.";
    }

    return null;
}

// ─── Helpers de formato ───────────────────────────────────────────────────────
// "YYYY-MM-DD" → "YYYYMMDDHHMM"
export function formatToApiRangeDate(isoDate: string, isEndOfDay: boolean): string {
    if (!isoDate) return "";
    const cleanDate = isoDate.replace(/-/g, ""); // "20200702"
    const time = isEndOfDay ? "2359" : "0000";
    return `${cleanDate}${time}`;
}

// ─── Consulta de movimientos ──────────────────────────────────────────────────
export interface ConsultarMovimientosResult {
    exito:  boolean;
    movimientos?: MovimientoPorcino[];
    error?: string;
}

const ENDPOINT = "WSConfirmacioMoviments/AppJava/WSObtenirMovimentPteConfirmar";

export async function consultarMovimientosPorcinos(filtros: ListarMovimientosFiltros): Promise<ConsultarMovimientosResult> {
    const credentials = getCredentials();
    if (!credentials) return { exito: false, error: "Credenciales no disponibles" };

    const dataSortidaDesde = formatToApiRangeDate(filtros.fechaDesde, false);
    const dataSortidaFins = formatToApiRangeDate(filtros.fechaFins, true);

    const params = new URLSearchParams({
        nif: credentials.nif,
        password: credentials.password,
        moDesti: filtros.moDesti.trim().toUpperCase(),
        dataSortidaDesde,
        dataSortidaFins,
    });

    secureLog.group("[GTR] WSObtenirMovimentPteConfirmar ←");
    secureLog.request("WSObtenirMovimentPteConfirmar", {
        moDesti: filtros.moDesti, dataSortidaDesde, dataSortidaFins
    });

    try {
        const response = await fetch(
            `/api/gtr/proxy?endpoint=${ENDPOINT}&${params.toString()}`,
            { method: "GET" }
        );

        const raw = await response.text();
        let data: {
            codi?: string;
            llistat?: MovimientoPorcino[];
            guiaSolicitudResponse?: Array<{ codi?: string; descripcio?: string }>;
        } | null = null;

        try {
            data = raw ? JSON.parse(raw) : null;
        } catch {
            return { exito: false, error: `Error ${response.status}: Resposta no processable` };
        }

        secureLog.response(data ?? {});
        secureLog.groupEnd();

        if (!response.ok) {
            return { exito: false, error: `Error de servidor: ${response.status}` };
        }

        if (!data) return { exito: false, error: "Resposta buida" };

        // Capturar errores específicos de esta API (guiaSolicitudResponse)
        if (data.guiaSolicitudResponse && Array.isArray(data.guiaSolicitudResponse) && data.guiaSolicitudResponse.length > 0) {
            return { exito: false, error: data.guiaSolicitudResponse[0].descripcio || "Error en la petició" };
        }

        // Éxito
        if (data.codi === "OK") {
            return { exito: true, movimientos: data.llistat || [] };
        }

        return { exito: false, error: "Format de resposta desconegut" };

    } catch (err) {
        secureLog.error("Error de red", err);
        secureLog.groupEnd();
        return { exito: false, error: "Error de connexió" };
    }
}