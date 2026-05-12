import { NextResponse } from "next/server";

export async function GET() {
    const available =
        !!process.env.DEMO_NIF &&
        !!process.env.DEMO_PASSWORD &&
        !!process.env.DEMO_CODI_MO;
    return NextResponse.json({ available });
}

export async function POST(request: Request) {
    const nif      = process.env.DEMO_NIF?.trim();
    const password = process.env.DEMO_PASSWORD?.trim();
    const codiMO   = process.env.DEMO_CODI_MO?.trim();

    if (!nif || !password || !codiMO) {
        return NextResponse.json(
            { error: "Demo credentials not configured" },
            { status: 503 }
        );
    }

    // Construye la URL absoluta del propio servidor a partir del request entrante.
    // Sirve tanto en local (localhost:3000) como en Vercel sin variables de entorno.
    const url = new URL(request.url);
    const gtrUrl = `${url.protocol}//${url.host}/api/gtr/identificadors`;

    try {
        const gtrRes = await fetch(gtrUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nif, passwordMobilitat: password, codiMO }),
        });

        if (!gtrRes.ok) {
            return NextResponse.json(
                { error: `GTR responded with ${gtrRes.status}` },
                { status: 502 }
            );
        }

        const data = await gtrRes.json();

        if (data.valid !== true) {
            return NextResponse.json(
                { error: "Demo credentials rejected by GTR" },
                { status: 401 }
            );
        }

        return NextResponse.json({ nif, password, codiMO });
    } catch (err) {
        return NextResponse.json(
            { error: `Network error: ${String(err)}` },
            { status: 502 }
        );
    }
}