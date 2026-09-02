import { createFileRoute } from "@tanstack/react-router";
import { DeskApp } from "@/components/desk-app";

/** Compatibility route for existing publication and Makeup handoffs. */
export const Route = createFileRoute("/claim-decoder")({
  component: () => <DeskApp initialMode="decode" />,
  head: () => ({
    meta: [
      { title: "Claim decoder · Spa Intelligence" },
      {
        name: "description",
        content: "Separate the literal claim from the implied promise and keep unresolved details visible.",
      },
    ],
  }),
});
