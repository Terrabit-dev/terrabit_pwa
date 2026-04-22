import {
    validarDireccionEnvio,
    type DireccionEnvioBase
} from "./constants";

export interface UnitatMaterial {
    nombreUnitats: string;
    codiExplotacio: string;
}

// Extendemos de DireccionEnvioBase para heredar automáticamente todos los campos de dirección
export interface SolicitudMaterialForm extends DireccionEnvioBase {
    empresaSubministradora: string;
    empresaSubministradoraNombre: string;
    tipusEnviament: string;
    tipusEnviamentNombre: string;
    adrecaLliuramentNombre: string;
    tipusMaterial: string;
    tipusMaterialNombre: string;
    unitats: UnitatMaterial[];
    codigoSeguimiento?: string;
}

export const SOLICITUD_MATERIAL_FORM_INICIAL: SolicitudMaterialForm = {
    empresaSubministradora: "", empresaSubministradoraNombre: "",
    tipusEnviament: "", tipusEnviamentNombre: "",
    adrecaLliurament: "", adrecaLliuramentNombre: "",
    tipusMaterial: "", tipusMaterialNombre: "",
    unitats: [{ nombreUnitats: "", codiExplotacio: "" }],
    oc: "", ocNombre: "",
    adreca: "", poblacio: "", cp: "", municipi: "", telefonContacte: "",
};

// ─── Diccionarios específicos de este trámite ────────────────────────────────

export const TIPOS_MATERIAL = [
    { codigo: "21", nombre: "Injectable electrònic", nombreEs: "Inyectable electrónico" },
    { codigo: "22", nombre: "Bol ruminal", nombreEs: "Bolo ruminal" },
    { codigo: "23", nombre: "Cròtal simple tissular", nombreEs: "Crotal simple tisular" },
    { codigo: "24", nombre: "Cròtal doble tissular", nombreEs: "Crotal doble tisular" },
    { codigo: "26", nombre: "Cròtal + Bol ruminal", nombreEs: "Crotal + Bolo ruminal" },
    { codigo: "27", nombre: "Cròtal + Cròtal electrònic", nombreEs: "Crotal + Crotal electrónico" },
    { codigo: "25", nombre: "Reidentificació", nombreEs: "Reidentificación" }
];

// ─── Lógica Condicional ──────────────────────────────────────────────────────

export function requiereCodiExplotacio(tipoMaterial: string): boolean {
    return ["21", "22", "25", "26"].includes(tipoMaterial);
}

export function validarSolicitudMaterial(form: SolicitudMaterialForm): { tipo: "validacion", codigo: number } | null {
    if (!form.empresaSubministradora) return { tipo: "validacion", codigo: 1 };
    if (!form.tipusEnviament) return { tipo: "validacion", codigo: 2 };
    if (!form.tipusMaterial) return { tipo: "validacion", codigo: 3 };

    if (!form.unitats || form.unitats.length === 0) return { tipo: "validacion", codigo: 4 };

    const requiereExplotacionGlobal = form.unitats.length > 1 || requiereCodiExplotacio(form.tipusMaterial);

    for (const u of form.unitats) {
        if (!u.nombreUnitats || Number(u.nombreUnitats) <= 0 || u.nombreUnitats.length > 3) {
            return { tipo: "validacion", codigo: 4 };
        }
        if (requiereExplotacionGlobal && !u.codiExplotacio.trim()) {
            return { tipo: "validacion", codigo: 6 };
        }
    }

    // Usamos la validación compartida para todo el tema de direcciones
    const errorDireccion = validarDireccionEnvio(form);
    if (errorDireccion) return errorDireccion;

    return null;
}