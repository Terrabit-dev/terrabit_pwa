"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import TopBar from "@/components/layout/TopBar";
import { useDrawer } from "@/context/DrawerContext";
import { useI18n } from "@/hooks/useI18n";
import FormField from "@/components/forms/FormField";
import SelectInput from "@/components/forms/SelectInput";
import DateInputDMY from "@/components/forms/DateInputDMY";
import AutoCompleteIdentificador from "@/components/forms/AutoCompleteIdentificador";
import ErrorModal from "@/components/common/ErrorModal";
import SuccessModal from "@/components/common/SuccessModal";
import LoadingOverlay from "@/components/common/LoadingOverlay";
import {
    validarConfirmarGuia,
    CONFIRMAR_GUIA_LIMITES,
    getTransportes,
    type ConfirmarGuiaForm,
} from "@/lib/bovinos/confirmarGuia";
import { getAppError } from "@/lib/errors/appErrors";
import { useConfirmarGuia } from "@/hooks/useConfirmarGuia";
import { useListarBovinos } from "@/hooks/useListarBovinos";
import { useAutoCompleteBovinos } from "@/hooks/useAutoCompleteBovinos";
import type { Guia } from "@/lib/bovinos/listarGuias";

const SESSION_KEY_GUIA = "guiaSeleccionada";

