export interface UnitatMaterial {
    nombreUnitats: string;
    codiExplotacio: string;
}

export interface SolicitudMaterialForm {
    empresaSubministradora: string;
    empresaSubministradoraNombre: string;
    tipusEnviament: string;
    tipusEnviamentNombre: string;
    adrecaLliurament: string;
    adrecaLliuramentNombre: string;
    tipusMaterial: string;
    tipusMaterialNombre: string;
    unitats: UnitatMaterial[];
    codiExplotacio: string;
    // Campos condicionales de dirección
    oc: string;
    ocNombre: string;
    adreca: string;
    poblacio: string;
    cp: string;
    municipi: string;
    telefonContacte: string;
}

export const SOLICITUD_MATERIAL_FORM_INICIAL: SolicitudMaterialForm = {
    empresaSubministradora: "", empresaSubministradoraNombre: "",
    tipusEnviament: "", tipusEnviamentNombre: "",
    adrecaLliurament: "", adrecaLliuramentNombre: "",
    tipusMaterial: "", tipusMaterialNombre: "",
    unitats: [{ nombreUnitats: "", codiExplotacio: "" }],
    codiExplotacio: "",
    oc: "", ocNombre: "",
    adreca: "", poblacio: "", cp: "", municipi: "", telefonContacte: "",
};

// ─── Diccionarios de datos ───────────────────────────────────────────────────

export const EMPRESAS_SUBMINISTRADORAS = [
    { codigo: "B02164317", nombre: "DATAMARS IBERICA SLU" },
    { codigo: "A78100609", nombre: "AZASA" }
];

export const TIPOS_ENVIO = [
    { codigo: "01", nombre: "Correu ordinari", nombreEs: "Correo ordinario" },
    { codigo: "04", nombre: "Correu certificat", nombreEs: "Correo certificado" }
];

export const TIPOS_DIRECCION = [
    { codigo: "01", nombre: "Oficina Comarcal", nombreEs: "Oficina Comarcal" },
    { codigo: "02", nombre: "Titular / Ramader", nombreEs: "Titular / Ganadero" },
    { codigo: "03", nombre: "Adreça alternativa", nombreEs: "Dirección alternativa" }
];

export const TIPOS_MATERIAL = [
    { codigo: "21", nombre: "Injectable electrònic", nombreEs: "Inyectable electrónico" },
    { codigo: "22", nombre: "Bol ruminal", nombreEs: "Bolo ruminal" },
    { codigo: "23", nombre: "Cròtal simple tissular", nombreEs: "Crotal simple tisular" },
    { codigo: "24", nombre: "Cròtal doble tissular", nombreEs: "Crotal doble tisular" },
    { codigo: "26", nombre: "Cròtal + Bol ruminal", nombreEs: "Crotal + Bolo ruminal" },
    { codigo: "27", nombre: "Cròtal + Cròtal electrònic", nombreEs: "Crotal + Crotal electrónico" },
    { codigo: "25", nombre: "Reidentificació", nombreEs: "Reidentificación" }
];

