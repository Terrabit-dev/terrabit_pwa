// Parsea la respuesta de cualquier endpoint GTR.
// Si hay error devuelve la descripcio exacta del servidor, sin mapeo local.

interface GtrApiResponse {
    codi?: string;
    descripcio?: string;
    errors?: Array<{ codi?: string; descripcio: string }>;
    [key: string]: unknown;
}

export function parseGtrResponse(data: GtrApiResponse): string | null {
    if (data.errors && data.errors.length > 0) {
        return data.errors[0].descripcio;
    }

    const esExito =
        data.codi === "0" ||
        data.descripcio === "OK" ||
        data.descripcio === "correcte";

    if (!esExito && data.descripcio) {
        return data.descripcio;
    }

    return null;
}