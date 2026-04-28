"use client";

import TopBar from "@/components/layout/TopBar";
import { useDrawer } from "@/context/DrawerContext";
import { useRouter } from "next/navigation";

export interface SubMenuAction {
  label: string;
  path: string;
  icon: React.ReactNode;
  variant?: "primary" | "danger";
}

interface SubMenuPageProps {
  title: string;
  subtitle: string;
  accentColor: "green" | "orange";
  actions: SubMenuAction[];
}

export default function SubMenuPage({
  title,
  subtitle,
  accentColor,
  actions,
}: SubMenuPageProps) {
  const { toggle } = useDrawer();
  const router = useRouter();

  const colorMap = {
    green: {
      primary: { icon: "bg-main-green text-white", card: "" },
      danger:  { icon: "bg-error-red text-white",  card: "" },
    },
    orange: {
      primary: { icon: "bg-main-orange text-white", card: "" },
      danger:  { icon: "bg-error-red text-white",   card: "" },
    },
  };

  return (
    <div className="min-h-screen bg-surface">
      <TopBar title={title} onMenuClick={toggle} accentColor={accentColor} showBack />

      <div className="px-4 py-5">
        <p className="text-sm text-slate-500 font-medium mb-4">{subtitle}</p>

        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => {
            const variant = action.variant ?? "primary";
            const colors = colorMap[accentColor][variant];

            return (
              <button
                key={action.path}
                onClick={() => router.push(action.path)}
                className="bg-card rounded-2xl p-5 shadow-sm flex flex-col items-center gap-3 active:scale-95 transition-transform text-center"
              >
                <div className={`${colors.icon} p-4 rounded-2xl`}>
                  {action.icon}
                </div>
                <p className="text-dark-blue-grey text-sm font-semibold leading-tight">
                  {action.label}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
