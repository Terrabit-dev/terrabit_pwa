import { NextRequest, NextResponse } from "next/server";
import { secureLog } from "@/lib/utils/secureLog";

/**
 * Rate limiter in-memory para API routes de Next.js.
 *
 * Algoritmo: Sliding Window Counter con expulsión LRU.
 *  - Para cada `key` (típicamente IP + ruta) mantenemos la lista de timestamps
 *    de los hits dentro de la ventana actual.
 *  - Si la cantidad de hits supera `max`, se rechaza con 429.
 *  - Si el Map crece por encima de MAX_BUCKETS, se purgan los más antiguos.
 *
 * Limitaciones (y por qué son aceptables aquí):
 *  - El estado vive en el proceso Node. Con 1 instancia PM2 (caso isard) basta.
 *  - Si en el futuro se escala a varias instancias o serverless (Vercel),
 *    hay que migrar a Upstash Redis. El API de este módulo está pensado para
 *    que esa migración sea drop-in (cambias solo la implementación de `hit`).
 *  - No persiste entre reinicios. Es el comportamiento deseado: tras un reinicio
 *    los buckets se vacían y los usuarios pueden volver a intentar.
 *
 * Por qué Sliding Window y no Token Bucket:
 *  - Más simple de razonar para defenderse de ataques de fuerza bruta.
 *  - Comportamiento más predecible: "X intentos en Y segundos".
 */

interface Bucket {
    hits: number[]; // timestamps en ms
    lastUsed: number;
}

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10_000;            // protege la memoria
const PURGE_INTERVAL_MS = 60_000;       // limpieza periódica
let lastPurge = Date.now();

function purgeIfNeeded(now: number) {
    if (now - lastPurge < PURGE_INTERVAL_MS && buckets.size < MAX_BUCKETS) return;

    // Purga 1: elimina buckets vacíos / expirados
    for (const [key, bucket] of buckets.entries()) {
        if (bucket.hits.length === 0 || now - bucket.lastUsed > 10 * PURGE_INTERVAL_MS) {
            buckets.delete(key);
        }
    }

    // Purga 2: si aún hay demasiados, expulsa los menos usados recientemente (LRU)
    if (buckets.size > MAX_BUCKETS) {
        const entries = [...buckets.entries()].sort((a, b) => a[1].lastUsed - b[1].lastUsed);
        const toRemove = entries.slice(0, buckets.size - MAX_BUCKETS);
        for (const [key] of toRemove) buckets.delete(key);
    }

    lastPurge = now;
}

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetInMs: number;
    retryAfterSec: number;
}

export interface RateLimitOptions {
    /** Identificador único del límite (ruta + tipo). Ej: "login", "demo", "proxy". */
    bucket: string;
    /** Máximo de hits permitidos dentro de la ventana. */
    max: number;
    /** Tamaño de la ventana en segundos. */
    windowSec: number;
}

/**
 * Registra un hit y devuelve si la petición está permitida.
 * `clientKey` debe ser estable (IP, idealmente combinada con la ruta).
 */
export function hit(clientKey: string, opts: RateLimitOptions): RateLimitResult {
    const now = Date.now();
    const windowMs = opts.windowSec * 1_000;
    const key = `${opts.bucket}:${clientKey}`;

    purgeIfNeeded(now);

    let bucket = buckets.get(key);
    if (!bucket) {
        bucket = { hits: [], lastUsed: now };
        buckets.set(key, bucket);
    }

    // Descarta hits fuera de la ventana
    bucket.hits = bucket.hits.filter((t) => now - t < windowMs);
    bucket.lastUsed = now;

    if (bucket.hits.length >= opts.max) {
        const oldestHit = bucket.hits[0];
        const resetInMs = windowMs - (now - oldestHit);
        return {
            allowed: false,
            remaining: 0,
            resetInMs,
            retryAfterSec: Math.ceil(resetInMs / 1_000),
        };
    }

    bucket.hits.push(now);
    return {
        allowed: true,
        remaining: opts.max - bucket.hits.length,
        resetInMs: windowMs,
        retryAfterSec: 0,
    };
}

/**
 * Extrae una IP estable del request, soportando el caso de Next.js detrás de
 * proxy/reverse proxy (Vercel, isard con nginx, Cloudflare, etc).
 *
 * Prioridad:
 *  1. `cf-connecting-ip` (Cloudflare)
 *  2. `x-real-ip` (nginx)
 *  3. Primer valor de `x-forwarded-for`
 *  4. Fallback: "unknown" (mejor que crashear; igualmente se rate-limita).
 *
 * Seguridad: nunca confíes en x-forwarded-for sin un proxy de confianza
 * delante. En isard hay nginx propio del ITB, así que el primer valor del
 * header es válido. En Vercel, el header lo pone su edge.
 */
export function getClientIp(request: NextRequest): string {
    const cf = request.headers.get("cf-connecting-ip");
    if (cf) return cf.trim();

    const real = request.headers.get("x-real-ip");
    if (real) return real.trim();

    const fwd = request.headers.get("x-forwarded-for");
    if (fwd) {
        const first = fwd.split(",")[0]?.trim();
        if (first) return first;
    }
    return "unknown";
}

/**
 * Helper de alto nivel: valida y, si excede, devuelve directamente una
 * NextResponse 429 con cabeceras estándar. Si pasa, devuelve `null` y la
 * ruta sigue su flujo normal.
 *
 * Uso:
 *   const limited = enforceRateLimit(request, { bucket: "login", max: 5, windowSec: 60 });
 *   if (limited) return limited;
 *   // ... resto del handler
 */
export function enforceRateLimit(
    request: NextRequest,
    opts: RateLimitOptions
): NextResponse | null {
    const ip = getClientIp(request);
    const result = hit(ip, opts);

    if (!result.allowed) {
        secureLog.warn(
            `[RATE_LIMIT] Bloqueado bucket=${opts.bucket} ip=${ip} retryAfter=${result.retryAfterSec}s`
        );
        return NextResponse.json(
            {
                error: "Too many requests",
                retryAfter: result.retryAfterSec,
            },
            {
                status: 429,
                headers: {
                    "Retry-After": String(result.retryAfterSec),
                    "X-RateLimit-Limit": String(opts.max),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": String(Math.ceil((Date.now() + result.resetInMs) / 1000)),
                },
            }
        );
    }

    return null;
}