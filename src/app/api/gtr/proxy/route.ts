import { NextRequest, NextResponse } from "next/server";
import { secureLog } from "@/lib/utils/secureLog";

const GTR_BASE = "https://preproduccio.aplicacions.agricultura.gencat.cat/gtr/";

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
      headers: { "Accept": "application/json", "Content-Type": "application/json" },
    });

    const data = await parseResponse(response);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    secureLog.error("GTR proxy GET error:", error);
    return NextResponse.json(
        { codi: "503", descripcio: "Error de connexió amb GTR" },
        { status: 503 }
    );
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
      headers: { "Accept": "application/json", "Content-Type": "application/json" },
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

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get("endpoint");

  if (!endpoint) {
    return NextResponse.json({ error: "Endpoint requerido" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const url = new URL(endpoint, GTR_BASE);

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: { "Accept": "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(body),
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