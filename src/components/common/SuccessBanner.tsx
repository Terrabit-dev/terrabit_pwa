export default function SuccessBanner({ mensaje }: { mensaje: string }) {
    return (
        <div className="px-4 py-3 bg-main-green-bg rounded-xl flex items-center gap-2">
            <svg className="w-4 h-4 text-main-green shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            <p className="text-xs text-main-green font-medium">{mensaje}</p>
        </div>
    );
}