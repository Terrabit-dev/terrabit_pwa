import { NextRequest, NextResponse } from "next/server";
import { secureLog, maskPartial } from "@/lib/utils/secureLog";

const GTR_BASE = process.env.GTR_BASE_URL ?? "https://preproduccio.aplicacions.agricultura.gencat.cat/gtr/";

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
 */
export async function POST(request: NextRequest) {
  try {
    const { nif, passwordMobilitat, codiMO } = await request.json();

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

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: { "Accept": "application/json" },
    });

    const data = (await parseResponse(response)) as GtrErrorResponse;

    if (data?.errors && data.errors.length > 0) {
      secureLog.warn(`[LOGIN] Credenciales rechazadas — nif: ${maskPartial(nif)} | codiMO: ${maskPartial(codiMO)} | motivo: ${data.errors[0]?.descripcio ?? "desconocido"}`);
      return NextResponse.json({ valid: false, errors: data.errors }, { status: 200 });
    }

    secureLog.info(`[LOGIN] Validación exitosa — nif: ${maskPartial(nif)} | codiMO: ${maskPartial(codiMO)}`);
    return NextResponse.json({ valid: true }, { status: 200 });

  } catch (error) {
    secureLog.error("[LOGIN] Error conectando con GTR:", error);
    return NextResponse.json(
        { valid: false, codi: "503", descripcio: "Error de connexió amb GTR" },
        { status: 503 }
    );
  }
}