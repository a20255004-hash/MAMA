import type { Metadata, Viewport } from "next";
import { Caveat, Figtree, Fredoka } from "next/font/google";
import "@illari/ui/tokens.css";
import "@illari/ui/app.css";
import "./app.css";
import { RegistrarSW } from "@/componentes/RegistrarSW";
import { Compuerta, ProveedorSesion } from "@/componentes/Sesion";

const titulo = Fredoka({ subsets: ["latin"], variable: "--font-titulo", display: "swap" });
const texto = Figtree({ subsets: ["latin"], variable: "--font-texto", display: "swap" });
const mano = Caveat({ subsets: ["latin"], variable: "--font-mano", display: "swap" });

export const metadata: Metadata = {
  title: "Illari — tu mercado, hecho por nosotras",
  description: "Haz tu pedido del Mercado Grau, aprueba tu cotización y sigue tu compra.",
  robots: { index: false },
};

export const viewport: Viewport = {
  themeColor: "#fbfaf4",
  width: "device-width",
  initialScale: 1,
};

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-PE" className={`${titulo.variable} ${texto.variable} ${mano.variable}`}>
      <head>
        <link rel="manifest" href={`${BASE}/manifest.webmanifest`} />
        <link rel="apple-touch-icon" href={`${BASE}/icons/apple-touch-icon.png`} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Illari" />
      </head>
      <body>
        <RegistrarSW />
        <ProveedorSesion>
          <Compuerta>{children}</Compuerta>
        </ProveedorSesion>
      </body>
    </html>
  );
}
