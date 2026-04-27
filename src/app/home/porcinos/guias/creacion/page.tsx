"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import TopBar from "@/components/layout/TopBar";
import { useDrawer } from "@/context/DrawerContext";
import { useI18n } from "@/hooks/useI18n";
import FormField from "@/components/forms/FormField";
import SelectInput from "@/components/forms/SelectInput";
import ErrorModal from "@/components/common/ErrorModal";
import SuccessModal from "@/components/common/SuccessModal";
import LoadingOverlay from "@/components/common/LoadingOverlay";
import { useAltaGuias } from "@/hooks/useAltaGuiaPorcino";

import { CATEGORIAS_PORCINOS, MEDIOS_TRANSPORTE, validarAltaGuia } from "@/lib/porcinos/altaGuias";

export default function AltaGuiaPorcinoPage() {
    const { toggle }  = useDrawer();
    const { t, lang } = useI18n();
    const searchParams = useSearchParams();

    const {
        form, enviando, exito, codigoSeguimiento, errorApi, isReadOnly,
        update, enviar, cerrarExito, limpiarErrorApi,
        cargarBorrador, guardarBorradorActual, cargarDesdeHistorial
    } = useAltaGuias();

    const [errorLocal, setErrorLocal] = useState<string | null>(null);
    const [mostrarConfirm, setMostrarConfirm] = useState(false);

    useEffect(() => {
        const draftId = searchParams.get("draftId");
        const historyId = searchParams.get("historyId");
        if (draftId) cargarBorrador(Number(draftId));
        else if (historyId) cargarDesdeHistorial(Number(historyId));
    }, [searchParams, cargarBorrador, cargarDesdeHistorial]);

    const esValido = validarAltaGuia(form) === null;

    const errorApiMsg = errorApi
        ? errorApi.tipo === "api" && errorApi.mensaje ? errorApi.mensaje : t("errors.network")
        : null;

    const mapIdiomas = (arr: { codigo: string; nombre: string; nombreEs?: string }[]) => arr.map(item => ({
        codigo: item.codigo,
        nombre: lang === "ca" ? item.nombre : (item.nombreEs || item.nombre)
    }));

    const handleGuardarBorrador = async () => {
        const guardado = await guardarBorradorActual();
        if (guardado) alert(lang === "ca" ? "Esborrany desat!" : "¡Borrador guardado!");
    };

    const handleEnviar = () => {
        setErrorLocal(null);
        const err = validarAltaGuia(form);
        if (err) {
            setErrorLocal(err.mensaje || "Error en el formulari");
            return;
        }
        setMostrarConfirm(true);
    };

    return (
        <div className="min-h-screen bg-surface pointer-events-auto">
            {/* Color accent orange */}
            <TopBar title={lang === "ca" ? "Crear Guia" : "Crear Guía"} onMenuClick={toggle} accentColor="orange" showBack />

            <div className="px-4 py-5 flex flex-col gap-4 pb-24">

                {isReadOnly && form.codigoSeguimiento && (
                    <div className="bg-main-orange/10 border-2 border-main-orange/20 rounded-2xl p-4 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] uppercase font-bold text-main-orange tracking-wider">
                                Codi de seguiment
                            </p>
                            <p className="text-lg font-mono font-bold text-dark-blue-grey leading-none mt-1">
                                {form.codigoSeguimiento}
                            </p>
                        </div>
                        <div className="bg-main-orange text-white p-2 rounded-xl">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                )}

                {/* 1. Origen y Destino */}
                <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-4">
                    <h2 className="text-sm font-bold text-dark-blue-grey flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-main-orange"></span>
                        {lang === "ca" ? "Origen i Destí" : "Origen y Destino"}
                    </h2>

                    <div className={isReadOnly ? "opacity-70 pointer-events-none" : ""}>
                        <FormField label={lang === "ca" ? "Explotació d'Entrada *" : "Explotación de Entrada *"}>
                            <input
                                type="text"
                                value={form.explotacioSortida}
                                onChange={(e) => update({ explotacioSortida: e.target.value.toUpperCase() })}
                                className="w-full border border-surface-variant rounded-xl px-3 py-2.5 text-sm uppercase placeholder-normal"
                                placeholder="ES..."
                            />
                        </FormField>
                    </div>

                    <div className={isReadOnly ? "opacity-70 pointer-events-none" : ""}>
                        <FormField label={lang === "ca" ? "Explotació de Sortida *" : "Explotación de Salida *"}>
                            <input
                                type="text"
                                value={form.explotacioEntrada}
                                onChange={(e) => update({ explotacioEntrada: e.target.value.toUpperCase() })}
                                className="w-full border border-surface-variant rounded-xl px-3 py-2.5 text-sm uppercase placeholder-normal"
                                placeholder="ES..."
                            />
                        </FormField>
                    </div>
                </div>

                {/* 2. Detalles de los Animales */}
                <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-4">
                    <h2 className="text-sm font-bold text-dark-blue-grey flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-main-orange"></span>
                        {lang === "ca" ? "Detalls del Moviment" : "Detalles del Movimiento"}
                    </h2>

                    <div className={isReadOnly ? "opacity-70 pointer-events-none" : ""}>
                        <FormField label={lang === "ca" ? "Categoria *" : "Categoría *"}>
                            <SelectInput
                                value={form.codiCategoria}
                                onChange={(c, n) => update({ codiCategoria: c, codiCategoriaNombre: n })}
                                options={mapIdiomas(CATEGORIAS_PORCINOS)}
                                placeholder="Selecciona..."
                            />
                        </FormField>
                    </div>

                    <div className={isReadOnly ? "opacity-70 pointer-events-none" : ""}>
                        <FormField label={lang === "ca" ? "Número d'Animals *" : "Número de Animales *"}>
                            <input
                                type="number"
                                value={form.numAnimals}
                                onChange={(e) => update({ numAnimals: e.target.value })}
                                className="w-full border border-surface-variant rounded-xl px-3 py-2.5 text-sm"
                                min="1"
                            />
                        </FormField>
                    </div>
                </div>

                {/* 3. Fechas */}
                <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-4">
                    <h2 className="text-sm font-bold text-dark-blue-grey flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-main-orange"></span>
                        {lang === "ca" ? "Dates" : "Fechas"}
                    </h2>

                    <div className={isReadOnly ? "opacity-70 pointer-events-none" : ""}>
                        <FormField label={lang === "ca" ? "Data i Hora de Sortida *" : "Fecha y Hora de Salida *"}>
                            <input
                                type="datetime-local"
                                value={form.dataSortida}
                                onChange={(e) => update({ dataSortida: e.target.value })}
                                className="w-full border border-surface-variant rounded-xl px-3 py-2.5 text-sm"
                            />
                        </FormField>
                    </div>

                    <div className={isReadOnly ? "opacity-70 pointer-events-none" : ""}>
                        <FormField label={lang === "ca" ? "Data i Hora d'Arribada *" : "Fecha y Hora de Llegada *"}>
                            <input
                                type="datetime-local"
                                value={form.dataArribada}
                                onChange={(e) => update({ dataArribada: e.target.value })}
                                className="w-full border border-surface-variant rounded-xl px-3 py-2.5 text-sm"
                            />
                        </FormField>
                    </div>
                </div>

                {/* 4. Transporte (Opcional) */}
                <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-4">
                    <h2 className="text-sm font-bold text-dark-blue-grey flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-surface-variant"></span>
                        {lang === "ca" ? "Transport (Opcional)" : "Transporte (Opcional)"}
                    </h2>

                    <div className={isReadOnly ? "opacity-70 pointer-events-none" : ""}>
                        <FormField label={lang === "ca" ? "Mitjà de Transport" : "Medio de Transporte"}>
                            <SelectInput
                                value={form.mitjaTransport || ""}
                                onChange={(c, n) => update({ mitjaTransport: c, mitjaTransportNombre: n })}
                                options={mapIdiomas(MEDIOS_TRANSPORTE)}
                                placeholder="Opcional..."
                            />
                        </FormField>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className={isReadOnly ? "opacity-70 pointer-events-none" : ""}>
                            <FormField label="Matrícula">
                                <input
                                    type="text"
                                    value={form.matricula}
                                    onChange={(e) => update({ matricula: e.target.value.toUpperCase() })}
                                    className="w-full border border-surface-variant rounded-xl px-3 py-2.5 text-sm uppercase"
                                />
                            </FormField>
                        </div>
                        <div className={isReadOnly ? "opacity-70 pointer-events-none" : ""}>
                            <FormField label="NIF Conductor">
                                <input
                                    type="text"
                                    value={form.nifConductor}
                                    onChange={(e) => update({ nifConductor: e.target.value.toUpperCase() })}
                                    className="w-full border border-surface-variant rounded-xl px-3 py-2.5 text-sm uppercase"
                                />
                            </FormField>
                        </div>
                    </div>

                    <div className={isReadOnly ? "opacity-70 pointer-events-none" : ""}>
                        <FormField label="Codi Sirentra (Opcional)">
                            <input
                                type="text"
                                value={form.codiSirentra}
                                onChange={(e) => update({ codiSirentra: e.target.value })}
                                className="w-full border border-surface-variant rounded-xl px-3 py-2.5 text-sm"
                            />
                        </FormField>
                    </div>
                </div>
            </div>

            {/* Botones */}
            {!isReadOnly && (
                <div className="fixed bottom-0 left-0 right-0 px-4 py-4 bg-white border-t border-surface-variant flex gap-3 z-40">
                    <button onClick={handleGuardarBorrador} className="w-12 h-12 shrink-0 flex items-center justify-center border-2 border-main-orange text-main-orange rounded-xl hover:bg-main-orange/10">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                    </button>
                    <button onClick={handleEnviar} disabled={enviando || !esValido} className="flex-1 bg-main-orange text-white rounded-xl py-3 text-sm font-semibold disabled:opacity-40 transition-opacity shadow-sm">
                        {enviando ? t("common.loading") : "Registrar Guia"}
                    </button>
                </div>
            )}

            {isReadOnly && (
                <div className="fixed bottom-0 left-0 right-0 px-4 py-4 bg-white border-t border-surface-variant z-40">
                    <button onClick={() => window.history.back()} className="w-full bg-surface-variant text-dark-blue-grey rounded-xl py-3 text-sm font-semibold">
                        {lang === "ca" ? "Tornar" : "Volver"}
                    </button>
                </div>
            )}

            {mostrarConfirm && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
                        <h3 className="text-base font-bold text-dark-blue-grey mb-2">{lang === "ca" ? "Confirmar Guia" : "Confirmar Guía"}</h3>
                        <p className="text-sm text-blue-grey mb-4">{lang === "ca" ? "Vols registrar la guia al sistema de la Generalitat?" : "¿Quieres registrar la guía en el sistema?"}</p>
                        <div className="flex gap-3 mt-5">
                            <button onClick={() => setMostrarConfirm(false)} className="flex-1 border border-surface-variant text-blue-grey rounded-xl py-2.5 text-sm font-medium">{t("common.btn_cancel")}</button>
                            <button onClick={() => { setMostrarConfirm(false); enviar(); }} className="flex-1 bg-main-orange text-white rounded-xl py-2.5 text-sm font-semibold">Confirmar</button>
                        </div>
                    </div>
                </div>
            )}

            {exito && (
                <SuccessModal
                    titulo="Guia Registrada"
                    mensaje={`S'ha donat d'alta correctament. Codi: ${codigoSeguimiento}`}
                    boton="Acceptar"
                    onClose={cerrarExito}
                />
            )}

            {errorLocal && <ErrorModal mensaje={errorLocal} onClose={() => setErrorLocal(null)} lang={lang}/>}
            {errorApiMsg && <ErrorModal mensaje={errorApiMsg} onClose={limpiarErrorApi} lang={lang}/>}
            {enviando && <LoadingOverlay mensaje={t("common.loading")}/>}
        </div>
    );
}