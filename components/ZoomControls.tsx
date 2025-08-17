
import React from 'react';

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({ zoom, onZoomIn, onZoomOut }) => {
  return (
    <div className="absolute bottom-4 right-4 z-20 flex items-center bg-[var(--toolbox-bg)] rounded-lg shadow-lg border border-[var(--border-color)]">
      <button 
        onClick={onZoomOut} 
        className="p-2 text-[var(--text-color)] hover:bg-white/10 rounded-l-md transition-colors disabled:opacity-50" 
        disabled={zoom <= 0.3}
        aria-label="Zoom out"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
      </button>
      <span className="px-3 py-2 text-sm font-semibold text-[var(--text-color)] border-x border-[var(--border-color)] w-20 text-center">
        {Math.round(zoom * 100)}%
      </span>
      <button 
        onClick={onZoomIn} 
        className="p-2 text-[var(--text-color)] hover:bg-white/10 rounded-r-md transition-colors disabled:opacity-50" 
        disabled={zoom >= 2}
        aria-label="Zoom in"
      >
         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
      </button>
    </div>
  );
};
