"use client";

import { useEffect } from "react";

/**
 * Mapeo de nombres semánticos (los que recibe TopBar vía `accentColor`)
 * a las variables CSS definidas en tu @theme de Tailwind v4.
 *
 */
const COLOR_VAR_MAP: Record<string, string> = {
    green:  "--color-main-green",
    orange: "--color-main-orange",
    red:    "--color-error-red",
    blue:   "--color-main-blue",
};

/**
 * Sincroniza <meta name="theme-color"> con el color actual de la pantalla.
 *
 * Esto controla:
 *  - La barra de estado en Android Chrome / PWA instalada (hora, batería).
 *  - La barra de título en PWAs instaladas en escritorio (Edge / Chrome).
 *
 * Acepta:
 *  - Identificador semántico ("green", "orange", ...) → resuelve la CSS var.
 *  - Variable CSS directa ("--color-xxx").
 *  - Valor hex directo ("#FF8C00").
 *
 * Al desmontar restaura el valor anterior, evitando parpadeos al navegar
 * entre secciones con distinto acento.
 */
export function useThemeColor(color?: string) {
    useEffect(() => {
        if (typeof document === "undefined" || !color) return;

        const resolved = resolveColor(color);
        if (!resolved) return;

        let meta = document.querySelector<HTMLMetaElement>(
            'meta[name="theme-color"]'
        );
        const wasCreated = !meta;

        if (!meta) {
            meta = document.createElement("meta");
            meta.name = "theme-color";
            document.head.appendChild(meta);
        }

        const previous = meta.content;
        meta.content = resolved;

        return () => {
            if (wasCreated) meta!.remove();
            else meta!.content = previous;
        };
    }, [color]);
}

function resolveColor(color: string): string | null {
    // Hex directo: "#FF8C00"
    if (color.startsWith("#")) return color;

    // Variable CSS directa: "--color-xxx"
    if (color.startsWith("--")) return readCssVar(color);

    // Identificador semántico: "green", "orange"...
    const cssVar = COLOR_VAR_MAP[color] ?? `--color-${color}`;
    return readCssVar(cssVar);
}

function readCssVar(name: string): string | null {
    const value = getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim();
    return value || null;
}