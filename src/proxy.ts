import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SENSITIVE_PARAMS = ["password", "passwordmobilitat", "contrasenya", "nif", "dni", "token"];

export function proxy(request: NextRequest) {
    if (process.env.NODE_ENV === "development") {
        const url = new URL(request.url);
        const hasSensitive = Array.from(url.searchParams.keys()).some((key) =>
            SENSITIVE_PARAMS.some((s) => key.toLowerCase().includes(s))
        );

        if (hasSensitive) {
            const sanitized = new URL(url);
            sanitized.searchParams.forEach((_, key) => {
                if (SENSITIVE_PARAMS.some((s) => key.toLowerCase().includes(s))) {
                    sanitized.searchParams.set(key, "***");
                }
            });
            console.log(`[SAFE] ${request.method} ${sanitized.pathname}${sanitized.search}`);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: "/api/:path*",
};