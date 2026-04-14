"use client";

import { useState } from "react";
import { formatearFechaDisplay } from "@/lib/bovinos/nacimiento";

export default function DateInputDMY({
                                         value,
                                         onChange,
                                         placeholder,
                                     }: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
}) {
    const [inputValue, setInputValue] = useState(
        value ? formatearFechaDisplay(value) : ""
    );

    const handleChange = (raw: string) => {
        let digits = raw.replace(/[^\d]/g, "");
        if (digits.length > 8) digits = digits.slice(0, 8);
        let formatted = digits;
        if (digits.length > 2) formatted = digits.slice(0, 2) + "/" + digits.slice(2);
        if (digits.length > 4) formatted = formatted.slice(0, 5) + "/" + formatted.slice(5);
        setInputValue(formatted);
        if (digits.length === 8) {
            const day   = digits.slice(0, 2);
            const month = digits.slice(2, 4);
            const year  = digits.slice(4, 8);
            onChange(`${year}-${month}-${day}`);
        } else {
            onChange("");
        }
    };

    return (
        <div className="flex items-center border border-surface-variant rounded-xl px-3 py-2.5 bg-surface focus-within:border-main-green transition-colors">
            <svg className="w-4 h-4 text-blue-grey shrink-0 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
            </svg>
            <input
                type="text"
                value={inputValue}
                onChange={(e) => handleChange(e.target.value)}
                placeholder={placeholder ?? "dd/mm/aaaa"}
                maxLength={10}
                inputMode="numeric"
                className="flex-1 text-sm bg-transparent outline-none text-dark-blue-grey placeholder-blue-grey/50"
            />
        </div>
    );
}