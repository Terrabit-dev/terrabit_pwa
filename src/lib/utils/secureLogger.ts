// Logger seguro — enmascara campos sensibles en producción
// Equivalente al safe logging implementado en el Android (no loguear NIF/password en release)

const IS_DEV = process.env.NODE_ENV === "development";

// Campos que NUNCA deben aparecer en logs en producción
const SENSITIVE_FIELDS = ["nif", "passwordMobilitat", "password", "nifConductor"];

function maskSensitiveData(data: unknown): unknown {
    if (!data || typeof data !== "object") return data;
    if (Array.isArray(data)) return data.map(maskSensitiveData);

    const masked: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
        if (SENSITIVE_FIELDS.includes(key)) {
            // Muestra solo los primeros 2 caracteres + asteriscos
            const str = String(value ?? "");
            masked[key] = str.length > 2 ? `${str.slice(0, 2)}${"*".repeat(str.length - 2)}` : "**";
        } else {
            masked[key] = maskSensitiveData(value);
        }
    }
    return masked;
}

export const secureLog = {
    group: (label: string) => {
        if (IS_DEV) console.group(label);
    },

    groupEnd: () => {
        if (IS_DEV) console.groupEnd();
    },

    // Log de request — siempre enmascara datos sensibles
    request: (endpoint: string, body: Record<string, unknown>) => {
        if (IS_DEV) {
            console.log("📤 Request body:", maskSensitiveData(body));
        }
        // En producción: no logueamos nada del body
    },

    // Log de respuesta HTTP
    status: (status: number, statusText: string) => {
        if (IS_DEV) {
            const icon = status >= 200 && status < 300 ? "✅" : "❌";
            console.log(`${icon} HTTP ${status} ${statusText}`);
        }
    },

    // Log de respuesta GTR — la descripción del servidor es segura de mostrar
    response: (data: { codi?: string; descripcio?: string; errors?: Array<{ codi?: string; descripcio: string }> }) => {
        if (!IS_DEV) return;
        if (data.errors && data.errors.length > 0) {
            console.warn("❌ GTR errors:", data.errors);
            data.errors.forEach(e => {
                console.warn(`   codi: ${e.codi} | descripcio: ${e.descripcio}`);
            });
        } else {
            console.log("✅ GTR response:", { codi: data.codi, descripcio: data.descripcio });
        }
    },

    error: (msg: string, err?: unknown) => {
        if (IS_DEV) console.error(`❌ ${msg}`, err ?? "");
    },

    info: (msg: string) => {
        if (IS_DEV) console.info(`ℹ️ ${msg}`);
    },
};