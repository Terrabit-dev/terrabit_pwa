"use client";

interface SuccessModalProps {
    titulo:  string;
    mensaje: string;
    boton:   string;
    onClose: () => void;
}

export default function SuccessModal({ titulo, mensaje, boton, onClose }: SuccessModalProps) {
    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">

                {/* Icono */}
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-main-green/10 flex items-center justify-center">
                        <svg className="w-8 h-8 text-main-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                        </svg>
                    </div>
                </div>

                {/* Título */}
                <h3 className="text-base font-bold text-dark-blue-grey text-center mb-1">
                    {titulo}
                </h3>

                {/* Mensaje */}
                <p className="text-sm text-blue-grey text-center mb-6">
                    {mensaje}
                </p>

                {/* Botón aceptar */}
                <button
                    onClick={onClose}
                    className="w-full bg-main-green text-white rounded-xl py-3 text-sm font-semibold"
                >
                    {boton}
                </button>
            </div>
        </div>
    );
}