import React from 'react';

const DetailModal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden p-4 backdrop-blur-md bg-black/40 transition-all">
            <div className={`relative w-full ${maxWidth} max-h-full rounded-[32px] bg-white shadow-2xl ring-1 ring-black/5`}>
                {/* Header */}
                <div className="flex items-center justify-between border-b p-5">
                    <h3 className="text-xl font-semibold text-gray-900">
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        type="button"
                        className="ms-auto inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900"
                    >
                        <svg className="h-3 w-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                        </svg>
                        <span className="sr-only">Kapat</span>
                    </button>
                </div>
                {/* Body */}
                <div className="p-6 space-y-4">
                    {children}
                </div>
                {/* Footer (Optional) */}
                <div className="flex items-center justify-end border-t p-5 space-x-2 rounded-b-2xl bg-gray-50">
                    <button
                        onClick={onClose}
                        type="button"
                        className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100"
                    >
                        Kapat
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DetailModal;
