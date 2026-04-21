"use client";

import SubMenuPage, { SubMenuAction } from "@/components/layout/SubMenuPage";
import { useI18n } from "@/hooks/useI18n";

const IconCart = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
    <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM5.82 6H21l-1.5 9H8.17L5.82 6zM3 2H1v2h2l3.6 7.59L5.25 14C5.09 14.3 5 14.65 5 15c0 1.1.9 2 2 2h14v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63H19c.75 0 1.41-.41 1.75-1.03L22 6.97A1 1 0 0021 5H5.21L4.27 3H3V2z"/>
  </svg>
);

const IconDuplicate = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
  </svg>
);

export default function MaterialPage() {
  // Extraemos 'lang' para forzar el re-renderizado cuando cambie el idioma desde el TopBar
  const { t, lang } = useI18n();

  const actions: SubMenuAction[] = [
    {
      label: t("material.solicitar"),
      path: "/home/bovinos/material-categoria/solicitar",
      icon: <IconCart />,
      variant: "primary",
    },
    {
      label: t("material.duplicado"),
      path: "/home/bovinos/material-categoria/duplicado",
      icon: <IconDuplicate />,
      variant: "primary",
    },
  ];

  return (
    <SubMenuPage
      title={t("material.title")}
      subtitle={t("submenu.selecciona_accion")}
      accentColor="green"
      actions={actions}
    />
  );
}