"use client";

import { useRouter } from "next/navigation";
import TopBar from "@/components/layout/TopBar";
import { useDrawer } from "@/context/DrawerContext";
import { useI18n } from "@/hooks/useI18n";
import FormField from "@/components/forms/FormField";
import ErrorModal from "@/components/common/ErrorModal";
import SuccessModal from "@/components/common/SuccessModal";
import LoadingOverlay from "@/components/common/LoadingOverlay";
import { useConfirmarMovimientoPorcino } from "@/hooks/useConfirmarMovimientoPorcino";

export default function ConfirmarMovimientoPorcinoPage() {
    const { toggle }  = useDrawer();
    const { t, lang } = useI18n();
    const router      = useRouter();

    const {
        form, origenExtra, enviando, exito, errorApi,
        update, enviar, cerrarExito, limpiarErrorApi
    } = useConfirmarMovimientoPorcino();

    if (!form && !enviando) {
        return (
            <div className="min-h-screen bg-surface flex items-center justify-center">
                <p className="text-blue-grey text-sm">{t("common.loading")}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface pointer-events-auto">
            <TopBar title={lang === "ca" ? "Confirmar Moviment" : "Confirmar Movimiento"} onMenuClick={toggle} accentColor="orange" showBack />

            <div className="px-4 py-5 flex flex-col gap-4 pb-24">

                {/* 1. Contexto Visual (No editables) */}
                <div className="bg-card rounded-2xl shadow-sm p-4 flex flex-col gap-3">
                    <p className="text-[10px] uppercase font-bold text-main-orange tracking-wider bg-main-orange/10 w-fit px-2 py-1 rounded-md">
                        REMO: {form?.remo}
                    </p>

                    <div className="flex items-center gap-3 mt-1">
                        <div className="flex-1">
                            <p className="text-xs text-blue-grey mb-0.5">{lang === "ca" ? "Origen" : "Origen"}</p>
                            <p className="text-sm font-bold text-dark-blue-grey">{origenExtra}</p>
                        </div>
                        <svg className="w-5 h-5 text-surface-variant shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                        <div className="flex-1 text-right">
                            <p className="text-xs text-blue-grey mb-0.5">{lang === "ca" ? "Destí" : "Destino"}</p>
                            <p className="text-sm font-bold text-dark-blue-grey">{form?.moDesti}</p>
                        </div>
                    </div>
                </div>

                {/* 2. Datos del Transporte y Animales */}
                <div className="bg-card rounded-2xl shadow-sm p-4 flex flex-col gap-4">
                    <h2 className="text-sm font-bold text-dark-blue-grey flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-main-orange"></span>
                        {lang === "ca" ? "Dades a Confirmar" : "Datos a Confirmar"}
                    </h2>

                    <FormField label="Número d'Animals *">
                        <input
                            type="number"
                            value={form?.nombreAnimals || ""}
                            onChange={(e) => update({ nombreAnimals: e.target.value })}
                            className="w-full border border-surface-variant rounded-xl px-3 py-2.5 text-sm focus:border-main-orange outline-none"
                            min="1"
                        />
                    </FormField>

                    <div className="grid grid-cols-2 gap-3">
                        <FormField label="NIF Conductor *">
                            <input
                                type="text"
                                value={form?.nifConductor || ""}
                                onChange={(e) => update({ nifConductor: e.target.value.toUpperCase() })}
                                className="w-full border border-surface-variant rounded-xl px-3 py-2.5 text-sm uppercase focus:border-main-orange outline-none"
                            />
                        </FormField>

                        <FormField label="Matrícula *">
                            <input
                                type="text"
                                value={form?.matricula || ""}
                                onChange={(e) => update({ matricula: e.target.value.toUpperCase() })}
                                className="w-full border border-surface-variant rounded-xl px-3 py-2.5 text-sm uppercase focus:border-main-orange outline-none"
                            />
                        </FormField>
                    </div>

                    <FormField label="Codi ATES (Opcional)">
                        <input
                            type="text"
                            value={form?.codiAtes || ""}
                            onChange={(e) => update({ codiAtes: e.target.value.toUpperCase() })}
                            className="w-full border border-surface-variant rounded-xl px-3 py-2.5 text-sm uppercase focus:border-main-orange outline-none"
                            placeholder={lang === "ca" ? "Opcional..." : "Opcional..."}
                        />
                    </FormField>
                </div>
            </div>

            {/* Botones */}
            <div className="fixed bottom-0 left-0 right-0 px-4 py-4 bg-card border-t border-surface-variant flex gap-3 z-40">
                <button
                    onClick={() => enviar(lang)}
                    disabled={enviando}
                    className="flex-1 bg-main-orange text-white rounded-xl py-3 text-sm font-semibold disabled:opacity-40 transition-opacity shadow-sm"
                >
                    {enviando ? t("common.loading") : (lang === "ca" ? "Confirmar Arribada" : "Confirmar Llegada")}
                </button>
            </div>

            {exito && (
                <SuccessModal
                    titulo={lang === "ca" ? "Moviment Confirmat" : "Movimiento Confirmado"}
                    mensaje={lang === "ca" ? "L'arribada dels animals s'ha registrat correctament." : "La llegada de los animales se ha registrado correctamente."}
                    boton="Acceptar"
                    onClose={() => {
                        cerrarExito();
                        router.back(); // Volver al listado, la caché ya está limpia
                    }}
                />
            )}

            {errorApi && <ErrorModal mensaje={errorApi} onClose={limpiarErrorApi} lang={lang}/>}
            {enviando && <LoadingOverlay mensaje={t("common.loading")}/>}
        </div>
    );
}