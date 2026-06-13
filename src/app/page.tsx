import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { LandingExperience } from "@/components/landing/LandingExperience";

export default function Home() {
  return (
    <SmoothScrollProvider>
      <LandingExperience />
    </SmoothScrollProvider>
  );
}
