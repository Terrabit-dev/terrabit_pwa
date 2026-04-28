"use client";

import { useState, useEffect } from "react";
import {
    getCodiMOList,
    getActiveCodiMO,
    setActiveCodiMO
} from "@/lib/storage/credentials";

export default function SelectorMO() {
    const [activeMO, setActiveMO] = useState("");
    const [moList, setMoList] = useState<string[]>([]);

    const loadMOs = () => {
        setMoList(getCodiMOList());
        setActiveMO(getActiveCodiMO());
    };

    useEffect(() => {
        /* eslint-disable react-hooks/set-state-in-effect */
        loadMOs();
        /* eslint-enable react-hooks/set-state-in-effect */
        // Nos suscribimos al evento para re-renderizar si añaden un MO nuevo en Configuración
        const handleMOChange = () => {
            loadMOs();
        };
        window.addEventListener("mo_changed", handleMOChange);
        return () => window.removeEventListener("mo_changed", handleMOChange);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const nuevoMO = e.target.value;
        if (nuevoMO !== activeMO) {
            setActiveCodiMO(nuevoMO);

            // Recargamos la página para forzar a que todos los hooks (listas, cachés, sugerencias)
            // lean el nuevo MO desde cero y limpien su estado anterior.
            window.location.reload();
        }
    };

    // Si solo tiene 1 MO o ninguno, no renderizamos nada para mantener la interfaz limpia
    if (moList.length <= 1) return null;

    return (
        <div className="flex items-center gap-1 bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-sm px-2 py-1.5 rounded-lg border border-white/10 shrink-0">
            {/* Icono de granja/mapa */}
            <svg className="w-3.5 h-3.5 text-white shrink-0 hidden sm:block" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>

            <select
                value={activeMO}
                onChange={handleChange}
                className="bg-transparent text-white text-xs font-bold outline-none cursor-pointer appearance-none text-center pl-1 pr-1"
                style={{ textAlignLast: "center" }}
                title="Canviar d'explotació"
            >
                {moList.map((mo) => (
                    <option key={mo} value={mo} className="text-dark-blue-grey bg-card font-medium">
                        {mo}
                    </option>
                ))}
            </select>

            {/* Flecha personalizada */}
            <svg className="w-3 h-3 text-white shrink-0 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"/>
            </svg>
        </div>
    );
}