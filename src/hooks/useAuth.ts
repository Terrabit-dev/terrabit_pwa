"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { validateCredentials } from "@/lib/api/auth";
import {
  saveCredentials,
  clearCredentials,
  isAuthenticated,
  getCredentials,
} from "@/lib/storage/credentials";

type LoginState =
    | "idle"
    | "loading"
    | "error_credentials"
    | "error_network"
    | "error_empty"
    | "error_demo"
    | "error_timeout";

/**
 * Fases de progreso visibles en la UI durante el "loading".
 *  - connecting:  primer instante (0–4s)
 *  - working:     llamada en curso (4–10s)
 *  - slow:        más lento de lo normal (10–20s)
 *  - very_slow:   sigue trabajando (20s+)
 *
 * Los umbrales están elegidos para que en el caso típico el usuario solo vea
 * "connecting" → "working" y no llegue a ver los avisos de lentitud.
 */
export type LoginProgress = "idle" | "connecting" | "working" | "slow" | "very_slow";

export interface SavedForm {
  nif: string;
  password: string;
  codiMO: string;
  rememberMe: boolean;
}

const PHASE_WORKING_MS = 4_000;
const PHASE_SLOW_MS = 10_000;
const PHASE_VERY_SLOW_MS = 20_000;

export function useAuth() {
  const router = useRouter();
  const [state, setState] = useState<LoginState>("idle");
  const [progress, setProgress] = useState<LoginProgress>("idle");
  const [demoDisponible, setDemoDisponible] = useState(false);
  const [savedForm, setSavedForm] = useState<SavedForm>({
    nif: "",
    password: "",
    codiMO: "",
    rememberMe: false,
  });

  // Timers de progreso. Se guardan en ref para poder limpiarlos siempre.
  const timersRef = useRef<number[]>([]);

  const clearProgressTimers = () => {
    timersRef.current.forEach((id) => clearTimeout(id));
    timersRef.current = [];
  };

  const startProgressTimers = () => {
    clearProgressTimers();
    setProgress("connecting");
    timersRef.current.push(
        window.setTimeout(() => setProgress("working"), PHASE_WORKING_MS),
        window.setTimeout(() => setProgress("slow"), PHASE_SLOW_MS),
        window.setTimeout(() => setProgress("very_slow"), PHASE_VERY_SLOW_MS),
    );
  };

  const endProgress = () => {
    clearProgressTimers();
    setProgress("idle");
  };

  useEffect(() => {
    const credentials = getCredentials();
    if (credentials?.rememberMe) {
      setSavedForm({
        nif: credentials.nif,
        password: credentials.password,
        codiMO: credentials.codiMO,
        rememberMe: true,
      });
    }
    // Consulta al servidor si las credenciales demo están configuradas
    fetch("/api/demo-login")
        .then((r) => r.json())
        .then((data) => setDemoDisponible(data.available === true))
        .catch(() => setDemoDisponible(false));

    return () => clearProgressTimers();
  }, []);

  /**
   * Mapea el resultado tipado de validateCredentials al state del hook
   * y dispara la navegación si todo OK.
   */
  const finalizar = useCallback(
      async (
          result: Awaited<ReturnType<typeof validateCredentials>>,
          nif: string,
          password: string,
          codiMO: string,
          rememberMe: boolean
      ) => {
        switch (result.kind) {
          case "valid":
            saveCredentials({ nif, password, codiMO, codiMOList: [codiMO], rememberMe });
            router.replace("/home");
            break;
          case "invalid":
            setState("error_credentials");
            break;
          case "timeout":
            setState("error_timeout");
            break;
          case "network":
            setState("error_network");
            break;
        }
      },
      [router]
  );

  const login = useCallback(
      async (nif: string, password: string, codiMO: string, rememberMe: boolean) => {
        if (!nif.trim() || !password.trim() || !codiMO.trim()) {
          setState("error_empty");
          return;
        }
        setState("loading");
        startProgressTimers();
        try {
          const result = await validateCredentials(nif, password, codiMO);
          await finalizar(result, nif, password, codiMO, rememberMe);
        } finally {
          endProgress();
        }
      },
      [finalizar]
  );

  const loginDemo = useCallback(async () => {
    setState("loading");
    startProgressTimers();
    try {
      const res = await fetch("/api/demo-login", { method: "POST" });
      if (!res.ok) {
        setState("error_demo");
        return;
      }
      const { nif, password, codiMO } = await res.json();
      const result = await validateCredentials(nif, password, codiMO);
      await finalizar(result, nif, password, codiMO, false);
    } catch {
      setState("error_network");
    } finally {
      endProgress();
    }
  }, [finalizar]);

  const loginOffline = useCallback(
      (nif: string, password: string, codiMO: string, rememberMe: boolean) => {
        if (!nif.trim() || !password.trim() || !codiMO.trim()) {
          setState("error_empty");
          return;
        }
        saveCredentials({ nif, password, codiMO, codiMOList: [codiMO], rememberMe });
        router.replace("/home");
      },
      [router]
  );

  const logout = useCallback(() => {
    const credentials = getCredentials();
    if (!credentials?.rememberMe) {
      clearCredentials();
    }
    router.replace("/login");
  }, [router]);

  return {
    state,
    progress,
    login,
    loginDemo,
    loginOffline,
    logout,
    isAuthenticated,
    savedForm,
    demoDisponible,
  };
}