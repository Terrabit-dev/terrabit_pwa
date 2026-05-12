"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  saveCredentials,
  getCredentials,
  clearCredentials,
  isAuthenticated,
} from "@/lib/storage/credentials";

type AuthState =
    | "idle"
    | "loading"
    | "error_empty"
    | "error_credentials"
    | "error_network"
    | "error_demo";

interface SavedForm {
  nif: string;
  password: string;
  codiMO: string;
  rememberMe: boolean;
}

async function validateCredentials(
    nif: string,
    passwordMobilitat: string,
    codiMO: string
): Promise<boolean> {
  try {
    const res = await fetch("/api/gtr/identificadors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nif, passwordMobilitat, codiMO }),
    });
    if (!res.ok) throw new Error("network");
    const data = await res.json();
    return data.valid === true;
  } catch {
    throw new Error("network");
  }
}

export function useAuth() {
  const router = useRouter();
  const [state, setState] = useState<AuthState>("idle");
  const [demoDisponible, setDemoDisponible] = useState(false);
  const [savedForm, setSavedForm] = useState<SavedForm>({
    nif: "",
    password: "",
    codiMO: "",
    rememberMe: false,
  });

  useEffect(() => {
    const saved = getCredentials();
    if (saved?.rememberMe) {
      setSavedForm({
        nif: saved.nif,
        password: saved.password,
        codiMO: saved.codiMO,
        rememberMe: true,
      });
    }
    setDemoDisponible(process.env.NEXT_PUBLIC_DEMO_AVAILABLE === "true");
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
            saveCredentials({
              nif,
              password,
              codiMO,
              codiMOList: [codiMO],
              rememberMe,
            });
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

  const loginDemo = useCallback(async () => {
    setState("loading");
    try {
      const res = await fetch("/api/demo-login", { method: "POST" });
      if (!res.ok) {
        setState("error_demo");
        return;
      }
      const { nif, password, codiMO } = await res.json();
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
        saveCredentials({
          nif,
          password,
          codiMO,
          codiMOList: [codiMO],
          rememberMe,
        });
        router.replace("/home");
      },
      [router]
  );

  const logout = useCallback(() => {
    const saved = getCredentials();
    if (!saved?.rememberMe) {
      clearCredentials();
    }
    router.replace("/login");
  }, [router]);

  return {
    state,
    login,
    loginDemo,
    loginOffline,
    logout,
    isAuthenticated,
    savedForm,
    demoDisponible,
  };
}