"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TopBar from "@/components/layout/TopBar";
import { useDrawer } from "@/context/DrawerContext";
import { useI18n } from "@/hooks/useI18n";
import FormField from "@/components/forms/FormField";
import DateInputDMY from "@/components/forms/DateInputDMY";
import LoadingOverlay from "@/components/common/LoadingOverlay";
import { useListarGuias } from "@/hooks/useListarGuias";
import {
    apiFormatToDisplayFecha,
    type Guia,
} from "@/lib/bovinos/listarGuias";

const SESSION_KEY_GUIA = "guiaSeleccionada";

export default function ListaGuiasPage() {
    const { toggle }  = useDrawer();
    const { t, lang } = useI18n();
    const router      = useRouter();

    const {
        filtros, lista, cargando, consultaIniciada, error,
        onRegaChange, onFechaChange, validarPeticion, resetearConsulta,
        seleccionarGuia,
    } = useListarGuias();

    // Estado local: fecha (YYYY-MM-DD) + hora (HH:mm) que combinamos en "dd/MM/yyyy HH:mm"
    const [fechaISO, setFechaISO] = useState("");
    const [horaStr, setHoraStr]   = useState("");

    useEffect(() => {
        if (!consultaIniciada) return;
        window.history.pushState({ consultaIniciada: true }, "");
        const handlePopState = () => resetearConsulta();
        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, [consultaIniciada, resetearConsulta]);

    const actualizarFecha = (fISO: string, h: string) => {
        if (fISO && h) {
            const [y, m, d] = fISO.split("-");
            onFechaChange(`${d}/${m}/${y} ${h}`);
        } else {
            onFechaChange("");
        }
    };

    const handleFechaChange = (v: string) => {
        setFechaISO(v);
        actualizarFecha(v, horaStr);
    };

    const handleHoraChange = (v: string) => {
        setHoraStr(v);
        actualizarFecha(fechaISO, v);
    };

    const handleConsultar = () => validarPeticion(lang);

    const handleEditar = (guia: Guia) => {
        seleccionarGuia(guia);
        if (typeof window !== "undefined") {
            sessionStorage.setItem(SESSION_KEY_GUIA, JSON.stringify(guia));
        }
        router.push("/home/bovinos/guias-movimientos/confirmar_guia");
    };

    return (
        <div className="min-h-screen bg-surface pointer-events-auto">
            <TopBar
                title={lang === "ca" ? "Llista Guies" : "Lista Guías"}
                onMenuClick={toggle}
                accentColor="orange"
                showBack
            />

            {!consultaIniciada && (
                <MiniFormulario
                    rega={filtros.codiRega}
                    fechaISO={fechaISO}
                    horaStr={horaStr}
                    error={error}
                    onRegaChange={onRegaChange}
                    onFechaChange={handleFechaChange}
                    onHoraChange={handleHoraChange}
                    onConsultar={handleConsultar}
                    lang={lang}
                />
            )}

            {consultaIniciada && cargando && (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-12 h-12 rounded-full border-4 border-main-orange border-t-transparent animate-spin"/>
                    <p className="text-sm text-blue-grey">
                        {lang === "ca" ? "Carregant guies..." : "Cargando guías..."}
                    </p>
                </div>
            )}

            {consultaIniciada && !cargando && lista.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 gap-3 px-4">
                    <svg className="w-12 h-12 text-blue-grey" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 3h.01"/>
                    </svg>
                    <p className="text-sm text-blue-grey">
                        {lang === "ca" ? "No s'han trobat resultats" : "No se encontraron resultados"}
                    </p>
                    <button
                        onClick={resetearConsulta}
                        className="text-main-orange text-sm font-semibold"
                    >
                        {lang === "ca" ? "Nova consulta" : "Nueva consulta"}
                    </button>
                </div>
            )}

            {consultaIniciada && !cargando && lista.length > 0 && (
                <div className="px-4 py-4 flex flex-col gap-3 pb-8">
                    <div className="flex items-center justify-between pl-1">
                        <p className="text-xs text-blue-grey">
                            {lista.length}{" "}
                            {lang === "ca"
                                ? (lista.length === 1 ? "guia trobada" : "guies trobades")
                                : (lista.length === 1 ? "guía encontrada" : "guías encontradas")}
                        </p>
                        <button
                            onClick={resetearConsulta}
                            className="text-main-orange text-xs font-semibold"
                        >
                            {lang === "ca" ? "Nova consulta" : "Nueva consulta"}
                        </button>
                    </div>
                    {lista.map((guia, idx) => (
                        <GuiaCard
                            key={`${guia.remo}-${idx}`}
                            guia={guia}
                            lang={lang}
                            onEditar={() => handleEditar(guia)}
                        />
                    ))}
                </div>
            )}

            {cargando && !consultaIniciada && <LoadingOverlay mensaje={t("common.loading")}/>}
        </div>
    );
}

// ─── MiniFormulario ───────────────────────────────────────────────────────────
interface MiniFormularioProps {
    rega:           string;
    fechaISO:       string;
    horaStr:        string;
    error:          string | null;
    onRegaChange:   (v: string) => void;
    onFechaChange:  (v: string) => void;
    onHoraChange:   (v: string) => void;
    onConsultar:    () => void;
    lang:           "es" | "ca";
}

