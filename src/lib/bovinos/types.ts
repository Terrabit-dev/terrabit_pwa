export interface Animal {
    identificador: string;
    identificadorElectronic?: string;
    tipusIdentificadorElectronic?: string;
    dataNaixement: string;
    sexe: string;
    raza: string;
    identificadorMare?: string;
    explotacioNaixement?: string;
    paisNaixement?: string;
}

export interface OpcionSelect {
    codigo: string;
    nombre: string;
}

export interface NacimientoForm {
    idMadre: string;
    idCria: string;
    fechaNacimiento: string;
    fechaIdentificacion: string;
    sexoCodigo: string;
    sexoNombre: string;
    razaCodigo: string;
    razaNombre: string;
    aptitudCodigo: string;
    aptitudNombre: string;
}

export const NACIMIENTO_FORM_INICIAL: NacimientoForm = {
    idMadre: "",
    idCria: "",
    fechaNacimiento: "",
    fechaIdentificacion: "",
    sexoCodigo: "",
    sexoNombre: "",
    razaCodigo: "",
    razaNombre: "",
    aptitudCodigo: "",
    aptitudNombre: "",
};

export interface GtrError {
    codi: string;
    descripcio: string;
}

export interface GtrBaseResponse {
    codi?: string;
    descripcio?: string;
    errors?: GtrError[];
}