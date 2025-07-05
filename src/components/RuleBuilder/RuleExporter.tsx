// src/components/RuleBuilder/RuleExporter.tsx
// Export functionality for rules in various formats
// Supports JSON, YAML, and visual documentation formats

import React, { useState } from 'react';
import { Rule } from '../../types/RuleTypes';
import { Download, Copy, FileText, Code, Image, Check, X } from 'lucide-react';

interface RuleExporterProps {
  rule: Rule;
  onClose: () => void;
}

type ExportFormat = 'json' | 'yaml' | 'markdown' | 'pdf' | 'png';

export const RuleExporter: React.FC<RuleExporterProps> = ({ rule, onClose }) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('json');
  const [copied, setCopied] = useState(false);
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [prettyFormat, setPrettyFormat] = useState(true);

  const exportFormats = [
    {
      id: 'json' as ExportFormat,
      name: 'JSON',
      description: 'Machine-readable JSON format',
      icon: <Code className="w-4 h-4" />,
      extension: '.json',
      mimeType: 'application/json'
    },
    {
      id: 'yaml' as ExportFormat,
      name: 'YAML',
      description: 'Human-readable YAML format',
      icon: <FileText className="w-4 h-4" />,
      extension: '.yaml',
      mimeType: 'text/yaml'
    },
    {
      id: 'markdown' as ExportFormat,
      name: 'Markdown',
      description: 'Documentation format',
      icon: <FileText className="w-4 h-4" />,
      extension: '.md',
      mimeType: 'text/markdown'
    },
    {
      id: 'pdf' as ExportFormat,
      name: 'PDF',
      description: 'Printable document',
      icon: <FileText className="w-4 h-4" />,
      extension: '.pdf',
      mimeType: 'application/pdf'
    },
    {
      id: 'png' as ExportFormat,
      name: 'PNG',
      description: 'Visual diagram',
      icon: <Image className="w-4 h-4" />,
      extension: '.png',
      mimeType: 'image/png'
    }
  ];

  const generateContent = (format: ExportFormat): string => {
    const cleanRule = includeMetadata ? rule : {
      ...rule,
      metadata: undefined
    };

    switch (format) {
      case 'json':
        return JSON.stringify(cleanRule, null, prettyFormat ? 2 : 0);
      
      case 'yaml':
        return convertToYAML(cleanRule);
      
      case 'markdown':
        return generateMarkdown(rule);
      
      default:
        return JSON.stringify(cleanRule, null, 2);
    }
  };

  const convertToYAML = (obj: any, indent: number = 0): string => {
    const spaces = '  '.repeat(indent);
    let yaml = '';

    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) {
        yaml += `${spaces}${key}: null\n`;
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        yaml += `${spaces}${key}:\n${convertToYAML(value, indent + 1)}`;
      } else if (Array.isArray(value)) {
        yaml += `${spaces}${key}:\n`;
        value.forEach(item => {
          if (typeof item === 'object') {
            yaml += `${spaces}  -\n${convertToYAML(item, indent + 2)}`;
          } else {
            yaml += `${spaces}  - ${item}\n`;
          }
        });
      } else {
        yaml += `${spaces}${key}: ${JSON.stringify(value)}\n`;
      }
    }

    return yaml;
  };

  const generateMarkdown = (rule: Rule): string => {
    let md = `# Rule: ${rule.name}\n\n`;
    
    if (rule.description) {
      md += `${rule.description}\n\n`;
    }

    md += `## Metadata\n\n`;
    md += `- **Version:** ${rule.metadata.version}\n`;
    md += `- **Created:** ${new Date(rule.metadata.created).toLocaleString()}\n`;
    md += `- **Modified:** ${new Date(rule.metadata.modified).toLocaleString()}\n`;
    
    if (rule.metadata.tags.length > 0) {
      md += `- **Tags:** ${rule.metadata.tags.join(', ')}\n`;
    }

    if (rule.metadata.author) {
      md += `- **Author:** ${rule.metadata.author}\n`;
    }

    md += `\n## Rule Structure\n\n`;
    
    if (rule.rootAtom) {
      md += generateAtomMarkdown(rule.rootAtom, 0);
    } else {
      md += `*No atoms defined*\n`;
    }

    return md;
  };

  const generateAtomMarkdown = (atom: any, depth: number): string => {
    const indent = '  '.repeat(depth);
    let md = `${indent}- **${atom.type}**`;
    
    if (atom.label) {
      md += ` (${atom.label})`;
    }
    
    md += '\n';

    if (Object.keys(atom.parameters).length > 0) {
      md += `${indent}  - Parameters:\n`;
      Object.entries(atom.parameters).forEach(([key, value]) => {
        md += `${indent}    - ${key}: ${JSON.stringify(value)}\n`;
      });
    }

    if (atom.children && atom.children.length > 0) {
      md += `${indent}  - Children:\n`;
      atom.children.forEach((child: any) => {
        md += generateAtomMarkdown(child, depth + 2);
      });
    }

    return md;
  };

  const handleCopy = async () => {
    const content = generateContent(selectedFormat);
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleDownload = () => {
    const format = exportFormats.find(f => f.id === selectedFormat)!;
    const content = generateContent(selectedFormat);
    const blob = new Blob([content], { type: format.mimeType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${rule.name.replace(/\s+/g, '_')}${format.extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const selectedFormatInfo = exportFormats.find(f => f.id === selectedFormat)!;
  const content = generateContent(selectedFormat);

  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Export Rule</h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Format Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Export Format
          </label>
          <div className="grid grid-cols-1 gap-2">
            {exportFormats.map((format) => (
              <button
                key={format.id}
                onClick={() => setSelectedFormat(format.id)}
                className={`
                  flex items-center space-x-3 p-3 border rounded-lg text-left transition-colors
                  ${selectedFormat === format.id
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                {format.icon}
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{format.name}</div>
                  <div className="text-sm opacity-75">{format.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="mt-4 space-y-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={includeMetadata}
              onChange={(e) => setIncludeMetadata(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Include metadata</span>
          </label>

          {(selectedFormat === 'json') && (
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={prettyFormat}
                onChange={(e) => setPrettyFormat(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Pretty format</span>
            </label>
          )}
        </div>
      </div>

      {/* Preview */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Preview</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopy}
                className="flex items-center space-x-1 px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <pre className="text-sm bg-gray-100 rounded p-3 overflow-auto font-mono">
            {content}
          </pre>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-3">
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Download className="w-4 h-4" />
            <span>Download {selectedFormatInfo.name}</span>
          </button>
        </div>

        <div className="mt-3 text-xs text-gray-500">
          File will be saved as: {rule.name.replace(/\s+/g, '_')}{selectedFormatInfo.extension}
        </div>
      </div>
    </div>
  );
};