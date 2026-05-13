import { Hero } from "@/components/sections/Hero";
import { Work } from "@/components/sections/Work";
import { Services } from "@/components/sections/Services";
import { Process } from "@/components/sections/Process";
import { About } from "@/components/sections/About";
import { FAQ } from "@/components/sections/FAQ";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";
import { Marquee } from "@/components/Marquee";

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee text="full-stack engineering · constanta · shipping since 2026" />
      <Work />
      <Services />
      <Marquee
        text="next.js · supabase · stripe · vercel · resend · typescript · tailwind"
        reverse
        separator="◆"
      />
      <Process />
      <About />
      <Marquee text="shade works · est. 2026 · constanta" separator="◢" />
      <FAQ />
      <Contact />
      <Footer />
    </>
  );
}
