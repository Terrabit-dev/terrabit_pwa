"use client";

import { useDrawer } from "@/context/DrawerContext";
import { useI18n } from "@/hooks/useI18n";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

// Iconos a base de SVG(Para no perder calidad)

const IconGestion = () => (
    <svg className="w-8 h-8" viewBox="240 300 510 430" fill="currentColor">
      <path d="M333.6 320c-19.5 25-22.8 52.1-9.4 78.9 4.4 8.8 6.6 11.9 14 19.5 4.8 4.9 8.8 9.1 8.8 9.2 0 .2-1.5-.2-3.2-.7-18.4-5.4-47-9.8-68.4-10.6l-16.2-.6-.7 2.4c-.5 1.3-.8 10-.8 19.4-.1 20.4 1.6 30 7.4 42.4 7.6 16.3 25.6 30.2 43 33.1 7.9 1.4 18.6.5 33.7-2.6 4.1-.8 7.5-1.4 7.7-1.2.1.2 1.5 5.9 3 12.8 5.8 26.7 11.8 44.9 27.5 84 7.4 18.4 9.7 25.6 14 45 1.8 8 4.6 18 6.2 22.2 6.3 15.9 16.8 24.7 32.3 26.9 7 .9 8.2 1.5 13.7 5.9 28 22.6 61 22.2 88.9-1 4-3.3 5.6-4 12.4-4.9 14.3-2 24.2-9.5 30.7-23 1.7-3.5 4.6-13 6.5-21 6.1-25.5 8.4-33 18.6-58.6 14.3-36.1 17.9-47.3 24.8-78 1.2-5.5 2.3-10.1 2.3-10.2.1-.1 4.9.7 10.7 1.7 16.3 2.8 22.8 3.2 30.4 2 23.8-3.8 43.6-23.8 49.1-49.5 1.8-8.6 2.5-36.6 1-43.9l-.7-3.9-16.7.6c-21.3.8-40.6 3.7-63.9 9.6-4 1-7.3 1.6-7.3 1.4s2.7-2.9 6.1-6c11.4-10.6 19.5-24.4 23-39.1 4.8-19.8-.7-43.2-14.1-60-2.3-2.8-4.6-5-5-4.7-.5.3-1.2 0-1.6-.6-.4-.8-.3-.9.4-.5 1.7 1 1.5-.9-.2-2.3-1.2-1-1.6-.4-2.1 3.6-1.6 13.2-3.7 21.3-7.5 29-7 14.3-17.6 23.6-32.3 28.4l-6.8 2.2-8.2-2.6c-28-9.1-61.2-12.5-108.7-11.3-35.9.9-58.2 3.9-78.9 10.7-8.5 2.8-9.8 3-14 1.9-8.7-2.2-17.3-7.2-24.4-14.3-10.4-10.3-14.8-20.9-18.4-44.2l-.8-5z" />
    </svg>
);

const IconGuias = () => (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
    </svg>
);

const IconMaterial = () => (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96C5 16.1 6.1 17 7 17h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63H19c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0023.45 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
    </svg>
);

const IconListar = () => (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
    </svg>
);

interface SeccionCard {
  titleKey: string;
  subtitleKey: string;
  path: string;
  icon: React.ReactNode;
  variant: "orange" | "green";
}

const LANGUAGES = [
  { code: "es" as const, label: "Español" },
  { code: "ca" as const, label: "Català" },
];

