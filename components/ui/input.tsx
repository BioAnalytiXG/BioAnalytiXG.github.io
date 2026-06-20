import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Input primitive (shadcn/ui style) for the BioAnalytiX form system.
 *
 * Styling is driven entirely by named design tokens (`--border`, `--input`,
 * `--background`, `--ring`, `--muted-foreground`, …) so there are no ad-hoc
 * color literals (Requirement 12.2). A visible `--ring` focus outline keeps the
 * field keyboard-accessible (Requirement 12.6).
 */
const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type ?? "text"}
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        "placeholder:text-muted-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
