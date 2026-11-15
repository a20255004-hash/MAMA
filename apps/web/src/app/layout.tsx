import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Schibsted_Grotesk } from "next/font/google";
import { MARCA } from "@illari/ui";
import "@illari/ui/tokens.css";
import "./globals.css";

const titulo = Bodoni_Moda({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-titulo",
  display: "swap",
});

const texto = Schibsted_Grotesk({
  subsets: ["latin"],
  variable: "--font-texto",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${MARCA.nombre} — compras del ${MARCA.mercado} por encargo en ${MARCA.ciudad}`,
  description:
    "Mientras duermes, hacemos tu mercado. Una compradora que conoce el Mercado Grau elige tus frutas, verduras, carnes y abarrotes, y te los lleva a casa.",
  openGraph: {
    title: `${MARCA.nombre} — mientras duermes, hacemos tu mercado`,
    description: MARCA.lema,
    locale: "es_PE",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffe9dc",
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
