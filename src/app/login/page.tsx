"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";

const LANGUAGES = [
  { code: "es" as const, label: "Español" },
  { code: "ca" as const, label: "Català" },
];

export default function LoginPage() {
  const { t, lang, changeLanguage } = useI18n();
  const { state, login, loginOffline, savedForm } = useAuth();

  const [nif, setNif] = useState("");
  const [password, setPassword] = useState("");
  const [codiMO, setCodiMO] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (savedForm.rememberMe) {
      setNif(savedForm.nif);
      setPassword(savedForm.password);
      setCodiMO(savedForm.codiMO);
      setRememberMe(true);
    }
  }, [savedForm]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const errorMessage: Record<string, string> = {
    error_empty:       t("login.error_empty_fields"),
    error_credentials: t("login.error_invalid_credentials"),
    error_network:     t("common.error_network"),
  };

  const isLoading = state === "loading";

  return (
    <main className="min-h-screen bg-surface flex flex-col items-center justify-center px-5 py-10">

      {/* Selector de idioma con icono globo */}
      <div ref={langRef} className="absolute top-4 right-4">
        <button
            onClick={() => setShowLangMenu((v) => !v)}
            className="w-10 h-10 rounded-full bg-card shadow-sm flex items-center justify-center text-main-green hover:shadow-md transition-shadow"
            aria-label="Cambiar idioma"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2s.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2s.07-1.35.16-2h4.68c.09.65.16 1.32.16 2s-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2s-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"/>
          </svg>
        </button>

        {showLangMenu && (
            <div className="absolute right-0 top-12 bg-card rounded-xl shadow-lg overflow-hidden z-50 min-w-[140px]">
              {LANGUAGES.map((l) => (
                  <button
                      key={l.code}
                      onClick={() => {
                        changeLanguage(l.code);
                        setShowLangMenu(false);
                      }}
                      className={[
                        "w-full text-left px-4 py-3 text-sm transition-colors",
                        lang === l.code
                            ? "bg-main-green-bg text-main-green font-semibold"
                            : "text-dark-blue-grey hover:bg-surface",
                      ].join(" ")}
                  >
                    {l.label}
                  </button>
              ))}
            </div>
        )}
      </div>

      {/* Logo */}
      <div className="mb-6 flex flex-col items-center">
        <img
            src="/images/terrabit_prime_sin_letra.png"
            alt="Terrabit logo"
            className="w-24 h-24 object-contain mb-3"
        />
        <h1 className="text-3xl font-bold text-dark-blue-grey">Terrabit</h1>
        <p className="text-sm text-main-green font-medium mt-1">
          {lang === "es" ? "Gestión Ganadera Inteligente" : "Gestió Ramadera Intel·ligent"}
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-card rounded-2xl shadow-md px-6 py-7">
        <h2 className="text-lg font-bold text-dark-blue-grey mb-5">{t("login.title")}</h2>

        {/* NIF */}
        <div className="mb-4">
          <label className="text-xs font-semibold text-blue-grey uppercase tracking-wide mb-1 block">
            {t("login.nif")}
          </label>
          <div className="flex items-center border border-surface-variant rounded-xl px-3 py-2.5 gap-2 bg-surface focus-within:border-main-green transition-colors">
            <svg className="w-4 h-4 text-blue-grey shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 10a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 0114 0H3z"/>
            </svg>
            <input
              type="text"
              value={nif}
              onChange={(e) => setNif(e.target.value)}
              placeholder={lang === "es" ? "Tu Código Usuario" : "El teu Codi Usuari"}
              autoComplete="username"
              className="flex-1 text-sm bg-transparent outline-none text-dark-blue-grey placeholder-blue-grey/50"
            />
          </div>
        </div>

        {/* Contraseña */}
        <div className="mb-4">
          <label className="text-xs font-semibold text-blue-grey uppercase tracking-wide mb-1 block">
            {t("login.password")}
          </label>
          <div className="flex items-center border border-surface-variant rounded-xl px-3 py-2.5 gap-2 bg-surface focus-within:border-main-green transition-colors">
            <svg className="w-4 h-4 text-blue-grey shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
            </svg>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={lang === "es" ? "Tu contraseña" : "La teva contrasenya"}
              autoComplete="current-password"
              className="flex-1 text-sm bg-transparent outline-none text-dark-blue-grey placeholder-blue-grey/50"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-blue-grey">
              {showPassword ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 3C5 3 1.73 7.11 1 10c.73 2.89 4 7 9 7s8.27-4.11 9-7c-.73-2.89-4-7-9-7zm0 12a5 5 0 110-10 5 5 0 010 10zm0-8a3 3 0 100 6 3 3 0 000-6z"/>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.74-1.74A9.6 9.6 0 0019 10c-.73-2.89-4-7-9-7a9.44 9.44 0 00-4.74 1.26L3.28 2.22zm3.5 3.5L8.2 7.14A3 3 0 0113 10c0 .35-.06.68-.16 1l1.56 1.56A7.85 7.85 0 0017 10c-.9-2.7-3.57-5-7-5a7.55 7.55 0 00-3.22.72zM7 10a3 3 0 004.88 2.34l-4.22-4.22A2.98 2.98 0 007 10zm-4 0c.9 2.7 3.57 5 7 5a7.5 7.5 0 002.66-.49l-1.56-1.56A3 3 0 017.14 11.8L5.58 10.24A7.87 7.87 0 013 10z"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Código MO */}
        <div className="mb-4">
          <label className="text-xs font-semibold text-blue-grey uppercase tracking-wide mb-1 block">
            {t("login.codiMO")}
          </label>
          <div className="flex items-center border border-surface-variant rounded-xl px-3 py-2.5 gap-2 bg-surface focus-within:border-main-green transition-colors">
            <svg className="w-4 h-4 text-blue-grey shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM2 9v7a2 2 0 002 2h12a2 2 0 002-2V9H2zm5 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z"/>
            </svg>
            <input
              type="text"
              value={codiMO}
              onChange={(e) => setCodiMO(e.target.value)}
              placeholder={lang === "es" ? "Tu código MO" : "El teu codi MO"}
              className="flex-1 text-sm bg-transparent outline-none text-dark-blue-grey placeholder-blue-grey/50"
            />
          </div>
        </div>

        {/* Recordarme */}
        <div className="flex items-center justify-between mb-5">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 accent-main-green"
            />
            <span className="text-xs text-blue-grey">
              {lang === "es" ? "Recordarme" : "Recorda'm"}
            </span>
          </label>
          <a
            href="https://aplicacions.agricultura.gencat.cat/gtr/porci/AppJava/views/recuperarContrasenya.xhtml"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-main-green font-medium"
          >
            {lang === "es" ? "¿Olvidaste tu contraseña?" : "Has oblidat la teva contrasenya?"}
          </a>
        </div>

        {/* Error */}
        {errorMessage[state] && (
          <div className="mb-4 px-3 py-2 bg-error-red-bg rounded-lg">
            <p className="text-xs text-error-red text-center font-medium">
              {errorMessage[state]}
            </p>
          </div>
        )}

        {/* Acceder */}
        <button
          onClick={() => login(nif, password, codiMO, rememberMe)}
          disabled={isLoading}
          className="w-full bg-main-green text-white rounded-xl py-3 text-sm font-semibold disabled:opacity-50 transition-opacity mb-3 shadow-sm"
        >
          {isLoading ? t("common.loading") : t("login.btn_login")}
        </button>

      </div>

      {/* Footer */}
      <p className="mt-6 text-xs text-blue-grey text-center">
        © 2026 Terrabit.{" "}
        {lang === "es" ? "Gestión ganadera moderna y eficiente" : "Gestió ramadera moderna i eficient"}
      </p>
    </main>
  );
}