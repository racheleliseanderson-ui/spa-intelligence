import { createFileRoute } from "@tanstack/react-router";
import { DeskApp } from "@/components/desk-app";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Spa Intelligence · See the room before you book it" },
      {
        name: "description",
        content:
          "Four questions produce a setting reading: what is named, what the copy is asking you to feel, and what is still open. Education only.",
      },
    ],
  }),
});

function Home() {
  return <DeskApp />;
}
