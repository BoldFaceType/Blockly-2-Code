
import { describe, it, expect } from 'vitest';
import { WorkspaceBlock } from '../types';
import {
  findAndRemoveBlock,
  findAndAddBlock,
  findAndUpdateBlock,
  findBlock,
} from '../utils/blockTree';

describe('Block Tree Utilities', () => {
  const createBlock = (id: string, children: WorkspaceBlock[] = []): WorkspaceBlock => ({
    id,
    type: 'test_block',
    inputValues: {},
    inputBlocks: {},
    children: {
      body: children,
    },
  });

  describe('findAndRemoveBlock', () => {
    it('should remove a top-level block', () => {
      const blocks = [createBlock('1'), createBlock('2'), createBlock('3')];
      const { blocks: newBlocks, removed } = findAndRemoveBlock(blocks, '2');
      expect(newBlocks.map(b => b.id)).toEqual(['1', '3']);
      expect(removed?.id).toBe('2');
    });

    it('should remove a nested block', () => {
      const blocks = [createBlock('1', [createBlock('2', [createBlock('3')])])];
      const { blocks: newBlocks, removed } = findAndRemoveBlock(blocks, '3');
      expect(newBlocks[0].children.body[0].children.body).toEqual([]);
      expect(removed?.id).toBe('3');
    });
  });

  describe('findAndAddBlock', () => {
    it('should add a block to a parent', () => {
      const blocks = [createBlock('1'), createBlock('2')];
      const newBlocks = findAndAddBlock(blocks, createBlock('3'), { parentId: '1', areaName: 'body' });
      expect(newBlocks[0].children.body[0].id).toBe('3');
    });
  });

  describe('findAndUpdateBlock', () => {
    it('should update a top-level block', () => {
      const blocks = [createBlock('1'), createBlock('2')];
      const newBlocks = findAndUpdateBlock(blocks, '2', b => ({ ...b, type: 'updated_block' }));
      expect(newBlocks[1].type).toBe('updated_block');
    });

    it('should update a nested block', () => {
      const blocks = [createBlock('1', [createBlock('2')])];
      const newBlocks = findAndUpdateBlock(blocks, '2', b => ({ ...b, type: 'updated_block' }));
      expect(newBlocks[0].children.body[0].type).toBe('updated_block');
    });
  });

  describe('findBlock', () => {
    it('should find a top-level block', () => {
      const blocks = [createBlock('1'), createBlock('2')];
      const found = findBlock(blocks, '2');
      expect(found?.id).toBe('2');
    });

    it('should find a nested block', () => {
      const blocks = [createBlock('1', [createBlock('2')])];
      const found = findBlock(blocks, '2');
      expect(found?.id).toBe('2');
    });
  });
});
