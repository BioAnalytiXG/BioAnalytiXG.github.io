import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Textarea primitive (shadcn/ui style) for the BioAnalytiX form system.
 *
 * Mirrors the {@link Input} styling using named design tokens only — no ad-hoc
 * color literals (Requirement 12.2) — with a visible `--ring` focus outline for
 * keyboard accessibility (Requirement 12.6).
 */
const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors",
        "placeholder:text-muted-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
