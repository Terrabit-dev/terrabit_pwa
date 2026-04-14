"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import type { Animal } from "@/lib/api/endpoints";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getSexoTexto(sexe: string): string {
    switch (sexe) {
        case "01": return "Hembra";
        case "02": return "Macho";
        default:   return sexe;
    }
}

function useDebounce<T>(value: T, delay = 300): T {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debounced;
}

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface CampoIdentificadorAutoCompleteProps {
    label: string;
    valor: string;
    placeholder?: string;
    onValueChange: (value: string) => void;
    /** Lista completa de animales (viene de AnimalesContext) */
    animales: Animal[];
    /** Llamado cuando el usuario selecciona un animal del dropdown */
    onAnimalSelected?: (animal: Animal) => void;
    /** "green" para formularios estándar, "red" para fallecimiento */
    accentColor?: "green" | "red" | "orange";
    disabled?: boolean;
    loading?: boolean;
}

// ─── Ítem del dropdown ────────────────────────────────────────────────────────

function SuggestionItem({
                            animal,
                            accentColor,
                            onClick,
                        }: {
    animal: Animal;
    accentColor: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
        >
            <p className={`text-sm font-semibold ${accentColor}`}>
                {animal.identificador}
            </p>
            {animal.identificadorMare && (
                <p className="text-xs text-slate-500 mt-0.5">
                    Madre: {animal.identificadorMare}
                </p>
            )}
            <p className="text-xs text-slate-400">
                Sexo: {getSexoTexto(animal.sexe)} | Raza: {animal.raca}
            </p>
        </button>
    );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function CampoIdentificadorAutoComplete({
                                                           label,
                                                           valor,
                                                           placeholder = "Ej: ES020905368370",
                                                           onValueChange,
                                                           animales,
                                                           onAnimalSelected,
                                                           accentColor = "green",
                                                           disabled = false,
                                                           loading = false,
                                                       }: CampoIdentificadorAutoCompleteProps) {
    const [focused, setFocused] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const debouncedValor = useDebounce(valor, 300);

    // Colores según accentColor
    const colorMap = {
        green:  { border: "border-main-green",  text: "text-main-green",  ring: "ring-main-green/20"  },
        red:    { border: "border-error-red",   text: "text-error-red",   ring: "ring-error-red/20"   },
        orange: { border: "border-main-orange", text: "text-main-orange", ring: "ring-main-orange/20" },
    };
    const colors = colorMap[accentColor];

    // Filtrado con el valor debounced
    const suggestions = useMemo<Animal[]>(() => {
        const q = debouncedValor.trim().toUpperCase();
        if (!q || !onAnimalSelected) return [];
        return animales
            .filter((a) => a.identificador.toUpperCase().includes(q))
            .slice(0, 10); // máximo 10 sugerencias
    }, [debouncedValor, animales, onAnimalSelected]);

    const showDropdown = focused && suggestions.length > 0;

    // Cierra el dropdown al clicar fuera
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setFocused(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    function handleSelect(animal: Animal) {
        onValueChange(animal.identificador);
        onAnimalSelected?.(animal);
        setFocused(false);
    }

    function handleClear() {
        onValueChange("");
        setFocused(false);
    }

    const borderClass = focused
        ? `${colors.border} ring-2 ${colors.ring}`
        : "border-slate-200";

    return (
        <div ref={containerRef} className="w-full">
            {/* Label */}
            <label className="block text-sm font-semibold text-slate-700 mb-2">
                {label}
            </label>

            {/* Input */}
            <div
                className={`
          relative flex items-center bg-white border rounded-xl transition-all duration-150
          ${borderClass}
          ${disabled ? "opacity-60 bg-slate-50" : ""}
        `}
            >
                <input
                    type="text"
                    value={valor}
                    onChange={(e) => onValueChange(e.target.value.toUpperCase())}
                    onFocus={() => setFocused(true)}
                    placeholder={placeholder}
                    disabled={disabled}
                    autoCorrect="off"
                    autoCapitalize="characters"
                    spellCheck={false}
                    className={`
            flex-1 px-4 py-3 text-sm bg-transparent outline-none
            text-slate-800 placeholder:text-slate-400
            ${disabled ? "cursor-not-allowed" : ""}
          `}
                />

                {/* Trailing icons */}
                <div className="flex items-center pr-2 gap-1">
                    {/* Botón limpiar */}
                    {valor.length > 0 && !disabled && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                            </svg>
                        </button>
                    )}

                    {/* Spinner cuando carga la lista de animales */}
                    {loading && (
                        <div className={`w-4 h-4 border-2 border-t-transparent ${colors.border} rounded-full animate-spin mx-1.5`} />
                    )}
                </div>
            </div>

            {/* Dropdown de sugerencias */}
            {showDropdown && (
                <div className="relative z-50">
                    <div className="absolute top-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg max-h-[280px] overflow-y-auto">
                        {suggestions.map((animal) => (
                            <SuggestionItem
                                key={animal.identificador}
                                animal={animal}
                                accentColor={colors.text}
                                onClick={() => handleSelect(animal)}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
