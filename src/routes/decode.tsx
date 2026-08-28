import { createFileRoute } from "@tanstack/react-router";
import { DeskApp } from "@/components/desk-app";

export const Route = createFileRoute("/decode")({
  component: () => <DeskApp initialMode="decode" />,
  head: () => ({
    meta: [
      { title: "Claim decoder · Spa Intelligence" },
      {
        name: "description",
        content: "Paste a marketing sentence. See what it hides: product identity, license, after-hours cover, permanence, FDA verbs.",
      },
    ],
  }),
});
