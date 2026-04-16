// Parsea la respuesta de cualquier endpoint GTR.
// Si hay error devuelve la descripcio exacta del servidor, sin mapeo local.

interface GtrApiResponse {
    codi?: string;
    descripcio?: string;
    errors?: Array<{ codi?: string; descripcio: string }>;
    [key: string]: unknown;
}

export function parseGtrResponse(data: GtrApiResponse): string | null {
    // Si la respuesta es HTML (404, 500 del servidor) no es un error GTR válido
    if (typeof data === "string" && (data as string).includes("<!DOCTYPE")) {
        return null; // se tratará como error de red
    }

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