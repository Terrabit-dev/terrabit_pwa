"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import TopBar from "@/components/layout/TopBar";
import { useDrawer } from "@/context/DrawerContext";
import { useI18n } from "@/hooks/useI18n";
import { useListarBovinos, type Animal } from "@/hooks/useListarBovinos";
import { getNombreRaza, getNombrePais } from "@/lib/bovinos/constants";
import { setSelectedBovino } from "@/lib/storage/selectedBovino";

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatFecha(fecha: string): string {
    if (!fecha) return "-";
    if (fecha.length === 8) {
        return `${fecha.slice(6, 8)}/${fecha.slice(4, 6)}/${fecha.slice(0, 4)}`;
    }
    return fecha;
}

function getSexoLabel(sexe: string, lang: string): string {
    if (sexe === "01") return lang === "ca" ? "Femella" : "Hembra";
    if (sexe === "02") return lang === "ca" ? "Mascle" : "Macho";
    return sexe;
}

function getSexoColor(sexe: string): string {
    if (sexe === "01") return "bg-pink-100 text-pink-700";
    if (sexe === "02") return "bg-blue-100 text-blue-700";
    return "bg-surface text-blue-grey";
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between items-start py-1.5 border-b border-surface-variant last:border-0">
            <span className="text-xs text-blue-grey">{label}</span>
            <span className="text-xs font-medium text-dark-blue-grey text-right max-w-44">{value || "-"}</span>
        </div>
    );
}

// ─── Tipos de acción ─────────────────────────────────────────────────────────

type AccionBovino = "muerte" | "sexo" | "guias" | "duplicado";

interface AccionItem {
    id: AccionBovino;
    labelEs: string;
    labelCa: string;
    subtitleEs: string;
    subtitleCa: string;
    color: string;
    bgColor: string;
    icon: React.ReactNode;
}

// ─── Iconos SVG inline ───────────────────────────────────────────────────────

function IconMuerte() {
    return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L1 21h22L12 2zm0 3.5L20.5 19H3.5L12 5.5zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z" />
        </svg>
    );
}

function IconSexo() {
    return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
        </svg>
    );
}

function IconGuias() {
    return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 3H4v2h16V3zm1 7H3c-.55 0-1 .45-1 1v9c0 .55.45 1 1 1h18c.55 0 1-.45 1-1v-9c0-.55-.45-1-1-1zm-1 9H4v-7h16v7zM6 7h12V5H6v2z" />
        </svg>
    );
}

function IconDuplicado() {
    return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
        </svg>
    );
}

function IconKebab() {
    return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
        </svg>
    );
}

// ─── Configuración de acciones ────────────────────────────────────────────────

function getAcciones(lang: string): AccionItem[] {
    return [
        {
            id: "muerte",
            labelEs: "Reportar Muerte",
            labelCa: "Reportar Mort",
            subtitleEs: "Reportar fallecimiento de este animal",
            subtitleCa: "Reportar defunció d'aquest animal",
            color: "text-error-red",
            bgColor: "bg-error-red/10",
            icon: <IconMuerte />,
        },
        {
            id: "sexo",
            labelEs: "Corregir Sexo",
            labelCa: "Corregir Sexe",
            subtitleEs: "Corregir el sexo de este animal",
            subtitleCa: "Corregir el sexe d'aquest animal",
            color: "text-main-orange",
            bgColor: "bg-main-orange/10",
            icon: <IconSexo />,
        },
        {
            id: "guias",
            labelEs: "Gestionar Guías",
            labelCa: "Gestionar Guies",
            subtitleEs: "Crear una guía para este animal",
            subtitleCa: "Crear una guia per a aquest animal",
            color: "text-main-orange",
            bgColor: "bg-main-orange/10",
            icon: <IconGuias />,
        },
        {
            id: "duplicado",
            labelEs: "Solicitar Duplicado",
            labelCa: "Sol·licitar Duplicat",
            subtitleEs: "Solicitar duplicado de material",
            subtitleCa: "Sol·licitar duplicat de material",
            color: "text-main-green",
            bgColor: "bg-main-green/10",
            icon: <IconDuplicado />,
        },
    ];
}

function getRutaAccion(accion: AccionBovino): string {
    switch (accion) {
        case "muerte":    return "/home/bovinos/gestion/fallecimiento";
        case "sexo":      return "/home/bovinos/gestion/correccion_sexo";
        case "guias":     return "/home/bovinos/guias-movimientos/alta_guia";
        case "duplicado": return "/home/bovinos/material-categoria/duplicado";
    }
}

// ─── Componente Bottom Sheet de acciones ─────────────────────────────────────

interface MenuAccionesProps {
    animal: Animal;
    lang: string;
    onAccion: (accion: AccionBovino) => void;
    onDismiss: () => void;
}

