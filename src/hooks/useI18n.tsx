"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  TRANSLATIONS,
  DEFAULT_LANGUAGE,
  isLanguage,
  type Language,
} from "@/i18n/languages";

const LANG_KEY = "terrabit_lang";

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  return (
      (path.split(".").reduce((acc: unknown, key: string) => {
        if (acc && typeof acc === "object") {
          return (acc as Record<string, unknown>)[key];
        }
        return path;
      }, obj) as string) ?? path
  );
}

interface I18nContextProps {
  t: (key: string) => string;
  lang: Language;
  changeLanguage: (newLang: Language) => void;
}

const I18nContext = createContext<I18nContextProps | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>(DEFAULT_LANGUAGE);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(LANG_KEY);
    if (isLanguage(stored)) {
      setLang(stored);
    }
  }, []);

  const changeLanguage = useCallback((newLang: Language) => {
    setLang(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem(LANG_KEY, newLang);
    }
  }, []);

  const t = useCallback(
      (key: string): string =>
          getNestedValue(
              TRANSLATIONS[lang] as unknown as Record<string, unknown>,
              key,
          ),
      [lang],
  );

  return (
      <I18nContext.Provider value={{ t, lang, changeLanguage }}>
        {children}
      </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error("useI18n debe usarse dentro de un I18nProvider");
  }
  return context;
}