"use client";

import TopBar from "@/components/layout/TopBar";
import { useDrawer } from "@/context/DrawerContext";
import { useI18n } from "@/hooks/useI18n";
import { useState, useEffect } from "react";
import { getCredentials } from "@/lib/storage/credentials";
import { useAddMO } from "@/hooks/useAddMO";
import ErrorModal from "@/components/common/ErrorModal";
import SuccessModal from "@/components/common/SuccessModal";
import LoadingOverlay from "@/components/common/LoadingOverlay";

// ─── Subcomponentes ───────────────────────────────────────────────────────────
function SectionLabel({ text }: { text: string }) {
    return <p className="text-xs font-semibold text-blue-grey uppercase tracking-wide px-4 mb-2">{text}</p>;
}
function SettingCard({ children }: { children: React.ReactNode }) {
    return <div className="mx-4 bg-white rounded-2xl shadow-sm overflow-hidden mb-4">{children}</div>;
}
function SettingRow({ icon, label, sublabel, right, onClick }: { icon: React.ReactNode; label: string; sublabel?: string; right?: React.ReactNode; onClick?: () => void; }) {
    return (
        <div className={`flex items-center gap-3 px-4 py-3 ${onClick ? "active:bg-surface transition-colors cursor-pointer" : ""}`} onClick={onClick}>
            <div className="w-10 h-10 rounded-full bg-main-green-bg flex items-center justify-center shrink-0">{icon}</div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-dark-blue-grey">{label}</p>
                {sublabel && <p className="text-xs text-blue-grey">{sublabel}</p>}
            </div>
            {right && <div className="shrink-0">{right}</div>}
        </div>
    );
}

// ─── Iconos ───────────────────────────────────────────────────────────────────
function IconUser() { return <svg className="w-5 h-5 text-main-green" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" /></svg>; }
function IconPlus() { return <svg className="w-5 h-5 text-main-green" fill="currentColor" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>; }
function IconSun() { return <svg className="w-5 h-5 text-main-green" fill="currentColor" viewBox="0 0 24 24"><path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z" /></svg>; }
function IconChevron() { return <svg className="w-4 h-4 text-blue-grey" fill="currentColor" viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z" /></svg>; }

// ─── Toggle ───────────────────────────────────────────────────────────────────
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
    return (
        <button onClick={() => onChange(!value)} className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${value ? "bg-main-green" : "bg-surface-variant"}`}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${value ? "translate-x-6" : "translate-x-0"}`}/>
        </button>
    );
}

// ─── Página ───────────────────────────────────────────────────────────────────
export default function ConfiguracionPage() {
    const { toggle } = useDrawer();
    const { lang } = useI18n();

    const [temaOscuro, setTemaOscuro] = useState(false);
    const [nifUsuario, setNifUsuario] = useState<string>("...");

    // Estados del Modal
    const [showModalMO, setShowModalMO] = useState(false);
    const [inputMO, setInputMO] = useState("");

    const { cargando, error, exito, añadirYSeleccionarMO, reset } = useAddMO();

    useEffect(() => {
        const creds = getCredentials();
        if (creds) {
            /* eslint-disable react-hooks/set-state-in-effect */
            setNifUsuario(creds.nif);
            /* eslint-enable react-hooks/set-state-in-effect */
        }
    }, []);

    const handleOpenModal = () => {
        setInputMO("");
        reset();
        setShowModalMO(true);
    };

    const handleAñadir = () => {
        añadirYSeleccionarMO(inputMO, lang);
    };

    const handleSuccessClose = () => {
        setShowModalMO(false);
        reset();
        // Si queremos podemos forzar un recargo visual aquí, pero el EventListener (paso 2) se encargará
    };

    const t = {
        title:          lang === "ca" ? "Configuració"              : "Configuración",
        usuario:        lang === "ca" ? "USUARI"                    : "USUARIO",
        nif:            "NIF",
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
            <TopBar title={t.title} onMenuClick={toggle} accentColor="green" rightIcon="language" />

            <div className="pt-6">
                <SectionLabel text={t.usuario} />
                <SettingCard>
                    <SettingRow icon={<IconUser />} label={t.nif} sublabel={nifUsuario} />
                </SettingCard>

                <SectionLabel text={t.añadirSection} />
                <SettingCard>
                    <SettingRow icon={<IconPlus />} label={t.añadirLabel} sublabel={t.añadirSub} right={<IconChevron />} onClick={handleOpenModal} />
                </SettingCard>

                <SectionLabel text={t.apariencia} />
                <SettingCard>
                    <SettingRow icon={<IconSun />} label={t.temaOscuro} sublabel={temaOscuro ? t.activado : t.desactivado} right={<Toggle value={temaOscuro} onChange={setTemaOscuro} />} />
                </SettingCard>
            </div>

            {/* Modal para añadir MO */}
            {showModalMO && !exito && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl animate-scaleIn">
                        <div className="p-5 border-b border-surface-variant flex justify-between items-center bg-main-green/5">
                            <h3 className="font-bold text-dark-blue-grey">
                                {lang === "ca" ? "Afegir MO" : "Añadir MO"}
                            </h3>
                            <button onClick={() => setShowModalMO(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-variant text-blue-grey hover:bg-main-green hover:text-white transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-5">
                            <p className="text-sm text-blue-grey mb-4">
                                {lang === "ca" ? "Introdueix el codi de la nova explotació (ex: ES123...):" : "Introduce el código de la nueva explotación (ej: ES123...):"}
                            </p>
                            <input
                                type="text"
                                value={inputMO}
                                onChange={(e) => setInputMO(e.target.value.toUpperCase())}
                                className="w-full border-2 border-surface-variant rounded-xl px-4 py-3 text-sm uppercase focus:border-main-green outline-none font-mono"
                                placeholder="00XXAM"
                                autoFocus
                            />
                            <button
                                onClick={handleAñadir}
                                disabled={!inputMO.trim() || cargando}
                                className="w-full bg-main-green text-white rounded-xl py-3 text-sm font-semibold mt-5 disabled:opacity-40 transition-opacity"
                            >
                                {lang === "ca" ? "Validar i Afegir" : "Validar y Añadir"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {exito && (
                <SuccessModal
                    titulo={lang === "ca" ? "Explotació afegida" : "Explotación añadida"}
                    mensaje={lang === "ca" ? "L'explotació ha estat validada i guardada correctament." : "La explotación ha sido validada y guardada correctamente."}
                    boton="Acceptar"
                    onClose={handleSuccessClose}
                />
            )}

            {error && <ErrorModal mensaje={error} onClose={reset} lang={lang}/>}
            {cargando && <LoadingOverlay mensaje={lang === "ca" ? "Validant..." : "Validando..."}/>}
        </div>
    );
}