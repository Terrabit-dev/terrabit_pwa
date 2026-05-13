import { NextResponse } from "next/server";

export async function GET() {
    const available =
        !!process.env.DEMO_NIF &&
        !!process.env.DEMO_PASSWORD &&
        !!process.env.DEMO_CODI_MO;
    return NextResponse.json({ available });
}

export async function POST() {
    const nif      = process.env.DEMO_NIF?.trim();
    const password = process.env.DEMO_PASSWORD?.trim();
    const codiMO   = process.env.DEMO_CODI_MO?.trim();

    if (!nif || !password || !codiMO) {
        return NextResponse.json(
            { error: "Demo credentials not configured" },
            { status: 503 }
        );
    }

    return NextResponse.json({ nif, password, codiMO });
}