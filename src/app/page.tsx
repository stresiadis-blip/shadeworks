import { GalleryExperience } from "@/components/gallery/GalleryExperience";
import { StoryScroll } from "@/components/story/StoryScroll";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";

export default function Home() {
  return (
    <SmoothScrollProvider>
      {/* ACT 1 — fixed cinematic sphere hero (unchanged) */}
      <GalleryExperience />
      {/* ACT 2 — scroll story, slides up over the hero */}
      <StoryScroll />
    </SmoothScrollProvider>
  );
}
