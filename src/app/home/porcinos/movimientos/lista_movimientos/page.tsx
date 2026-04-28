"use client";

import { useRouter } from "next/navigation";
import TopBar from "@/components/layout/TopBar";
import { useDrawer } from "@/context/DrawerContext";
import { useI18n } from "@/hooks/useI18n";
import FormField from "@/components/forms/FormField";
import LoadingOverlay from "@/components/common/LoadingOverlay";
import { useListarMovimientosPorcinos } from "@/hooks/useListarMovimientosPorcinos";
import { type MovimientoPorcino } from "@/lib/porcinos/listarMovimientosPorcinos";

export default function ListaMovimientosPorcinosPage() {
    const { toggle }  = useDrawer();
    const { t, lang } = useI18n();
    const router      = useRouter();

    const {
        filtros, lista, cargando, consultaIniciada, error,
        updateFiltro, validarPeticion, resetearConsulta, seleccionarMovimiento
    } = useListarMovimientosPorcinos();

    const handleConsultar = () => validarPeticion(lang);

    const handleBack = () => {
        if (consultaIniciada) resetearConsulta();
        else router.back();
    };

    const handleConfirmar = (movimiento: MovimientoPorcino) => {
        seleccionarMovimiento(movimiento);
        // Este path será para la página de confirmación que haremos luego
        router.push("/home/porcinos/movimientos/confirmar");
    };

    return (
        <div className="min-h-screen bg-surface pointer-events-auto">
            <TopBar
                title={lang === "ca" ? "Confirmar Moviments" : "Confirmar Movimientos"}
                onMenuClick={toggle}
                accentColor="orange"
                showBack
            />

            {!consultaIniciada && (
                <div className="px-4 py-6">
                    <div className="bg-card rounded-2xl shadow-sm p-5 flex flex-col gap-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-main-orange/10 flex items-center justify-center">
                                <svg className="w-5 h-5 text-main-orange" fill="currentColor" viewBox="0 0 24 24"><path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z"/></svg>
                            </div>
                            <h2 className="text-base font-bold text-dark-blue-grey">
                                {lang === "ca" ? "Cerca de moviments" : "Búsqueda de movimientos"}
                            </h2>
                        </div>

                        <div className="border-t border-surface-variant"/>

                        <FormField label={lang === "ca" ? "Marca Oficial Destí *" : "Marca Oficial Destino *"}>
                            <input
                                type="text"
                                value={filtros.moDesti}
                                onChange={(e) => updateFiltro("moDesti", e.target.value.toUpperCase())}
                                className="w-full border border-surface-variant rounded-xl px-3 py-2.5 text-sm uppercase focus:border-main-orange"
                                placeholder="00XXAM"
                            />
                        </FormField>

                        <div className="grid grid-cols-2 gap-3">
                            <FormField label={lang === "ca" ? "Data sortida des de *" : "Fecha salida desde *"}>
                                <input
                                    type="date"
                                    value={filtros.fechaDesde}
                                    onChange={(e) => updateFiltro("fechaDesde", e.target.value)}
                                    className="w-full border border-surface-variant rounded-xl px-3 py-2.5 text-sm focus:border-main-orange"
                                />
                            </FormField>
                            <FormField label={lang === "ca" ? "Data sortida fins *" : "Fecha salida hasta *"}>
                                <input
                                    type="date"
                                    value={filtros.fechaFins}
                                    onChange={(e) => updateFiltro("fechaFins", e.target.value)}
                                    className="w-full border border-surface-variant rounded-xl px-3 py-2.5 text-sm focus:border-main-orange"
                                />
                            </FormField>
                        </div>

                        {error && (
                            <div className="bg-error-red/10 rounded-lg p-3 flex items-start gap-2">
                                <svg className="w-4 h-4 text-error-red shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                                <p className="text-xs text-error-red flex-1 whitespace-pre-line">{error}</p>
                            </div>
                        )}

                        <button onClick={handleConsultar} className="w-full bg-main-orange text-white rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2 shadow-sm">
                            {lang === "ca" ? "Cercar moviments" : "Buscar movimientos"}
                        </button>
                    </div>
                </div>
            )}

            {consultaIniciada && cargando && (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-12 h-12 rounded-full border-4 border-main-orange border-t-transparent animate-spin"/>
                    <p className="text-sm text-blue-grey">{t("common.loading")}</p>
                </div>
            )}

            {consultaIniciada && !cargando && lista.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 gap-3 px-4">
                    <svg className="w-12 h-12 text-blue-grey" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 3h.01"/></svg>
                    <p className="text-sm text-blue-grey">
                        {lang === "ca" ? "No hi ha moviments pendents" : "No hay movimientos pendientes"}
                    </p>
                    <button onClick={resetearConsulta} className="text-main-orange text-sm font-semibold">
                        {lang === "ca" ? "Nova consulta" : "Nueva consulta"}
                    </button>
                </div>
            )}

            {consultaIniciada && !cargando && lista.length > 0 && (
                <div className="px-4 py-4 flex flex-col gap-3 pb-8">
                    <p className="text-xs text-blue-grey pl-1">
                        {lista.length} {lang === "ca" ? "moviments trobats" : "movimientos encontrados"}
                    </p>
                    {lista.map((mov, idx) => (
                        <MovimientoCard
                            key={`${mov.codiRemo}-${idx}`}
                            movimiento={mov}
                            lang={lang}
                            onConfirmar={() => handleConfirmar(mov)}
                        />
                    ))}
                </div>
            )}

            {cargando && !consultaIniciada && <LoadingOverlay mensaje={t("common.loading")}/>}
        </div>
    );
}

