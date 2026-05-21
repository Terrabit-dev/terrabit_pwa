import { NextRequest, NextResponse } from "next/server";

const GTR_BASE_PROD = "https://aplicacions.agricultura.gencat.cat/gtr/";
const GTR_BASE_PREPROD = "https://preproduccio.aplicacions.agricultura.gencat.cat/gtr/";

export async function GET(request: NextRequest) {
  const env = request.cookies.get("terrabit_env")?.value || "prod";
  const GTR_BASE = env === "preprod" ? GTR_BASE_PREPROD : GTR_BASE_PROD;

  const { searchParams } = new URL(request.url);
  const nif        = searchParams.get("nif");
  const password   = searchParams.get("password");
  const explotacio = searchParams.get("explotacio");

  if (!nif || !password || !explotacio) {
    return NextResponse.json({ error: "Parámetros incompletos" }, { status: 400 });
  }

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
    console.error(`GTR listar bovinos error (${env.toUpperCase()}):`, error);
    return NextResponse.json({ error: "Error de connexió amb GTR" }, { status: 503 });
  }
}