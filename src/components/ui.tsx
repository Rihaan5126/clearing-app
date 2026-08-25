import type { ComponentProps, ElementType, ReactNode } from "react";

export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

const BUTTON_BASE =
  "inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50";

const BUTTON_VARIANTS = {
  primary: "bg-accent text-accent-foreground hover:bg-accent-hover",
  secondary:
    "border border-border bg-surface text-foreground hover:bg-surface-muted",
  ghost: "text-accent hover:bg-accent-soft",
};

type ButtonVariant = keyof typeof BUTTON_VARIANTS;

export function buttonClasses(variant: ButtonVariant = "primary", className?: string): string {
  return cx(BUTTON_BASE, BUTTON_VARIANTS[variant], className);
}

export function Button<T extends ElementType = "button">({
  as,
  variant = "primary",
  className,
  ...props
}: { as?: T; variant?: ButtonVariant; className?: string } & Omit<
  ComponentProps<T>,
  "as" | "className"
>) {
  const Component = as ?? "button";
  return <Component className={buttonClasses(variant, className)} {...props} />;
}

export const inputClasses =
  "h-11 w-full rounded-lg border border-border bg-surface px-3.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-accent";

export const labelClasses = "text-xs font-medium text-muted";

export const linkClasses = "text-sm font-medium text-accent underline-offset-4 hover:underline";

export function Card<T extends ElementType = "div">({
  as,
  children,
  className,
  padded = true,
  ...props
}: {
  as?: T;
  children: ReactNode;
  className?: string;
  padded?: boolean;
} & Omit<ComponentProps<T>, "as" | "className" | "children">) {
  const Component = as ?? "div";
  return (
    <Component
      className={cx("rounded-2xl border border-border bg-surface", padded && "p-5", className)}
      {...props}
    >
      {children}
    </Component>
  );
}

const BADGE_TONES = {
  neutral: "bg-surface-muted text-muted",
  accent: "bg-accent-soft text-accent",
  success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  warning: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: keyof typeof BADGE_TONES;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        BADGE_TONES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">{children}</h2>
  );
}
