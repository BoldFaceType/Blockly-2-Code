
import { WorkspaceBlock } from '../types.ts';
import { generateCodeRecursive } from '../App.tsx';

import { BLOCKS as APP_BLOCKS } from '../constants';

const BLOCKS = {
  ...APP_BLOCKS,
  if_else_stmt: {
    ...APP_BLOCKS.if_else_stmt,
    template: 'if {condition}: {body}\nelse: {else_body}',
  }
};

const testGenerateCodeWithEmptyNestedBlock = () => {
  const block: WorkspaceBlock = {
    id: '1',
    type: 'if_else_stmt',
    inputValues: { condition: 'True' },
    inputBlocks: {},
    children: {
      body: [],
      else_body: [],
    },
    x: 0,
    y: 0,
  };

  const expectedCode = 'if True: \n  pass\nelse: \n  pass';
  const actualCode = generateCodeRecursive(block, '', BLOCKS);

  if (actualCode !== expectedCode) {
    console.error(`Test failed!
      Expected:
      '${expectedCode}'

      Got:
      '${actualCode}'`);
    process.exit(1);
  } else {
    console.log('Test passed!');
  }
};

testGenerateCodeWithEmptyNestedBlock();
