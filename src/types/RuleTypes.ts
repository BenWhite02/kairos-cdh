// src/types/RuleTypes.ts
// Comprehensive type definitions for the Visual Rule Builder system
// Defines all data structures used across the rule building interface

export type AtomCategory = 'condition' | 'action' | 'computation' | 'flow' | 'data';

export type ParameterValue = string | number | boolean | any[] | Record<string, any>;

export interface AtomParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'array' | 'object';
  description?: string;
  required?: boolean;
  defaultValue?: ParameterValue;
  options?: Array<{ label: string; value: any }>;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  placeholder?: string;
  step?: number;
}

export interface AtomExample {
  title: string;
  description: string;
  configuration?: Record<string, any>;
}

export interface AtomDefinition {
  type: string;
  name: string;
  description: string;
  category: AtomCategory;
  complexity: number; // 1-10 scale
  parameters?: AtomParameter[];
  examples?: AtomExample[];
  tags?: string[];
  icon?: string;
  color?: string;
}

export interface AtomInstance {
  id: string;
  type: string;
  label?: string;
  position: { x: number; y: number };
  parameters: Record<string, ParameterValue>;
  children: AtomInstance[];
  metadata: {
    created: string;
    modified: string;
    version?: string;
  };
}

export interface Rule {
  id: string;
  name: string;
  description: string;
  rootAtom: AtomInstance | null;
  metadata: {
    version: string;
    created: string;
    modified: string;
    tags: string[];
    author?: string;
    status?: 'draft' | 'active' | 'archived';
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface TestScenario {
  name: string;
  description: string;
  input: Record<string, any>;
  expectedOutput?: any;
}

export interface ExecutionStep {
  atomId: string;
  action: string;
  timestamp: number;
  input?: any;
  output?: any;
  duration?: number;
}

export interface TestMetrics {
  memoryUsage: number; // KB
  cpuTime: number; // ms
  atomsExecuted: number;
  cacheHits: number;
  cacheMisses: number;
}

export interface TestResult {
  status: 'success' | 'error' | 'timeout';
  output: any;
  error?: string;
  executionTime: number;
  executionTrace?: ExecutionStep[];
  metrics?: TestMetrics;
}