export default function DateInput({
                                      value,
                                      onChange,
                                      disabled = false,
                                  }: {
    value: string;
    onChange: (v: string) => void;
    disabled?: boolean;
}) {
    return (
        <div className="flex items-center border border-surface-variant rounded-xl px-3 py-2.5 bg-surface focus-within:border-main-green transition-colors">
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