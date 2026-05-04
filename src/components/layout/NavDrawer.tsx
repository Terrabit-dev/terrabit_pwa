"use client";

import { useI18n } from "@/hooks/useI18n";
import { useAuth } from "@/hooks/useAuth";
import { usePathname, useRouter } from "next/navigation";

interface NavItem {
    labelKey: string;
    path: string;
    icon: React.ReactNode;
}

interface NavDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

const IconCow = () => (
    <svg className="w-6 h-6" viewBox="240 300 510 430" fill="currentColor">
        <path d="M333.6 320c-19.5 25-22.8 52.1-9.4 78.9 4.4 8.8 6.6 11.9 14 19.5 4.8 4.9 8.8 9.1 8.8 9.2 0 .2-1.5-.2-3.2-.7-18.4-5.4-47-9.8-68.4-10.6l-16.2-.6-.7 2.4c-.5 1.3-.8 10-.8 19.4-.1 20.4 1.6 30 7.4 42.4 7.6 16.3 25.6 30.2 43 33.1 7.9 1.4 18.6.5 33.7-2.6 4.1-.8 7.5-1.4 7.7-1.2.1.2 1.5 5.9 3 12.8 5.8 26.7 11.8 44.9 27.5 84 7.4 18.4 9.7 25.6 14 45 1.8 8 4.6 18 6.2 22.2 6.3 15.9 16.8 24.7 32.3 26.9 7 .9 8.2 1.5 13.7 5.9 28 22.6 61 22.2 88.9-1 4-3.3 5.6-4 12.4-4.9 14.3-2 24.2-9.5 30.7-23 1.7-3.5 4.6-13 6.5-21 6.1-25.5 8.4-33 18.6-58.6 14.3-36.1 17.9-47.3 24.8-78 1.2-5.5 2.3-10.1 2.3-10.2.1-.1 4.9.7 10.7 1.7 16.3 2.8 22.8 3.2 30.4 2 23.8-3.8 43.6-23.8 49.1-49.5 1.8-8.6 2.5-36.6 1-43.9l-.7-3.9-16.7.6c-21.3.8-40.6 3.7-63.9 9.6-4 1-7.3 1.6-7.3 1.4s2.7-2.9 6.1-6c11.4-10.6 19.5-24.4 23-39.1 4.8-19.8-.7-43.2-14.1-60-2.3-2.8-4.6-5-5-4.7-.5.3-1.2 0-1.6-.6-.4-.8-.3-.9.4-.5 1.7 1 1.5-.9-.2-2.3-1.2-1-1.6-.4-2.1 3.6-1.6 13.2-3.7 21.3-7.5 29-7 14.3-17.6 23.6-32.3 28.4l-6.8 2.2-8.2-2.6c-28-9.1-61.2-12.5-108.7-11.3-35.9.9-58.2 3.9-78.9 10.7-8.5 2.8-9.8 3-14 1.9-8.7-2.2-17.3-7.2-24.4-14.3-10.4-10.3-14.8-20.9-18.4-44.2l-.8-5z" />
    </svg>
);

