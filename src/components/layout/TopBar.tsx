"use client";

import { useI18n } from "@/hooks/useI18n";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import SelectorMO from "@/components/common/SelectorMO";

type TopBarIcon =
    | "history"
    | "inventory"
    | "check"
    | "info"
    | "warning"
    | "language"
    | "settings"
    | "search";

interface TopBarProps {
    title: string;
    onMenuClick: () => void;
    accentColor?: "green" | "orange" | "red";
    showBack?: boolean;
    badge?: string;
    badgeIcon?: TopBarIcon;
    rightIcon?: TopBarIcon;
    onRightIconClick?: () => void;
}

const LANGUAGES = [
    { code: "es" as const, label: "Español" },
    { code: "ca" as const, label: "Català" },
];

const ICON_PATHS: Record<TopBarIcon, string> = {
    history:
        "M13 3a9 9 0 1 0 8.94 10H19.9A7 7 0 1 1 13 5v4l5-5-5-5v4zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z",
    inventory:
        "M20 2H4c-1 0-2 .9-2 2v3.01c0 .72.43 1.34 1 1.69V20c0 1.1 1.1 2 2 2h14c.9 0 2-.9 2-2V8.7c.57-.35 1-.97 1-1.69V4c0-1.1-1-2-2-2zm-5 12H9v-2h6v2zm5-7H4V4h16v3z",
    check:
        "M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z",
    info:
        "M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z",
    warning:
        "M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z",
    language:
        "M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2s.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2s.07-1.35.16-2h4.68c.09.65.16 1.32.16 2s-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2s-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z",
    settings:
        "M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94 0 .31.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z",
    search:
        "M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34C15.28 5.61 12.67 3 9.5 3S3.72 5.61 3.22 8.41C2.86 10.71 3.72 12.94 5.5 14.73L5.23 15H3l6 6 6-6v-.79L15.5 14zM9.5 14C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z",
};

const ACCENT_BG: Record<NonNullable<TopBarProps["accentColor"]>, string> = {
    green: "bg-main-green",
    orange: "bg-main-orange",
    red: "bg-error-red",
};

const ACCENT_TEXT: Record<NonNullable<TopBarProps["accentColor"]>, string> = {
    green: "text-main-green",
    orange: "text-main-orange",
    red: "text-error-red",
};

const ACCENT_LIGHT_BG: Record<NonNullable<TopBarProps["accentColor"]>, string> = {
    green: "bg-main-green/10",
    orange: "bg-main-orange/10",
    red: "bg-error-red/10",
};

export default function TopBar({
                                   title,
                                   onMenuClick,
                                   accentColor = "green",
                                   showBack = false,
                                   badge,
                                   badgeIcon,
                                   rightIcon,
                                   onRightIconClick,
                               }: TopBarProps) {
    const { lang, changeLanguage } = useI18n();
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

    const bgColor = ACCENT_BG[accentColor];
    const activeLangText = ACCENT_TEXT[accentColor];
    const activeLangBg = ACCENT_LIGHT_BG[accentColor];

    return (
        <header className={`${bgColor} px-4 pt-10 pb-4 shadow-md z-30 relative`}>
            <div className="flex items-center justify-between gap-3">

                <div className="flex items-center gap-3 min-w-0">
                    {showBack ? (
                        <button
                            onClick={() => router.back()}
                            aria-label={lang === "ca" ? "Enrere" : "Atrás"}
                            className="text-white p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0"
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                            </svg>
                        </button>
                    ) : (
                        <button
                            onClick={onMenuClick}
                            aria-label="Menu"
                            className="text-white p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0"
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
                            </svg>
                        </button>
                    )}
                    <h1 className="text-white text-lg font-bold truncate">{title}</h1>
                </div>

                <div className="flex items-center gap-2 shrink-0">

                    <SelectorMO />

                    {rightIcon && rightIcon !== "language" ? (
                        <button
                            type="button"
                            onClick={onRightIconClick}
                            disabled={!onRightIconClick}
                            aria-label={rightIcon}
                            className="text-white p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0 disabled:cursor-default disabled:hover:bg-transparent"
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d={ICON_PATHS[rightIcon]} />
                            </svg>
                        </button>
                    ) : (
                        <div ref={langRef} className="relative shrink-0">
                            <button
                                onClick={() => setShowLangMenu((v) => !v)}
                                className="text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                                aria-label="Cambiar idioma"
                            >
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d={ICON_PATHS["language"]} />
                                </svg>
                            </button>

                            {showLangMenu && (
                                <div className="absolute right-0 top-10 bg-card rounded-xl shadow-lg overflow-hidden z-50 min-w-[120px]">
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
                                                    ? `${activeLangBg} ${activeLangText} font-semibold`
                                                    : "text-dark-blue-grey hover:bg-surface",
                                            ].join(" ")}
                                        >
                                            {l.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {badge && (
                <div className="mt-3 flex">
                    <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                        {badgeIcon && (
                            <svg
                                className="w-4 h-4 text-white shrink-0"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <path d={ICON_PATHS[badgeIcon]} />
                            </svg>
                        )}
                        <span className="text-white text-xs font-medium">{badge}</span>
                    </div>
                </div>
            )}
        </header>
    );
}