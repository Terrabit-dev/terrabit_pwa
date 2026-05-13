/**
 * Resultado tipado de la validación contra GTR.
 * Permite al hook distinguir entre:
 *  - credenciales rechazadas (invalid)
 *  - timeout de GTR (timeout)
 *  - error de red genérico (network)
 */
export type ValidateResult =
    | { kind: "valid" }
    | { kind: "invalid" }
    | { kind: "timeout" }
    | { kind: "network" };

export async function validateCredentials(
    nif: string,
    password: string,
    codiMO: string
): Promise<ValidateResult> {
  try {
    const response = await fetch(`/api/gtr/identificadors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nif, passwordMobilitat: password, codiMO }),
    });

    if (response.status === 504) return { kind: "timeout" };
    if (response.status === 502) return { kind: "network" };

    if (!response.ok) return { kind: "network" };

    const data = await response.json();
    return data.valid === true ? { kind: "valid" } : { kind: "invalid" };
  } catch {
    return { kind: "network" };
  }
}