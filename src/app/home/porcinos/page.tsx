"use client";

import { useDrawer } from "@/context/DrawerContext";
import { useI18n } from "@/hooks/useI18n";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

const IconTractor = () => (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 18c-1.66 0-3-1.34-3-3H3v-2.25c0-1.24.9-2.25 2-2.25h2.5L9 8h5v7h1.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5H19v-2h2v3h-1c0 1.66-1.34 3-3 3s-3-1.34-3-3H9.5c0 1.66-1.34 3-3 3zm0-4.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zm9 0c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zM14 9.5V13h-4.5l-1.5-3.5H14z"/>
    </svg>
);

const IconCart = () => (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96C5 16.1 6.1 17 7 17h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63H19c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0023.45 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
    </svg>
);

const IconPig = () => (
    <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.8 11.2c.4-.2.8-.5 1-.9V9c0-.6-.4-1-1-1h-.8A7 7 0 0 0 13 4.2V3c0-.6-.4-1-1-1s-1 .4-1 1v1.2A7 7 0 0 0 6.1 8H5c-.6 0-1 .4-1 1v2c0 .6.4 1 1 1h.1a7 7 0 0 0-.1 1v3c0 .6.4 1 1 1s1-.4 1-1v-1h8v1c0 .6.4 1 1 1s1-.4 1-1v-3c0-.3 0-.6-.1-.9h.8zM15 11c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm-6 0c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1z" />
        <circle cx="5" cy="5" r="1.5" />
        <circle cx="2" cy="8" r="1" />
    </svg>
);

interface SeccionCard {
    titleKey: string;
    subtitleKey: string;
    path: string;
    icon: React.ReactNode;
}

const LANGUAGES = [
    { code: "es" as const, label: "Español" },
    { code: "ca" as const, label: "Català" },
];

export default function HomePorcinos() {
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
            titleKey: "porcinos.guias_title",
            subtitleKey: "porcinos.guias_subtitle",
            path: "/home/porcinos/guias",
            icon: <IconTractor />,
        },
        {
            titleKey: "porcinos.movimientos_title",
            subtitleKey: "porcinos.movimientos_subtitle",
            path: "/home/porcinos/movimientos",
            icon: <IconCart />,
        }
    ];

    return (
        <div className="min-h-screen bg-surface flex flex-col">
            {/* Header naranja */}
            <div className="bg-main-orange pt-4 pb-8 px-5">
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
                                                ? "bg-main-orange-bg text-main-orange font-semibold"
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
                    {lang === "ca" ? "Benvingut/da!" : "¡Bienvenido/a!"}
                </h1>

                <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1.5">
                    <IconPig />
                    <span className="text-white text-sm font-medium">Porcinos</span>
                </div>
            </div>

            {/* Tarjetas */}
            <div className="flex-1 px-4 -mt-3 pb-6 flex flex-col gap-3">
                <p className="text-dark-blue-grey text-base font-semibold mt-4 mb-1">
                    {lang === "ca" ? "Menú Principal" : "Menú Principal"}
                </p>

                {secciones.map((seccion) => (
                    <button
                        key={seccion.path}
                        onClick={() => router.push(seccion.path)}
                        className="bg-card rounded-2xl p-5 shadow-sm flex items-center gap-4 active:scale-[0.98] transition-transform text-left w-full"
                    >
                        <div className="p-4 rounded-2xl shrink-0 flex items-center justify-center bg-main-orange text-white">
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
                ))}
            </div>
        </div>
    );
}