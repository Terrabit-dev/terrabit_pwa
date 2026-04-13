// Todos los endpoints usan el proxy /api/gtr/proxy
// para evitar CORS desde el navegador

const PROXY_GET = "/api/gtr/proxy";
const PROXY_PUT = "/api/gtr/proxy";

async function gtrGet<T>(endpoint: string, params: Record<string, string>): Promise<T> {
  const searchParams = new URLSearchParams({ endpoint, ...params });
  const response = await fetch(`${PROXY_GET}?${searchParams.toString()}`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

async function gtrPut<T>(endpoint: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${PROXY_PUT}?endpoint=${encodeURIComponent(endpoint)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface GtrError {
  codi: string;
  descripcio: string;
}

export interface GtrBaseResponse {
  errors?: GtrError[];
  codi?: string;
  descripcio?: string;
}

export interface Identificador {
  identificador: string;
  identificadorElectronic: string;
}

export interface IdentificadoresResponse extends GtrBaseResponse {
  identificadors?: Identificador[];
}

export interface Animal {
  identificador: string;
  identificadorElectronic?: string;
  identificadorMare?: string;
  sexe: string;
  raca: string;
  dataNaixement?: string;
  explotacioNaixement?: string;
  paisNaixement?: string;
}

export interface ListaBovinosResponse extends GtrBaseResponse {
  animals?: Animal[];
}

// ─── Helper éxito ─────────────────────────────────────────────────────────────

export function isGtrSuccess(response: GtrBaseResponse): boolean {
  if (response.errors && response.errors.length > 0) return false;
  const desc = response.descripcio?.toLowerCase() ?? "";
  return response.codi === "0" || desc === "ok" || desc === "correcte" || !response.codi;
}

// ─── Bovinos ──────────────────────────────────────────────────────────────────

export const apiGetIdentificadoresDisponibles = (
  nif: string, password: string, codiMO: string
) => gtrGet<IdentificadoresResponse>(
  "WSBovi/AppJava/Bovi/WSIdentificadorsDisponibles/",
  { nif, passwordMobilitat: password, codiMO }
);

export const apiGetListaBovinos = (
  nif: string, password: string, codiMO: string
) => gtrGet<ListaBovinosResponse>(
  "WSEnregistramentIDT/AppJava/WSConsultaAnimals/",
  { nif, password, tipusVinculacio: "T", explotacio: codiMO }
);

export const apiGetGuias = (
  nif: string, password: string, codiMO: string, codiRega: string, dataSortida: string
) => gtrGet<GtrBaseResponse>(
  "WSBoviGuies/AppJava/guies/WSGuiaMobilitat/",
  { nif, passwordMobilitat: password, codiMo: codiMO, codiRega, dataSortida }
);

export const apiGetMovimientos = (
  nif: string, password: string, explotacioDestinacio: string, dataSortida: string
) => gtrGet<GtrBaseResponse>(
  "WSBoviGuies/AppJava/movs/WSConsultaConfirmacioMoviment/",
  { nif, passwordMobilitat: password, explotacioDestinacio, dataSortida }
);

export const apiPutNacimiento      = (body: Record<string, unknown>) =>
  gtrPut<GtrBaseResponse>("WSBovi/AppJava/Bovi/WSEnregistramentNaixement/", body);

export const apiPutFallecimiento   = (body: Record<string, unknown>) =>
  gtrPut<GtrBaseResponse>("WSBovi/AppJava/Bovi/WSEnregistramentMort/", body);

export const apiPutCorreccionSexo  = (body: Record<string, unknown>) =>
  gtrPut<GtrBaseResponse>("WSBovi/AppJava/Bovi/WSModificacioAnimal/", body);

export const apiPutIdentificacion  = (body: Record<string, unknown>) =>
  gtrPut<GtrBaseResponse>("WSBovi/AppJava/Bovi/WSModificacioDataIdentificacioAnimal/", body);

export const apiPutAltaGuia        = (body: Record<string, unknown>) =>
  gtrPut<GtrBaseResponse>("WSBoviGuies/AppJava/guies/WSAltaGuia/", body);

export const apiPutModificarGuia   = (body: Record<string, unknown>) =>
  gtrPut<GtrBaseResponse>("WSBoviGuies/AppJava/guies/WSModificarGuiaMobilitat", body);

export const apiPutConfirmarMovi   = (body: Record<string, unknown>) =>
  gtrPut<GtrBaseResponse>("WSBoviGuies/AppJava/movs/WSConfirmacioMoviment/", body);

export const apiPutRegistroIntercanvio = (body: Record<string, unknown>) =>
  gtrPut<GtrBaseResponse>("WSBoviGuies/AppJava/movs/WSAltaIntercanviEntradaImportacio/", body);

export const apiPutModificarMovi   = (body: Record<string, unknown>) =>
  gtrPut<GtrBaseResponse>("WSBoviGuies/AppJava/movs/WSModificacioIntercanviEntradaImportacio/", body);

export const apiPutSolicitudDuplicado = (body: Record<string, unknown>) =>
  gtrPut<GtrBaseResponse>("WSBovi/AppJava/Bovi/WSSolicitudDuplicat/", body);

export const apiPutSolicitudMaterial  = (body: Record<string, unknown>) =>
  gtrPut<GtrBaseResponse>("WSEnviamentDuplicatES/AppJava/WSSolicitudMaterial/", body);

// ─── Porcinos ─────────────────────────────────────────────────────────────────

export const apiGetGuiasPorcinos = (
  nif: string, password: string, codiMO: string, codiRega: string, dataSortida: string
) => gtrGet<GtrBaseResponse>(
  "WSMobilitat/AppJava/WSCarregaGuiesMobilitat",
  { nif, password, codiMo: codiMO, codiRega, dataSortida }
);

export const apiPutAltaGuiaPorcinos = (body: Record<string, unknown>) =>
  gtrPut<GtrBaseResponse>("WSAltaguies/AppJava/WSAltaGuia", body);

export const apiPutModificarGuiaPorcinos = (body: Record<string, unknown>) =>
  gtrPut<GtrBaseResponse>("WSMobilitat/AppJava/WSModificarGuiasMovilitat", body);

export const apiGetMovimientosPendientesPorcinos = (
  nif: string, password: string, moDesti: string, desde: string, fins: string
) => gtrGet<GtrBaseResponse>(
  "WSConfirmacioMoviments/AppJava/WSObtenirMovimentPteConfirmar",
  { nif, password, moDesti, dataSortidaDesde: desde, dataSortidaFins: fins }
);

export const apiPutConfirmarMovimientoPorcino = (body: Record<string, unknown>) =>
  gtrPut<GtrBaseResponse>("WSConfirmacioMoviments/AppJava/WSConfirmarMoviment", body);