function MenuAccionesBovino({ animal, lang, onAccion, onDismiss }: MenuAccionesProps) {
    const acciones = getAcciones(lang);

    return (
        <div
            className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
            onClick={onDismiss}
        >
            <div
                className="bg-card w-full max-w-lg rounded-t-3xl pb-safe"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Handle */}
                <div className="w-10 h-1 bg-surface-variant rounded-full mx-auto mt-3 mb-1" />

                {/* Cabecera */}
                <div className="px-6 py-4 border-b border-surface-variant">
                    <p className="text-xs font-semibold text-blue-grey uppercase tracking-wide">
                        {lang === "ca" ? "Tria una acció" : "Elige una acción"}
                    </p>
                    <p className="text-base font-bold text-dark-blue-grey mt-0.5">
                        {animal.identificador}
                    </p>
                </div>

                {/* Acciones */}
                <div className="px-4 py-2">
                    {acciones.map((accion, idx) => (
                        <div key={accion.id}>
                            <button
                                onClick={() => onAccion(accion.id)}
                                className="w-full flex items-center gap-4 px-2 py-3.5 rounded-xl active:bg-surface-variant transition-colors text-left"
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${accion.bgColor} ${accion.color}`}>
                                    {accion.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-semibold ${accion.color}`}>
                                        {lang === "ca" ? accion.labelCa : accion.labelEs}
                                    </p>
                                    <p className="text-xs text-blue-grey mt-0.5">
                                        {lang === "ca" ? accion.subtitleCa : accion.subtitleEs}
                                    </p>
                                </div>
                            </button>
                            {idx < acciones.length - 1 && (
                                <div className="h-px bg-surface-variant mx-2" />
                            )}
                        </div>
                    ))}
                </div>

                {/* Cancelar */}
                <div className="px-4 pb-6 pt-2">
                    <button
                        onClick={onDismiss}
                        className="w-full py-3 text-sm font-semibold text-blue-grey rounded-xl border border-surface-variant active:bg-surface-variant transition-colors"
                    >
                        {lang === "ca" ? "Cancel·lar" : "Cancelar"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function ListarBovinosPage() {
    const { toggle } = useDrawer();
    const { lang } = useI18n();
    const router = useRouter();
    const { lista, cargando, error, cargarBovinos, filtrar } = useListarBovinos();

    const [busqueda, setBusqueda] = useState("");
    const [animalSeleccionado, setAnimalSeleccionado] = useState<Animal | null>(null);
    const [accionAnimal, setAccionAnimal] = useState<Animal | null>(null);

    useEffect(() => { cargarBovinos(); }, [cargarBovinos]);

    const listaFiltrada = filtrar(lista, busqueda);

    const handleAbrirAcciones = useCallback((e: React.MouseEvent, animal: Animal) => {
        e.stopPropagation();
        setAccionAnimal(animal);
    }, []);

    const handleAccion = useCallback((accion: AccionBovino) => {
        if (!accionAnimal) return;
        setSelectedBovino(accionAnimal.identificador);
        setAccionAnimal(null);
        router.push(getRutaAccion(accion));
    }, [accionAnimal, router]);

    return (
        <div className="min-h-screen bg-surface">
            <TopBar
                title={lang === "ca" ? "Llistar animals" : "Listar animales"}
                onMenuClick={toggle}
                accentColor="green"
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
                        placeholder={lang === "ca" ? "Cercar animal..." : "Buscar animal..."}
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
                        : `${listaFiltrada.length} ${lang === "ca" ? "animals" : "animales"}`}
                </p>
                <button
                    onClick={cargarBovinos}
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
                <div className="mx-4 mt-2 px-4 py-3 bg-red-50 rounded-xl">
                    <p className="text-xs text-error-red text-center">{error}</p>
                    <button onClick={cargarBovinos} className="w-full mt-2 text-xs text-error-red font-semibold">
                        {lang === "ca" ? "Tornar a intentar" : "Reintentar"}
                    </button>
                </div>
            )}

            {/* Lista */}
            {!cargando && !error && (
                <div className="px-4 pb-6 flex flex-col gap-3 mt-1">
                    {listaFiltrada.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <svg className="w-12 h-12 text-blue-grey/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <p className="text-sm text-blue-grey">
                                {lang === "ca" ? "Sense dades" : "Sin datos"}
                            </p>
                        </div>
                    ) : (
                        listaFiltrada.map((animal) => (
                            <div
                                key={animal.identificador}
                                className="bg-card rounded-2xl shadow-sm border border-surface-variant/60 overflow-hidden"
                            >
                                <button
                                    onClick={() => setAnimalSeleccionado(animal)}
                                    className="w-full p-4 text-left active:bg-surface-variant/40 transition-colors"
                                >
                                    <div className="flex items-center justify-between mb-2">
                    <span className="text-dark-blue-grey font-semibold text-sm">
                      {animal.identificador}
                    </span>
                                        <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getSexoColor(animal.sexe)}`}>
                        {getSexoLabel(animal.sexe, lang)}
                      </span>
                                            {/* Botón ⋮ kebab */}
                                            <button
                                                onClick={(e) => handleAbrirAcciones(e, animal)}
                                                className="w-7 h-7 flex items-center justify-center rounded-full text-blue-grey hover:bg-surface-variant active:bg-surface-variant transition-colors"
                                                aria-label={lang === "ca" ? "Accions" : "Acciones"}
                                            >
                                                <IconKebab />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div>
                                            <p className="text-xs text-blue-grey">{lang === "ca" ? "Data naix." : "F. nacimiento"}</p>
                                            <p className="text-xs font-medium text-dark-blue-grey">{formatFecha(animal.dataNaixement)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-blue-grey">{lang === "ca" ? "Raça" : "Raza"}</p>
                                            <p className="text-xs font-medium text-dark-blue-grey">{getNombreRaza(animal.raza)}</p>
                                        </div>
                                        {animal.identificadorMare && (
                                            <div>
                                                <p className="text-xs text-blue-grey">{lang === "ca" ? "Mare" : "Madre"}</p>
                                                <p className="text-xs font-medium text-dark-blue-grey truncate max-w-24">
                                                    {animal.identificadorMare}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Modal detalle (existente, sin cambios) */}
            {animalSeleccionado && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center">
                    <div className="bg-card w-full max-w-lg rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto">
                        <div className="w-10 h-1 bg-surface-variant rounded-full mx-auto mb-4" />
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-bold text-dark-blue-grey">
                                {lang === "ca" ? "Detalls de l'animal" : "Detalles del animal"}
                            </h2>
                            <button onClick={() => setAnimalSeleccionado(null)} className="text-blue-grey p-1">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>

                        <div className="bg-green-50 rounded-xl p-4 mb-3">
                            <p className="text-xs text-main-green font-semibold uppercase tracking-wide mb-2">
                                {lang === "ca" ? "Identificador de l'animal" : "Identificador del animal"}
                            </p>
                            <InfoRow label="Identificador" value={animalSeleccionado.identificador} />
                            {animalSeleccionado.identificadorElectronic && (
                                <InfoRow
                                    label={lang === "ca" ? "Id. electrònic" : "Id. electrónico"}
                                    value={animalSeleccionado.identificadorElectronic}
                                />
                            )}
                            {animalSeleccionado.tipusIdentificadorElectronic && (
                                <InfoRow
                                    label={lang === "ca" ? "Tipus id. electrònic" : "Tipo id. electrónico"}
                                    value={animalSeleccionado.tipusIdentificadorElectronic}
                                />
                            )}
                        </div>

                        <div className="bg-surface rounded-xl p-4 mb-3">
                            <p className="text-xs text-blue-grey font-semibold uppercase tracking-wide mb-2">
                                {lang === "ca" ? "Informació bàsica" : "Información básica"}
                            </p>
                            <InfoRow
                                label={lang === "ca" ? "Data de naixement" : "Fecha de nacimiento"}
                                value={formatFecha(animalSeleccionado.dataNaixement)}
                            />
                            <InfoRow
                                label={lang === "ca" ? "Raça" : "Raza"}
                                value={getNombreRaza(animalSeleccionado.raza)}
                            />
                            <InfoRow
                                label={lang === "ca" ? "Sexe" : "Sexo"}
                                value={getSexoLabel(animalSeleccionado.sexe, lang)}
                            />
                        </div>

                        <div className="bg-surface rounded-xl p-4 mb-5">
                            <p className="text-xs text-blue-grey font-semibold uppercase tracking-wide mb-2">
                                {lang === "ca" ? "Orígens de l'animal" : "Orígenes del animal"}
                            </p>
                            {animalSeleccionado.explotacioNaixement && (
                                <InfoRow
                                    label={lang === "ca" ? "Explotació de naixement" : "Explotación de nacimiento"}
                                    value={animalSeleccionado.explotacioNaixement}
                                />
                            )}
                            {animalSeleccionado.paisNaixement && (
                                <InfoRow
                                    label={lang === "ca" ? "País de naixement" : "País de nacimiento"}
                                    value={getNombrePais(animalSeleccionado.paisNaixement)}
                                />
                            )}
                            {animalSeleccionado.identificadorMare && (
                                <InfoRow
                                    label={lang === "ca" ? "Id. de la mare" : "Id. de la madre"}
                                    value={animalSeleccionado.identificadorMare}
                                />
                            )}
                        </div>

                        {/* Botón de acciones dentro del detalle también */}
                        <button
                            onClick={() => {
                                setAnimalSeleccionado(null);
                                setAccionAnimal(animalSeleccionado);
                            }}
                            className="w-full bg-main-green text-white rounded-xl py-3 text-sm font-semibold mb-2"
                        >
                            {lang === "ca" ? "Realitzar acció" : "Realizar acción"}
                        </button>
                        <button
                            onClick={() => setAnimalSeleccionado(null)}
                            className="w-full border border-surface-variant text-blue-grey rounded-xl py-3 text-sm font-semibold"
                        >
                            {lang === "ca" ? "Tancar" : "Cerrar"}
                        </button>
                    </div>
                </div>
            )}

            {/* Bottom sheet de acciones */}
            {accionAnimal && (
                <MenuAccionesBovino
                    animal={accionAnimal}
                    lang={lang}
                    onAccion={handleAccion}
                    onDismiss={() => setAccionAnimal(null)}
                />
            )}
        </div>
    );
}