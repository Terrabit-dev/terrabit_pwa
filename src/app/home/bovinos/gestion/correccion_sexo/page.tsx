"use client";

import { useState, useEffect } from "react";
import TopBar from "@/components/layout/TopBar";
import { useDrawer } from "@/context/DrawerContext";
import { useI18n } from "@/hooks/useI18n";
import FormField from "@/components/forms/FormField";
import SelectInput from "@/components/forms/SelectInput";
import AutoCompleteIdentificador from "@/components/forms/AutoCompleteIdentificador";
import ErrorModal from "@/components/common/ErrorModal";
import SuccessModal from "@/components/common/SuccessModal";
import LoadingOverlay from "@/components/common/LoadingOverlay";
import { SEXOS, SEXOS_CA } from "@/lib/bovinos/constants";
import { validarCorreccionSexo } from "@/lib/bovinos/correccionSexo";
import { getAppError } from "@/lib/errors/appErrors";
import { useCorreccionSexo } from "@/hooks/useCorreccionSexo";
import { useListarBovinos } from "@/hooks/useListarBovinos";
import { useAutoCompleteBovinos } from "@/hooks/useAutoCompleteBovinos";

export default function CorreccionSexoPage() {
    const { toggle }  = useDrawer();
    const { t, lang } = useI18n();

    const {
        form, enviando, exito, errorApi,
        update, enviar, cerrarExito, limpiarErrorApi,
    } = useCorreccionSexo();

    const [errorLocal, setErrorLocal]         = useState<string | null>(null);
    const [mostrarConfirm, setMostrarConfirm] = useState(false);

    const { lista: listaBovinos, cargarBovinos } = useListarBovinos();
    useEffect(() => { cargarBovinos(); }, [cargarBovinos]);

    const { suggestions, activeField, isLoading, buscar, limpiarSugerencias } =
        useAutoCompleteBovinos(listaBovinos);

    const sexos = lang === "ca" ? SEXOS_CA : SEXOS;

    const errorApiMsg = errorApi
        ? errorApi.tipo === "api" ? errorApi.mensaje : t("errors.network")
        : null;

    const handleEnviar = () => {
        setErrorLocal(null);
        const err = validarCorreccionSexo(form);
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

    const esValido = !validarCorreccionSexo(form);

    return (
        <div className="min-h-screen bg-surface">
            <TopBar
                title={lang === "ca" ? "Corregir Sexe" : "Corregir Sexo"}
                onMenuClick={toggle}
                accentColor="green"
                showBack
            />

            <div className="px-4 py-5 flex flex-col gap-4 pb-24">
                <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-4">

                    <AutoCompleteIdentificador
                        label={`${lang === "ca" ? "ID Animal" : "ID Animal"} *`}
                        value={form.identificador}
                        onChange={(v) => { update({ identificador: v }); buscar(v, 0); }}
                        onAnimalSelected={(a) => { update({ identificador: a.identificador }); limpiarSugerencias(); }}
                        suggestions={activeField === 0 ? suggestions : []}
                        isLoading={isLoading && activeField === 0}
                        placeholder="ES724100041234"
                        lang={lang}
                    />

                    <FormField label={`${lang === "ca" ? "Sexe" : "Sexo"} *`}>
                        <SelectInput
                            value={form.sexoCodigo}
                            onChange={(c, n) => update({ sexoCodigo: c, sexoNombre: n })}
                            options={sexos}
                            placeholder={lang === "ca" ? "Seleccionar sexe" : "Seleccionar sexo"}
                        />
                    </FormField>
                </div>
            </div>

            {/* Botón fijo */}
            <div className="fixed bottom-0 left-0 right-0 px-4 py-4 bg-white border-t border-surface-variant">
                <button
                    onClick={handleEnviar}
                    disabled={enviando || !esValido}
                    className="w-full bg-main-green text-white rounded-xl py-3 text-sm font-semibold disabled:opacity-40 transition-opacity"
                >
                    {enviando
                        ? t("common.loading")
                        : lang === "ca" ? "Corregir sexe" : "Corregir sexo"}
                </button>
            </div>

            {/* Modal confirmación */}
            {mostrarConfirm && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
                        <h3 className="text-base font-bold text-dark-blue-grey mb-2">
                            {lang === "ca" ? "Confirmar correcció" : "Confirmar corrección"}
                        </h3>
                        <p className="text-sm text-blue-grey mb-4">
                            {lang === "ca"
                                ? "Confirmes la correcció del sexe?"
                                : "¿Confirmas la corrección del sexo?"}
                        </p>
                        <div className="bg-surface rounded-xl p-3 mb-5 flex flex-col gap-1.5">
                            <p className="text-xs text-blue-grey">
                                {lang === "ca" ? "Animal" : "Animal"}:{" "}
                                <span className="text-dark-blue-grey font-medium">{form.identificador}</span>
                            </p>
                            <p className="text-xs text-blue-grey">
                                {lang === "ca" ? "Nou sexe" : "Nuevo sexo"}:{" "}
                                <span className="text-dark-blue-grey font-medium">{form.sexoNombre}</span>
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
                    titulo={lang === "ca" ? "Sexe corregit" : "Sexo corregido"}
                    mensaje={lang === "ca"
                        ? "La correcció del sexe s'ha registrat correctament al sistema GTR."
                        : "La corrección del sexo ha sido registrada correctamente en el sistema GTR."}
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