import type { NacimientoForm } from "@/lib/bovinos/types";

export const NACIMIENTO_ERRORES = {
    MADRE:     1,
    CRIA:      2,
    FECHA_NAC: 3,
    SEXO:      4,
    RAZA:      5,
    APTITUD:   6,
};

export interface NacimientoValidationError {
    tipo: "validacion";
    codigo: number;
}

export function validarNacimiento(form: NacimientoForm): NacimientoValidationError | null {
    if (!form.idMadre.trim())  return { tipo: "validacion", codigo: NACIMIENTO_ERRORES.MADRE };
    if (!form.idCria.trim())   return { tipo: "validacion", codigo: NACIMIENTO_ERRORES.CRIA };
    if (!form.fechaNacimiento) return { tipo: "validacion", codigo: NACIMIENTO_ERRORES.FECHA_NAC };
    if (!form.sexoCodigo)      return { tipo: "validacion", codigo: NACIMIENTO_ERRORES.SEXO };
    if (!form.razaCodigo)      return { tipo: "validacion", codigo: NACIMIENTO_ERRORES.RAZA };
    if (!form.aptitudCodigo)   return { tipo: "validacion", codigo: NACIMIENTO_ERRORES.APTITUD };
    return null;
}

// Utilidades de fecha puras — reutilizables en cualquier módulo
export function formatearFechaAPI(fecha: string): string {
    return fecha.replace(/-/g, "");
}

export function formatearFechaDisplay(fecha: string): string {
    if (!fecha) return "";
    const [year, month, day] = fecha.split("-");
    return `${day}/${month}/${year}`;
}

export function parsearFechaInput(fecha: string): string {
    if (!fecha) return "";
    const [day, month, year] = fecha.split("/");
    return `${year}-${month}-${day}`;
}