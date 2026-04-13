"use client";

import { useState, useEffect, useCallback } from "react";
import es from "@/i18n/es.json";
import ca from "@/i18n/ca.json";

type Language = "es" | "ca";
type Translations = typeof es;

const LANG_KEY = "terrabit_lang";

const translations: Record<Language, Translations> = { es, ca };

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  return path.split(".").reduce((acc: unknown, key: string) => {
    if (acc && typeof acc === "object") {
      return (acc as Record<string, unknown>)[key];
    }
    return path;
  }, obj) as string ?? path;
}

export function useI18n() {
  const [lang, setLang] = useState<Language>("es");

  useEffect(() => {
    const stored = localStorage.getItem(LANG_KEY) as Language | null;
    if (stored && (stored === "es" || stored === "ca")) {
      setLang(stored);
    }
  }, []);

  const changeLanguage = useCallback((newLang: Language) => {
    setLang(newLang);
    localStorage.setItem(LANG_KEY, newLang);
  }, []);

  const t = useCallback(
    (key: string): string => {
      return getNestedValue(
        translations[lang] as unknown as Record<string, unknown>,
        key
      );
    },
    [lang]
  );

  return { t, lang, changeLanguage };
}