// ─── Card de Movimiento ───────────────────────────────────────────────────────
function MovimientoCard({ movimiento, lang, onConfirmar }: { movimiento: MovimientoPorcino; lang: "es" | "ca"; onConfirmar: () => void; }) {
    return (
        <div className="bg-card rounded-2xl shadow-sm p-4 flex flex-col gap-3 border border-transparent hover:border-main-orange/30 transition-colors">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="font-bold text-sm text-dark-blue-grey truncate">{movimiento.moOrigen}</span>
                    <svg className="w-4 h-4 text-main-orange shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                    <span className="font-bold text-sm text-dark-blue-grey truncate">{movimiento.moDesti}</span>
                </div>
                <button onClick={onConfirmar} className="px-3 h-9 rounded-lg bg-main-orange/10 text-main-orange text-xs font-bold flex items-center justify-center shrink-0 hover:bg-main-orange hover:text-white transition-colors">
                    {lang === "ca" ? "Confirmar" : "Confirmar"}
                </button>
            </div>

            <p className="font-mono text-xs text-blue-grey tracking-wider bg-surface w-fit px-2 py-0.5 rounded-md border border-surface-variant">
                REMO: {movimiento.codiRemo}
            </p>

            <div className="border-t border-surface-variant mt-1"/>

            <div className="flex gap-6 mt-1">
                <div>
                    <p className="text-[10px] uppercase font-bold text-blue-grey/70 tracking-wider">{lang === "ca" ? "Data sortida" : "Fecha salida"}</p>
                    <p className="text-sm font-semibold text-dark-blue-grey mt-0.5">{movimiento.dataSortida}</p>
                </div>
                <div>
                    <p className="text-[10px] uppercase font-bold text-blue-grey/70 tracking-wider">{lang === "ca" ? "Data arribada" : "Fecha llegada"}</p>
                    <p className="text-sm font-semibold text-dark-blue-grey mt-0.5">{movimiento.dataArribada}</p>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
                <InfoChip label={`${movimiento.nombreAnimals} ${lang === "ca" ? "porcs" : "cerdos"}`} iconPath="M4.5 12a5.5 5.5 0 1111 0c0 3-2.5 5-5.5 8-3-3-5.5-5-5.5-8z" />
                <InfoChip label={movimiento.matricula || (lang === "ca" ? "Sense matrícula" : "Sin matrícula")} iconPath="M3 7h18v10H3V7zm0 0l2-3h14l2 3" />
            </div>
        </div>
    );
}

function InfoChip({ label, iconPath }: { label: string; iconPath: string }) {
    return (
        <div className="bg-orange-50 border border-orange-100/50 rounded-full px-2.5 py-1 flex items-center gap-1.5">
            <svg className="w-3 h-3 text-main-orange shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath}/></svg>
            <span className="text-[11px] text-main-orange font-medium truncate max-w-[140px]">{label}</span>
        </div>
    );
}