/* 
 * src/utils/cn.ts
 * Class name utility function for Kairos Frontend
 * Provides conditional class name concatenation using clsx and tailwind-merge
 */
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility function to conditionally join class names with Tailwind CSS conflict resolution
 * Combines clsx for conditional logic and tailwind-merge for deduplication
 * 
 * @param inputs - Array of class values (strings, objects, arrays)
 * @returns Combined and deduplicated class name string
 * 
 * @example
 * ```ts
 * cn('px-2 py-1', condition && 'bg-blue-500', {
 *   'text-white': isActive,
 *   'text-gray-500': !isActive
 * })
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}