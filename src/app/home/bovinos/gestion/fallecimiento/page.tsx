"use client";

import { useState, useEffect, useCallback } from "react";
import TopBar from "@/components/layout/TopBar";
import { useDrawer } from "@/context/DrawerContext";
import { useI18n } from "@/hooks/useI18n";
import FormField from "@/components/forms/FormField";
import SelectInput from "@/components/forms/SelectInput";
import AutoCompleteIdentificador from "@/components/forms/AutoCompleteIdentificador";
import MOSelector from "@/components/forms/MOSelector";
import {
    FALLECIMIENTO_FORM_INICIAL,
    TIPOS_MUERTE,
    TIPOS_MUERTE_CA,
    validarFallecimiento,
    enviarFallecimiento,
    getFallecimientoErrorMessage,
    formatearFechaDisplay,
    type FallecimientoForm,
} from "@/lib/bovinos/fallecimiento";
import { useListarBovinos } from "@/hooks/useListarBovinos";
import { useAutoCompleteBovinos } from "@/hooks/useAutoCompleteBovinos";

// ─── DateInput dd/mm/aaaa ─────────────────────────────────────────────────────

function DateInputDMY({
                          value,
                          onChange,
                          placeholder,
                      }: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
}) {
    const [inputValue, setInputValue] = useState(
        value ? formatearFechaDisplay(value) : ""
    );

    const handleChange = (raw: string) => {
        let digits = raw.replace(/[^\d]/g, "");
        if (digits.length > 8) digits = digits.slice(0, 8);
        let formatted = digits;
        if (digits.length > 2) formatted = digits.slice(0, 2) + "/" + digits.slice(2);
        if (digits.length > 4) formatted = formatted.slice(0, 5) + "/" + formatted.slice(5);
        setInputValue(formatted);
        if (digits.length === 8) {
            const day   = digits.slice(0, 2);
            const month = digits.slice(2, 4);
            const year  = digits.slice(4, 8);
            onChange(`${year}-${month}-${day}`);
        } else {
            onChange("");
        }
    };

    return (
        <div className="flex items-center border border-surface-variant rounded-xl px-3 py-2.5 bg-surface focus-within:border-error-red transition-colors">
            <svg className="w-4 h-4 text-blue-grey shrink-0 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
            </svg>
            <input
                type="text"
                value={inputValue}
                onChange={(e) => handleChange(e.target.value)}
                placeholder={placeholder ?? "dd/mm/aaaa"}
                maxLength={10}
                inputMode="numeric"
                className="flex-1 text-sm bg-transparent outline-none text-dark-blue-grey placeholder-blue-grey/50"
            />
        </div>
    );
}

// ─── Toggle cadáver inaccesible ───────────────────────────────────────────────

function ToggleCadaver({
                           value,
                           onChange,
                           label,
                       }: {
    value: boolean;
    onChange: (v: boolean) => void;
    label: string;
}) {
    return (
        <button
            type="button"
            onClick={() => onChange(!value)}
            className="flex items-center justify-between w-full py-1"
        >
            <span className="text-sm text-dark-blue-grey">{label}</span>
            <div
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                    value ? "bg-error-red" : "bg-surface-variant"
                }`}
            >
        <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                value ? "translate-x-5" : "translate-x-0"
            }`}
        />
            </div>
        </button>
    );
}

// ─── Modal error ──────────────────────────────────────────────────────────────

