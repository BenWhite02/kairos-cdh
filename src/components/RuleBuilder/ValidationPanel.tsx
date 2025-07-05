// src/components/RuleBuilder/ValidationPanel.tsx
// Real-time validation feedback panel with detailed error reporting and suggestions
// Provides comprehensive analysis of rule structure and configuration issues

import React, { useState } from 'react';
import { ValidationResult } from '../../types/RuleTypes';
import { 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw, 
  Lightbulb,
  ChevronDown,
  ChevronRight,
  Target,
  Zap,
  Info
} from 'lucide-react';

interface ValidationPanelProps {
  validation: ValidationResult | null;
  isValidating: boolean;
  onRevalidate: () => void;
}

interface ValidationItemProps {
  type: 'error' | 'warning' | 'suggestion';
  message: string;
  severity?: 'high' | 'medium' | 'low';
  atomId?: string;
  fixable?: boolean;
  onFix?: () => void;
}

const ValidationItem: React.FC<ValidationItemProps> = ({
  type,
  message,
  severity = 'medium',
  atomId,
  fixable = false,
  onFix
}) => {
  const getIcon = () => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'suggestion':
        return <Lightbulb className="w-4 h-4 text-blue-500" />;
    }
  };

  const getColorClasses = () => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'suggestion':
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getSeverityBadge = () => {
    if (type !== 'error' && type !== 'warning') return null;
    
    const severityColors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${severityColors[severity]}`}>
        {severity}
      </span>
    );
  };

  return (
    <div className={`p-3 border rounded-lg ${getColorClasses()}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-medium">{message}</p>
            {getSeverityBadge()}
          </div>
          
          {atomId && (
            <p className="text-xs opacity-75 mb-2">
              Related to: <code className="bg-black bg-opacity-10 px-1 rounded">{atomId}</code>
            </p>
          )}
          
          {fixable && onFix && (
            <button
              onClick={onFix}
              className="text-xs bg-white bg-opacity-50 hover:bg-opacity-75 px-2 py-1 rounded transition-colors"
            >
              Auto-fix
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const ValidationSection: React.FC<{
  title: string;
  items: string[];
  type: 'error' | 'warning' | 'suggestion';
  icon: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ title, items, type, icon, isExpanded, onToggle }) => {
  if (items.length === 0) return null;

  return (
    <div className="mb-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <div className="flex items-center space-x-2">
          {icon}
          <span className="font-medium text-gray-900">{title}</span>
          <span className="text-sm text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
            {items.length}
          </span>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-500" />
        )}
      </button>
      
      {isExpanded && (
        <div className="mt-2 space-y-2">
          {items.map((item, index) => (
            <ValidationItem
              key={index}
              type={type}
              message={item}
              severity={type === 'error' ? 'high' : 'medium'}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ValidationSummary: React.FC<{ validation: ValidationResult }> = ({ validation }) => {
  const totalIssues = validation.errors.length + validation.warnings.length;
  
  if (validation.isValid) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <div className="flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <div>
            <h3 className="font-medium text-green-900">Rule is Valid!</h3>
            <p className="text-sm text-green-700">
              Your rule passes all validation checks and is ready to use.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <div className="flex items-center space-x-2 mb-2">
        <AlertTriangle className="w-5 h-5 text-red-500" />
        <h3 className="font-medium text-red-900">Validation Issues Found</h3>
      </div>
      <div className="text-sm text-red-700">
        <p className="mb-2">Your rule has {totalIssues} issue{totalIssues !== 1 ? 's' : ''} that need attention:</p>
        <ul className="space-y-1">
          {validation.errors.length > 0 && (
            <li>• <strong>{validation.errors.length}</strong> error{validation.errors.length !== 1 ? 's' : ''} (must fix)</li>
          )}
          {validation.warnings.length > 0 && (
            <li>• <strong>{validation.warnings.length}</strong> warning{validation.warnings.length !== 1 ? 's' : ''} (recommended)</li>
          )}
        </ul>
      </div>
    </div>
  );
};

const QuickActions: React.FC<{
  validation: ValidationResult;
  onRevalidate: () => void;
}> = ({ validation, onRevalidate }) => {
  const [showQuickFixes, setShowQuickFixes] = useState(false);

  const getQuickFixes = () => {
    const fixes = [];
    
    // Common quick fixes based on validation results
    if (validation.errors.some(e => e.includes('parameter'))) {
      fixes.push({
        title: 'Configure Missing Parameters',
        description: 'Automatically open parameter configuration for atoms with missing required parameters',
        action: () => console.log('Configure parameters')
      });
    }
    
    if (validation.errors.some(e => e.includes('connection'))) {
      fixes.push({
        title: 'Fix Broken Connections',
        description: 'Remove invalid connections between atoms',
        action: () => console.log('Fix connections')
      });
    }
    
    if (validation.warnings.some(w => w.includes('performance'))) {
      fixes.push({
        title: 'Optimize Performance',
        description: 'Reorder atoms for better execution performance',
        action: () => console.log('Optimize performance')
      });
    }

    return fixes;
  };

  const quickFixes = getQuickFixes();

  return (
    <div className="border-t border-gray-200 pt-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900">Quick Actions</h4>
        <button
          onClick={onRevalidate}
          className="flex items-center space-x-1 px-2 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Re-validate</span>
        </button>
      </div>

      {quickFixes.length > 0 && (
        <div className="mb-3">
          <button
            onClick={() => setShowQuickFixes(!showQuickFixes)}
            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <Zap className="w-4 h-4" />
            <span>Quick Fixes ({quickFixes.length})</span>
            {showQuickFixes ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </button>

          {showQuickFixes && (
            <div className="mt-2 space-y-2">
              {quickFixes.map((fix, index) => (
                <div key={index} className="bg-gray-50 p-2 rounded">
                  <button
                    onClick={fix.action}
                    className="w-full text-left"
                  >
                    <div className="font-medium text-sm text-gray-900">{fix.title}</div>
                    <div className="text-xs text-gray-600">{fix.description}</div>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 text-xs">
        <button className="flex items-center justify-center space-x-1 py-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors">
          <Target className="w-3 h-3" />
          <span>Focus Issues</span>
        </button>
        <button className="flex items-center justify-center space-x-1 py-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors">
          <Info className="w-3 h-3" />
          <span>Rule Info</span>
        </button>
      </div>
    </div>
  );
};

export const ValidationPanel: React.FC<ValidationPanelProps> = ({
  validation,
  isValidating,
  onRevalidate
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['errors', 'warnings'])
  );

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900">Validation</h3>
          {isValidating && (
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
              <span className="text-sm text-blue-600">Validating...</span>
            </div>
          )}
        </div>
        
        {validation && <ValidationSummary validation={validation} />}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {!validation ? (
          <div className="text-center py-8 text-gray-500">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Add atoms to your rule to see validation results.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Errors */}
            <ValidationSection
              title="Errors"
              items={validation.errors}
              type="error"
              icon={<AlertTriangle className="w-4 h-4 text-red-500" />}
              isExpanded={expandedSections.has('errors')}
              onToggle={() => toggleSection('errors')}
            />

            {/* Warnings */}
            <ValidationSection
              title="Warnings"
              items={validation.warnings}
              type="warning"
              icon={<AlertCircle className="w-4 h-4 text-yellow-500" />}
              isExpanded={expandedSections.has('warnings')}
              onToggle={() => toggleSection('warnings')}
            />

            {/* Suggestions */}
            <ValidationSection
              title="Suggestions"
              items={validation.suggestions}
              type="suggestion"
              icon={<Lightbulb className="w-4 h-4 text-blue-500" />}
              isExpanded={expandedSections.has('suggestions')}
              onToggle={() => toggleSection('suggestions')}
            />

            {/* Empty state for valid rules */}
            {validation.isValid && validation.suggestions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p className="font-medium text-green-700">Perfect!</p>
                <p className="text-sm">Your rule has no issues.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {validation && (
        <div className="p-4">
          <QuickActions validation={validation} onRevalidate={onRevalidate} />
        </div>
      )}

      {/* Help Text */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-600">
          <p className="mb-1">
            <strong>💡 Validation Tips:</strong>
          </p>
          <ul className="space-y-1 text-xs">
            <li>• Red errors must be fixed before saving</li>
            <li>• Yellow warnings are recommended fixes</li>
            <li>• Blue suggestions can improve performance</li>
          </ul>
        </div>
      </div>
    </div>
  );
};