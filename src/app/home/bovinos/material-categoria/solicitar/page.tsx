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
import { getAppError } from "@/lib/errors/appErrors";
import { useSolicitudMaterial } from "@/hooks/useSolicitudMaterial";

import {
    EMPRESAS_SUBMINISTRADORAS,
    TIPOS_ENVIO,
    TIPOS_DIRECCION,
    OFICINAS_COMARCALES
} from "@/lib/bovinos/constants";

// ─── Importamos lo específico de este formulario ───
import {
    TIPOS_MATERIAL,
    requiereCodiExplotacio,
    validarSolicitudMaterial
} from "@/lib/bovinos/solicitudMaterial";

interface OpcionMapa {
    codigo: string;
    nombre: string;
    nombreEs?: string;
}
export default function SolicitudMaterialPage() {
    const { toggle }  = useDrawer();
    const { t, lang } = useI18n();
    const searchParams = useSearchParams();

    // 1. PRIMERO extraemos el form del hook
    const {
        form, enviando, exito, codigoSeguimiento, errorApi, isReadOnly,
        update, enviar, cerrarExito, limpiarErrorApi,
        cargarBorrador, guardarBorradorActual, cargarDesdeHistorial
    } = useSolicitudMaterial();

    // 2. LUEGO calculamos si es válido (ahora sí existe form)
    const esValido = validarSolicitudMaterial(form) === null;

    const [errorLocal, setErrorLocal] = useState<string | null>(null);
    const [mostrarConfirm, setMostrarConfirm] = useState(false);

    const errorApiMsg = errorApi
        ? errorApi.tipo === "api" ? errorApi.mensaje : t("errors.network")
        : null;

    const updateUnitat = (index: number, field: keyof typeof form.unitats[0], value: string) => {
        if (field === "nombreUnitats") {
            // Elimina cualquier carácter que no sea un dígito
            const soloNumeros = value.replace(/\D/g, "");
            // Limita a 3 cifras
            if (soloNumeros.length > 3) return;
            value = soloNumeros; // Reasignamos el valor limpio
        }

        const novesUnitats = [...form.unitats];
        novesUnitats[index] = { ...novesUnitats[index], [field]: value };
        update({ unitats: novesUnitats });
    };

    const addUnitat = () => update({ unitats: [...form.unitats, { nombreUnitats: "", codiExplotacio: "" }] });
    const removeUnitat = (index: number) => update({ unitats: form.unitats.filter((_, i) => i !== index) });

    const mostrarCodiGlobal = form.unitats.length > 1 || requiereCodiExplotacio(form.tipusMaterial);

    const mapIdiomas = (arr: OpcionMapa[]) => arr.map(item => ({
        codigo: item.codigo,
        nombre: lang === "ca" ? item.nombre : (item.nombreEs || item.nombre)
    }));

    useEffect(() => {
        const draftId = searchParams.get("draftId");
        const historyId = searchParams.get("historyId");
        if (draftId) cargarBorrador(Number(draftId));
        else if (historyId) cargarDesdeHistorial(Number(historyId));
    }, [searchParams, cargarBorrador, cargarDesdeHistorial]);

    const handleGuardarBorrador = async () => {
        const guardado = await guardarBorradorActual();
        if (guardado) alert(lang === "ca" ? "Esborrany desat!" : "¡Borrador guardado!");
    };

    const handleEnviar = () => {
        setErrorLocal(null);
        const err = validarSolicitudMaterial(form);
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

    return (
        <div className="min-h-screen bg-surface pointer-events-auto">
            <TopBar title={lang === "ca" ? "Sol·licitar Material" : "Solicitar Material"} onMenuClick={toggle} accentColor="green" showBack />

            <div className="px-4 py-5 flex flex-col gap-4 pb-24">
                {isReadOnly && form.codigoSeguimiento && (
                    <div className="bg-main-green/10 border-2 border-main-green/20 rounded-2xl p-4 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] uppercase font-bold text-main-green tracking-wider">
                                {lang === "ca" ? "Codi de seguiment" : "Código de seguimiento"}
                            </p>
                            <p className="text-lg font-mono font-bold text-dark-blue-grey leading-none mt-1">
                                {form.codigoSeguimiento}
                            </p>
                        </div>
                        <div className="bg-main-green text-white p-2 rounded-xl">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                        </div>
                    </div>
                )}

                {/* 1. Datos del Material */}
                <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-4">
                    <h2 className="text-sm font-bold text-dark-blue-grey">{lang === "ca" ? "Material i Subministrament" : "Material y Suministro"}</h2>

                    <div className={isReadOnly ? "opacity-70 pointer-events-none" : ""}>
                        <FormField label={`${lang === "ca" ? "Empresa subministradora" : "Empresa suministradora"} *`}>
                            <SelectInput
                                value={form.empresaSubministradora}
                                onChange={(c, n) => update({ empresaSubministradora: c, empresaSubministradoraNombre: n })}
                                options={EMPRESAS_SUBMINISTRADORAS}
                                placeholder={lang === "ca" ? "Selecciona..." : "Selecciona..."}
                            />
                        </FormField>
                    </div>

                    <div className={isReadOnly ? "opacity-70 pointer-events-none" : ""}>
                        <FormField label={`${lang === "ca" ? "Tipus de material" : "Tipo de material"} *`}>
                            <SelectInput
                                value={form.tipusMaterial}
                                onChange={(c, n) => {
                                    // Comprobamos si con el nuevo material seleccionado sigue siendo obligatorio
                                    const necesitaCodi = form.unitats.length > 1 || requiereCodiExplotacio(c);

                                    // Limpiamos los códigos del array si ya no son necesarios
                                    const unidadesActualizadas = form.unitats.map(u => ({
                                        ...u,
                                        codiExplotacio: necesitaCodi ? u.codiExplotacio : ""
                                    }));

                                    update({
                                        tipusMaterial: c,
                                        tipusMaterialNombre: n,
                                        unitats: unidadesActualizadas
                                    });
                                }}
                                options={mapIdiomas(TIPOS_MATERIAL)}
                                placeholder="Selecciona material"
                            />
                        </FormField>
                    </div>

                    <div className="flex flex-col gap-3 mt-2">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xs font-bold text-blue-grey uppercase tracking-wider">{lang === "ca" ? "Llistat d'Unitats" : "Listado de Unidades"}</h3>
                            {!isReadOnly && (
                                <button onClick={addUnitat} className="bg-main-green/10 text-main-green p-1.5 rounded-lg hover:bg-main-green/20">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                                </button>
                            )}
                        </div>

                        {form.unitats.map((u, index) => (
                            <div key={index} className={`p-3 rounded-xl border ${mostrarCodiGlobal && !u.codiExplotacio && index > 0 ? 'border-error-red/50 bg-error-red/5' : 'border-surface-variant bg-surface'} flex gap-3 relative animate-in fade-in`}>

                                <div className={`flex-1 ${isReadOnly ? "opacity-70 pointer-events-none" : ""}`}>
                                    <FormField label={`${lang === "ca" ? "Unitats" : "Unidades"} *`}>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            pattern="\d*"
                                            value={u.nombreUnitats}
                                            onChange={(e) => updateUnitat(index, "nombreUnitats", e.target.value)}
                                            placeholder="Ex: 50"
                                            className="w-full border border-surface-variant rounded-xl px-3 py-2.5 text-sm focus:border-main-green bg-white outline-none"
                                        />
                                    </FormField>
                                </div>

                                {mostrarCodiGlobal && (
                                    <div className={`flex-[2] ${isReadOnly ? "opacity-70 pointer-events-none" : ""}`}>
                                        <FormField label={`${lang === "ca" ? "Codi explotació" : "Código explotación"} *`}>
                                            <input
                                                type="text"
                                                value={u.codiExplotacio}
                                                onChange={(e) => updateUnitat(index, "codiExplotacio", e.target.value.toUpperCase())}
                                                placeholder="ES000..."
                                                className="w-full border border-surface-variant rounded-xl px-3 py-2.5 text-sm uppercase focus:border-main-green bg-white outline-none"
                                            />
                                        </FormField>
                                    </div>
                                )}

                                {!isReadOnly && form.unitats.length > 1 && (
                                    <button onClick={() => removeUnitat(index)} className="self-center mt-6 text-error-red p-2 hover:bg-error-red/10 rounded-lg">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. Datos de Envío */}
                <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-4">
                    <h2 className="text-sm font-bold text-dark-blue-grey">{lang === "ca" ? "Dades d'Enviament" : "Datos de Envío"}</h2>

                    <div className={isReadOnly ? "opacity-70 pointer-events-none" : ""}>
                        <FormField label={`${lang === "ca" ? "Tipus d'enviament" : "Tipo de envío"} *`}>
                            <SelectInput
                                value={form.tipusEnviament}
                                onChange={(c, n) => update({ tipusEnviament: c, tipusEnviamentNombre: n })}
                                options={mapIdiomas(TIPOS_ENVIO)}
                                placeholder="Selecciona envio"
                            />
                        </FormField>
                    </div>

                    <div className={isReadOnly ? "opacity-70 pointer-events-none" : ""}>
                        <FormField label={`${lang === "ca" ? "Adreça de lliurament" : "Dirección de entrega"} *`}>
                            <SelectInput
                                value={form.adrecaLliurament}
                                onChange={(c, n) => {
                                    if (c === "01") {
                                        // Si elige OC, borramos todos los campos de texto
                                        update({
                                            adrecaLliurament: c, adrecaLliuramentNombre: n,
                                            adreca: "", poblacio: "", cp: "", municipi: "", telefonContacte: ""
                                        });
                                    } else {
                                        // Si elige Alternativa o Ganadero, borramos la OC
                                        update({
                                            adrecaLliurament: c, adrecaLliuramentNombre: n,
                                            oc: "", ocNombre: ""
                                        });
                                    }
                                }}
                                options={mapIdiomas(TIPOS_DIRECCION)}
                                placeholder="Selecciona direcció"
                            />
                        </FormField>
                    </div>
                </div>

                {/* 3. Detalle de Dirección Condicional */}
                {form.adrecaLliurament === "01" && (
                    <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-4 animate-in fade-in slide-in-from-top-4">
                        <div className={isReadOnly ? "opacity-70 pointer-events-none" : ""}>
                            <FormField label="Oficina Comarcal *">
                                <SelectInput
                                    value={form.oc}
                                    onChange={(c, n) => update({ oc: c, ocNombre: n })}
                                    options={OFICINAS_COMARCALES}
                                    placeholder="Selecciona OC"
                                />
                            </FormField>
                        </div>
                    </div>
                )}

                {(form.adrecaLliurament === "02" || form.adrecaLliurament === "03") && (
                    <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-4 animate-in fade-in slide-in-from-top-4">
                        <div className={isReadOnly ? "opacity-70 pointer-events-none" : ""}>
                            <FormField label={`${lang === "ca" ? "Adreça" : "Dirección"} *`}>
                                <input
                                    type="text" value={form.adreca} onChange={(e) => update({ adreca: e.target.value })}
                                    className="w-full border border-surface-variant rounded-xl px-3 py-2.5 text-sm"
                                />
                            </FormField>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className={isReadOnly ? "opacity-70 pointer-events-none" : ""}>
                                <FormField label={`${lang === "ca" ? "Població" : "Población"} *`}>
                                    <input type="text" value={form.poblacio} onChange={(e) => update({ poblacio: e.target.value })} className="w-full border border-surface-variant rounded-xl px-3 py-2.5 text-sm" />
                                </FormField>
                            </div>
                            <div className={isReadOnly ? "opacity-70 pointer-events-none" : ""}>
                                <FormField label="Codi Postal *">
                                    <input type="text" value={form.cp} onChange={(e) => update({ cp: e.target.value })} className="w-full border border-surface-variant rounded-xl px-3 py-2.5 text-sm" />
                                </FormField>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className={isReadOnly ? "opacity-70 pointer-events-none" : ""}>
                                <FormField label={`${lang === "ca" ? "Municipi" : "Municipio"} *`}>
                                    <input type="text" value={form.municipi} onChange={(e) => update({ municipi: e.target.value })} className="w-full border border-surface-variant rounded-xl px-3 py-2.5 text-sm" />
                                </FormField>
                            </div>
                            <div className={isReadOnly ? "opacity-70 pointer-events-none" : ""}>
                                <FormField label={`${lang === "ca" ? "Telèfon" : "Teléfono"} *`}>
                                    <input type="tel" value={form.telefonContacte} onChange={(e) => update({ telefonContacte: e.target.value })} className="w-full border border-surface-variant rounded-xl px-3 py-2.5 text-sm" />
                                </FormField>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Botones */}
            {!isReadOnly && (
                <div className="fixed bottom-0 left-0 right-0 px-4 py-4 bg-white border-t border-surface-variant flex gap-3 z-40">
                    <button onClick={handleGuardarBorrador} className="w-12 h-12 shrink-0 flex items-center justify-center border-2 border-main-green text-main-green rounded-xl hover:bg-main-green/10">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                    </button>
                    <button
                        onClick={handleEnviar}
                        disabled={enviando || !esValido}
                        className="flex-1 bg-main-green text-white rounded-xl py-3 text-sm font-semibold disabled:opacity-40 transition-opacity"
                    >
                        {enviando ? t("common.loading") : (lang === "ca" ? "Sol·licitar Material" : "Solicitar Material")}
                    </button>
                </div>
            )}

            {isReadOnly && (
                <div className="fixed bottom-0 left-0 right-0 px-4 py-4 bg-white border-t border-surface-variant z-40">
                    <button onClick={() => window.history.back()} className="w-full bg-surface-variant text-dark-blue-grey rounded-xl py-3 text-sm font-semibold">
                        {lang === "ca" ? "Tornar a l'historial" : "Volver al historial"}
                    </button>
                </div>
            )}

            {/* Modales de Confirmación y Error */}
            {mostrarConfirm && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
                        <h3 className="text-base font-bold text-dark-blue-grey mb-2">
                            {lang === "ca" ? "Confirmar sol·licitud" : "Confirmar solicitud"}
                        </h3>
                        <p className="text-sm text-blue-grey mb-4">
                            {lang === "ca"
                                ? "Confirmes la sol·licitud d'aquest material?"
                                : "¿Confirmas la solicitud de este material?"}
                        </p>
                        <div className="flex gap-3 mt-5">
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
                    titulo={lang === "ca" ? "Sol·licitud registrada" : "Solicitud registrada"}
                    mensaje={`${lang === "ca" ? "La sol·licitud s'ha processat. Codi de seguiment:" : "La solicitud se ha procesado. Código de seguimiento:"} ${codigoSeguimiento}`}
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