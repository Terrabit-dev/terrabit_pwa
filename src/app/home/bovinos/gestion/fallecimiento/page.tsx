"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation"; // NUEVO
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
import { TIPOS_MUERTE, TIPOS_MUERTE_CA } from "@/lib/bovinos/constants";
import { validarFallecimiento, formatearFechaDisplay } from "@/lib/bovinos/fallecimiento";
import { getAppError } from "@/lib/errors/appErrors";
import { useFallecimiento } from "@/hooks/useFallecimiento";
import { useListarBovinos } from "@/hooks/useListarBovinos";
import { useAutoCompleteBovinos } from "@/hooks/useAutoCompleteBovinos";
import { consumeSelectedBovino } from "@/lib/storage/selectedBovino";

export default function FallecimientoPage() {
    const { toggle }  = useDrawer();
    const { t, lang } = useI18n();
    const searchParams = useSearchParams(); // NUEVO

    const {
        form, enviando, exito, errorApi, obtenendoGps, resetKey, isReadOnly, // NUEVO
        update, enviar, obtenerCoordenadas, cerrarExito, limpiarErrorApi,
        cargarBorrador, guardarBorradorActual, cargarDesdeHistorial // NUEVO
    } = useFallecimiento();

    const [errorLocal, setErrorLocal]         = useState<string | null>(null);
    const [mostrarConfirm, setMostrarConfirm] = useState(false);

    const { lista: listaBovinos, cargarBovinos } = useListarBovinos();
    useEffect(() => { cargarBovinos(); }, [cargarBovinos]);

    const { suggestions, activeField, isLoading, buscar, limpiarSugerencias } =
        useAutoCompleteBovinos(listaBovinos);

    const tiposMuerte = lang === "ca" ? TIPOS_MUERTE_CA : TIPOS_MUERTE;

    const errorApiMsg = errorApi
        ? errorApi.tipo === "api" ? errorApi.mensaje : t("errors.network")
        : null;

    const esAborto = form.tipus === "02";
    const esMuerte = form.tipus === "01";

    const labelIdentificador = esAborto
        ? `${lang === "ca" ? "Identificador mare" : "Identificador madre"} *`
        : `${lang === "ca" ? "ID Animal" : "ID Animal"} *`;


    useEffect(() => {
        const draftId   = searchParams.get("draftId");
        const historyId = searchParams.get("historyId");

        if (draftId) {
            cargarBorrador(Number(draftId));
        } else if (historyId) {
            cargarDesdeHistorial(Number(historyId));
        } else {
            // Pre-rellenar desde la pantalla de listar bovinos
            const animalId = consumeSelectedBovino();
            if (animalId) update({ identificador: animalId });
        }
    }, [searchParams, cargarBorrador, cargarDesdeHistorial, update]);

    const handleGuardarBorrador = async () => {
        const guardadoExito = await guardarBorradorActual();
        if (guardadoExito) {
            alert(lang === "ca" ? "Esborrany desat correctament!" : "¡Borrador guardado correctamente!");
        } else {
            alert(lang === "ca" ? "Error: No s'ha pogut desar l'esborrany." : "Error: No se pudo guardar el borrador.");
        }
    };

    const handleEnviar = () => {
        setErrorLocal(null);
        const err = validarFallecimiento(form);
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

    const esValido = !validarFallecimiento(form);

    return (
        <div className="min-h-screen bg-surface pointer-events-auto">
            <TopBar
                title={lang === "ca" ? "Registrar Defunció" : "Registrar Fallecimiento"}
                onMenuClick={toggle}
                accentColor="red"
                showBack
            />

            <div className="px-4 py-5 flex flex-col gap-4 pb-24">

                <div className="bg-card rounded-2xl shadow-sm p-4 flex flex-col gap-4">
                    <div className={isReadOnly ? "opacity-70 pointer-events-none" : ""}>
                        <FormField label={`${lang === "ca" ? "Tipus" : "Tipo"} *`}>
                            <SelectInput
                                value={form.tipus}
                                onChange={(c, n) => update({
                                    tipus:              c,
                                    tipusNombre:        n,
                                    mesosGestacio:      "",
                                    cadaverInaccesible: false,
                                    latitud:            "",
                                    longitud:           "",
                                    identificador:      "",
                                })}
                                options={tiposMuerte}
                                placeholder={lang === "ca" ? "Seleccionar tipus" : "Seleccionar tipo"}
                                accentColor="error-red"
                            />
                        </FormField>
                    </div>

                    <div className={isReadOnly ? "opacity-70 pointer-events-none" : ""}>
                        <AutoCompleteIdentificador
                            label={labelIdentificador}
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
                        <FormField label={`${lang === "ca" ? "Data de mort" : "Fecha de muerte"} *`}>
                            <DateInputDMY
                                key={`dataMort-${resetKey}-${form.dataMort || 'empty'}`} // NUEVO: Evita el bug de la fecha
                                value={form.dataMort}
                                onChange={(v) => update({ dataMort: v })}
                                accentColor="error-red"
                            />
                        </FormField>
                    </div>

                    {esAborto && (
                        <div className={isReadOnly ? "opacity-70 pointer-events-none" : ""}>
                            <FormField label={`${lang === "ca" ? "Mesos de gestació (1-9)" : "Meses de gestación (1-9)"} *`}>
                                <input
                                    type="number"
                                    min={1}
                                    max={9}
                                    value={form.mesosGestacio}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === "" || (Number(val) >= 1 && Number(val) <= 9)) {
                                            update({ mesosGestacio: val });
                                        }
                                    }}
                                    placeholder="1 - 9"
                                    className="w-full border border-surface-variant rounded-xl px-3 py-2.5 text-sm text-dark-blue-grey bg-surface focus:outline-none focus:border-error-red"
                                />
                            </FormField>
                        </div>
                    )}
                </div>

                {esMuerte && (
                    <div className="bg-card rounded-2xl shadow-sm p-4 flex flex-col gap-4">
                        <div className={`flex items-center justify-between ${isReadOnly ? "opacity-70 pointer-events-none" : ""}`}>
                            <div className="flex-1 pr-4">
                                <p className="text-sm font-bold text-dark-blue-grey">
                                    {lang === "ca" ? "Cadàver Inaccessible" : "Cadáver Inaccesible"}
                                </p>
                                <p className="text-xs text-blue-grey mt-0.5">
                                    {lang === "ca"
                                        ? "Activa si la ubicació no pot ser accedida"
                                        : "Activar si la ubicación no puede ser accedida"}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => update({
                                    cadaverInaccesible: !form.cadaverInaccesible,
                                    latitud:  "",
                                    longitud: "",
                                })}
                                className={`relative w-12 h-6 rounded-full transition-colors duration-200 shrink-0 ${
                                    form.cadaverInaccesible ? "bg-error-red" : "bg-surface-variant"
                                }`}
                            >
                                <span
                                    className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200"
                                    style={{ transform: form.cadaverInaccesible ? "translateX(24px)" : "translateX(0px)" }}
                                />
                            </button>
                        </div>

                        {form.cadaverInaccesible && (
                            <div className={`flex flex-col gap-3 pt-3 border-t border-surface-variant ${isReadOnly ? "opacity-70 pointer-events-none" : ""}`}>
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-error-red" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                                    </svg>
                                    <p className="text-sm font-semibold text-dark-blue-grey">
                                        {lang === "ca" ? "Coordenades GPS" : "Coordenadas GPS"}
                                    </p>
                                </div>

                                {!isReadOnly && (
                                    <button
                                        type="button"
                                        onClick={obtenerCoordenadas}
                                        disabled={obtenendoGps}
                                        className="flex items-center justify-center gap-2 border border-error-red text-error-red rounded-xl py-2.5 text-sm font-medium disabled:opacity-50 transition-opacity"
                                    >
                                        {obtenendoGps ? (
                                            <>
                                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                                </svg>
                                                {lang === "ca" ? "Obtenint ubicació..." : "Obteniendo ubicación..."}
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                                                </svg>
                                                {lang === "ca" ? "Obtenir ubicació actual" : "Obtener ubicación actual"}
                                            </>
                                        )}
                                    </button>
                                )}

                                <div className="grid grid-cols-2 gap-3">
                                    <FormField label={`${lang === "ca" ? "Latitud (X)" : "Latitud (X)"} *`}>
                                        <input
                                            type="text"
                                            value={form.latitud}
                                            onChange={(e) => update({ latitud: e.target.value })}
                                            placeholder="41.123456"
                                            inputMode="decimal"
                                            className="w-full border border-surface-variant rounded-xl px-3 py-2.5 text-sm text-dark-blue-grey bg-surface focus:outline-none focus:border-error-red"
                                        />
                                    </FormField>
                                    <FormField label={`${lang === "ca" ? "Longitud (Y)" : "Longitud (Y)"} *`}>
                                        <input
                                            type="text"
                                            value={form.longitud}
                                            onChange={(e) => update({ longitud: e.target.value })}
                                            placeholder="2.123456"
                                            inputMode="decimal"
                                            className="w-full border border-surface-variant rounded-xl px-3 py-2.5 text-sm text-dark-blue-grey bg-surface focus:outline-none focus:border-error-red"
                                        />
                                    </FormField>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* NUEVO: Botones fijos condicionales */}
            {!isReadOnly && (
                <div className="fixed bottom-0 left-0 right-0 px-4 py-4 bg-card border-t border-surface-variant flex gap-3 z-40">
                    <button
                        onClick={handleGuardarBorrador}
                        title={lang === "ca" ? "Desar esborrany" : "Guardar borrador"}
                        className="w-12 h-12 shrink-0 flex items-center justify-center border-2 border-main-green text-main-green rounded-xl hover:bg-main-green/10 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                        </svg>
                    </button>
                    <button
                        onClick={handleEnviar}
                        disabled={enviando || !esValido}
                        className="flex-1 bg-error-red text-white rounded-xl py-3 text-sm font-semibold disabled:opacity-40 transition-opacity"
                    >
                        {enviando
                            ? t("common.loading")
                            : lang === "ca" ? "Reportar mort" : "Reportar muerte"}
                    </button>
                </div>
            )}

            {isReadOnly && (
                <div className="fixed bottom-0 left-0 right-0 px-4 py-4 bg-card border-t border-surface-variant z-40">
                    <button
                        onClick={() => window.history.back()}
                        className="w-full bg-surface-variant text-dark-blue-grey rounded-xl py-3 text-sm font-semibold"
                    >
                        {lang === "ca" ? "Tornar a l'historial" : "Volver al historial"}
                    </button>
                </div>
            )}

            {/* Modales... (quedan igual) */}
            {mostrarConfirm && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
                    <div className="bg-card rounded-2xl p-6 w-full max-w-sm">
                        <h3 className="text-base font-bold text-dark-blue-grey mb-2">
                            {lang === "ca" ? "Confirmar defunció" : "Confirmar fallecimiento"}
                        </h3>
                        <p className="text-sm text-blue-grey mb-4">
                            {lang === "ca"
                                ? "Confirmes el registre de la defunció?"
                                : "¿Confirmas el registro del fallecimiento?"}
                        </p>
                        <div className="bg-surface rounded-xl p-3 mb-5 flex flex-col gap-1.5">
                            <p className="text-xs text-blue-grey">
                                {lang === "ca" ? "Tipus" : "Tipo"}:{" "}
                                <span className="text-dark-blue-grey font-medium">{form.tipusNombre}</span>
                            </p>
                            <p className="text-xs text-blue-grey">
                                {esAborto ? (lang === "ca" ? "Mare" : "Madre") : (lang === "ca" ? "Animal" : "Animal")}:{" "}
                                <span className="text-dark-blue-grey font-medium">{form.identificador}</span>
                            </p>
                            <p className="text-xs text-blue-grey">
                                {lang === "ca" ? "Data de mort" : "Fecha de muerte"}:{" "}
                                <span className="text-dark-blue-grey font-medium">{formatearFechaDisplay(form.dataMort)}</span>
                            </p>
                            {esAborto && form.mesosGestacio && (
                                <p className="text-xs text-blue-grey">
                                    {lang === "ca" ? "Mesos gestació" : "Meses gestación"}:{" "}
                                    <span className="text-dark-blue-grey font-medium">{form.mesosGestacio}</span>
                                </p>
                            )}
                            {esMuerte && form.cadaverInaccesible && (
                                <>
                                    <p className="text-xs text-blue-grey">
                                        {lang === "ca" ? "Cadàver inaccessible" : "Cadáver inaccesible"}:{" "}
                                        <span className="text-dark-blue-grey font-medium">Sí</span>
                                    </p>
                                    {form.latitud && (
                                        <p className="text-xs text-blue-grey">
                                            GPS:{" "}
                                            <span className="text-dark-blue-grey font-medium">
                                                {form.latitud}, {form.longitud}
                                            </span>
                                        </p>
                                    )}
                                </>
                            )}
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
                                className="flex-1 bg-error-red text-white rounded-xl py-2.5 text-sm font-semibold"
                            >
                                {t("common.btn_send")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {exito && (
                <SuccessModal
                    titulo={lang === "ca" ? "Defunció registrada" : "Fallecimiento registrado"}
                    mensaje={lang === "ca"
                        ? "La defunció ha estat registrada correctament al sistema GTR."
                        : "El fallecimiento ha sido registrado correctamente en el sistema GTR."}
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