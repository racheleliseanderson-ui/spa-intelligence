import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { MiniResult, ResultCard } from "@/components/result-card";
import { ExtLink, SectionHead, prefersReducedMotion, scrollToDesk } from "@/components/bits";
import { track } from "@/lib/analytics";
import { DEMOS } from "@/lib/data/demos";
import { CONTEXT_LINKS } from "@/lib/data/editorial";
import { evaluate } from "@/lib/engine/evaluate";
import { useDesk } from "@/lib/store";

export function Hero({ onStart }: { onStart: () => void }) {
  const bad = useMemo(() => evaluate(DEMOS[0].input), []);
  const good = useMemo(() => evaluate(DEMOS[1].input), []);
  const loadDemo = useDesk((s) => s.loadDemo);
  return (
    <section className="on-dark relative isolate overflow-hidden bg-(--navy-deep)">
      <img
        src="/images/room-night.jpg"
        alt="An empty reclining treatment chair upholstered in oxblood leather, lit by a single hard lamp, with an instrument cart waiting in shadow"
        width={1920}
        height={1088}
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 -z-10 h-full w-full object-cover object-[62%_center]"
      />
      <div className="scrim-hero absolute inset-0 -z-10" aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl px-5 pb-10 pt-20 md:px-8 md:pb-14 md:pt-24">
        <p className="chapter-mark text-(--pearl)/80">Spa Intelligence · Vanity or Vice</p>
        <h1
          tabIndex={-1}
          className="mt-4 max-w-3xl font-display text-[clamp(2.6rem,7.4vw,5.2rem)] font-semibold leading-[0.92] tracking-[-0.028em] text-(--pearl) focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--pearl)"
        >
          See the room
          <span className="block italic text-(--pearl)/80">before you book it.</span>
        </h1>
        <p className="mt-6 max-w-xl text-[1.05rem] leading-relaxed text-(--pearl)/85">
          A flash-sale “Botox special” is a sentence. The desk names the service, the setting, the performer and the
          product — then prints what nobody told you. It scores disclosure, not quality. Desire is allowed. The claim
          still has to answer.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
          <button type="button" className="btn-accent" onClick={onStart}>
            Start with four questions
          </button>
          <button
            type="button"
            className="inline-flex min-h-11 items-center font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-(--pearl) underline decoration-(--pearl)/45 decoration-1 underline-offset-[6px]"
            onClick={() => {
              loadDemo("botox-special");
              track("demo_loaded", "botox-special");
              onStart();
            }}
          >
            Load this flash-sale example
          </button>
        </div>
        <div className="mt-12">
          <p className="eyebrow text-(--gold-soft)">Worked example · already scored</p>
          <div className="mt-3 max-w-3xl">
            <ResultCard evaluation={bad} compact />
          </div>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <button
            type="button"
            className="min-h-11 text-left"
            aria-label="Load flash-sale injectable example"
            onClick={() => {
              loadDemo("botox-special");
              track("demo_loaded", "botox-special");
              onStart();
            }}
          >
            <MiniResult evaluation={bad} kicker="Flash-sale injectable · day spa" />
          </button>
          <button
            type="button"
            className="min-h-11 text-left"
            aria-label="Load named product and licensee example"
            onClick={() => {
              loadDemo("tox-named-good");
              track("demo_loaded", "tox-named-good");
              onStart();
            }}
          >
            <MiniResult evaluation={good} kicker="Named product and licensee · med-spa" />
          </button>
        </div>
        <p className="mt-4 max-w-2xl text-xs leading-relaxed text-(--pearl)/70">
          Same class of service. Different amount of the room named. Neither card tells you whether to book — only what
          is still open. Click either to load it.
        </p>
      </div>
    </section>
  );
}

export function HowTo({
  onFour,
  onPaste,
  onDemos,
}: {
  onFour: () => void;
  onPaste: () => void;
  onDemos?: () => void;
}) {
  return (
    <div className="no-print mb-8 border border-(--rule) bg-(--parchment)">
      <div className="grid gap-6 p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:p-6">
        <div>
          <p className="eyebrow">Three steps</p>
          <ol className="mt-3 grid gap-2 sm:grid-cols-3 sm:gap-5">
            <li className="flex gap-2.5">
              <span className="num shrink-0 text-(--oxblood)">1</span>
              <span className="text-sm leading-snug text-(--ink-soft)">Name the service and the setting.</span>
            </li>
            <li className="flex gap-2.5">
              <span className="num shrink-0 text-(--oxblood)">2</span>
              <span className="text-sm leading-snug text-(--ink-soft)">See what the spa hasn’t told you.</span>
            </li>
            <li className="flex gap-2.5">
              <span className="num shrink-0 text-(--oxblood)">3</span>
              <span className="text-sm leading-snug text-(--ink-soft)">Print the questions for your consult.</span>
            </li>
          </ol>
          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <button type="button" className="btn-primary" onClick={onFour}>
              Four questions
            </button>
            <button type="button" className="btn-quiet" onClick={onPaste}>
              Paste a menu or ad
            </button>
            <button
              type="button"
              className="btn-quiet"
              onClick={() => {
                if (onDemos) {
                  onDemos();
                  return;
                }
                document.getElementById("demos")?.scrollIntoView({
                  behavior: prefersReducedMotion() ? "auto" : "smooth",
                });
              }}
            >
              Try a demo
            </button>
          </div>
        </div>
        <p className="max-w-xs text-sm leading-relaxed text-(--ink-soft) md:w-64">
          Four answers is enough to start. The desk quotes the sentence behind every fill. Nothing leaves this browser.
        </p>
      </div>
    </div>
  );
}

