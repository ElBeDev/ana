import { Loader } from "@/components/Loader";
import { Motion } from "@/components/Motion";
import { Cursor } from "@/components/Cursor";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Experience } from "@/components/Experience";
import { Services } from "@/components/Services";
import { Contact } from "@/components/Contact";
import { Intro, Process, Noise, About, Organizations, Education, WhatsAppFloat } from "@/components/Sections";

export default function Home() {
  return (
    <>
      <Loader />
      <Motion />
      <Cursor />
      <Nav />
      <main>
        <Hero />
        <Intro />
        <Experience />
        <Services />
        <Process />
        <Noise />
        <About />
        <Organizations />
        <Education />
      </main>
      <Contact />
      <WhatsAppFloat />
    </>
  );
}
