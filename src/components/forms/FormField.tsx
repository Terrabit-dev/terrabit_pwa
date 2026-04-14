export default function FormField({
                                      label,
                                      children,
                                  }: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-blue-grey uppercase tracking-wide">
                {label}
            </label>
            {children}
        </div>
    );
}