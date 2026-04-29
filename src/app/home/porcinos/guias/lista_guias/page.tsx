"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TopBar from "@/components/layout/TopBar";
import { useDrawer } from "@/context/DrawerContext";
import { useI18n } from "@/hooks/useI18n";
import FormField from "@/components/forms/FormField";
import DateInputDMY from "@/components/forms/DateInputDMY";
import LoadingOverlay from "@/components/common/LoadingOverlay";
import AutocompleteInput from "@/components/forms/AutocompleteInput"; // NUEVO IMPORT
import { obtenerHistorialAutocomplete, eliminarValorAutocomplete } from "@/lib/storage/historial"; // NUEVO IMPORT
import { useListarGuiasPorcinos } from "@/hooks/useListarGuiasPorcinos";
import { apiFormatToDisplayFecha, apiFormatToDisplayHora, type GuiaPorcino } from "@/lib/porcinos/listarGuiasPorcinos";

const SESSION_KEY_GUIA_PORCINO = "guiaPorcinoSeleccionada";

export default function ListaGuiasPorcinosPage() {
    const { toggle }  = useDrawer();
    const { t, lang } = useI18n();
    const router      = useRouter();

    const {
        filtros, lista, cargando, consultaIniciada, error,
        onRegaChange, onFechaChange, validarPeticion, resetearConsulta, seleccionarGuia
    } = useListarGuiasPorcinos();

    const [fechaISO, setFechaISO] = useState("");
    const [horaStr, setHoraStr]   = useState("");
    const [sugRegas, setSugRegas] = useState<string[]>([]); // NUEVO ESTADO PARA SUGERENCIAS

    // Cargar sugerencias al montar
    useEffect(() => {
        const cargarSugerencias = async () => {
            const regas = await obtenerHistorialAutocomplete("porcinos_rega");
            setSugRegas(regas);
        };
        cargarSugerencias();
    }, []);

    // Sincroniza los inputs de fecha visuales si venimos con datos de la caché
    useEffect(() => {
        if (filtros.fechaDisplay) {
            const parts = filtros.fechaDisplay.split(" ");
            if (parts.length === 2) {
                const [d, m, y] = parts[0].split("/");
                /* eslint-disable react-hooks/set-state-in-effect */
                setFechaISO(`${y}-${m}-${d}`);
                setHoraStr(parts[1]);
                /* eslint-enable react-hooks/set-state-in-effect */
            }
        }
    }, [filtros.fechaDisplay]);

    const handleDeleteSugerenciaRega = async (valor: string) => {
        // 1. Lo borramos de la BD
        await eliminarValorAutocomplete("porcinos_rega", valor);
        // 2. Lo borramos visualmente de la lista actual para que desaparezca al instante
        setSugRegas(prev => prev.filter(s => s !== valor));
    };

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

    const handleBack = () => {
        if (consultaIniciada) {
            resetearConsulta();
        } else {
            router.back();
        }
    };

    const handleEditar = (guia: GuiaPorcino) => {
        seleccionarGuia(guia);
        if (typeof window !== "undefined") {
            sessionStorage.setItem(SESSION_KEY_GUIA_PORCINO, JSON.stringify(guia));
            sessionStorage.setItem("volverAListaPorcinos", "true");
        }
        router.push("/home/porcinos/guias/lista_guias/editar");
    };

    return (
        <div className="min-h-screen bg-surface pointer-events-auto">
            <TopBar
                title={lang === "ca" ? "Edició de Guies" : "Edición de Guías"}
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
                    sugRegas={sugRegas}
                    onDeleteSugerencia={handleDeleteSugerenciaRega}
                />
            )}

            {/* Resto del renderizado (Loading, Empty, Lista)... se queda igual */}
            {consultaIniciada && cargando && (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-12 h-12 rounded-full border-4 border-main-orange border-t-transparent animate-spin"/>
                    <p className="text-sm text-blue-grey">{t("common.loading")}</p>
                </div>
            )}

            {consultaIniciada && !cargando && lista.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 gap-3 px-4">
                    <svg className="w-12 h-12 text-blue-grey" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 3h.01"/>
                    </svg>
                    <p className="text-sm text-blue-grey">{lang === "ca" ? "No s'han trobat guies" : "No se han encontrado guías"}</p>
                    <button onClick={resetearConsulta} className="text-main-orange text-sm font-semibold">{lang === "ca" ? "Nova consulta" : "Nueva consulta"}</button>
                </div>
            )}

            {consultaIniciada && !cargando && lista.length > 0 && (
                <div className="px-4 py-4 flex flex-col gap-3 pb-8">
                    <p className="text-xs text-blue-grey pl-1">{lista.length} {lang === "ca" ? "guies trobades" : "guías encontradas"}</p>
                    {lista.map((guia, idx) => (
                        <GuiaPorcinoCard key={`${guia.remo}-${idx}`} guia={guia} lang={lang} onEditar={() => handleEditar(guia)} />
                    ))}
                </div>
            )}

            {cargando && !consultaIniciada && <LoadingOverlay mensaje={t("common.loading")}/>}
        </div>
    );
}

// ─── MiniFormulario ───────────────────────────────────────────────────────────
interface MiniFormularioProps {
    rega: string; fechaISO: string; horaStr: string; error: string | null;
    onRegaChange: (v: string) => void; onFechaChange: (v: string) => void;
    onHoraChange: (v: string) => void; onConsultar: () => void; lang: "es" | "ca";
    sugRegas: string[];
    onDeleteSugerencia: (val: string) => void;
}

