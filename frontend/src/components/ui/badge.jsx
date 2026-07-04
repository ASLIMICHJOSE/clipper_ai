import * as React from "react"
import { cn } from "@/utils/cn"

function Badge({ className, variant = "default", ...props }) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          "border-transparent bg-primary text-primary-foreground shadow": variant === "default",
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/85": variant === "secondary",
          "border-transparent bg-destructive text-destructive-foreground shadow": variant === "destructive",
          "text-foreground border-border bg-card": variant === "outline",
          "border-transparent bg-emerald-500/10 text-emerald-400 border border-emerald-500/20": variant === "success",
          "border-transparent bg-amber-500/10 text-amber-400 border border-amber-500/20": variant === "warning",
          "border-transparent bg-indigo-500/10 text-indigo-400 border border-indigo-500/20": variant === "info",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