// Omitidas el resto por brevedad, asumiendo que tienes un array con las OC001, OC002...
export const OFICINAS_COMARCALES = [
    { codigo: "OC001", nombre: "Alt Camp" }, { codigo: "OC002", nombre: "Alt Empordà" },
    { codigo: "OC003", nombre: "Alt Penedès" }, { codigo: "OC004", nombre: "Alt Urgell" },
    { codigo: "OC005", nombre: "Alta Ribagorça" }, { codigo: "OC006", nombre: "Anoia" },
    { codigo: "OC007", nombre: "Bages" }, { codigo: "OC008", nombre: "Baix Camp" },
    { codigo: "OC009", nombre: "Baix Ebre" }, { codigo: "OC010", nombre: "Baix Empordà" },
    { codigo: "OC011", nombre: "Baix Llobregat" }, { codigo: "OC012", nombre: "Baix Penedès" },
    { codigo: "OC013", nombre: "Barcelonès" }, { codigo: "OC014", nombre: "Berguedà" },
    { codigo: "OC015", nombre: "Cerdanya" }, { codigo: "OC016", nombre: "Conca de Barberà" },
    { codigo: "OC017", nombre: "Garraf" }, { codigo: "OC018", nombre: "Garrigues" },
    { codigo: "OC019", nombre: "Garrotxa" }, { codigo: "OC020", nombre: "Gironès" },
    { codigo: "OC021", nombre: "Maresme" }, { codigo: "OC022", nombre: "Montsià" },
    { codigo: "OC023", nombre: "Noguera" }, { codigo: "OC024", nombre: "Osona" },
    { codigo: "OC025", nombre: "Pallars Jussà" }, { codigo: "OC026", nombre: "Pallars Sobirà" },
    { codigo: "OC027", nombre: "Pla d'Urgell" }, { codigo: "OC028", nombre: "Pla de l'Estany" },
    { codigo: "OC029", nombre: "Priorat" }, { codigo: "OC030", nombre: "Ribera d'Ebre" },
    { codigo: "OC031", nombre: "Ripollès" }, { codigo: "OC032", nombre: "Segarra" },
    { codigo: "OC033", nombre: "Segrià" }, { codigo: "OC034", nombre: "La Selva" },
    { codigo: "OC035", nombre: "Solsonès" }, { codigo: "OC036", nombre: "Tarragonès" },
    { codigo: "OC037", nombre: "Terra Alta" }, { codigo: "OC038", nombre: "Urgell" },
    { codigo: "OC039", nombre: "Vall d'Aran" }, { codigo: "OC040", nombre: "Vallès Occidental" },
    { codigo: "OC041", nombre: "Vallès Oriental" }, { codigo: "OC042", nombre: "Moianès" },
];

// ─── Lógica Condicional ──────────────────────────────────────────────────────

export function requiereCodiExplotacio(tipoMaterial: string): boolean {
    // 21: Injectable, 22: Bol ruminal, 25: Reidentificacio, 26: Crotal+Bol
    return ["21", "22", "25", "26"].includes(tipoMaterial);
}

export function validarSolicitudMaterial(form: SolicitudMaterialForm): { tipo: "validacion", codigo: number } | null {
    if (!form.empresaSubministradora) return { tipo: "validacion", codigo: 1 };
    if (!form.tipusEnviament) return { tipo: "validacion", codigo: 2 };
    if (!form.tipusMaterial) return { tipo: "validacion", codigo: 3 };
    if (!form.adrecaLliurament) return { tipo: "validacion", codigo: 5 };

    // Validar las unidades y el código de explotación
    if (!form.unitats || form.unitats.length === 0) return { tipo: "validacion", codigo: 4 };

    // REGLA CLAVE: Si hay más de 1 unidad, el código es obligatorio para todas
    const requiereExplotacionGlobal = form.unitats.length > 1 || requiereCodiExplotacio(form.tipusMaterial);

    for (const u of form.unitats) {
        if (!u.nombreUnitats || Number(u.nombreUnitats) <= 0 || u.nombreUnitats.length > 3) {
            return { tipo: "validacion", codigo: 4 }; // Error de unidades
        }
        if (requiereExplotacionGlobal && !u.codiExplotacio.trim()) {
            return { tipo: "validacion", codigo: 6 }; // Error de código de explotación
        }
    }

    // Validar direccione
    if (form.adrecaLliurament === "01") {
        if (!form.oc) return { tipo: "validacion", codigo: 7 };
    } else if (form.adrecaLliurament === "02" || form.adrecaLliurament === "03") {
        if (!form.adreca.trim() || !form.poblacio.trim() || !form.cp.trim() || !form.municipi.trim() || !form.telefonContacte.trim()) {
            return { tipo: "validacion", codigo: 8 };
        }
    }

    return null;
}