"use client";

import { useState, useEffect } from "react";
import TopBar from "@/components/layout/TopBar";
import { useDrawer } from "@/context/DrawerContext";
import { useI18n } from "@/hooks/useI18n";
import FormField from "@/components/forms/FormField";
import DateInputDMY from "@/components/forms/DateInputDMY";
import AutoCompleteIdentificador from "@/components/forms/AutoCompleteIdentificador";
import ErrorModal from "@/components/common/ErrorModal";
import SuccessModal from "@/components/common/SuccessModal";
import LoadingOverlay from "@/components/common/LoadingOverlay";
import { validarIdentificacion, formatearFechaDisplay } from "@/lib/bovinos/identificacion";
import { getAppError } from "@/lib/errors/appErrors";
import { useIdentificacion } from "@/hooks/useIdentificacion";
import { useListarBovinos } from "@/hooks/useListarBovinos";
import { useAutoCompleteBovinos } from "@/hooks/useAutoCompleteBovinos";
import { useSearchParams } from "next/navigation";

export default function IdentificacionPage() {
    const { toggle }  = useDrawer();
    const { t, lang } = useI18n();
    const searchParams = useSearchParams();

    const {
        form, enviando, exito, errorApi, resetKey, isReadOnly,
        update, enviar, cerrarExito, limpiarErrorApi,
        cargarBorrador, guardarBorradorActual, cargarDesdeHistorial
    } = useIdentificacion();

    const [errorLocal, setErrorLocal]         = useState<string | null>(null);
    const [mostrarConfirm, setMostrarConfirm] = useState(false);

    const { lista: listaBovinos, cargarBovinos } = useListarBovinos();
    useEffect(() => { cargarBovinos(); }, [cargarBovinos]);

    const { suggestions, activeField, isLoading, buscar, limpiarSugerencias } =
        useAutoCompleteBovinos(listaBovinos);

    const errorApiMsg = errorApi
        ? errorApi.tipo === "api" ? errorApi.mensaje : t("errors.network")
        : null;

    const handleEnviar = () => {
        setErrorLocal(null);
        const err = validarIdentificacion(form);
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

    const esValido = !validarIdentificacion(form);

    useEffect(() => {
        const draftId = searchParams.get("draftId");
        const historyId = searchParams.get("historyId"); // <-- Leemos el historial

        if (draftId) {
            cargarBorrador(Number(draftId));
        } else if (historyId) {
            // Dependiendo de cómo guarde tu ID idb (número o string), puede que necesites Number(historyId)
            cargarDesdeHistorial(Number(historyId));
        }
    }, [searchParams, cargarBorrador, cargarDesdeHistorial]);

    const handleGuardarBorrador = async () => {
        const guardadoExito = await guardarBorradorActual();

        if (guardadoExito) {
            alert(lang === "ca" ? "Esborrany desat correctament!" : "¡Borrador guardado correctamente!");
        } else {
            alert(lang === "ca" ? "Error: No s'ha pogut desar l'esborrany." : "Error: No se pudo guardar el borrador.");
        }
    };

    return (
        <div className="min-h-screen bg-surface">
            <TopBar
                title={lang === "ca" ? "Identificació Ajornada" : "Identificación Aplazada"}
                onMenuClick={toggle}
                accentColor="green"
                showBack
            />

            <div className="px-4 py-5 flex flex-col gap-4 pb-24">
                <div className="bg-card rounded-2xl shadow-sm p-4 flex flex-col gap-4">
                    <div className={isReadOnly ? "opacity-70 pointer-events-none" : ""}>
                        <AutoCompleteIdentificador
                            label={`${lang === "ca" ? "Identificador animal" : "Identificador animal"} *`}
                            value={form.identificador}
                            onChange={(v) => { update({ identificador: v }); buscar(v, 0); }}
                            onAnimalSelected={(a) => { update({ identificador: a.identificador }); limpiarSugerencias(); }}
                            suggestions={activeField === 0 ? suggestions : []}
                            isLoading={isLoading && activeField === 0}
                            placeholder="ES724100041234"
                            lang={lang}
                        />
                    </div>
                    <div className={isReadOnly ? "opacity-70 pointer-events-none" : ""}>
                        <FormField label={`${lang === "ca" ? "Data d'identificació" : "Fecha de identificación"} *`}>
                            <DateInputDMY
                                key={`dataId-${resetKey}`}
                                value={form.dataIdentificacio}
                                onChange={(v) => update({ dataIdentificacio: v })}
                                accentColor="main-green"
                            />
                        </FormField>
                    </div>

                </div>
            </div>

            {/* Botón fijo */}
            {!isReadOnly && (
                <div className="fixed bottom-0 left-0 right-0 px-4 py-4 bg-card border-t border-surface-variant flex gap-3">
                    {/* Botón de Guardar Borrador (Icono) */}
                    <button
                        onClick={handleGuardarBorrador}
                        title={lang === "ca" ? "Desar esborrany" : "Guardar borrador"}
                        className="w-12 h-12 shrink-0 flex items-center justify-center border-2 border-main-green text-main-green rounded-xl hover:bg-main-green/10 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                        </svg>
                    </button>

                    {/* Botón Principal de Enviar */}
                    <button
                        onClick={handleEnviar}
                        disabled={enviando || !esValido}
                        className="flex-1 bg-main-green text-white rounded-xl py-3 text-sm font-semibold disabled:opacity-40 transition-opacity"
                    >
                        {enviando
                            ? t("common.loading")
                            : lang === "ca" ? "Registrar identificació" : "Registrar identificación"}
                    </button>
                </div>
            )}
            {isReadOnly && (
                <div className="fixed bottom-0 left-0 right-0 px-4 py-4 bg-card border-t border-surface-variant">
                    <button
                        onClick={() => window.history.back()}
                        className="w-full bg-surface-variant text-dark-blue-grey rounded-xl py-3 text-sm font-semibold"
                    >
                        {lang === "ca" ? "Tornar a l'historial" : "Volver al historial"}
                    </button>
                </div>
            )}

            {/* Modal confirmación */}
            {mostrarConfirm && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
                    <div className="bg-card rounded-2xl p-6 w-full max-w-sm">
                        <h3 className="text-base font-bold text-dark-blue-grey mb-2">
                            {lang === "ca" ? "Confirmar identificació" : "Confirmar identificación"}
                        </h3>
                        <p className="text-sm text-blue-grey mb-4">
                            {lang === "ca"
                                ? "Confirmes el registre de la identificació?"
                                : "¿Confirmas el registro de la identificación?"}
                        </p>
                        <div className="bg-surface rounded-xl p-3 mb-5 flex flex-col gap-1.5">
                            <p className="text-xs text-blue-grey">
                                {lang === "ca" ? "Animal" : "Animal"}:{" "}
                                <span className="text-dark-blue-grey font-medium">{form.identificador}</span>
                            </p>
                            <p className="text-xs text-blue-grey">
                                {lang === "ca" ? "Data identificació" : "Fecha identificación"}:{" "}
                                <span className="text-dark-blue-grey font-medium">
                  {formatearFechaDisplay(form.dataIdentificacio)}
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
                                className="flex-1 bg-main-green text-white rounded-xl py-2.5 text-sm font-semibold"
                            >
                                {t("common.btn_send")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {exito && (
                <SuccessModal
                    titulo={lang === "ca" ? "Identificació registrada" : "Identificación registrada"}
                    mensaje={lang === "ca"
                        ? "La identificació ha estat registrada correctament al sistema GTR."
                        : "La identificación ha sido registrada correctamente en el sistema GTR."}
                    boton={lang === "ca" ? "Acceptar" : "Aceptar"}
                    onClose={cerrarExito}
                />
            )}

            {errorLocal && (
                <ErrorModal mensaje={errorLocal} onClose={() => setErrorLocal(null)} lang={lang} />
            )}

            {errorApiMsg && (
                <ErrorModal mensaje={errorApiMsg} onClose={limpiarErrorApi} lang={lang} />
            )}

            {enviando && <LoadingOverlay mensaje={t("common.loading")} />}
        </div>
    );
}
