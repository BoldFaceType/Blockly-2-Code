
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { WorkspaceBlock, Theme, ProjectData } from './types';
import { BLOCKS, THEMES } from './constants';
import { Controls } from './components/Controls';
import { Toolbox } from './components/Toolbox';
import { Workspace } from './components/Workspace';
import { CodeView } from './components/CodeView';
import { AiModal } from './components/AiModal';
import { ZoomControls } from './components/ZoomControls';
import { explainPythonCode } from './services/geminiService';
import { 
    findAndRemoveBlock,
    findAndAddBlock,
    findAndUpdateBlock,
    findBlock,
    findTopLevelBlocks,
} from './utils/blockTree';
import { validateWorkspaceRecursive } from './utils/validation';

export const generateCodeRecursive = (block: WorkspaceBlock, indent: string, BLOCKS: any): string => {
  const definition = BLOCKS[block.type];
  if (!definition) return '';

  let line = definition.template;

  // Process inputs and nested expression blocks
  definition.inputs.forEach(input => {
    const nestedBlock = block.inputBlocks?.[input.name];
    let value: string;
    if (nestedBlock) {
      value = generateCodeRecursive(nestedBlock, '', BLOCKS); // Expressions don't get indented
    } else {
      value = block.inputValues[input.name] || input.placeholder || '';
    }
    line = line.replace(`{${input.name}}`, value);
  });

  // Process nested statement blocks
  definition.nestableAreas?.forEach(area => {
    const children = block.children?.[area.name] || [];
    const childIndent = indent + '  ';
    const childrenCode = children.length > 0
      ? children.map(child => generateCodeRecursive(child, childIndent, BLOCKS)).join('\n')
      : `\n${childIndent}pass`;
    line = line.replace(`{${area.name}}`, childrenCode);
  });

  return indent + line;
};

