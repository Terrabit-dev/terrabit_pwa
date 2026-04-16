export default function DateInput({
                                      value,
                                      onChange,
                                      disabled = false,
                                      accentColor = "main-green",
                                  }: {
    value: string;
    onChange: (v: string) => void;
    disabled?: boolean;
    accentColor?: "main-green" | "error-red";
}) {
    const borderFocus = accentColor === "error-red"
        ? "focus-within:border-error-red"
        : "focus-within:border-main-green";

    return (
        <div className={`flex items-center border border-surface-variant rounded-xl px-3 py-2.5 bg-surface ${borderFocus} transition-colors`}>
            <input
                type="date"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className="flex-1 text-sm bg-transparent outline-none text-dark-blue-grey disabled:opacity-50"
            />
        </div>
    );
}