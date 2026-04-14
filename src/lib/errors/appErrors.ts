// Mapeo de código de error local → clave i18n
// Mismo esquema que alertsErrosScreens() del Android
// Para añadir un idioma nuevo: solo añadir el JSON en /i18n/, aquí no tocar nada.

const ERROR_KEYS: Record<number, string> = {
    0:  "errors.universal",
    1:  "errors.mother_id",
    2:  "errors.breeding_id",
    3:  "errors.birthdate",
    4:  "errors.sex",
    5:  "errors.breed",
    6:  "errors.aptitude",
    7:  "errors.death_type",
    8:  "errors.death_date",
    9:  "errors.gestation_months",
    10: "errors.latitude",
    11: "errors.longitude",
    12: "errors.animal_id",
    13: "errors.identification_date",
    14: "errors.remo_code",
    15: "errors.arrival_date",
    16: "errors.arrival_time",
    17: "errors.ates_code",
    18: "errors.destination_farm",
    19: "errors.arrival_status",
    20: "errors.origin_farm",
    21: "errors.temporal",
    22: "errors.exit_date",
    23: "errors.exit_time",
    24: "errors.mobility",
};

/**
 * Devuelve el mensaje de error de validación local usando el sistema i18n.
 * @param codigo  Código de error local (mismo esquema que alertsErrosScreens en Android)
 * @param t       Función t() del hook useI18n
 */
export function getAppError(codigo: number, t: (key: string) => string): string {
    const key = ERROR_KEYS[codigo] ?? "errors.universal";
    return t(key);
}