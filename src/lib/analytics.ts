export type FunnelEvent = {
  name:
    | "opened"
    | "demo_loaded"
    | "guided_started"
    | "first_result"
    | "result_expanded"
    | "save_used"
    | "export_used"
    | "whatif_used"
    | "compare_used"
    | "decode_used"
    | "board_opened"
    | "feedback_kept";
  at: string;
  extra?: string;
};

const KEY = "spa-intelligence-events-v1";
const MAX = 80;

function read(): FunnelEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as FunnelEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function track(name: FunnelEvent["name"], extra?: string) {
  if (typeof window === "undefined") return;
  const events = read();
  events.push({ name, at: new Date().toISOString(), extra });
  try {
    window.localStorage.setItem(KEY, JSON.stringify(events.slice(-MAX)));
  } catch {
    /* quota — ignore */
  }
}

export function funnelSummary(): { name: FunnelEvent["name"]; count: number }[] {
  const events = read();
  const counts = new Map<FunnelEvent["name"], number>();
  for (const e of events) counts.set(e.name, (counts.get(e.name) ?? 0) + 1);
  return [...counts.entries()].map(([name, count]) => ({ name, count }));
}
