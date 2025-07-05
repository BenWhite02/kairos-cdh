// src/components/RuleBuilder/RuleCanvas.tsx
// Interactive canvas for building rules with drag-and-drop visual tree interface
// Handles atom placement, connections, and real-time visual feedback

import React, { useState, useCallback, useRef, forwardRef } from 'react';
import { useDrop } from 'react-dnd';
import { Atom, Rule, ValidationResult, AtomInstance } from '../../types/RuleTypes';
import { AtomNode } from './AtomNode';
import { ConnectionLine } from './ConnectionLine';
import { CanvasGrid } from './CanvasGrid';
import { ZoomControls } from './ZoomControls';
import { Plus, Zap, AlertTriangle, CheckCircle } from 'lucide-react';

interface RuleCanvasProps {
  rule: Rule;
  onRuleUpdate: (updates: Partial<Rule>) => void;
  validation?: ValidationResult | null;
}

interface CanvasState {
  zoom: number;
  panX: number;
  panY: number;
  selectedAtom: string | null;
  isDragging: boolean;
  dragPosition: { x: number; y: number } | null;
}

export const RuleCanvas = forwardRef<HTMLDivElement, RuleCanvasProps>(({
  rule,
  onRuleUpdate,
  validation
}, ref) => {
  // Canvas state
  const [canvas, setCanvas] = useState<CanvasState>({
    zoom: 1,
    panX: 0,
    panY: 0,
    selectedAtom: null,
    isDragging: false,
    dragPosition: null
  });

  const canvasRef = useRef<HTMLDivElement>(null);
  const [nextAtomId, setNextAtomId] = useState(1);

  // Create new atom instance
  const createAtomInstance = useCallback((atomType: string, position: { x: number; y: number }): AtomInstance => {
    const id = `atom_${nextAtomId}`;
    setNextAtomId(prev => prev + 1);
    
    return {
      id,
      type: atomType,
      position,
      parameters: {},
      children: [],
      metadata: {
        created: new Date().toISOString(),
        modified: new Date().toISOString()
      }
    };
  }, [nextAtomId]);

  // Drop handler for new atoms
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'atom',
    drop: (item: { atomType: string }, monitor) => {
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset || !canvasRef.current) return;

      const canvasRect = canvasRef.current.getBoundingClientRect();
      const x = (clientOffset.x - canvasRect.left - canvas.panX) / canvas.zoom;
      const y = (clientOffset.y - canvasRect.top - canvas.panY) / canvas.zoom;

      const newAtom = createAtomInstance(item.atomType, { x, y });

      if (!rule.rootAtom) {
        // First atom becomes root
        onRuleUpdate({ rootAtom: newAtom });
      } else {
        // Add as child to selected atom or root
        const targetAtom = canvas.selectedAtom 
          ? findAtomById(rule.rootAtom, canvas.selectedAtom)
          : rule.rootAtom;
        
        if (targetAtom) {
          const updatedRoot = addChildAtom(rule.rootAtom, targetAtom.id, newAtom);
          onRuleUpdate({ rootAtom: updatedRoot });
        }
      }

      setCanvas(prev => ({ ...prev, selectedAtom: newAtom.id }));
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  // Helper functions for atom tree manipulation
  const findAtomById = (atom: AtomInstance | null, id: string): AtomInstance | null => {
    if (!atom) return null;
    if (atom.id === id) return atom;
    
    for (const child of atom.children) {
      const found = findAtomById(child, id);
      if (found) return found;
    }
    return null;
  };

  const addChildAtom = (root: AtomInstance | null, parentId: string, newAtom: AtomInstance): AtomInstance | null => {
    if (!root) return newAtom;
    
    if (root.id === parentId) {
      return {
        ...root,
        children: [...root.children, newAtom],
        metadata: { ...root.metadata, modified: new Date().toISOString() }
      };
    }

    return {
      ...root,
      children: root.children.map(child => addChildAtom(child, parentId, newAtom)).filter(Boolean) as AtomInstance[]
    };
  };

  const updateAtom = (root: AtomInstance | null, atomId: string, updates: Partial<AtomInstance>): AtomInstance | null => {
    if (!root) return null;
    
    if (root.id === atomId) {
      return {
        ...root,
        ...updates,
        metadata: { ...root.metadata, modified: new Date().toISOString() }
      };
    }

    return {
      ...root,
      children: root.children.map(child => updateAtom(child, atomId, updates)).filter(Boolean) as AtomInstance[]
    };
  };

  const removeAtom = (root: AtomInstance | null, atomId: string): AtomInstance | null => {
    if (!root) return null;
    if (root.id === atomId) return null;

    return {
      ...root,
      children: root.children
        .map(child => removeAtom(child, atomId))
        .filter(Boolean) as AtomInstance[]
    };
  };

  // Canvas interaction handlers
  const handleAtomSelect = useCallback((atomId: string) => {
    setCanvas(prev => ({ ...prev, selectedAtom: atomId }));
  }, []);

  const handleAtomUpdate = useCallback((atomId: string, updates: Partial<AtomInstance>) => {
    const updatedRoot = updateAtom(rule.rootAtom, atomId, updates);
    onRuleUpdate({ rootAtom: updatedRoot });
  }, [rule.rootAtom, onRuleUpdate]);

  const handleAtomDelete = useCallback((atomId: string) => {
    if (rule.rootAtom?.id === atomId) {
      onRuleUpdate({ rootAtom: null });
    } else {
      const updatedRoot = removeAtom(rule.rootAtom, atomId);
      onRuleUpdate({ rootAtom: updatedRoot });
    }
    setCanvas(prev => ({ ...prev, selectedAtom: null }));
  }, [rule.rootAtom, onRuleUpdate]);

  // Zoom and pan handlers
  const handleZoom = useCallback((newZoom: number) => {
    setCanvas(prev => ({ ...prev, zoom: Math.max(0.1, Math.min(3, newZoom)) }));
  }, []);

  const handlePan = useCallback((deltaX: number, deltaY: number) => {
    setCanvas(prev => ({
      ...prev,
      panX: prev.panX + deltaX,
      panY: prev.panY + deltaY
    }));
  }, []);

  // Render atom tree recursively
  const renderAtomTree = (atom: AtomInstance, depth: number = 0): React.ReactNode => {
    const isSelected = canvas.selectedAtom === atom.id;
    const hasValidationErrors = validation?.errors?.some(error => error.includes(atom.id));
    const hasValidationWarnings = validation?.warnings?.some(warning => warning.includes(atom.id));

    return (
      <React.Fragment key={atom.id}>
        {/* Connection line to parent */}
        {depth > 0 && <ConnectionLine />}
        
        {/* Atom node */}
        <AtomNode
          atom={atom}
          isSelected={isSelected}
          hasErrors={hasValidationErrors}
          hasWarnings={hasValidationWarnings}
          onSelect={handleAtomSelect}
          onUpdate={handleAtomUpdate}
          onDelete={handleAtomDelete}
          zoom={canvas.zoom}
        />

        {/* Render children */}
        {atom.children.map(child => renderAtomTree(child, depth + 1))}
      </React.Fragment>
    );
  };

  // Drop zone indicator
  const getDropZoneStyle = () => {
    if (!canDrop) return '';
    if (isOver) return 'bg-blue-100 border-blue-300';
    return 'bg-gray-50 border-gray-300';
  };

  return (
    <div className="relative flex-1 overflow-hidden bg-gray-50">
      {/* Canvas */}
      <div
        ref={(element) => {
          canvasRef.current = element;
          drop(element);
          if (ref) {
            if (typeof ref === 'function') {
              ref(element);
            } else {
              ref.current = element;
            }
          }
        }}
        className={`
          relative w-full h-full overflow-hidden cursor-grab
          ${getDropZoneStyle()}
          ${canvas.isDragging ? 'cursor-grabbing' : ''}
        `}
        style={{
          backgroundImage: `radial-gradient(circle, #e5e7eb 1px, transparent 1px)`,
          backgroundSize: `${20 * canvas.zoom}px ${20 * canvas.zoom}px`,
          backgroundPosition: `${canvas.panX}px ${canvas.panY}px`
        }}
      >
        {/* Grid */}
        <CanvasGrid zoom={canvas.zoom} panX={canvas.panX} panY={canvas.panY} />

        {/* Main content area */}
        <div
          className="absolute inset-0"
          style={{
            transform: `translate(${canvas.panX}px, ${canvas.panY}px) scale(${canvas.zoom})`,
            transformOrigin: '0 0'
          }}
        >
          {/* Rule tree */}
          {rule.rootAtom ? (
            <div className="p-8">
              {renderAtomTree(rule.rootAtom)}
            </div>
          ) : (
            /* Empty state */
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-8 bg-white rounded-lg border-2 border-dashed border-gray-300">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <Plus className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Start Building Your Rule</h3>
                <p className="text-gray-600 mb-4 max-w-sm">
                  Drag atoms from the palette to create your business rule logic.
                  Start with a condition or action atom.
                </p>
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Zap className="w-4 h-4" />
                    <span>Visual Builder</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4" />
                    <span>Real-time Validation</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drop zone overlay */}
        {isOver && canDrop && (
          <div className="absolute inset-0 bg-blue-200 bg-opacity-20 border-2 border-dashed border-blue-400 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <div className="flex items-center space-x-2 text-blue-600">
                <Plus className="w-5 h-5" />
                <span className="font-medium">Drop to add atom</span>
              </div>
            </div>
          </div>
        )}

        {/* Validation overlay */}
        {validation && !validation.isValid && (
          <div className="absolute top-4 right-4 bg-red-50 border border-red-200 rounded-lg p-3 max-w-sm">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-900">Validation Issues</h4>
                <ul className="text-sm text-red-700 mt-1 space-y-1">
                  {validation.errors.slice(0, 3).map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                  {validation.errors.length > 3 && (
                    <li className="text-red-500">... and {validation.errors.length - 3} more</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Zoom Controls */}
      <ZoomControls
        zoom={canvas.zoom}
        onZoom={handleZoom}
        onPan={handlePan}
        onReset={() => setCanvas(prev => ({ ...prev, zoom: 1, panX: 0, panY: 0 }))}
      />

      {/* Selection Info */}
      {canvas.selectedAtom && (
        <div className="absolute bottom-4 left-4 bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          <div className="text-sm">
            <span className="font-medium text-gray-900">Selected: </span>
            <span className="text-gray-600">{canvas.selectedAtom}</span>
          </div>
        </div>
      )}
    </div>
  );
});