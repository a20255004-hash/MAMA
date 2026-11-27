import type { Metadata, Viewport } from "next";
import { Caveat, Figtree, Fredoka } from "next/font/google";
import "@illari/ui/tokens.css";
import "@illari/ui/app.css";
import "./app.css";
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

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-PE" className={`${titulo.variable} ${texto.variable} ${mano.variable}`}>
      <body>
        <ProveedorSesion>
          <Compuerta>{children}</Compuerta>
        </ProveedorSesion>
      </body>
    </html>
  );
}
