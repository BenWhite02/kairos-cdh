// src/components/RuleBuilder/AtomNode.tsx
// Individual atom visualization component with parameter editing and visual states
// Handles selection, editing, validation feedback, and connection points

import React, { useState, useRef, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { AtomInstance, AtomDefinition, ParameterValue } from '../../types/RuleTypes';
import { getAtomDefinition } from '../../services/AtomRegistry';
import { 
  Settings, 
  Trash2, 
  Copy, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle,
  Edit3,
  Link,
  MoreVertical
} from 'lucide-react';

interface AtomNodeProps {
  atom: AtomInstance;
  isSelected: boolean;
  hasErrors?: boolean;
  hasWarnings?: boolean;
  onSelect: (atomId: string) => void;
  onUpdate: (atomId: string, updates: Partial<AtomInstance>) => void;
  onDelete: (atomId: string) => void;
  zoom: number;
}

interface ParameterEditModalProps {
  atom: AtomInstance;
  definition: AtomDefinition;
  onSave: (parameters: Record<string, ParameterValue>) => void;
  onClose: () => void;
}

// Parameter editing modal
const ParameterEditModal: React.FC<ParameterEditModalProps> = ({
  atom,
  definition,
  onSave,
  onClose
}) => {
  const [parameters, setParameters] = useState(atom.parameters);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateParameter = (param: any, value: ParameterValue): string | null => {
    if (param.required && (value === undefined || value === null || value === '')) {
      return 'This parameter is required';
    }

    if (value !== undefined && value !== null && value !== '') {
      switch (param.type) {
        case 'number':
          if (isNaN(Number(value))) return 'Must be a valid number';
          if (param.min !== undefined && Number(value) < param.min) return `Must be at least ${param.min}`;
          if (param.max !== undefined && Number(value) > param.max) return `Must be at most ${param.max}`;
          break;
        case 'string':
          if (param.minLength && String(value).length < param.minLength) {
            return `Must be at least ${param.minLength} characters`;
          }
          if (param.maxLength && String(value).length > param.maxLength) {
            return `Must be at most ${param.maxLength} characters`;
          }
          break;
        case 'array':
          if (!Array.isArray(value)) return 'Must be an array';
          break;
      }
    }

    return null;
  };

  const handleParameterChange = (paramName: string, value: ParameterValue) => {
    setParameters(prev => ({ ...prev, [paramName]: value }));
    
    // Validate
    const param = definition.parameters?.find(p => p.name === paramName);
    if (param) {
      const error = validateParameter(param, value);
      setErrors(prev => ({ ...prev, [paramName]: error || '' }));
    }
  };

  const handleSave = () => {
    // Validate all parameters
    const newErrors: Record<string, string> = {};
    definition.parameters?.forEach(param => {
      const error = validateParameter(param, parameters[param.name]);
      if (error) newErrors[param.name] = error;
    });

    if (Object.keys(newErrors).length === 0) {
      onSave(parameters);
      onClose();
    } else {
      setErrors(newErrors);
    }
  };

  const renderParameterInput = (param: any) => {
    const value = parameters[param.name];
    const error = errors[param.name];

    switch (param.type) {
      case 'string':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleParameterChange(param.name, e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${
              error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
            }`}
            placeholder={param.placeholder || `Enter ${param.name}...`}
          />
        );
      
      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => handleParameterChange(param.name, parseFloat(e.target.value) || '')}
            min={param.min}
            max={param.max}
            step={param.step || 1}
            className={`w-full px-3 py-2 border rounded-md ${
              error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
            }`}
            placeholder={param.placeholder || `Enter ${param.name}...`}
          />
        );
      
      case 'boolean':
        return (
          <select
            value={value?.toString() || 'false'}
            onChange={(e) => handleParameterChange(param.name, e.target.value === 'true')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500"
          >
            <option value="false">False</option>
            <option value="true">True</option>
          </select>
        );
      
      case 'select':
        return (
          <select
            value={value?.toString() || ''}
            onChange={(e) => handleParameterChange(param.name, e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${
              error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
            }`}
          >
            <option value="">Select {param.name}...</option>
            {param.options?.map((option: any) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'array':
        return (
          <textarea
            value={Array.isArray(value) ? value.join('\n') : ''}
            onChange={(e) => handleParameterChange(param.name, e.target.value.split('\n').filter(Boolean))}
            rows={3}
            className={`w-full px-3 py-2 border rounded-md ${
              error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
            }`}
            placeholder="One item per line..."
          />
        );
      
      default:
        return (
          <input
            type="text"
            value={value?.toString() || ''}
            onChange={(e) => handleParameterChange(param.name, e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${
              error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
            }`}
            placeholder={param.placeholder || `Enter ${param.name}...`}
          />
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Configure {definition.name}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            {definition.parameters?.map(param => (
              <div key={param.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {param.name}
                  {param.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <div className="mb-1">
                  {renderParameterInput(param)}
                </div>
                {param.description && (
                  <p className="text-xs text-gray-500">{param.description}</p>
                )}
                {errors[param.name] && (
                  <p className="text-xs text-red-600 mt-1">{errors[param.name]}</p>
                )}
              </div>
            ))}
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
              Save Parameters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main atom node component
export const AtomNode: React.FC<AtomNodeProps> = ({
  atom,
  isSelected,
  hasErrors,
  hasWarnings,
  onSelect,
  onUpdate,
  onDelete,
  zoom
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showParameters, setShowParameters] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(atom.label || '');
  
  const nodeRef = useRef<HTMLDivElement>(null);
  const definition = getAtomDefinition(atom.type);

  // Drag functionality
  const [{ isDragging }, drag] = useDrag({
    type: 'atom-instance',
    item: { atomId: atom.id, atom },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  useEffect(() => {
    if (nodeRef.current) {
      drag(nodeRef.current);
    }
  }, [drag]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (nodeRef.current && !nodeRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getCategoryColor = (category: string) => {
    const colors = {
      'condition': 'bg-blue-500',
      'action': 'bg-green-500',
      'computation': 'bg-purple-500',
      'flow': 'bg-orange-500',
      'data': 'bg-indigo-500',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-500';
  };

  const getStatusIcon = () => {
    if (hasErrors) return <AlertTriangle className="w-4 h-4 text-red-500" />;
    if (hasWarnings) return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  const handleLabelSave = () => {
    onUpdate(atom.id, { label });
    setIsEditing(false);
  };

  const handleParameterSave = (parameters: Record<string, ParameterValue>) => {
    onUpdate(atom.id, { parameters });
  };

  const handleDuplicate = () => {
    // Create a copy with new ID
    const copy = {
      ...atom,
      id: `${atom.id}_copy_${Date.now()}`,
      position: {
        x: atom.position.x + 20,
        y: atom.position.y + 20
      }
    };
    // This would need to be handled at the canvas level
    setShowMenu(false);
  };

  if (!definition) {
    return (
      <div className="p-3 bg-red-100 border border-red-300 rounded-lg">
        <div className="text-red-800 font-medium">Unknown Atom Type</div>
        <div className="text-red-600 text-sm">{atom.type}</div>
      </div>
    );
  }

  const hasParameters = definition.parameters && definition.parameters.length > 0;
  const parameterCount = Object.keys(atom.parameters).length;

  return (
    <>
      <div
        ref={nodeRef}
        className={`
          relative group cursor-pointer transition-all duration-200
          ${isDragging ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}
          ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
        `}
        style={{
          transform: `translate(${atom.position.x}px, ${atom.position.y}px)`,
          minWidth: Math.max(160, 160 / zoom),
        }}
        onClick={() => onSelect(atom.id)}
      >
        {/* Main Node */}
        <div className={`
          bg-white border-2 rounded-lg shadow-sm hover:shadow-md transition-shadow
          ${isSelected ? 'border-blue-500' : 'border-gray-300'}
          ${hasErrors ? 'border-red-500 bg-red-50' : ''}
          ${hasWarnings ? 'border-yellow-500 bg-yellow-50' : ''}
        `}>
          {/* Header */}
          <div className={`
            flex items-center justify-between p-3 rounded-t-lg
            ${getCategoryColor(definition.category)} text-white
          `}>
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <div className="w-2 h-2 bg-white rounded-full opacity-80" />
              <span className="font-medium text-sm truncate">{definition.name}</span>
            </div>
            <div className="flex items-center space-x-1">
              {getStatusIcon()}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-3">
            {/* Label/Description */}
            <div className="mb-2">
              {isEditing ? (
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  onBlur={handleLabelSave}
                  onKeyPress={(e) => e.key === 'Enter' && handleLabelSave()}
                  className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                  placeholder="Add label..."
                  autoFocus
                />
              ) : (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                  className="text-sm text-gray-700 cursor-text hover:bg-gray-100 px-2 py-1 rounded min-h-[24px] flex items-center"
                >
                  {atom.label || (
                    <span className="text-gray-400 italic">Click to add label...</span>
                  )}
                  <Edit3 className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-50" />
                </div>
              )}
            </div>

            {/* Parameters Summary */}
            {hasParameters && (
              <div className="text-xs text-gray-500 mb-2">
                {parameterCount > 0 ? (
                  <span className="text-green-600">
                    {parameterCount}/{definition.parameters?.length} parameters configured
                  </span>
                ) : (
                  <span className="text-orange-600">Parameters need configuration</span>
                )}
              </div>
            )}

            {/* Connection Points */}
            <div className="flex justify-between items-center text-xs text-gray-400">
              <div className="flex items-center space-x-1">
                <Link className="w-3 h-3" />
                <span>In</span>
              </div>
              {atom.children.length > 0 && (
                <div className="flex items-center space-x-1">
                  <span>{atom.children.length} children</span>
                  <Link className="w-3 h-3" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Context Menu */}
        {showMenu && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[150px]">
            {hasParameters && (
              <button
                onClick={() => {
                  setShowParameters(true);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
              >
                <Settings className="w-4 h-4" />
                <span>Configure</span>
              </button>
            )}
            <button
              onClick={handleDuplicate}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
            >
              <Copy className="w-4 h-4" />
              <span>Duplicate</span>
            </button>
            <button
              onClick={() => {
                onDelete(atom.id);
                setShowMenu(false);
              }}
              className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        )}

        {/* Connection Points for Drag Targeting */}
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Parameter Configuration Modal */}
      {showParameters && definition && (
        <ParameterEditModal
          atom={atom}
          definition={definition}
          onSave={handleParameterSave}
          onClose={() => setShowParameters(false)}
        />
      )}
    </>
  );
};