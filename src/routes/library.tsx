import { createFileRoute } from "@tanstack/react-router";
import { DeskApp } from "@/components/desk-app";

export const Route = createFileRoute("/library")({
  component: () => <DeskApp initialMode="library" />,
  head: () => ({
    meta: [
      { title: "Reference library · Spa Intelligence" },
      {
        name: "description",
        content: "Name common spa and med-spa services, products, and the public boards that license the person in the room.",
      },
    ],
  }),
});
