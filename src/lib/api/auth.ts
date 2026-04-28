export async function validateCredentials(
    nif: string,
    password: string,
    codiMO: string
): Promise<boolean> {
  try {
    const response = await fetch(`/api/gtr/identificadors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nif, passwordMobilitat: password, codiMO }),
    });

    if (!response.ok) throw new Error("network");

    const data = await response.json();

    if (data.errors && data.errors.length > 0) {
      return false;
    }

    return true;
  } catch {
    throw new Error("network");
  }
}