"use client";

import { useState, useEffect } from "react";
import TopBar from "@/components/layout/TopBar";
import { useDrawer } from "@/context/DrawerContext";
import { useI18n } from "@/hooks/useI18n";
import { useListarBovinos, Animal } from "@/hooks/useListarBovinos";

function formatFecha(fecha: string): string {
    try {
        if (fecha?.length === 8) {
            return `${fecha.substring(6, 8)}/${fecha.substring(4, 6)}/${fecha.substring(0, 4)}`;
        }
        return fecha ?? "-";
    } catch {
        return fecha ?? "-";
    }
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
            <span className="text-xs font-medium text-dark-blue-grey text-right max-w-44">{value}</span>
        </div>
    );
}

export default function ListarBovinosPage() {
    const { toggle } = useDrawer();
    const { lang } = useI18n();
    const { lista, cargando, error, cargarBovinos, filtrar } = useListarBovinos();

    const [busqueda, setBusqueda] = useState("");
    const [animalSeleccionado, setAnimalSeleccionado] = useState<Animal | null>(null);

    useEffect(() => {
        cargarBovinos();
    }, [cargarBovinos]);

    const listaFiltrada = filtrar(lista, busqueda);

    return (
        <div className="min-h-screen bg-surface">
            <TopBar
                title={lang === "ca" ? "Llistar animals" : "Listar animales"}
                onMenuClick={toggle}
                accentColor="green"
            />

            {/* Buscador */}
            <div className="px-4 pt-4 pb-2">
                <div className="flex items-center gap-2 bg-white border border-surface-variant rounded-xl px-3 py-2.5 focus-within:border-main-green transition-colors">
                    <svg className="w-4 h-4 text-blue-grey shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
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
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Contador / estado */}
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
                    <div className="w-8 h-8 border-4 border-main-green border-t-transparent rounded-full animate-spin"/>
                </div>
            )}

            {/* Error */}
            {error && !cargando && (
                <div className="mx-4 mt-2 px-4 py-3 bg-error-red-bg rounded-xl">
                    <p className="text-xs text-error-red text-center">{error}</p>
                    <button
                        onClick={cargarBovinos}
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
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
                            </svg>
                            <p className="text-sm text-blue-grey">
                                {lang === "ca" ? "Sense dades" : "Sin datos"}
                            </p>
                        </div>
                    ) : (
                        listaFiltrada.map((animal) => (
                            <button
                                key={animal.identificador}
                                onClick={() => setAnimalSeleccionado(animal)}
                                className="bg-white rounded-2xl p-4 shadow-sm text-left active:scale-95 transition-transform w-full"
                            >
                                <div className="flex items-center justify-between mb-2">
                  <span className="text-dark-blue-grey font-semibold text-sm">
                    {animal.identificador}
                  </span>
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getSexoColor(animal.sexe)}`}>
                    {getSexoLabel(animal.sexe, lang)}
                  </span>
                                </div>
                                <div className="flex gap-4">
                                    <div>
                                        <p className="text-xs text-blue-grey">{lang === "ca" ? "Data naix." : "F. nacimiento"}</p>
                                        <p className="text-xs font-medium text-dark-blue-grey">{formatFecha(animal.dataNaixement)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-blue-grey">{lang === "ca" ? "Raça" : "Raza"}</p>
                                        <p className="text-xs font-medium text-dark-blue-grey">{animal.raza}</p>
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
                        ))
                    )}
                </div>
            )}

            {/* Modal detalle */}
            {animalSeleccionado && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center">
                    <div className="bg-white w-full max-w-lg rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto">
                        <div className="w-10 h-1 bg-surface-variant rounded-full mx-auto mb-4"/>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-bold text-dark-blue-grey">
                                {lang === "ca" ? "Detalls de l'animal" : "Detalles del animal"}
                            </h2>
                            <button onClick={() => setAnimalSeleccionado(null)} className="text-blue-grey p-1">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                                </svg>
                            </button>
                        </div>

                        <div className="bg-main-green-bg rounded-xl p-4 mb-3">
                            <p className="text-xs text-main-green font-semibold uppercase tracking-wide mb-2">
                                {lang === "ca" ? "Identificador de l'animal" : "Identificador del animal"}
                            </p>
                            <InfoRow label="Identificador" value={animalSeleccionado.identificador}/>
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
                            <InfoRow label={lang === "ca" ? "Raça" : "Raza"} value={animalSeleccionado.raza}/>
                            <InfoRow label={lang === "ca" ? "Sexe" : "Sexo"} value={getSexoLabel(animalSeleccionado.sexe, lang)}/>
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
                                    value={animalSeleccionado.paisNaixement}
                                />
                            )}
                            {animalSeleccionado.identificadorMare && (
                                <InfoRow
                                    label={lang === "ca" ? "Id. de la mare" : "Id. de la madre"}
                                    value={animalSeleccionado.identificadorMare}
                                />
                            )}
                        </div>

                        <button
                            onClick={() => setAnimalSeleccionado(null)}
                            className="w-full bg-main-green text-white rounded-xl py-3 text-sm font-semibold"
                        >
                            {lang === "ca" ? "Tancar" : "Cerrar"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}