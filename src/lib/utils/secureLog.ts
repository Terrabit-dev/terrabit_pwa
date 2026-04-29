/**
 * Logger seguro que sanitiza credenciales y datos sensibles antes de imprimir.
 * Úsalo SIEMPRE en lugar de console.log/error en código que pueda recibir datos de usuario.
 */

const SENSITIVE_KEYS = [
    "password", "passwordmobilitat", "contrasenya", "contrasena",
    "nif", "dni", "nie",
    "token", "authorization", "auth",
    "apikey", "api_key", "secret",
    "session", "cookie",
];

const REDACTED = "***";

function isSensitiveKey(key: string): boolean {
    const lower = key.toLowerCase();
    return SENSITIVE_KEYS.some((s) => lower.includes(s));
}

function sanitizeUrl(input: string): string {
    try {
        const url = new URL(input, "http://localhost");
        let modified = false;
        url.searchParams.forEach((_, key) => {
            if (isSensitiveKey(key)) {
                url.searchParams.set(key, REDACTED);
                modified = true;
            }
        });
        if (!modified) return input;
        return input.startsWith("http") ? url.toString() : `${url.pathname}${url.search}`;
    } catch {
        return input;
    }
}

function sanitizeObject(obj: unknown): unknown {
    if (obj === null || typeof obj !== "object") return obj;
    if (Array.isArray(obj)) return obj.map(sanitizeObject);

    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
        if (isSensitiveKey(key)) {
            result[key] = REDACTED;
        } else if (typeof value === "object") {
            result[key] = sanitizeObject(value);
        } else if (typeof value === "string" && value.includes("=") && value.includes("&")) {
            result[key] = sanitizeUrl(value);
        } else {
            result[key] = value;
        }
    }
    return result;
}

function sanitizeArg(arg: unknown): unknown {
    if (typeof arg === "string") return sanitizeUrl(arg);
    if (typeof arg === "object" && arg !== null) return sanitizeObject(arg);
    return arg;
}


// Oculta las credenciales en los logs

export function maskPartial(value: string, visibleStart = 2, visibleEnd = 2): string {
    if (!value || value.length <= visibleStart + visibleEnd) return "***";
    const start = value.slice(0, visibleStart);
    const end = value.slice(-visibleEnd);
    return `${start}***${end}`;
}

export const secureLog = {
    info:  (...args: unknown[]) => console.log(...args.map(sanitizeArg)),
    warn:  (...args: unknown[]) => console.warn(...args.map(sanitizeArg)),
    error: (...args: unknown[]) => console.error(...args.map(sanitizeArg)),
};