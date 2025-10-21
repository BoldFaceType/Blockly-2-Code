
import { WorkspaceBlock } from '../types';
import { BLOCKS } from '../constants';

const PYTHON_KEYWORDS = new Set(['and', 'or', 'not', 'in', 'is', 'for', 'if', 'else', 'while', 'def', 'return', 'True', 'False', 'None', 'print', 'range', 'break', 'continue', 'class', 'import', 'from', 'as', 'try', 'except', 'finally', 'with', 'yield', 'lambda', 'pass']);

export const extractPotentialVariables = (value: string): string[] => {
    if (!value) return [];
    const tokens = value.match(/[a-zA-Z_][a-zA-Z0-9_]*/g) || [];
    return tokens.filter(token => !PYTHON_KEYWORDS.has(token) && isNaN(parseInt(token, 10)));
}

export const validateWorkspaceRecursive = (blocks: WorkspaceBlock[], parentSymbolTable: Set<string>): {validatedBlocks: WorkspaceBlock[], hasChanged: boolean} => {
    let hasErrorsChanged = false;
    const blockSymbolTable = new Set(parentSymbolTable);

    const validatedBlocks = blocks.map(block => {
        const definition = BLOCKS[block.type];
        if (!definition) return block;
        const blockErrors: { [inputId: string]: string | null } = {};

        // Add variables from this block to the symbol table for its children
        switch (block.type) {
            case 'variable':
                if (block.inputValues.name) blockSymbolTable.add(block.inputValues.name);
                break;
            case 'for_loop':
                if (block.inputValues.var) blockSymbolTable.add(block.inputValues.var);
                break;
            case 'function_def':
                if (block.inputValues.name) blockSymbolTable.add(block.inputValues.name);
                (block.inputValues.params || '').split(',').map(p => p.trim()).filter(Boolean).forEach(p => blockSymbolTable.add(p));
                break;
        }

        // Validate inputs
        definition.inputs.forEach(input => {
            const value = block.inputValues[input.name] || '';
            let error: string | null = null;

            if (!block.inputBlocks[input.name]) { // Only validate if not replaced by a block
                if (input.validation && value) {
                    if (!new RegExp(input.validation.pattern).test(value)) {
                        error = input.validation.message;
                    }
                }
                if (!error) {
                    const potentialVars = extractPotentialVariables(value);
                    for (const pv of potentialVars) {
                        if (!blockSymbolTable.has(pv)) {
                            error = `Undeclared variable: '${pv}'`;
                            break;
                        }
                    }
                }
            }
            blockErrors[input.name] = error;
        });

        // Recursively validate children
        const newChildren: { [areaName: string]: WorkspaceBlock[] } = {};
        if (definition.nestableAreas) {
            for(const area of definition.nestableAreas) {
                const result = validateWorkspaceRecursive(block.children[area.name] || [], blockSymbolTable);
                newChildren[area.name] = result.validatedBlocks;
                if(result.hasChanged) hasErrorsChanged = true;
            }
        }

        // Recursively validate input blocks
        const newInputBlocks: { [inputName: string]: WorkspaceBlock | undefined } = {};
         if (block.inputBlocks) {
            for(const inputName in block.inputBlocks) {
                const inputBlock = block.inputBlocks[inputName];
                if (inputBlock) {
                    const result = validateWorkspaceRecursive([inputBlock], blockSymbolTable);
                    newInputBlocks[inputName] = result.validatedBlocks[0];
                    if(result.hasChanged) hasErrorsChanged = true;
                }
            }
        }

        const newBlock = { ...block, validationErrors: blockErrors, children: newChildren, inputBlocks: newInputBlocks };
        if (JSON.stringify(block.validationErrors || {}) !== JSON.stringify(blockErrors)) {
            hasErrorsChanged = true;
        }

        return newBlock;
    });

    return { validatedBlocks, hasChanged: hasErrorsChanged };
};