const IconPig = () => (
    <svg className="w-6 h-6" viewBox="170 220 690 615" fill="currentColor">
        <path d="M180.5 222.2c-5 1.7-9.2 6.5-10.5 11.9-1.5 6.2-.3 12.5 5.6 28.3 8.9 23.9 11.1 36.2 12.4 69.6 1 26.9 2 35.5 5.5 50.5 5.3 22.4 14.8 42.3 29.5 61.5 18.4 24 35 33.5 58 33.3 11-.1 10.4.1 32.6-8.4 3.3-1.2 6.7-2 7.7-1.6 5.9 2.3 4.1 28.1-3.5 49.6-16.7 47-21.4 64.9-23.8 90.6-5.1 53.4 17.2 106.1 59.1 139.6 16.8 13.3 29.9 20.8 55.2 31.3 64.6 26.9 110.5 31.1 165.2 15 23.3-6.9 51.9-18.2 69-27.5 45.6-24.7 75-63.3 85-111.5 6.6-32.1 2.5-70.5-12-110.9-13-36.1-15.1-44-16.1-58-.8-10.9.6-17.2 3.9-18 1.4-.4 6.2 1 12.5 3.5 19.3 7.8 31.4 8.6 47.2 3.4 9.9-3.3 18-8.7 27.5-18.3 20-20.3 35.9-50.9 41.5-79.8 2-10.4 2.8-20.3 5-58.8 1-18.8 3.2-31.2 7.3-43 1.4-3.9 4.2-11.7 6.2-17.5 5.9-16.5 5.2-27.7-1.9-32.3-8-5.3-16.5-4.6-34.3 2.9-30.9 13-42.2 16.4-67.3 20.5-31.4 5-43.1 8.3-59 16.5-18.4 9.5-37.9 27.5-51.9 47.8-4.1 5.9-8.8 11.7-10.5 12.9-4.9 3.4-11.1 2.8-25-2.7-6.6-2.6-16.9-6.2-23.1-8.1-42.8-13-98.5-11.8-139.9 3-6.7 2.3-16.1 5.7-21 7.5-14.2 5.1-17.7 3.5-29.1-13.1-9.3-13.6-27.4-32.2-38.5-39.6-19.1-12.8-36.3-18.9-66.1-23.2-26.6-4-36.4-6.7-63.8-17.8-25.7-10.4-31.1-11.7-38.6-9.1m344.7 358.3c9 1.9 22 8 30.8 14.5 8.9 6.6 25.5 23.9 31.2 32.5 6.2 9.5 9.5 17.6 11.5 28.9 1.5 8.7 1.5 10.3.1 19-2.2 13.2-6.1 21.1-14.5 29.5-14.6 14.3-27.8 17.2-55.3 12.1-13.3-2.5-20.9-2.5-34.6.1-13.2 2.4-27.2 2.7-34.6.5-15.6-4.5-30-20.3-33.8-37.1-1.7-7.1-1.7-22-.1-28.5q4.95-20.25 24-40.2c25.3-26.6 49.4-36.6 75.3-31.3" />
        <path d="M473.5 635.8c-8.2 5.1-13.9 15.3-13.9 24.9-.2 14.1 10.9 18.4 21.2 8.4 8.6-8.3 10.8-27.2 3.9-32.9-2.7-2.3-7.9-2.5-11.2-.4m66.9.1c-11.1 6.8-3.3 34.1 10.8 38.3 11.4 3.4 17.4-10.1 11-24.5-3.5-7.9-12.1-15.7-17.4-15.7-.7 0-2.7.9-4.4 1.9" />
    </svg>
);

const IconHistory = () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M13 3a9 9 0 00-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0013 21a9 9 0 000-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
    </svg>
);

const IconDraft = () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
    </svg>
);

const IconSettings = () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87a.48.48 0 00.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.48.48 0 00-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
    </svg>
);

const IconLogout = () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
    </svg>
);

export default function NavDrawer({ isOpen, onClose }: NavDrawerProps) {
    const { t } = useI18n();
    const { logout } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    const navItems: NavItem[] = [
        { labelKey: "nav.bovinos",       path: "/home/bovinos",       icon: <IconCow /> },
        { labelKey: "nav.porcinos",      path: "/home/porcinos",      icon: <IconPig /> },
        { labelKey: "nav.historial",     path: "/home/historial",     icon: <IconHistory /> },
        { labelKey: "nav.borradores",    path: "/home/borradores",    icon: <IconDraft /> },
        { labelKey: "nav.configuracion", path: "/home/configuracion", icon: <IconSettings /> },
    ];

    const navigate = (path: string) => {
        router.push(path);
        onClose();
    };

    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
                    isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
                onClick={onClose}
            />

            {/* Drawer */}
            <aside
                className={`fixed top-0 left-0 h-full w-72 bg-card z-50 flex flex-col shadow-2xl transition-transform duration-300 ${
                    isOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                {/* Header verde */}
                <div className="bg-main-green px-6 pt-10 pb-6">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                            <img
                                src="/images/terrabit_prime_sin_letra.png"
                                alt="Terrabit logo"
                                className="w-12 h-12 object-cover scale-125"
                            />
                        </div>
                        <div>
                            <h1 className="text-white text-xl font-bold leading-tight">Terrabit</h1>
                            <p className="text-green-200 text-xs">© 2026 Terrabit</p>
                        </div>
                    </div>
                </div>

                {/* Nav items */}
                <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = pathname.startsWith(item.path);
                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-medium transition-colors ${
                                    isActive
                                        ? "bg-main-green-bg text-main-green"
                                        : "text-dark-blue-grey hover:bg-surface"
                                }`}
                            >
                <span className={isActive ? "text-main-green" : "text-blue-grey"}>
                  {item.icon}
                </span>
                                <span>{t(item.labelKey)}</span>
                                {isActive && (
                                    <span className="ml-auto">
                    <svg
                        className="w-4 h-4 text-main-green"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                      <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                      />
                    </svg>
                  </span>
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Versión + Logout */}
                <div className="px-3 pb-6 pt-2 border-t border-surface-variant">
                    <div className="px-4 py-2 mb-2">
                        <p className="text-xs text-blue-grey">Versión 1.0.0</p>
                    </div>
                    <button
                        onClick={() => {
                            logout();
                            onClose();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-medium text-dark-blue-grey hover:bg-surface transition-colors"
                    >
            <span className="text-blue-grey">
              <IconLogout />
            </span>
                        <span>{t("nav.cerrar_sesion")}</span>
                    </button>
                </div>
            </aside>
        </>
    );
}