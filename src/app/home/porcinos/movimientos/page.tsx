"use client";

import SubMenuPage, { SubMenuAction } from "@/components/layout/SubMenuPage";
import { useI18n } from "@/hooks/useI18n";

const IconPlus = () => (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
);

const IconPencil = () => (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
    </svg>
);

export default function GuiasMovimientosPage() {
    // Extraemos 'lang' para forzar el re-renderizado cuando cambie el idioma y manejar fallbacks
    const { t, lang } = useI18n();

    const actions: SubMenuAction[] = [
        {
            label: t("movimientos_porcinos.confirmar"),
            path: "/home/porcinos/movimientos/lista_movimientos",
            icon: <IconPlus />,
            variant: "primary",
        }
    ];

    return (
        <SubMenuPage
            title={t("porcinos.movimientos_title")}
            subtitle={t("submenu.selecciona_accion")}
            accentColor="orange"
            actions={actions}
        />
    );
}