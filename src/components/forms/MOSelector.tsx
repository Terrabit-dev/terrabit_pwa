"use client";

import { useState, useRef, useEffect } from "react";
import { useMO } from "@/hooks/useMO";

interface MOSelectorProps {
    /** Si está en pantalla con accentColor "red" (ej: fallecimiento), usar variant danger */
    variant?: "green" | "orange" | "red";
}

const variantStyles = {
    green:  "bg-main-green text-white",
    orange: "bg-main-orange text-white",
    red:    "bg-error-red text-white",
};

const IconHome = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
);

const IconChevron = ({ open }: { open: boolean }) => (
    <svg
        className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        viewBox="0 0 24 24"
        fill="currentColor"
    >
        <path d="M7 10l5 5 5-5H7z" />
    </svg>
);

export default function MOSelector({ variant = "green" }: MOSelectorProps) {
    const { activeMO, moList, setActiveMO } = useMO();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Cierra al clicar fuera
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Si solo hay una MO, no muestra chevron ni dropdown
    const hasMultiple = moList.length > 1;

    return (
        <div ref={ref} className="relative inline-block">
            <button
                onClick={() => hasMultiple && setOpen((o) => !o)}
                className={`
          flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold
          transition-opacity active:opacity-80
          ${variantStyles[variant]}
          ${!hasMultiple ? "cursor-default" : "cursor-pointer"}
        `}
            >
                <IconHome />
                <span>{activeMO}</span>
                {hasMultiple && <IconChevron open={open} />}
            </button>

            {hasMultiple && open && (
                <div className="absolute left-0 top-full mt-2 z-50 bg-card rounded-xl shadow-lg border border-surface-variant min-w-[150px] overflow-hidden">
                    {moList.map((mo) => (
                        <button
                            key={mo}
                            onClick={() => {
                                setActiveMO(mo);
                                setOpen(false);
                            }}
                            className={`
                w-full flex items-center gap-2 px-4 py-3 text-sm text-left
                transition-colors hover:bg-slate-50
                ${mo === activeMO ? "font-semibold text-main-green" : "text-slate-700"}
              `}
                        >
                            <IconHome />
                            {mo}
                            {mo === activeMO && (
                                <svg className="w-4 h-4 ml-auto text-main-green" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                </svg>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
