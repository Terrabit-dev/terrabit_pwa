import type { OpcionSelect } from "@/lib/bovinos/types";

export default function SelectInput({
                                        value,
                                        onChange,
                                        options,
                                        placeholder,
                                        disabled = false,
                                    }: {
    value: string;
    onChange: (codigo: string, nombre: string) => void;
    options: OpcionSelect[];
    placeholder?: string;
    disabled?: boolean;
}) {
    return (
        <div className="flex items-center border border-surface-variant rounded-xl px-3 py-2.5 bg-surface focus-within:border-main-green transition-colors">
            <select
                value={value}
                onChange={(e) => {
                    const opt = options.find((o) => o.codigo === e.target.value);
                    if (opt) onChange(opt.codigo, opt.nombre);
                }}
                disabled={disabled}
                className="flex-1 text-sm bg-transparent outline-none text-dark-blue-grey disabled:opacity-50 appearance-none"
            >
                <option value="">{placeholder ?? "Seleccionar..."}</option>
                {options.map((o) => (
                    <option key={o.codigo} value={o.codigo}>
                        {o.nombre}
                    </option>
                ))}
            </select>
            <svg className="w-4 h-4 text-blue-grey shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
        </div>
    );
}