const App: React.FC = () => {
  const [allBlocks, setAllBlocks] = useState<WorkspaceBlock[]>([]);
  const [isCodeVisible, setIsCodeVisible] = useState(false);
  const [theme, setTheme] = useState<Theme>('vscode-dark');
  const [generatedCode, setGeneratedCode] = useState('');
  
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiExplanation, setAiExplanation] = useState('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const clearConfirmTimeoutRef = useRef<number | null>(null);

  const [zoom, setZoom] = useState(1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.className = `theme-${theme}`;
  }, [theme]);
  
  
  const generateCode = useCallback(() => {
    const topLevelBlocks = findTopLevelBlocks(allBlocks);
    if (topLevelBlocks.length === 0) {
      setGeneratedCode('# Add blocks to the workspace to generate Python code.');
      return;
    }

    const sortedBlocks = [...topLevelBlocks].sort((a, b) => (a.x || 0) - (b.x || 0));
    const code = sortedBlocks.map(block => generateCodeRecursive(block, '', BLOCKS)).join('\n');
    setGeneratedCode(code);
  }, [allBlocks]);


  useEffect(() => {
    generateCode();
  }, [allBlocks, generateCode]);
  
  const handleUpdateBlockPosition = useCallback((id: string, x: number, y: number) => {
    setAllBlocks(prev => findAndUpdateBlock(prev, id, b => ({ ...b, x, y })) || prev);
  }, []);

  const handleUpdateBlockValue = useCallback((blockId: string, inputName: string, value: string) => {
    setAllBlocks(prev => findAndUpdateBlock(prev, blockId, b => ({
        ...b,
        inputValues: { ...b.inputValues, [inputName]: value }
    })) || prev);
  }, []);

  const handleDeleteBlock = useCallback((id: string) => {
    setAllBlocks(prev => findAndRemoveBlock(prev, id).blocks);
  }, []);
  
  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const draggedData = JSON.parse(event.dataTransfer.getData('application/json'));
    const { block: draggedBlock, source } = draggedData;
    const blockDef = BLOCKS[draggedBlock.type];
    if (!blockDef) return;

    let nextBlocks = allBlocks;

    // If the block was already on the workspace, remove it from its old position
    if (source === 'workspace') {
      nextBlocks = findAndRemoveBlock(allBlocks, draggedBlock.id).blocks;
    }

    const dropTargetElement = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-droptarget]');
    
    // Case 1: Dropping into a valid nesting target (input or area)
    if (dropTargetElement) {
      const targetType = dropTargetElement.getAttribute('data-droptarget');
      const parentId = dropTargetElement.getAttribute('data-parent-id');
      if (!parentId) return;

      // Dropping into an input socket
      if (targetType === 'input' && blockDef.isExpression) {
        const inputName = dropTargetElement.getAttribute('data-input-name');
        if (!inputName) return;
        
        // Remove x/y coords for nested blocks
        delete draggedBlock.x;
        delete draggedBlock.y;
        
        nextBlocks = findAndAddBlock(nextBlocks, draggedBlock, { parentId, inputName });
      }
      // Dropping into a statement area
      else if (targetType === 'area' && !blockDef.isExpression) {
        const areaName = dropTargetElement.getAttribute('data-area-name');
        const childIndex = parseInt(dropTargetElement.getAttribute('data-child-index') || '-1', 10);
        if (!areaName) return;

        // Remove x/y coords for nested blocks
        delete draggedBlock.x;
        delete draggedBlock.y;

        nextBlocks = findAndAddBlock(nextBlocks, draggedBlock, { parentId, areaName, childIndex });
      } 
      else {
        // Invalid drop (e.g. statement in input), do nothing
        return;
      }
    }
    // Case 2: Dropping onto the main workspace
    else if (scrollContainerRef.current) {
        if (blockDef.isExpression) return; // Expression blocks can't be top-level

        const rect = scrollContainerRef.current.getBoundingClientRect();
        const x = (event.clientX - rect.left) / zoom + scrollContainerRef.current.scrollLeft;
        const y = (event.clientY - rect.top) / zoom + scrollContainerRef.current.scrollTop;

        draggedBlock.x = Math.round(x / 20) * 20;
        draggedBlock.y = Math.round(y / 20) * 20;
        
        nextBlocks = [...nextBlocks, draggedBlock];
    }
    
    setAllBlocks(nextBlocks);
  }, [allBlocks, zoom]);


  const addBlockToWorkspace = useCallback((type: string) => {
      const blockDef = BLOCKS[type];
      if (!blockDef || blockDef.isExpression) return; // Don't add expression blocks to top-level directly

      const topLevelBlocks = findTopLevelBlocks(allBlocks);
      const newBlock: WorkspaceBlock = {
        id: `block_${Date.now()}_${Math.random()}`,
        type,
        x: 60 + (topLevelBlocks.length % 5) * 240,
        y: 60 + Math.floor(topLevelBlocks.length / 5) * 180,
        inputValues: {},
        inputBlocks: {},
        children: {},
        validationErrors: {},
      };
      setAllBlocks(prev => [...prev, newBlock]);
  }, [allBlocks]);
  
  const handleDragOverWorkspace = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleClearAll = useCallback(() => {
    if (isConfirmingClear) {
        setAllBlocks([]);
        setIsConfirmingClear(false);
        if (clearConfirmTimeoutRef.current) {
            clearTimeout(clearConfirmTimeoutRef.current);
            clearConfirmTimeoutRef.current = null;
        }
    } else {
        setIsConfirmingClear(true);
        clearConfirmTimeoutRef.current = window.setTimeout(() => {
            setIsConfirmingClear(false);
        }, 3000);
    }
  }, [isConfirmingClear]);

  // Effect to clean up timeout on unmount
  useEffect(() => {
    return () => {
        if (clearConfirmTimeoutRef.current) {
            clearTimeout(clearConfirmTimeoutRef.current);
        }
    };
  }, []);

  const handleCycleTheme = useCallback(() => {
    const currentIndex = THEMES.indexOf(theme);
    const nextIndex = (currentIndex + 1) % THEMES.length;
    setTheme(THEMES[nextIndex] as Theme);
  }, [theme]);

  const handleExport = useCallback(() => {
    const data: ProjectData = {
        blocks: allBlocks,
        theme,
        timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blockly-python-project-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [allBlocks, theme]);

  const handleImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        try {
            const result = e.target?.result as string;
            const data: ProjectData = JSON.parse(result);
            if (data.blocks && data.theme) {
                setAllBlocks(data.blocks);
                setTheme(data.theme);
            } else {
                alert('Invalid project file format.');
            }
        } catch (error) {
            alert('Error reading project file.');
        }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  }, []);

  const handleExplainCode = useCallback(async () => {
    setIsAiModalOpen(true);
    setIsLoadingAi(true);
    const explanation = await explainPythonCode(generatedCode);
    setAiExplanation(explanation);
    setIsLoadingAi(false);
  }, [generatedCode]);

  const handleZoomIn = () => setZoom(z => Math.min(2, z + 0.1));
  const handleZoomOut = () => setZoom(z => Math.max(0.3, z - 0.1));
  
  useEffect(() => {
    const { validatedBlocks, hasChanged } = validateWorkspaceRecursive(allBlocks, new Set());
    if (hasChanged) {
      setAllBlocks(validatedBlocks);
    }
  }, [allBlocks]);


  return (
    <div className="h-screen w-screen flex flex-col font-sans bg-[var(--workspace-bg)]">
      <Controls 
        isCodeVisible={isCodeVisible}
        onToggleCodeView={() => setIsCodeVisible(v => !v)}
        onCycleTheme={handleCycleTheme}
        onExport={handleExport}
        onImport={handleImport}
        onClearAll={handleClearAll}
        onExplainCode={handleExplainCode}
        isLoadingAi={isLoadingAi}
        isConfirmingClear={isConfirmingClear}
      />
      <main className="flex-1 flex overflow-hidden">
        <Toolbox onBlockClick={addBlockToWorkspace} />
        {isCodeVisible ? (
          <CodeView code={generatedCode} />
        ) : (
          <div 
            ref={scrollContainerRef}
            className="flex-1 relative overflow-auto scroll-container"
            onDrop={handleDrop}
            onDragOver={handleDragOverWorkspace}
          >
            <Workspace
              blocks={findTopLevelBlocks(allBlocks)}
              onDropOnBlock={handleDrop}
              onUpdatePosition={handleUpdateBlockPosition}
              onUpdateValue={handleUpdateBlockValue}
              onDelete={handleDeleteBlock}
              zoom={zoom}
            />
            <ZoomControls onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} zoom={zoom} />
          </div>
        )}
      </main>
      <AiModal 
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        explanation={aiExplanation}
        isLoading={isLoadingAi}
      />
    </div>
  );
};

export default App;

// Helper file: src/utils/blockTree.ts
// In a real app, this would be in a separate file.
// For this environment, it's embedded here.
declare global {
    interface Window {
        findAndRemoveBlock: any;
        findAndAddBlock: any;
        findAndUpdateBlock: any;
        findBlock: any;
        findTopLevelBlocks: any;
    }
}

if(typeof window !== 'undefined') {
  window.findAndRemoveBlock = findAndRemoveBlock;
  window.findAndAddBlock = findAndAddBlock;
  window.findAndUpdateBlock = findAndUpdateBlock;
  window.findBlock = findBlock;
  window.findTopLevelBlocks = findTopLevelBlocks;
}
