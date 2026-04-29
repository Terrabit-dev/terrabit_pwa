"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TopBar from "@/components/layout/TopBar";
import { useDrawer } from "@/context/DrawerContext";
import { useI18n } from "@/hooks/useI18n";
import { obtenerHistorial, eliminarHistorialMultiple, type HistorialEntry } from "@/lib/storage/historial";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function obtenerRutaFormulario(tipo: string): string {
    switch (tipo) {
        case "IDENTIFICACION":                 return "/home/bovinos/gestion/identificacion_aplazada";
        case "NACIMIENTO":                     return "/home/bovinos/gestion/nacimiento";
        case "CORRECCION_SEXO":                return "/home/bovinos/gestion/correccion_sexo";
        case "FALLECIMIENTO":                  return "/home/bovinos/gestion/fallecimiento";
        case "SOLICITUD_MATERIAL":             return "/home/bovinos/material-categoria/solicitar";
        case "SOLICITUD_DUPLICADO":            return "/home/bovinos/material-categoria/duplicado";
        case "ALTA_GUIA_BOVINO":               return "/home/bovinos/guias-movimientos/alta_guia";
        case "CONFIRMAR_GUIA":                 return "/home/bovinos/guias-movimientos/confirmar_guia";
        case "CONFIRMAR_MOVIMIENTO":           return "/home/bovinos/guias-movimientos/confirmar_movimiento";
        case "ALTA_GUIA_PORCINO":              return "/home/porcinos/guias/creacion";
        case "EMISION_GUIA_PORCINO":           return "/home/porcinos/guias/lista_guias/editar";
        case "CONFIRMACION_MOVIMIENTO_PORCINO": return "/home/porcinos/movimientos/lista_movimientos/confirmar";
        default:                               return "/home";
    }
}

function obtenerEtiquetaTipo(tipo: string, lang: string): string {
    const ca = lang === "ca";
    switch (tipo) {
        case "NACIMIENTO":                      return ca ? "Naixement"                   : "Nacimiento";
        case "IDENTIFICACION":                  return ca ? "Identificació"               : "Identificación";
        case "CORRECCION_SEXO":                 return ca ? "Correcció de sexe"           : "Corrección de sexo";
        case "FALLECIMIENTO":                   return ca ? "Defunció"                    : "Fallecimiento";
        case "SOLICITUD_MATERIAL":              return ca ? "Sol·licitud de material"     : "Solicitud de material";
        case "SOLICITUD_DUPLICADO":             return ca ? "Sol·licitud de duplicat"     : "Solicitud de duplicado";
        case "ALTA_GUIA_BOVINO":                return ca ? "Alta de guia bovina"         : "Alta de guía bovina";
        case "CONFIRMAR_GUIA":                  return ca ? "Confirmar guia"              : "Confirmar guía";
        case "CONFIRMAR_MOVIMIENTO":            return ca ? "Confirmar moviment"          : "Confirmar movimiento";
        case "ALTA_GUIA_PORCINO":               return ca ? "Alta de guia porcina"        : "Alta de guía porcina";
        case "EMISION_GUIA_PORCINO":            return ca ? "Emissió de guia porcina"     : "Emisión de guía porcina";
        case "CONFIRMACION_MOVIMIENTO_PORCINO": return ca ? "Confirmació moviment porcí"  : "Confirmación movimiento porcino";
        default:                                return tipo.replace(/_/g, " ");
    }
}

