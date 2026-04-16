export interface FallecimientoForm {
    identificador:      string;
    tipus:              string;   // "01" Muerte | "02" Aborto
    tipusNombre:        string;
    dataMort:           string;
    mesosGestacio:      string;   // solo si tipus === "02"
    cadaverInaccesible: boolean;  // solo si tipus === "01"
    latitud:            string;   // solo si cadaverInaccesible
    longitud:           string;   // solo si cadaverInaccesible
}

export const FALLECIMIENTO_FORM_INICIAL: FallecimientoForm = {
    identificador:      "",
    tipus:              "",
    tipusNombre:        "",
    dataMort:           "",
    mesosGestacio:      "",
    cadaverInaccesible: false,
    latitud:            "",
    longitud:           "",
};

export const FALLECIMIENTO_ERRORES = {
    ANIMAL_ID:   12,
    TIPO_MUERTE: 7,
    FECHA_MORT:  8,
    MESOS_GEST:  9,
    LATITUD:     10,
    LONGITUD:    11,
};

export interface FallecimientoValidationError {
    tipo:   "validacion";
    codigo: number;
}

export function validarFallecimiento(form: FallecimientoForm): FallecimientoValidationError | null {
    if (!form.tipus)              return { tipo: "validacion", codigo: FALLECIMIENTO_ERRORES.TIPO_MUERTE };
    if (!form.identificador.trim()) return { tipo: "validacion", codigo: FALLECIMIENTO_ERRORES.ANIMAL_ID };
    if (!form.dataMort)           return { tipo: "validacion", codigo: FALLECIMIENTO_ERRORES.FECHA_MORT };

    if (form.tipus === "02" && !form.mesosGestacio.trim())
        return { tipo: "validacion", codigo: FALLECIMIENTO_ERRORES.MESOS_GEST };

    if (form.tipus === "01" && form.cadaverInaccesible) {
        if (!form.latitud.trim())  return { tipo: "validacion", codigo: FALLECIMIENTO_ERRORES.LATITUD };
        if (!form.longitud.trim()) return { tipo: "validacion", codigo: FALLECIMIENTO_ERRORES.LONGITUD };
    }

    return null;
}

export function formatearFechaAPI(fecha: string): string {
    return fecha.replace(/-/g, "");
}

export function formatearFechaDisplay(fecha: string): string {
    if (!fecha) return "";
    const [year, month, day] = fecha.split("-");
    return `${day}/${month}/${year}`;
}