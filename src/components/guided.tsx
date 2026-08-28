import { useEffect, useMemo, useRef, useState } from "react";
import { Chip, Field } from "@/components/bits";
import { ResultCard } from "@/components/result-card";
import { track } from "@/lib/analytics";
import { SERVICE_CLASS_LABEL, VENUES, findService } from "@/lib/data/catalog";
import { suggestProducts, suggestServices } from "@/lib/data/search";
import { evaluate, isDeskActive } from "@/lib/engine/evaluate";
import { ASKED_NO_ANSWER, type ServiceClass, type VenueId } from "@/lib/engine/types";
import { useDesk } from "@/lib/store";

const STEPS = [
  { id: "menu", title: "What is on the menu?", hint: "Quote the line, not the mood." },
  { id: "venue", title: "What kind of place is this?", hint: "The name on the door is not the license inside." },
  { id: "performer", title: "Who is doing it?", hint: "A title is marketing. A license is checkable." },
  { id: "product", title: "What exact product or device?", hint: "The brand on the box, vial, or panel." },
] as const;

export function GuidedFlow() {
  const input = useDesk((s) => s.input);
  const setInput = useDesk((s) => s.setInput);
  const guidedStep = useDesk((s) => s.guidedStep);
  const setGuidedStep = useDesk((s) => s.setGuidedStep);
  const setMode = useDesk((s) => s.setMode);
  const lastSavedAt = useDesk((s) => s.lastSavedAt);
  const evaluation = useMemo(() => evaluate(input), [input]);
  const active = isDeskActive(input);
  const step = Math.min(Math.max(guidedStep, 0), 4);
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const skipFirstStepFocus = useRef(true);

  useEffect(() => {
    if (skipFirstStepFocus.current) {
      skipFirstStepFocus.current = false;
      return;
    }
    stepHeadingRef.current?.focus({ preventScroll: true });
  }, [step]);

  function go(next: number) {
    if (guidedStep === 0 && next > 0) track("guided_started");
    setGuidedStep(next);
    if (next >= 4 && isDeskActive(useDesk.getState().input)) track("first_result");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)]">
      <div className="panel p-5 md:p-6">
        <p className="eyebrow">Four questions</p>
        <h2 className="mt-2 font-display text-3xl leading-tight">What are you considering?</h2>
        <p className="mt-2 text-sm leading-relaxed text-(--ink-soft)">
          Answer what you know. Use “I don’t know” or “They wouldn’t answer” instead of inventing a name. The card
          updates as you go.
        </p>
        <ol className="mt-5 flex items-center gap-0" aria-label="Progress through four questions">
          {STEPS.map((s, i) => (
            <li key={s.id} className="flex items-center">
              <button
                type="button"
                className="inline-flex size-11 items-center justify-center"
                aria-label={`Step ${i + 1}: ${s.title}`}
                aria-current={i === Math.min(step, 3) ? "step" : undefined}
                onClick={() => setGuidedStep(i)}
              >
                <span className={i <= step ? "step-dot step-dot-on" : "step-dot"} aria-hidden="true" />
              </button>
              {i < STEPS.length - 1 ? <span className="h-px w-4 bg-(--rule)" aria-hidden="true" /> : null}
            </li>
          ))}
        </ol>

        <div className="mt-6">
          {step <= 3 ? (
            <h3
              ref={stepHeadingRef}
              tabIndex={-1}
              className="font-display text-xl leading-tight focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--oxblood)"
            >
              {STEPS[step].title}
            </h3>
          ) : (
            <h3
              ref={stepHeadingRef}
              tabIndex={-1}
              className="font-display text-xl leading-tight focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--oxblood)"
            >
              That’s enough to read the room
            </h3>
          )}
          {step <= 3 ? (
            <p className="mt-1 mb-4 text-sm leading-relaxed text-(--ink-soft)">{STEPS[step].hint}</p>
          ) : null}
          {step <= 0 && <MenuStep onNext={() => go(1)} />}
          {step === 1 && <VenueStep onNext={() => go(2)} onBack={() => go(0)} />}
          {step === 2 && <PerformerStep onNext={() => go(3)} onBack={() => go(1)} />}
          {step === 3 && <ProductStep onNext={() => go(4)} onBack={() => go(2)} />}
          {step >= 4 && (
            <div className="mt-4 space-y-4">
              <p className="text-sm leading-relaxed">
                Add jurisdiction, after-hours cover, or sanitation if you have them — or print the questions for the
                consult.
              </p>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn-primary" onClick={() => setMode("prep")}>
                  Questions for the consult
                </button>
                <button type="button" className="btn-quiet" onClick={() => setMode("full")}>
                  Add more about the room
                </button>
                <button type="button" className="btn-quiet" onClick={() => setMode("whatif")}>
                  What would change this
                </button>
                <button type="button" className="btn-quiet" onClick={() => go(0)}>
                  Edit answers
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="mt-5 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-(--ink-soft)">
          {lastSavedAt ? `Saved in this browser · ${new Date(lastSavedAt).toLocaleString()}` : "Nothing stored yet"} ·
          nothing is transmitted
        </p>
      </div>
      <div>
        {active ? (
          <div className="space-y-4">
            <p className="sr-only" aria-live="polite">
              {evaluation.posture.label}. {evaluation.posture.line}
            </p>
            <ResultCard evaluation={evaluation} />
            <SignalsStrip evaluation={evaluation} />
          </div>
        ) : (
          <div className="panel p-6 md:p-8">
            <p className="eyebrow">Your card will appear here</p>
            <h2 className="display-lg mt-3">Four answers produce a reading</h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-(--ink-soft)">
              Name the menu line, the setting, the person, and the product. The desk scores how much of the room is
              actually written down — not whether you should book.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function MenuStep({ onNext }: { onNext: () => void }) {
  const input = useDesk((s) => s.input);
  const setInput = useDesk((s) => s.setInput);
  const hits = input.menuLine.trim().length > 1 ? suggestServices(input.menuLine, 5) : [];
  return (
    <div className="grid gap-3">
      <Field id="menuLine" label="Menu identity" hint="e.g. Botox Cosmetic, glabella, 20 units">
        <input
          id="menuLine"
          className="field-input"
          value={input.menuLine === ASKED_NO_ANSWER ? "" : input.menuLine}
          onChange={(e) => {
            const menuLine = e.target.value;
            const found = findService(menuLine);
            setInput({
              menuLine,
              serviceClass: found && input.serviceClass === "unselected" ? found.serviceClass : input.serviceClass,
            });
          }}
          placeholder="Quote the exact menu line"
          autoComplete="off"
          enterKeyHint="next"
        />
      </Field>
      {hits.length > 0 ? (
        <ul className="suggest-list" aria-label="Matching menu lines">
          {hits.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                className="min-h-11 w-full px-3 py-2.5 text-left text-sm hover:bg-(--parchment)"
                onClick={() => setInput({ menuLine: s.name, serviceClass: s.serviceClass })}
              >
                <span className="font-medium">{s.name}</span>
                <span className="mt-0.5 block font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-(--ink-soft)">
                  {s.group}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <DontKnow onPick={(v) => setInput({ menuLine: v })} />
      <ClassRow />
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-primary" onClick={onNext}>
          Next · the setting
        </button>
      </div>
    </div>
  );
}

function VenueStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const input = useDesk((s) => s.input);
  const setInput = useDesk((s) => s.setInput);
  const groupRef = useRef<HTMLDivElement>(null);
  const ids = VENUES.map((v) => v.id);

  function selectAt(index: number) {
    const next = VENUES[(index + VENUES.length) % VENUES.length];
    setInput({ venue: next.id as VenueId });
    requestAnimationFrame(() => {
      const buttons = groupRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
      buttons?.[(index + VENUES.length) % VENUES.length]?.focus();
    });
  }

  return (
    <div>
      <p className="field-label" id="venue-kind-label">
        Spa vs med-spa vs clinic
      </p>
      <div
        ref={groupRef}
        className="grid gap-2 sm:grid-cols-2"
        role="radiogroup"
        aria-labelledby="venue-kind-label"
        onKeyDown={(e) => {
          const i = Math.max(0, ids.indexOf(input.venue));
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
            selectAt(VENUES.length - 1);
          }
        }}
      >
        {VENUES.map((v) => (
          <button
            key={v.id}
            type="button"
            role="radio"
            aria-checked={input.venue === v.id}
            tabIndex={input.venue === v.id || (!ids.includes(input.venue) && v.id === ids[0]) ? 0 : -1}
            className={`panel min-h-11 px-3 py-3 text-left ${input.venue === v.id ? "border-(--oxblood)" : ""}`}
            onClick={() => setInput({ venue: v.id as VenueId })}
          >
            <p className="text-sm font-medium">{v.label}</p>
            <p className="mt-1 text-xs leading-relaxed text-(--ink-soft)">{v.note}</p>
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className="btn-quiet" onClick={onBack}>
          Back
        </button>
        <button type="button" className="btn-primary" onClick={onNext}>
          Next · who performs it
        </button>
      </div>
    </div>
  );
}

function PerformerStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const input = useDesk((s) => s.input);
  const setInput = useDesk((s) => s.setInput);
  return (
    <div className="grid gap-3">
      <Field id="performer" label="Who performs it" hint="License type if you have it — NP, RN, PA-C, MD, licensed esthetician.">
        <input
          id="performer"
          className="field-input"
          value={input.performer === ASKED_NO_ANSWER ? "" : input.performer}
          onChange={(e) => setInput({ performer: e.target.value })}
          placeholder="e.g. Nurse practitioner injector"
          autoComplete="off"
          enterKeyHint="next"
        />
      </Field>
      <Field id="license" label="License as printed (optional)">
        <input
          id="license"
          className="field-input"
          value={input.license}
          onChange={(e) => setInput({ license: e.target.value })}
          placeholder="NP, RN, PA-C, MD…"
          autoComplete="off"
          enterKeyHint="next"
        />
      </Field>
      <DontKnow onPick={(v) => setInput({ performer: v })} />
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-quiet" onClick={onBack}>
          Back
        </button>
        <button type="button" className="btn-primary" onClick={onNext}>
          Next · the product
        </button>
      </div>
    </div>
  );
}

function ProductStep({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const input = useDesk((s) => s.input);
  const setInput = useDesk((s) => s.setInput);
  const hits = input.product.trim().length > 1 ? suggestProducts(input.product, 5) : [];
  return (
    <div className="grid gap-3">
      <Field id="product" label="Exact product / device" hint="Botox Cosmetic, VI Peel, SkinPen — not ‘medical-grade’.">
        <input
          id="product"
          className="field-input"
          value={input.product === ASKED_NO_ANSWER ? "" : input.product}
          onChange={(e) => setInput({ product: e.target.value })}
          placeholder="e.g. Botox Cosmetic (onabotulinumtoxinA)"
          autoComplete="off"
          enterKeyHint="done"
        />
      </Field>
      {hits.length > 0 ? (
        <ul className="suggest-list" aria-label="Matching products">
          {hits.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                className="min-h-11 w-full px-3 py-2.5 text-left text-sm hover:bg-(--parchment)"
                onClick={() => setInput({ product: s.name })}
              >
                <span className="font-medium">{s.name}</span>
                <span className="mt-0.5 block font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-(--ink-soft)">
                  {s.group}
                  {s.rx ? " · prescription-adjacent" : ""}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <DontKnow onPick={(v) => setInput({ product: v })} />
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-quiet" onClick={onBack}>
          Back
        </button>
        <button type="button" className="btn-primary" onClick={onNext}>
          See the reading
        </button>
      </div>
    </div>
  );
}

function ClassRow() {
  const input = useDesk((s) => s.input);
  const setInput = useDesk((s) => s.setInput);
  return (
    <Field id="serviceClass" label="Service class" hint="Optional — often inferred from the menu line.">
      <select
        id="serviceClass"
        className="field-select"
        value={input.serviceClass}
        onChange={(e) => setInput({ serviceClass: e.target.value as ServiceClass })}
      >
        {(Object.keys(SERVICE_CLASS_LABEL) as ServiceClass[]).map((k) => (
          <option key={k} value={k}>
            {SERVICE_CLASS_LABEL[k]}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function DontKnow({ onPick }: { onPick: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" className="chip" onClick={() => onPick("")}>
        I don’t know
      </button>
      <button type="button" className="chip" onClick={() => onPick(ASKED_NO_ANSWER)}>
        They wouldn’t answer
      </button>
    </div>
  );
}

export function SignalsStrip({ evaluation }: { evaluation: ReturnType<typeof evaluate> }) {
  return (
    <div className="panel divide-y divide-(--rule)">
      {evaluation.signals
        .filter((s) => s.depth === "fast")
        .map((s) => (
          <div key={s.id} className="px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium">{s.label}</p>
              <Chip state={s.state} />
            </div>
            <p className="mt-2 text-sm leading-relaxed text-(--ink-soft)">{s.reading}</p>
            <details className="mt-2">
              <summary className="cursor-pointer font-mono text-[0.625rem] uppercase tracking-[0.14em] text-(--oxblood)">
                Why this matters
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-(--ink-soft)">{s.why}</p>
              <p className="mt-1 text-sm leading-relaxed">{s.ask}</p>
            </details>
          </div>
        ))}
    </div>
  );
}

export function SaveBar() {
  const saveNamed = useDesk((s) => s.saveNamed);
  const saved = useDesk((s) => s.saved);
  const [name, setName] = useState("");
  return (
    <form
      className="mt-4 flex flex-wrap gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        saveNamed(name);
        track("save_used");
        setName("");
      }}
    >
      <input
        className="field-input max-w-xs"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name this setting"
        aria-label="Name this setting"
      />
      <button type="submit" className="btn-quiet">
        Save
      </button>
      <span className="self-center font-mono text-[0.625rem] uppercase tracking-[0.12em] text-(--ink-soft)">
        {saved.length} saved
      </span>
    </form>
  );
}
