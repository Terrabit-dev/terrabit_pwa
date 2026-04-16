"use client";

import { useState, useEffect } from "react";
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
import { RAZAS_BOVINAS, SEXOS, SEXOS_CA, APTITUDES, APTITUDES_CA } from "@/lib/bovinos/constants";
import { validarNacimiento, formatearFechaDisplay } from "@/lib/bovinos/nacimiento";
import { getAppError } from "@/lib/errors/appErrors";
import { useNacimiento } from "@/hooks/useNacimiento";
import { useListarBovinos } from "@/hooks/useListarBovinos";
import { useAutoCompleteBovinos } from "@/hooks/useAutoCompleteBovinos";

export default function IdentificacionPage() {
    const { toggle }  = useDrawer();
    const { t, lang } = useI18n();

    const {
        form, enviando, exito, errorApi,
        update, enviar, cerrarExito, limpiarErrorApi,
    } = useNacimiento();

    const [errorLocal, setErrorLocal]         = useState<string | null>(null);
    const [mostrarConfirm, setMostrarConfirm] = useState(false);

    const { lista: listaBovinos, cargarBovinos } = useListarBovinos();
    useEffect(() => { cargarBovinos(); }, [cargarBovinos]);

    const { suggestions, activeField, isLoading, buscar, limpiarSugerencias } =
        useAutoCompleteBovinos(listaBovinos);

    const sexos     = lang === "ca" ? SEXOS_CA : SEXOS;
    const aptitudes = lang === "ca" ? APTITUDES_CA : APTITUDES;

    const errorApiMsg = errorApi
        ? errorApi.tipo === "api"
            ? errorApi.mensaje
            : t("errors.network")
        : null;

    const handleEnviar = () => {
        setErrorLocal(null);
        const err = validarNacimiento(form);
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

    const esValido = !validarNacimiento(form);

    return (
        <div className="min-h-screen bg-surface">
            <TopBar title={t("bovinos.nacimiento")} onMenuClick={toggle} accentColor="green" showBack/>

            <div className="px-4 py-5 flex flex-col gap-4 pb-24">

                {/* Identificadores */}
                <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-4">
                    <h2 className="text-sm font-bold text-dark-blue-grey">
                        {lang === "ca" ? "Identificadors" : "Identificadores"}
                    </h2>
                    <AutoCompleteIdentificador
                        label={`${lang === "ca" ? "Identificador mare" : "Identificador madre"} *`}
                        value={form.idMadre}
                        onChange={(v) => { update({ idMadre: v }); buscar(v, 0); }}
                        onAnimalSelected={(a) => { update({ idMadre: a.identificador }); limpiarSugerencias(); }}
                        suggestions={activeField === 0 ? suggestions : []}
                        isLoading={isLoading && activeField === 0}
                        placeholder="ES724100041234"
                        lang={lang}
                    />
                    <AutoCompleteIdentificador
                        label={`${lang === "ca" ? "Identificador cria" : "Identificador cría"} *`}
                        value={form.idCria}
                        onChange={(v) => { update({ idCria: v }); buscar(v, 1); }}
                        onAnimalSelected={(a) => { update({ idCria: a.identificador }); limpiarSugerencias(); }}
                        suggestions={activeField === 1 ? suggestions : []}
                        isLoading={isLoading && activeField === 1}
                        placeholder="ES724100041235"
                        lang={lang}
                    />
                </div>

                {/* Fechas */}
                <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-4">
                    <h2 className="text-sm font-bold text-dark-blue-grey">
                        {lang === "ca" ? "Dates" : "Fechas"}
                    </h2>
                    <FormField label={`${lang === "ca" ? "Data de naixement" : "Fecha de nacimiento"} *`}>
                        <DateInputDMY
                            value={form.fechaNacimiento}
                            onChange={(v) => update({ fechaNacimiento: v })}
                        />
                    </FormField>
                    <FormField label={lang === "ca" ? "Data d'identificació" : "Fecha de identificación"}>
                        <DateInputDMY
                            value={form.fechaIdentificacion}
                            onChange={(v) => update({ fechaIdentificacion: v })}
                        />
                    </FormField>
                </div>

                {/* Características */}
                <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-4">
                    <h2 className="text-sm font-bold text-dark-blue-grey">
                        {lang === "ca" ? "Característiques" : "Características"}
                    </h2>
                    <FormField label={`${lang === "ca" ? "Sexe" : "Sexo"} *`}>
                        <SelectInput
                            value={form.sexoCodigo}
                            onChange={(c, n) => update({ sexoCodigo: c, sexoNombre: n })}
                            options={sexos}
                            placeholder={lang === "ca" ? "Seleccionar sexe" : "Seleccionar sexo"}
                        />
                    </FormField>
                    <FormField label={`${lang === "ca" ? "Raça" : "Raza"} *`}>
                        <SelectInput
                            value={form.razaCodigo}
                            onChange={(c, n) => update({ razaCodigo: c, razaNombre: n })}
                            options={RAZAS_BOVINAS}
                            placeholder={lang === "ca" ? "Seleccionar raça" : "Seleccionar raza"}
                        />
                    </FormField>
                    <FormField label="Aptitud *">
                        <SelectInput
                            value={form.aptitudCodigo}
                            onChange={(c, n) => update({ aptitudCodigo: c, aptitudNombre: n })}
                            options={aptitudes}
                            placeholder="Seleccionar aptitud"
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
                    {enviando ? t("common.loading") : t("gestion.nacimiento")}
                </button>
            </div>

            {/* Modal confirmación */}
            {mostrarConfirm && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
                        <h3 className="text-base font-bold text-dark-blue-grey mb-2">
                            {lang === "ca" ? "Confirmar registre" : "Confirmar registro"}
                        </h3>
                        <p className="text-sm text-blue-grey mb-4">
                            {lang === "ca"
                                ? "Confirmes el registre del naixement?"
                                : "¿Confirmas el registro del nacimiento?"}
                        </p>
                        <div className="bg-surface rounded-xl p-3 mb-5 flex flex-col gap-1.5">
                            <p className="text-xs text-blue-grey">
                                {lang === "ca" ? "Mare" : "Madre"}:{" "}
                                <span className="text-dark-blue-grey font-medium">{form.idMadre}</span>
                            </p>
                            <p className="text-xs text-blue-grey">
                                {lang === "ca" ? "Cria" : "Cría"}:{" "}
                                <span className="text-dark-blue-grey font-medium">{form.idCria}</span>
                            </p>
                            <p className="text-xs text-blue-grey">
                                {lang === "ca" ? "Data naixement" : "Fecha nacimiento"}:{" "}
                                <span className="text-dark-blue-grey font-medium">
                                    {formatearFechaDisplay(form.fechaNacimiento)}
                                </span>
                            </p>
                            {form.fechaIdentificacion && (
                                <p className="text-xs text-blue-grey">
                                    {lang === "ca" ? "Data identificació" : "Fecha identificación"}:{" "}
                                    <span className="text-dark-blue-grey font-medium">
                                        {formatearFechaDisplay(form.fechaIdentificacion)}
                                    </span>
                                </p>
                            )}
                            <p className="text-xs text-blue-grey">
                                {lang === "ca" ? "Sexe" : "Sexo"}:{" "}
                                <span className="text-dark-blue-grey font-medium">{form.sexoNombre}</span>
                            </p>
                            <p className="text-xs text-blue-grey">
                                {lang === "ca" ? "Raça" : "Raza"}:{" "}
                                <span className="text-dark-blue-grey font-medium">{form.razaNombre}</span>
                            </p>
                            <p className="text-xs text-blue-grey">
                                Aptitud:{" "}
                                <span className="text-dark-blue-grey font-medium">{form.aptitudNombre}</span>
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

            {/* Success modal */}
            {exito && (
                <SuccessModal
                    titulo={lang === "ca" ? "Naixement registrat" : "Nacimiento registrado"}
                    mensaje={lang === "ca"
                        ? "El naixement ha estat registrat correctament al sistema GTR."
                        : "El nacimiento ha sido registrado correctamente en el sistema GTR."}
                    boton={lang === "ca" ? "Acceptar" : "Aceptar"}
                    onClose={cerrarExito}
                />
            )}

            {/* Error local — validación de campos */}
            {errorLocal && (
                <ErrorModal
                    mensaje={errorLocal}
                    onClose={() => setErrorLocal(null)}
                    lang={lang}
                />
            )}

            {/* Error API — descripcio del servidor o error de red */}
            {errorApiMsg && (
                <ErrorModal
                    mensaje={errorApiMsg}
                    onClose={limpiarErrorApi}
                    lang={lang}
                />
            )}

            {enviando && <LoadingOverlay mensaje={t("common.loading")}/>}
        </div>
    );
}