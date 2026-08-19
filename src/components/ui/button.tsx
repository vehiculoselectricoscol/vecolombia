import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-emerald-600 text-white shadow-md hover:bg-emerald-500 hover:shadow-emerald-500/25 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400 font-semibold",
        destructive:
          "bg-red-600 text-white shadow-sm hover:bg-red-500 focus-visible:ring-red-500",
        outline:
          "border border-slate-200 dark:border-slate-800 bg-background hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50",
        secondary:
          "bg-cyan-600 text-white shadow-sm hover:bg-cyan-500 hover:shadow-cyan-500/20 dark:bg-cyan-500 dark:text-slate-950 font-semibold",
        ghost:
          "hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800/60 dark:hover:text-slate-50",
        link:
          "text-emerald-600 dark:text-emerald-400 underline-offset-4 hover:underline",
        electric:
          "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white font-bold shadow-lg shadow-emerald-500/20 hover:brightness-110 hover:shadow-emerald-500/35",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