function ErrorModal({
                        mensaje,
                        onClose,
                        lang,
                    }: {
    mensaje: string;
    onClose: () => void;
    lang: string;
}) {
    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
                <div className="flex flex-col items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-error-red-bg rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-error-red" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                        </svg>
                    </div>
                    <h3 className="text-base font-bold text-dark-blue-grey">Error</h3>
                    <p className="text-sm text-blue-grey text-center">{mensaje}</p>
                </div>
                <button
                    onClick={onClose}
                    className="w-full bg-error-red text-white rounded-xl py-2.5 text-sm font-semibold"
                >
                    {lang === "ca" ? "Acceptar" : "Aceptar"}
                </button>
            </div>
        </div>
    );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function FallecimientoPage() {
    const { toggle } = useDrawer();
    const { lang }   = useI18n();

    const [form, setForm]         = useState<FallecimientoForm>(FALLECIMIENTO_FORM_INICIAL);
    const [enviando, setEnviando] = useState(false);
    const [exito, setExito]       = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [mostrarConfirm, setMostrarConfirm] = useState(false);

    const t = (es: string, ca: string) => lang === "ca" ? ca : es;
    const update = useCallback(
        (field: Partial<FallecimientoForm>) => setForm((prev) => ({ ...prev, ...field })),
        []
    );

    const { lista: listaBovinos, cargarBovinos } = useListarBovinos();
    useEffect(() => { cargarBovinos(); }, [cargarBovinos]);

    const { suggestions, activeField, isLoading, buscar, limpiarSugerencias } =
        useAutoCompleteBovinos(listaBovinos);

    const tiposMuerte = lang === "ca" ? TIPOS_MUERTE_CA : TIPOS_MUERTE;
    const esAborto    = form.tipus === "02";

    // Label del campo identificador cambia según tipo
    const labelIdentificador = esAborto
        ? t("Identificador madre *", "Identificador mare *")
        : t("Identificador animal *", "Identificador animal *");

    const handleEnviar = () => {
        setExito(false);
        const err = validarFallecimiento(form);
        if (err) {
            setErrorMsg(getFallecimientoErrorMessage(err.codigo, lang));
            return;
        }
        setMostrarConfirm(true);
    };

    const confirmarEnvio = async () => {
        setMostrarConfirm(false);
        setEnviando(true);
        const resultado = await enviarFallecimiento(form);
        setEnviando(false);
        if (!resultado.exito) {
            setErrorMsg(
                resultado.error?.tipo === "api"
                    ? resultado.error.mensaje
                    : t("Error de conexión con la GTR API", "Error de connexió amb la GTR API")
            );
            return;
        }
        setExito(true);
        setForm(FALLECIMIENTO_FORM_INICIAL);
    };

    const esValido = !validarFallecimiento(form);

    return (
        <div className="min-h-screen bg-surface">
            <TopBar
                title={t("Registrar Fallecimiento", "Registrar Defunció")}
                onMenuClick={toggle}
                accentColor="red"
                showBack
            />

            <div className="px-4 py-4 flex flex-col gap-4 pb-24">

                {/* Selector MO */}
                <div className="flex justify-start">
                    <MOSelector variant="red" />
                </div>

                {/* Tipo de muerte */}
                <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-4">
                    <h2 className="text-sm font-bold text-dark-blue-grey">
                        {t("Tipo de muerte", "Tipus de mort")}
                    </h2>
                    <FormField label={`${t("Tipo", "Tipus")} *`}>
                        <SelectInput
                            value={form.tipus}
                            onChange={(c, n) => {
                                // Al cambiar tipo, limpiar campos dependientes
                                update({
                                    tipus: c,
                                    tipusNombre: n,
                                    mesosGestacio: "",
                                    identificador: "",
                                });
                                limpiarSugerencias();
                            }}
                            options={tiposMuerte}
                            placeholder={t("Seleccionar tipo", "Seleccionar tipus")}
                        />
                    </FormField>
                </div>

                {/* Identificador */}
                <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-4">
                    <h2 className="text-sm font-bold text-dark-blue-grey">
                        {t("Identificación", "Identificació")}
                    </h2>

                    <AutoCompleteIdentificador
                        label={labelIdentificador}
                        value={form.identificador}
                        onChange={(v) => {
                            update({ identificador: v });
                            buscar(v, 0);
                        }}
                        onAnimalSelected={(animal) => {
                            update({ identificador: animal.identificador });
                            limpiarSugerencias();
                        }}
                        suggestions={activeField === 0 ? suggestions : []}
                        isLoading={isLoading && activeField === 0}
                        placeholder="ES724100041234"
                        lang={lang}
                    />

                    {/* Meses de gestación — solo visible si es aborto */}
                    {esAborto && (
                        <FormField label={`${t("Meses de gestación", "Mesos de gestació")} *`}>
                            <div className="flex items-center border border-surface-variant rounded-xl px-3 py-2.5 bg-surface focus-within:border-error-red transition-colors">
                                <input
                                    type="number"
                                    min={1}
                                    max={12}
                                    value={form.mesosGestacio}
                                    onChange={(e) => update({ mesosGestacio: e.target.value })}
                                    placeholder={t("Ej: 7", "Ex: 7")}
                                    inputMode="numeric"
                                    className="flex-1 text-sm bg-transparent outline-none text-dark-blue-grey placeholder-blue-grey/50"
                                />
                            </div>
                        </FormField>
                    )}
                </div>

                {/* Fecha y opciones */}
                <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-4">
                    <h2 className="text-sm font-bold text-dark-blue-grey">
                        {t("Fecha y opciones", "Data i opcions")}
                    </h2>

                    <FormField label={`${t("Fecha de muerte", "Data de mort")} *`}>
                        <DateInputDMY
                            value={form.dataMort}
                            onChange={(v) => update({ dataMort: v })}
                        />
                    </FormField>

                    <ToggleCadaver
                        value={form.cadaverInaccesible}
                        onChange={(v) => update({ cadaverInaccesible: v })}
                        label={t("Cadáver inaccesible", "Cadàver inaccessible")}
                    />
                </div>

                {/* Coordenadas (opcionales) */}
                <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-4">
                    <h2 className="text-sm font-bold text-dark-blue-grey">
                        {t("Coordenadas (opcional)", "Coordenades (opcional)")}
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                        <FormField label="X">
                            <div className="flex items-center border border-surface-variant rounded-xl px-3 py-2.5 bg-surface focus-within:border-error-red transition-colors">
                                <input
                                    type="text"
                                    value={form.coordenadaX}
                                    onChange={(e) => update({ coordenadaX: e.target.value })}
                                    placeholder="0.000000"
                                    inputMode="decimal"
                                    className="flex-1 text-sm bg-transparent outline-none text-dark-blue-grey placeholder-blue-grey/50"
                                />
                            </div>
                        </FormField>
                        <FormField label="Y">
                            <div className="flex items-center border border-surface-variant rounded-xl px-3 py-2.5 bg-surface focus-within:border-error-red transition-colors">
                                <input
                                    type="text"
                                    value={form.coordenadaY}
                                    onChange={(e) => update({ coordenadaY: e.target.value })}
                                    placeholder="0.000000"
                                    inputMode="decimal"
                                    className="flex-1 text-sm bg-transparent outline-none text-dark-blue-grey placeholder-blue-grey/50"
                                />
                            </div>
                        </FormField>
                    </div>
                </div>

                {/* Banner éxito */}
                {exito && (
                    <div className="px-4 py-3 bg-main-green-bg rounded-xl flex items-center gap-2">
                        <svg className="w-4 h-4 text-main-green shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        </svg>
                        <p className="text-xs text-main-green font-medium">
                            {t("Fallecimiento registrado correctamente", "Defunció registrada correctament")}
                        </p>
                    </div>
                )}
            </div>

            {/* Botón fijo */}
            <div className="fixed bottom-0 left-0 right-0 px-4 py-4 bg-white border-t border-surface-variant">
                <button
                    onClick={handleEnviar}
                    disabled={enviando || !esValido}
                    className="w-full bg-error-red text-white rounded-xl py-3 text-sm font-semibold disabled:opacity-40 transition-opacity"
                >
                    {enviando
                        ? t("Enviando...", "Enviant...")
                        : t("Registrar fallecimiento", "Registrar defunció")}
                </button>
            </div>

            {/* Modal confirmación */}
            {mostrarConfirm && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
                        <h3 className="text-base font-bold text-dark-blue-grey mb-2">
                            {t("Confirmar registro", "Confirmar registre")}
                        </h3>
                        <p className="text-sm text-blue-grey mb-4">
                            {t(
                                "¿Confirmas el registro del fallecimiento?",
                                "Confirmes el registre de la defunció?"
                            )}
                        </p>

                        <div className="bg-surface rounded-xl p-3 mb-5 flex flex-col gap-1.5">
                            <p className="text-xs text-blue-grey">
                                {t("Tipo", "Tipus")}:{" "}
                                <span className="text-dark-blue-grey font-medium">{form.tipusNombre}</span>
                            </p>
                            <p className="text-xs text-blue-grey">
                                {esAborto ? t("Madre", "Mare") : t("Animal", "Animal")}:{" "}
                                <span className="text-dark-blue-grey font-medium">{form.identificador}</span>
                            </p>
                            <p className="text-xs text-blue-grey">
                                {t("Fecha de muerte", "Data de mort")}:{" "}
                                <span className="text-dark-blue-grey font-medium">
                  {formatearFechaDisplay(form.dataMort)}
                </span>
                            </p>
                            {esAborto && form.mesosGestacio && (
                                <p className="text-xs text-blue-grey">
                                    {t("Meses gestación", "Mesos gestació")}:{" "}
                                    <span className="text-dark-blue-grey font-medium">{form.mesosGestacio}</span>
                                </p>
                            )}
                            <p className="text-xs text-blue-grey">
                                {t("Cadáver inaccesible", "Cadàver inaccessible")}:{" "}
                                <span className="text-dark-blue-grey font-medium">
                  {form.cadaverInaccesible ? t("Sí", "Sí") : t("No", "No")}
                </span>
                            </p>
                            {form.coordenadaX && (
                                <p className="text-xs text-blue-grey">
                                    {t("Coordenadas", "Coordenades")}:{" "}
                                    <span className="text-dark-blue-grey font-medium">
                    {form.coordenadaX}, {form.coordenadaY}
                  </span>
                                </p>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setMostrarConfirm(false)}
                                className="flex-1 border border-surface-variant text-blue-grey rounded-xl py-2.5 text-sm font-medium"
                            >
                                {t("Cancelar", "Cancel·lar")}
                            </button>
                            <button
                                onClick={confirmarEnvio}
                                className="flex-1 bg-error-red text-white rounded-xl py-2.5 text-sm font-semibold"
                            >
                                {t("Confirmar", "Confirmar")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal error */}
            {errorMsg && (
                <ErrorModal mensaje={errorMsg} onClose={() => setErrorMsg(null)} lang={lang} />
            )}

            {/* Loading overlay */}
            {enviando && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-2xl p-6 flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-error-red border-t-transparent rounded-full animate-spin"/>
                        <p className="text-sm text-blue-grey">{t("Enviando...", "Enviant...")}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
