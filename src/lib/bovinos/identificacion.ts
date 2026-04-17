// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface IdentificacionForm {
    identificador:    string;
    dataIdentificacio: string; // "yyyy-mm-dd" internamente
}

export const IDENTIFICACION_FORM_INICIAL: IdentificacionForm = {
    identificador:    "",
    dataIdentificacio: "",
};

export const IDENTIFICACION_ERRORES = {
    ANIMAL_ID: 1,
    FECHA:     2,
};

export interface IdentificacionValidationError {
    tipo:   "validacion";
    codigo: number;
}

// ─── Validación ───────────────────────────────────────────────────────────────

export function validarIdentificacion(
    form: IdentificacionForm
): IdentificacionValidationError | null {
    if (!form.identificador.trim()) return { tipo: "validacion", codigo: IDENTIFICACION_ERRORES.ANIMAL_ID };
    if (!form.dataIdentificacio)    return { tipo: "validacion", codigo: IDENTIFICACION_ERRORES.FECHA };
    return null;
}

// ─── Helpers de fecha ─────────────────────────────────────────────────────────

/** "yyyy-mm-dd" → "yyyymmdd" (formato GTR API) */
export function formatearFechaAPI(fecha: string): string {
    return fecha.replace(/-/g, "");
}

/** "yyyy-mm-dd" → "dd/mm/yyyy" (display en UI) */
export function formatearFechaDisplay(fecha: string): string {
    if (!fecha) return "";
    const [year, month, day] = fecha.split("-");
    return `${day}/${month}/${year}`;
}
