
export enum BlockCategory {
  CONTROL = 'Control Flow',
  FUNCTIONS = 'Functions',
  VARIABLES = 'Variables & Data',
  OPERATIONS = 'Operators',
  IO = 'Input/Output',
  STRING_OPS = 'String Operations',
  LIST_DICT_OPS = 'List & Dict Operations',
  ERROR_HANDLING = 'Error Handling',
  UTILITY = 'Utility',
}

export interface InputDefinition {
  name: string;
  type: 'text' | 'number' | 'select';
  placeholder?: string;
  options?: string[];
  defaultValue?: string;
  validation?: {
    pattern: string;
    message: string;
  };
}

export interface NestableAreaDefinition {
  name: string;
  label: string;
}

export interface BlockDefinition {
  text: string;
  category: BlockCategory;
  syntax: string;
  inputs: InputDefinition[];
  nestableAreas?: NestableAreaDefinition[];
  template: string;
  color: string;
  accent: string;
  flow: boolean;
  isExpression: boolean;
}

export interface WorkspaceBlock {
  id: string;
  type: string;
  x?: number; // Optional: only for top-level blocks
  y?: number; // Optional: only for top-level blocks
  inputValues: { [key: string]: string };
  inputBlocks: { [key: string]: WorkspaceBlock | undefined };
  children: { [areaName: string]: WorkspaceBlock[] };
  validationErrors: { [key: string]: string | null };
}

export type Theme = 'light' | 'vscode-dark' | 'monokai' | 'dracula';

export interface ProjectData {
  blocks: WorkspaceBlock[];
  theme: Theme;
  timestamp: string;
}
