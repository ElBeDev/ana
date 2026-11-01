import type { ComponentType } from "react";
import { Hero } from "@/components/Hero";
import { Experience } from "@/components/Experience";
import { Services } from "@/components/Services";
import { Contact } from "@/components/Contact";
import { Intro, Process, Noise, About, Organizations, Education } from "@/components/Sections";
import type { BlockProps, BlockType } from "./types";

export const BLOCK_COMPONENTS: { [K in BlockType]: ComponentType<BlockProps[K]> } = {
  Hero,
  Intro,
  Experience,
  Services,
  Process,
  Noise,
  About,
  Organizations,
  Education,
  Contact,
};
