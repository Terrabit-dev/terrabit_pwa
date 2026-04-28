"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface ThemeContextType {
    isDark: boolean;
    toggleTheme: (value: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType>({
    isDark: false,
    toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // Al cargar, miramos si el usuario ya tenía el modo oscuro guardado
        const savedTheme = localStorage.getItem("terrabit_theme");

        if (savedTheme === "dark") {
            setIsDark(true);
            document.documentElement.classList.add("dark");
        } else {
            setIsDark(false);
            document.documentElement.classList.remove("dark");
        }
    }, []);

    const toggleTheme = (value: boolean) => {
        setIsDark(value);
        if (value) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("terrabit_theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("terrabit_theme", "light");
        }
    };

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);