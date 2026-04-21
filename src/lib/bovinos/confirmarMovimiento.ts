import { parseGtrResponse } from "@/lib/gtr/errorHandler";
import { getCredentials } from "@/lib/storage/credentials";
import { guardarEnHistorial } from "@/lib/storage/historial";
import { secureLog } from "@/lib/utils/secureLogger";
import type { GtrBaseResponse } from "@/lib/api/endpoints";

// ─── Tipos ────────────────────────────────────────────────────────────────────
export interface AnimalMovimiento {
    identificador:    string;
    estatArribada:    string;   // "80"|"92"|"93"|"94"
    // Solo si estatArribada === "80" (sacrificio):
    dataSacrMort:     string;   // "YYYY-MM-DD"
    pesCanal:         string;   // formato "sssdd" (3 enteros + 2 decimales)
    classCanal:       string;   // 5 posiciones con reglas por posición
    tipusPresentacio: string;   // "1"|"2"|"3"|"4"|"5"
}

export interface ConfirmarMovimientoForm {
    // Cabecera
    codiRemo:             string;
    dataArribada:         string;   // "YYYY-MM-DD"
    horaArribada:         string;   // "HH:mm"
    codiAtes:             string;
    explotacioDestinacio: string;
    // Transporte
    mitjaTransport:       string;   // "04"|"05"|"06"|"07"|"08"|"99"
    mitjaTransportNombre: string;
    matricula:            string;
    nomTransportista:     string;
    nifConductor:         string;
    nomConductor:         string;
    // Animales
    animales:             AnimalMovimiento[];
}

export const ANIMAL_MOV_INICIAL: AnimalMovimiento = {
    identificador:    "",
    estatArribada:    "",
    dataSacrMort:     "",
    pesCanal:         "",
    classCanal:       "",
    tipusPresentacio: "",
};

export const CONFIRMAR_MOV_FORM_INICIAL: ConfirmarMovimientoForm = {
    codiRemo:             "",
    dataArribada:         "",
    horaArribada:         "",
    codiAtes:             "",
    explotacioDestinacio: "",
    mitjaTransport:       "",
    mitjaTransportNombre: "",
    matricula:            "",
    nomTransportista:     "",
    nifConductor:         "",
    nomConductor:         "",
    animales:             [{ ...ANIMAL_MOV_INICIAL }],
};

// ─── Límites (verificados contra servidor real) ───────────────────────────────
export const CONFIRMAR_MOV_LIMITES = {
    CODI_REMO:         20,
    CODI_ATES:         15,
    NOM_TRANSPORTISTA: 100,
    MATRICULA:         20,
    NIF_CONDUCTOR:     9,   // Servidor (PDF dice 20)
    NOM_CONDUCTOR:     40,
    EXPLOTACIO:        14,
    IDENTIFICADOR:     20,
    PES_CANAL:         5,
    CLASS_CANAL:       5,
} as const;

// ─── Valores de enumerados ────────────────────────────────────────────────────
export const MITJA_TRANSPORT_VALUES = ["04", "05", "06", "07", "08", "99"] as const;

// Estados de arribada agrupados por rol (PDF §5.8.3)
export const ESTATS_ESCORXADOR = {
    SACRIFICI:        "80",
    MORT_TRANSPORT:   "93",
    MORT_QUADRES:     "94",
} as const;

export const ESTATS_RAMADER = {
    ARRIBAT:          "92",
    MORT_TRANSPORT:   "93",
} as const;

export const TIPUS_PRESENTACIO_VALUES = ["1", "2", "3", "4", "5"] as const;

// ─── Opciones display para dropdowns (i18n: es | ca) ──────────────────────────
// Fuente única para todas las pantallas que usen confirmación de movimientos.
export type OpcionDisplay = { codigo: string; nombre: string };
export type Lang = "es" | "ca";

