
import React, { useEffect, useRef } from 'react';
import { WorkspaceBlock, BlockDefinition, NestableAreaDefinition } from '../types';
import { BLOCKS } from '../constants';

interface BlockProps {
  data: WorkspaceBlock;
  onUpdatePosition: (id: string, x: number, y: number) => void;
  onUpdateValue: (blockId: string, inputName: string, value: string) => void;
  onDelete: (id: string) => void;
  onDropOnBlock: (e: React.DragEvent<HTMLDivElement>) => void;
  zoom: number;
  isNested?: boolean;
}

export const Block: React.FC<BlockProps> = ({ data, onUpdatePosition, onUpdateValue, onDelete, onDropOnBlock, zoom, isNested = false }) => {
  const blockRef = useRef<HTMLDivElement>(null);
  const definition = BLOCKS[data.type];

  const dragStateRef = useRef({ isDragging: false, offsetX: 0, offsetY: 0 });

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation(); // Prevent parent blocks from also being dragged
    const dragData = {
        block: data,
        source: 'workspace', // Identifies that this block is already on the workspace
    };
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = 'move';

    // A little visual trick to make the dragged block less opaque
    setTimeout(() => {
        if (blockRef.current) {
            blockRef.current.style.opacity = '0.5';
        }
    }, 0);
  };
  
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (blockRef.current) {
        blockRef.current.style.opacity = '1';
    }
  };

  const propsRef = useRef({ data, onUpdatePosition, zoom });
  useEffect(() => {
    propsRef.current = { data, onUpdatePosition, zoom };
  });

  // Top-level block movement logic
  useEffect(() => {
    if (isNested) return; // Only top-level blocks are draggable by this mechanism

    const blockElement = blockRef.current;
    if (!blockElement) return;

    const getCoords = (e: MouseEvent) => ({ x: e.clientX, y: e.clientY });

    const handleMove = (e: MouseEvent) => {
      if (!dragStateRef.current.isDragging) return;
      
      const { offsetX, offsetY } = dragStateRef.current;
      const { onUpdatePosition, zoom } = propsRef.current;
      
      const scrollContainer = blockElement.closest('.scroll-container');
      if (!scrollContainer) return;

      const coords = getCoords(e);
      const workspaceRect = scrollContainer.getBoundingClientRect();
      
      const newX = ((coords.x - offsetX) - workspaceRect.left) / zoom + scrollContainer.scrollLeft;
      const newY = ((coords.y - offsetY) - workspaceRect.top) / zoom + scrollContainer.scrollTop;

      const snappedX = Math.round(newX / 20) * 20;
      const snappedY = Math.round(newY / 20) * 20;

      onUpdatePosition(data.id, snappedX, snappedY);
    };

    const handleEnd = () => {
      dragStateRef.current.isDragging = false;
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
    };

    const handleStart = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-droptarget]') || target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.closest('.delete-btn')) {
        return;
      }
      e.stopPropagation();
      dragStateRef.current.isDragging = true;
      const coords = getCoords(e);
      const rect = blockElement.getBoundingClientRect();
      dragStateRef.current.offsetX = coords.x - rect.left;
      dragStateRef.current.offsetY = coords.y - rect.top;
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleEnd);
    };

    blockElement.addEventListener('mousedown', handleStart);
    return () => {
      blockElement.removeEventListener('mousedown', handleStart);
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
    };
  }, [data.id, isNested]);

  if (!definition) {
    return <div className="text-red-500">Error: Block type "{data.type}" not found.</div>;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, name: string) => {
    onUpdateValue(data.id, name, e.target.value);
  };

  const renderInput = (inputDef: BlockDefinition['inputs'][0]) => {
    const nestedBlock = data.inputBlocks?.[inputDef.name];
    const error = data.validationErrors?.[inputDef.name];
    const errorClasses = error ? 'ring-2 ring-red-500/80' : 'focus:ring-2 focus:ring-white/50';
    
    return (
      <div key={inputDef.name} className="flex flex-col items-start text-xs relative" title={error || ''}>
        <label className="font-semibold mb-1.5 opacity-80 select-none">{inputDef.name}:</label>
        <div 
          className="relative w-full min-h-[38px] flex items-center bg-white/20 rounded-md border border-white/30"
          data-droptarget="input"
          data-parent-id={data.id}
          data-input-name={inputDef.name}
        >
          {nestedBlock ? (
            <Block
              data={nestedBlock}
              onUpdatePosition={onUpdatePosition}
              onUpdateValue={onUpdateValue}
              onDelete={onDelete}
              onDropOnBlock={onDropOnBlock}
              zoom={zoom}
              isNested={true}
            />
          ) : (
            <>
              {inputDef.type === 'select' ? (
                <select
                  value={data.inputValues[inputDef.name] || inputDef.defaultValue}
                  onChange={e => handleInputChange(e, inputDef.name)}
                  className={`w-full h-full bg-transparent p-2 text-white focus:outline-none appearance-none ${errorClasses}`}
                >
                  {inputDef.options?.map(option => <option key={option} value={option} className="text-black">{option}</option>)}
                </select>
              ) : (
                <div className="relative w-full h-full">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-white/50 font-mono text-base">
                    {inputDef.type === 'text' && 'T'}
                    {inputDef.type === 'number' && '#'}
                  </span>
                  <input
                    type={inputDef.type}
                    placeholder={inputDef.placeholder}
                    value={data.inputValues[inputDef.name] || ''}
                    onChange={e => handleInputChange(e, inputDef.name)}
                    className={`w-full h-full bg-transparent p-2 pl-8 text-white placeholder-white/60 focus:outline-none ${errorClasses}`}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };
  
  const renderNestableArea = (areaDef: NestableAreaDefinition, childIndexOffset: number = 0) => {
    const children = data.children?.[areaDef.name] || [];
    return (
      <div key={areaDef.name} className="ml-4 mt-2">
        <label className="text-sm font-bold opacity-70">{areaDef.label}</label>
        <div className="pl-4 py-2 border-l-2 border-white/20 rounded-bl-md min-h-[40px] flex flex-col gap-2">
          {children.map((child, index) => (
            <div key={child.id}>
              <div 
                  className="h-2" // Drop zone between blocks
                  data-droptarget="area" 
                  data-parent-id={data.id} 
                  data-area-name={areaDef.name}
                  data-child-index={childIndexOffset + index}
              />
              <Block
                data={child}
                onUpdatePosition={onUpdatePosition}
                onUpdateValue={onUpdateValue}
                onDelete={onDelete}
                onDropOnBlock={onDropOnBlock}
                zoom={zoom}
                isNested={true}
              />
            </div>
          ))}
           <div 
              className="h-4 flex-grow" // Drop zone at the end
              data-droptarget="area"
              data-parent-id={data.id}
              data-area-name={areaDef.name}
              data-child-index={childIndexOffset + children.length}
            />
        </div>
      </div>
    );
  }

  const baseClasses = `text-white p-3 rounded-lg shadow-xl border-l-8 transition-all duration-100 ease-out touch-none`;
  const positionClasses = isNested ? 'relative' : 'absolute cursor-move';
  const pillClasses = isNested && definition.isExpression ? `inline-block p-1 rounded-full border ${definition.accent}` : 'w-full';
  
  if (isNested && definition.isExpression) {
    return (
        <div
            id={data.id}
            ref={blockRef}
            className={`${definition.color} p-1.5 rounded-md text-xs font-semibold select-none border-2 border-white/30`}
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            {definition.text}
        </div>
    )
  }

  return (
    <div
      id={data.id}
      ref={blockRef}
      style={!isNested ? { left: `${data.x}px`, top: `${data.y}px`, minWidth: '220px', zIndex: 10 } : {}}
      className={`${positionClasses} ${definition.color} ${baseClasses}`}
      onDrop={onDropOnBlock}
      draggable={!isNested}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
        {(!isNested && definition.flow) && (
            <>
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full w-2.5 h-5 bg-[var(--workspace-bg)] border-2 border-[var(--border-color)] rounded-l-md z-0" />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full w-2.5 h-5 bg-inherit border-2 border-white/30 rounded-r-md z-0" />
            </>
        )}
        <button onClick={() => onDelete(data.id)} className="delete-btn absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-sm hover:bg-red-600 transition-colors z-20">
            &times;
        </button>
      <strong className="block mb-2 font-bold text-lg select-none">{definition.text}</strong>
      <div className="space-y-3">
        {definition.inputs.map(renderInput)}
      </div>
      {definition.nestableAreas?.map(area => renderNestableArea(area))}
    </div>
  );
};