function MiniFormulario({
                            rega, fechaISO, horaStr, error,
                            onRegaChange, onFechaChange, onHoraChange, onConsultar, lang,
                        }: MiniFormularioProps) {
    return (
        <div className="px-4 py-6">
            <div className="bg-card rounded-2xl shadow-sm p-5 flex flex-col gap-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-main-orange/10 flex items-center justify-center">
                        <svg className="w-5 h-5 text-main-orange" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z"/>
                        </svg>
                    </div>
                    <h2 className="text-base font-bold text-dark-blue-grey">
                        {lang === "ca" ? "Consulta de guies" : "Consulta de guías"}
                    </h2>
                </div>

                <div className="border-t border-surface-variant"/>

                <FormField label={lang === "ca" ? "Codi REGA" : "Código REGA"}>
                    <input
                        type="text"
                        value={rega}
                        onChange={(e) => onRegaChange(e.target.value)}
                        className="w-full border border-surface-variant rounded-xl px-3 py-2.5 text-sm bg-surface outline-none text-dark-blue-grey focus:border-main-orange"
                    />
                </FormField>

                <div className="grid grid-cols-2 gap-3">
                    <FormField label={lang === "ca" ? "Data sortida" : "Fecha salida"}>
                        <DateInputDMY
                            key={`fecha-${fechaISO || 'empty'}`}
                            value={fechaISO}
                            onChange={onFechaChange}
                        />
                    </FormField>
                    <FormField label={lang === "ca" ? "Hora sortida" : "Hora salida"}>
                        <input
                            type="time"
                            value={horaStr}
                            onChange={(e) => onHoraChange(e.target.value)}
                            className="w-full border border-surface-variant rounded-xl px-3 py-2.5 text-sm bg-surface outline-none text-dark-blue-grey focus:border-main-orange"
                        />
                    </FormField>
                </div>

                {error && (
                    <div className="bg-error-red/10 rounded-lg p-3 flex items-start gap-2">
                        <svg className="w-4 h-4 text-error-red shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                        </svg>
                        <p className="text-xs text-error-red flex-1 whitespace-pre-line">{error}</p>
                    </div>
                )}

                <button
                    onClick={onConsultar}
                    className="w-full bg-main-orange text-white rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                    {lang === "ca" ? "Consultar guies" : "Consultar guías"}
                </button>
            </div>
        </div>
    );
}

// ─── Card de guía ─────────────────────────────────────────────────────────────
interface GuiaCardProps {
    guia:      Guia;
    lang:      "es" | "ca";
    onEditar:  () => void;
}

function GuiaCard({ guia, lang, onEditar }: GuiaCardProps) {
    const fechaSalida  = apiFormatToDisplayFecha(guia.dataSortida)  || "--/--/----";
    const fechaLlegada = apiFormatToDisplayFecha(guia.dataArribada) || "--/--/----";

    return (
        <div className="bg-card rounded-2xl shadow-sm p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="font-bold text-sm text-dark-blue-grey truncate">
                        {guia.explotacioOrigen}
                    </span>
                    <svg className="w-4 h-4 text-main-orange shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M5 12h14M13 5l7 7-7 7"/>
                    </svg>
                    <span className="font-bold text-sm text-dark-blue-grey truncate">
                        {guia.explotacioDestinacio}
                    </span>
                </div>
                <button
                    onClick={onEditar}
                    className="w-9 h-9 rounded-lg bg-main-orange text-white flex items-center justify-center shrink-0"
                    aria-label={lang === "ca" ? "Editar" : "Editar"}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                </button>
            </div>

            <p className="font-mono text-xs text-blue-grey tracking-wider">{guia.remo}</p>

            <div className="border-t border-surface-variant"/>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-xs text-blue-grey">
                        {lang === "ca" ? "Data sortida" : "Fecha salida"}
                    </p>
                    <p className="text-sm font-medium text-dark-blue-grey">{fechaSalida}</p>
                </div>
                <div>
                    <p className="text-xs text-blue-grey">
                        {lang === "ca" ? "Data arribada" : "Fecha llegada"}
                    </p>
                    <p className="text-sm font-medium text-dark-blue-grey">{fechaLlegada}</p>
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                <InfoChip
                    label={`${guia.numeroAnimals} ${lang === "ca" ? "animals" : "animales"}`}
                    iconPath="M4.5 12a5.5 5.5 0 1111 0c0 3-2.5 5-5.5 8-3-3-5.5-5-5.5-8z"
                />
                <InfoChip
                    label={guia.matricula || (lang === "ca" ? "Sense matrícula" : "Sin matrícula")}
                    iconPath="M3 7h18v10H3V7zm0 0l2-3h14l2 3"
                />
                {guia.nifConductor && (
                    <InfoChip
                        label={guia.nifConductor}
                        iconPath="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                )}
            </div>
        </div>
    );
}

function InfoChip({ label, iconPath }: { label: string; iconPath: string }) {
    return (
        <div className="bg-surface rounded-full px-2.5 py-1 flex items-center gap-1.5">
            <svg className="w-3 h-3 text-main-orange shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath}/>
            </svg>
            <span className="text-[11px] text-blue-grey font-medium truncate max-w-36">{label}</span>
        </div>
    );
}