import { NextRequest, NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/security/rateLimit";

export async function GET(request: NextRequest) {
    // El GET solo informa si el demo está disponible. Es liviano, pero igualmente
    // limitamos para que nadie haga polling masivo.
    const limited = enforceRateLimit(request, {
        bucket: "demo-availability",
        max: 30,
        windowSec: 60,
    });
    if (limited) return limited;

    const available =
        !!process.env.DEMO_NIF &&
        !!process.env.DEMO_PASSWORD &&
        !!process.env.DEMO_CODI_MO;

    return NextResponse.json(
        { available },
        // No cachear para que cambios en env vars se reflejen al instante
        { headers: { "Cache-Control": "no-store" } }
    );
}

export async function POST(request: NextRequest) {
    // El POST expone las credenciales demo. Es el más sensible.
    // 10 usos por IP por hora basta para una demo legítima y bloquea
    // scraping automatizado.
    const limited = enforceRateLimit(request, {
        bucket: "demo-login",
        max: 100,
        windowSec: 3_600,
    });
    if (limited) return limited;

    const nif      = process.env.DEMO_NIF?.trim();
    const password = process.env.DEMO_PASSWORD?.trim();
    const codiMO   = process.env.DEMO_CODI_MO?.trim();

    if (!nif || !password || !codiMO) {
        return NextResponse.json(
            { error: "Demo credentials not configured" },
            { status: 503 }
        );
    }

    return NextResponse.json(
        { nif, password, codiMO },
        { headers: { "Cache-Control": "no-store" } }
    );
}