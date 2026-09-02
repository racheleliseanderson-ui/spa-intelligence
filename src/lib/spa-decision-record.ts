import {
  appendDecisionHistory,
  appendEvidenceReceipt,
  buildDecisionHandoffUrl,
  createDecisionRecord,
  loadDecisionRecord,
  saveDecisionRecord,
  setDecisionContext,
  type VanityDecisionRecord,
} from "@/lib/decision-record";
import type { DeskInput, SavedScenario } from "@/lib/engine/types";

function constraints(input: DeskInput): string[] {
  return [
    input.venue !== "unclear" ? `setting:${input.venue}` : "setting:unclear",
    input.region !== "unstated" ? `region:${input.region}` : "region:unstated",
    input.performer ? "performer:named" : "performer:unknown",
    input.product ? "product:named" : "product:unknown",
    input.price ? `price:${input.price}` : "price:unknown",
  ];
}

export function decisionRecordForSpa(input: DeskInput): VanityDecisionRecord {
  let record = loadDecisionRecord() ?? createDecisionRecord("spa", {
    concern: input.menuLine || input.serviceClass || "",
    goals: input.serviceClass && input.serviceClass !== "unselected" ? [input.serviceClass] : [],
    constraints: constraints(input),
  });
  record = setDecisionContext(record, "spa", {
    concern: record.concern || input.menuLine || input.serviceClass || "",
    goals: input.serviceClass && input.serviceClass !== "unselected" ? [input.serviceClass] : [],
    constraints: constraints(input),
    appState: {
      input: { ...input },
      capturedAt: new Date().toISOString(),
    },
  });
  if (!record.evidence.some((e) => e.id === "spa-method-v1")) {
    record = appendEvidenceReceipt(record, "spa", {
      id: "spa-method-v1",
      claim: "Setting and treatment-menu disclosure reading",
      source: "Vanity or Vice · Spa Intelligence disclosure method",
      publishedAt: "2026-09-01",
      checkedAt: "2026-09-01",
      exactObjectMatch: "setting",
      confidence: "moderate",
      uncertainty: ["Disclosure is not provider quality, safety, candidacy or an outcome prediction."],
      commercialContext: "independent",
      correctionState: "current",
      note: "The setting's own menu or advertising remains a commercial source and should be identified separately when used.",
    });
  }
  return saveDecisionRecord(record);
}

export function spaDecisionHandoffUrl(href: string, input: DeskInput): string {
  return buildDecisionHandoffUrl(href, decisionRecordForSpa(input), "spa");
}

export function recordSpaConsult(input: DeskInput, scenario: SavedScenario) {
  let record = decisionRecordForSpa(input);
  record = appendDecisionHistory(
    record,
    "spa",
    "consult",
    `Consult record saved: ${scenario.name}`,
    input.menuLine || input.serviceClass,
    {
      savedScenarioId: scenario.id,
      savedAt: scenario.savedAt,
      venueName: input.venueName,
      serviceClass: input.serviceClass,
      venue: input.venue,
      region: input.region,
      performerNamed: Boolean(input.performer),
      productNamed: Boolean(input.product),
      priceNamed: Boolean(input.price),
    },
  );
  saveDecisionRecord(record);
}
