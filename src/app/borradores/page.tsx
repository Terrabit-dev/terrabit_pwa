"use client";

import { useState, useEffect } from "react";
import TopBar from "@/components/layout/TopBar";
import { useDrawer } from "@/context/DrawerContext";
import { useI18n } from "@/hooks/useI18n";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface RegistroHistorial {
    id: string;
    // añade aquí los campos reales cuando los tengas
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function filtrar(lista: RegistroHistorial[], busqueda: string): RegistroHistorial[] {
    if (!busqueda.trim()) return lista;
    const q = busqueda.toLowerCase();
    return lista.filter((r) => r.id.toLowerCase().includes(q));
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function HistorialPage() {
    const { toggle } = useDrawer();
    const { lang } = useI18n();

    const [lista, setLista] = useState<RegistroHistorial[]>([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [busqueda, setBusqueda] = useState("");

    const listaFiltrada = filtrar(lista, busqueda);

    async function cargarHistorial() {
        setCargando(true);
        setError(null);
        try {
            // TODO: reemplaza con tu llamada real
            // const res = await apiGetHistorial();
            // setLista(res.data);
            setLista([]);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Error desconocido");
        } finally {
            setCargando(false);
        }
    }

    useEffect(() => {
        cargarHistorial();
    }, []);

    return (
        <div className="min-h-screen bg-surface">
            <TopBar
                title={lang === "ca" ? "Esborranys" : "Borradores"}
                onMenuClick={toggle}
                accentColor="green"
                badge={`${listaFiltrada.length} ${lang === "ca" ? "registres" : "registros"}`}
                badgeIcon="history"
            />

            {/* Buscador */}
            <div className="px-4 pt-4 pb-2">
                <div className="flex items-center gap-2 bg-white border border-surface-variant rounded-xl px-3 py-2.5 focus-within:border-main-green transition-colors">
                    <svg className="w-4 h-4 text-blue-grey shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                    <input
                        type="text"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        placeholder={lang === "ca" ? "Cercar en historial..." : "Buscar en historial..."}
                        className="flex-1 text-sm bg-transparent outline-none text-dark-blue-grey placeholder-blue-grey/50"
                    />
                    {busqueda && (
                        <button onClick={() => setBusqueda("")} className="text-blue-grey">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Contador */}
            <div className="px-4 py-2 flex items-center justify-between">
                <p className="text-xs text-blue-grey">
                    {cargando
                        ? (lang === "ca" ? "Carregant..." : "Cargando...")
                        : `${listaFiltrada.length} ${lang === "ca" ? "registres" : "registros"}`}
                </p>
                <button
                    onClick={cargarHistorial}
                    disabled={cargando}
                    className="text-xs text-main-green font-medium disabled:opacity-40"
                >
                    {lang === "ca" ? "Actualitzar" : "Actualizar"}
                </button>
            </div>

            {/* Loading */}
            {cargando && (
                <div className="flex justify-center py-16">
                    <div className="w-8 h-8 border-4 border-main-green border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {/* Error */}
            {error && !cargando && (
                <div className="mx-4 mt-2 px-4 py-3 bg-error-red-bg rounded-xl">
                    <p className="text-xs text-error-red text-center">{error}</p>
                    <button
                        onClick={cargarHistorial}
                        className="w-full mt-2 text-xs text-error-red font-semibold"
                    >
                        {lang === "ca" ? "Tornar a intentar" : "Reintentar"}
                    </button>
                </div>
            )}

            {/* Lista */}
            {!cargando && !error && (
                <div className="px-4 pb-6 flex flex-col gap-3">
                    {listaFiltrada.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <svg className="w-12 h-12 text-blue-grey/40" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
                            </svg>
                            <p className="text-sm text-blue-grey">
                                {busqueda
                                    ? (lang === "ca" ? "Sense resultats" : "Sin resultados")
                                    : (lang === "ca" ? "No hi ha registres en l'historial" : "No hay registros en el historial")}
                            </p>
                        </div>
                    ) : (
                        listaFiltrada.map((registro) => (
                            <div
                                key={registro.id}
                                className="bg-white rounded-2xl p-4 shadow-sm"
                            >
                                {/* TODO: renderiza los campos de cada registro aquí */}
                                <p className="text-sm font-medium text-dark-blue-grey">{registro.id}</p>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}