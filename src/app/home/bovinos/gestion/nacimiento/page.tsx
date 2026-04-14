"use client";

import { useState } from "react";
import TopBar from "@/components/layout/TopBar";
import { useDrawer } from "@/context/DrawerContext";
import { useI18n } from "@/hooks/useI18n";
import FormField from "@/components/forms/FormField";
import TextInput from "@/components/forms/TextInput";
import DateInput from "@/components/forms/DateInput";
import SelectInput from "@/components/forms/SelectInput";
import {
    RAZAS_BOVINAS,
    SEXOS, SEXOS_CA,
    APTITUDES, APTITUDES_CA,
} from "@/lib/bovinos/constants";
import {
    NACIMIENTO_FORM_INICIAL,
    type NacimientoForm,
} from "@/lib/bovinos/types";
import { validarNacimiento, enviarNacimiento } from "@/lib/bovinos/nacimiento";

export default function NacimientoPage() {
    const { toggle } = useDrawer();
    const { lang } = useI18n();

    const [form, setForm] = useState<NacimientoForm>(NACIMIENTO_FORM_INICIAL);
    const [enviando, setEnviando]         = useState(false);
    const [exito, setExito]               = useState(false);
    const [error, setError]               = useState<string | null>(null);
    const [mostrarConfirm, setMostrarConfirm] = useState(false);

    const t = (es: string, ca: string) => lang === "ca" ? ca : es;

    const update = (field: Partial<NacimientoForm>) =>
        setForm((prev) => ({ ...prev, ...field }));

    const handleEnviar = () => {
        const err = validarNacimiento(form);
        if (err) { setError(err); return; }
        setError(null);
        setMostrarConfirm(true);
    };

    const confirmarEnvio = async () => {
        setMostrarConfirm(false);
        setEnviando(true);
        try {
            const res = await enviarNacimiento(form);
            if (res.errors && res.errors.length > 0) {
                setError(res.errors[0].descripcio);
            } else {
                setExito(true);
                setForm(NACIMIENTO_FORM_INICIAL);
            }
        } catch {
            setError(t("Error de conexión", "Error de connexió"));
        } finally {
            setEnviando(false);
        }
    };

    const esValido = !validarNacimiento(form);
    const sexos    = lang === "ca" ? SEXOS_CA : SEXOS;
    const aptitudes = lang === "ca" ? APTITUDES_CA : APTITUDES;

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
                    <FormField label={t("Identificador madre", "Identificador mare")}>
                        <TextInput
                            value={form.idMadre}
                            onChange={(v) => update({ idMadre: v })}
                            placeholder="ES724100041234"
                        />
                    </FormField>
                    <FormField label={`${t("Identificador cría", "Identificador cria")} *`}>
                        <TextInput
                            value={form.idCria}
                            onChange={(v) => update({ idCria: v })}
                            placeholder="ES724100041235"
                        />
                    </FormField>
                </div>

                {/* Fechas */}
                <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-4">
                    <h2 className="text-sm font-bold text-dark-blue-grey">
                        {t("Fechas", "Dates")}
                    </h2>
                    <FormField label={`${t("Fecha de nacimiento", "Data de naixement")} *`}>
                        <DateInput
                            value={form.fechaNacimiento}
                            onChange={(v) => update({ fechaNacimiento: v })}
                        />
                    </FormField>
                    <FormField label={t("Fecha de identificación", "Data d'identificació")}>
                        <DateInput
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
                    <FormField label={t("Aptitud", "Aptitud")}>
                        <SelectInput
                            value={form.aptitudCodigo}
                            onChange={(c, n) => update({ aptitudCodigo: c, aptitudNombre: n })}
                            options={aptitudes}
                            placeholder={t("Seleccionar aptitud", "Seleccionar aptitud")}
                        />
                    </FormField>
                </div>

                {/* Error */}
                {error && (
                    <div className="px-4 py-3 bg-error-red-bg rounded-xl">
                        <p className="text-xs text-error-red text-center">{error}</p>
                    </div>
                )}

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

            {/* Botón enviar fijo */}
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
                            {form.idMadre && (
                                <p className="text-xs text-blue-grey">
                                    {t("Madre", "Mare")}: <span className="text-dark-blue-grey font-medium">{form.idMadre}</span>
                                </p>
                            )}
                            <p className="text-xs text-blue-grey">
                                {t("Cría", "Cria")}: <span className="text-dark-blue-grey font-medium">{form.idCria}</span>
                            </p>
                            <p className="text-xs text-blue-grey">
                                {t("Fecha", "Data")}: <span className="text-dark-blue-grey font-medium">{form.fechaNacimiento}</span>
                            </p>
                            <p className="text-xs text-blue-grey">
                                {t("Sexo", "Sexe")}: <span className="text-dark-blue-grey font-medium">{form.sexoNombre}</span>
                            </p>
                            <p className="text-xs text-blue-grey">
                                {t("Raza", "Raça")}: <span className="text-dark-blue-grey font-medium">{form.razaNombre}</span>
                            </p>
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
        </div>
    );
}