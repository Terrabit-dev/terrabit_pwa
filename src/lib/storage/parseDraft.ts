/**
 * Convierte los datos genéricos de un borrador/historial al tipo concreto
 * del formulario correspondiente.
 *
 * - Solo copia campos presentes en `initial` (nunca propiedades extras).
 * - Descarta campos con tipo distinto al esperado (fallback al valor inicial).
 * - Evita crashes por borradores corruptos o esquemas antiguos.
 * - Sin casts inseguros en el sitio de llamada.
 */
export function parseDraft<T extends object>(
    data: Record<string, unknown>,
    initial: T,
): T {
    const initialAsRecord = initial as unknown as Record<string, unknown>;
    const result: Record<string, unknown> = { ...initialAsRecord };

    for (const key of Object.keys(initialAsRecord)) {
        const value = data[key];
        if (value !== undefined && typeof value === typeof initialAsRecord[key]) {
            result[key] = value;
        }
    }

    return result as T;
}