import { NextRequest, NextResponse } from "next/server";

const GTR_BASE = "https://preproduccio.aplicacions.agricultura.gencat.cat/gtr/";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const nif            = searchParams.get("nif");
  const passwordMobilitat = searchParams.get("passwordMobilitat");
  const codiMO         = searchParams.get("codiMO");

  if (!nif || !passwordMobilitat || !codiMO) {
    return NextResponse.json({ error: "Parámetros incompletos" }, { status: 400 });
  }

  try {
    const url = new URL("WSBovi/AppJava/Bovi/WSIdentificadorsDisponibles/", GTR_BASE);
    url.searchParams.set("nif", nif);
    url.searchParams.set("passwordMobilitat", passwordMobilitat);
    url.searchParams.set("codiMO", codiMO);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("GTR proxy error:", error);
    return NextResponse.json({ error: "Error de connexió amb GTR" }, { status: 503 });
  }
}