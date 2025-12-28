import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Info } from 'lucide-react';

const InfoTooltip = ({ title, content, position = 'top' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [tooltipStyle, setTooltipStyle] = useState({});
    const tooltipRef = useRef(null);
    const buttonRef = useRef(null);

    // Calculate tooltip position when opened
    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const updatePosition = () => {
                const rect = buttonRef.current.getBoundingClientRect();
                const tooltipWidth = 320; // w-80 = 320px
                const spacing = 12;

                let style = {};
                switch (position) {
                    case 'bottom':
                        let left = rect.left + rect.width / 2;
                        // Check if tooltip would go off screen
                        if (left - tooltipWidth / 2 < 10) {
                            left = tooltipWidth / 2 + 10;
                        } else if (left + tooltipWidth / 2 > window.innerWidth - 10) {
                            left = window.innerWidth - tooltipWidth / 2 - 10;
                        }
                        style = {
                            top: `${rect.bottom + spacing}px`,
                            left: `${left}px`,
                            transform: 'translateX(-50%)'
                        };
                        break;
                    case 'top':
                        let topLeft = rect.left + rect.width / 2;
                        if (topLeft - tooltipWidth / 2 < 10) {
                            topLeft = tooltipWidth / 2 + 10;
                        } else if (topLeft + tooltipWidth / 2 > window.innerWidth - 10) {
                            topLeft = window.innerWidth - tooltipWidth / 2 - 10;
                        }
                        style = {
                            bottom: `${window.innerHeight - rect.top + spacing}px`,
                            left: `${topLeft}px`,
                            transform: 'translateX(-50%)'
                        };
                        break;
                    case 'right':
                        style = {
                            top: `${rect.top + rect.height / 2}px`,
                            left: `${rect.right + spacing}px`,
                            transform: 'translateY(-50%)'
                        };
                        break;
                    case 'left':
                        style = {
                            top: `${rect.top + rect.height / 2}px`,
                            right: `${window.innerWidth - rect.left + spacing}px`,
                            transform: 'translateY(-50%)'
                        };
                        break;
                }
                setTooltipStyle(style);
            };

            updatePosition();
            
            // Update on scroll and resize
            window.addEventListener('scroll', updatePosition, true);
            window.addEventListener('resize', updatePosition);

            return () => {
                window.removeEventListener('scroll', updatePosition, true);
                window.removeEventListener('resize', updatePosition);
            };
        }
    }, [isOpen, position]);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                tooltipRef.current &&
                !tooltipRef.current.contains(event.target) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="relative inline-block z-[100]">
            <button
                ref={buttonRef}
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                onMouseEnter={() => setIsOpen(true)}
                onMouseLeave={() => setIsOpen(false)}
                className="inline-flex items-center justify-center w-5 h-5 rounded-full text-gray-400 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 relative z-[100]"
                aria-label="Bilgi"
            >
                <Info className="w-4 h-4" strokeWidth={2.5} />
            </button>

            {isOpen && createPortal(
                <div
                    ref={tooltipRef}
                    className="fixed z-[99999] w-80 max-w-sm pointer-events-auto"
                    style={{
                        ...tooltipStyle
                    }}
                    onMouseEnter={() => setIsOpen(true)}
                    onMouseLeave={() => setIsOpen(false)}
                >
                    <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-xl p-4 relative">
                        {/* Arrow */}
                        {position === 'top' && (
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                                <div className="w-2.5 h-2.5 bg-white border-r border-b border-gray-200 transform rotate-45"></div>
                            </div>
                        )}
                        {position === 'bottom' && (
                            <div className="absolute -top-1 left-1/2 -translate-x-1/2">
                                <div className="w-2.5 h-2.5 bg-white border-l border-t border-gray-200 transform rotate-45"></div>
                            </div>
                        )}
                        {position === 'right' && (
                            <div className="absolute -left-1 top-1/2 -translate-y-1/2">
                                <div className="w-2.5 h-2.5 bg-white border-l border-t border-gray-200 transform rotate-45"></div>
                            </div>
                        )}
                        {position === 'left' && (
                            <div className="absolute -right-1 top-1/2 -translate-y-1/2">
                                <div className="w-2.5 h-2.5 bg-white border-r border-b border-gray-200 transform rotate-45"></div>
                            </div>
                        )}

                        {/* Content */}
                        <h4 className="text-sm font-bold text-gray-900 mb-3">{title}</h4>
                        <div className="text-xs text-gray-700 leading-relaxed space-y-2">
                            {typeof content === 'string' ? (
                                <p>{content}</p>
                            ) : Array.isArray(content) ? (
                                <div className="space-y-2">
                                    {content.map((item, index) => (
                                        <div key={index}>
                                            {item.type === 'paragraph' && <p className="mb-2">{item.text}</p>}
                                            {item.type === 'list' && (
                                                <ul className="list-disc list-inside space-y-1.5 ml-2 mb-2">
                                                    {item.items.map((listItem, listIndex) => (
                                                        <li key={listIndex} className="leading-relaxed">{listItem}</li>
                                                    ))}
                                                </ul>
                                            )}
                                            {item.type === 'bold' && (
                                                <p className="font-semibold text-gray-800 italic mt-2">{item.text}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default InfoTooltip;

