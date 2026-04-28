"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TopBar from "@/components/layout/TopBar";
import { useDrawer } from "@/context/DrawerContext";
import { useI18n } from "@/hooks/useI18n";
import { obtenerBorradores, eliminarBorrador, type Borrador } from "@/lib/storage/borradores";
import { TIPOS_MATERIAL } from "@/lib/bovinos/solicitudMaterial";
import { CATEGORIAS_PORCINOS } from "@/lib/porcinos/altaGuias";


// Molde con todas las propiedades posibles que podríamos buscar en los distintos borradores
interface DatosBorrador {
    identificador?: string;
    identificadorMadre?: string;
    madre?: string;
    tipusMaterial?: string;
    tipusMaterialNombre?: string;
    identificadors?: Array<{ identificador: string; tipusMaterial?: string }>;
    // Permite que haya otras propiedades desconocidas sin quejarse:
    [key: string]: unknown;
}
// ─── Helpers ──────────────────────────────────────────────────────────────────

function obtenerRutaFormulario(tipo: string): string {
    switch (tipo) {
        case "IDENTIFICACION": return "/home/bovinos/gestion/identificacion_aplazada";
        case "NACIMIENTO": return "/home/bovinos/gestion/nacimiento";
        case "CORRECCION_SEXO": return "/home/bovinos/gestion/correccion_sexo";
        case "FALLECIMIENTO": return "/home/bovinos/gestion/fallecimiento";
        case "SOLICITUD_MATERIAL": return "/home/bovinos/material-categoria/solicitar";
        case "SOLICITUD_DUPLICADO": return "/home/bovinos/material-categoria/duplicado";
        case "ALTA_GUIA_PORCINO": return "/home/porcinos/guias/creacion";
        default: return "/home";
    }
}

// NUEVO HELPER: Decide qué mostrar en función del tipo de trámite
function obtenerResumenBorrador(tipo: string, datos: DatosBorrador, lang: string): string {
    const sinInfo = lang === "ca" ? "Sense informació" : "Sin información";

    switch (tipo) {
        case "NACIMIENTO":
            // Asumo que la variable de la madre se llama identificadorMadre (ajusta si se llama distinto)
            const idMadre = datos.idMadre || datos.madre;
            return idMadre
                ? `${lang === "ca" ? "Mare" : "Madre"}: ES${String(idMadre).replace('ES', '')}`
                : (lang === "ca" ? "Nou naixement" : "Nuevo nacimiento");

        case "SOLICITUD_MATERIAL":
            const codigoMaterial = datos.tipusMaterial;
            if (codigoMaterial) {
                const materialObj = TIPOS_MATERIAL.find(m => m.codigo === codigoMaterial);
                if (materialObj) {
                    return lang === "ca" ? materialObj.nombre : (materialObj.nombreEs || materialObj.nombre);
                }
            }
            // Fallback por si acaso el borrador estaba muy vacío
            return lang === "ca" ? "Sol·licitud de material" : "Solicitud de material";

        case "SOLICITUD_DUPLICADO":
            if (datos.identificadors && datos.identificadors.length > 0 && datos.identificadors[0].identificador) {
                const primerId = datos.identificadors[0].identificador;
                const extra = datos.identificadors.length > 1 ? ` (+${datos.identificadors.length - 1})` : "";
                return `ES${String(primerId).replace('ES', '')}${extra}`;
            }
            return lang === "ca" ? "Sol·licitud de duplicats" : "Solicitud de duplicados";

        case "ALTA_GUIA_PORCINO":
            const codCat = datos.codiCategoria;
            if (codCat) {
                const catObj = CATEGORIAS_PORCINOS.find(c => c.codigo === codCat);
                if (catObj) {
                    return lang === "ca" ? catObj.nombre : (catObj.nombreEs || catObj.nombre);
                }
            }
            return lang === "ca" ? "Alta de guia porcina" : "Alta de guía porcina";

        default:
            // Por defecto (Fallecimiento, Corrección, Identificación) usamos el identificador normal
            return datos.identificador
                ? `ES${String(datos.identificador).replace('ES', '')}`
                : (lang === "ca" ? "Sense identificador" : "Sin identificador");
    }
}

