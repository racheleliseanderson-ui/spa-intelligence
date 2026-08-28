import type { Freshness, RegionId } from "../engine/types.ts";

export type BoardKind =
  | "physician"
  | "nursing"
  | "physician-assistant"
  | "cosmetology"
  | "massage"
  | "facility"
  | "national";

export type BoardLookup = {
  id: string;
  region: RegionId | "national";
  kind: BoardKind;
  name: string;
  url: string;
  note: string;
  freshness: Freshness;
  checked: string;
  source: string;
};

const CHECKED = "2026-08-27";

/**
 * Public license-lookup doors. These are official directories, not endorsements.
 * A lookup result is not a safety verdict. The facility still has to name the
 * board that actually licenses the person in the room.
 */
export const BOARD_LOOKUPS: BoardLookup[] = [
  {
    id: "docinfo",
    region: "national",
    kind: "physician",
    name: "DocInfo · FSMB physician profile",
    url: "https://www.docinfo.org/",
    note: "Free public lookup of U.S. physician licenses, discipline, and board certification. Covers MDs and DOs. Does not cover nurses, PAs, or estheticians.",
    freshness: "current",
    checked: CHECKED,
    source: "Federation of State Medical Boards",
  },
  {
    id: "nursys",
    region: "national",
    kind: "nursing",
    name: "Nursys · NCSBN nurse license verification",
    url: "https://www.nursys.com/",
    note: "Public verification for RN, LPN/LVN, and many APRN/NP licenses across participating U.S. boards. Confirm the state participates before treating a blank result as absence.",
    freshness: "current",
    checked: CHECKED,
    source: "National Council of State Boards of Nursing",
  },
  {
    id: "ca-dca",
    region: "us-ca",
    kind: "national",
    name: "California DCA license search",
    url: "https://search.dca.ca.gov/",
    note: "Searches multiple California boards, including medical, nursing, physician assistant, and barbering/cosmetology. Ask which board the performer claims before you search.",
    freshness: "current",
    checked: CHECKED,
    source: "California Department of Consumer Affairs",
  },
  {
    id: "ny-op",
    region: "us-ny",
    kind: "national",
    name: "New York Office of the Professions verification",
    url: "https://www.op.nysed.gov/verification-search",
    note: "Nursing, physician assistant, and several other professions. Physicians also have a separate NY doctor profile. Ask which credential they hold.",
    freshness: "current",
    checked: CHECKED,
    source: "New York State Education Department",
  },
  {
    id: "tx-tmb",
    region: "us-tx",
    kind: "physician",
    name: "Texas Medical Board physician profile",
    url: "https://profile.tmb.state.tx.us/",
    note: "Physician lookup. Nursing and other licenses sit on other Texas boards — do not treat a blank TMB result as ‘unlicensed nurse’.",
    freshness: "current",
    checked: CHECKED,
    source: "Texas Medical Board",
  },
  {
    id: "fl-mqa",
    region: "us-fl",
    kind: "national",
    name: "Florida MQA provider search",
    url: "https://mqa-internet.doh.state.fl.us/MQASearchServices/HealthCareProviders",
    note: "Florida Department of Health lookup across many health-care professions. Ask which license type to search.",
    freshness: "current",
    checked: CHECKED,
    source: "Florida Department of Health",
  },
  {
    id: "il-idfpr",
    region: "us-il",
    kind: "national",
    name: "Illinois IDFPR license lookup",
    url: "https://online-dfpr.micropact.com/lookup/licenselookup.aspx",
    note: "Illinois professional licenses, including medical, nursing, and cosmetology. Confirm the profession filter matches what they claimed.",
    freshness: "current",
    checked: CHECKED,
    source: "Illinois Department of Financial and Professional Regulation",
  },
  {
    id: "az-bom",
    region: "us-az",
    kind: "physician",
    name: "Arizona Medical Board doctor search",
    url: "https://www.azmd.gov/",
    note: "Physician lookup. Nursing and cosmetology are other Arizona boards. Ask which one applies to the person treating you.",
    freshness: "current",
    checked: CHECKED,
    source: "Arizona Medical Board",
  },
  {
    id: "wa-doh",
    region: "us-wa",
    kind: "national",
    name: "Washington DOH provider credential search",
    url: "https://fortress.wa.gov/doh/providercredentialsearch/",
    note: "Washington Department of Health credentials, including medical, nursing, and some device-related licenses.",
    freshness: "current",
    checked: CHECKED,
    source: "Washington State Department of Health",
  },
  {
    id: "co-dora",
    region: "us-co",
    kind: "national",
    name: "Colorado DORA license lookup",
    url: "https://apps.colorado.gov/dora/licensing/Lookup/LicenseLookup.aspx",
    note: "Colorado Division of Professions and Occupations. Medical, nursing, and cosmetology sit in this lookup with different profession filters.",
    freshness: "current",
    checked: CHECKED,
    source: "Colorado Department of Regulatory Agencies",
  },
  {
    id: "nv-nsbme",
    region: "us-nv",
    kind: "physician",
    name: "Nevada State Board of Medical Examiners",
    url: "https://medboard.nv.gov/",
    note: "Physician lookup. Nursing and other licenses are other Nevada boards.",
    freshness: "review-due",
    checked: CHECKED,
    source: "Nevada State Board of Medical Examiners",
  },
  {
    id: "ga-cmb",
    region: "us-ga",
    kind: "physician",
    name: "Georgia Composite Medical Board verification",
    url: "https://gcmb.mylicense.com/verification/",
    note: "Physician lookup. Ask which board covers the performer if they are not an MD/DO.",
    freshness: "current",
    checked: CHECKED,
    source: "Georgia Composite Medical Board",
  },
  {
    id: "uk-gmc",
    region: "uk",
    kind: "physician",
    name: "UK GMC medical register",
    url: "https://www.gmc-uk.org/registration-and-licensing/the-medical-register",
    note: "UK-registered doctors. Nurses, dentists, and premises registration sit with other UK registers.",
    freshness: "current",
    checked: CHECKED,
    source: "General Medical Council",
  },
  {
    id: "au-ahpra",
    region: "au-nz",
    kind: "national",
    name: "AHPRA register of practitioners",
    url: "https://www.ahpra.gov.au/",
    note: "Australian Health Practitioner Regulation Agency. New Zealand has a separate register — do not import one country’s rules into the other.",
    freshness: "current",
    checked: CHECKED,
    source: "AHPRA",
  },
];

export function boardsForRegion(region: RegionId): BoardLookup[] {
  const national = BOARD_LOOKUPS.filter((b) => b.region === "national");
  if (region === "unstated" || region === "us-other" || region === "other" || region === "eu" || region === "ca-canada") {
    return national;
  }
  const local = BOARD_LOOKUPS.filter((b) => b.region === region);
  return [...national, ...local];
}

export const BOARD_PROVENANCE = {
  source: "Official public license directories",
  sourceType: "regulatory-explainer" as const,
  checked: CHECKED,
  freshness: "current" as Freshness,
  method:
    "Links point at public verification doors operated by boards or national compact services. A listed URL is not a finding about any named person. The desk never searches a license number on your behalf.",
};
