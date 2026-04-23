export interface AltaGuiaForm {
    explotacioSortida: string;
    explotacioEntrada: string;
    codiCategoria: string;
    codiCategoriaNombre: string;
    numAnimals: string;
    dataSortida: string; // Formato UI: YYYY-MM-DDTHH:mm
    dataArribada: string; // Formato UI: YYYY-MM-DDTHH:mm
    codiSirentra?: string;
    mitjaTransport?: string;
    mitjaTransportNombre?: string;
    matricula?: string;
    nifConductor?: string;
    codigoSeguimiento?: string;
}

export const ALTA_GUIA_FORM_INICIAL: AltaGuiaForm = {
    explotacioSortida: "",
    explotacioEntrada: "",
    codiCategoria: "",
    codiCategoriaNombre: "",
    numAnimals: "",
    dataSortida: "",
    dataArribada: "",
    codiSirentra: "",
    mitjaTransport: "",
    mitjaTransportNombre: "",
    matricula: "",
    nifConductor: "",
};

// ─── Diccionarios (Mapas) ────────────────────────────────────────────────────

export const CATEGORIAS_PORCINOS = [
    { codigo: "00", nombre: "Engreix", nombreEs: "Engorde" }, // Fattening
    { codigo: "01", nombre: "Garrins", nombreEs: "Lechones" }, // Piglets
    { codigo: "02", nombre: "Recria", nombreEs: "Recría" }, // Rearing
    { codigo: "03", nombre: "Truges", nombreEs: "Cerdas" }, // Females
    { codigo: "04", nombre: "Reposició", nombreEs: "Reposición" }, // Replacement
    { codigo: "05", nombre: "Verracs", nombreEs: "Verracos" } // Boars
];

export const MEDIOS_TRANSPORTE = [
    { codigo: "01", nombre: "Camió", nombreEs: "Camión" },
    { codigo: "999", nombre: "Altres", nombreEs: "Otros" }
];

// ─── Lógica de Validación ────────────────────────────────────────────────────

export function validarAltaGuia(form: AltaGuiaForm): { tipo: "validacion", codigo: number, mensaje?: string } | null {
    if (!form.explotacioSortida.trim()) return { tipo: "validacion", codigo: 1, mensaje: "Explotació de sortida obligatòria" };
    if (!form.explotacioEntrada.trim()) return { tipo: "validacion", codigo: 2, mensaje: "Explotació d'entrada obligatòria" };
    if (!form.codiCategoria) return { tipo: "validacion", codigo: 3, mensaje: "Categoria obligatòria" };

    const num = Number(form.numAnimals);
    if (!form.numAnimals || isNaN(num) || num <= 0) return { tipo: "validacion", codigo: 4, mensaje: "Número d'animals invàlid" };

    if (!form.dataSortida) return { tipo: "validacion", codigo: 5, mensaje: "Data de sortida obligatòria" };
    if (!form.dataArribada) return { tipo: "validacion", codigo: 6, mensaje: "Data d'arribada obligatòria" };

    // Validar que la fecha de llegada no sea anterior a la de salida
    const dSortida = new Date(form.dataSortida);
    const dArribada = new Date(form.dataArribada);
    if (dArribada < dSortida) {
        return { tipo: "validacion", codigo: 7, mensaje: "La data d'arribada no pot ser anterior a la sortida" };
    }

    return null;
}