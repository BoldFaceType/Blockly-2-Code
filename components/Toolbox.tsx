import React, { useState } from 'react';
import { BLOCKS } from '../constants';
import { BlockCategory, WorkspaceBlock } from '../types';

interface ToolboxProps {
  onBlockClick: (type: string) => void;
}

const ToolboxBlock: React.FC<{ type: string; onBlockClick: (type: string) => void }> = ({ type, onBlockClick }) => {
  const blockDef = BLOCKS[type];

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    
    const newBlock: WorkspaceBlock = {
        id: `block_${Date.now()}_${Math.random()}`,
        type,
        inputValues: {},
        inputBlocks: {},
        children: {},
        validationErrors: {},
    };

    const dragData = {
        block: newBlock,
        source: 'toolbox',
    };

    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => onBlockClick(type)}
      className={`${blockDef.color} text-white text-base font-medium px-4 py-2 rounded-md cursor-grab active:cursor-grabbing hover:shadow-lg transition-all duration-150 ease-in-out transform hover:-translate-y-0.5 border-l-4 ${blockDef.accent}`}
    >
      {blockDef.text}
    </div>
  );
};

const ExpressionToolboxBlock: React.FC<{ type: string }> = ({ type }) => {
    const blockDef = BLOCKS[type];

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        const newBlock: WorkspaceBlock = {
            id: `block_${Date.now()}_${Math.random()}`,
            type,
            inputValues: {},
            inputBlocks: {},
            children: {},
            validationErrors: {},
        };

        const dragData = {
            block: newBlock,
            source: 'toolbox',
        };

        e.dataTransfer.setData('application/json', JSON.stringify(dragData));
        e.dataTransfer.effectAllowed = 'copy';
    };

    return (
        <div
            draggable
            onDragStart={handleDragStart}
            className={`${blockDef.color} text-white text-xs font-semibold px-2.5 py-1 rounded-full cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-150 ease-in-out transform hover:-translate-y-px border-2 border-white/20`}
            title={blockDef.text}
        >
            {blockDef.text}
        </div>
    );
};

export const Toolbox: React.FC<ToolboxProps> = ({ onBlockClick }) => {
    const groupedBlocks = Object.entries(BLOCKS).reduce((acc, [type, def]) => {
        if (!acc[def.category]) {
            acc[def.category] = [];
        }
        acc[def.category].push(type);
        return acc;
    }, {} as Record<BlockCategory, string[]>);

    const categoryOrder = [
        BlockCategory.IO,
        BlockCategory.VARIABLES,
        BlockCategory.OPERATIONS,
        BlockCategory.STRING_OPS,
        BlockCategory.LIST_DICT_OPS,
        BlockCategory.CONTROL,
        BlockCategory.FUNCTIONS,
        BlockCategory.ERROR_HANDLING,
        BlockCategory.UTILITY,
    ];
    
    const [expandedCategories, setExpandedCategories] = useState(new Set(categoryOrder));

    const toggleCategory = (category: BlockCategory) => {
        setExpandedCategories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(category)) {
                newSet.delete(category);
            } else {
                newSet.add(category);
            }
            return newSet;
        });
    };

  return (
    <div className="w-64 bg-[var(--toolbox-bg)] text-[var(--text-color)] p-4 overflow-y-auto border-r border-[var(--border-color)]">
      {categoryOrder.map(category => {
        const isExpanded = expandedCategories.has(category);
        const statementBlocks = groupedBlocks[category]?.filter(type => !BLOCKS[type].isExpression) || [];
        const expressionBlocks = groupedBlocks[category]?.filter(type => BLOCKS[type].isExpression) || [];

        return groupedBlocks[category] && (
          <div key={category} className="mb-4">
            <button 
                onClick={() => toggleCategory(category)}
                className="w-full flex justify-between items-center text-left font-bold text-lg mb-2 text-[var(--text-color)]/80 hover:text-[var(--text-color)] transition-colors p-1 rounded-md hover:bg-white/5"
                aria-expanded={isExpanded}
                aria-controls={`category-panel-${category.replace(/\s/g, '-')}`}
            >
              <span>{category}</span>
              <svg 
                className={`w-5 h-5 transition-transform duration-200 transform ${isExpanded ? 'rotate-90' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
            
            {isExpanded && (
              <div 
                id={`category-panel-${category.replace(/\s/g, '-')}`}
                className="pl-2 border-l-2 border-[var(--border-color)]/30"
              >
                {statementBlocks.length > 0 && (
                  <div className="grid gap-2">
                    {statementBlocks.map(type => (
                      <ToolboxBlock key={type} type={type} onBlockClick={onBlockClick} />
                    ))}
                  </div>
                )}
                {expressionBlocks.length > 0 && (
                  <div className={`flex flex-wrap gap-2 ${statementBlocks.length > 0 ? 'pt-2 mt-2 border-t border-[var(--border-color)]/30' : ''}`}>
                    {expressionBlocks.map(type => (
                      <ExpressionToolboxBlock key={type} type={type} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  );
};