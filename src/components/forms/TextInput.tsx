export default function TextInput({
                                      value,
                                      onChange,
                                      placeholder,
                                      disabled = false,
                                  }: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    disabled?: boolean;
}) {
    return (
        <div className="flex items-center border border-surface-variant rounded-xl px-3 py-2.5 bg-surface focus-within:border-main-green transition-colors">
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                className="flex-1 text-sm bg-transparent outline-none text-dark-blue-grey placeholder-blue-grey/50 disabled:opacity-50"
            />
        </div>
    );
}