import es from "./es.json";
import ca from "./ca.json";

/**
 * Registro central de idiomas soportados.
 *
 * Para añadir un nuevo idioma:
 *   1. Crear `src/i18n/<code>.json` con las mismas claves que `es.json`.
 *   2. Importarlo arriba y añadirlo a `TRANSLATIONS`.
 *   3. En cada JSON, añadir su entrada dentro del grupo `language`
 *      (el nombre del idioma escrito EN ese idioma — usado en el selector).
 *
 * El resto de la app (`useI18n`, `LanguageSwitcher`) se adapta automáticamente.
 */
export const TRANSLATIONS = { es, ca } as const;

export type Language = keyof typeof TRANSLATIONS;
export type Translations = (typeof TRANSLATIONS)[Language];

/** Lista de idiomas disponibles, derivada de TRANSLATIONS para evitar duplicación. */
export const AVAILABLE_LANGUAGES: readonly Language[] = Object.freeze(
    Object.keys(TRANSLATIONS) as Language[],
);

/** Idioma por defecto cuando no hay nada en localStorage. */
export const DEFAULT_LANGUAGE: Language = "ca";

/** Type guard seguro para validar strings externos (localStorage, query params, etc.). */
export function isLanguage(value: unknown): value is Language {
    return (
        typeof value === "string" &&
        (AVAILABLE_LANGUAGES as readonly string[]).includes(value)
    );
}