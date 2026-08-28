import { createFileRoute } from "@tanstack/react-router";
import { DeskApp } from "@/components/desk-app";

export const Route = createFileRoute("/packet")({
  component: () => <DeskApp initialMode="packet" />,
  head: () => ({
    meta: [
      { title: "Decision packet · Spa Intelligence" },
      {
        name: "description",
        content: "Print a setting decision packet: what is named, what is still open, and the questions for the consult.",
      },
    ],
  }),
});
