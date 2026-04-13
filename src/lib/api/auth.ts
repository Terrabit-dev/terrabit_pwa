export async function validateCredentials(
  nif: string,
  password: string,
  codiMO: string
): Promise<boolean> {
  try {
    const params = new URLSearchParams({ nif, passwordMobilitat: password, codiMO });
    const response = await fetch(`/api/gtr/identificadors?${params.toString()}`);

    if (!response.ok) throw new Error("network");

    const data = await response.json();

    // La GTR API devuelve errors:[] si hay error de credenciales
    if (data.errors && data.errors.length > 0) {
      return false;
    }

    return true;
  } catch {
    throw new Error("network");
  }
}