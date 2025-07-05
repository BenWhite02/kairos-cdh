// src/components/RuleBuilder/ZoomControls.tsx
// Zoom and pan controls for the rule canvas
// Provides intuitive navigation controls for large rule trees

import React from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Maximize, Move, MousePointer } from 'lucide-react';

interface ZoomControlsProps {
  zoom: number;
  onZoom: (zoom: number) => void;
  onPan: (deltaX: number, deltaY: number) => void;
  onReset: () => void;
  onFitToContent?: () => void;
  canFitToContent?: boolean;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  zoom,
  onZoom,
  onPan,
  onReset,
  onFitToContent,
  canFitToContent = false
}) => {
  const zoomIn = () => onZoom(Math.min(zoom + 0.1, 3));
  const zoomOut = () => onZoom(Math.max(zoom - 0.1, 0.1));
  
  const handleKeyboardShortcuts = React.useCallback((event: KeyboardEvent) => {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case '=':
        case '+':
          event.preventDefault();
          zoomIn();
          break;
        case '-':
          event.preventDefault();
          zoomOut();
          break;
        case '0':
          event.preventDefault();
          onReset();
          break;
      }
    }
  }, [zoom, onZoom, onReset]);

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyboardShortcuts);
    return () => document.removeEventListener('keydown', handleKeyboardShortcuts);
  }, [handleKeyboardShortcuts]);

  const formatZoom = (value: number) => `${Math.round(value * 100)}%`;

  return (
    <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
      {/* Main zoom controls */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        {/* Zoom level display */}
        <div className="px-3 py-2 border-b border-gray-200 text-center">
          <span className="text-xs font-medium text-gray-700">
            {formatZoom(zoom)}
          </span>
        </div>

        {/* Zoom buttons */}
        <div className="flex flex-col">
          <button
            onClick={zoomIn}
            disabled={zoom >= 3}
            className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed border-b border-gray-200"
            title="Zoom In (Ctrl/Cmd + +)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            onClick={zoomOut}
            disabled={zoom <= 0.1}
            className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed border-b border-gray-200"
            title="Zoom Out (Ctrl/Cmd + -)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <button
            onClick={onReset}
            className="p-2 hover:bg-gray-100 border-b border-gray-200"
            title="Reset View (Ctrl/Cmd + 0)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {canFitToContent && onFitToContent && (
            <button
              onClick={onFitToContent}
              className="p-2 hover:bg-gray-100"
              title="Fit to Content"
            >
              <Maximize className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Pan controls */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2">
        <div className="grid grid-cols-3 gap-1">
          {/* Top row */}
          <div />
          <button
            onClick={() => onPan(0, 50)}
            className="p-1 hover:bg-gray-100 rounded text-gray-600"
            title="Pan Up"
          >
            ↑
          </button>
          <div />

          {/* Middle row */}
          <button
            onClick={() => onPan(50, 0)}
            className="p-1 hover:bg-gray-100 rounded text-gray-600"
            title="Pan Left"
          >
            ←
          </button>
          <div className="p-1 flex items-center justify-center">
            <Move className="w-3 h-3 text-gray-400" />
          </div>
          <button
            onClick={() => onPan(-50, 0)}
            className="p-1 hover:bg-gray-100 rounded text-gray-600"
            title="Pan Right"
          >
            →
          </button>

          {/* Bottom row */}
          <div />
          <button
            onClick={() => onPan(0, -50)}
            className="p-1 hover:bg-gray-100 rounded text-gray-600"
            title="Pan Down"
          >
            ↓
          </button>
          <div />
        </div>
      </div>

      {/* Help text */}
      <div className="bg-gray-900 text-white text-xs p-2 rounded shadow-lg max-w-xs">
        <div className="font-medium mb-1">Navigation:</div>
        <div>• Scroll to zoom</div>
        <div>• Drag to pan</div>
        <div>• Ctrl/Cmd + 0 to reset</div>
      </div>
    </div>
  );
};

// Minimap component for large canvases
export const Minimap: React.FC<{
  zoom: number;
  panX: number;
  panY: number;
  contentBounds: { width: number; height: number };
  viewportBounds: { width: number; height: number };
  onNavigate: (x: number, y: number) => void;
}> = ({ zoom, panX, panY, contentBounds, viewportBounds, onNavigate }) => {
  const minimapScale = 0.1;
  const minimapWidth = Math.max(200, contentBounds.width * minimapScale);
  const minimapHeight = Math.max(150, contentBounds.height * minimapScale);

  const viewportRect = {
    x: (-panX / zoom) * minimapScale,
    y: (-panY / zoom) * minimapScale,
    width: (viewportBounds.width / zoom) * minimapScale,
    height: (viewportBounds.height / zoom) * minimapScale
  };

  const handleMinimapClick = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / minimapScale;
    const y = (event.clientY - rect.top) / minimapScale;
    
    onNavigate(-x * zoom, -y * zoom);
  };

  return (
    <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-2">
      <div className="text-xs font-medium text-gray-700 mb-2">Minimap</div>
      <div
        className="relative bg-gray-100 rounded cursor-pointer"
        style={{ width: minimapWidth, height: minimapHeight }}
        onClick={handleMinimapClick}
      >
        {/* Content area */}
        <div
          className="absolute bg-blue-100 rounded"
          style={{
            width: contentBounds.width * minimapScale,
            height: contentBounds.height * minimapScale
          }}
        />

        {/* Viewport indicator */}
        <div
          className="absolute border-2 border-blue-500 bg-blue-200 bg-opacity-30 rounded"
          style={{
            left: viewportRect.x,
            top: viewportRect.y,
            width: viewportRect.width,
            height: viewportRect.height
          }}
        />
      </div>
    </div>
  );
};