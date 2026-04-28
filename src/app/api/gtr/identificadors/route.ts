import { NextRequest, NextResponse } from "next/server";
import { secureLog } from "@/lib/utils/secureLog";

const GTR_BASE = "https://preproduccio.aplicacions.agricultura.gencat.cat/gtr/";

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

export async function POST(request: NextRequest) {
  try {
    const { nif, passwordMobilitat, codiMO } = await request.json();

    if (!nif || !passwordMobilitat || !codiMO) {
      return NextResponse.json(
          { errors: [{ descripcio: "Datos incompletos" }] },
          { status: 400 }
      );
    }

    const url = new URL("identificadors", GTR_BASE);
    url.searchParams.set("nif", nif);
    url.searchParams.set("passwordMobilitat", passwordMobilitat);
    url.searchParams.set("codiMO", codiMO);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: { "Accept": "application/json" },
    });

    const data = await parseResponse(response);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    secureLog.error("GTR identificadors error:", error);
    return NextResponse.json(
        { codi: "503", descripcio: "Error de connexió amb GTR" },
        { status: 503 }
    );
  }
}