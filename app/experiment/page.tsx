"use client";

import dynamic from "next/dynamic";

const Scene = dynamic(
  () => import("@/components/experiment/Scene").then((m) => m.Scene),
  { ssr: false }
);

export default function ExperimentPage() {
  return <Scene />;
}
