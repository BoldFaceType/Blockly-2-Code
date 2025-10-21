
import { describe, it, expect } from 'vitest';
import { WorkspaceBlock } from '../types';
import { validateWorkspaceRecursive } from '../utils/validation';

describe('Validation Logic', () => {
  const createBlock = (type: string, inputValues: Record<string, string> = {}): WorkspaceBlock => ({
    id: `block_${Math.random()}`,
    type,
    inputValues,
    inputBlocks: {},
    children: {},
  });

  it('should identify undeclared variables', () => {
    const blocks = [createBlock('print', { value: 'my_variable' })];
    const { validatedBlocks } = validateWorkspaceRecursive(blocks, new Set());
    expect(validatedBlocks[0].validationErrors?.value).toBe("Undeclared variable: 'my_variable'");
  });

  it('should validate variable names', () => {
    const blocks = [createBlock('variable', { name: '1invalid_name', value: '10' })];
    const { validatedBlocks } = validateWorkspaceRecursive(blocks, new Set());
    expect(validatedBlocks[0].validationErrors?.name).toBe('Invalid name');
  });

  it('should not flag declared variables', () => {
    const blocks = [
      createBlock('variable', { name: 'my_variable', value: '10' }),
      createBlock('print', { value: 'my_variable' }),
    ];
    const { validatedBlocks } = validateWorkspaceRecursive(blocks, new Set());
    expect(validatedBlocks[1].validationErrors?.value).toBeNull();
  });
});
