import type { Metadata, Viewport } from "next";
import { DM_Sans, Figtree, Fraunces, Outfit, Plus_Jakarta_Sans, Young_Serif } from "next/font/google";
import { MARCA } from "@illari/ui";
import "@illari/ui/tokens.css";
import "./globals.css";

// Estilo "Huerta" (propuesto). Los otros dos pares son temporales, mientras la dueña elige.
const fraunces = Fraunces({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-fraunces", display: "swap" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap" });
const dm = DM_Sans({ subsets: ["latin"], variable: "--font-dm", display: "swap" });
const young = Young_Serif({ subsets: ["latin"], weight: "400", variable: "--font-young", display: "swap" });
const figtree = Figtree({ subsets: ["latin"], variable: "--font-figtree", display: "swap" });

const fuentes = [fraunces, jakarta, outfit, dm, young, figtree].map((f) => f.variable).join(" ");

export const metadata: Metadata = {
  title: `${MARCA.nombre} — tu mercado del ${MARCA.mercado}, hecho por nosotras`,
  description:
    "Duerme un ratito más: vamos al Mercado Grau por ti. Escogemos tu fruta, tu verdura y tu pollo como para nuestra mesa y te los llevamos a casa, en Tacna.",
  openGraph: {
    title: `${MARCA.nombre} — hoy vamos al mercado por ti`,
    description: MARCA.lema,
    locale: "es_PE",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#fbfaf4",
  width: "device-width",
  initialScale: 1,
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-PE" className={fuentes} data-estilo="huerta" suppressHydrationWarning>
      <body>
        <a className="saltar" href="#contenido">
          Ir al contenido
        </a>
        {children}
      </body>
    </html>
  );
}
