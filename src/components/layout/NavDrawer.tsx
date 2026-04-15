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
  <svg className="w-5 h-5" viewBox="0 0 64 64" fill="currentColor">
    <path d="M12 8 C8 8 4 11 4 15 L4 20 C4 22 5 24 7 25 L7 32 C7 35 9 37 12 37 L14 37 L14 52 C14 54 16 56 18 56 L22 56 C24 56 26 54 26 52 L26 44 L38 44 L38 52 C38 54 40 56 42 56 L46 56 C48 56 50 54 50 52 L50 37 L52 37 C55 37 57 35 57 32 L57 25 C59 24 60 22 60 20 L60 15 C60 11 56 8 52 8 L48 8 C46 6 43 5 40 5 L24 5 C21 5 18 6 16 8 Z M20 18 C20 16 22 14 24 14 C26 14 28 16 28 18 C28 20 26 22 24 22 C22 22 20 20 20 18 Z M36 18 C36 16 38 14 40 14 C42 14 44 16 44 18 C44 20 42 22 40 22 C38 22 36 20 36 18 Z M25 30 C25 28 30 26 32 26 C34 26 39 28 39 30 L39 34 L25 34 Z"/>
  </svg>
);

const IconPig = () => (
  <svg className="w-5 h-5" viewBox="0 0 64 64" fill="currentColor">
    <path d="M50 20 C50 20 54 16 58 18 C58 18 60 14 56 12 C52 10 48 14 48 14 C45 11 41 9 36 9 L28 9 C18 9 10 17 10 27 L10 30 C10 38 16 44 24 45 L24 52 C24 54 26 56 28 56 L32 56 C34 56 36 54 36 52 L36 45 L28 45 C28 45 36 45 36 45 L40 45 L40 52 C40 54 42 56 44 56 L48 56 C50 56 52 54 52 52 L52 45 C56 42 58 37 58 32 L58 27 C58 24 54 20 50 20 Z M24 28 C22 28 20 26 20 24 C20 22 22 20 24 20 C26 20 28 22 28 24 C28 26 26 28 24 28 Z M40 28 C38 28 36 26 36 24 C36 22 38 20 40 20 C42 20 44 22 44 24 C44 26 42 28 40 28 Z M26 35 C26 33 28 32 32 32 C36 32 38 33 38 35 C38 35 36 38 32 38 C28 38 26 35 26 35 Z"/>
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
    { labelKey: "nav.historial",    path: "/historial",     icon: <IconHistory /> },
    { labelKey: "nav.borradores",   path: "/borradores",    icon: <IconDraft /> },
    { labelKey: "nav.configuracion",path: "/configuracion", icon: <IconSettings /> },
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