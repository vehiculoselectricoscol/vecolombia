import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-emerald-600/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-500/30",
        secondary:
          "border-transparent bg-cyan-600/10 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300 border-cyan-500/30",
        destructive:
          "border-transparent bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-300 border-red-500/30",
        outline:
          "border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300",
        amber:
          "border-transparent bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border-amber-500/30",
        purple:
          "border-transparent bg-purple-500/10 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300 border-purple-500/30",
        fastCharge:
          "border-transparent bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/40 font-mono-spec font-bold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
