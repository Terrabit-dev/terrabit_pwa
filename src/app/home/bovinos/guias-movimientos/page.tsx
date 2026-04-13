"use client";

import SubMenuPage, { SubMenuAction } from "@/components/layout/SubMenuPage";
import { useI18n } from "@/hooks/useI18n";

const IconAltaGuia = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
  </svg>
);

const IconConfirmar = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
  </svg>
);

const IconListaGuias = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
    <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
  </svg>
);

const IconListaMovimientos = () => (
  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2V3H9v2zm0 2h6v1H9V7zm-1 4h8v2H8v-2zm0 4h5v2H8v-2z"/>
  </svg>
);

export default function GuiasMovimientosPage() {
  const { t } = useI18n();

  const actions: SubMenuAction[] = [
    {
      label: t("guias.alta"),
      path: "/home/bovinos/guias-movimientos/alta-guia",
      icon: <IconAltaGuia />,
      variant: "primary",
    },
    {
      label: t("guias.confirmar_movimiento"),
      path: "/home/bovinos/guias-movimientos/confirmar-movimiento",
      icon: <IconConfirmar />,
      variant: "primary",
    },
    {
      label: t("guias.lista_guias"),
      path: "/home/bovinos/guias-movimientos/lista-guias",
      icon: <IconListaGuias />,
      variant: "primary",
    },
    {
      label: t("guias.lista_movimientos"),
      path: "/home/bovinos/guias-movimientos/lista-movimientos",
      icon: <IconListaMovimientos />,
      variant: "primary",
    },
  ];

  return (
    <SubMenuPage
      title={t("guias.title")}
      subtitle={t("submenu.selecciona_accion")}
      accentColor="orange"
      actions={actions}
    />
  );
}
