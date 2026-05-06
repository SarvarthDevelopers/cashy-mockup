import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    confirmVariant?: 'danger' | 'primary';
    requireTypedConfirmation?: boolean;
    typedConfirmationWord?: string;
    warningMessage?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Confirm',
    confirmVariant = 'primary',
    requireTypedConfirmation = false,
    typedConfirmationWord = 'delete',
    warningMessage
}) => {
    const [typedWord, setTypedWord] = useState('');

    if (!isOpen) return null;

    const isConfirmDisabled = requireTypedConfirmation && typedWord.toLowerCase() !== typedConfirmationWord.toLowerCase();

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
            />
            
            {/* Modal Content */}
            <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className={`p-2 rounded-xl ${confirmVariant === 'danger' ? 'bg-red-50' : 'bg-blue-50'}`}>
                            <AlertTriangle className={`w-6 h-6 ${confirmVariant === 'danger' ? 'text-red-500' : 'text-blue-500'}`} />
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-400"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-6">
                        {description}
                    </p>

                    {warningMessage && (
                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6">
                            <p className="text-amber-800 text-xs font-medium leading-relaxed">
                                {warningMessage}
                            </p>
                        </div>
                    )}

                    {requireTypedConfirmation && (
                        <div className="mb-6">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                Type "{typedConfirmationWord}" to confirm
                            </label>
                            <input 
                                type="text"
                                value={typedWord}
                                onChange={(e) => setTypedWord(e.target.value)}
                                placeholder={`Type ${typedConfirmationWord}...`}
                                className="w-full h-11 bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm focus:outline-none focus:border-[#4649E5] transition-all"
                                autoFocus
                            />
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button 
                            onClick={onClose}
                            className="flex-1 h-12 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-xl transition-all text-sm"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            disabled={isConfirmDisabled}
                            className={`flex-1 h-12 font-bold rounded-xl transition-all text-sm shadow-lg
                                ${confirmVariant === 'danger' 
                                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-100' 
                                    : 'bg-[#17142b] hover:bg-[#252135] text-white shadow-gray-100'}
                                ${isConfirmDisabled ? 'opacity-50 cursor-not-allowed grayscale' : ''}
                            `}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
