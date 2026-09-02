import { useId } from "react";
import { Chip, ExtLink, Meter, Why } from "@/components/bits";
import { EvidenceReceiptCard } from "@/components/evidence-receipt";
import { EDITORIAL } from "@/lib/data/editorial";
import { track } from "@/lib/analytics";
import type { EvidenceReceipt } from "@/lib/decision-record";
import type { Evaluation } from "@/lib/engine/types";

export function ResultCard({
  evaluation,
  compact = false,
  layers = true,
}: {
  evaluation: Evaluation;
  compact?: boolean;
  layers?: boolean;
}) {
  const headingId = useId();
  const { posture, place, promise, gap, burden, nextSteps, weakest, identityLine, costHorizon } = evaluation;
  const receipt: EvidenceReceipt = {
    id: "spa-reasoning-v1",
    claim: identityLine || posture.label,
    source: "Setting/menu text on this desk + Vanity or Vice · Spa Intelligence disclosure rules",
    publishedAt: "2026-09-01",
    checkedAt: "2026-09-01",
    exactObjectMatch: "setting",
    confidence: place >= 75 ? "high" : evaluation.failClosed.length >= 4 ? "limited" : "moderate",
    uncertainty: evaluation.unknowns.length
      ? evaluation.unknowns
      : ["Disclosure remains distinct from provider quality, safety, candidacy and outcome."],
    commercialContext: "mixed",
    correctionState: "current",
    note: "The venue or menu is a commercial source; the desk's disclosure rules are editorial. Neither is converted into a clinical verdict.",
  };
  return (
    <article className="panel overflow-hidden" aria-labelledby={headingId}>
      <div className="border-b border-(--rule) bg-(--bone) px-5 py-4 md:px-6">
        <p className="eyebrow">{posture.key === "empty" ? "Awaiting a setting" : "What you should know"}</p>
        <h2 id={headingId} className="mt-2 font-display text-3xl leading-[1.05] tracking-[-0.03em] md:text-4xl">
          {posture.label}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-(--ink-soft)">{posture.line}</p>
      </div>

      <div className="grid gap-px bg-(--rule) md:grid-cols-3">
        <div className="bg-(--parchment) p-5">
          <p className="eyebrow">The answer</p>
          <p className="mt-2 text-sm leading-relaxed">{identityLine}</p>
        </div>
        <div className="bg-(--parchment) p-5">
          <p className="eyebrow">The important caveat</p>
          <p className="mt-2 text-sm leading-relaxed">
            {weakest
              ? `${weakest.label}: ${weakest.reading}`
              : "No single field is carrying the uncertainty. Verification remains."}
          </p>
        </div>
        <div className="bg-(--parchment) p-5">
          <p className="eyebrow">What to do next</p>
          <p className="mt-2 text-sm leading-relaxed">{posture.next}</p>
        </div>
      </div>

      {!compact ? (
        <div className="border-b border-(--rule) px-5 py-5 md:px-6">
          <EvidenceReceiptCard receipt={receipt} />
        </div>
      ) : null}

      <div className="grid gap-6 p-5 md:grid-cols-3 md:p-6">
        <Meter value={place} label="Named (place)" />
        <Meter value={promise} label="Marketing pressure" />
        <Meter value={Math.max(0, gap)} label="Gap · marketing minus named" />
      </div>

      <div className="flex flex-wrap items-center gap-2 px-5 pb-4 md:px-6">
        <Chip state={posture.key === "resolved" ? "known" : posture.key === "empty" ? "info" : "fail-closed"}>
          {burden.band} burden
        </Chip>
        <span className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-(--ink-soft)">
          {evaluation.failClosed.length} unnamed · {evaluation.known.length} named · {evaluation.claims.length} claims
        </span>
      </div>

      {!compact ? (
        <div className="space-y-4 border-t border-(--rule) px-5 py-5 md:px-6">
          <div>
            <p className="eyebrow">Why this reading</p>
            <ul className="mt-3 space-y-2">
              {nextSteps.slice(0, 4).map((step) => (
                <li key={step} className="flex gap-2.5 text-sm leading-relaxed">
                  <span className="num shrink-0 text-(--oxblood)">·</span>
                  {step}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-sm leading-relaxed text-(--ink-soft)">
            {costHorizon.stated}
            {costHorizon.annualHint ? ` ${costHorizon.annualHint}` : ""} {costHorizon.reading}
          </p>
          {layers ? (
            <>
              <details
                className="border-t border-(--rule) pt-3"
                onToggle={(e) => {
                  if ((e.currentTarget as HTMLDetailsElement).open) track("result_expanded");
                }}
              >
                <summary className="cursor-pointer font-mono text-[0.625rem] uppercase tracking-[0.14em] text-(--oxblood)">
                  Evidence · what produced this
                </summary>
                <ul className="mt-3 space-y-3">
                  {evaluation.signals.map((s) => (
                    <li key={s.id}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-medium">{s.label}</p>
                        <Chip state={s.state} />
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-(--ink-soft)">{s.reading}</p>
                    </li>
                  ))}
                </ul>
              </details>
              <Why title="Method · why Named, marketing, and gap — not a ranking">
                <p>
                  Named (Place) is how much of the setting is actually written down and checkable. Marketing pressure
                  (Promise) is how much the copy is asking you to feel. Gap is marketing minus named. None of these is a
                  quality score, a safety score, or a recommendation.{" "}
                  <ExtLink
                    className="underline decoration-(--oxblood)/40 underline-offset-2"
                    href={EDITORIAL.spa}
                  >
                    Method on Vanity or Vice
                  </ExtLink>
                  .
                </p>
              </Why>
            </>
          ) : (
            <Why title="Why Named, marketing, and gap — not a ranking">
              <p>
                Named is how much of the setting is checkable. Marketing pressure is how much the copy is asking you to
                feel. Gap is the difference. Not a ranking.{" "}
                <ExtLink
                  className="underline decoration-(--oxblood)/40 underline-offset-2"
                  href={EDITORIAL.spa}
                >
                  Method
                </ExtLink>
                .
              </p>
            </Why>
          )}
        </div>
      ) : null}
    </article>
  );
}

export function MiniResult({ evaluation, kicker }: { evaluation: Evaluation; kicker: string }) {
  return (
    <article className="panel h-full p-5 text-left">
      <p className="eyebrow">{kicker}</p>
      <h3 className="mt-2 font-display text-2xl leading-tight">{evaluation.posture.label}</h3>
      <p className="mt-2 text-sm leading-relaxed text-(--ink-soft)">{evaluation.identityLine}</p>
      <div className="mt-4">
        <Meter value={evaluation.place} label="Named" />
      </div>
      <p className="mt-4 text-sm leading-relaxed">{evaluation.posture.next}</p>
    </article>
  );
}
