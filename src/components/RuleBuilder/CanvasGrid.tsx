// src/components/RuleBuilder/CanvasGrid.tsx
// Background grid for the rule canvas providing visual alignment guides
// Responsive grid that scales with zoom and provides snap-to-grid functionality

import React from 'react';

interface CanvasGridProps {
  zoom: number;
  panX: number;
  panY: number;
  gridSize?: number;
  showGrid?: boolean;
  snapToGrid?: boolean;
}

export const CanvasGrid: React.FC<CanvasGridProps> = ({
  zoom,
  panX,
  panY,
  gridSize = 20,
  showGrid = true,
  snapToGrid = false
}) => {
  if (!showGrid) return null;

  const scaledGridSize = gridSize * zoom;
  const offsetX = panX % scaledGridSize;
  const offsetY = panY % scaledGridSize;

  // Calculate grid pattern
  const gridPattern = `
    radial-gradient(circle, #e5e7eb 1px, transparent 1px)
  `;

  const gridStyle = {
    backgroundImage: gridPattern,
    backgroundSize: `${scaledGridSize}px ${scaledGridSize}px`,
    backgroundPosition: `${offsetX}px ${offsetY}px`,
    opacity: Math.min(zoom, 1) * 0.5 // Fade grid at low zoom levels
  };

  // Major grid lines every 5 grid units
  const majorGridSize = scaledGridSize * 5;
  const majorOffsetX = panX % majorGridSize;
  const majorOffsetY = panY % majorGridSize;

  const majorGridPattern = `
    linear-gradient(to right, #d1d5db 1px, transparent 1px),
    linear-gradient(to bottom, #d1d5db 1px, transparent 1px)
  `;

  const majorGridStyle = {
    backgroundImage: majorGridPattern,
    backgroundSize: `${majorGridSize}px ${majorGridSize}px`,
    backgroundPosition: `${majorOffsetX}px ${majorOffsetY}px`,
    opacity: Math.min(zoom, 1) * 0.3
  };

  return (
    <>
      {/* Minor grid dots */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={gridStyle}
      />
      
      {/* Major grid lines */}
      {zoom > 0.5 && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={majorGridStyle}
        />
      )}
      
      {/* Origin indicator */}
      {zoom > 0.3 && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: panX,
            top: panY,
            width: '2px',
            height: '2px'
          }}
        >
          <div className="w-8 h-px bg-blue-400 opacity-60 -translate-x-4" />
          <div className="w-px h-8 bg-blue-400 opacity-60 -translate-y-4 translate-x-1" />
        </div>
      )}
      
      {/* Grid info overlay (for debugging) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white text-xs p-2 rounded pointer-events-none">
          <div>Zoom: {zoom.toFixed(2)}x</div>
          <div>Pan: {panX.toFixed(0)}, {panY.toFixed(0)}</div>
          <div>Grid: {scaledGridSize.toFixed(0)}px</div>
          {snapToGrid && <div>Snap: ON</div>}
        </div>
      )}
    </>
  );
};

// Utility function to snap coordinates to grid
export const snapToGrid = (x: number, y: number, gridSize: number = 20, zoom: number = 1): { x: number; y: number } => {
  const scaledGridSize = gridSize * zoom;
  return {
    x: Math.round(x / scaledGridSize) * scaledGridSize,
    y: Math.round(y / scaledGridSize) * scaledGridSize
  };
};

// Hook for grid snapping functionality
export const useGridSnap = (gridSize: number = 20, zoom: number = 1, enabled: boolean = false) => {
  const snap = React.useCallback((x: number, y: number) => {
    if (!enabled) return { x, y };
    return snapToGrid(x, y, gridSize, zoom);
  }, [gridSize, zoom, enabled]);

  return snap;
};