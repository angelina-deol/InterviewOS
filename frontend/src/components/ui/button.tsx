import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium font-body transition-colors disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-violet to-indigo text-paper shadow-[0_0_0_1px_rgba(139,92,246,0.4),0_8px_24px_-8px_rgba(139,92,246,0.55)] hover:shadow-[0_0_0_1px_rgba(139,92,246,0.6),0_10px_30px_-6px_rgba(139,92,246,0.7)] hover:brightness-110",
        ghost:
          "text-paper/80 hover:text-paper hover:bg-white/5 border border-white/10",
        outline:
          "border border-violet/40 text-paper hover:bg-violet/10 hover:border-violet/70",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-9 px-4 text-sm",
        lg: "h-12 px-8 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

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