const TRANSPORTES_ES: OpcionDisplay[] = [
    { codigo: "04", nombre: "Camión" },
    { codigo: "05", nombre: "Barco" },
    { codigo: "06", nombre: "Avión" },
    { codigo: "07", nombre: "Tren" },
    { codigo: "08", nombre: "A pie" },
    { codigo: "99", nombre: "Otros" },
];
const TRANSPORTES_CA_LIST: OpcionDisplay[] = [
    { codigo: "04", nombre: "Camió" },
    { codigo: "05", nombre: "Vaixell" },
    { codigo: "06", nombre: "Avió" },
    { codigo: "07", nombre: "Tren" },
    { codigo: "08", nombre: "Conducció a peu" },
    { codigo: "99", nombre: "Altres" },
];

// Estados de arribada — valores rol Escorxador (incluye todos: 80, 92, 93, 94)
const ESTATS_ARRIBADA_ES: OpcionDisplay[] = [
    { codigo: "92", nombre: "Llegado" },
    { codigo: "80", nombre: "Sacrificio" },
    { codigo: "93", nombre: "Muerto en transporte" },
    { codigo: "94", nombre: "Muerto en cuadras" },
];
const ESTATS_ARRIBADA_CA_LIST: OpcionDisplay[] = [
    { codigo: "92", nombre: "Arribat" },
    { codigo: "80", nombre: "Sacrifici" },
    { codigo: "93", nombre: "Mort durant transport" },
    { codigo: "94", nombre: "Mort quadres" },
];

// Tipus presentació — PDF §5.8.3
const TIPUS_PRESENTACIO_ES: OpcionDisplay[] = [
    { codigo: "1", nombre: "Tipo I" },
    { codigo: "2", nombre: "Tipo IIA" },
    { codigo: "3", nombre: "Tipo IIB" },
    { codigo: "4", nombre: "Tipo IIIA" },
    { codigo: "5", nombre: "Tipo IIIB" },
];
const TIPUS_PRESENTACIO_CA_LIST: OpcionDisplay[] = [
    { codigo: "1", nombre: "Tipus I" },
    { codigo: "2", nombre: "Tipus IIA" },
    { codigo: "3", nombre: "Tipus IIB" },
    { codigo: "4", nombre: "Tipus IIIA" },
    { codigo: "5", nombre: "Tipus IIIB" },
];

// Devolvemos copias para que `SelectInput` pueda recibir arrays mutables sin
// exponer los arrays internos a mutaciones accidentales desde fuera.
export function getTransportes(lang: Lang): OpcionDisplay[] {
    return [...(lang === "ca" ? TRANSPORTES_CA_LIST : TRANSPORTES_ES)];
}
export function getEstatsArribada(lang: Lang): OpcionDisplay[] {
    return [...(lang === "ca" ? ESTATS_ARRIBADA_CA_LIST : ESTATS_ARRIBADA_ES)];
}
export function getTipusPresentacio(lang: Lang): OpcionDisplay[] {
    return [...(lang === "ca" ? TIPUS_PRESENTACIO_CA_LIST : TIPUS_PRESENTACIO_ES)];
}

// ─── Errores (alineados con los existentes de guías) ──────────────────────────
export const CONFIRMAR_MOV_ERRORES = {
    CODI_REMO:             14,
    DATA_ARRIBADA:         15,
    HORA_ARRIBADA:         16,
    CODI_ATES:             17,
    EXPLOTACIO_DESTINACIO: 18,
    ANIMAL_ID:             12,
    ESTAT_ARRIBADA:        19,
    SACRIFICI_INCOMPLETO:  25,
} as const;

export interface ConfirmarMovValidationError {
    tipo:    "validacion";
    codigo:  number;
    indice?: number;
}

interface ConfirmarMovApiError     { tipo: "api"; mensaje: string; }
interface ConfirmarMovNetworkError { tipo: "red"; }
export type ConfirmarMovError = ConfirmarMovApiError | ConfirmarMovNetworkError;

export interface EnviarConfirmarMovResult {
    exito:  boolean;
    error?: ConfirmarMovError;
}

