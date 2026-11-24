import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { MARCA } from "@illari/ui";
import "@illari/ui/tokens.css";
import "./globals.css";

const titulo = Fraunces({ subsets: ["latin"], variable: "--font-titulo", display: "swap" });
const texto = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-texto", display: "swap" });

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
    <html lang="es-PE" className={`${titulo.variable} ${texto.variable}`}>
      <body>
        <a className="saltar" href="#contenido">
          Ir al contenido
        </a>
        {children}
      </body>
    </html>
  );
}
