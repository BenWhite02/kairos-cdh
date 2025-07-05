// src/components/RuleBuilder/AtomPalette.tsx
// Searchable palette of available atoms organized by categories
// Provides drag sources for building rules with visual previews

import React, { useState, useMemo } from 'react';
import { useDrag } from 'react-dnd';
import { Search, Filter, ChevronDown, ChevronRight, Info } from 'lucide-react';
import { AtomDefinition, AtomCategory } from '../../types/RuleTypes';
import { getAtomDefinitions } from '../../services/AtomRegistry';

// Draggable atom item component
const AtomItem: React.FC<{ 
  atom: AtomDefinition;
  onInfo: (atom: AtomDefinition) => void;
}> = ({ atom, onInfo }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'atom',
    item: { atomType: atom.type, definition: atom },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const getCategoryColor = (category: AtomCategory) => {
    const colors = {
      'condition': 'bg-blue-100 text-blue-800 border-blue-200',
      'action': 'bg-green-100 text-green-800 border-green-200',
      'computation': 'bg-purple-100 text-purple-800 border-purple-200',
      'flow': 'bg-orange-100 text-orange-800 border-orange-200',
      'data': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getComplexityColor = (complexity: number) => {
    if (complexity <= 3) return 'text-green-600';
    if (complexity <= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div
      ref={drag}
      className={`
        group relative p-3 bg-white border border-gray-200 rounded-lg cursor-grab
        hover:shadow-md hover:border-gray-300 transition-all duration-200
        ${isDragging ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}
      `}
    >
      {/* Main Content */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="font-medium text-gray-900 truncate">{atom.name}</h4>
            <span className={`
              px-2 py-0.5 text-xs font-medium rounded-full border
              ${getCategoryColor(atom.category)}
            `}>
              {atom.category}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
            {atom.description}
          </p>

          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center space-x-1">
              <span>Complexity:</span>
              <span className={`font-medium ${getComplexityColor(atom.complexity)}`}>
                {atom.complexity}/10
              </span>
            </span>
            
            {atom.parameters?.length > 0 && (
              <span>{atom.parameters.length} params</span>
            )}
          </div>
        </div>

        {/* Info Button */}
        <button
          onClick={() => onInfo(atom)}
          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 transition-opacity"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* Drag Indicator */}
      <div className="absolute inset-0 border-2 border-dashed border-blue-400 rounded-lg opacity-0 group-hover:opacity-30 pointer-events-none" />
    </div>
  );
};

// Category section component
const CategorySection: React.FC<{
  category: AtomCategory;
  atoms: AtomDefinition[];
  isExpanded: boolean;
  onToggle: () => void;
  onAtomInfo: (atom: AtomDefinition) => void;
}> = ({ category, atoms, isExpanded, onToggle, onAtomInfo }) => {
  const getCategoryIcon = (cat: AtomCategory) => {
    const icons = {
      'condition': '🔍',
      'action': '⚡',
      'computation': '🧮',
      'flow': '🔄',
      'data': '📊',
    };
    return icons[cat] || '📦';
  };

  return (
    <div className="mb-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getCategoryIcon(category)}</span>
          <span className="font-medium text-gray-900 capitalize">{category}</span>
          <span className="text-sm text-gray-500">({atoms.length})</span>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-500" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-2 space-y-2">
          {atoms.map((atom) => (
            <AtomItem
              key={atom.type}
              atom={atom}
              onInfo={onAtomInfo}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Atom info modal
const AtomInfoModal: React.FC<{
  atom: AtomDefinition | null;
  onClose: () => void;
}> = ({ atom, onClose }) => {
  if (!atom) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{atom.name}</h2>
              <p className="text-gray-600">{atom.description}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {/* Parameters */}
          {atom.parameters && atom.parameters.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Parameters</h3>
              <div className="space-y-2">
                {atom.parameters.map((param, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded">
                    <div className="font-medium text-gray-900">{param.name}</div>
                    <div className="text-sm text-gray-600">{param.description}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Type: {param.type} {param.required && '(required)'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Usage Examples */}
          {atom.examples && atom.examples.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Examples</h3>
              <div className="space-y-2">
                {atom.examples.map((example, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded">
                    <div className="font-medium text-gray-900">{example.title}</div>
                    <div className="text-sm text-gray-600">{example.description}</div>
                    {example.configuration && (
                      <pre className="text-xs bg-gray-800 text-gray-100 p-2 rounded mt-2 overflow-x-auto">
                        {JSON.stringify(example.configuration, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-900">Category:</span>
                <span className="ml-2 text-gray-600 capitalize">{atom.category}</span>
              </div>
              <div>
                <span className="font-medium text-gray-900">Complexity:</span>
                <span className="ml-2 text-gray-600">{atom.complexity}/10</span>
              </div>
              {atom.tags && atom.tags.length > 0 && (
                <div className="col-span-2">
                  <span className="font-medium text-gray-900">Tags:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {atom.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main atom palette component
export const AtomPalette: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AtomCategory | 'all'>('all');
  const [expandedCategories, setExpandedCategories] = useState<Set<AtomCategory>>(
    new Set(['condition', 'action'])
  );
  const [selectedAtom, setSelectedAtom] = useState<AtomDefinition | null>(null);

  const atoms = useMemo(() => getAtomDefinitions(), []);

  // Filter atoms based on search and category
  const filteredAtoms = useMemo(() => {
    return atoms.filter((atom) => {
      const matchesSearch = searchTerm === '' || 
        atom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        atom.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        atom.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || atom.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [atoms, searchTerm, selectedCategory]);

  // Group atoms by category
  const atomsByCategory = useMemo(() => {
    const grouped: Record<AtomCategory, AtomDefinition[]> = {
      condition: [],
      action: [],
      computation: [],
      flow: [],
      data: []
    };

    filteredAtoms.forEach(atom => {
      grouped[atom.category].push(atom);
    });

    return grouped;
  }, [filteredAtoms]);

  const toggleCategory = (category: AtomCategory) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const categories: AtomCategory[] = ['condition', 'action', 'computation', 'flow', 'data'];

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Atom Palette</h2>
          
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search atoms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as AtomCategory | 'all')}
              className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category} className="capitalize">
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Atom List */}
        <div className="flex-1 overflow-y-auto p-4">
          {categories.map(category => {
            const categoryAtoms = atomsByCategory[category];
            if (categoryAtoms.length === 0) return null;

            return (
              <CategorySection
                key={category}
                category={category}
                atoms={categoryAtoms}
                isExpanded={expandedCategories.has(category)}
                onToggle={() => toggleCategory(category)}
                onAtomInfo={setSelectedAtom}
              />
            );
          })}

          {filteredAtoms.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No atoms found matching your search.</p>
            </div>
          )}
        </div>

        {/* Usage Hint */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600">
            💡 <strong>Tip:</strong> Drag atoms to the canvas to build your rule. 
            Click the info icon for detailed documentation.
          </p>
        </div>
      </div>

      {/* Atom Info Modal */}
      <AtomInfoModal
        atom={selectedAtom}
        onClose={() => setSelectedAtom(null)}
      />
    </>
  );
};