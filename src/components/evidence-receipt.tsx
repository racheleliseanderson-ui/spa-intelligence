import type { EvidenceReceipt } from "@/lib/decision-record";

export function EvidenceReceiptCard({ receipt }: { receipt: EvidenceReceipt }) {
  return (
    <aside className="border border-(--rule) bg-(--parchment) p-4" aria-label="Evidence receipt">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-mono text-[0.625rem] uppercase tracking-[0.18em] text-(--oxblood)">Evidence receipt</p>
        <p className="font-mono text-[0.625rem] text-(--ink-soft)">checked {receipt.checkedAt}</p>
      </div>
      <p className="mt-3 text-sm font-semibold text-(--ink)">{receipt.claim}</p>
      <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-2">
        <ReceiptRow label="Source" value={receipt.source} />
        <ReceiptRow label="Object match" value={receipt.exactObjectMatch} />
        <ReceiptRow label="Confidence" value={receipt.confidence} />
        <ReceiptRow label="Commercial context" value={receipt.commercialContext} />
        <ReceiptRow label="Correction state" value={receipt.correctionState} />
        <ReceiptRow label="Source date" value={receipt.publishedAt || "not supplied"} />
      </dl>
      <div className="mt-4 border-t border-(--rule) pt-3">
        <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-(--ink-soft)">Uncertainty</p>
        <p className="mt-1 text-xs leading-relaxed text-(--ink-soft)">
          {receipt.uncertainty.length ? receipt.uncertainty.join(" ") : "No additional uncertainty recorded."}
        </p>
      </div>
      {receipt.note ? <p className="mt-3 text-xs italic leading-relaxed text-(--ink-soft)">{receipt.note}</p> : null}
    </aside>
  );
}

function ReceiptRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-(--ink-soft)">{label}</dt>
      <dd className="mt-1 capitalize text-(--ink)">{value}</dd>
    </div>
  );
}