export function Demos() {
  const loadDemo = useDesk((s) => s.loadDemo);
  const setMode = useDesk((s) => s.setMode);
  const clearDesk = useDesk((s) => s.clearDesk);
  return (
    <section id="demos" className="border-t border-(--rule) bg-(--bone)">
      <div className="mx-auto max-w-6xl px-5 py-14 md:px-8">
        <SectionHead
          kicker="Try a demo"
          title="See a real setting, not a blank form"
          lede="Concrete menu lines from day spas, hotel spas, suite rentals, mobile services, and clinics. Nothing here is a real facility."
        />
        <div className="grid gap-px border border-(--rule) bg-(--rule) sm:grid-cols-2 lg:grid-cols-3">
          {DEMOS.map((d) => (
            <button
              key={d.id}
              type="button"
              className="min-h-11 bg-(--parchment) p-5 text-left hover:bg-(--bone)"
              onClick={() => {
                loadDemo(d.id);
                track("demo_loaded", d.id);
                setMode("fast");
                scrollToDesk();
              }}
            >
              <p className="eyebrow">Demo scenario</p>
              <h3 className="mt-2 font-display text-2xl leading-tight">{d.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-(--ink-soft)">{d.note}</p>
              <p className="num mt-4 text-(--oxblood)">{d.expected}</p>
            </button>
          ))}
          <div className="bg-(--bone) p-5 sm:p-6">
            <p className="eyebrow">Or start clean</p>
            <p className="mt-3 text-sm leading-relaxed text-(--ink-soft)">
              An empty desk is a valid state. Nothing is inferred on your behalf.
            </p>
            <button type="button" className="btn-quiet mt-5" onClick={() => clearDesk()}>
              Clear this venue
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Chapter() {
  return (
    <section className="on-dark relative isolate overflow-hidden bg-(--navy-deep)">
      <img
        src="/images/consent-paper.jpg"
        alt="Macro view of cream consent paperwork with a blank signature line and an unticked box, brass pen resting across it"
        width={1920}
        height={912}
        loading="lazy"
        className="absolute inset-0 -z-10 h-full w-full object-cover opacity-45"
      />
      <div className="scrim-hero absolute inset-0 -z-10" aria-hidden="true" />
      <div className="relative mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <p className="chapter-mark text-(--pearl)/60">Chapter · the unsigned line</p>
        <h2 className="display-lg mt-6 max-w-3xl text-(--pearl)">
          A blank box is not consent.
          <span className="block italic text-(--pearl)/70">It is a question nobody asked.</span>
        </h2>
        <p className="mt-6 max-w-xl text-sm leading-relaxed text-(--pearl)/80">
          The desk records a declined answer differently from silence. Both stay open. Neither is smoothed into a
          result.
        </p>
      </div>
    </section>
  );
}

export function Instrument() {
  return (
    <section className="border-t border-(--rule) bg-(--parchment)">
      <div className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-16">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <p className="eyebrow">This instrument</p>
            <h2 className="display-lg mt-3">What the desk does</h2>
            <ul className="mt-6 space-y-3 text-sm leading-relaxed text-(--ink-soft)">
              <li className="flex gap-3">
                <span className="num text-(--bronze)">·</span>Scores how much of the setting is actually named before
                you book
              </li>
              <li className="flex gap-3">
                <span className="num text-(--bronze)">·</span>Separates day spa, hotel spa, suite rental, mobile,
                med-spa, dental-adjacent, and clinic questions
              </li>
              <li className="flex gap-3">
                <span className="num text-(--bronze)">·</span>Holds performer, license, product, device, sanitation, and
                jurisdiction to the same standard
              </li>
              <li className="flex gap-3">
                <span className="num text-(--bronze)">·</span>Compares up to five settings on disclosure, and prints
                the residual unknowns
              </li>
            </ul>
          </div>
          <div>
            <p className="eyebrow">Boundaries</p>
            <h2 className="display-lg mt-3">What it refuses to pretend</h2>
            <ul className="mt-6 space-y-3 text-sm leading-relaxed text-(--ink-soft)">
              <li className="flex gap-3">
                <span className="num text-(--oxblood)">·</span>No diagnosis, candidacy, or clinical clearance
              </li>
              <li className="flex gap-3">
                <span className="num text-(--oxblood)">·</span>No provider ranking and no outcome promises
              </li>
              <li className="flex gap-3">
                <span className="num text-(--oxblood)">·</span>Comparison measures disclosure, never safety or quality
              </li>
              <li className="flex gap-3">
                <span className="num text-(--oxblood)">·</span>Unknowns stay on the desk whenever identity is unresolved
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 grid gap-px border border-(--rule) bg-(--rule) sm:grid-cols-2 lg:grid-cols-4">
          {(
            [
              ["Education only", "No diagnosis, candidacy, provider ranking, or clinical verdict."],
              ["Unknowns stay", "Gaps are printed, not smoothed over or filled in by inference."],
              ["Unnamed stays unnamed", "Tier language and voicemail queues count as unresolved."],
              ["This browser only", "The desk autosaves locally. Nothing is transmitted anywhere."],
            ] as const
          ).map(([k, v]) => (
            <div key={k} className="bg-(--bone) px-4 py-4">
              <p className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-(--oxblood)">{k}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-(--ink-soft)">{v}</p>
            </div>
          ))}
        </div>
        <Feedback />
      </div>
    </section>
  );
}

function Feedback() {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [note, setNote] = useState("");
  const input = useDesk((s) => s.input);
  return (
    <div className="panel mt-10 p-5">
      <p className="eyebrow">Correction loop</p>
      <h3 className="mt-2 font-display text-2xl">Saw a stale line, a missing option, or a confusing output?</h3>
      <p className="mt-2 max-w-xl text-sm text-(--ink-soft)">
        No account. The note stays on your machine unless you choose to send it to{" "}
        <ExtLink className="underline" href="https://vanityvice.blog/contact/">
          Vanity or Vice corrections
        </ExtLink>
        . The current menu line is attached so we know which record you mean.
      </p>
      {sent ? (
        <p className="mt-4 text-sm">Noted in this browser. Open the contact page if you want it on the record.</p>
      ) : (
        <>
          <button type="button" className="btn-quiet mt-4" onClick={() => setOpen((v) => !v)}>
            Report a problem
          </button>
          {open ? (
            <form
              className="mt-4 grid gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                try {
                  window.localStorage.setItem(
                    "spa-intelligence-feedback",
                    JSON.stringify({
                      note,
                      menuLine: input.menuLine,
                      venue: input.venue,
                      region: input.region,
                      at: new Date().toISOString(),
                    }),
                  );
                } catch {
                  /* ignore */
                }
                track("feedback_kept");
                setSent(true);
              }}
            >
              <label className="field-label" htmlFor="fb">
                What should we look at
              </label>
              <textarea
                id="fb"
                className="field-area"
                required
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Incorrect data, confusing output, missing option…"
              />
              <p className="text-xs text-(--ink-soft)">
                Attached locally: {input.menuLine || "empty desk"} · {input.venue} · {input.region}
              </p>
              <button type="submit" className="btn-primary w-fit">
                Keep the note
              </button>
            </form>
          ) : null}
        </>
      )}
    </div>
  );
}

