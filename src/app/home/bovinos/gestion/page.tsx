"use client";

import SubMenuPage, { SubMenuAction } from "@/components/layout/SubMenuPage";
import { useI18n } from "@/hooks/useI18n";

const IconPlus = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
  </svg>
);

const IconMinus = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 13H5v-2h14v2z"/>
  </svg>
);

const IconEdit = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
  </svg>
);

const IconTag = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58s1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41s-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/>
  </svg>
);

export default function GestionBovinosPage() {
  const { t } = useI18n();

  const actions: SubMenuAction[] = [
    {
      label: t("gestion.nacimiento"),
      path: "/home/bovinos/gestion/nacimiento",
      icon: <IconPlus />,
      variant: "primary",
    },
    {
      label: t("gestion.fallecimiento"),
      path: "/home/bovinos/gestion/fallecimiento",
      icon: <IconMinus />,
      variant: "danger",
    },
    {
      label: t("gestion.correccion_sexo"),
      path: "/home/bovinos/gestion/correccion-sexo",
      icon: <IconEdit />,
      variant: "primary",
    },
    {
      label: t("gestion.identificacion"),
      path: "/home/bovinos/gestion/identificacion",
      icon: <IconTag />,
      variant: "primary",
    },
  ];

  return (
    <SubMenuPage
      title={t("gestion.title")}
      subtitle={t("submenu.selecciona_accion")}
      accentColor="green"
      actions={actions}
    />
  );
}
