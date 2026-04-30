"use client";

import { useState, useRef, useEffect } from "react";

interface AutocompleteInputProps {
    label: string;
    value: string;
    onChange: (val: string) => void;
    suggestions: string[];
    onDeleteSuggestion?: (val: string) => void; // NUEVA PROP
    placeholder?: string;
    type?: string;
    icon?: React.ReactNode;
}

export default function AutocompleteInput({
                                              label,
                                              value,
                                              onChange,
                                              suggestions,
                                              onDeleteSuggestion,
                                              placeholder,
                                              type = "text",
                                              icon
                                          }: AutocompleteInputProps) {
    const [show, setShow] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setShow(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const filtered = suggestions.filter(s =>
        s.toLowerCase().includes(value.toLowerCase()) && s !== value
    );

    return (
        <div className="flex flex-col gap-1.5 relative" ref={containerRef}>
            <label className="text-xs font-semibold text-blue-grey dark:text-blue-grey/80 uppercase tracking-wide px-1">
                {label}
            </label>
            <div className={`flex items-center border border-surface-variant dark:border-surface-variant/20 rounded-xl px-3 py-2.5 gap-2 bg-card transition-colors focus-within:border-main-green`}>
                {icon}
                <input
                    type={type}
                    value={value}
                    onFocus={() => setShow(true)}
                    onChange={(e) => {
                        onChange(e.target.value);
                        setShow(true);
                    }}
                    placeholder={placeholder}
                    className="flex-1 text-sm bg-transparent outline-none text-dark-blue-grey dark:text-gray-100 placeholder-blue-grey/50 uppercase"
                />
            </div>

            {/* Menú de sugerencias */}
            {show && filtered.length > 0 && (
                <div className="absolute top-[100%] left-0 right-0 z-50 mt-1 bg-card border border-surface-variant dark:border-surface-variant/20 rounded-xl shadow-xl max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-2">
                    {filtered.map((s, i) => (
                        <div key={i} className="flex items-center w-full border-t border-surface-variant/30 hover:bg-main-green/10 transition-colors group">
                            {/* Botón para seleccionar */}
                            <button
                                type="button"
                                onClick={() => {
                                    onChange(s);
                                    setShow(false);
                                }}
                                className="flex-1 text-left px-4 py-3 text-sm text-dark-blue-grey dark:text-gray-200 group-hover:text-main-green"
                            >
                                {s}
                            </button>

                            {/* NUEVO: Botón para eliminar (la X) */}
                            {onDeleteSuggestion && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation(); // Evitamos que al dar a la X se seleccione el texto
                                        onDeleteSuggestion(s);
                                    }}
                                    className="px-4 py-3 text-blue-grey/40 hover:text-error-red transition-colors"
                                    title="Eliminar suggerència"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}