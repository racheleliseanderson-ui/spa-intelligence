import { useEffect, useMemo, useState } from "react";
import { Copy, Printer } from "lucide-react";
import { Chip, EmptyDesk, ExtLink, Field, FreshnessBadge, Meter, SectionHead, Why } from "@/components/bits";
import { EditorialHints } from "@/components/landing";
import { DontKnow } from "@/components/guided";
import { ResultCard } from "@/components/result-card";
import { track, funnelSummary } from "@/lib/analytics";
import { BOARD_PROVENANCE, boardsForRegion } from "@/lib/data/boards";
import {
  CATALOG_PROVENANCE,
  LICENSE_GLOSSARY,
  PRODUCTS,
  REGIONS,
  SERVICES,
  VENUES,
} from "@/lib/data/catalog";
import { searchCatalog } from "@/lib/data/search";
import { DEMOS } from "@/lib/data/demos";
import { EDITORIAL } from "@/lib/data/editorial";
import { cn } from "@/lib/cn";
import { decodeClaims } from "@/lib/engine/claims";
import { evaluate, isDeskActive } from "@/lib/engine/evaluate";
import { extractFromPaste } from "@/lib/engine/extract";
import { consultQuestions } from "@/lib/engine/questions";
import { applyProbe, whatIfAll } from "@/lib/engine/sensitivity";
import type { DeskInput } from "@/lib/engine/types";
import { useDesk } from "@/lib/store";

