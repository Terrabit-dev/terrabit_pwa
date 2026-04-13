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

const IconBirth = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>
  </svg>
);

const IconDeath = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2z"/>
  </svg>
);

const IconSex = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2a5 5 0 100 10A5 5 0 0012 2zm0 12c-5.33 0-8 2.67-8 4v2h16v-2c0-1.33-2.67-4-8-4z"/>
  </svg>
);

const IconGuides = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
    <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
  </svg>
);

const IconMovements = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 8l-4-4v3H4v2h12v3l4-4zm-8 9H4v-3l-4 4 4 4v-3h8v-2z"/>
  </svg>
);

const IconMaterial = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/>
  </svg>
);

const IconList = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
  </svg>
);

export default function HomeBovinos() {
  const { toggle } = useDrawer();
  const { t } = useI18n();
  const router = useRouter();

  const acciones: AccionCard[] = [
    {
      titleKey: "bovinos.nacimiento",
      subtitleKey: "bovinos.nacimiento_sub",
      path: "/home/bovinos/nacimiento",
      icon: <IconBirth />,
      color: "text-main-green",
      bgColor: "bg-main-green-bg",
    },
    {
      titleKey: "bovinos.fallecimiento",
      subtitleKey: "bovinos.fallecimiento_sub",
      path: "/home/bovinos/fallecimiento",
      icon: <IconDeath />,
      color: "text-error-red",
      bgColor: "bg-error-red-bg",
    },
    {
      titleKey: "bovinos.correccion_sexo",
      subtitleKey: "bovinos.correccion_sexo_sub",
      path: "/home/bovinos/correccion-sexo",
      icon: <IconSex />,
      color: "text-main-green",
      bgColor: "bg-main-green-bg",
    },
    {
      titleKey: "bovinos.guias",
      subtitleKey: "bovinos.guias_sub",
      path: "/home/bovinos/guias",
      icon: <IconGuides />,
      color: "text-main-green",
      bgColor: "bg-main-green-bg",
    },
    {
      titleKey: "bovinos.movimientos",
      subtitleKey: "bovinos.movimientos_sub",
      path: "/home/bovinos/movimientos",
      icon: <IconMovements />,
      color: "text-main-green",
      bgColor: "bg-main-green-bg",
    },
    {
      titleKey: "bovinos.material",
      subtitleKey: "bovinos.material_sub",
      path: "/home/bovinos/material",
      icon: <IconMaterial />,
      color: "text-main-green",
      bgColor: "bg-main-green-bg",
    },
    {
      titleKey: "bovinos.listar",
      subtitleKey: "bovinos.listar_sub",
      path: "/home/bovinos/listar",
      icon: <IconList />,
      color: "text-main-green",
      bgColor: "bg-main-green-bg",
    },
  ];

  return (
    <div className="min-h-screen bg-surface">
      <TopBar title={t("bovinos.title")} onMenuClick={toggle} accentColor="green" />

      <div className="px-4 py-5">
        <div className="grid grid-cols-2 gap-3">
          {acciones.map((accion) => (
            <button
              key={accion.path}
              onClick={() => router.push(accion.path)}
              className="bg-white rounded-2xl p-4 shadow-sm flex flex-col items-start gap-3 active:scale-95 transition-transform text-left"
            >
              <div className={`${accion.bgColor} ${accion.color} p-3 rounded-xl`}>
                {accion.icon}
              </div>
              <div>
                <p className="text-dark-blue-grey text-sm font-semibold leading-tight">
                  {t(accion.titleKey)}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}