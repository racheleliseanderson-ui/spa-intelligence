import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { findProduct } from "./catalog.ts";
import { searchCatalog, suggestProducts, suggestServices } from "./search.ts";
import { boardsForRegion, BOARD_LOOKUPS } from "./boards.ts";

describe("catalog search", () => {
  it("finds Botox via baby botox synonym", () => {
    const hits = searchCatalog("baby botox");
    assert.ok(hits.some((h) => h.kind === "service" && /neurotoxin|botox/i.test(h.record.name)));
  });

  it("finds CoolSculpting via fat freezing", () => {
    const hits = searchCatalog("fat freezing");
    assert.ok(hits.some((h) => /coolsculpt|cryolipolysis|fat/i.test(h.record.name)));
  });

  it("suggests products for hydrafacial", () => {
    const products = suggestProducts("hydrafacial");
    assert.ok(products.some((p) => /hydra/i.test(p.name)));
  });

  it("suggests injectable services for filler", () => {
    const services = suggestServices("lip filler");
    assert.ok(services.some((s) => s.serviceClass === "injectable"));
  });

  it("returns empty for a two-letter miss that is too short after trim", () => {
    assert.deepEqual(searchCatalog(" "), []);
    assert.deepEqual(searchCatalog("x"), []);
  });

  it("prefers compounded toxin over Botox Cosmetic when the longer name is present", () => {
    const hit = findProduct("compounded botox research toxin");
    assert.ok(hit);
    assert.match(hit!.name, /Compounded/i);
  });
});

describe("board lookups", () => {
  it("always includes national directories", () => {
    const boards = boardsForRegion("unstated");
    assert.ok(boards.some((b) => b.id === "docinfo"));
    assert.ok(boards.some((b) => b.id === "nursys"));
  });

  it("adds Colorado DORA when Colorado is selected", () => {
    const boards = boardsForRegion("us-co");
    assert.ok(boards.some((b) => b.id === "co-dora"));
    assert.ok(boards.every((b) => b.url.startsWith("https://")));
  });

  it("does not invent a local board for an unnamed other-country region", () => {
    const boards = boardsForRegion("other");
    assert.ok(boards.every((b) => b.region === "national"));
    assert.ok(BOARD_LOOKUPS.length >= 8);
  });
});
