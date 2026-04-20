export interface GuiaForm {
    // Obligatorios
    explotacioOrigen:     string;
    explotacioDestinacio: string;
    temporal:             string;   // código API ("1" / "2")
    temporalNombre:       string;   // display
    dataSortida:          string;   // "YYYY-MM-DD"
    horaSortida:          string;   // "HH:mm"
    dataArribada:         string;
    horaArribada:         string;
    mobilitat:            string;
    mobilitatNombre:      string;
    // Centro de inspección
    esCentroInspeccion:   boolean;
    pais:                 string;
    codiExplotacio:       string;
    // Opcionales
    codiAtes:             string;
    nomTransportista:     string;
    mitjaTransport:       string;
    mitjaTransportNombre: string;
    matricula:            string;
    nifConductor:         string;
    nomConductor:         string;
    identificadors:       string[];
}

export const GUIA_FORM_INICIAL: GuiaForm = {
    explotacioOrigen:     "",
    explotacioDestinacio: "",
    temporal:             "",
    temporalNombre:       "",
    dataSortida:          "",
    horaSortida:          "",
    dataArribada:         "",
    horaArribada:         "",
    mobilitat:            "",
    mobilitatNombre:      "",
    esCentroInspeccion:   false,
    pais:                 "",
    codiExplotacio:       "",
    codiAtes:             "",
    nomTransportista:     "",
    mitjaTransport:       "",
    mitjaTransportNombre: "",
    matricula:            "",
    nifConductor:         "",
    nomConductor:         "",
    identificadors:       [""],
};

// Códigos de error equivalentes al Android (alertsErrosScreens)
export const GUIA_ERRORES = {
    EXPLOTACIO_ORIGEN:      20,
    EXPLOTACIO_DESTINACIO:  18,
    TEMPORAL:               21,
    DATA_SORTIDA:           22,
    HORA_SORTIDA:           23,
    DATA_ARRIBADA:          15,
    HORA_ARRIBADA:          16,
    MOBILITAT:              24,
} as const;

export interface GuiaValidationError {
    tipo:   "validacion";
    codigo: number;
}

export function validarGuia(form: GuiaForm): GuiaValidationError | null {
    if (!form.explotacioOrigen.trim())     return { tipo: "validacion", codigo: GUIA_ERRORES.EXPLOTACIO_ORIGEN };
    if (!form.explotacioDestinacio.trim()) return { tipo: "validacion", codigo: GUIA_ERRORES.EXPLOTACIO_DESTINACIO };
    if (!form.temporal)                    return { tipo: "validacion", codigo: GUIA_ERRORES.TEMPORAL };
    if (!form.dataSortida)                 return { tipo: "validacion", codigo: GUIA_ERRORES.DATA_SORTIDA };
    if (!form.horaSortida)                 return { tipo: "validacion", codigo: GUIA_ERRORES.HORA_SORTIDA };
    if (!form.dataArribada)                return { tipo: "validacion", codigo: GUIA_ERRORES.DATA_ARRIBADA };
    if (!form.horaArribada)                return { tipo: "validacion", codigo: GUIA_ERRORES.HORA_ARRIBADA };
    if (!form.mobilitat)                   return { tipo: "validacion", codigo: GUIA_ERRORES.MOBILITAT };
    return null;
}

// "YYYY-MM-DD" + "HH:mm" → "yyyyMMddHHmm" (formato GTR)
export function formatearFechaHoraAPI(fecha: string, hora: string): string {
    const fechaPlana = fecha.replace(/-/g, "");
    const horaPlana  = hora.replace(":", "");
    return `${fechaPlana}${horaPlana}`;
}

// Normaliza el array de identificadores (trim + no vacíos)
export function limpiarIdentificadores(ids: string[]): string[] {
    return ids.map((id) => id.trim()).filter((id) => id.length > 0);
}