"use client";

import { useRouter } from "next/navigation";
import TopBar from "@/components/layout/TopBar";
import { useDrawer } from "@/context/DrawerContext";
import { useI18n } from "@/hooks/useI18n";
import FormField from "@/components/forms/FormField";
import SelectInput from "@/components/forms/SelectInput";
import ErrorModal from "@/components/common/ErrorModal";
import SuccessModal from "@/components/common/SuccessModal";
import LoadingOverlay from "@/components/common/LoadingOverlay";
import { useEditarGuiaPorcinos } from "@/hooks/useEditarGuiaPorcinos";
import { CATEGORIAS_PORCINOS } from "@/lib/porcinos/altaGuias"; // Reutilizamos el diccionario

export default function EditarGuiaPorcinoPage() {
    const { toggle }  = useDrawer();
    const { t, lang } = useI18n();
    const router      = useRouter();

    const {
        form, enviando, exito, errorApi,
        update, enviar, cerrarExito, limpiarErrorApi
    } = useEditarGuiaPorcinos();

    const mapIdiomas = (arr: { codigo: string; nombre: string; nombreEs?: string }[]) => arr.map(item => ({
        codigo: item.codigo,
        nombre: lang === "ca" ? item.nombre : (item.nombreEs || item.nombre)
    }));

    if (!form && !enviando) {
        return (
            <div className="min-h-screen bg-surface flex items-center justify-center">
                <p className="text-blue-grey text-sm">Carregant dades...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface pointer-events-auto">
            <TopBar title={lang === "ca" ? "Emitir Guia" : "Emitir Guía"} onMenuClick={toggle} accentColor="orange" showBack />

            <div className="px-4 py-5 flex flex-col gap-4 pb-24">

                {/* 1. Datos Fijos (REMO) */}
                <div className="bg-main-orange/10 border-2 border-main-orange/20 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] uppercase font-bold text-main-orange tracking-wider">Codi REMO</p>
                        <p className="text-lg font-mono font-bold text-dark-blue-grey leading-none mt-1">
                            {form?.remo}
                        </p>
                    </div>
                </div>

                {/* 2. Detalles de los Animales */}
                <div className="bg-card rounded-2xl shadow-sm p-4 flex flex-col gap-4">
                    <h2 className="text-sm font-bold text-dark-blue-grey flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-main-orange"></span>
                        {lang === "ca" ? "Detalls del Moviment" : "Detalles del Movimiento"}
                    </h2>

                    <FormField label={lang === "ca" ? "Categoria" : "Categoría"}>
                        <SelectInput
                            value={form?.categoria || ""}
                            onChange={(c) => update({ categoria: c })}
                            options={mapIdiomas(CATEGORIAS_PORCINOS)}
                            placeholder="Selecciona..."
                        />
                    </FormField>

                    <FormField label={lang === "ca" ? "Número d'Animals *" : "Número de Animales *"}>
                        <input
                            type="number"
                            value={form?.nombreAnimals || ""}
                            onChange={(e) => update({ nombreAnimals: e.target.value })}
                            className="w-full border border-surface-variant rounded-xl px-3 py-2.5 text-sm focus:border-main-orange outline-none"
                            min="1"
                        />
                    </FormField>
                </div>

                {/* 3. Fechas */}
                <div className="bg-card rounded-2xl shadow-sm p-4 flex flex-col gap-4">
                    <h2 className="text-sm font-bold text-dark-blue-grey flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-main-orange"></span>
                        {lang === "ca" ? "Dates" : "Fechas"}
                    </h2>

                    <FormField label={lang === "ca" ? "Data i Hora de Sortida *" : "Fecha y Hora de Salida *"}>
                        <input
                            type="datetime-local"
                            value={form?.dataSortida || ""}
                            onChange={(e) => update({ dataSortida: e.target.value })}
                            className="w-full border border-surface-variant rounded-xl px-3 py-2.5 text-sm focus:border-main-orange outline-none"
                        />
                    </FormField>

                    <FormField label={lang === "ca" ? "Data i Hora d'Arribada *" : "Fecha y Hora de Llegada *"}>
                        <input
                            type="datetime-local"
                            value={form?.dataArribada || ""}
                            onChange={(e) => update({ dataArribada: e.target.value })}
                            className="w-full border border-surface-variant rounded-xl px-3 py-2.5 text-sm focus:border-main-orange outline-none"
                        />
                    </FormField>
                </div>

                {/* 4. Transporte (Obligatorios aquí) */}
                <div className="bg-card rounded-2xl shadow-sm p-4 flex flex-col gap-4">
                    <h2 className="text-sm font-bold text-dark-blue-grey flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-main-orange"></span>
                        {lang === "ca" ? "Transport" : "Transporte"}
                    </h2>

                    <FormField label={lang === "ca" ? "Transportista (codi ATES) *" : "Transportista (código ATES) *"}>
                        <input
                            type="text"
                            value={form?.transportista || ""}
                            onChange={(e) => update({ transportista: e.target.value.toUpperCase() })}
                            className="w-full border border-surface-variant rounded-xl px-3 py-2.5 text-sm uppercase focus:border-main-orange outline-none"
                        />
                    </FormField>

                    <FormField label="NIF del conductor *">
                        <input
                            type="text"
                            value={form?.responsable || ""}
                            onChange={(e) => update({ responsable: e.target.value.toUpperCase() })}
                            className="w-full border border-surface-variant rounded-xl px-3 py-2.5 text-sm uppercase focus:border-main-orange outline-none"
                        />
                    </FormField>

                    <FormField label={lang === "ca" ? "Matrícula del Vehicle *" : "Matrícula del Vehículo *"}>
                        <input
                            type="text"
                            value={form?.vehicle || ""}
                            onChange={(e) => update({ vehicle: e.target.value.toUpperCase() })}
                            className="w-full border border-surface-variant rounded-xl px-3 py-2.5 text-sm uppercase focus:border-main-orange outline-none"
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
                    {enviando ? t("common.loading") : (lang === "ca" ? "Emetre Guia" : "Emitir Guía")}
                </button>
            </div>

            {exito && (
                <SuccessModal
                    titulo={lang === "ca" ? "Guia Emesa" : "Guía Emitida"}
                    mensaje={lang === "ca" ? "La guia s'ha emès correctament." : "La guía se ha emitido correctamente."}
                    boton="Acceptar"
                    onClose={() => {
                        cerrarExito();
                        router.back(); // Volver al listado
                    }}
                />
            )}

            {errorApi && <ErrorModal mensaje={errorApi} onClose={limpiarErrorApi} lang={lang}/>}
            {enviando && <LoadingOverlay mensaje={t("common.loading")}/>}
        </div>
    );
}