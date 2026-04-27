import { getCredentials } from "@/lib/storage/credentials";
import { secureLog } from "@/lib/utils/secureLogger";
import {
    extraerDescripcion,
    displayToApiFormat,
} from "@/lib/bovinos/listarGuias";
import type { MovimentoPendiente } from "@/lib/bovinos/confirmarMovimiento";

// ─── Tipo de la respuesta del servidor ────────────────────────────────────────
// El endpoint devuelve `{ moviments: Moviment[] }`. El "Moviment" del backend
// se representa en la PWA como `MovimentoPendiente` (en confirmarMovimiento.ts)
// — re-exportamos para que ambas pantallas hablen del mismo objeto.
export type Moviment = MovimentoPendiente;
export type { MovimentoPendiente };

interface MovimentsResponse {
    moviments?:  MovimentoPendiente[];
    errors?:     Array<{ codi?: string; descripcio: string }>;
    codi?:       string;
    descripcio?: string;
}

// ─── Filtros del formulario ───────────────────────────────────────────────────
export interface ListarMovimientosFiltros {
    explotacioDestinacio: string;
    fechaDisplay:         string;   // "dd/MM/yyyy HH:mm"
}

export const LISTAR_MOVS_FILTROS_INICIAL: ListarMovimientosFiltros = {
    explotacioDestinacio: "",
    fechaDisplay:         "",
};

// ─── Validación ───────────────────────────────────────────────────────────────
export function validarFiltrosMovimientos(
    filtros: ListarMovimientosFiltros,
    lang: "es" | "ca"
): string | null {
    if (!filtros.explotacioDestinacio.trim()) {
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

// Re-exportamos los helpers de formato para que el page solo importe de aquí
export {
    displayToApiFormat,
    apiFormatToDisplay,
    apiFormatToDisplayFecha,
} from "@/lib/bovinos/listarGuias";

// ─── Consulta ─────────────────────────────────────────────────────────────────
export interface ConsultarMovimientosResult {
    exito:        boolean;
    movimientos?: Moviment[];
    error?:       string;
}

const ENDPOINT = "WSBoviGuies/AppJava/movs/WSConsultaConfirmacioMoviment";

export async function consultarMovimientosPendientes(
    filtros: ListarMovimientosFiltros
): Promise<ConsultarMovimientosResult> {
    const credentials = getCredentials();
    if (!credentials) {
        return { exito: false, error: "Credenciales no disponibles" };
    }

    const dataSortida = displayToApiFormat(filtros.fechaDisplay);

    const params = new URLSearchParams({
        nif:                  credentials.nif,
        passwordMobilitat:    credentials.password,
        explotacioDestinacio: filtros.explotacioDestinacio.trim(),
        dataSortida,
    });

    secureLog.group("[GTR] WSConsultaConfirmacioMoviment ←");
    secureLog.request("WSConsultaConfirmacioMoviment", {
        explotacioDestinacio: filtros.explotacioDestinacio,
        dataSortida,
    });

    try {
        const response = await fetch(
            `/api/gtr/proxy?endpoint=${ENDPOINT}&${params.toString()}`,
            { method: "GET" }
        );
        secureLog.status(response.status, response.statusText);

        const raw = await response.text();

        let data: MovimentsResponse = {};
        if (raw) {
            try {
                data = JSON.parse(raw) as MovimentsResponse;
            } catch {
                secureLog.error("Body no es JSON válido", raw);
                secureLog.groupEnd();
                return { exito: false, error: extraerDescripcion(raw, response.status) };
            }
        }

        secureLog.response(data);
        secureLog.groupEnd();

        if (!response.ok || (data.errors && data.errors.length > 0)) {
            return { exito: false, error: extraerDescripcion(raw, response.status) };
        }

        return { exito: true, movimientos: data.moviments ?? [] };
    } catch (err) {
        secureLog.error("Error de red", err);
        secureLog.groupEnd();
        const msg = err instanceof Error ? err.message : "Error desconocido";
        return { exito: false, error: `Error de conexión: ${msg}` };
    }
}