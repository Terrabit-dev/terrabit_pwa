"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const ROUTE_COLORS: Array<{ prefix: string; color: string }> = [
    { prefix: "/home/porcinos", color: "#df8e3f" },
    { prefix: "/home/bovinos",  color: "#2E7D32" },
    { prefix: "/home",          color: "#2E7D32" },
    { prefix: "/login",         color: "#F5F5F5" },
];

function getColorForPath(pathname: string): string {
    const match = ROUTE_COLORS.find((r) => pathname.startsWith(r.prefix));
    return match?.color ?? "#2E7D32";
}

export default function ThemeColorManager() {
    const pathname = usePathname();

    useEffect(() => {
        const color = getColorForPath(pathname);
        let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
        if (!meta) {
            meta = document.createElement("meta");
            meta.name = "theme-color";
            document.head.appendChild(meta);
        }
        meta.content = color;
    }, [pathname]);

    return null;
}