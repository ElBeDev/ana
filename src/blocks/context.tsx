"use client";

import { createContext, use, type ReactNode } from "react";
import { contactHref } from "@/content/site";
import type { BlockProps, BlockType, LandingData } from "./types";

type LandingContextValue = { data: LandingData; editing: boolean };

const LandingContext = createContext<LandingContextValue | null>(null);

/** Da a cada sección acceso a los ajustes del sitio y a las demás secciones. */
export function LandingProvider({
  data,
  editing = false,
  children,
}: {
  data: LandingData;
  editing?: boolean;
  children: ReactNode;
}) {
  return <LandingContext value={{ data, editing }}>{children}</LandingContext>;
}

function useLanding() {
  const value = use(LandingContext);
  if (!value) throw new Error("Falta LandingProvider");
  return value;
}

export function useSettings() {
  return useLanding().data.root.props;
}

export function useEditing() {
  return useLanding().editing;
}

export function useBlock<K extends BlockType>(type: K): BlockProps[K] | undefined {
  const block = useLanding().data.content.find((b) => b.type === type);
  return block?.props as BlockProps[K] | undefined;
}

/** WhatsApp si está configurado, si no correo, si no la sección de contacto. */
export function useContactHref() {
  const { contact } = useSettings();
  return (message?: string) => contactHref(contact, message || contact.message);
}
