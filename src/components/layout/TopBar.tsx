"use client";

import { useI18n } from "@/hooks/useI18n";
import { useRouter } from "next/navigation";

interface TopBarProps {
  title: string;
  onMenuClick: () => void;
  accentColor?: "green" | "orange" |"red";
  showBack?: boolean;
}

export default function TopBar({
  title,
  onMenuClick,
  accentColor = "green",
  showBack = false,
}: TopBarProps) {
  const { lang, changeLanguage } = useI18n();
  const router = useRouter();
    const bgColor =
        accentColor === "green"  ? "bg-main-green"  :
            accentColor === "red"    ? "bg-error-red"   :
                "bg-main-orange";
  return (
    <header className={`${bgColor} px-4 pt-10 pb-4 flex items-center justify-between shadow-md`}>
      <div className="flex items-center gap-3">
        {showBack ? (
          <button
            onClick={() => router.back()}
            className="text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
          </button>
        ) : (
          <button
            onClick={onMenuClick}
            className="text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
            </svg>
          </button>
        )}
        <h1 className="text-white text-lg font-bold">{title}</h1>
      </div>

      {/* Selector idioma */}
      <div className="flex gap-1">
        {(["es", "ca"] as const).map((l) => (
          <button
            key={l}
            onClick={() => changeLanguage(l)}
            className={`text-xs px-2 py-1 rounded-full font-medium transition-colors ${
              lang === l
                ? "bg-white text-main-green"
                : "text-white/70 hover:text-white"
            }`}
          >
            {l === "es" ? "ES" : "CA"}
          </button>
        ))}
      </div>
    </header>
  );
}