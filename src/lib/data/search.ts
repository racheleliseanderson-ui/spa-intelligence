import { PRODUCTS, SERVICES, type ProductRecord, type ServiceRecord } from "./catalog.ts";

const SYNONYMS: Record<string, string[]> = {
  tox: ["botox", "dysport", "xeomin", "jeuveau", "daxxify", "neurotoxin", "neuromodulator"],
  botox: ["neurotoxin", "tox", "onabotulinumtoxina", "baby botox"],
  filler: ["juvederm", "juvéderm", "restylane", "rha", "versa", "belotero", "lip filler", "cheek filler"],
  laser: ["ipl", "bbl", "fraxel", "co2", "photofacial", "hair removal"],
  peel: ["vi peel", "tca", "jessner", "chemical peel"],
  iv: ["drip", "infusion", "myers", "hydration", "nad"],
  thread: ["pdo", "thread lift", "facelift"],
  coolsculpt: ["coolsculpting", "fat freezing", "cryolipolysis"],
  morpheus: ["morpheus8", "rf microneedling"],
  hydrafacial: ["hydra facial", "hydradermabrasion"],
  glp: ["semaglutide", "tirzepatide", "ozempic", "wegovy", "mounjaro", "weight loss shot"],
  prp: ["vampire", "platelet", "prf"],
};

function expand(query: string): string[] {
  const tokens = query
    .toLowerCase()
    .split(/[^a-z0-9+]+/i)
    .filter((t) => t.length > 1);
  const out = new Set(tokens);
  for (const t of tokens) {
    const extra = SYNONYMS[t];
    if (extra) extra.forEach((x) => out.add(x.toLowerCase()));
    for (const [key, vals] of Object.entries(SYNONYMS)) {
      if (vals.some((v) => v === t || t.includes(v) || v.includes(t))) out.add(key);
    }
  }
  return [...out];
}

function haystack(parts: string[]): string {
  return parts.join(" ").toLowerCase();
}

function score(hay: string, tokens: string[]): number {
  let n = 0;
  for (const t of tokens) {
    if (hay.includes(t)) n += t.length > 4 ? 3 : 2;
  }
  return n;
}

export type CatalogHit =
  | { kind: "service"; record: ServiceRecord; score: number }
  | { kind: "product"; record: ProductRecord; score: number };

export function searchCatalog(query: string, limit = 12): CatalogHit[] {
  const q = query.trim();
  if (q.length < 2) return [];
  const tokens = expand(q);
  const hits: CatalogHit[] = [];
  for (const record of SERVICES) {
    const hay = haystack([record.name, record.group, record.serviceClass, ...record.aliases, record.silent]);
    const s = score(hay, tokens);
    if (s > 0) hits.push({ kind: "service", record, score: s });
  }
  for (const record of PRODUCTS) {
    const hay = haystack([record.name, record.group, record.kind, ...record.aliases, record.silent, record.ask]);
    const s = score(hay, tokens);
    if (s > 0) hits.push({ kind: "product", record, score: s });
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function suggestServices(query: string, limit = 6): ServiceRecord[] {
  return searchCatalog(query, 24)
    .filter((h): h is Extract<CatalogHit, { kind: "service" }> => h.kind === "service")
    .slice(0, limit)
    .map((h) => h.record);
}

export function suggestProducts(query: string, limit = 6): ProductRecord[] {
  return searchCatalog(query, 24)
    .filter((h): h is Extract<CatalogHit, { kind: "product" }> => h.kind === "product")
    .slice(0, limit)
    .map((h) => h.record);
}
