import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Hanken_Grotesk } from "next/font/google";
import { MARCA } from "@casera/ui";
import "@casera/ui/tokens.css";
import "./globals.css";

const titulo = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-titulo",
  display: "swap",
});

const texto = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-texto",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${MARCA.nombre} — compras del ${MARCA.mercado} por encargo en ${MARCA.ciudad}`,
  description:
    "Una compradora que conoce el Mercado Grau elige tus frutas, verduras, carnes y abarrotes como para su casa. Tú los recibes en la tuya o los recoges en el mercado.",
  openGraph: {
    title: `${MARCA.nombre} — nosotras madrugamos por ti`,
    description: MARCA.lema,
    locale: "es_PE",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#1b1640",
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