export default function ConfirmarGuiaPage() {
    const { toggle }   = useDrawer();
    const { t, lang }  = useI18n();
    const searchParams = useSearchParams();

    const {
        form, enviando, exito, errorApi, isReadOnly,
        update,
        agregarIdentificador, eliminarIdentificador, actualizarIdentificador,
        precargarGuia,
        enviar, cerrarExito, limpiarErrorApi,
        cargarBorrador, guardarBorradorActual, cargarDesdeHistorial,
    } = useConfirmarGuia();

    const [errorLocal, setErrorLocal]         = useState<string | null>(null);
    const [mostrarConfirm, setMostrarConfirm] = useState(false);

    const { lista: listaBovinos, cargarBovinos } = useListarBovinos();
    useEffect(() => { void cargarBovinos(); }, [cargarBovinos]);

    const { suggestions, activeField, isLoading, buscar, limpiarSugerencias } =
        useAutoCompleteBovinos(listaBovinos);

    const transportes = getTransportes(lang);

    const errorApiMsg = errorApi
        ? errorApi.tipo === "api" ? errorApi.mensaje : t("errors.network")
        : null;

    // Carga inicial: 1) borrador 2) historial 3) guía seleccionada en sessionStorage
    useEffect(() => {
        const draftId   = searchParams.get("draftId");
        const historyId = searchParams.get("historyId");
        if (draftId) {
            void cargarBorrador(Number(draftId));
            return;
        }
        if (historyId) {
            void cargarDesdeHistorial(Number(historyId));
            return;
        }
        if (typeof window !== "undefined") {
            const raw = sessionStorage.getItem(SESSION_KEY_GUIA);
            if (raw) {
                try {
                    const guia = JSON.parse(raw) as Guia;
                    precargarGuia(guia);
                    sessionStorage.removeItem(SESSION_KEY_GUIA);
                } catch (err) {
                    console.error("Error parseando guía seleccionada", err);
                }
            }
        }
    }, [searchParams, cargarBorrador, cargarDesdeHistorial, precargarGuia]);

    const handleGuardarBorrador = async () => {
        const ok = await guardarBorradorActual();
        alert(ok
            ? (lang === "ca" ? "Esborrany desat!" : "¡Borrador guardado!")
            : (lang === "ca" ? "Error en desar." : "Error al guardar."));
    };

    const handleEnviar = () => {
        setErrorLocal(null);
        const err = validarConfirmarGuia(form);
        if (err) {
            setErrorLocal(getAppError(err.codigo, t));
            return;
        }
        setMostrarConfirm(true);
    };

    const confirmarEnvio = async () => {
        setMostrarConfirm(false);
        await enviar();
    };

    const esValido    = !validarConfirmarGuia(form);
    const readOnlyCls = isReadOnly ? "opacity-70 pointer-events-none" : "";

    return (
        <div className="min-h-screen bg-surface pointer-events-auto">
            <TopBar
                title={lang === "ca" ? "Confirmar Guia" : "Confirmar Guía"}
                onMenuClick={toggle}
                accentColor="orange"
                showBack
            />

            <div className="px-4 py-5 flex flex-col gap-4 pb-28">

                {/* ── Cabecera de solo lectura ─────────────────────────── */}
                {form.remo && (
                    <div className="bg-main-orange/10 rounded-2xl p-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-main-orange/20 flex items-center justify-center shrink-0">
                            <svg className="w-5 h-5 text-main-orange" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M5 12h14M13 5l7 7-7 7"/>
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-dark-blue-grey truncate">
                                {form.explotacioOrigen} → {form.explotacioDestinacio}
                            </p>
                            <p className="text-xs text-blue-grey">
                                {form.numeroAnimals}{" "}
                                {lang === "ca" ? "animals" : "animales"} · {form.remo}
                            </p>
                        </div>
                    </div>
                )}

                {/* ── Card: Dates ──────────────────────────────────────── */}
                <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-4">
                    <h2 className="text-sm font-bold text-dark-blue-grey">
                        {lang === "ca" ? "Dades del moviment" : "Datos del movimiento"}
                    </h2>

                    <div className="grid grid-cols-2 gap-3">
                        <div className={readOnlyCls}>
                            <FormField label={`${lang === "ca" ? "Data sortida" : "Fecha salida"} *`}>
                                <DateInputDMY
                                    key={`dataSortida-${form.dataSortida || "empty"}`}
                                    value={form.dataSortida}
                                    onChange={(v) => update({ dataSortida: v })}
                                />
                            </FormField>
                        </div>
                        <div className={readOnlyCls}>
                            <FormField label={`${lang === "ca" ? "Hora sortida" : "Hora salida"} *`}>
                                <input
                                    type="time"
                                    value={form.horaSortida}
                                    onChange={(e) => update({ horaSortida: e.target.value })}
                                    className="w-full border border-surface-variant rounded-xl px-3 py-2.5 text-sm bg-surface outline-none text-dark-blue-grey focus:border-main-orange"
                                />
                            </FormField>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className={readOnlyCls}>
                            <FormField label={`${lang === "ca" ? "Data arribada" : "Fecha llegada"} *`}>
                                <DateInputDMY
                                    key={`dataArribada-${form.dataArribada || "empty"}`}
                                    value={form.dataArribada}
                                    onChange={(v) => update({ dataArribada: v })}
                                />
                            </FormField>
                        </div>
                        <div className={readOnlyCls}>
                            <FormField label={`${lang === "ca" ? "Hora arribada" : "Hora llegada"} *`}>
                                <input
                                    type="time"
                                    value={form.horaArribada}
                                    onChange={(e) => update({ horaArribada: e.target.value })}
                                    className="w-full border border-surface-variant rounded-xl px-3 py-2.5 text-sm bg-surface outline-none text-dark-blue-grey focus:border-main-orange"
                                />
                            </FormField>
                        </div>
                    </div>
                </div>

                {/* ── Card: Transport ──────────────────────────────────── */}
                <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-4">
                    <h2 className="text-sm font-bold text-dark-blue-grey">
                        {lang === "ca" ? "Transport" : "Transporte"}
                    </h2>

                    <div className={readOnlyCls}>
                        <FormField label={lang === "ca" ? "Codi ATES" : "Código ATES"}>
                            <input
                                type="text"
                                value={form.codiAtes}
                                maxLength={CONFIRMAR_GUIA_LIMITES.CODI_ATES}
                                onChange={(e) => update({ codiAtes: e.target.value })}
                                className="w-full border border-surface-variant rounded-xl px-3 py-2.5 text-sm bg-surface outline-none text-dark-blue-grey focus:border-main-orange"
                            />
                        </FormField>
                    </div>

                    <div className={readOnlyCls}>
                        <FormField label={lang === "ca" ? "Nom transportista" : "Nombre transportista"}>
                            <input
                                type="text"
                                value={form.nomTransportista}
                                maxLength={CONFIRMAR_GUIA_LIMITES.NOM_TRANSPORTISTA}
                                onChange={(e) => update({ nomTransportista: e.target.value })}
                                className="w-full border border-surface-variant rounded-xl px-3 py-2.5 text-sm bg-surface outline-none text-dark-blue-grey focus:border-main-orange"
                            />
                        </FormField>
                    </div>

                    <div className={readOnlyCls}>
                        <FormField label={lang === "ca" ? "Mitjà de transport" : "Medio de transporte"}>
                            <SelectInput
                                value={form.mitjaTransport}
                                onChange={(c, n) => update({ mitjaTransport: c, mitjaTransportNombre: n })}
                                options={transportes}
                                placeholder={lang === "ca" ? "Seleccionar" : "Seleccionar"}
                            />
                        </FormField>
                    </div>

                    <div className={readOnlyCls}>
                        <FormField label={lang === "ca" ? "Matrícula vehicle" : "Matrícula vehículo"}>
                            <input
                                type="text"
                                value={form.matricula}
                                maxLength={CONFIRMAR_GUIA_LIMITES.MATRICULA}
                                onChange={(e) => update({ matricula: e.target.value })}
                                className="w-full border border-surface-variant rounded-xl px-3 py-2.5 text-sm bg-surface outline-none text-dark-blue-grey focus:border-main-orange"
                            />
                        </FormField>
                    </div>

                    <div className={readOnlyCls}>
                        <FormField label={lang === "ca" ? "NIF conductor" : "NIF conductor"}>
                            <input
                                type="text"
                                value={form.nifConductor}
                                maxLength={CONFIRMAR_GUIA_LIMITES.NIF_CONDUCTOR}
                                onChange={(e) => update({ nifConductor: e.target.value })}
                                className="w-full border border-surface-variant rounded-xl px-3 py-2.5 text-sm bg-surface outline-none text-dark-blue-grey focus:border-main-orange"
                            />
                        </FormField>
                    </div>

                    <div className={readOnlyCls}>
                        <FormField label={lang === "ca" ? "Nom conductor" : "Nombre conductor"}>
                            <input
                                type="text"
                                value={form.nomConductor}
                                maxLength={CONFIRMAR_GUIA_LIMITES.NOM_CONDUCTOR}
                                onChange={(e) => update({ nomConductor: e.target.value })}
                                className="w-full border border-surface-variant rounded-xl px-3 py-2.5 text-sm bg-surface outline-none text-dark-blue-grey focus:border-main-orange"
                            />
                        </FormField>
                    </div>
                </div>

                {/* ── Card: Identificadors ─────────────────────────────── */}
                <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold text-dark-blue-grey">
                            {lang === "ca" ? "Identificadors" : "Identificadores"}
                        </h2>
                        {!isReadOnly && (
                            <button
                                type="button"
                                onClick={agregarIdentificador}
                                className="w-9 h-9 rounded-lg bg-main-orange text-white flex items-center justify-center"
                                aria-label={lang === "ca" ? "Afegir" : "Añadir"}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                                </svg>
                            </button>
                        )}
                    </div>

                    {form.identificadors.map((identificador, index) => (
                        <div key={index} className="bg-surface rounded-xl p-3 flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-main-orange">
                                    Animal {index + 1}
                                </span>
                                {!isReadOnly && form.identificadors.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => eliminarIdentificador(index)}
                                        className="w-8 h-8 flex items-center justify-center text-error-red"
                                        aria-label="Eliminar"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V4a1 1 0 011-1h6a1 1 0 011 1v3"/>
                                        </svg>
                                    </button>
                                )}
                            </div>
                            <div className={readOnlyCls}>
                                <AutoCompleteIdentificador
                                    label={lang === "ca" ? "Identificador" : "Identificador"}
                                    value={identificador}
                                    onChange={(v) => { actualizarIdentificador(index, v); buscar(v, index); }}
                                    onAnimalSelected={(a) => { actualizarIdentificador(index, a.identificador); limpiarSugerencias(); }}
                                    suggestions={activeField === index ? suggestions : []}
                                    isLoading={isLoading && activeField === index}
                                    placeholder="ES724100041234"
                                    lang={lang}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Botones fijos ───────────────────────────────────────── */}
            {!isReadOnly && (
                <div className="fixed bottom-0 left-0 right-0 px-4 py-4 bg-white border-t border-surface-variant flex gap-3 z-40">
                    <button
                        onClick={handleGuardarBorrador}
                        title={lang === "ca" ? "Desar esborrany" : "Guardar borrador"}
                        className="w-12 h-12 shrink-0 flex items-center justify-center border-2 border-main-orange text-main-orange rounded-xl hover:bg-main-orange/10 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"/>
                        </svg>
                    </button>
                    <button
                        onClick={handleEnviar}
                        disabled={enviando || !esValido}
                        className="flex-1 bg-main-orange text-white rounded-xl py-3 text-sm font-semibold disabled:opacity-40 transition-opacity"
                    >
                        {enviando
                            ? t("common.loading")
                            : (lang === "ca" ? "Confirmar modificació" : "Confirmar modificación")}
                    </button>
                </div>
            )}

            {isReadOnly && (
                <div className="fixed bottom-0 left-0 right-0 px-4 py-4 bg-white border-t border-surface-variant z-40">
                    <button
                        onClick={() => window.history.back()}
                        className="w-full bg-surface-variant text-dark-blue-grey rounded-xl py-3 text-sm font-semibold"
                    >
                        {lang === "ca" ? "Tornar a l'historial" : "Volver al historial"}
                    </button>
                </div>
            )}

            {/* ── Modales ─────────────────────────────────────────────── */}
            {mostrarConfirm && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
                        <h3 className="text-base font-bold text-dark-blue-grey mb-2">
                            {lang === "ca" ? "Confirmar" : "Confirmar"}
                        </h3>
                        <p className="text-sm text-blue-grey mb-4">
                            {lang === "ca"
                                ? "Confirmes la modificació de la guia?"
                                : "¿Confirmas la modificación de la guía?"}
                        </p>
                        <div className="bg-surface rounded-xl p-3 mb-5 flex flex-col gap-1.5">
                            <p className="text-xs text-blue-grey">
                                REMO: <span className="text-dark-blue-grey font-medium">{form.remo}</span>
                            </p>
                            <p className="text-xs text-blue-grey">
                                {lang === "ca" ? "Origen" : "Origen"}:{" "}
                                <span className="text-dark-blue-grey font-medium">{form.explotacioOrigen}</span>
                            </p>
                            <p className="text-xs text-blue-grey">
                                {lang === "ca" ? "Destí" : "Destino"}:{" "}
                                <span className="text-dark-blue-grey font-medium">{form.explotacioDestinacio}</span>
                            </p>
                            <p className="text-xs text-blue-grey">
                                {lang === "ca" ? "Sortida" : "Salida"}:{" "}
                                <span className="text-dark-blue-grey font-medium">
                                    {form.dataSortida} {form.horaSortida}
                                </span>
                            </p>
                            <p className="text-xs text-blue-grey">
                                {lang === "ca" ? "Animals" : "Animales"}:{" "}
                                <span className="text-dark-blue-grey font-medium">
                                    {form.identificadors.filter((id) => id.trim()).length}
                                </span>
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setMostrarConfirm(false)}
                                className="flex-1 border border-surface-variant text-blue-grey rounded-xl py-2.5 text-sm font-medium"
                            >
                                {t("common.btn_cancel")}
                            </button>
                            <button
                                onClick={confirmarEnvio}
                                className="flex-1 bg-main-orange text-white rounded-xl py-2.5 text-sm font-semibold"
                            >
                                {t("common.btn_send")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {exito && (
                <SuccessModal
                    titulo={lang === "ca" ? "Guia modificada" : "Guía modificada"}
                    mensaje={lang === "ca"
                        ? "La guia s'ha modificat correctament al sistema GTR."
                        : "La guía se ha modificado correctamente en el sistema GTR."}
                    boton={lang === "ca" ? "Acceptar" : "Aceptar"}
                    onClose={cerrarExito}
                />
            )}

            {errorLocal && (
                <ErrorModal mensaje={errorLocal} onClose={() => setErrorLocal(null)} lang={lang}/>
            )}

            {errorApiMsg && (
                <ErrorModal mensaje={errorApiMsg} onClose={limpiarErrorApi} lang={lang}/>
            )}

            {enviando && <LoadingOverlay mensaje={t("common.loading")}/>}
        </div>
    );
}