"use client";

import { useState, useCallback } from "react";
import {
    getCredentials,
    getActiveCodiMO,
    getCodiMOList,
    saveCredentials,
} from "@/lib/storage/credentials";

export function useMO() {
    const [activeMO, setActiveMOState] = useState<string>(() => getActiveCodiMO());
    const [moList] = useState<string[]>(() => getCodiMOList());

    const setActiveMO = useCallback((codiMO: string) => {
        const credentials = getCredentials();
        if (!credentials) return;
        saveCredentials({ ...credentials, codiMO });
        setActiveMOState(codiMO);
    }, []);

    return { activeMO, moList, setActiveMO };
}
