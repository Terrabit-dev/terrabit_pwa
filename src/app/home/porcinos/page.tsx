"use client";

import { useDrawer } from "@/context/DrawerContext";
import { useI18n } from "@/hooks/useI18n";
import { useRouter } from "next/navigation";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";

const IconGuies = () => (
    <svg className="w-12 h-12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2V3H9v2zm0 2h6v1H9V7zm-1 4h8v2H8v-2zm0 4h5v2H8v-2z" />
    </svg>
);

const IconMoviments = () => (
    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
    </svg>
);

const IconPig = () => (
    <svg
        className="w-4 h-4 text-white"
        viewBox="170 220 690 615"
        fill="currentColor"
    >
        <path d="M180.5 222.2c-5 1.7-9.2 6.5-10.5 11.9-1.5 6.2-.3 12.5 5.6 28.3 8.9 23.9 11.1 36.2 12.4 69.6 1 26.9 2 35.5 5.5 50.5 5.3 22.4 14.8 42.3 29.5 61.5 18.4 24 35 33.5 58 33.3 11-.1 10.4.1 32.6-8.4 3.3-1.2 6.7-2 7.7-1.6 5.9 2.3 4.1 28.1-3.5 49.6-16.7 47-21.4 64.9-23.8 90.6-5.1 53.4 17.2 106.1 59.1 139.6 16.8 13.3 29.9 20.8 55.2 31.3 64.6 26.9 110.5 31.1 165.2 15 23.3-6.9 51.9-18.2 69-27.5 45.6-24.7 75-63.3 85-111.5 6.6-32.1 2.5-70.5-12-110.9-13-36.1-15.1-44-16.1-58-.8-10.9.6-17.2 3.9-18 1.4-.4 6.2 1 12.5 3.5 19.3 7.8 31.4 8.6 47.2 3.4 9.9-3.3 18-8.7 27.5-18.3 20-20.3 35.9-50.9 41.5-79.8 2-10.4 2.8-20.3 5-58.8 1-18.8 3.2-31.2 7.3-43 1.4-3.9 4.2-11.7 6.2-17.5 5.9-16.5 5.2-27.7-1.9-32.3-8-5.3-16.5-4.6-34.3 2.9-30.9 13-42.2 16.4-67.3 20.5-31.4 5-43.1 8.3-59 16.5-18.4 9.5-37.9 27.5-51.9 47.8-4.1 5.9-8.8 11.7-10.5 12.9-4.9 3.4-11.1 2.8-25-2.7-6.6-2.6-16.9-6.2-23.1-8.1-42.8-13-98.5-11.8-139.9 3-6.7 2.3-16.1 5.7-21 7.5-14.2 5.1-17.7 3.5-29.1-13.1-9.3-13.6-27.4-32.2-38.5-39.6-19.1-12.8-36.3-18.9-66.1-23.2-26.6-4-36.4-6.7-63.8-17.8-25.7-10.4-31.1-11.7-38.6-9.1m344.7 358.3c9 1.9 22 8 30.8 14.5 8.9 6.6 25.5 23.9 31.2 32.5 6.2 9.5 9.5 17.6 11.5 28.9 1.5 8.7 1.5 10.3.1 19-2.2 13.2-6.1 21.1-14.5 29.5-14.6 14.3-27.8 17.2-55.3 12.1-13.3-2.5-20.9-2.5-34.6.1-13.2 2.4-27.2 2.7-34.6.5-15.6-4.5-30-20.3-33.8-37.1-1.7-7.1-1.7-22-.1-28.5q4.95-20.25 24-40.2c25.3-26.6 49.4-36.6 75.3-31.3" />
        <path d="M473.5 635.8c-8.2 5.1-13.9 15.3-13.9 24.9-.2 14.1 10.9 18.4 21.2 8.4 8.6-8.3 10.8-27.2 3.9-32.9-2.7-2.3-7.9-2.5-11.2-.4m66.9.1c-11.1 6.8-3.3 34.1 10.8 38.3 11.4 3.4 17.4-10.1 11-24.5-3.5-7.9-12.1-15.7-17.4-15.7-.7 0-2.7.9-4.4 1.9" />
    </svg>
);

interface SeccionCard {
    titleKey: string;
    subtitleKey: string;
    path: string;
    icon: React.ReactNode;
}


export default function HomePorcinos() {
    const { toggle } = useDrawer();
    const { t, lang } = useI18n();
    const router = useRouter();


    const secciones: SeccionCard[] = [
        {
            titleKey:    "porcinos.guias_title",
            subtitleKey: "porcinos.guias_subtitle",
            path:        "/home/porcinos/guias",
            icon:        <IconGuies />,
        },
        {
            titleKey:    "porcinos.movimientos_title",
            subtitleKey: "porcinos.movimientos_subtitle",
            path:        "/home/porcinos/movimientos",
            icon:        <IconMoviments />,
        },
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
                            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
                        </svg>
                    </button>

                    <LanguageSwitcher variant="header" accentColor="orange" />

                </div>

                <h1 className="text-white text-2xl font-bold mb-3">
                    {t("nav.welcome")}
                </h1>

                <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1.5">
                    <IconPig />
                    <span className="text-white text-sm font-medium">
            {t("porcinos.title")}
          </span>
                </div>

            </div>

            {/* Tarjetas */}
            <div className="flex-1 px-4 -mt-3 pb-6 flex flex-col gap-4">
                <p className="text-dark-blue-grey text-lg font-semibold mt-4 mb-2">
                    {lang === "ca" ? "Menú Principal" : "Menú Principal"}
                </p>

                {secciones.map((seccion) => (
                    <button
                        key={seccion.path}
                        onClick={() => router.push(seccion.path)}
                        className="bg-card rounded-2xl p-6 shadow-sm flex items-center gap-5 active:scale-[0.98] transition-transform text-left w-full"
                    >
                        <div className="p-5 rounded-2xl shrink-0 flex items-center justify-center bg-main-orange text-white">
                            {seccion.icon}
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-dark-blue-grey text-lg font-semibold leading-snug">
                                {t(seccion.titleKey)}
                            </p>
                            <p className="text-blue-grey text-sm mt-1 leading-snug">
                                {t(seccion.subtitleKey)}
                            </p>
                        </div>

                        <svg
                            className="w-6 h-6 text-blue-grey shrink-0"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                        </svg>
                    </button>
                ))}
            </div>
        </div>
    );
}