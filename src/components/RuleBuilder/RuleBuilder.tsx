// src/components/RuleBuilder/RuleBuilder.tsx
// Main orchestrator component for the visual rule builder interface
// Handles overall state management and coordination between palette and canvas

import React, { useState, useCallback, useRef } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { AtomPalette } from './AtomPalette';
import { RuleCanvas } from './RuleCanvas';
import { ValidationPanel } from './ValidationPanel';
import { TestingPanel } from './TestingPanel';
import { RuleExporter } from './RuleExporter';
import { Atom, Rule, ValidationResult, TestResult } from '../../types/RuleTypes';
import { validateRule, executeRule } from '../../services/RuleEngine';
import { Save, Play, Download, Settings, HelpCircle } from 'lucide-react';

interface RuleBuilderProps {
  initialRule?: Rule;
  onSave?: (rule: Rule) => void;
  onTest?: (rule: Rule, testData: any) => Promise<TestResult>;
}

export const RuleBuilder: React.FC<RuleBuilderProps> = ({
  initialRule,
  onSave,
  onTest
}) => {
  // State management
  const [rule, setRule] = useState<Rule>(initialRule || {
    id: '',
    name: 'New Rule',
    description: '',
    rootAtom: null,
    metadata: {
      version: '1.0.0',
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      tags: []
    }
  });

  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [showValidation, setShowValidation] = useState(true);
  const [showTesting, setShowTesting] = useState(false);
  const [showExporter, setShowExporter] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Validation handler
  const handleValidation = useCallback(async () => {
    if (!rule.rootAtom) {
      setValidation({
        isValid: false,
        errors: ['Rule must have at least one atom'],
        warnings: [],
        suggestions: ['Drag an atom from the palette to start building your rule']
      });
      return;
    }

    setIsValidating(true);
    try {
      const result = await validateRule(rule);
      setValidation(result);
    } catch (error) {
      setValidation({
        isValid: false,
        errors: [`Validation error: ${error}`],
        warnings: [],
        suggestions: []
      });
    } finally {
      setIsValidating(false);
    }
  }, [rule]);

  // Auto-validate when rule changes
  React.useEffect(() => {
    const timeoutId = setTimeout(handleValidation, 500);
    return () => clearTimeout(timeoutId);
  }, [handleValidation]);

  // Rule update handler
  const handleRuleUpdate = useCallback((updates: Partial<Rule>) => {
    setRule(prev => ({
      ...prev,
      ...updates,
      metadata: {
        ...prev.metadata,
        modified: new Date().toISOString()
      }
    }));
  }, []);

  // Save handler
  const handleSave = useCallback(() => {
    if (onSave && validation?.isValid) {
      onSave(rule);
    }
  }, [rule, validation, onSave]);

  // Test handler
  const handleTest = useCallback(async (testData: any) => {
    if (!onTest || !rule.rootAtom) return;
    
    setIsTesting(true);
    try {
      return await onTest(rule, testData);
    } finally {
      setIsTesting(false);
    }
  }, [rule, onTest]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Rule Builder</h1>
              <div className="flex flex-col">
                <input
                  type="text"
                  value={rule.name}
                  onChange={(e) => handleRuleUpdate({ name: e.target.value })}
                  className="text-lg font-medium bg-transparent border-none outline-none focus:bg-gray-50 px-2 py-1 rounded"
                  placeholder="Rule name..."
                />
                <input
                  type="text"
                  value={rule.description}
                  onChange={(e) => handleRuleUpdate({ description: e.target.value })}
                  className="text-sm text-gray-600 bg-transparent border-none outline-none focus:bg-gray-50 px-2 py-1 rounded"
                  placeholder="Add description..."
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Validation Status */}
              {validation && (
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                  validation.isValid 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    validation.isValid ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  {validation.isValid ? 'Valid' : 'Invalid'}
                </div>
              )}

              {/* Action Buttons */}
              <button
                onClick={() => setShowValidation(!showValidation)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                title="Toggle Validation Panel"
              >
                <Settings className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowTesting(!showTesting)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                title="Toggle Testing Panel"
              >
                <Play className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowExporter(!showExporter)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                title="Export Rule"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={handleSave}
                disabled={!validation?.isValid}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                <span>Save Rule</span>
              </button>

              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded">
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Left Sidebar - Atom Palette */}
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
            <AtomPalette />
          </div>

          {/* Center - Rule Canvas */}
          <div className="flex-1 flex flex-col">
            <RuleCanvas
              ref={canvasRef}
              rule={rule}
              onRuleUpdate={handleRuleUpdate}
              validation={validation}
            />
          </div>

          {/* Right Sidebar - Dynamic Panels */}
          <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
            {showValidation && (
              <ValidationPanel
                validation={validation}
                isValidating={isValidating}
                onRevalidate={handleValidation}
              />
            )}

            {showTesting && (
              <TestingPanel
                rule={rule}
                onTest={handleTest}
                isTesting={isTesting}
              />
            )}

            {showExporter && (
              <RuleExporter
                rule={rule}
                onClose={() => setShowExporter(false)}
              />
            )}
          </div>
        </div>
      </div>
    </DndProvider>
  );
};