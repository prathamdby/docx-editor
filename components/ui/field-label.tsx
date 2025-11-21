"use client";

import { type ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FieldLabelProps {
  htmlFor?: string;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
}

/**
 * Standardized field label component with consistent styling
 * Used across form components for uniform appearance
 */
export function FieldLabel({
  htmlFor,
  icon: Icon,
  children,
  className,
}: FieldLabelProps) {
  return (
    <Label
      htmlFor={htmlFor}
      className={cn(
        "text-xs font-bold uppercase tracking-wider text-muted-foreground",
        Icon && "flex items-center gap-2",
        className
      )}
    >
      {Icon && <Icon className="h-3 w-3" />}
      {children}
    </Label>
  );
}
