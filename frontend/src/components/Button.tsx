import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  const styles = {
    primary:
      "bg-sage text-white shadow-sm hover:bg-sage-dark disabled:bg-sage/40 disabled:text-white/80",
    secondary:
      "bg-white text-ink ring-1 ring-ink/10 hover:bg-white/80 disabled:text-ink/40",
    ghost: "bg-transparent text-sage hover:bg-sage-soft/60",
  }[variant];

  return (
    <button
      className={`inline-flex min-h-12 w-full items-center justify-center rounded-2xl px-4 text-base font-semibold transition ${styles} ${className}`}
      {...props}
    />
  );
}
