// src/components/RuleBuilder/TestingPanel.tsx
// Interactive testing interface for rules with scenario management and real-time execution
// Provides comprehensive testing capabilities with input/output visualization

import React, { useState, useRef } from 'react';
import { Rule, TestResult, TestScenario } from '../../types/RuleTypes';
import { 
  Play, 
  Plus, 
  Save, 
  Trash2, 
  Download, 
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Eye,
  EyeOff,
  Copy,
  Edit3
} from 'lucide-react';

interface TestingPanelProps {
  rule: Rule;
  onTest: (testData: any) => Promise<TestResult>;
  isTesting: boolean;
}

interface TestScenarioItem extends TestScenario {
  id: string;
  result?: TestResult;
  isRunning?: boolean;
}

const TestResultDisplay: React.FC<{ 
  result: TestResult;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}> = ({ result, isExpanded, onToggleExpanded }) => {
  const getStatusIcon = () => {
    switch (result.status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'timeout':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (result.status) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'timeout':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className={`border rounded-lg p-3 ${getStatusColor()}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="font-medium text-sm capitalize">{result.status}</span>
          <span className="text-xs opacity-75">
            {result.executionTime}ms
          </span>
        </div>
        <button
          onClick={onToggleExpanded}
          className="p-1 hover:bg-black hover:bg-opacity-10 rounded"
        >
          {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {/* Output Preview */}
      <div className="mb-2">
        <div className="text-xs font-medium opacity-75 mb-1">Output:</div>
        <div className="bg-black bg-opacity-10 rounded p-2 text-xs font-mono">
          {typeof result.output === 'object' 
            ? JSON.stringify(result.output, null, 2).slice(0, 100) + (JSON.stringify(result.output).length > 100 ? '...' : '')
            : String(result.output).slice(0, 100) + (String(result.output).length > 100 ? '...' : '')
          }
        </div>
      </div>

      {/* Error Display */}
      {result.error && (
        <div className="mb-2">
          <div className="text-xs font-medium text-red-700 mb-1">Error:</div>
          <div className="bg-red-100 border border-red-200 rounded p-2 text-xs">
            {result.error}
          </div>
        </div>
      )}

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-black border-opacity-20">
          {/* Full Output */}
          <div className="mb-3">
            <div className="text-xs font-medium opacity-75 mb-1">Full Output:</div>
            <pre className="bg-black bg-opacity-10 rounded p-2 text-xs font-mono overflow-x-auto max-h-40 overflow-y-auto">
              {typeof result.output === 'object' 
                ? JSON.stringify(result.output, null, 2)
                : String(result.output)
              }
            </pre>
          </div>

          {/* Execution Trace */}
          {result.executionTrace && (
            <div className="mb-3">
              <div className="text-xs font-medium opacity-75 mb-1">Execution Trace:</div>
              <div className="space-y-1">
                {result.executionTrace.map((step, index) => (
                  <div key={index} className="bg-black bg-opacity-5 rounded p-2 text-xs">
                    <div className="font-medium">{step.atomId}</div>
                    <div className="opacity-75">{step.action}</div>
                    <div className="text-xs opacity-50">{step.timestamp}ms</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Performance Metrics */}
          {result.metrics && (
            <div>
              <div className="text-xs font-medium opacity-75 mb-1">Metrics:</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>Memory: {result.metrics.memoryUsage}KB</div>
                <div>CPU: {result.metrics.cpuTime}ms</div>
                <div>Atoms: {result.metrics.atomsExecuted}</div>
                <div>Cache: {result.metrics.cacheHits} hits</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const TestScenarioEditor: React.FC<{
  scenario: TestScenarioItem | null;
  onSave: (scenario: Omit<TestScenarioItem, 'id'>) => void;
  onClose: () => void;
}> = ({ scenario, onSave, onClose }) => {
  const [name, setName] = useState(scenario?.name || '');
  const [description, setDescription] = useState(scenario?.description || '');
  const [input, setInput] = useState(
    scenario?.input ? JSON.stringify(scenario.input, null, 2) : '{\n  \n}'
  );
  const [expectedOutput, setExpectedOutput] = useState(
    scenario?.expectedOutput ? JSON.stringify(scenario.expectedOutput, null, 2) : ''
  );

  const handleSave = () => {
    try {
      const parsedInput = JSON.parse(input);
      const parsedExpectedOutput = expectedOutput ? JSON.parse(expectedOutput) : undefined;
      
      onSave({
        name,
        description,
        input: parsedInput,
        expectedOutput: parsedExpectedOutput
      });
      onClose();
    } catch (error) {
      alert('Invalid JSON format');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {scenario ? 'Edit' : 'Create'} Test Scenario
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Scenario Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Valid User Login"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe what this test scenario validates..."
              />
            </div>

            {/* Input Data */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Input Data (JSON)
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                placeholder="Enter test input as JSON..."
              />
            </div>

            {/* Expected Output */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expected Output (JSON, optional)
              </label>
              <textarea
                value={expectedOutput}
                onChange={(e) => setExpectedOutput(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                placeholder="Enter expected output for validation..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save Scenario
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const TestingPanel: React.FC<TestingPanelProps> = ({
  rule,
  onTest,
  isTesting
}) => {
  const [scenarios, setScenarios] = useState<TestScenarioItem[]>([
    {
      id: 'default',
      name: 'Default Test',
      description: 'Basic test scenario',
      input: { userId: 123, action: 'login' }
    }
  ]);
  
  const [selectedScenario, setSelectedScenario] = useState<string>('default');
  const [editingScenario, setEditingScenario] = useState<TestScenarioItem | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());
  const [quickTestInput, setQuickTestInput] = useState('{\n  "userId": 123,\n  "action": "test"\n}');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const runScenario = async (scenarioId: string) => {
    const scenario = scenarios.find(s => s.id === scenarioId);
    if (!scenario) return;

    // Mark scenario as running
    setScenarios(prev => prev.map(s => 
      s.id === scenarioId ? { ...s, isRunning: true } : s
    ));

    try {
      const result = await onTest(scenario.input);
      
      // Update scenario with result
      setScenarios(prev => prev.map(s => 
        s.id === scenarioId ? { ...s, result, isRunning: false } : s
      ));
    } catch (error) {
      // Handle test error
      setScenarios(prev => prev.map(s => 
        s.id === scenarioId ? { 
          ...s, 
          result: {
            status: 'error',
            output: null,
            error: String(error),
            executionTime: 0
          },
          isRunning: false 
        } : s
      ));
    }
  };

  const runAllScenarios = async () => {
    for (const scenario of scenarios) {
      await runScenario(scenario.id);
    }
  };

  const runQuickTest = async () => {
    try {
      const input = JSON.parse(quickTestInput);
      await onTest(input);
    } catch (error) {
      alert('Invalid JSON input');
    }
  };

  const addScenario = (scenarioData: Omit<TestScenarioItem, 'id'>) => {
    const newScenario: TestScenarioItem = {
      ...scenarioData,
      id: `scenario_${Date.now()}`
    };
    setScenarios(prev => [...prev, newScenario]);
  };

  const updateScenario = (scenarioData: Omit<TestScenarioItem, 'id'>) => {
    if (!editingScenario) return;
    
    setScenarios(prev => prev.map(s => 
      s.id === editingScenario.id ? { ...scenarioData, id: s.id, result: s.result } : s
    ));
  };

  const deleteScenario = (scenarioId: string) => {
    setScenarios(prev => prev.filter(s => s.id !== scenarioId));
    if (selectedScenario === scenarioId) {
      setSelectedScenario(scenarios[0]?.id || '');
    }
  };

  const exportScenarios = () => {
    const data = JSON.stringify(scenarios, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${rule.name}_test_scenarios.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importScenarios = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        setScenarios(imported);
      } catch (error) {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  const toggleResultExpanded = (scenarioId: string) => {
    setExpandedResults(prev => {
      const newSet = new Set(prev);
      if (newSet.has(scenarioId)) {
        newSet.delete(scenarioId);
      } else {
        newSet.add(scenarioId);
      }
      return newSet;
    });
  };

  const selectedScenarioData = scenarios.find(s => s.id === selectedScenario);

  return (
    <>
      <div className="h-full flex flex-col bg-white">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Test Rule</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowEditor(true)}
                className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                title="Add Scenario"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={exportScenarios}
                className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                title="Export Scenarios"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                title="Import Scenarios"
              >
                <Upload className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Test */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Test
            </label>
            <textarea
              value={quickTestInput}
              onChange={(e) => setQuickTestInput(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-sm font-mono border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter JSON input for quick testing..."
            />
            <button
              onClick={runQuickTest}
              disabled={isTesting}
              className="mt-2 w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300"
            >
              <Play className="w-4 h-4" />
              <span>Run Quick Test</span>
            </button>
          </div>

          {/* Run All Button */}
          <button
            onClick={runAllScenarios}
            disabled={isTesting || scenarios.length === 0}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Run All Scenarios ({scenarios.length})</span>
          </button>
        </div>

        {/* Scenario List */}
        <div className="flex-1 overflow-y-auto p-4">
          {scenarios.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Play className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No test scenarios yet.</p>
              <button
                onClick={() => setShowEditor(true)}
                className="mt-2 text-blue-600 hover:text-blue-800"
              >
                Create your first scenario
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {scenarios.map((scenario) => (
                <div key={scenario.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Scenario Header */}
                  <div className="p-3 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{scenario.name}</h4>
                        {scenario.description && (
                          <p className="text-sm text-gray-600 truncate">{scenario.description}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => runScenario(scenario.id)}
                          disabled={scenario.isRunning || isTesting}
                          className="p-1 text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                          title="Run Scenario"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingScenario(scenario);
                            setShowEditor(true);
                          }}
                          className="p-1 text-gray-600 hover:text-gray-800"
                          title="Edit Scenario"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteScenario(scenario.id)}
                          className="p-1 text-red-600 hover:text-red-800"
                          title="Delete Scenario"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Scenario Content */}
                  <div className="p-3">
                    {/* Input Preview */}
                    <div className="mb-3">
                      <div className="text-xs font-medium text-gray-700 mb-1">Input:</div>
                      <pre className="bg-gray-100 rounded p-2 text-xs font-mono overflow-x-auto">
                        {JSON.stringify(scenario.input, null, 2)}
                      </pre>
                    </div>

                    {/* Test Result */}
                    {scenario.result && (
                      <TestResultDisplay
                        result={scenario.result}
                        isExpanded={expandedResults.has(scenario.id)}
                        onToggleExpanded={() => toggleResultExpanded(scenario.id)}
                      />
                    )}

                    {/* Running Indicator */}
                    {scenario.isRunning && (
                      <div className="flex items-center justify-center py-4 text-blue-600">
                        <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2" />
                        Running test...
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Test Summary */}
        {scenarios.some(s => s.result) && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="text-sm">
              <div className="font-medium text-gray-900 mb-2">Test Summary</div>
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div className="text-center">
                  <div className="font-medium text-green-600">
                    {scenarios.filter(s => s.result?.status === 'success').length}
                  </div>
                  <div className="text-gray-600">Passed</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-red-600">
                    {scenarios.filter(s => s.result?.status === 'error').length}
                  </div>
                  <div className="text-gray-600">Failed</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-gray-600">
                    {scenarios.filter(s => s.result).length} / {scenarios.length}
                  </div>
                  <div className="text-gray-600">Total</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={importScenarios}
        className="hidden"
      />

      {/* Scenario Editor Modal */}
      {showEditor && (
        <TestScenarioEditor
          scenario={editingScenario}
          onSave={editingScenario ? updateScenario : addScenario}
          onClose={() => {
            setShowEditor(false);
            setEditingScenario(null);
          }}
        />
      )}
    </>
  );
};