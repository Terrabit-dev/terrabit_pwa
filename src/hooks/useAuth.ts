"use client";

import { useState, useCallback, useEffect } from "react";
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
    | "error_demo";

export interface SavedForm {
  nif: string;
  password: string;
  codiMO: string;
  rememberMe: boolean;
}

export function useAuth() {
  const router = useRouter();
  const [state, setState] = useState<LoginState>("idle");
  const [demoDisponible, setDemoDisponible] = useState(false);
  const [savedForm, setSavedForm] = useState<SavedForm>({
    nif: "",
    password: "",
    codiMO: "",
    rememberMe: false,
  });

  useEffect(() => {
    const credentials = getCredentials();
    if (credentials?.rememberMe) {
      setSavedForm({
        nif:        credentials.nif,
        password:   credentials.password,
        codiMO:     credentials.codiMO,
        rememberMe: true,
      });
    }

    // Consulta al servidor si las credenciales demo están configuradas
    fetch("/api/demo-login")
        .then((r) => r.json())
        .then((data) => setDemoDisponible(data.available === true))
        .catch(() => setDemoDisponible(false));
  }, []);

  const login = useCallback(
      async (nif: string, password: string, codiMO: string, rememberMe: boolean) => {
        if (!nif.trim() || !password.trim() || !codiMO.trim()) {
          setState("error_empty");
          return;
        }

        setState("loading");

        try {
          const valid = await validateCredentials(nif, password, codiMO);
          if (valid) {
            saveCredentials({ nif, password, codiMO, codiMOList: [codiMO], rememberMe });
            router.replace("/home");
          } else {
            setState("error_credentials");
          }
        } catch {
          setState("error_network");
        }
      },
      [router]
  );

  /**
   * Llama al API route server-side, obtiene las credenciales demo descifradas
   * y hace login exactamente igual que un login normal.
   * rememberMe=false: la sesión demo no se persiste entre recargas.
   */
  const loginDemo = useCallback(async () => {
    setState("loading");

    try {
      const res = await fetch("/api/demo-login", { method: "POST" });

      if (!res.ok) {
        setState("error_demo");
        return;
      }

      const { nif, password, codiMO } = await res.json();

      // Guarda en sessionStorage para que todos los hooks de bovinos/porcinos
      // lean las credenciales exactamente igual que en un login normal.
      saveCredentials({
        nif,
        password,
        codiMO,
        codiMOList: [codiMO],
        rememberMe: false,
      });

      router.replace("/home");
    } catch {
      setState("error_network");
    }
  }, [router]);

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

  return { state, login, loginDemo, loginOffline, logout, isAuthenticated, savedForm, demoDisponible };
}