function MiniFormulario({ rega, fechaISO, horaStr, error, onRegaChange, onFechaChange, onHoraChange, onConsultar, lang, sugRegas, onDeleteSugerencia }: MiniFormularioProps) {
    return (
        <div className="px-4 py-6">
            <div className="bg-card rounded-2xl shadow-sm p-5 flex flex-col gap-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-main-orange/10 flex items-center justify-center">
                        <svg className="w-5 h-5 text-main-orange" fill="currentColor" viewBox="0 0 24 24"><path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z"/></svg>
                    </div>
                    <h2 className="text-base font-bold text-dark-blue-grey">
                        {lang === "ca" ? "Consulta de Guies Porcines" : "Consulta de Guías Porcinas"}
                    </h2>
                </div>

                <div className="border-t border-surface-variant"/>

                {/* AQUÍ REEMPLAZAMOS EL FORMFIELD POR EL NUEVO AUTOCOMPLETE */}
                <AutocompleteInput
                    label={lang === "ca" ? "Codi REGA destí *" : "Código REGA destino *"}
                    value={rega}
                    onChange={(val) => onRegaChange(val.toUpperCase())}
                    suggestions={sugRegas}
                    onDeleteSuggestion={onDeleteSugerencia}
                    placeholder="ES..."
                />

                <div className="grid grid-cols-2 gap-3">
                    <FormField label={lang === "ca" ? "Data sortida *" : "Fecha salida *"}>
                        <DateInputDMY key={`fecha-${fechaISO}`} value={fechaISO} onChange={onFechaChange}/>
                    </FormField>
                    <FormField label={lang === "ca" ? "Hora sortida *" : "Hora salida *"}>
                        <input type="time" value={horaStr} onChange={(e) => onHoraChange(e.target.value)} className="w-full border border-surface-variant rounded-xl px-3 py-2.5 text-sm focus:border-main-orange"/>
                    </FormField>
                </div>

                {error && (
                    <div className="bg-error-red/10 rounded-lg p-3 flex items-start gap-2">
                        <svg className="w-4 h-4 text-error-red shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                        <p className="text-xs text-error-red flex-1 whitespace-pre-line">{error}</p>
                    </div>
                )}

                <button onClick={onConsultar} className="w-full bg-main-orange text-white rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2 shadow-sm">
                    {lang === "ca" ? "Cercar guies" : "Buscar guías"}
                </button>
            </div>
        </div>
    );
}

// ─── Card de guía ─────────────────────────────────────────────────────────────
function GuiaPorcinoCard({ guia, lang, onEditar }: { guia: GuiaPorcino; lang: "es" | "ca"; onEditar: () => void; }) {
    const fechaSalida = apiFormatToDisplayFecha(guia.dataSortida);
    const horaSalida = apiFormatToDisplayHora(guia.dataSortida);

    return (
        <div className="bg-card rounded-2xl shadow-sm p-4 flex flex-col gap-3 border border-transparent hover:border-main-orange/30 transition-colors">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="font-bold text-sm text-dark-blue-grey truncate">{guia.moOrigen}</span>
                    <svg className="w-4 h-4 text-main-orange shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                    <span className="font-bold text-sm text-dark-blue-grey truncate">{guia.moDesti}</span>
                </div>
                <button onClick={onEditar} className="w-9 h-9 rounded-lg bg-main-orange/10 text-main-orange flex items-center justify-center shrink-0 hover:bg-main-orange hover:text-white transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                </button>
            </div>

            <p className="font-mono text-xs text-blue-grey tracking-wider bg-surface w-fit px-2 py-0.5 rounded-md border border-surface-variant">REMO: {guia.remo}</p>

            <div className="border-t border-surface-variant mt-1"/>

            <div className="flex gap-6 mt-1">
                <div>
                    <p className="text-[10px] uppercase font-bold text-blue-grey/70 tracking-wider">{lang === "ca" ? "Data sortida" : "Fecha salida"}</p>
                    <p className="text-sm font-semibold text-dark-blue-grey mt-0.5">{fechaSalida} <span className="font-normal text-blue-grey text-xs ml-1">{horaSalida}</span></p>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
                <InfoChip label={`${guia.nombreAnimals} ${lang === "ca" ? "porcs" : "cerdos"}`} iconPath="M4.5 12a5.5 5.5 0 1111 0c0 3-2.5 5-5.5 8-3-3-5.5-5-5.5-8z" />
                <InfoChip label={guia.vehicle || (lang === "ca" ? "Sense matrícula" : "Sin matrícula")} iconPath="M3 7h18v10H3V7zm0 0l2-3h14l2 3" />
                {guia.responsable && <InfoChip label={guia.responsable} iconPath="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />}
            </div>
        </div>
    );
}

function InfoChip({ label, iconPath }: { label: string; iconPath: string }) {
    return (
        <div className="bg-orange-50 border border-orange-100/50 rounded-full px-2.5 py-1 flex items-center gap-1.5">
            <svg className="w-3 h-3 text-main-orange shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath}/></svg>
            <span className="text-[11px] text-main-orange font-medium truncate max-w-[140px]">{label}</span>
        </div>
    );
}