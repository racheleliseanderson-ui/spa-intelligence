import { createFileRoute } from "@tanstack/react-router";
import { DeskApp } from "@/components/desk-app";

/** Compatibility route for existing cross-desk consult-prep handoffs. */
export const Route = createFileRoute("/consult-prep")({
  component: () => <DeskApp initialMode="prep" />,
  head: () => ({
    meta: [
      { title: "Consult prep · Spa Intelligence" },
      {
        name: "description",
        content: "Turn the remaining unknowns into questions to ask before a treatment or deposit is committed.",
      },
    ],
  }),
});
