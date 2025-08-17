
import React from 'react';
import { WorkspaceBlock } from '../types';
import { Block } from './Block';
import { Connectors } from './Connectors';

interface WorkspaceProps {
  blocks: WorkspaceBlock[];
  onUpdatePosition: (id: string, x: number, y: number) => void;
  onUpdateValue: (blockId: string, inputName: string, value: string) => void;
  onDelete: (id: string) => void;
  onDropOnBlock: (e: React.DragEvent<HTMLDivElement>) => void;
  zoom: number;
}

export const Workspace: React.FC<WorkspaceProps> = ({ blocks, onUpdatePosition, onUpdateValue, onDelete, onDropOnBlock, zoom }) => {
  return (
    <div
      className="relative bg-[var(--workspace-bg)]"
      style={{
        width: '4000px',
        height: '3000px',
        backgroundImage: 'linear-gradient(var(--grid-color) 1px, transparent 1px), linear-gradient(to right, var(--grid-color) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        transform: `scale(${zoom})`,
        transformOrigin: 'top left',
      }}
    >
      <Connectors blocks={blocks} />
      {blocks.length === 0 && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
          <div className="text-center text-[var(--hint-color)]">
            <h2 className="text-2xl font-bold">Workspace</h2>
            <p>Drag blocks from the left or click on them to add.</p>
          </div>
        </div>
      )}
      {blocks.map(block => (
        <Block
          key={block.id}
          data={block}
          onUpdatePosition={onUpdatePosition}
          onUpdateValue={onUpdateValue}
          onDelete={onDelete}
          onDropOnBlock={onDropOnBlock}
          zoom={zoom}
        />
      ))}
    </div>
  );
};