export function EditorialHints({ text }: { text: string }) {
  const links = CONTEXT_LINKS.filter((l) => l.match.test(text)).slice(0, 3);
  if (!links.length) return null;
  return (
    <div className="panel p-5">
      <p className="eyebrow">Deeper on Vanity or Vice</p>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l.href}>
            <ExtLink
              className="inline-flex min-h-11 items-center text-sm underline decoration-(--oxblood)/40 underline-offset-2"
              href={l.href}
            >
              {l.label}
            </ExtLink>
            <span className="block text-xs text-(--ink-soft)">{l.why}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="no-print bg-(--navy-deep)">
      <div className="h-px w-full bg-(--gold)" aria-hidden="true" />
      <div className="mx-auto max-w-6xl px-5 py-14 pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:px-8 md:py-16 md:pb-[calc(4rem+env(safe-area-inset-bottom))]">
        <p className="font-mono text-[0.625rem] uppercase tracking-[0.28em] text-(--gold)">
          Northern Lantern House Labs
        </p>
        <h2 className="mt-3 font-display text-2xl leading-none text-(--pearl) md:text-3xl">
          Spa Intelligence
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-(--pearl)/80">
          Four questions before you book. Gaps stay gaps. Education only.
        </p>
        <nav aria-label="In this site" className="mt-10">
          <p className="font-mono text-[0.625rem] uppercase tracking-[0.2em] text-(--pearl)/70">
            In this site
          </p>
          <ul className="mt-3 flex flex-wrap gap-x-5 text-sm">
            {[
              ["/", "Start here"],
              ["/desk", "Desk"],
              ["/decode", "Decode"],
              ["/library", "Library"],
              ["/method", "Method"],
              ["/packet", "Your decision"],
            ].map(([to, label]) => (
              <li key={to}>
                <Link
                  to={to}
                  className="inline-flex min-h-11 items-center text-(--pearl)/85 no-underline hover:text-(--gold-soft)"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-(--pearl)/15 pt-6">
          <p className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-(--pearl)/70">
            © 2026 Vanity or Vice
          </p>
          <p className="ml-auto font-mono text-[0.625rem] uppercase tracking-[0.16em] text-(--pearl)/70">
            Education only · no diagnosis · no ranking · no candidacy
          </p>
        </div>
      </div>
    </footer>
  );
}
