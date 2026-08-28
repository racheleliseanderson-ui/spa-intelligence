import { createFileRoute } from "@tanstack/react-router";
import { DeskApp } from "@/components/desk-app";

export const Route = createFileRoute("/desk")({
  component: () => <DeskApp initialMode="full" />,
  head: () => ({
    meta: [
      { title: "Full evaluate · Spa Intelligence" },
      {
        name: "description",
        content: "Add jurisdiction, after-hours cover, sanitation, consent, and price to a setting already on the desk.",
      },
    ],
  }),
});
