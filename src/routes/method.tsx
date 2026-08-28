import { createFileRoute } from "@tanstack/react-router";
import { DeskApp } from "@/components/desk-app";

export const Route = createFileRoute("/method")({
  component: () => <DeskApp initialMode="method" />,
  head: () => ({
    meta: [
      { title: "How it works · Spa Intelligence" },
      {
        name: "description",
        content:
          "Place, Promise, and Gap: how Spa Intelligence scores disclosure without ranking providers or inventing safety.",
      },
    ],
  }),
});
