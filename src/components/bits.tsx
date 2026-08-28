import { cloneElement, isValidElement, type AnchorHTMLAttributes, type ReactElement, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { STATE_PLAIN, type SignalState } from "@/lib/engine/types";

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function scrollToDesk() {
  document.getElementById("desk")?.scrollIntoView({
    behavior: prefersReducedMotion() ? "auto" : "smooth",
  });
}

export function ExtLink({
  href,
  className,
  children,
  onClick,
  ...rest
}: {
  href: string;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "target" | "rel" | "children">) {
  return (
    <a href={href} target="_blank" rel="noopener" className={className} onClick={onClick} {...rest}>
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

export function Chip({
  state,
  children,
  plain = true,
}: {
  state: SignalState | "info";
  children?: ReactNode;
  plain?: boolean;
}) {
  const cls =
    state === "known"
      ? "chip chip-known"
      : state === "partial"
        ? "chip chip-partial"
        : state === "declined" || state === "fail-closed"
          ? "chip chip-closed"
          : "chip";
  const label =
    state === "info" ? "Note" : plain ? STATE_PLAIN[state] : state === "fail-closed" ? "Fail closed" : STATE_PLAIN[state];
  return (
    <span className={cls}>
      {label}
      {children ? <span className="normal-case tracking-normal"> · {children}</span> : null}
    </span>
  );
}

export function Meter({ value, label }: { value: number; label: string }) {
  const clamped = Math.max(0, Math.min(100, value));
  const now = Math.round(clamped);
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <p className="eyebrow">{label}</p>
        <p className="font-mono text-sm tabular-nums">{now}</p>
      </div>
      <div
        className="meter"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={now}
        aria-valuetext={`${now} out of 100`}
        aria-label={label}
      >
        <span style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}

export function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  const hintId = `${id}-hint`;
  const control = isValidElement(children)
    ? cloneElement(children as ReactElement<{ "aria-describedby"?: string }>, {
        "aria-describedby": hint ? hintId : undefined,
      })
    : children;
  return (
    <div>
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      {control}
      {hint ? (
        <p id={hintId} className="mt-1.5 text-xs leading-relaxed text-(--ink-soft)">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function Why({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="group border-t border-(--rule) pt-3">
      <summary className="cursor-pointer font-mono text-[0.625rem] uppercase tracking-[0.14em] text-(--oxblood)">
        {title}
      </summary>
      <div className="mt-2 text-sm leading-relaxed text-(--ink-soft)">{children}</div>
    </details>
  );
}

export function EmptyDesk({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="panel p-6 md:p-8">
      <p className="eyebrow">Nothing on the desk</p>
      <h2 className="display-lg mt-3">{title}</h2>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-(--ink-soft)">{body}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function SectionHead({ kicker, title, lede }: { kicker: string; title: string; lede?: string }) {
  return (
    <header className="mb-6">
      <p className="eyebrow">{kicker}</p>
      <h2 className="display-lg mt-2">{title}</h2>
      {lede ? <p className="mt-3 max-w-2xl text-sm leading-relaxed text-(--ink-soft)">{lede}</p> : null}
    </header>
  );
}

export function FreshnessBadge({ state }: { state: string }) {
  return <span className="chip">{state.replace("-", " ")}</span>;
}

export function cnField(...i: Parameters<typeof cn>) {
  return cn(...i);
}
