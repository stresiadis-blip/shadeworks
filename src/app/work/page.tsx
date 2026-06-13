import type { Metadata } from "next";
import { GalleryExperience } from "@/components/gallery/GalleryExperience";

export const metadata: Metadata = {
  title: "Work — Shade Works",
  description:
    "The Shade Works project gallery — custom software, business control panels, and marketing pipelines. Drag the sphere to explore, or switch to the index.",
};

/**
 * /work — the project gallery hub. Hosts the cinematic 3D sphere
 * (GalleryExperience) that used to live on the landing page. The gallery is
 * fully self-contained (fixed inset-0) and its top-left logo already links
 * home, so no extra chrome is needed here.
 */
export default function WorkPage() {
  return <GalleryExperience />;
}
