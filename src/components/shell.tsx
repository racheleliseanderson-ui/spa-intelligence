import { Contrast, Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { ExtLink, scrollToDesk } from "@/components/bits";
import { cn } from "@/lib/cn";
import { EDITORIAL } from "@/lib/data/editorial";
import type { Mode } from "@/lib/engine/types";
import { useDesk, type Theme } from "@/lib/store";

export const MODE_TITLE: Record<Mode, string> = {
  home: "Start",
  fast: "Your reading",
  prep: "Consult questions",
  library: "Library",
  intake: "Paste a menu",
  full: "The rest of the room",
  whatif: "What if",
  compare: "Compare",
  decode: "Claim decoder",
  packet: "Decision packet",
  method: "How it works",
};

const PRIMARY: { id: Mode; label: string }[] = [
  { id: "home", label: "Start" },
  { id: "fast", label: "Your reading" },
  { id: "prep", label: "Consult questions" },
  { id: "library", label: "Library" },
];

const MORE: { id: Mode; label: string }[] = [
  { id: "intake", label: "Paste a menu" },
  { id: "full", label: "The rest of the room" },
  { id: "whatif", label: "What if" },
  { id: "compare", label: "Compare" },
  { id: "decode", label: "Claim decoder" },
  { id: "packet", label: "Decision packet" },
  { id: "method", label: "How it works" },
];

const THEMES = [
  ["pearl", Sun, "Pearl"],
  ["dark", Moon, "Dark"],
  ["cvd", Contrast, "High contrast"],
] as const;

function focusablesIn(root: HTMLElement) {
  return [...root.querySelectorAll<HTMLElement>("button:not([disabled]), a[href], input, select, textarea, [tabindex]:not([tabindex='-1'])")].filter((el) => {
    if (el.closest("[inert]")) return false;
    if (el.getAttribute("aria-hidden") === "true") return false;
    const style = window.getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden") return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  });
}

function ThemeRadios({
  theme,
  setTheme,
  labeled,
  className,
}: {
  theme: Theme;
  setTheme: (t: Theme) => void;
  labeled?: boolean;
  className?: string;
}) {
  const groupRef = useRef<HTMLDivElement>(null);
  const ids = THEMES.map((t) => t[0]);

  function selectAt(index: number) {
    const i = (index + THEMES.length) % THEMES.length;
    setTheme(THEMES[i][0]);
    requestAnimationFrame(() => {
      groupRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[i]?.focus();
    });
  }

  return (
    <div
      ref={groupRef}
      role="radiogroup"
      aria-label="Display mode"
      className={className}
      onKeyDown={(e) => {
        const i = Math.max(0, ids.indexOf(theme));
        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          e.preventDefault();
          selectAt(i + 1);
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          e.preventDefault();
          selectAt(i - 1);
        } else if (e.key === "Home") {
          e.preventDefault();
          selectAt(0);
        } else if (e.key === "End") {
          e.preventDefault();
          selectAt(THEMES.length - 1);
        }
      }}
    >
      {THEMES.map(([id, Icon, label]) => (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={theme === id}
          tabIndex={theme === id ? 0 : -1}
          title={label}
          className={cn(
            labeled
              ? "inline-flex min-h-11 items-center justify-center gap-1.5 font-mono text-[0.625rem] uppercase tracking-[0.12em]"
              : "inline-flex size-11 items-center justify-center",
            theme === id
              ? "bg-(--oxblood) text-(--pearl)"
              : labeled
                ? "border border-(--rule) text-(--ink)"
                : "text-(--ink-soft) hover:text-(--ink)",
          )}
          onClick={() => setTheme(id)}
        >
          <Icon className="size-3.5" aria-hidden="true" />
          {labeled ? label : <span className="sr-only">{label}</span>}
        </button>
      ))}
    </div>
  );
}

export function Header({
  mode,
  setMode,
}: {
  mode: Mode;
  setMode: (m: Mode) => void;
}) {
  const theme = useDesk((s) => s.theme);
  const setTheme = useDesk((s) => s.setTheme);
  const [open, setOpen] = useState(false);
  const [more, setMore] = useState(false);
  const menuId = useId();
  const moreId = useId();
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const moreWrapRef = useRef<HTMLDivElement>(null);

  function closeMenu(restore = true) {
    setOpen(false);
    setMore(false);
    if (restore) {
      requestAnimationFrame(() => menuButtonRef.current?.focus());
    }
  }

  function go(id: Mode) {
    const same = id === mode;
    setMode(id);
    closeMenu(false);
    scrollToDesk();
    if (!same) return;
    requestAnimationFrame(() => {
      const heading = document.querySelector<HTMLElement>("main h1");
      if (heading) {
        heading.tabIndex = -1;
        heading.focus({ preventScroll: true });
      } else {
        menuButtonRef.current?.focus();
      }
    });
  }

  useEffect(() => {
    if (!open && !more) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        closeMenu(true);
        return;
      }
      if (!open || e.key !== "Tab" || !headerRef.current) return;
      const list = focusablesIn(headerRef.current);
      if (list.length === 0) return;
      const i = list.indexOf(document.activeElement as HTMLElement);
      if (e.shiftKey) {
        if (i <= 0) {
          e.preventDefault();
          list[list.length - 1]?.focus();
        }
      } else if (i === list.length - 1 || i === -1) {
        e.preventDefault();
        list[0]?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, more]);

  useEffect(() => {
    if (!open) return;
    const first = headerRef.current?.querySelector<HTMLElement>("[data-menu-item]");
    first?.focus();
  }, [open]);

  useEffect(() => {
    if (!more) return;
    function onPointer(e: PointerEvent) {
      if (!(e.target instanceof Node)) return;
      if (moreWrapRef.current?.contains(e.target)) return;
      setMore(false);
    }
    window.addEventListener("pointerdown", onPointer);
    return () => window.removeEventListener("pointerdown", onPointer);
  }, [more]);

  useEffect(() => {
    const blocked = [document.querySelector("main"), document.querySelector("footer")];
    for (const node of blocked) {
      if (!node) continue;
      if (open) node.setAttribute("inert", "");
      else node.removeAttribute("inert");
    }
    return () => {
      for (const node of blocked) node?.removeAttribute("inert");
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <header
      ref={headerRef}
      className={cn(
        "site-header no-print sticky top-0 z-30 border-b border-(--rule) bg-(--bone)/90 backdrop-blur-md",
        open && "flex h-svh flex-col md:h-auto",
      )}
      data-menu-open={open ? "" : undefined}
      role={open ? "dialog" : undefined}
      aria-modal={open ? true : undefined}
      aria-label={open ? "All desks" : undefined}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-nowrap items-center gap-2.5 px-4 py-2.5 md:gap-4 md:px-8">
        <div className="flex min-w-0 items-center gap-2.5" inert={open}>
          <ExtLink
            href={EDITORIAL.house}
            aria-label="Northern Lantern House Labs"
            className="inline-flex min-h-11 shrink-0 items-center font-mono text-[0.625rem] uppercase tracking-[0.14em] text-(--oxblood) no-underline hover:underline"
          >
            <span className="lg:hidden">House Labs</span>
            <span className="hidden lg:inline">Northern Lantern House Labs</span>
          </ExtLink>
          <span aria-hidden="true" className="hidden h-4 w-px shrink-0 bg-(--rule) lg:block" />
          <ExtLink
            href={EDITORIAL.home}
            className="hidden min-h-11 shrink-0 items-center font-mono text-[0.5625rem] uppercase tracking-[0.2em] text-(--ink-soft) no-underline hover:text-(--oxblood) lg:inline-flex"
          >
            Vanity or Vice
          </ExtLink>
        </div>
        <nav aria-label="App panels" className="ml-auto hidden items-center gap-1 md:flex">
          {PRIMARY.map((m) => (
            <button
              key={m.id}
              type="button"
              aria-current={mode === m.id ? "page" : undefined}
              className={cn(
                "min-h-11 whitespace-nowrap border-b-2 px-1.5 py-1 font-mono text-[0.5625rem] uppercase tracking-[0.12em]",
                mode === m.id
                  ? "border-(--oxblood) text-(--oxblood)"
                  : "border-transparent text-(--ink-soft) hover:text-(--ink)",
              )}
              onClick={() => go(m.id)}
            >
              {m.label}
            </button>
          ))}
          <div className="relative" ref={moreWrapRef}>
            <button
              type="button"
              className={cn(
                "min-h-11 whitespace-nowrap border-b-2 px-1.5 py-1 font-mono text-[0.5625rem] uppercase tracking-[0.12em]",
                MORE.some((m) => m.id === mode)
                  ? "border-(--oxblood) text-(--oxblood)"
                  : "border-transparent text-(--ink-soft) hover:text-(--ink)",
              )}
              aria-expanded={more}
              aria-controls={moreId}
              aria-haspopup="menu"
              onClick={() => setMore((v) => !v)}
            >
              More
            </button>
            {more ? (
              <ul
                id={moreId}
                role="menu"
                className="absolute right-0 z-40 mt-2 min-w-52 border border-(--rule) bg-(--bone) py-1 shadow-sm"
              >
                {MORE.map((m) => (
                  <li key={m.id} role="none">
                    <button
                      type="button"
                      role="menuitem"
                      className="min-h-11 w-full px-3 py-2 text-left font-mono text-[0.625rem] uppercase tracking-[0.12em] hover:bg-(--parchment)"
                      onClick={() => go(m.id)}
                    >
                      {m.label}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </nav>
        <button
          ref={menuButtonRef}
          type="button"
          className="ml-auto inline-flex size-11 shrink-0 items-center justify-center md:hidden"
          aria-expanded={open}
          aria-controls={menuId}
          aria-haspopup="dialog"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => {
            if (open) closeMenu(true);
            else setOpen(true);
          }}
        >
          {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
        </button>
        <ThemeRadios
          theme={theme}
          setTheme={setTheme}
          className="hidden shrink-0 items-center border border-(--rule) md:flex"
        />
      </div>
      {open ? (
        <nav
          id={menuId}
          className="mobile-sheet flex min-h-0 flex-1 flex-col overflow-y-auto border-t border-(--rule) px-4 pt-3 md:hidden"
          aria-label="All desks"
        >
          <p className="sr-only">Every desk on this instrument. Escape or Close menu dismisses this list.</p>
          <div className="grid gap-1">
            {[...PRIMARY, ...MORE].map((m, i) => (
              <button
                key={m.id}
                type="button"
                data-menu-item={i === 0 ? "" : undefined}
                aria-current={mode === m.id ? "page" : undefined}
                className={cn(
                  "min-h-11 px-2 text-left font-mono text-[0.6875rem] uppercase tracking-[0.12em]",
                  mode === m.id ? "text-(--oxblood)" : "text-(--ink)",
                )}
                onClick={() => go(m.id)}
              >
                {m.label}
              </button>
            ))}
          </div>
          <ThemeRadios
            theme={theme}
            setTheme={setTheme}
            labeled
            className="mt-auto grid grid-cols-3 gap-1 border-t border-(--rule) pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
          />
        </nav>
      ) : null}
    </header>
  );
}

export function MobileDock({ mode, setMode }: { mode: Mode; setMode: (m: Mode) => void }) {
  return (
    <nav className="sticky-cta no-print md:hidden" aria-label="Reading actions">
      <div className="mx-auto flex max-w-6xl gap-2">
        <button
          type="button"
          className="btn-primary flex-1"
          aria-current={mode === "fast" ? "page" : undefined}
          onClick={() => {
            setMode("fast");
            scrollToDesk();
          }}
        >
          {mode === "fast" || mode === "home" ? "Your reading" : "Back to reading"}
        </button>
        <button
          type="button"
          className="btn-quiet flex-1"
          aria-current={mode === "prep" ? "page" : undefined}
          onClick={() => {
            setMode("prep");
            scrollToDesk();
          }}
        >
          Consult questions
        </button>
      </div>
    </nav>
  );
}
