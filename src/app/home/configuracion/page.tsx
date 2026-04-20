"use client";

import TopBar from "@/components/layout/TopBar";
import { useDrawer } from "@/context/DrawerContext";
import { useI18n } from "@/hooks/useI18n";
import { useState } from "react";

// ─── Subcomponentes ───────────────────────────────────────────────────────────

function SectionLabel({ text }: { text: string }) {
    return (
        <p className="text-xs font-semibold text-blue-grey uppercase tracking-wide px-4 mb-2">
            {text}
        </p>
    );
}

function SettingCard({ children }: { children: React.ReactNode }) {
    return (
        <div className="mx-4 bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
            {children}
        </div>
    );
}

function SettingRow({
                        icon,
                        label,
                        sublabel,
                        right,
                        onClick,
                    }: {
    icon: React.ReactNode;
    label: string;
    sublabel?: string;
    right?: React.ReactNode;
    onClick?: () => void;
}) {
    return (
        <div
            className={`flex items-center gap-3 px-4 py-3 ${onClick ? "active:bg-surface transition-colors cursor-pointer" : ""}`}
            onClick={onClick}
        >
            <div className="w-10 h-10 rounded-full bg-main-green-bg flex items-center justify-center shrink-0">
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-dark-blue-grey">{label}</p>
                {sublabel && <p className="text-xs text-blue-grey">{sublabel}</p>}
            </div>
            {right && <div className="shrink-0">{right}</div>}
        </div>
    );
}

// ─── Iconos ───────────────────────────────────────────────────────────────────

function IconUser() {
    return (
        <svg className="w-5 h-5 text-main-green" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
        </svg>
    );
}

function IconPlus() {
    return (
        <svg className="w-5 h-5 text-main-green" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
        </svg>
    );
}

function IconSun() {
    return (
        <svg className="w-5 h-5 text-main-green" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z" />
        </svg>
    );
}

function IconChevron() {
    return (
        <svg className="w-4 h-4 text-blue-grey" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z" />
        </svg>
    );
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
    return (
        <button
            onClick={() => onChange(!value)}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                value ? "bg-main-green" : "bg-surface-variant"
            }`}
        >
      <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
              value ? "translate-x-6" : "translate-x-0"
          }`}
      />
        </button>
    );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function ConfiguracionPage() {
    const { toggle } = useDrawer();
    const { lang } = useI18n();

    const [temaOscuro, setTemaOscuro] = useState(false);

    const t = {
        title:          lang === "ca" ? "Configuració"              : "Configuración",
        usuario:        lang === "ca" ? "USUARI"                    : "USUARIO",
        nif:            "NIF",
        noDisponible:   lang === "ca" ? "No disponible"             : "No disponible",
        añadirSection:  lang === "ca" ? "Afegir explotació"         : "Añadir explotación",
        añadirLabel:    lang === "ca" ? "Afegir nova explotació"    : "Añadir nueva explotación",
        añadirSub:      lang === "ca" ? "Valida un codi GTR"        : "Valida un código de explotación GTR",
        apariencia:     lang === "ca" ? "APARENÇA"                  : "APARIENCIA",
        temaOscuro:     lang === "ca" ? "Tema fosc"                 : "Tema oscuro",
        activado:       lang === "ca" ? "Activat"                   : "Activado",
        desactivado:    lang === "ca" ? "Desactivat"                : "Desactivado",
    };

    return (
        <div className="min-h-screen bg-surface">
            <TopBar
                title={t.title}
                onMenuClick={toggle}
                accentColor="green"
                rightIcon="language"
            />

            <div className="pt-6">

                {/* Sección usuario */}
                <SectionLabel text={t.usuario} />
                <SettingCard>
                    <SettingRow
                        icon={<IconUser />}
                        label={t.nif}
                        sublabel={t.noDisponible}
                    />
                </SettingCard>

                {/* Sección explotación */}
                <SectionLabel text={t.añadirSection} />
                <SettingCard>
                    <SettingRow
                        icon={<IconPlus />}
                        label={t.añadirLabel}
                        sublabel={t.añadirSub}
                        right={<IconChevron />}
                        onClick={() => {
                            // TODO: navegar a la pantalla de añadir explotación
                        }}
                    />
                </SettingCard>

                {/* Sección apariencia */}
                <SectionLabel text={t.apariencia} />
                <SettingCard>
                    <SettingRow
                        icon={<IconSun />}
                        label={t.temaOscuro}
                        sublabel={temaOscuro ? t.activado : t.desactivado}
                        right={
                            <Toggle value={temaOscuro} onChange={setTemaOscuro} />
                        }
                    />
                </SettingCard>

            </div>
        </div>
    );
}