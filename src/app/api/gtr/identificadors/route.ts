import { NextRequest, NextResponse } from "next/server";
import { secureLog, maskPartial } from "@/lib/utils/secureLog";

const GTR_BASE = process.env.GTR_BASE_URL ?? "https://preproduccio.aplicacions.agricultura.gencat.cat/gtr/";

// Timeout total para la petición a GTR (ms).
// GTR preproducción puede tardar en cold start; 40s da margen sin colgar al usuario.
const GTR_TIMEOUT_MS = 40_000;

interface GtrErrorResponse {
  errors?: Array<{ codi?: string; descripcio?: string }>;
  codi?: string;
  descripcio?: string;
}

async function parseResponse(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) return response.json();
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { codi: String(response.status), descripcio: text };
  }
}

/**
 * Endpoint de validación de credenciales contra GTR.
 *
 * Nota: el GTR no expone un endpoint dedicado de login. Se utiliza
 * WSIdentificadorsDisponibles porque exige credenciales válidas para responder.
 * Se descartan los datos de respuesta y solo devolvemos { valid: true/false }.
 *
 * Distinguimos códigos HTTP para que el cliente pueda dar mensajes específicos:
 *   200 valid:true / valid:false  → respuesta normal de GTR
 *   400                            → datos incompletos
 *   504                            → timeout (GTR no respondió en GTR_TIMEOUT_MS)
 *   502                            → GTR respondió con error de red/HTTP
 */
export async function POST(request: NextRequest) {
  const startedAt = Date.now();

  let nif: string, passwordMobilitat: string, codiMO: string;
  try {
    const body = await request.json();
    nif = body.nif;
    passwordMobilitat = body.passwordMobilitat;
    codiMO = body.codiMO;
  } catch {
    return NextResponse.json(
        { valid: false, errors: [{ descripcio: "Cuerpo inválido" }] },
        { status: 400 }
    );
  }

  if (!nif || !passwordMobilitat || !codiMO) {
    secureLog.warn(`[LOGIN] Intento con datos incompletos — nif: ${maskPartial(nif ?? "")} | codiMO: ${maskPartial(codiMO ?? "")}`);
    return NextResponse.json(
        { valid: false, errors: [{ descripcio: "Datos incompletos" }] },
        { status: 400 }
    );
  }

  secureLog.info(`[LOGIN] Intento de validación — nif: ${maskPartial(nif)} | codiMO: ${maskPartial(codiMO)}`);

  const url = new URL("WSBovi/AppJava/Bovi/WSIdentificadorsDisponibles", GTR_BASE);
  url.searchParams.set("nif", nif);
  url.searchParams.set("passwordMobilitat", passwordMobilitat);
  url.searchParams.set("codiMO", codiMO);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GTR_TIMEOUT_MS);

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: { "Accept": "application/json" },
      signal: controller.signal,
      // Importante en Next.js: nunca cachear esta llamada
      cache: "no-store",
    });

    const data = (await parseResponse(response)) as GtrErrorResponse;
    const elapsed = Date.now() - startedAt;

    if (data?.errors && data.errors.length > 0) {
      secureLog.warn(`[LOGIN] Credenciales rechazadas — nif: ${maskPartial(nif)} | codiMO: ${maskPartial(codiMO)} | motivo: ${data.errors[0]?.descripcio ?? "desconocido"} | ${elapsed}ms`);
      return NextResponse.json({ valid: false, errors: data.errors }, { status: 200 });
    }

    secureLog.info(`[LOGIN] Validación exitosa — nif: ${maskPartial(nif)} | codiMO: ${maskPartial(codiMO)} | ${elapsed}ms`);
    return NextResponse.json({ valid: true }, { status: 200 });

  } catch (error) {
    const elapsed = Date.now() - startedAt;
    const isAbort = error instanceof Error && error.name === "AbortError";

    if (isAbort) {
      secureLog.error(`[LOGIN] Timeout tras ${elapsed}ms conectando con GTR`);
      return NextResponse.json(
          { valid: false, codi: "504", descripcio: "Timeout de GTR" },
          { status: 504 }
      );
    }

    secureLog.error(`[LOGIN] Error de red tras ${elapsed}ms conectando con GTR:`, error);
    return NextResponse.json(
        { valid: false, codi: "502", descripcio: "Error de conexión con GTR" },
        { status: 502 }
    );

  } finally {
    clearTimeout(timeoutId);
  }
}