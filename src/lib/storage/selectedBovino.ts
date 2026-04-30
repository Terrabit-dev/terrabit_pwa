/**
 * selectedBovino.ts
 * Módulo compartido para pasar el identificador de un bovino seleccionado
 * desde la pantalla de listar a cualquier formulario de acción.
 * Patrón consume-once: se guarda antes de navegar y se lee+borra al montar el destino.
 */

export const SELECTED_BOVINO_KEY = "terrabit_selected_bovino_id" as const;

/**
 * Guarda el identificador del animal seleccionado en sessionStorage.
 * Llamar justo antes de navegar al formulario destino.
 */
export function setSelectedBovino(identificador: string): void {
    if (typeof window === "undefined") return;
    try {
        sessionStorage.setItem(SELECTED_BOVINO_KEY, identificador);
    } catch {
        // sessionStorage no disponible (modo privado restringido, etc.)
    }
}

/**
 * Lee y elimina el identificador guardado (consume-once).
 * Devuelve null si no había ninguno guardado.
 */
export function consumeSelectedBovino(): string | null {
    if (typeof window === "undefined") return null;
    try {
        const value = sessionStorage.getItem(SELECTED_BOVINO_KEY);
        if (value) sessionStorage.removeItem(SELECTED_BOVINO_KEY);
        return value;
    } catch {
        return null;
    }
}