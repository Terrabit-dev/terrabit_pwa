export default function ErrorModal({
                                       mensaje,
                                       onClose,
                                       lang,
                                   }: {
    mensaje: string;
    onClose: () => void;
    lang: string;
}) {
    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
                <div className="flex flex-col items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-error-red-bg rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-error-red" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                        </svg>
                    </div>
                    <h3 className="text-base font-bold text-dark-blue-grey text-center">Error</h3>
                    <p className="text-sm text-blue-grey text-center">{mensaje}</p>
                </div>
                <button
                    onClick={onClose}
                    className="w-full bg-error-red text-white rounded-xl py-2.5 text-sm font-semibold"
                >
                    {lang === "ca" ? "Acceptar" : "Aceptar"}
                </button>
            </div>
        </div>
    );
}