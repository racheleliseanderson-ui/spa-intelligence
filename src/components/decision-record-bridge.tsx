import { useEffect, useState } from "react";
import {
  acceptDecisionHandoff,
  clearDecisionHandoffHash,
  parseDecisionHandoffHash,
  saveDecisionRecord,
  setDecisionContext,
  type DecisionHandoffEnvelope,
} from "@/lib/decision-record";
import { useDesk } from "@/lib/store";
import { decisionRecordForSpa, spaDecisionHandoffUrl } from "@/lib/spa-decision-record";

export function DecisionRecordBridge() {
  const [incoming, setIncoming] = useState<DecisionHandoffEnvelope | null>(null);
  const input = useDesk((s) => s.input);

  useEffect(() => {
    setIncoming(parseDecisionHandoffHash(window.location.hash));
  }, []);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.dataset.vvNoRecord === "1") return;
      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (!["makeup.vanityvice.blog", "skincare.vanityvice.blog"].includes(url.hostname)) return;
      const original = anchor.href;
      anchor.href = spaDecisionHandoffUrl(url.toString(), input);
      window.setTimeout(() => {
        if (anchor.isConnected) anchor.href = original;
      }, 0);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [input]);

  if (!incoming) return null;

  const accept = () => {
    let record = acceptDecisionHandoff(incoming, "spa");
    const currentInput = useDesk.getState().input;
    record = setDecisionContext(record, "spa", {
      appState: {
        input: { ...currentInput },
        importedFrom: incoming.source.app,
        importedAt: incoming.source.at,
      },
    });
    saveDecisionRecord(record);
    decisionRecordForSpa(currentInput);
    clearDecisionHandoffHash();
    setIncoming(null);
  };

  const ignore = () => {
    clearDecisionHandoffHash();
    setIncoming(null);
  };

  return (
    <section className="sticky top-0 z-[70] border-b border-(--bronze)/45 bg-(--bone)/95 px-5 py-4 backdrop-blur md:px-8" aria-labelledby="incoming-spa-record">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-4xl">
          <p className="eyebrow">Incoming Vanity Decision Record</p>
          <h2 id="incoming-spa-record" className="mt-2 font-display text-2xl md:text-3xl">
            Keep the decision history; do not turn it into candidacy.
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-(--ink-soft)">
            Source: {incoming.source.app} · {new Date(incoming.source.at).toLocaleString()}. Spa can retain the concern,
            constraints, evidence and prior decisions, but it will not infer a treatment, provider quality or clinical
            clearance from them.
          </p>
          <dl className="mt-4 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <Line label="Concern" value={incoming.record.concern || "not named"} />
            <Line label="Goals" value={incoming.record.goals.join(", ") || "none named"} />
            <Line label="Constraints" value={incoming.record.constraints.slice(0, 6).join(" · ") || "none recorded"} />
            <Line label="History" value={`${incoming.record.history.length} prior entries`} />
          </dl>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button type="button" className="btn-primary" onClick={accept}>
            Keep this record
          </button>
          <button type="button" className="btn-quiet" onClick={ignore}>
            Continue without importing
          </button>
        </div>
      </div>
    </section>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-(--oxblood)">{label}</dt>
      <dd className="mt-1 text-(--ink-soft)">{value}</dd>
    </div>
  );
}
