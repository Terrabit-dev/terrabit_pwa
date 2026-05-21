import { NextRequest, NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/security/rateLimit";
import { secureLog, maskPartial } from "@/lib/utils/secureLog";

const GTR_BASE_PROD = "https://aplicacions.agricultura.gencat.cat/gtr/";
const GTR_BASE_PREPROD = "https://preproduccio.aplicacions.agricultura.gencat.cat/gtr/";

// Las credenciales llegan en el body del POST (nunca en la URL).
export async function POST(request: NextRequest) {
  const limited = enforceRateLimit(request, { bucket: "bovinos-listar", max: 60, windowSec: 60 });
  if (limited) return limited;

  // Entorno desde la cookie (por defecto producción).
  const env = request.cookies.get("terrabit_env")?.value || "prod";
  const GTR_BASE = env === "preprod" ? GTR_BASE_PREPROD : GTR_BASE_PROD;

  let nif: string, password: string, explotacio: string;
  try {
    const body = await request.json();
    nif = body.nif;
    password = body.password;
    explotacio = body.explotacio;
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  if (!nif || !password || !explotacio) {
    return NextResponse.json({ error: "Parámetros incompletos" }, { status: 400 });
  }

  secureLog.info(
      `[BOVINOS] Listar (${env.toUpperCase()}) — nif: ${maskPartial(nif)} | explotacio: ${maskPartial(explotacio)}`
  );

  try {
    const url = new URL("WSEnregistramentIDT/AppJava/WSConsultaAnimals/", GTR_BASE);
    url.searchParams.set("nif", nif);
    url.searchParams.set("password", password);
    url.searchParams.set("tipusVinculacio", "1");
    url.searchParams.set("explotacio", explotacio);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    secureLog.error(`GTR listar bovinos error (${env.toUpperCase()}):`, error);
    return NextResponse.json({ error: "Error de connexió amb GTR" }, { status: 503 });
  }
}