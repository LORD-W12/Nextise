import React, { useEffect } from 'react';
import { Button } from './Button';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children?: React.ReactNode;
    footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />
            <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl flex flex-col transform transition-all">
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-1 ml-auto bg-transparent border-0 text-gray-400 hover:text-gray-900 transition-colors float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                    >
                        <span className="text-2xl block outline-none focus:outline-none">×</span>
                    </button>
                </div>
                <div className="relative p-6 flex-auto">
                    {children}
                </div>
                {footer ? (
                    <div className="flex items-center justify-end p-5 border-t border-gray-100 space-x-3 rounded-b-xl">
                        {footer}
                    </div>
                ) : null}
            </div>
        </div>
    );
};
