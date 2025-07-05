// src/components/RuleBuilder/ConnectionLine.tsx
// Visual connection lines between atoms in the rule tree
// Provides clear visual hierarchy and flow indication

import React from 'react';

interface ConnectionLineProps {
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
  type?: 'parent' | 'child' | 'sibling';
  isActive?: boolean;
}

export const ConnectionLine: React.FC<ConnectionLineProps> = ({
  startX = 0,
  startY = 0,
  endX = 0,
  endY = 20,
  type = 'child',
  isActive = false
}) => {
  const getLineStyle = () => {
    const baseStyle = {
      stroke: isActive ? '#3b82f6' : '#e5e7eb',
      strokeWidth: isActive ? 3 : 2,
      strokeDasharray: type === 'sibling' ? '5,5' : 'none'
    };

    switch (type) {
      case 'parent':
        return { ...baseStyle, stroke: isActive ? '#10b981' : '#d1d5db' };
      case 'child':
        return { ...baseStyle, stroke: isActive ? '#3b82f6' : '#e5e7eb' };
      case 'sibling':
        return { ...baseStyle, stroke: isActive ? '#f59e0b' : '#f3f4f6' };
      default:
        return baseStyle;
    }
  };

  // Simple vertical line for basic connections
  if (startX === endX) {
    return (
      <svg 
        className="absolute pointer-events-none" 
        style={{ 
          top: Math.min(startY, endY), 
          left: startX - 1, 
          width: 2, 
          height: Math.abs(endY - startY) 
        }}
      >
        <line
          x1="1"
          y1="0"
          x2="1"
          y2={Math.abs(endY - startY)}
          {...getLineStyle()}
        />
      </svg>
    );
  }

  // L-shaped connection for more complex layouts
  const midY = startY + (endY - startY) / 2;

  return (
    <svg 
      className="absolute pointer-events-none" 
      style={{ 
        top: Math.min(startY, endY), 
        left: Math.min(startX, endX) - 1, 
        width: Math.abs(endX - startX) + 2, 
        height: Math.abs(endY - startY) + 2 
      }}
    >
      {/* Vertical line from start */}
      <line
        x1={startX - Math.min(startX, endX) + 1}
        y1="1"
        x2={startX - Math.min(startX, endX) + 1}
        y2={midY - Math.min(startY, endY) + 1}
        {...getLineStyle()}
      />
      
      {/* Horizontal line */}
      <line
        x1={startX - Math.min(startX, endX) + 1}
        y1={midY - Math.min(startY, endY) + 1}
        x2={endX - Math.min(startX, endX) + 1}
        y2={midY - Math.min(startY, endY) + 1}
        {...getLineStyle()}
      />
      
      {/* Vertical line to end */}
      <line
        x1={endX - Math.min(startX, endX) + 1}
        y1={midY - Math.min(startY, endY) + 1}
        x2={endX - Math.min(startX, endX) + 1}
        y2={Math.abs(endY - startY) + 1}
        {...getLineStyle()}
      />
      
      {/* Connection points */}
      <circle
        cx={startX - Math.min(startX, endX) + 1}
        cy="1"
        r="3"
        fill={getLineStyle().stroke}
        className="opacity-60"
      />
      <circle
        cx={endX - Math.min(startX, endX) + 1}
        cy={Math.abs(endY - startY) + 1}
        r="3"
        fill={getLineStyle().stroke}
        className="opacity-60"
      />
    </svg>
  );
};

// Simple vertical connection line (most common case)
export const SimpleConnectionLine: React.FC = () => (
  <svg 
    className="absolute pointer-events-none" 
    style={{ top: -20, left: '50%', transform: 'translateX(-50%)' }}
    width="2" 
    height="20"
  >
    <line 
      x1="1" 
      y1="0" 
      x2="1" 
      y2="20" 
      stroke="#e5e7eb" 
      strokeWidth="2" 
    />
  </svg>
);