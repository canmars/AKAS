import React, { useEffect } from 'react';

const DetailModal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) => {
    // ESC tuşu ile kapatma
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Body scroll'u engelle
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden p-4 backdrop-blur-md bg-black/40 transition-all"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className={`relative w-full ${maxWidth} max-h-[90vh] rounded-[32px] bg-white/95 backdrop-blur-xl shadow-2xl ring-1 ring-black/5 overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200`}>
                {/* Header - Glassmorphism Effect */}
                <div className="flex items-center justify-between border-b border-slate-200/50 bg-white/80 backdrop-blur-sm p-6 shrink-0">
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        type="button"
                        className="ms-auto inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100/80 hover:bg-slate-200/80 text-slate-600 hover:text-slate-900 transition-colors"
                    >
                        <svg className="h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                        </svg>
                        <span className="sr-only">Kapat</span>
                    </button>
                </div>
                
                {/* Body - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {children}
                </div>
                
                {/* Footer - Glassmorphism Effect */}
                <div className="flex items-center justify-end border-t border-slate-200/50 p-5 space-x-3 rounded-b-[32px] bg-white/80 backdrop-blur-sm shrink-0">
                    <button
                        onClick={onClose}
                        type="button"
                        className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Kapat
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DetailModal;
