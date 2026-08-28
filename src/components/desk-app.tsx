import { useEffect, useMemo, useRef } from "react";
import { GuidedFlow } from "@/components/guided";
import { Chapter, Demos, Footer, Hero, HowTo, Instrument } from "@/components/landing";
import {
  ComparePanel,
  DecoderPanel,
  FullEvaluate,
  IntakePanel,
  LibraryPanel,
  MethodPanel,
  PacketPanel,
  PrepPanel,
  WhatIfPanel,
} from "@/components/panels";
import { Header, MobileDock, MODE_TITLE } from "@/components/shell";
import { prefersReducedMotion, scrollToDesk } from "@/components/bits";
import { track } from "@/lib/analytics";
import { evaluate, isDeskActive } from "@/lib/engine/evaluate";
import type { Mode } from "@/lib/engine/types";
import { cn } from "@/lib/cn";
import { useDesk } from "@/lib/store";

const THEME_COLOR = {
  pearl: "#f4f1ea",
  dark: "#0b1220",
  cvd: "#111111",
} as const;

export function DeskApp({ initialMode }: { initialMode?: Mode }) {
  const theme = useDesk((s) => s.theme);
  const input = useDesk((s) => s.input);
  const mode = useDesk((s) => s.mode);
  const setMode = useDesk((s) => s.setMode);
  const skipFirstModeFocus = useRef(true);

  useEffect(() => {
    void useDesk.persist.rehydrate();
    track("opened");
  }, []);

  useEffect(() => {
    if (initialMode) setMode(initialMode);
  }, [initialMode, setMode]);

  useEffect(() => {
    if (theme === "pearl") delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", THEME_COLOR[theme]);
  }, [theme]);

  useEffect(() => {
    if (skipFirstModeFocus.current) {
      skipFirstModeFocus.current = false;
      return;
    }
    const heading = document.querySelector<HTMLElement>("main h1");
    heading?.focus({ preventScroll: true });
  }, [mode]);

  const evaluation = useMemo(() => evaluate(input), [input]);
  const active = isDeskActive(input);
  const showLanding = mode === "home";

  return (
    <div className={cn("min-h-dvh overflow-x-hidden bg-(--bone) text-(--ink)", active && "pb-24 md:pb-0")}>
      <a className="skip-link" href="#desk">
        Skip to desk
      </a>
      <Header mode={mode} setMode={setMode} />
      <main>
        {!showLanding ? (
          <h1 className="sr-only focus:outline-none" tabIndex={-1}>
            {MODE_TITLE[mode]} · Spa Intelligence
          </h1>
        ) : null}
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {mode === "home" ? "" : MODE_TITLE[mode]}
        </p>
        {showLanding ? (
          <Hero
            onStart={() => {
              setMode("fast");
              scrollToDesk();
            }}
          />
        ) : null}
        <section
          id="desk"
          tabIndex={-1}
          className="mx-auto max-w-6xl scroll-mt-[calc(5.5rem+env(safe-area-inset-top))] px-5 py-8 outline-none md:px-8 md:py-10"
        >
          {showLanding || mode === "fast" ? (
            <HowTo
              onFour={() => {
                setMode("fast");
                scrollToDesk();
              }}
              onPaste={() => setMode("intake")}
              onDemos={() => {
                setMode("home");
                requestAnimationFrame(() => {
                  document.getElementById("demos")?.scrollIntoView({
                    behavior: prefersReducedMotion() ? "auto" : "smooth",
                  });
                });
              }}
            />
          ) : null}
          {mode === "home" || mode === "fast" ? <GuidedFlow /> : null}
          {mode === "intake" && <IntakePanel />}
          {mode === "full" && <FullEvaluate evaluation={evaluation} />}
          {mode === "whatif" && <WhatIfPanel evaluation={evaluation} />}
          {mode === "compare" && <ComparePanel />}
          {mode === "prep" && <PrepPanel evaluation={evaluation} />}
          {mode === "decode" && <DecoderPanel />}
          {mode === "library" && <LibraryPanel />}
          {mode === "packet" && <PacketPanel evaluation={evaluation} />}
          {mode === "method" && <MethodPanel />}
        </section>
        {showLanding ? (
          <>
            <Demos />
            <Chapter />
            <Instrument />
          </>
        ) : null}
      </main>
      {active ? <MobileDock mode={mode} setMode={setMode} /> : null}
      <Footer />
    </div>
  );
}
