import type { GtrBaseResponse } from "@/lib/api/endpoints";

/**
 * Parsea la respuesta de cualquier endpoint GTR.
 * - Si hay error, devuelve la `descripcio` exacta del servidor (sin mapeo local).
 * - Si la respuesta es correcta, devuelve null.
 *
 * Las respuestas HTML (404/500) deben filtrarse en el hook mediante el
 * content-type ANTES de llamar a esta función.
 */
export function parseGtrResponse(data: GtrBaseResponse): string | null {
    // Prioridad 1: array de errores del propio GTR
    if (data.errors && data.errors.length > 0) {
        return data.errors[0].descripcio;
    }

    // Normalizamos la descripcio para comparar sin sensibilidad a mayúsculas
    const descLower = data.descripcio?.toLowerCase() ?? "";

    const esExito =
        data.codi === "0" ||
        descLower === "ok" ||
        descLower === "correcte";

    // Éxito: null. Error con descripcio: la devolvemos tal cual.
    if (!esExito && data.descripcio) {
        return data.descripcio;
    }

    return null;
}