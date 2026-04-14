"use client";

import { useState, useEffect } from "react";
import TopBar from "@/components/layout/TopBar";
import { useDrawer } from "@/context/DrawerContext";
import { useI18n } from "@/hooks/useI18n";
import FormField from "@/components/forms/FormField";
import SelectInput from "@/components/forms/SelectInput";
import AutoCompleteIdentificador from "@/components/forms/AutoCompleteIdentificador";
import {
    RAZAS_BOVINAS,
    SEXOS, SEXOS_CA,
    APTITUDES, APTITUDES_CA,
} from "@/lib/bovinos/constants";
import {
    NACIMIENTO_FORM_INICIAL,
    type NacimientoForm,
} from "@/lib/bovinos/types";
import {
    validarNacimiento,
    enviarNacimiento,
    formatearFechaDisplay,
} from "@/lib/bovinos/nacimiento";
import { getErrorMessage } from "@/lib/bovinos/errors";
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
            const day = digits.slice(0, 2);
            const month = digits.slice(2, 4);
            const year = digits.slice(4, 8);
            onChange(`${year}-${month}-${day}`);
        } else {
            onChange("");
        }
    };

    return (
        <div className="flex items-center border border-surface-variant rounded-xl px-3 py-2.5 bg-surface focus-within:border-main-green transition-colors">
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

// ─── Modal error ──────────────────────────────────────────────────────────────

function ErrorModal({ mensaje, onClose, lang }: { mensaje: string; onClose: () => void; lang: string }) {
    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
                <div className="flex flex-col items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-error-red-bg rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-error-red" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                        </svg>
                    </div>
                    <h3 className="text-base font-bold text-dark-blue-grey text-center">
                        {lang === "ca" ? "Error" : "Error"}
                    </h3>
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

// ─── Pantalla ─────────────────────────────────────────────────────────────────

export default function NacimientoPage() {
    const { toggle } = useDrawer();
    const { lang }   = useI18n();

    const [form, setForm]             = useState<NacimientoForm>(NACIMIENTO_FORM_INICIAL);
    const [enviando, setEnviando]     = useState(false);
    const [exito, setExito]           = useState(false);
    const [errorMsg, setErrorMsg]     = useState<string | null>(null);
    const [mostrarConfirm, setMostrarConfirm] = useState(false);

    const t = (es: string, ca: string) => lang === "ca" ? ca : es;
    const update = (field: Partial<NacimientoForm>) =>
        setForm((prev) => ({ ...prev, ...field }));

    // Carga la lista de bovinos para autocompletado
    const { lista: listaBovinos, cargarBovinos } = useListarBovinos();
    useEffect(() => { cargarBovinos(); }, [cargarBovinos]);

    // Autocompletado — campo 0 = madre, campo 1 = cría
    const { suggestions, activeField, isLoading, buscar, limpiarSugerencias } =
        useAutoCompleteBovinos(listaBovinos);

    const sexos    = lang === "ca" ? SEXOS_CA : SEXOS;
    const aptitudes = lang === "ca" ? APTITUDES_CA : APTITUDES;

    const handleEnviar = () => {
        setExito(false);
        const err = validarNacimiento(form);
        if (err) { setErrorMsg(getErrorMessage(err.codigo, lang)); return; }
        setMostrarConfirm(true);
    };

    const confirmarEnvio = async () => {
        setMostrarConfirm(false);
        setEnviando(true);
        const resultado = await enviarNacimiento(form);
        setEnviando(false);
        if (!resultado.exito) {
            if (resultado.error?.tipo === "api") {
                setErrorMsg(resultado.error.mensaje);
            } else {
                setErrorMsg(t("Error de conexión con la GTR API", "Error de connexió amb la GTR API"));
            }
            return;
        }
        setExito(true);
        setForm(NACIMIENTO_FORM_INICIAL);
    };

    const esValido = !validarNacimiento(form);

    return (
        <div className="min-h-screen bg-surface">
            <TopBar
                title={t("Nacimiento", "Naixement")}
                onMenuClick={toggle}
                accentColor="green"
                showBack
            />

            <div className="px-4 py-5 flex flex-col gap-4 pb-24">

                {/* Identificadores */}
                <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-4">
                    <h2 className="text-sm font-bold text-dark-blue-grey">
                        {t("Identificadores", "Identificadors")}
                    </h2>

                    <AutoCompleteIdentificador
                        label={`${t("Identificador madre", "Identificador mare")} *`}
                        value={form.idMadre}
                        onChange={(v) => {
                            update({ idMadre: v });
                            buscar(v, 0);
                        }}
                        onAnimalSelected={(animal) => {
                            update({ idMadre: animal.identificador });
                            limpiarSugerencias();
                        }}
                        suggestions={activeField === 0 ? suggestions : []}
                        isLoading={isLoading && activeField === 0}
                        placeholder="ES724100041234"
                        lang={lang}
                    />

                    <AutoCompleteIdentificador
                        label={`${t("Identificador cría", "Identificador cria")} *`}
                        value={form.idCria}
                        onChange={(v) => {
                            update({ idCria: v });
                            buscar(v, 1);
                        }}
                        onAnimalSelected={(animal) => {
                            update({ idCria: animal.identificador });
                            limpiarSugerencias();
                        }}
                        suggestions={activeField === 1 ? suggestions : []}
                        isLoading={isLoading && activeField === 1}
                        placeholder="ES724100041235"
                        lang={lang}
                    />
                </div>

                {/* Fechas */}
                <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-4">
                    <h2 className="text-sm font-bold text-dark-blue-grey">
                        {t("Fechas", "Dates")}
                    </h2>
                    <FormField label={`${t("Fecha de nacimiento", "Data de naixement")} *`}>
                        <DateInputDMY
                            value={form.fechaNacimiento}
                            onChange={(v) => update({ fechaNacimiento: v })}
                        />
                    </FormField>
                    <FormField label={t("Fecha de identificación", "Data d'identificació")}>
                        <DateInputDMY
                            value={form.fechaIdentificacion}
                            onChange={(v) => update({ fechaIdentificacion: v })}
                        />
                    </FormField>
                </div>

                {/* Características */}
                <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-4">
                    <h2 className="text-sm font-bold text-dark-blue-grey">
                        {t("Características", "Característiques")}
                    </h2>
                    <FormField label={`${t("Sexo", "Sexe")} *`}>
                        <SelectInput
                            value={form.sexoCodigo}
                            onChange={(c, n) => update({ sexoCodigo: c, sexoNombre: n })}
                            options={sexos}
                            placeholder={t("Seleccionar sexo", "Seleccionar sexe")}
                        />
                    </FormField>
                    <FormField label={`${t("Raza", "Raça")} *`}>
                        <SelectInput
                            value={form.razaCodigo}
                            onChange={(c, n) => update({ razaCodigo: c, razaNombre: n })}
                            options={RAZAS_BOVINAS}
                            placeholder={t("Seleccionar raza", "Seleccionar raça")}
                        />
                    </FormField>
                    <FormField label={`${t("Aptitud", "Aptitud")} *`}>
                        <SelectInput
                            value={form.aptitudCodigo}
                            onChange={(c, n) => update({ aptitudCodigo: c, aptitudNombre: n })}
                            options={aptitudes}
                            placeholder={t("Seleccionar aptitud", "Seleccionar aptitud")}
                        />
                    </FormField>
                </div>

                {/* Éxito */}
                {exito && (
                    <div className="px-4 py-3 bg-main-green-bg rounded-xl flex items-center gap-2">
                        <svg className="w-4 h-4 text-main-green shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        </svg>
                        <p className="text-xs text-main-green font-medium">
                            {t("Nacimiento registrado correctamente", "Naixement registrat correctament")}
                        </p>
                    </div>
                )}
            </div>

            {/* Botón fijo */}
            <div className="fixed bottom-0 left-0 right-0 px-4 py-4 bg-white border-t border-surface-variant">
                <button
                    onClick={handleEnviar}
                    disabled={enviando || !esValido}
                    className="w-full bg-main-green text-white rounded-xl py-3 text-sm font-semibold disabled:opacity-40 transition-opacity"
                >
                    {enviando
                        ? t("Enviando...", "Enviant...")
                        : t("Registrar nacimiento", "Registrar naixement")}
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
                            {t("¿Confirmas el registro del nacimiento?", "Confirmes el registre del naixement?")}
                        </p>
                        <div className="bg-surface rounded-xl p-3 mb-5 flex flex-col gap-1.5">
                            <p className="text-xs text-blue-grey">{t("Madre", "Mare")}: <span className="text-dark-blue-grey font-medium">{form.idMadre}</span></p>
                            <p className="text-xs text-blue-grey">{t("Cría", "Cria")}: <span className="text-dark-blue-grey font-medium">{form.idCria}</span></p>
                            <p className="text-xs text-blue-grey">{t("Fecha nacimiento", "Data naixement")}: <span className="text-dark-blue-grey font-medium">{formatearFechaDisplay(form.fechaNacimiento)}</span></p>
                            {form.fechaIdentificacion && (
                                <p className="text-xs text-blue-grey">{t("Fecha identificación", "Data identificació")}: <span className="text-dark-blue-grey font-medium">{formatearFechaDisplay(form.fechaIdentificacion)}</span></p>
                            )}
                            <p className="text-xs text-blue-grey">{t("Sexo", "Sexe")}: <span className="text-dark-blue-grey font-medium">{form.sexoNombre}</span></p>
                            <p className="text-xs text-blue-grey">{t("Raza", "Raça")}: <span className="text-dark-blue-grey font-medium">{form.razaNombre}</span></p>
                            <p className="text-xs text-blue-grey">{t("Aptitud", "Aptitud")}: <span className="text-dark-blue-grey font-medium">{form.aptitudNombre}</span></p>
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
                                className="flex-1 bg-main-green text-white rounded-xl py-2.5 text-sm font-semibold"
                            >
                                {t("Confirmar", "Confirmar")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal error */}
            {errorMsg && (
                <ErrorModal mensaje={errorMsg} onClose={() => setErrorMsg(null)} lang={lang}/>
            )}

            {/* Loading overlay */}
            {enviando && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-2xl p-6 flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-main-green border-t-transparent rounded-full animate-spin"/>
                        <p className="text-sm text-blue-grey">{t("Enviando...", "Enviant...")}</p>
                    </div>
                </div>
            )}
        </div>
    );
}