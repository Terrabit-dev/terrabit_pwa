import { NextRequest, NextResponse } from "next/server";
import { secureLog } from "@/lib/utils/secureLog";
import { enforceRateLimit } from "@/lib/security/rateLimit";

// URLs del servidor de la Generalitat de Catalunya (GTR)
const GTR_BASE_PROD = "https://aplicacions.agricultura.gencat.cat/gtr/";
const GTR_BASE_PREPROD = "https://preproduccio.aplicacions.agricultura.gencat.cat/gtr/";

const PROXY_RATE_LIMIT = { bucket: "gtr-proxy", max: 120, windowSec: 60 };

function resolveBase(request: NextRequest): string {
  const env = request.cookies.get("terrabit_env")?.value || "prod";
  return env === "preprod" ? GTR_BASE_PREPROD : GTR_BASE_PROD;
}

async function parseResponse(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { codi: String(response.status), descripcio: text };
  }
}

interface ProxyPayload {
  endpoint?: string;
  gtrMethod?: "GET" | "PUT";
  query?: Record<string, string>;
  body?: Record<string, unknown>;
}

/**
 * Punto de entrada único navegador → GTR.
 *
 * Las credenciales viajan SIEMPRE en el body de este POST, nunca en la URL.
 * Según `gtrMethod`, el proxy habla con la GTR mediante:
 *   - "GET":  query string (consultas). Las credenciales solo viajan en la
 *             URL en el salto servidor → GTR, que es inevitable mientras la
 *             GTR no acepte POST. Ver docs/adr/0001-credenciales-no-en-url.md
 *   - "PUT":  body JSON (escrituras).
 */
export async function POST(request: NextRequest) {
  const limited = enforceRateLimit(request, PROXY_RATE_LIMIT);
  if (limited) return limited;

  let payload: ProxyPayload;
  try {
    payload = (await request.json()) as ProxyPayload;
  } catch {
    return NextResponse.json({ codi: "400", descripcio: "Cuerpo inválido" }, { status: 400 });
  }

  const { endpoint, gtrMethod = "GET", query, body } = payload;
  if (!endpoint) {
    return NextResponse.json({ codi: "400", descripcio: "Endpoint requerido" }, { status: 400 });
  }

  const GTR_BASE = resolveBase(request);

  try {
    const url = new URL(endpoint, GTR_BASE);

    if (gtrMethod === "PUT") {
      const response = await fetch(url.toString(), {
        method: "PUT",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(body ?? {}),
      });
      const data = await parseResponse(response);
      return NextResponse.json(data, { status: 200 });
    }

    // gtrMethod === "GET"
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        url.searchParams.set(key, value);
      }
    }
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
    });
    const data = await parseResponse(response);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    secureLog.error("GTR proxy POST error:", error);
    return NextResponse.json(
        { codi: "503", descripcio: "Error de connexió amb GTR" },
        { status: 503 }
    );
  }
}

/**
 * @deprecated Escrituras legacy. Algunas pantallas todavía llaman al proxy con
 * PUT directo (credenciales en el body, endpoint en la query). Estas llamadas
 * NO exponen credenciales en la URL, así que no son parte del fix de seguridad.
 * Se migrarán a `gtrMutation` (POST) en una segunda fase y entonces se eliminará
 * este handler.
 */
export async function PUT(request: NextRequest) {
  const limited = enforceRateLimit(request, PROXY_RATE_LIMIT);
  if (limited) return limited;

  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get("endpoint");

  const GTR_BASE = resolveBase(request);

  if (!endpoint) {
    return NextResponse.json({ codi: "400", descripcio: "Endpoint requerido" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const url = new URL(endpoint, GTR_BASE);

    const response = await fetch(url.toString(), {
      method: "PUT",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await parseResponse(response);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    secureLog.error("GTR proxy PUT error:", error);
    return NextResponse.json(
        { codi: "503", descripcio: "Error de connexió amb GTR" },
        { status: 503 }
    );
  }
}