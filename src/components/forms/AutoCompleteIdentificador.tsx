"use client";

import { useState, useEffect, useRef } from "react";
import type { Animal } from "@/lib/bovinos/types";

interface AutoCompleteIdentificadorProps {
    label: string;
    value: string;
    onChange: (v: string) => void;
    onAnimalSelected: (animal: Animal) => void;
    suggestions: Animal[];
    isLoading?: boolean;
    placeholder?: string;
    disabled?: boolean;
    lang?: string;
}

function getSexoTexto(sexe: string, lang: string): string {
    if (sexe === "01") return lang === "ca" ? "Femella" : "Hembra";
    if (sexe === "02") return lang === "ca" ? "Mascle" : "Macho";
    return sexe;
}

export default function AutoCompleteIdentificador({
                                                      label,
                                                      value,
                                                      onChange,
                                                      onAnimalSelected,
                                                      suggestions,
                                                      isLoading = false,
                                                      placeholder,
                                                      disabled = false,
                                                      lang = "es",
                                                  }: AutoCompleteIdentificadorProps) {
    const [expanded, setExpanded] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Cerrar al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setExpanded(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Abrir cuando hay sugerencias
    useEffect(() => {
        if (suggestions.length > 0 && value.length > 0) {
            setExpanded(true);
        } else {
            setExpanded(false);
        }
    }, [suggestions, value]);

    const handleSelect = (animal: Animal) => {
        onAnimalSelected(animal);
        onChange(animal.identificador);
        setExpanded(false);
    };

    const handleClear = () => {
        onChange("");
        setExpanded(false);
    };

    return (
        <div ref={containerRef} className="flex flex-col gap-1.5 relative">
            <label className="text-xs font-semibold text-blue-grey uppercase tracking-wide">
                {label}
            </label>

            {/* Input */}
            <div className="flex items-center border border-surface-variant rounded-xl px-3 py-2.5 bg-surface focus-within:border-main-green transition-colors">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    disabled={disabled}
                    className="flex-1 text-sm bg-transparent outline-none text-dark-blue-grey placeholder-blue-grey/50 disabled:opacity-50"
                />

                {/* Loading */}
                {isLoading && (
                    <div className="w-4 h-4 border-2 border-main-green border-t-transparent rounded-full animate-spin shrink-0"/>
                )}

                {/* Botón limpiar */}
                {value && !disabled && !isLoading && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="text-blue-grey ml-1 shrink-0"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                        </svg>
                    </button>
                )}
            </div>

            {/* Dropdown sugerencias */}
            {expanded && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white border border-surface-variant rounded-xl shadow-lg max-h-64 overflow-y-auto overscroll-contain">
                    {suggestions.map((animal) => (
                        <button
                            key={animal.identificador}
                            type="button"
                            onClick={() => handleSelect(animal)}
                            className="w-full px-4 py-3 text-left hover:bg-surface transition-colors border-b border-surface-variant last:border-0"
                        >
                            <p className="text-sm font-medium text-dark-blue-grey">
                                {animal.identificador}
                            </p>
                            <p className="text-xs text-blue-grey mt-0.5">
                                {getSexoTexto(animal.sexe, lang)} · {animal.raza}
                                {animal.identificadorMare && ` · ${lang === "ca" ? "Mare" : "Madre"}: ${animal.identificadorMare}`}
                            </p>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}