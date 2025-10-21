
import { describe, it, expect } from 'vitest';
import { WorkspaceBlock } from '../types';
import { generateCodeRecursive } from '../App';
import { BLOCKS } from '../constants';

describe('generateCodeRecursive', () => {
  const createBlock = (type: string, inputValues: Record<string, string> = {}, children: Record<string, WorkspaceBlock[]> = {}, inputBlocks: Record<string, WorkspaceBlock> = {}): WorkspaceBlock => ({
    id: `block_${Math.random()}`,
    type,
    inputValues,
    inputBlocks,
    children,
  });

  Object.keys(BLOCKS).forEach(blockType => {
    it(`should generate code for a ${blockType} block`, () => {
      const definition = BLOCKS[blockType];
      const inputValues: Record<string, string> = {};
      definition.inputs.forEach(input => {
        inputValues[input.name] = input.placeholder || '';
      });
      const block = createBlock(blockType, inputValues);
      const code = generateCodeRecursive(block, '', BLOCKS);
      expect(code).toBeDefined();
    });
  });

  it('should generate code for a complex nested structure', () => {
    const printBlock = createBlock('print', { value: 'i' });
    const forLoopBlock = createBlock('for_loop', { var: 'i', iterable: 'range(3)' }, { body: [printBlock] });
    const functionDefBlock = createBlock('function_def', { name: 'my_function', params: 'arg1' }, { body: [forLoopBlock] });

    const expectedCode = `def my_function(arg1):
  for i in range(3):
    print(i)`;
    const actualCode = generateCodeRecursive(functionDefBlock, '', BLOCKS);
    expect(actualCode).toBe(expectedCode);
  });
});
