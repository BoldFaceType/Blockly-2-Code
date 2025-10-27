
import React from 'react';
import { CheckIcon } from './Icons';

interface SaveToastProps {
    isVisible: boolean;
}

export const SaveToast: React.FC<SaveToastProps> = ({ isVisible }) => {
    return (
        <div 
            className={`fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-green-600 text-white shadow-lg transition-all duration-300 ease-in-out
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}
        >
            <CheckIcon className="w-5 h-5" />
            Saved
        </div>
    );
};
