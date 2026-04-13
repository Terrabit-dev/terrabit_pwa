"use client";

import ProtectedRoute from "@/components/layout/ProtectedRoute";
import NavDrawer from "@/components/layout/NavDrawer";
import { DrawerProvider, useDrawer } from "@/context/DrawerContext";

function HomeLayoutInner({ children }: { children: React.ReactNode }) {
  const { isOpen, close } = useDrawer();
  return (
    <div className="min-h-screen bg-surface">
      <NavDrawer isOpen={isOpen} onClose={close} />
      {children}
    </div>
  );
}

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <DrawerProvider>
        <HomeLayoutInner>{children}</HomeLayoutInner>
      </DrawerProvider>
    </ProtectedRoute>
  );
}