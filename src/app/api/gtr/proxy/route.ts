import { NextRequest, NextResponse } from "next/server";

const GTR_BASE = "https://preproduccio.aplicacions.agricultura.gencat.cat/gtr/";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get("endpoint");

  if (!endpoint) {
    return NextResponse.json({ error: "Endpoint requerido" }, { status: 400 });
  }

  const forwardParams = new URLSearchParams(searchParams);
  forwardParams.delete("endpoint");

  try {
    const url = new URL(endpoint, GTR_BASE);
    forwardParams.forEach((value, key) => url.searchParams.set(key, value));

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

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get("endpoint");

  if (!endpoint) {
    return NextResponse.json({ error: "Endpoint requerido" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const url = new URL(endpoint, GTR_BASE);

    const response = await fetch(url.toString(), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("GTR proxy error:", error);
    return NextResponse.json({ error: "Error de connexió amb GTR" }, { status: 503 });
  }
}