// ─── Validación ───────────────────────────────────────────────────────────────
export function validarConfirmarMov(form: ConfirmarMovimientoForm): ConfirmarMovValidationError | null {
    if (!form.codiRemo.trim())             return { tipo: "validacion", codigo: CONFIRMAR_MOV_ERRORES.CODI_REMO };
    if (!form.dataArribada)                return { tipo: "validacion", codigo: CONFIRMAR_MOV_ERRORES.DATA_ARRIBADA };
    if (!form.horaArribada)                return { tipo: "validacion", codigo: CONFIRMAR_MOV_ERRORES.HORA_ARRIBADA };
    if (!form.codiAtes.trim())             return { tipo: "validacion", codigo: CONFIRMAR_MOV_ERRORES.CODI_ATES };
    if (!form.explotacioDestinacio.trim()) return { tipo: "validacion", codigo: CONFIRMAR_MOV_ERRORES.EXPLOTACIO_DESTINACIO };

    for (let i = 0; i < form.animales.length; i++) {
        const a = form.animales[i];
        if (!a.identificador.trim()) {
            return { tipo: "validacion", codigo: CONFIRMAR_MOV_ERRORES.ANIMAL_ID, indice: i };
        }
        if (!a.estatArribada) {
            return { tipo: "validacion", codigo: CONFIRMAR_MOV_ERRORES.ESTAT_ARRIBADA, indice: i };
        }
        if (a.estatArribada === ESTATS_ESCORXADOR.SACRIFICI) {
            if (!a.dataSacrMort || !a.pesCanal.trim() || !a.classCanal.trim() || !a.tipusPresentacio) {
                return { tipo: "validacion", codigo: CONFIRMAR_MOV_ERRORES.SACRIFICI_INCOMPLETO, indice: i };
            }
        }
    }
    return null;
}

// ─── Helpers de formato ───────────────────────────────────────────────────────
// "YYYY-MM-DD" + "HH:mm" → "yyyyMMddHHmm" (12 chars)
export function formatearFechaHoraAPI(fecha: string, hora: string): string {
    const fechaPlana = fecha.replace(/-/g, "");
    const horaPlana  = hora.replace(":", "");
    return `${fechaPlana}${horaPlana}`;
}

// "YYYY-MM-DD" → "yyyymmdd" (8 chars)
export function formatearFechaAPI(fecha: string): string {
    return fecha.replace(/-/g, "");
}

// ─── Construcción del body (alineado 1:1 con §5.8.3) ──────────────────────────
function construirBody(form: ConfirmarMovimientoForm, nif: string, password: string): Record<string, unknown> {
    const identificadors = form.animales
        .filter((a) => a.identificador.trim().length > 0)
        .map((a) => {
            const item: Record<string, unknown> = {
                identificador: a.identificador.trim(),
                estatArribada: a.estatArribada,
            };
            if (a.estatArribada === ESTATS_ESCORXADOR.SACRIFICI) {
                if (a.dataSacrMort)     item.dataSacrMort     = formatearFechaAPI(a.dataSacrMort);
                if (a.pesCanal.trim())  item.pesCanal         = a.pesCanal.trim();
                if (a.classCanal.trim()) item.classCanal      = a.classCanal.trim();
                if (a.tipusPresentacio) item.tipusPresentacio = a.tipusPresentacio;
            }
            return item;
        });

    const body: Record<string, unknown> = {
        nif,
        passwordMobilitat:    password,
        especie:              "01",
        codiRemo:             form.codiRemo.trim(),
        dataArribada:         formatearFechaHoraAPI(form.dataArribada, form.horaArribada),
        codiAtes:             form.codiAtes.trim(),
        explotacioDestinacio: form.explotacioDestinacio.trim(),
        identificadors,
    };

    if (form.nomTransportista.trim()) body.nomTransportista = form.nomTransportista.trim();
    if (form.mitjaTransport)          body.mitjaTransport   = form.mitjaTransport;
    if (form.matricula.trim())        body.matricula        = form.matricula.trim();
    if (form.nifConductor.trim())     body.nifConductor     = form.nifConductor.trim();
    if (form.nomConductor.trim())     body.nomConductor     = form.nomConductor.trim();

    return body;
}

