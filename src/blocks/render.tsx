import type { ComponentType } from "react";
import { Loader } from "@/components/Loader";
import { Motion } from "@/components/Motion";
import { Cursor } from "@/components/Cursor";
import { Nav } from "@/components/Nav";
import { WhatsAppFloat } from "@/components/Sections";
import { LandingProvider } from "./context";
import { BLOCK_COMPONENTS } from "./components";
import type { LandingBlock, LandingData } from "./types";

function Block({ block }: { block: LandingBlock }) {
  const Component = BLOCK_COMPONENTS[block.type] as ComponentType<LandingBlock["props"]>;
  return <Component {...block.props} />;
}

/** La landing pública: secciones en su orden + piezas globales (loader, nav, cursor…). */
export function Landing({ data }: { data: LandingData }) {
  const main = data.content.filter((b) => b.type !== "Contact");
  const footer = data.content.find((b) => b.type === "Contact");
  return (
    <LandingProvider data={data}>
      <Loader />
      <Motion />
      <Cursor />
      <Nav />
      <main>
        {main.map((block) => (
          <Block key={block.props.id} block={block} />
        ))}
      </main>
      {footer && <Block block={footer} />}
      <WhatsAppFloat />
    </LandingProvider>
  );
}
