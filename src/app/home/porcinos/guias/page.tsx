"use client";

import SubMenuPage, { SubMenuAction } from "@/components/layout/SubMenuPage";
import { useI18n } from "@/hooks/useI18n";

const IconPlus = () => (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </svg>
);

const IconPencil = () => (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
    </svg>
);

export default function GuiasPorcinosPage() {
    // Extraemos 'lang' para forzar el re-renderizado cuando cambie el idioma y manejar fallbacks
    const { t, lang } = useI18n();

    const actions: SubMenuAction[] = [
        {
            label: t("guias_porcinos.crear_guia"),
            path: "/home/porcinos/guias/creacion",
            icon: <IconPlus />,
            variant: "primary",
        },
        {
            label: t("guias_porcinos.editar_guia"),
            path: "/home/porcinos/guias/editar",
            icon: <IconPencil />,
            variant: "primary",
        },
    ];

    return (
        <SubMenuPage
            title={t("porcinos.guias_title")}
            subtitle={t("submenu.selecciona_accion")}
            accentColor="orange"
            actions={actions}
        />
    );
}