"use client";

import { useState, useRef, useEffect } from "react";
import { useI18n } from "@/hooks/useI18n";
import { AVAILABLE_LANGUAGES } from "@/i18n/languages";

type AccentColor = "green" | "orange" | "red";

interface LanguageSwitcherProps {
    /** "header" → icono blanco para barras coloreadas. "floating" → botón redondo con sombra. */
    variant?: "header" | "floating";
    /** Color de acento para el icono (variante floating) y la fila activa del menú. */
    accentColor?: AccentColor;
    /** className extra para el contenedor (ej. posicionamiento absoluto en el login). */
    className?: string;
}

const ACTIVE_TEXT: Record<AccentColor, string> = {
    green: "text-main-green",
    orange: "text-main-orange",
    red: "text-error-red",
};

const ACTIVE_BG: Record<AccentColor, string> = {
    green: "bg-main-green-bg",
    orange: "bg-main-orange-bg",
    red: "bg-error-red-bg",
};

const GLOBE_PATH =
    "M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2s.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2s.07-1.35.16-2h4.68c.09.65.16 1.32.16 2s-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2s-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z";

export default function LanguageSwitcher({
                                             variant = "header",
                                             accentColor = "green",
                                             className = "",
                                         }: LanguageSwitcherProps) {
    const { t, lang, changeLanguage } = useI18n();
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Cerrar también con Escape (UX accesible).
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open]);

    const isFloating = variant === "floating";

    const buttonCls = isFloating
        ? `w-10 h-10 rounded-full bg-card shadow-sm flex items-center justify-center ${ACTIVE_TEXT[accentColor]} hover:shadow-md transition-shadow`
        : "text-white p-1 rounded-lg hover:bg-white/10 transition-colors";

    const iconSize = isFloating ? "w-5 h-5" : "w-6 h-6";
    const menuTop = isFloating ? "top-12" : "top-10";
    const menuMin = isFloating ? "min-w-[140px]" : "min-w-[120px]";

    return (
        <div
            ref={containerRef}
            className={`${isFloating ? "absolute" : "relative"} shrink-0 ${className}`}
        >
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className={buttonCls}
                aria-label={t("language.change")}
                aria-haspopup="menu"
                aria-expanded={open}
            >
                <svg className={iconSize} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d={GLOBE_PATH} />
                </svg>
            </button>

            {open && (
                <div
                    role="menu"
                    className={`absolute right-0 ${menuTop} bg-card rounded-xl shadow-lg overflow-hidden z-50 ${menuMin}`}
                >
                    {AVAILABLE_LANGUAGES.map((code) => {
                        const isActive = lang === code;
                        return (
                            <button
                                key={code}
                                type="button"
                                role="menuitemradio"
                                aria-checked={isActive}
                                onClick={() => {
                                    changeLanguage(code);
                                    setOpen(false);
                                }}
                                className={[
                                    "w-full text-left px-4 py-3 text-sm transition-colors",
                                    isActive
                                        ? `${ACTIVE_BG[accentColor]} ${ACTIVE_TEXT[accentColor]} font-semibold`
                                        : "text-dark-blue-grey hover:bg-surface",
                                ].join(" ")}
                            >
                                {t(`language.${code}`)}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}