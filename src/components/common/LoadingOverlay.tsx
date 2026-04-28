export default function LoadingOverlay({ mensaje }: { mensaje: string }) {
    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
            <div className="bg-card rounded-2xl p-6 flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-main-green border-t-transparent rounded-full animate-spin"/>
                <p className="text-sm text-blue-grey">{mensaje}</p>
            </div>
        </div>
    );
}