export default function HomeBovinos() {
  const { toggle } = useDrawer();
  const { t, lang, changeLanguage } = useI18n();
  const router = useRouter();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const secciones: SeccionCard[] = [
    {
      titleKey:    "bovinos.listar",
      subtitleKey: "bovinos.listar_sub",
      path:        "/home/bovinos/listar",
      icon:        <IconListar />,
      variant:     "orange",
    },
    {
      titleKey:    "bovinos.gestion",
      subtitleKey: "bovinos.gestion_sub",
      path:        "/home/bovinos/gestion",
      icon:        <IconGestion />,
      variant:     "green",
    },
    {
      titleKey:    "bovinos.guias_movimientos",
      subtitleKey: "bovinos.guias_movimientos_sub",
      path:        "/home/bovinos/guias-movimientos",
      icon:        <IconGuias />,
      variant:     "orange",
    },
    {
      titleKey:    "bovinos.material",
      subtitleKey: "bovinos.material_sub",
      path:        "/home/bovinos/material-categoria",
      icon:        <IconMaterial />,
      variant:     "green",
    }
  ];

  return (
      <div className="min-h-screen bg-surface flex flex-col">
        {/* Header verde con bienvenida */}
        <div className="bg-main-green pt-4 pb-8 px-5">
          <div className="flex items-center justify-between mb-4">
            <button
                onClick={toggle}
                className="text-white p-1 -ml-1"
                aria-label="Menú"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
              </svg>
            </button>

            <div ref={langRef} className="relative mr-2">
              <button
                  onClick={() => setShowLangMenu((v) => !v)}
                  className="text-white p-1"
                  aria-label="Cambiar idioma"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2s.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2s.07-1.35.16-2h4.68c.09.65.16 1.32.16 2s-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2s-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"/>
                </svg>
              </button>

              {showLangMenu && (
                  <div className="absolute right-0 top-9 bg-card rounded-xl shadow-lg overflow-hidden z-50 min-w-[120px]">
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
          </div>

          <h1 className="text-white text-2xl font-bold mb-3">
            {t("nav.welcome")}
          </h1>

          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1.5">
            <svg
                className="w-4 h-4 text-white"
                fill="currentColor"
                viewBox="240 300 510 430"
            >
              <path d="M333.6 320c-19.5 25-22.8 52.1-9.4 78.9 4.4 8.8 6.6 11.9 14 19.5 4.8 4.9 8.8 9.1 8.8 9.2 0 .2-1.5-.2-3.2-.7-18.4-5.4-47-9.8-68.4-10.6l-16.2-.6-.7 2.4c-.5 1.3-.8 10-.8 19.4-.1 20.4 1.6 30 7.4 42.4 7.6 16.3 25.6 30.2 43 33.1 7.9 1.4 18.6.5 33.7-2.6 4.1-.8 7.5-1.4 7.7-1.2.1.2 1.5 5.9 3 12.8 5.8 26.7 11.8 44.9 27.5 84 7.4 18.4 9.7 25.6 14 45 1.8 8 4.6 18 6.2 22.2 6.3 15.9 16.8 24.7 32.3 26.9 7 .9 8.2 1.5 13.7 5.9 28 22.6 61 22.2 88.9-1 4-3.3 5.6-4 12.4-4.9 14.3-2 24.2-9.5 30.7-23 1.7-3.5 4.6-13 6.5-21 6.1-25.5 8.4-33 18.6-58.6 14.3-36.1 17.9-47.3 24.8-78 1.2-5.5 2.3-10.1 2.3-10.2.1-.1 4.9.7 10.7 1.7 16.3 2.8 22.8 3.2 30.4 2 23.8-3.8 43.6-23.8 49.1-49.5 1.8-8.6 2.5-36.6 1-43.9l-.7-3.9-16.7.6c-21.3.8-40.6 3.7-63.9 9.6-4 1-7.3 1.6-7.3 1.4s2.7-2.9 6.1-6c11.4-10.6 19.5-24.4 23-39.1 4.8-19.8-.7-43.2-14.1-60-2.3-2.8-4.6-5-5-4.7-.5.3-1.2 0-1.6-.6-.4-.8-.3-.9.4-.5 1.7 1 1.5-.9-.2-2.3-1.2-1-1.6-.4-2.1 3.6-1.6 13.2-3.7 21.3-7.5 29-7 14.3-17.6 23.6-32.3 28.4l-6.8 2.2-8.2-2.6c-28-9.1-61.2-12.5-108.7-11.3-35.9.9-58.2 3.9-78.9 10.7-8.5 2.8-9.8 3-14 1.9-8.7-2.2-17.3-7.2-24.4-14.3-10.4-10.3-14.8-20.9-18.4-44.2l-.8-5z" />
            </svg>
            <span className="text-white text-sm font-medium">{t("bovinos.title")}</span>
          </div>
        </div>

        {/* Tarjetas */}
        <div className="flex-1 px-4 -mt-3 pb-6 flex flex-col gap-3">
          <p className="text-dark-blue-grey text-base font-semibold mt-4 mb-1">
            Menú Principal
          </p>

          {secciones.map((seccion) => {
            const isOrange = seccion.variant === "orange";
            return (
                <button
                    key={seccion.path}
                    onClick={() => router.push(seccion.path)}
                    className="bg-card rounded-2xl p-5 shadow-sm flex items-center gap-4 active:scale-[0.98] transition-transform text-left w-full"
                >
                  <div
                      className={[
                        "p-4 rounded-2xl shrink-0 flex items-center justify-center",
                        isOrange
                            ? "bg-main-orange text-white"
                            : "bg-main-green text-white",
                      ].join(" ")}
                  >
                    {seccion.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-dark-blue-grey text-base font-semibold leading-snug">
                      {t(seccion.titleKey)}
                    </p>
                    <p className="text-blue-grey text-sm mt-0.5 leading-snug">
                      {t(seccion.subtitleKey)}
                    </p>
                  </div>

                  <svg
                      className="w-5 h-5 text-blue-grey shrink-0"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                  >
                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                  </svg>
                </button>
            );
          })}
        </div>
      </div>
  );
}