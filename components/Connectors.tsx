
import React, { useState, useEffect } from 'react';
import { WorkspaceBlock } from '../types';
import { BLOCKS } from '../constants';

interface ConnectorsProps {
  blocks: WorkspaceBlock[];
}

const getCurvePath = (startX: number, startY: number, endX: number, endY: number) => {
  const horizontalMidpoint = startX + 60; // Make the curve go out horizontally first
  const endHorizontalMidpoint = endX - 60;
  return `M ${startX} ${startY} C ${horizontalMidpoint} ${startY}, ${endHorizontalMidpoint} ${endY}, ${endX} ${endY}`;
};

export const Connectors: React.FC<ConnectorsProps> = ({ blocks }) => {
  const [paths, setPaths] = useState<string[]>([]);
  
  // This effect needs to depend on the positions of the blocks
  const blockPositions = JSON.stringify(blocks.map(b => ({id: b.id, x: b.x, y: b.y})));

  useEffect(() => {
    // Only connect top-level flow blocks
    const flowBlocks = blocks
      .filter(b => BLOCKS[b.type]?.flow && b.x !== undefined && b.y !== undefined)
      .sort((a,b) => (a.x || 0) - (b.x || 0)); // Sort left-to-right
      
    const newPaths: string[] = [];
    
    // Simple linear connection based on sorted order
    for (let i = 0; i < flowBlocks.length - 1; i++) {
        const currentBlock = flowBlocks[i];
        const nextBlock = flowBlocks[i+1];
        
        const currentElem = document.getElementById(currentBlock.id);
        const nextElem = document.getElementById(nextBlock.id);

        if (currentElem && nextElem) {
            const startX = (currentBlock.x || 0) + currentElem.offsetWidth;
            const startY = (currentBlock.y || 0) + currentElem.offsetHeight / 2;
            const endX = (nextBlock.x || 0);
            const endY = (nextBlock.y || 0) + nextElem.offsetHeight / 2;
          
            newPaths.push(getCurvePath(startX, startY, endX, endY));
        }
    }

    setPaths(newPaths);
  }, [blocks, blockPositions]); // Rerun when block list or their positions change

  if (paths.length === 0) {
    return null;
  }

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="2" refY="3.5" orient="auto">
          <polygon points="0 0, 8 3.5, 0 7" fill="var(--hint-color)" />
        </marker>
      </defs>
      <g>
        {paths.map((path, index) => (
          <path
            key={index}
            d={path}
            stroke="var(--hint-color)"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            markerEnd="url(#arrowhead)"
          />
        ))}
      </g>
    </svg>
  );
};