function filtrar(lista: HistorialEntry[], busqueda: string, lang: string): HistorialEntry[] {
    if (!busqueda.trim()) return lista;
    const q = busqueda.toLowerCase();
    return lista.filter((r) =>
        (r.resumen && r.resumen.toLowerCase().includes(q)) ||
        obtenerEtiquetaTipo(r.tipo, lang).toLowerCase().includes(q)
    );
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function HistorialPage() {
    const { toggle } = useDrawer();
    const { lang } = useI18n();
    const router = useRouter();

    const [lista, setLista] = useState<HistorialEntry[]>([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [busqueda, setBusqueda] = useState("");

    const [isEditing, setIsEditing] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    const listaFiltrada = filtrar(lista, busqueda, lang);

    async function cargarHistorial() {
        setCargando(true);
        setError(null);
        try {
            const res = await obtenerHistorial();
            setLista(res);
            setIsEditing(false);
            setSelectedIds(new Set());
        } catch (e) {
            setError(e instanceof Error ? e.message : "Error al cargar el historial");
        } finally {
            setCargando(false);
        }
    }

    useEffect(() => {
        cargarHistorial();
    }, []);

    const toggleEdit = () => {
        setIsEditing(!isEditing);
        setSelectedIds(new Set());
    };

    const toggleSelection = (id: number) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === listaFiltrada.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(listaFiltrada.map(r => r.id!)));
        }
    };

    const handleEliminarMultiples = async () => {
        if (selectedIds.size === 0) return;
        const confirmar = confirm(lang === "ca"
            ? `Segur que vols esborrar ${selectedIds.size} registres de l'historial?`
            : `¿Seguro que quieres borrar ${selectedIds.size} registros del historial?`);

        if (confirmar) {
            setCargando(true);
            await eliminarHistorialMultiple(Array.from(selectedIds));
            await cargarHistorial();
        }
    };

    const handleVerDetalle = (registro: HistorialEntry) => {
        if (isEditing) {
            toggleSelection(registro.id!);
            return;
        }
        const ruta = obtenerRutaFormulario(registro.tipo);
        router.push(`${ruta}?historyId=${registro.id}`);
    };

    return (
        <div className="min-h-screen bg-surface pb-24">
            <TopBar
                title={lang === "ca" ? "Historial" : "Historial"}
                onMenuClick={toggle}
                accentColor="green"
                badge={`${listaFiltrada.length} ${lang === "ca" ? "registres" : "registros"}`}
                badgeIcon="history"
            />

            {/* Buscador */}
            <div className="px-4 pt-4 pb-2">
                <div className="flex items-center gap-2 bg-card border border-surface-variant rounded-xl px-3 py-2.5 focus-within:border-main-green transition-colors shadow-sm">
                    <svg className="w-4 h-4 text-blue-grey shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                    <input
                        type="text"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        placeholder={lang === "ca" ? "Cercar en historial..." : "Buscar en historial..."}
                        className="flex-1 text-sm bg-transparent outline-none text-dark-blue-grey placeholder-blue-grey/50"
                        disabled={isEditing}
                    />
                </div>
            </div>

            {/* Barra de Herramientas */}
            <div className="px-4 py-2 flex items-center justify-between">
                {isEditing ? (
                    <button onClick={toggleSelectAll} className="text-xs font-semibold text-main-green flex items-center gap-1.5">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedIds.size === listaFiltrada.length && listaFiltrada.length > 0 ? "bg-main-green border-main-green text-white" : "border-blue-grey/40"}`}>
                            {selectedIds.size === listaFiltrada.length && listaFiltrada.length > 0 && <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        {lang === "ca" ? "Seleccionar-ho tot" : "Seleccionar todo"}
                    </button>
                ) : (
                    <p className="text-xs text-blue-grey">
                        {cargando ? (lang === "ca" ? "Carregant..." : "Cargando...") : `${listaFiltrada.length} ${lang === "ca" ? "registres" : "registros"}`}
                    </p>
                )}

                <div className="flex gap-4">
                    {!isEditing && (
                        <button onClick={cargarHistorial} disabled={cargando} className="text-xs text-blue-grey font-medium disabled:opacity-40 hover:text-main-green">
                            {lang === "ca" ? "Actualitzar" : "Actualizar"}
                        </button>
                    )}
                    {listaFiltrada.length > 0 && (
                        <button onClick={toggleEdit} className={`text-xs font-bold transition-colors ${isEditing ? "text-error-red" : "text-main-green"}`}>
                            {isEditing ? (lang === "ca" ? "Cancel·lar" : "Cancelar") : (lang === "ca" ? "Seleccionar" : "Seleccionar")}
                        </button>
                    )}
                </div>
            </div>

            {/* Lista */}
            {!cargando && !error && (
                <div className="px-4 pb-6 flex flex-col gap-3 mt-2">
                    {listaFiltrada.map((registro) => {
                        const isSelected = selectedIds.has(registro.id!);

                        return (
                            <div
                                key={registro.id}
                                onClick={() => handleVerDetalle(registro)}
                                className={`bg-card rounded-2xl p-4 shadow-sm border transition-all duration-200 flex items-center gap-3 ${isEditing ? "cursor-pointer" : ""} ${isSelected ? "border-main-green bg-main-green/5" : "border-surface-variant"}`}
                            >
                                {isEditing && (
                                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected ? "bg-main-green border-main-green text-white" : "border-surface-variant"}`}>
                                        {isSelected && <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                    </div>
                                )}

                                <div className="flex-1 min-w-0 flex flex-col gap-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-main-green bg-main-green/10 px-2 py-1 rounded-md">
                                                {obtenerEtiquetaTipo(registro.tipo, lang)}
                                            </span>
                                            <h3 className="text-sm font-bold text-dark-blue-grey mt-2 truncate">
                                                {registro.resumen}
                                            </h3>
                                        </div>
                                        <p className="text-xs text-blue-grey whitespace-nowrap ml-2">
                                            {new Date(registro.fecha).toLocaleDateString(lang === "ca" ? "ca-ES" : "es-ES", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                                        </p>
                                    </div>

                                    {!isEditing && (
                                        <div className="flex pt-2 border-t border-surface-variant">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleVerDetalle(registro); }}
                                                className="w-full bg-surface text-main-green rounded-xl py-2.5 text-sm font-semibold hover:bg-main-green/5 transition-colors"
                                            >
                                                {lang === "ca" ? "Veure detall" : "Ver detalle"}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Floating Action Bar */}
            {isEditing && selectedIds.size > 0 && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-surface-variant shadow-[0_-10px_20px_rgba(0,0,0,0.05)] z-50 animate-slideUp">
                    <button
                        onClick={handleEliminarMultiples}
                        className="w-full bg-error-red text-white font-bold py-3.5 rounded-xl shadow-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        {lang === "ca" ? `Esborrar ${selectedIds.size} registres` : `Borrar ${selectedIds.size} registros`}
                    </button>
                </div>
            )}
        </div>
    );
}