"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
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

interface I18nContextProps {
  t: (key: string) => string;
  lang: Language;
  changeLanguage: (newLang: Language) => void;
}

const I18nContext = createContext<I18nContextProps | undefined>(undefined);

// Este es el Proveedor que envolverá tu aplicación
export function I18nProvider({ children }: { children: ReactNode }) {
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

  return (
    <I18nContext.Provider value={{ t, lang, changeLanguage }}>
      {children}
    </I18nContext.Provider>
  );
}

// Este es el hook que usarás en tus componentes
export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error("useI18n debe usarse dentro de un I18nProvider");
  }
  return context;
}