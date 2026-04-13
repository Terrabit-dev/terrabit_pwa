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
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6.5 10a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm11 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-1.12.23-2.18.65-3.15L6 10.5V13c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-2.5l1.35-1.65C19.77 9.82 20 10.88 20 12c0 4.41-3.59 8-8 8z"/>
  </svg>
);

const IconPig = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 4h-1.1C16.3 2.8 15.2 2 14 2H10C8.8 2 7.7 2.8 7.1 4H6C4.3 4 3 5.3 3 7v1c0 1.3.8 2.4 2 2.8V12c0 3.3 2.7 6 6 6h2c3.3 0 6-2.7 6-6v-1.2c1.2-.4 2-1.5 2-2.8V7c0-1.7-1.3-3-3-3zm-8 9a1 1 0 110-2 1 1 0 010 2zm4 0a1 1 0 110-2 1 1 0 010 2z"/>
  </svg>
);

const IconHistory = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13 3a9 9 0 00-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0013 21a9 9 0 000-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
  </svg>
);

const IconDraft = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
  </svg>
);

const IconSettings = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87a.48.48 0 00.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.48.48 0 00-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
  </svg>
);

const IconLogout = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
  </svg>
);

export default function NavDrawer({ isOpen, onClose }: NavDrawerProps) {
  const { t } = useI18n();
  const { logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const navItems: NavItem[] = [
    { labelKey: "nav.bovinos",      path: "/home/bovinos",       icon: <IconCow /> },
    { labelKey: "nav.porcinos",     path: "/home/porcinos",      icon: <IconPig /> },
    { labelKey: "nav.historial",    path: "/home/historial",     icon: <IconHistory /> },
    { labelKey: "nav.borradores",   path: "/home/borradores",    icon: <IconDraft /> },
    { labelKey: "nav.configuracion",path: "/home/configuracion", icon: <IconSettings /> },
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
        className={`fixed top-0 left-0 h-full w-72 bg-white z-50 flex flex-col shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header verde */}
        <div className="bg-main-green px-6 pt-10 pb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
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
                    <svg className="w-4 h-4 text-main-green" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
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
            onClick={() => { logout(); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-medium text-dark-blue-grey hover:bg-surface transition-colors"
          >
            <span className="text-blue-grey"><IconLogout /></span>
            <span>{t("nav.cerrar_sesion")}</span>
          </button>
        </div>
      </aside>
    </>
  );
}