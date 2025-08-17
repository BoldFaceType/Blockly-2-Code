
import { WorkspaceBlock } from '../types';

/**
 * Recursively finds and removes a block from a tree of blocks.
 * @param blocks The array of blocks to search through.
 * @param blockId The ID of the block to remove.
 * @returns An object containing the modified blocks array and the removed block.
 */
export const findAndRemoveBlock = (blocks: WorkspaceBlock[], blockId: string): { blocks: WorkspaceBlock[], removed: WorkspaceBlock | null } => {
    let removedBlock: WorkspaceBlock | null = null;

    const filterRecursive = (blockArray: WorkspaceBlock[]): WorkspaceBlock[] => {
        const directMatchIndex = blockArray.findIndex(b => b.id === blockId);
        if (directMatchIndex > -1) {
            removedBlock = blockArray[directMatchIndex];
            const newArray = [...blockArray];
            newArray.splice(directMatchIndex, 1);
            return newArray;
        }

        return blockArray.map(block => {
            if (removedBlock) return block; // Optimization: stop searching once found

            let newBlock = { ...block };
            let hasChanged = false;

            // Check inputBlocks
            const newInputBlocks = { ...newBlock.inputBlocks };
            for (const key in newInputBlocks) {
                const inputBlock = newInputBlocks[key];
                if (inputBlock?.id === blockId) {
                    removedBlock = inputBlock;
                    delete newInputBlocks[key];
                    hasChanged = true;
                    break;
                }
                 if (inputBlock) {
                    const result = findAndRemoveBlock([inputBlock], blockId);
                    if (result.removed) {
                        removedBlock = result.removed;
                        delete newInputBlocks[key];
                        hasChanged = true;
                        break;
                    }
                }
            }

            // Check children areas
            const newChildren = { ...newBlock.children };
            if (!removedBlock) {
                 for (const key in newChildren) {
                    const result = findAndRemoveBlock(newChildren[key], blockId);
                    if (result.removed) {
                        removedBlock = result.removed;
                        newChildren[key] = result.blocks;
                        hasChanged = true;
                        break;
                    }
                }
            }
           
            if (hasChanged) {
                newBlock.inputBlocks = newInputBlocks;
                newBlock.children = newChildren;
                return newBlock;
            }

            return block;
        });
    };

    const newBlocks = filterRecursive(blocks);
    return { blocks: newBlocks, removed: removedBlock };
};

/**
 * Recursively finds a parent block and adds a new block to it.
 * @param blocks The array of blocks to search through.
 * @param blockToAdd The block to add.
 * @param target An object defining where to add the block.
 * @returns The modified array of blocks.
 */
export const findAndAddBlock = (blocks: WorkspaceBlock[], blockToAdd: WorkspaceBlock, target: { parentId: string; inputName?: string; areaName?: string, childIndex?: number }): WorkspaceBlock[] => {
    return blocks.map(block => {
        if (block.id === target.parentId) {
            const newBlock = { ...block };
            if (target.inputName) { // Add to an input socket
                newBlock.inputBlocks = { ...newBlock.inputBlocks, [target.inputName]: blockToAdd };
            } else if (target.areaName) { // Add to a nestable area
                const children = [...(newBlock.children?.[target.areaName] || [])];
                const index = target.childIndex !== undefined && target.childIndex > -1 ? target.childIndex : children.length;
                children.splice(index, 0, blockToAdd);
                newBlock.children = { ...newBlock.children, [target.areaName]: children };
            }
            return newBlock;
        }
        
        // Recurse
        const newChildren = { ...block.children };
        for (const key in newChildren) {
            newChildren[key] = findAndAddBlock(newChildren[key], blockToAdd, target);
        }
        const newInputBlocks = { ...block.inputBlocks };
        for (const key in newInputBlocks) {
            const inputBlock = newInputBlocks[key];
            if (inputBlock) {
                const result = findAndAddBlock([inputBlock], blockToAdd, target);
                newInputBlocks[key] = result[0];
            }
        }

        return { ...block, children: newChildren, inputBlocks: newInputBlocks };
    });
};


/**
 * Recursively finds and updates a block in a tree.
 * @param blocks The array of blocks to search.
 * @param blockId The ID of the block to update.
 * @param updateFn A function that receives the block and returns its updated version.
 * @returns The modified array of blocks, or null if the block wasn't found.
 */
export const findAndUpdateBlock = (blocks: WorkspaceBlock[], blockId: string, updateFn: (block: WorkspaceBlock) => WorkspaceBlock): WorkspaceBlock[] | null => {
    let found = false;
    const updateRecursive = (blockArray: WorkspaceBlock[]): WorkspaceBlock[] => {
        return blockArray.map(block => {
            if (found) return block;
            if (block.id === blockId) {
                found = true;
                return updateFn(block);
            }

            const newChildren = { ...block.children };
            let hasChanged = false;
            for (const key in newChildren) {
                const updatedChildren = updateRecursive(newChildren[key]);
                if (found) {
                    newChildren[key] = updatedChildren;
                    hasChanged = true;
                    break;
                }
            }
            if (found) return { ...block, children: newChildren };

            const newInputBlocks = { ...block.inputBlocks };
            for(const key in newInputBlocks) {
                const inputBlock = newInputBlocks[key];
                if (inputBlock) {
                    const updatedInputBlocks = updateRecursive([inputBlock]);
                     if (found) {
                        newInputBlocks[key] = updatedInputBlocks[0];
                        hasChanged = true;
                        break;
                    }
                }
            }

            if (found) return { ...block, inputBlocks: newInputBlocks };
            return block;
        });
    };
    
    const result = updateRecursive(blocks);
    return found ? result : null;
};

/**
 * Recursively finds a single block by its ID.
 * @param blocks The array of blocks to search.
 * @param blockId The ID to find.
 * @returns The found block or null.
 */
export const findBlock = (blocks: WorkspaceBlock[], blockId: string): WorkspaceBlock | null => {
    for (const block of blocks) {
        if (block.id === blockId) return block;
        
        for (const key in block.children) {
            const found = findBlock(block.children[key], blockId);
            if (found) return found;
        }
        for (const key in block.inputBlocks) {
            const inputBlock = block.inputBlocks[key];
            if (inputBlock) {
                const found = findBlock([inputBlock], blockId);
                if(found) return found;
            }
        }
    }
    return null;
}


/**
 * Traverses the tree to find all top-level blocks.
 * In the current setup, the main state `allBlocks` is already the list of top-level blocks.
 * This function is kept for clarity and potential future changes where `allBlocks` might represent a flatter structure.
 */
export const findTopLevelBlocks = (allBlocks: WorkspaceBlock[]): WorkspaceBlock[] => {
  // In our current design, the root of the state IS the list of top-level blocks.
  return allBlocks;
};
