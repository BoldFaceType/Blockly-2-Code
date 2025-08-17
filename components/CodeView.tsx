
import React from 'react';

interface CodeViewProps {
  code: string;
}

export const CodeView: React.FC<CodeViewProps> = ({ code }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    alert('Code copied to clipboard!');
  };

  return (
    <div className="flex-1 bg-[var(--code-bg)] text-[var(--code-text)] p-4 overflow-y-auto relative font-mono">
        <button 
            onClick={handleCopy}
            className="absolute top-4 right-4 bg-white/10 px-3 py-1 rounded-md text-sm hover:bg-white/20 transition-colors"
        >
            Copy
        </button>
      <pre className="whitespace-pre-wrap text-sm leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
};
