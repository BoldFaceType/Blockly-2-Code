
import React, { useRef } from 'react';
import { Theme } from '../types';
import { CodeIcon, BlocksIcon, ThemeIcon, ExportIcon, ImportIcon, ClearIcon, AiIcon } from './Icons';

interface ControlsProps {
  isCodeVisible: boolean;
  onToggleCodeView: () => void;
  onCycleTheme: () => void;
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClearAll: () => void;
  onExplainCode: () => void;
  isLoadingAi: boolean;
  isConfirmingClear: boolean;
}

const ControlButton = ({ children, onClick, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode, className?: string }) => {
    const baseClasses = "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md bg-white/10 text-[var(--text-color)] hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
    
    // Simple className merge. For more complex cases, a utility like tailwind-merge would be better.
    return (
        <button
            onClick={onClick}
            className={`${baseClasses} ${className || ''}`}
            {...props}
        >
            {children}
        </button>
    );
};


export const Controls: React.FC<ControlsProps> = ({
  isCodeVisible,
  onToggleCodeView,
  onCycleTheme,
  onExport,
  onImport,
  onClearAll,
  onExplainCode,
  isLoadingAi,
  isConfirmingClear,
}) => {
    const importInputRef = useRef<HTMLInputElement>(null);

    const handleImportClick = () => {
        importInputRef.current?.click();
    };

  return (
    <div className="flex flex-wrap items-center gap-2 p-2 bg-[var(--toolbox-bg)] border-b border-[var(--border-color)] shadow-md">
      <h1 className="text-xl font-bold text-[var(--text-color)] mr-4">BlocklyPython AI</h1>
      <ControlButton onClick={onToggleCodeView}>
        {isCodeVisible ? <BlocksIcon className="w-4 h-4" /> : <CodeIcon className="w-4 h-4" />}
        {isCodeVisible ? 'Show Blocks' : 'Show Code'}
      </ControlButton>
      <ControlButton onClick={onCycleTheme}><ThemeIcon className="w-4 h-4"/>Theme</ControlButton>
      <div className="flex-grow"></div>
      <ControlButton onClick={onExplainCode} disabled={isLoadingAi}>
        <AiIcon className="w-4 h-4"/>
        {isLoadingAi ? 'Thinking...' : 'Explain Code'}
      </ControlButton>
      <ControlButton onClick={onExport}><ExportIcon className="w-4 h-4" />Export</ControlButton>
       <ControlButton onClick={handleImportClick}><ImportIcon className="w-4 h-4" />Import</ControlButton>
       <input type="file" accept=".json" ref={importInputRef} onChange={onImport} className="hidden" />
      <ControlButton 
        onClick={onClearAll} 
        className={isConfirmingClear 
            ? "bg-red-700 text-white hover:bg-red-800" 
            : "bg-red-500/80 text-white hover:bg-red-500"
        }
        >
        <ClearIcon className="w-4 h-4"/>
        {isConfirmingClear ? 'Confirm Clear?' : 'Clear'}
      </ControlButton>
    </div>
  );
};
