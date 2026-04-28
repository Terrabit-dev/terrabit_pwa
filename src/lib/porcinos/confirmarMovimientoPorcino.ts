export interface ConfirmarMovimientoForm {
    moDesti: string;
    remo: string;
    codiAtes: string;
    nifConductor: string;
    matricula: string;
    nombreAnimals: string;
}

export function validarConfirmarMovimiento(form: ConfirmarMovimientoForm, lang: "es" | "ca"): string | null {
    if (!form.moDesti) return lang === "ca" ? "Falta la Marca Oficial Destí" : "Falta la Marca Oficial Destino";
    if (!form.remo) return lang === "ca" ? "Falta el codi REMO" : "Falta el código REMO";

    const num = Number(form.nombreAnimals);
    if (!form.nombreAnimals || isNaN(num) || num <= 0) {
        return lang === "ca" ? "Número d'animals invàlid" : "Número de animales inválido";
    }

    // Exigimos que se rellenen para evitar errores de la API
    if (!form.nifConductor.trim()) return lang === "ca" ? "El NIF del conductor és obligatori" : "El NIF del conductor es obligatorio";
    if (!form.matricula.trim()) return lang === "ca" ? "La matrícula és obligatòria" : "La matrícula es obligatoria";

    // Aunque codiAtes admite nulos en la BDD, recomendamos exigir al menos el string vacío controlado
    // Si la Generalitat lo requiere sí o sí, puedes descomentar la siguiente línea:
    // if (!form.codiAtes.trim()) return lang === "ca" ? "El codi ATES és obligatori" : "El código ATES es obligatorio";

    return null;
}