export function IntakePanel() {
  const paste = useDesk((s) => s.paste);
  const setPaste = useDesk((s) => s.setPaste);
  const input = useDesk((s) => s.input);
  const replaceInput = useDesk((s) => s.replaceInput);
  const setMode = useDesk((s) => s.setMode);
  const setGuidedStep = useDesk((s) => s.setGuidedStep);
  const [fills, setFills] = useState<ReturnType<typeof extractFromPaste>["fills"]>([]);

  function run() {
    const result = extractFromPaste(paste, input);
    replaceInput(result.next);
    setFills(result.fills);
    setGuidedStep(4);
    setMode("fast");
    track("first_result", "paste");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="panel p-5 md:p-6">
        <SectionHead
          kicker="Paste a menu or ad"
          title="The desk reads what the page actually said"
          lede="It extracts what is written, quotes the sentence, and leaves the rest open. It will not fill a license it did not find."
        />
        <label className="field-label" htmlFor="paste">
          Venue copy
        </label>
        <textarea
          id="paste"
          className="field-area"
          value={paste}
          onChange={(e) => setPaste(e.target.value)}
          placeholder="Paste the treatment menu, Instagram caption, or consult notes."
        />
        <button type="button" className="btn-primary mt-4" onClick={run} disabled={!paste.trim()}>
          Read this copy
        </button>
      </div>
      <div className="panel p-5 md:p-6">
        <p className="eyebrow">Quoted fills</p>
        {fills.length === 0 ? (
          <p className="mt-3 text-sm leading-relaxed text-(--ink-soft)">
            Nothing extracted yet. An empty desk is a valid state. Nothing is inferred on your behalf.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {fills.map((f) => (
              <li key={f.key} className="border-b border-(--rule) pb-3">
                <p className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-(--oxblood)">
                  {f.key} · {f.confidence}
                </p>
                <p className="mt-1 text-sm">{f.value}</p>
                {f.quote ? <p className="mt-1 text-sm italic text-(--ink-soft)">“{f.quote}”</p> : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export function FullEvaluate({ evaluation }: { evaluation: ReturnType<typeof evaluate> }) {
  const input = useDesk((s) => s.input);
  const setInput = useDesk((s) => s.setInput);
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <div className="panel grid gap-4 p-5 md:p-6">
        <SectionHead
          kicker="The rest of the room"
          title="Add what four questions could not cover"
          lede="Identity is the fast path. These fields are how the night is owned, how tools are processed, and what the copy is asking you to feel."
        />
        <Field id="venueName" label="Venue name (optional, stays in this browser)">
          <input
            id="venueName"
            className="field-input"
            value={input.venueName}
            onChange={(e) => setInput({ venueName: e.target.value })}
          />
        </Field>
        <Field id="region" label="Jurisdiction">
          <select
            id="region"
            className="field-select"
            value={input.region}
            onChange={(e) => setInput({ region: e.target.value as DeskInput["region"] })}
          >
            {REGIONS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </Field>
        <Field id="license" label="License / credential as printed">
          <input
            id="license"
            className="field-input"
            value={input.license}
            onChange={(e) => setInput({ license: e.target.value })}
            placeholder="NP, RN, PA-C, MD…"
          />
        </Field>
        <Field id="supervision" label="Oversight on site">
          <input
            id="supervision"
            className="field-input"
            value={input.supervision === "Asked, no answer given" ? "" : input.supervision}
            onChange={(e) => setInput({ supervision: e.target.value })}
            placeholder="Named director on site / available by phone"
          />
          <DontKnow onPick={(v) => setInput({ supervision: v })} />
        </Field>
        <Field id="sanitation" label="Sanitation signals">
          <input
            id="sanitation"
            className="field-input"
            value={input.sanitation}
            onChange={(e) => setInput({ sanitation: e.target.value })}
            placeholder="Single-use tips opened in front of me"
          />
        </Field>
        <Field id="afterHours" label="After-hours ownership">
          <input
            id="afterHours"
            className="field-input"
            value={input.afterHours === "Asked, no answer given" ? "" : input.afterHours}
            onChange={(e) => setInput({ afterHours: e.target.value })}
            placeholder="Named licensee cell line"
          />
          <DontKnow onPick={(v) => setInput({ afterHours: v })} />
        </Field>
        <Field id="consent" label="Consent">
          <input
            id="consent"
            className="field-input"
            value={input.consent}
            onChange={(e) => setInput({ consent: e.target.value })}
            placeholder="Written form before payment"
          />
        </Field>
        <Field id="price" label="Stated price">
          <input
            id="price"
            className="field-input"
            value={input.price}
            onChange={(e) => setInput({ price: e.target.value })}
            placeholder="$13 per unit"
            inputMode="decimal"
            autoComplete="off"
          />
        </Field>
        <Field id="series" label="Series / membership / prepay">
          <input
            id="series"
            className="field-input"
            value={input.seriesPressure}
            onChange={(e) => setInput({ seriesPressure: e.target.value })}
          />
        </Field>
        <Field id="marketing" label="Marketing copy (for the claim decoder)">
          <textarea
            id="marketing"
            className="field-area"
            value={input.marketing}
            onChange={(e) => setInput({ marketing: e.target.value })}
          />
        </Field>
      </div>
      <div className="space-y-4">
        <ResultCard evaluation={evaluation} />
        <div className="panel divide-y divide-(--rule)">
          {evaluation.signals.map((s) => (
            <div key={s.id} className="px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{s.label}</p>
                <Chip state={s.state} />
              </div>
              <p className="mt-2 text-sm leading-relaxed text-(--ink-soft)">{s.reading}</p>
              <Why title="Why this field">
                <p>{s.why}</p>
                <p className="mt-2">{s.ask}</p>
              </Why>
            </div>
          ))}
        </div>
        {evaluation.claims.length > 0 ? (
          <div className="panel p-5">
            <p className="eyebrow">Claims in the copy</p>
            <ul className="mt-4 space-y-3">
              {evaluation.claims.map((c) => (
                <li key={c.category}>
                  <p className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-(--oxblood)">
                    {c.severity} · {c.category}
                  </p>
                  <p className="mt-1 text-sm italic">“{c.phrase}”</p>
                  <p className="mt-1 text-sm text-(--ink-soft)">{c.hides}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <EditorialHints text={`${input.marketing} ${input.menuLine} ${input.product}`} />
      </div>
    </div>
  );
}

export function WhatIfPanel({ evaluation }: { evaluation: ReturnType<typeof evaluate> }) {
  const input = useDesk((s) => s.input);
  const replaceInput = useDesk((s) => s.replaceInput);
  const rows = useMemo(() => whatIfAll(input, evaluation), [input, evaluation]);
  if (!isDeskActive(input)) {
    return (
      <EmptyDesk
        title="Nothing to pressure-test yet"
        body="Load a demo or fill four fields. Then ask what would change the answer if one gap closed."
      />
    );
  }
  return (
    <div>
      <SectionHead
        kicker="What if"
        title="What would change this answer?"
        lede="Each row is a single hypothetical fill. The desk does not apply it until you say so. This is sensitivity, not a recommendation."
      />
      <div className="mb-6">
        <ResultCard evaluation={evaluation} compact />
      </div>
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full border border-(--rule) text-left text-sm">
          <caption className="sr-only">Sensitivity of the named-score to filling each open field</caption>
          <thead className="bg-(--bone) font-mono text-[0.625rem] uppercase tracking-[0.14em] text-(--ink-soft)">
            <tr>
              <th className="px-3 py-3">If this were named</th>
              <th className="px-3 py-3">Named now</th>
              <th className="px-3 py-3">Named after</th>
              <th className="px-3 py-3">Change</th>
              <th className="px-3 py-3">Reading</th>
              <th className="px-3 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.field} className="border-t border-(--rule)">
                <td className="px-3 py-3 align-top">
                  <p className="font-medium">{row.label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-(--ink-soft)">{row.proposed}</p>
                </td>
                <td className="px-3 py-3 tabular-nums">{row.placeBefore}</td>
                <td className="px-3 py-3 tabular-nums">{row.placeAfter}</td>
                <td className="px-3 py-3 tabular-nums text-(--oxblood)">+{row.delta}</td>
                <td className="px-3 py-3">{row.postureAfter}</td>
                <td className="px-3 py-3">
                  <button
                    type="button"
                    className="btn-quiet"
                    onClick={() => {
                      replaceInput(applyProbe(input, row.field));
                      track("whatif_used", row.field);
                    }}
                  >
                    Apply
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-3 md:hidden">
        {rows.map((row) => (
          <article key={row.field} className="panel p-4">
            <p className="font-medium">{row.label}</p>
            <p className="mt-1 text-sm text-(--ink-soft)">{row.proposed}</p>
            <p className="mt-3 font-mono text-xs uppercase tracking-[0.12em] text-(--oxblood)">
              {row.placeBefore} → {row.placeAfter} · +{row.delta}
            </p>
            <button
              type="button"
              className="btn-quiet mt-3"
              onClick={() => {
                replaceInput(applyProbe(input, row.field));
                track("whatif_used", row.field);
              }}
            >
              Apply this hypothetical
            </button>
          </article>
        ))}
      </div>
      {evaluation.weakest ? (
        <p className="mt-4 text-sm leading-relaxed text-(--ink-soft)">
          Weakest assumption on this desk: <strong>{evaluation.weakest.label}</strong>. {evaluation.weakest.reading}
        </p>
      ) : null}
    </div>
  );
}

export function ComparePanel() {
  const saved = useDesk((s) => s.saved);
  const input = useDesk((s) => s.input);
  const saveNamed = useDesk((s) => s.saveNamed);
  const compareIds = useDesk((s) => s.compareIds);
  const toggleCompare = useDesk((s) => s.toggleCompare);
  const loadSaved = useDesk((s) => s.loadSaved);
  const loadDemo = useDesk((s) => s.loadDemo);
  const pinSaved = useDesk((s) => s.pinSaved);
  const deleteSaved = useDesk((s) => s.deleteSaved);

  const currentEv = useMemo(() => evaluate(input), [input]);
  const selected = saved.filter((s) => compareIds.includes(s.id));
  const columns = [
    { id: "current", name: input.venueName || "This desk", ev: currentEv },
    ...selected.map((s) => ({ id: s.id, name: s.name, ev: evaluate(s.input) })),
  ].slice(0, 5);

  return (
    <div>
      <SectionHead
        kicker="Compare venues"
        title="Up to five settings, disclosure only"
        lede="Comparison measures how much of the room is named — never safety, quality, or who you should book. Highlighted cells are the differences."
      />
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          className="btn-quiet"
          onClick={() => {
            saveNamed(input.venueName || input.menuLine || "This desk");
            track("compare_used");
          }}
        >
          Save current to compare
        </button>
        {DEMOS.slice(0, 4).map((d) => (
          <button key={d.id} type="button" className="chip" onClick={() => loadDemo(d.id)}>
            Load {d.title.split("·")[0]}
          </button>
        ))}
      </div>
      {saved.length > 0 ? (
        <div className="mb-6 flex flex-wrap gap-2">
          {saved.map((s) => (
            <div key={s.id} className="flex items-center gap-1">
              <button
                type="button"
                aria-pressed={compareIds.includes(s.id)}
                className={cn("chip", compareIds.includes(s.id) && "chip-closed")}
                onClick={() => toggleCompare(s.id)}
              >
                {s.pinned ? "Pinned · " : ""}
                {s.name}
              </button>
              <button type="button" className="chip" onClick={() => pinSaved(s.id)} aria-label={`Pin ${s.name}`}>
                Pin
              </button>
              <button type="button" className="chip" onClick={() => deleteSaved(s.id)} aria-label={`Delete ${s.name}`}>
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="mb-6 text-sm text-(--ink-soft)">
          Save named settings to hold them side by side. Demos can be loaded onto the desk first.
        </p>
      )}

      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full border border-(--rule) text-sm">
          <caption className="sr-only">Disclosure comparison across saved settings</caption>
          <thead className="bg-(--bone)">
            <tr>
              <th className="px-3 py-3 text-left font-mono text-[0.625rem] uppercase tracking-[0.14em]">Signal</th>
              {columns.map((c) => (
                <th key={c.id} className="px-3 py-3 text-left">
                  {c.name}
                  <div className="mt-1 font-mono text-[0.625rem] uppercase tracking-[0.12em] text-(--oxblood)">
                    Named {c.ev.place} · {c.ev.posture.label}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentEv.signals.map((signal) => {
              const states = columns.map((c) => c.ev.signals.find((x) => x.id === signal.id)?.state);
              const differs = new Set(states).size > 1;
              return (
                <tr key={signal.id} className={cn("border-t border-(--rule)", differs && "bg-(--oxblood-tint)")}>
                  <td className="px-3 py-3 font-medium">{signal.label}</td>
                  {columns.map((c) => {
                    const s = c.ev.signals.find((x) => x.id === signal.id);
                    return (
                      <td key={c.id} className="px-3 py-3 align-top">
                        {s ? <Chip state={s.state} /> : "—"}
                        <p className="mt-2 text-xs leading-relaxed text-(--ink-soft)">{s?.reading}</p>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 md:hidden">
        {columns.map((c) => (
          <article key={c.id} className="panel p-4">
            <p className="eyebrow">{c.name}</p>
            <p className="mt-1 font-display text-2xl">{c.ev.posture.label}</p>
            <div className="mt-3">
              <Meter value={c.ev.place} label="Named" />
            </div>
            <ul className="mt-3 space-y-2">
              {c.ev.signals.map((s) => (
                <li key={s.id} className="flex items-start justify-between gap-2 text-sm">
                  <span>{s.label}</span>
                  <Chip state={s.state} />
                </li>
              ))}
            </ul>
            {c.id !== "current" ? (
              <button type="button" className="btn-quiet mt-4" onClick={() => loadSaved(c.id)}>
                Open on desk
              </button>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}

export function PrepPanel({ evaluation }: { evaluation: ReturnType<typeof evaluate> }) {
  const input = useDesk((s) => s.input);
  const questions = useMemo(() => consultQuestions(input, evaluation), [input, evaluation]);
  const [copied, setCopied] = useState(false);
  const text = questions.map((q, i) => `${i + 1}. ${q.text}`).join("\n");
  const boards = boardsForRegion(input.region);
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <div>
        <SectionHead
          kicker="Consult prep"
          title="Questions worth saying out loud"
          lede="A competent consultation should tolerate these without treating curiosity as disloyalty. Write the answers down before you leave."
        />
        <ol className="space-y-4">
          {questions.map((q, i) => (
            <li key={q.id} className="panel p-4">
              <p className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-(--oxblood)">
                {String(i + 1).padStart(2, "0")} · {q.group} · {q.priority}
              </p>
              <p className="mt-2 text-base leading-relaxed">{q.text}</p>
              <p className="mt-2 text-sm text-(--ink-soft)">{q.why}</p>
            </li>
          ))}
        </ol>
        <button
          type="button"
          className="btn-quiet mt-4"
          onClick={async () => {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
          }}
        >
          <Copy className="mr-2 size-3.5" aria-hidden="true" />
          {copied ? "Copied" : "Copy questions"}
        </button>
        <p className="sr-only" role="status" aria-live="polite">
          {copied ? "Questions copied to clipboard" : ""}
        </p>
      </div>
      <aside className="space-y-4">
        <div className="panel h-fit p-5">
          <p className="eyebrow">Check the license</p>
          <h3 className="mt-2 font-display text-2xl">Boards for this jurisdiction</h3>
          <p className="mt-3 text-sm leading-relaxed text-(--ink-soft)">
            A lookup is not a verdict. You still need the performer’s name and license type. The desk never searches on
            your behalf.
          </p>
          <ul className="mt-4 space-y-3">
            {boards.map((b) => (
              <li key={b.id}>
                <ExtLink
                  className="inline-flex min-h-11 items-center text-sm underline decoration-(--oxblood)/40 underline-offset-2"
                  href={b.url}
                  onClick={() => track("board_opened", b.id)}
                >
                  {b.name}
                </ExtLink>
                <p className="mt-1 text-xs leading-relaxed text-(--ink-soft)">{b.note}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="panel h-fit p-5">
          <p className="eyebrow">Handoff</p>
          <h3 className="mt-2 font-display text-2xl">Carry this into the Skincare Desk</h3>
          <p className="mt-3 text-sm leading-relaxed text-(--ink-soft)">
            The consultation receipt lives next door. It scores readiness to spend — identity, risks, after-hours owner —
            without this desk diagnosing you.
          </p>
          <pre className="mt-4 overflow-x-auto bg-(--bone) p-3 font-mono text-[0.7rem] leading-relaxed">
            {JSON.stringify(
              {
                version: 1,
                from: "spa-intelligence",
                service: input.menuLine,
                product: input.product,
                performer: input.performer,
                license: input.license,
                venue: input.venue,
                region: input.region,
                unresolved: evaluation.failClosed.map((s) => s.label),
              },
              null,
              2,
            )}
          </pre>
          <ExtLink className="btn-primary mt-4 inline-flex" href={EDITORIAL.skincareConsult}>
            Open consultation receipt
          </ExtLink>
        </div>
      </aside>
    </div>
  );
}

export function DecoderPanel() {
  const [text, setText] = useState("");
  const hits = useMemo(() => decodeClaims(text), [text]);
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="panel p-5 md:p-6">
        <SectionHead
          kicker="Claim decoder"
          title="Paste the exact wording"
          lede="The phrase looks finished. The evidence may still be getting dressed. This decoder separates the literal claim from the implied promise."
        />
        <label className="field-label" htmlFor="claim">
          Marketing sentence
        </label>
        <textarea
          id="claim"
          className="field-area"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => {
            if (text.trim()) track("decode_used");
          }}
          placeholder="Clinically proven glow. FDA-cleared. Guaranteed inches."
        />
      </div>
      <div className="panel p-5 md:p-6">
        {text.trim() === "" ? (
          <EmptyDesk title="No sentence on the desk" body="Copy one line from the menu, package, or provider page." />
        ) : hits.length === 0 ? (
          <div>
            <p className="eyebrow">Quiet copy</p>
            <p className="mt-3 text-sm leading-relaxed">
              No flagged patterns in this wording. Quiet copy is not proof. Identity (product, person, license) still
              has to be named on the four-question path.
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {hits.map((h) => (
              <li key={h.category} className="border-b border-(--rule) pb-4">
                <Chip state={h.severity === "hard" ? "fail-closed" : h.severity === "flag" ? "partial" : "info"} />
                <p className="mt-2 font-medium">{h.category}</p>
                <p className="mt-1 text-sm italic text-(--ink-soft)">“{h.phrase}”</p>
                <p className="mt-2 text-sm">Hides: {h.hides}</p>
                <p className="mt-1 text-sm">Ask: {h.ask}</p>
              </li>
            ))}
          </ul>
        )}
        <ExtLink
          className="mt-6 inline-flex min-h-11 items-center text-sm underline underline-offset-2"
          href={EDITORIAL.claimDecoder}
        >
          Editorial companion → how to take a claim apart
        </ExtLink>
      </div>
    </div>
  );
}

export function LibraryPanel() {
  const [q, setQ] = useState("");
  const region = useDesk((s) => s.input.region);
  const setInput = useDesk((s) => s.setInput);
  const recent = useDesk((s) => s.recentCatalog);
  const viewCatalog = useDesk((s) => s.viewCatalog);
  const hits = q.trim().length > 1 ? searchCatalog(q, 18) : [];
  const n = q.trim().toLowerCase();
  const services =
    hits.length > 0
      ? hits.filter((h) => h.kind === "service").map((h) => h.record)
      : SERVICES.filter(
          (s) => !n || s.name.toLowerCase().includes(n) || s.aliases.some((a) => a.includes(n)),
        );
  const products =
    hits.length > 0
      ? hits.filter((h) => h.kind === "product").map((h) => h.record)
      : PRODUCTS.filter(
          (s) => !n || s.name.toLowerCase().includes(n) || s.aliases.some((a) => a.includes(n)),
        );
  const boards = boardsForRegion(region);
  const recentServices = SERVICES.filter((s) => recent.includes(s.id));

  return (
    <div>
      <SectionHead
        kicker="Reference library"
        title="Quote the menu, not the mood"
        lede="The catalog holds common lines across spa, med-spa, clinic and studio menus. It is a naming aid. It does not rank brands."
      />
      <label className="field-label" htmlFor="libq">
        Search services and products
      </label>
      <input
        id="libq"
        className="field-input mb-4 max-w-lg"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="botox, hydrafacial, peel, iv, baby botox…"
        type="search"
        enterKeyHint="search"
        autoComplete="off"
      />
      <p className="sr-only" aria-live="polite">
        {q.trim().length > 1 ? `${services.length} services and ${products.length} products` : ""}
      </p>
      <p className="mb-6 text-xs leading-relaxed text-(--ink-soft)">
        {CATALOG_PROVENANCE.source} · checked {CATALOG_PROVENANCE.checked} · {CATALOG_PROVENANCE.freshness}.{" "}
        {CATALOG_PROVENANCE.method}{" "}
        <ExtLink className="underline" href={CATALOG_PROVENANCE.sourceUrl}>
          Source
        </ExtLink>
        .
      </p>
      {recentServices.length > 0 && !q ? (
        <p className="mb-4 text-sm text-(--ink-soft)">
          Recently opened: {recentServices.map((s) => s.name).join(" · ")}
        </p>
      ) : null}
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <p className="eyebrow">Services · {services.length}</p>
          <ul className="mt-4 divide-y divide-(--rule) border border-(--rule)">
            {services.slice(0, 24).map((s) => (
              <li key={s.id} className="p-4">
                <button
                  type="button"
                  className="min-h-11 w-full text-left"
                  onClick={() => {
                    viewCatalog(s.id);
                    setInput({ menuLine: s.name, serviceClass: s.serviceClass });
                  }}
                >
                  <p className="font-medium">{s.name}</p>
                  <p className="mt-1 font-mono text-[0.625rem] uppercase tracking-[0.12em] text-(--oxblood)">
                    {s.group} · {s.serviceClass}
                  </p>
                  <p className="mt-2 text-sm text-(--ink-soft)">{s.silent}</p>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow">Products and platforms · {products.length}</p>
          <ul className="mt-4 divide-y divide-(--rule) border border-(--rule)">
            {products.slice(0, 24).map((s) => (
              <li key={s.id} className="p-4">
                <button
                  type="button"
                  className="min-h-11 w-full text-left"
                  onClick={() => {
                    viewCatalog(s.id);
                    setInput({ product: s.name });
                  }}
                >
                  <p className="font-medium">{s.name}</p>
                  <p className="mt-1 font-mono text-[0.625rem] uppercase tracking-[0.12em] text-(--oxblood)">
                    {s.group} · {s.rx ? "prescription-adjacent" : "ask the indication"}
                  </p>
                  <p className="mt-2 text-sm text-(--ink-soft)">
                    {s.silent} {s.ask}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="panel mt-8 p-5">
        <p className="eyebrow">License glossary</p>
        <p className="mt-2 text-sm text-(--ink-soft)">
          A title is marketing. A license is checkable against the state board. First use:{" "}
          {LICENSE_GLOSSARY.map((g) => `${g.abbr} (${g.expand})`).join(", ")}.
        </p>
      </div>
      <div className="panel mt-6 p-5">
        <p className="eyebrow">Board lookups</p>
        <h3 className="mt-2 font-display text-2xl">Where to check a license</h3>
        <p className="mt-2 text-sm text-(--ink-soft)">
          {BOARD_PROVENANCE.method} Checked {BOARD_PROVENANCE.checked}. <FreshnessBadge state={BOARD_PROVENANCE.freshness} />
        </p>
        <label className="field-label mt-4" htmlFor="board-region">
          Jurisdiction for this lookup
        </label>
        <select
          id="board-region"
          className="field-select max-w-md"
          value={region}
          onChange={(e) => setInput({ region: e.target.value as DeskInput["region"] })}
        >
          {REGIONS.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label}
            </option>
          ))}
        </select>
        <ul className="mt-4 space-y-3">
          {boards.map((b) => (
            <li key={b.id} className="border-b border-(--rule) pb-3">
              <ExtLink
                className="inline-flex min-h-11 items-center text-sm underline decoration-(--oxblood)/40 underline-offset-2"
                href={b.url}
                onClick={() => track("board_opened", b.id)}
              >
                {b.name}
              </ExtLink>
              <p className="mt-1 text-xs leading-relaxed text-(--ink-soft)">{b.note}</p>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-6">
        <p className="eyebrow">Setting types</p>
        <ul className="mt-3 grid gap-3 md:grid-cols-2">
          {VENUES.map((v) => (
            <li key={v.id} className="panel p-4">
              <p className="font-medium">{v.label}</p>
              <p className="mt-1 text-sm text-(--ink-soft)">{v.note}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function PacketPanel({ evaluation }: { evaluation: ReturnType<typeof evaluate> }) {
  const input = useDesk((s) => s.input);
  const questions = consultQuestions(input, evaluation);
  const clearDesk = useDesk((s) => s.clearDesk);
  const duplicateCurrent = useDesk((s) => s.duplicateCurrent);
  const dated = new Date().toLocaleDateString();
  return (
    <div>
      <div className="no-print mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          className="btn-primary"
          onClick={() => {
            track("export_used");
            window.print();
          }}
        >
          <Printer className="mr-2 size-3.5" aria-hidden="true" />
          Print packet
        </button>
        <button type="button" className="btn-quiet" onClick={() => duplicateCurrent()}>
          Duplicate setting
        </button>
        <button
          type="button"
          className="btn-quiet"
          onClick={() => {
            if (confirm("Clear this venue from the desk? Saved settings are kept.")) clearDesk();
          }}
        >
          Clear this venue
        </button>
      </div>
      <article className="panel p-6 md:p-10" id="packet">
        <p className="eyebrow">Vanity or Vice · Spa Intelligence</p>
        <h2 className="mt-2 font-display text-4xl leading-none">Decision packet</h2>
        <p className="mt-2 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-(--ink-soft)">
          {dated} · education only · not a diagnosis · not a ranking
        </p>
        <div className="mt-6">
          <ResultCard evaluation={evaluation} />
        </div>
        <h3 className="mt-8 font-display text-2xl">Residual questions</h3>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed">
          {questions.slice(0, 8).map((q) => (
            <li key={q.id}>{q.text}</li>
          ))}
        </ol>
        <h3 className="mt-8 font-display text-2xl">What this packet refuses</h3>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-(--ink-soft)">
          <li>No diagnosis, candidacy, or clinical clearance.</li>
          <li>No provider ranking and no outcome promises.</li>
          <li>Comparison measures disclosure, never safety or quality.</li>
          <li>Unknowns stay visible whenever identity is unresolved.</li>
        </ul>
      </article>
    </div>
  );
}

export function MethodPanel() {
  const [events, setEvents] = useState<{ name: string; count: number }[]>([]);
  useEffect(() => {
    setEvents(funnelSummary());
  }, []);
  return (
    <div className="max-w-3xl">
      <SectionHead
        kicker="Method"
        title="How the desk reads a setting"
        lede="Technical vocabulary lives here so the primary screens can stay in plain language."
      />
      <div className="space-y-6 text-sm leading-relaxed">
        <p>
          Spa Intelligence is a disclosure instrument. It does not diagnose, rank providers, clear candidacy, or
          predict results. It scores how much of a setting is actually named, and how much of the copy is asking you
          to feel something instead.
        </p>
        <dl className="grid gap-4">
          <div className="panel p-4">
            <dt className="eyebrow">Named (Place)</dt>
            <dd className="mt-2">
              Weighted signals: menu identity, setting type, jurisdiction, performer + license, product/device,
              supervision, sanitation, after-hours ownership, consent. Known earns the weight; partial earns 45%;
              unnamed and refused earn none.
            </dd>
          </div>
          <div className="panel p-4">
            <dt className="eyebrow">Marketing pressure (Promise)</dt>
            <dd className="mt-2">
              Claim load in the copy as written, reduced when a product and a license are actually named. Not a quality
              score.
            </dd>
          </div>
          <div className="panel p-4">
            <dt className="eyebrow">Gap</dt>
            <dd className="mt-2">Marketing pressure minus named. A large gap is a literacy finding, not a ranking.</dd>
          </div>
          <div className="panel p-4">
            <dt className="eyebrow">Unnamed · fail closed</dt>
            <dd className="mt-2">
              When identity is missing, the desk does not invent it. “They wouldn’t answer” is recorded as worse than
              silence, because it is.
            </dd>
          </div>
        </dl>
        <p>
          Catalog records carry provenance: source, checked date, freshness. Board lookup links point at public
          directories. A listed URL is not a finding about any named person.
        </p>
        <p>
          <ExtLink className="underline decoration-(--oxblood)/40 underline-offset-2" href={EDITORIAL.spa}>
            Editorial method on Vanity or Vice
          </ExtLink>
          {" · "}
          <ExtLink className="underline decoration-(--oxblood)/40 underline-offset-2" href={EDITORIAL.disclaimer}>
            Medical disclaimer
          </ExtLink>
          {" · "}
          <ExtLink className="underline decoration-(--oxblood)/40 underline-offset-2" href={EDITORIAL.standards}>
            Editorial standards
          </ExtLink>
        </p>
        <div className="panel p-4">
          <p className="eyebrow">This-browser activity</p>
          <p className="mt-2 text-(--ink-soft)">
            Counts stay on this device. Nothing is sent anywhere. Use them only as a reminder of what you already did.
          </p>
          {events.length === 0 ? (
            <p className="mt-3">No events stored yet.</p>
          ) : (
            <ul className="mt-3 space-y-1 font-mono text-xs uppercase tracking-[0.12em]">
              {events.map((e) => (
                <li key={e.name}>
                  {e.name.replace(/_/g, " ")} · {e.count}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
