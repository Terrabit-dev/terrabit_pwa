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
  | "error_empty";

export interface SavedForm {
  nif: string;
  password: string;
  codiMO: string;
  rememberMe: boolean;
}

export function useAuth() {
  const router = useRouter();
  const [state, setState] = useState<LoginState>("idle");
  const [savedForm, setSavedForm] = useState<SavedForm>({
    nif: "",
    password: "",
    codiMO: "",
    rememberMe: false,
  });

  // Carga credenciales guardadas al montar — equivalente a loadSavedCredentials() del ViewModel
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
    // Si tenía rememberMe, conserva las credenciales pero marca sesión cerrada
    // Si no, limpia todo
    if (!credentials?.rememberMe) {
      clearCredentials();
    }
    router.replace("/login");
  }, [router]);

  return { state, login, loginOffline, logout, isAuthenticated, savedForm };
}