// ─── Envío al endpoint WSConfirmacioMoviment ──────────────────────────────────
export async function enviarConfirmarMov(form: ConfirmarMovimientoForm): Promise<EnviarConfirmarMovResult> {
    const credentials = getCredentials();
    if (!credentials) return { exito: false, error: { tipo: "red" } };

    const body = construirBody(form, credentials.nif, credentials.password);

    secureLog.group("[GTR] WSConfirmacioMoviment →");
    secureLog.request("WSConfirmacioMoviment", body);

    try {
        const response = await fetch(
            "/api/gtr/proxy?endpoint=WSBoviGuies/AppJava/movs/WSConfirmacioMoviment",
            {
                method:  "PUT",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify(body),
            }
        );

        secureLog.status(response.status, response.statusText);

        let data: GtrBaseResponse;
        try {
            data = await response.json();
        } catch {
            secureLog.error("No se pudo parsear el body de la respuesta");
            secureLog.groupEnd();
            return { exito: false, error: { tipo: "red" } };
        }

        secureLog.response(data);
        secureLog.groupEnd();

        const errorMsg = parseGtrResponse(data);
        if (errorMsg) {
            return { exito: false, error: { tipo: "api", mensaje: errorMsg } };
        }

        await guardarEnHistorial({
            tipo:    "CONFIRMAR_MOVIMIENTO",
            resumen: `Moviment confirmat — ${form.codiRemo}`,
            datos:   form as unknown as Record<string, unknown>,
        });

        return { exito: true };
    } catch (err) {
        secureLog.error("Error de red", err);
        secureLog.groupEnd();
        return { exito: false, error: { tipo: "red" } };
    }
}

// ─── Precarga desde un movimiento pendiente ───────────────────────────────────
export interface MovimentoPendiente {
    codiRemo:             string;
    codiAtes:             string;
    dataArribada:         string;   // "yyyymmddHHmm" — formato GTR
    moDestinacio:         string;
    mitjaTransport?:      string;
    matricula?:           string | null;
    nomTransportista?:    string | null;
    nifConductor?:        string | null;
    nomConductor?:        string | null;
    identificadors:       Array<{ identificador: string }>;
}

function parsearFechaHoraAPI(fechaHora: string): { fecha: string; hora: string } {
    if (fechaHora.length < 12) return { fecha: "", hora: "" };
    const year  = fechaHora.substring(0, 4);
    const month = fechaHora.substring(4, 6);
    const day   = fechaHora.substring(6, 8);
    const hh    = fechaHora.substring(8, 10);
    const mm    = fechaHora.substring(10, 12);
    return { fecha: `${year}-${month}-${day}`, hora: `${hh}:${mm}` };
}

export function precargarDesdeMovimiento(mov: MovimentoPendiente): ConfirmarMovimientoForm {
    const { fecha, hora } = parsearFechaHoraAPI(mov.dataArribada);
    return {
        ...CONFIRMAR_MOV_FORM_INICIAL,
        codiRemo:             mov.codiRemo,
        codiAtes:             mov.codiAtes,
        dataArribada:         fecha,
        horaArribada:         hora,
        explotacioDestinacio: mov.moDestinacio,
        mitjaTransport:       mov.mitjaTransport ?? "",
        matricula:            mov.matricula ?? "",
        nomTransportista:     mov.nomTransportista ?? "",
        nifConductor:         mov.nifConductor ?? "",
        nomConductor:         mov.nomConductor ?? "",
        animales: mov.identificadors.length > 0
            ? mov.identificadors.map((it) => ({ ...ANIMAL_MOV_INICIAL, identificador: it.identificador }))
            : [{ ...ANIMAL_MOV_INICIAL }],
    };
}