
import React, { useEffect } from 'react';
import { CloseIcon } from './Icons';

interface AiModalProps {
  isOpen: boolean;
  onClose: () => void;
  explanation: string;
  isLoading: boolean;
}

export const AiModal: React.FC<AiModalProps> = ({ isOpen, onClose, explanation, isLoading }) => {
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
           if (event.key === 'Escape') {
              onClose();
           }
        };
        window.addEventListener('keydown', handleEsc);
    
        return () => {
          window.removeEventListener('keydown', handleEsc);
        };
      }, [onClose]);

    if (!isOpen) return null;

    const formattedExplanation = explanation.replace(/```python\n([\s\S]*?)```/g, '<pre class="bg-gray-800 text-white p-4 rounded-md my-4 font-mono text-sm overflow-x-auto"><code>$1</code></pre>');

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div 
                className="bg-[var(--toolbox-bg)] text-[var(--text-color)] rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-[var(--border-color)]">
                    <h2 className="text-xl font-bold">AI Code Explanation</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 transition-colors">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-48">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--text-color)]"></div>
                        </div>
                    ) : (
                         <div className="prose prose-sm md:prose-base prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: formattedExplanation }} />
                    )}
                </div>
            </div>
        </div>
    );
}
