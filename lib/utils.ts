import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge conditional class names and resolve Tailwind conflicts.
 *
 * Standard shadcn/ui `cn` helper: `clsx` flattens conditional class inputs and
 * `tailwind-merge` dedupes/overrides conflicting Tailwind utilities so the last
 * one wins.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
