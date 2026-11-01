import { Inter_Tight, Instrument_Serif, JetBrains_Mono } from "next/font/google";

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

/** Clases con las variables de fuente; van en <html> del sitio y del lienzo del editor. */
export const fontVariables = `${interTight.variable} ${instrument.variable} ${jetbrains.variable}`;
