export interface EditarGuiaPorcinoForm {
    remo: string;
    categoria: string;
    nombreAnimals: string;
    dataSortida: string;   // Formato UI: YYYY-MM-DDTHH:mm
    dataArribada: string;  // Formato UI: YYYY-MM-DDTHH:mm
    transportista: string;
    responsable: string;
    vehicle: string;
}

// ─── Utilidades de Fechas ──────────────────────────────────────────────────────

// Pasa de la API "202507292200" al input de HTML "2025-07-29T22:00"
export function apiToDatetimeLocal(apiDate?: string | number): string {
    if (!apiDate) return "";
    const s = String(apiDate);
    if (s.length < 12) return "";
    return `${s.substring(0,4)}-${s.substring(4,6)}-${s.substring(6,8)}T${s.substring(8,10)}:${s.substring(10,12)}`;
}

// Pasa del input HTML "2025-07-29T22:00" a la API "202507292200"
export function datetimeLocalToApi(dtLocal: string): string {
    if (!dtLocal) return "";
    return dtLocal.replace(/[-T:]/g, "").substring(0, 12);
}

// ─── Validación ───────────────────────────────────────────────────────────────

export function validarEditarGuiaPorcino(form: EditarGuiaPorcinoForm, lang: string): string | null {
    if (!form.remo) return lang === "ca" ? "No hi ha REMO" : "No hay REMO";
    if (!form.categoria) return lang === "ca" ? "Categoria obligatòria" : "Categoría obligatoria";

    const num = Number(form.nombreAnimals);
    if (!form.nombreAnimals || isNaN(num) || num <= 0) return lang === "ca" ? "Número d'animals invàlid" : "Número de animales inválido";

    if (!form.dataSortida) return lang === "ca" ? "Data sortida obligatòria" : "Fecha salida obligatoria";
    if (!form.dataArribada) return lang === "ca" ? "Data arribada obligatòria" : "Fecha llegada obligatoria";

    // Validar que la fecha de llegada no sea anterior a la de salida
    const dSortida = new Date(form.dataSortida);
    const dArribada = new Date(form.dataArribada);
    if (dArribada < dSortida) {
        return lang === "ca" ? "La data d'arribada no pot ser anterior a la sortida" : "La fecha de llegada no puede ser anterior a la de salida";
    }

    // Comprobamos que no haya nulos/vacíos en los campos de transporte
    if (!form.transportista.trim()) return lang === "ca" ? "El transportista és obligatori" : "El transportista es obligatorio";
    if (!form.responsable.trim()) return lang === "ca" ? "El NIF del responsable és obligatori" : "El NIF del responsable es obligatorio";
    if (!form.vehicle.trim()) return lang === "ca" ? "La matrícula del vehicle és obligatòria" : "La matrícula del vehículo es obligatoria";

    return null;
}