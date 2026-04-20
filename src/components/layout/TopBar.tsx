"use client";

import { useI18n } from "@/hooks/useI18n";
import { useRouter } from "next/navigation";

type TopBarIcon = "history" | "inventory" | "check" | "info" | "warning";

interface TopBarProps {
    title: string;
    onMenuClick: () => void;
    accentColor?: "green" | "orange" | "red";
    showBack?: boolean;
    badge?: string;
    badgeIcon?: TopBarIcon;
}

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

export default function TopBar({
                                   title,
                                   onMenuClick,
                                   accentColor = "green",
                                   showBack = false,
                                   badge,
                                   badgeIcon,
                               }: TopBarProps) {
    const { lang, changeLanguage } = useI18n();
    const router = useRouter();

    const bgColor = ACCENT_BG[accentColor];
    const activeLangText = ACCENT_TEXT[accentColor];

    return (
        <header className={`${bgColor} px-4 pt-10 pb-4 shadow-md`}>
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
                            aria-label={lang === "ca" ? "Menú" : "Menú"}
                            className="text-white p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0"
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
                            </svg>
                        </button>
                    )}
                    <h1 className="text-white text-lg font-bold truncate">{title}</h1>
                </div>

                {/* Selector idioma */}
                <div className="flex gap-1 shrink-0">
                    {(["es", "ca"] as const).map((l) => (
                        <button
                            key={l}
                            onClick={() => changeLanguage(l)}
                            className={`text-xs px-2 py-1 rounded-full font-medium transition-colors ${
                                lang === l
                                    ? `bg-white ${activeLangText}`
                                    : "text-white/70 hover:text-white"
                            }`}
                        >
                            {l === "es" ? "ES" : "CA"}
                        </button>
                    ))}
                </div>
            </div>

            {/* Badge opcional (contador / estado) */}
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