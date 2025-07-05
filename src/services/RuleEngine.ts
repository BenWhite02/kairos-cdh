// src/services/RuleEngine.ts
// Service layer for rule validation, execution, and management
// Connects Visual Rule Builder to Hades backend APIs

import { Rule, ValidationResult, TestResult, AtomInstance } from '../types/RuleTypes';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
class RuleEngineService {
  private async makeRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        // Add auth headers when ready
        // 'Authorization': `Bearer ${getAuthToken()}`
      },
      ...options
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Rule validation
  async validateRule(rule: Rule): Promise<ValidationResult> {
    try {
      return await this.makeRequest<ValidationResult>('/rules/validate', {
        method: 'POST',
        body: JSON.stringify(rule)
      });
    } catch (error) {
      // Fallback client-side validation
      return this.clientSideValidation(rule);
    }
  }

  // Rule execution/testing
  async executeRule(rule: Rule, testData: any): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      return await this.makeRequest<TestResult>('/rules/execute', {
        method: 'POST',
        body: JSON.stringify({ rule, input: testData })
      });
    } catch (error) {
      // Mock execution for demo purposes
      return this.mockExecution(rule, testData, startTime);
    }
  }

  // Save rule
  async saveRule(rule: Rule): Promise<{ id: string; version: string }> {
    try {
      return await this.makeRequest<{ id: string; version: string }>('/rules', {
        method: 'POST',
        body: JSON.stringify(rule)
      });
    } catch (error) {
      // Mock save for demo
      return {
        id: rule.id || `rule_${Date.now()}`,
        version: '1.0.0'
      };
    }
  }

  // Load rule
  async loadRule(ruleId: string): Promise<Rule> {
    return await this.makeRequest<Rule>(`/rules/${ruleId}`);
  }

  // List rules
  async listRules(): Promise<Rule[]> {
    try {
      return await this.makeRequest<Rule[]>('/rules');
    } catch (error) {
      return []; // Return empty array for demo
    }
  }

  // Client-side validation fallback
  private clientSideValidation(rule: Rule): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Basic validation rules
    if (!rule.name.trim()) {
      errors.push('Rule name is required');
    }

    if (!rule.rootAtom) {
      errors.push('Rule must have at least one atom');
      suggestions.push('Drag an atom from the palette to start building your rule');
      return { isValid: false, errors, warnings, suggestions };
    }

    // Validate atom tree
    this.validateAtomTree(rule.rootAtom, errors, warnings, suggestions);

    // Performance suggestions
    const atomCount = this.countAtoms(rule.rootAtom);
    if (atomCount > 20) {
      suggestions.push('Consider breaking this rule into smaller, more manageable rules for better performance');
    }

    if (atomCount > 50) {
      warnings.push('This rule is very complex and may have performance issues');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  private validateAtomTree(atom: AtomInstance, errors: string[], warnings: string[], suggestions: string[]): void {
    // Check for missing required parameters
    if (!atom.type) {
      errors.push(`Atom ${atom.id} is missing type`);
    }

    // Check for empty parameter values that might be required
    const parameterCount = Object.keys(atom.parameters).length;
    if (parameterCount === 0) {
      warnings.push(`Atom ${atom.id} (${atom.type}) has no configured parameters`);
    }

    // Check for circular references
    if (this.hasCircularReference(atom)) {
      errors.push(`Circular reference detected in atom ${atom.id}`);
    }

    // Validate children recursively
    atom.children.forEach(child => {
      this.validateAtomTree(child, errors, warnings, suggestions);
    });

    // Performance suggestions
    if (atom.children.length > 10) {
      suggestions.push(`Consider simplifying atom ${atom.id} - it has many children which may impact performance`);
    }
  }

  private countAtoms(atom: AtomInstance): number {
    return 1 + atom.children.reduce((count, child) => count + this.countAtoms(child), 0);
  }

  private hasCircularReference(atom: AtomInstance, visited: Set<string> = new Set()): boolean {
    if (visited.has(atom.id)) {
      return true;
    }
    
    visited.add(atom.id);
    
    for (const child of atom.children) {
      if (this.hasCircularReference(child, new Set(visited))) {
        return true;
      }
    }
    
    return false;
  }

  // Mock execution for demo purposes
  private mockExecution(rule: Rule, testData: any, startTime: number): TestResult {
    const executionTime = Date.now() - startTime + Math.random() * 100; // Add some realistic timing
    
    // Simulate successful execution
    if (Math.random() > 0.1) { // 90% success rate
      return {
        status: 'success',
        output: {
          result: true,
          message: 'Rule executed successfully',
          matchedConditions: ['age_range', 'geography'],
          actions: ['send_email'],
          context: testData
        },
        executionTime,
        executionTrace: [
          {
            atomId: 'atom_1',
            action: 'evaluate_condition',
            timestamp: 10,
            input: testData,
            output: true
          },
          {
            atomId: 'atom_2',
            action: 'execute_action',
            timestamp: 45,
            input: { triggered: true },
            output: { sent: true }
          }
        ],
        metrics: {
          memoryUsage: Math.floor(Math.random() * 1000) + 500,
          cpuTime: Math.floor(executionTime * 0.8),
          atomsExecuted: rule.rootAtom ? this.countAtoms(rule.rootAtom) : 0,
          cacheHits: Math.floor(Math.random() * 5),
          cacheMisses: Math.floor(Math.random() * 2)
        }
      };
    } else {
      // Simulate error
      return {
        status: 'error',
        output: null,
        error: 'Mock error: Parameter validation failed',
        executionTime
      };
    }
  }
}

// Singleton instance
export const ruleEngineService = new RuleEngineService();

// Export functions for backwards compatibility
export const validateRule = (rule: Rule) => ruleEngineService.validateRule(rule);
export const executeRule = (rule: Rule, testData: any) => ruleEngineService.executeRule(rule, testData);
export const saveRule = (rule: Rule) => ruleEngineService.saveRule(rule);
export const loadRule = (ruleId: string) => ruleEngineService.loadRule(ruleId);