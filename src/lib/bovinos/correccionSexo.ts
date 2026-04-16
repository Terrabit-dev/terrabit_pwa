export interface CorreccionSexoForm {
    identificador: string;
    sexoCodigo:    string;
    sexoNombre:    string;
}

export const CORRECCION_SEXO_FORM_INICIAL: CorreccionSexoForm = {
    identificador: "",
    sexoCodigo:    "",
    sexoNombre:    "",
};

export const CORRECCION_SEXO_ERRORES = {
    ANIMAL_ID: 12,
    SEXO:      4,
} as const;

export interface CorreccionSexoValidationError {
    tipo:   "validacion";
    codigo: number;
}

export function validarCorreccionSexo(form: CorreccionSexoForm): CorreccionSexoValidationError | null {
    if (!form.identificador.trim()) return { tipo: "validacion", codigo: CORRECCION_SEXO_ERRORES.ANIMAL_ID };
    if (!form.sexoCodigo)           return { tipo: "validacion", codigo: CORRECCION_SEXO_ERRORES.SEXO };
    return null;
}