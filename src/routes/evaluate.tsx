import { createFileRoute } from "@tanstack/react-router";
import { DeskApp } from "@/components/desk-app";

/** Compatibility route for existing cross-desk handoffs. */
export const Route = createFileRoute("/evaluate")({
  component: () => <DeskApp initialMode="full" />,
  head: () => ({
    meta: [
      { title: "Full evaluate · Spa Intelligence" },
      {
        name: "description",
        content: "Evaluate the setting, disclosure, jurisdiction, sanitation, consent, cover, and price before booking.",
      },
    ],
  }),
});
