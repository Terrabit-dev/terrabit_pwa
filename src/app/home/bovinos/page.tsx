"use client";

import TopBar from "@/components/layout/TopBar";
import { useDrawer } from "@/context/DrawerContext";
import { useI18n } from "@/hooks/useI18n";
import { useRouter } from "next/navigation";

const IconGestion = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
  </svg>
);

const IconGuias = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
    <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
  </svg>
);

const IconMaterial = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/>
  </svg>
);

const IconListar = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
  </svg>
);

interface SeccionCard {
  titleKey: string;
  subtitleKey: string;
  path: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

export default function HomeBovinos() {
  const { toggle } = useDrawer();
  const { t } = useI18n();
  const router = useRouter();

  const secciones: SeccionCard[] = [
    {
      titleKey:    "bovinos.listar",
      subtitleKey: "bovinos.listar_sub",
      path:        "/home/bovinos/listar",
      icon:        <IconListar />,
      color: "text-main-orange",
      bgColor: "bg-main-orange-bg",
    },
    {
      titleKey:    "bovinos.gestion",
      subtitleKey: "bovinos.gestion_sub",
      path:        "/home/bovinos/gestion",
      icon:        <IconGestion />,
      color: "text-main-green",
      bgColor: "bg-main-green-bg",
    },
    {
      titleKey:    "bovinos.guias_movimientos",
      subtitleKey: "bovinos.guias_movimientos_sub",
      path:        "/home/bovinos/guias-movimientos",
      icon:        <IconGuias />,
      color: "text-main-orange",
      bgColor: "bg-main-orange-bg",
    },
    {
      titleKey:    "bovinos.material",
      subtitleKey: "bovinos.material_sub",
      path:        "/home/bovinos/material-categoria",
      icon:        <IconMaterial />,
      color: "text-main-green",
      bgColor: "bg-main-green-bg",
    }
  ];

  return (
    <div className="min-h-screen bg-surface">
      <TopBar title={t("bovinos.title")} onMenuClick={toggle} accentColor="green" />

      <div className="px-4 py-5 flex flex-col gap-3">
        {secciones.map((seccion) => (
          <button
            key={seccion.path}
            onClick={() => router.push(seccion.path)}
            className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4 active:scale-95 transition-transform text-left w-full"
          >
            <div className={`${seccion.bgColor} ${seccion.color} p-3 rounded-xl shrink-0`}>
              {seccion.icon}
            </div>
            <div className="flex-1">
              <p className="text-dark-blue-grey text-sm font-semibold">{t(seccion.titleKey)}</p>
              <p className="text-blue-grey text-xs mt-0.5">{t(seccion.subtitleKey)}</p>
            </div>
            <svg className="w-5 h-5 text-blue-grey shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}