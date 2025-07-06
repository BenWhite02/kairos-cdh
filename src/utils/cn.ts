// File: src/utils/cn.ts
// Utility function for merging Tailwind CSS classes with clsx and tailwind-merge
// Ensures proper class precedence and removes conflicts

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines clsx and tailwind-merge for optimal class name handling
 * @param inputs - Array of class values (strings, objects, arrays)
 * @returns Merged and deduplicated class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}