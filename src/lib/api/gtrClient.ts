"use client";

/**
 * Cliente único navegador → proxy interno de Next (`/api/gtr/proxy`).
 *
 * REGLA DE SEGURIDAD (no negociable):
 *   Las credenciales (nif / password / passwordMobilitat) NUNCA viajan en la
 *   URL. Van siempre en el body de un POST. Así no acaban en el historial del
 *   navegador ni en logs de acceso de nuestro servidor.
 *
 * El salto proxy → GTR puede seguir usando query string porque ocurre solo en
 * el servidor (sin historial de navegador, con `fullUrl:false` y `secureLog`).
 * Eso es una limitación de la API upstream — ver docs/adr/0001-credenciales-no-en-url.md
 */

const PROXY_URL = "/api/gtr/proxy";

export interface GtrClientResult {
    ok: boolean;
    status: number;
    statusText: string;
    /** Cuerpo crudo, para que cada lib aplique su parseo a medida. */
    raw: string;
}

async function postToProxy(payload: Record<string, unknown>): Promise<GtrClientResult> {
    const response = await fetch(PROXY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    const raw = await response.text();
    return {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        raw,
    };
}

/**
 * Consulta de LECTURA. `params` (incluidas credenciales) viajan en el body.
 * El proxy hablará con la GTR mediante GET + query string.
 */
export async function gtrQuery(
    endpoint: string,
    params: Record<string, string>
): Promise<GtrClientResult> {
    return postToProxy({ gtrMethod: "GET", endpoint, query: params });
}

/**
 * ESCRITURA / mutación. `body` (incluidas credenciales) viajan en el body.
 * El proxy hablará con la GTR mediante PUT + body JSON.
 *
 * Aún no se usa: las escrituras siguen llamando al proxy con PUT directo
 * (legacy). Se migrarán a esta función en una segunda fase. Se deja definida
 * porque el contrato del proxy ya la soporta.
 */
export async function gtrMutation(
    endpoint: string,
    body: Record<string, unknown>
): Promise<GtrClientResult> {
    return postToProxy({ gtrMethod: "PUT", endpoint, body });
}