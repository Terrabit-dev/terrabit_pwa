"use client";

import TopBar from "@/components/layout/TopBar";
import { useDrawer } from "@/context/DrawerContext";
import { useI18n } from "@/hooks/useI18n";
import { useRouter } from "next/navigation";

interface AccionCard {
  titleKey: string;
  subtitleKey: string;
  path: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const IconList = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
  </svg>
);

const IconGestion = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 6h-2.18c.07-.44.18-.88.18-1.36C18 2.06 15.96 0 13.5 0c-1.3 0-2.48.54-3.33 1.41L9 3.5 7.83 1.41C6.98.54 5.8 0 4.5 0 2.04 0 0 2.06 0 4.64c0 .48.11.92.18 1.36H0v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2l.02-14H20zm-9 12H5v-2h6v2zm0-4H5v-2h6v2zm8 4h-6v-2h6v2zm0-4h-6v-2h6v2z"/>
  </svg>
);

const IconTruck = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zm-.5 1.5l1.96 2.5H17V9.5h2.5zM6 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm2.22-3c-.55-.61-1.33-1-2.22-1s-1.67.39-2.22 1H3V6h12v9H8.22zM18 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
  </svg>
);

const IconCart = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
    <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM5.82 6H21l-1.5 9H8.17L5.82 6zM3 2H1v2h2l3.6 7.59L5.25 14C5.09 14.3 5 14.65 5 15c0 1.1.9 2 2 2h14v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63H19c.75 0 1.41-.41 1.75-1.03L22 6.97A1 1 0 0021 5H5.21L4.27 3H3V2z"/>
  </svg>
);

export default function HomeBovinos() {
  const { toggle } = useDrawer();
  const { t } = useI18n();
  const router = useRouter();

  const acciones: AccionCard[] = [
    {
      titleKey: "bovinos.mis_bovinos",
      subtitleKey: "bovinos.mis_bovinos_sub",
      path: "/home/bovinos/listar",
      icon: <IconList />,
      color: "text-main-orange",
      bgColor: "bg-main-orange-bg",
    },
    {
      titleKey: "bovinos.gestion",
      subtitleKey: "bovinos.gestion_sub",
      path: "/home/bovinos/gestion",
      icon: <IconGestion />,
      color: "text-main-green",
      bgColor: "bg-main-green-bg",
    },
    {
      titleKey: "bovinos.guias_movimientos",
      subtitleKey: "bovinos.guias_movimientos_sub",
      path: "/home/bovinos/guias-movimientos",
      icon: <IconTruck />,
      color: "text-main-orange",
      bgColor: "bg-main-orange-bg",
    },
    {
      titleKey: "bovinos.material",
      subtitleKey: "bovinos.material_sub",
      path: "/home/bovinos/material",
      icon: <IconCart />,
      color: "text-main-green",
      bgColor: "bg-main-green-bg",
    },
  ];

  return (
    <div className="min-h-screen bg-surface">
      <TopBar title={t("bovinos.title")} onMenuClick={toggle} accentColor="green" />

      <div className="px-4 py-5">
        <div className="grid grid-cols-1 gap-3">
          {acciones.map((accion) => (
            <button
              key={accion.path}
              onClick={() => router.push(accion.path)}
              className="bg-white rounded-2xl px-4 py-4 shadow-sm flex items-center gap-4 active:scale-95 transition-transform text-left"
            >
              <div className={`${accion.bgColor} ${accion.color} p-3 rounded-xl shrink-0`}>
                {accion.icon}
              </div>
              <div className="flex-1">
                <p className="text-dark-blue-grey text-sm font-semibold leading-tight">
                  {t(accion.titleKey)}
                </p>
                <p className="text-slate-400 text-xs mt-0.5">
                  {t(accion.subtitleKey)}
                </p>
              </div>
              <svg className="w-4 h-4 text-slate-300 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/>
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
