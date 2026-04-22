import {
    validarDireccionEnvio,
    type DireccionEnvioBase
} from "./constants";

export interface IdentificadorDuplicado {
    identificador: string;
    tipusMaterial: string;
    tipusMaterialNombre: string;
}

export interface SolicitudDuplicadoForm extends DireccionEnvioBase {
    empresaSubministradora: string;
    empresaSubministradoraNombre: string;
    tipusEnviament: string;
    tipusEnviamentNombre: string;
    adrecaLliuramentNombre: string;
    identificadors: IdentificadorDuplicado[];
    codigoSeguimiento?: string;
}

export const SOLICITUD_DUPLICADO_FORM_INICIAL: SolicitudDuplicadoForm = {
    empresaSubministradora: "", empresaSubministradoraNombre: "",
    tipusEnviament: "", tipusEnviamentNombre: "",
    adrecaLliurament: "", adrecaLliuramentNombre: "",
    identificadors: [{ identificador: "", tipusMaterial: "", tipusMaterialNombre: "" }],
    oc: "", ocNombre: "",
    adreca: "", poblacio: "", cp: "", municipi: "", telefonContacte: "",
};

// ─── Diccionarios específicos de este trámite ────────────────────────────────

export const TIPOS_MATERIAL_DUPLICAT = [
    { codigo: "07", nombre: "Cròtal", nombreEs: "Crotal" },
    { codigo: "20", nombre: "Cròtal electrònic", nombreEs: "Crotal electrónico" },
    { codigo: "21", nombre: "Injectable electrònic", nombreEs: "Inyectable electrónico" },
    { codigo: "22", nombre: "Bol ruminal", nombreEs: "Bolo ruminal" }
];

// ─── Lógica de Validación ────────────────────────────────────────────────────

export function validarSolicitudDuplicado(form: SolicitudDuplicadoForm): { tipo: "validacion", codigo: number } | null {
    if (!form.empresaSubministradora) return { tipo: "validacion", codigo: 1 };
    if (!form.tipusEnviament) return { tipo: "validacion", codigo: 2 };

    if (!form.identificadors || form.identificadors.length === 0) return { tipo: "validacion", codigo: 4 };

    for (const item of form.identificadors) {
        if (!item.identificador.trim()) return { tipo: "validacion", codigo: 5 };
        if (!item.tipusMaterial) return { tipo: "validacion", codigo: 6 };
    }

    // Magia DRY: Reutilizamos la misma validación de la dirección
    const errorDireccion = validarDireccionEnvio(form);
    if (errorDireccion) return errorDireccion;

    return null;
}