function filtrar(lista: Borrador[], busqueda: string, lang: string): Borrador[] {
    if (!busqueda.trim()) return lista;
    const q = busqueda.toLowerCase();

    return lista.filter((r) => {
        const matchTipo = r.tipo.toLowerCase().includes(q);
        // ANTES: const datos = r.datos as Record<string, any>;
        // AHORA:
        const datos = r.datos as DatosBorrador;

        const resumenVisual = obtenerResumenBorrador(r.tipo, datos, lang).toLowerCase();

        return matchTipo || resumenVisual.includes(q);
    });
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function HistorialPage() {
    const { toggle } = useDrawer();
    const { lang } = useI18n();
    const router = useRouter();

    const [lista, setLista] = useState<Borrador[]>([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [busqueda, setBusqueda] = useState("");

    // Le pasamos 'lang' al filtro para que coincida con las traducciones generadas
    const listaFiltrada = filtrar(lista, busqueda, lang);

    async function cargarHistorial() {
        setCargando(true);
        setError(null);
        try {
            const borradores = await obtenerBorradores();
            setLista(borradores);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Error al cargar los borradores");
        } finally {
            setCargando(false);
        }
    }

    useEffect(() => {
        cargarHistorial();
    }, []);

    const handleEliminar = async (id: number) => {
        const confirmar = confirm(lang === "ca" ? "Segur que vols esborrar aquest esborrany?" : "¿Seguro que quieres borrar este borrador?");
        if (confirmar) {
            await eliminarBorrador(id);
            await cargarHistorial();
        }
    };

    const handleContinuar = (borrador: Borrador) => {
        const ruta = obtenerRutaFormulario(borrador.tipo);
        router.push(`${ruta}?draftId=${borrador.id}`);
    };

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
                <div className="flex items-center gap-2 bg-card border border-surface-variant rounded-xl px-3 py-2.5 focus-within:border-main-green transition-colors">
                    <svg className="w-4 h-4 text-blue-grey shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                    <input
                        type="text"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        placeholder={lang === "ca" ? "Cercar esborrany..." : "Buscar borrador..."}
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

            {/* Contador y Actualizar */}
            <div className="px-4 py-2 flex items-center justify-between">
                <p className="text-xs text-blue-grey">
                    {cargando
                        ? (lang === "ca" ? "Carregant..." : "Cargando...")
                        : `${listaFiltrada.length} ${lang === "ca" ? "esborranys" : "borradores"}`}
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
                    <button onClick={cargarHistorial} className="w-full mt-2 text-xs text-error-red font-semibold">
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
                                    : (lang === "ca" ? "No hi ha cap esborrany guardat" : "No hay ningún borrador guardado")}
                            </p>
                        </div>
                    ) : (
                        listaFiltrada.map((registro) => {
                            const datos = registro.datos as DatosBorrador;
                            return (
                                <div key={registro.id} className="bg-card rounded-2xl p-4 shadow-sm border border-surface-variant flex flex-col gap-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-main-green bg-main-green/10 px-2 py-1 rounded-md">
                                                {registro.tipo.replace('_', ' ')}
                                            </span>
                                            <h3 className="text-sm font-bold text-dark-blue-grey mt-2">
                                                {/* Inyectamos la magia aquí */}
                                                {obtenerResumenBorrador(registro.tipo, datos, lang)}
                                            </h3>
                                        </div>
                                        <p className="text-xs text-blue-grey">
                                            {new Date(registro.fecha).toLocaleDateString(lang === "ca" ? "ca-ES" : "es-ES", {
                                                day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
                                            })}
                                        </p>
                                    </div>

                                    {/* Botones de acción */}
                                    <div className="flex gap-2 pt-2 border-t border-surface-variant">
                                        <button
                                            onClick={() => handleEliminar(registro.id!)}
                                            className="flex-1 border border-error-red/20 text-error-red rounded-xl py-2.5 text-xs font-semibold hover:bg-error-red/5 transition-colors"
                                        >
                                            {lang === "ca" ? "Esborrar" : "Borrar"}
                                        </button>
                                        <button
                                            onClick={() => handleContinuar(registro)}
                                            className="flex-1 bg-main-green text-white rounded-xl py-2.5 text-xs font-semibold hover:opacity-90 transition-opacity"
                                        >
                                            {lang === "ca" ? "Continuar" : "Continuar"}
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}