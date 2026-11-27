import type { Metadata, Viewport } from "next";
import { Caveat, Figtree, Fredoka } from "next/font/google";
import { MARCA } from "@illari/ui";
import "@illari/ui/tokens.css";
import "./globals.css";

// Letras elegidas por la dueña: Fredoka para títulos, Figtree para texto y Caveat como toque a mano.
const titulo = Fredoka({ subsets: ["latin"], variable: "--font-titulo", display: "swap" });
const texto = Figtree({ subsets: ["latin"], variable: "--font-texto", display: "swap" });
const mano = Caveat({ subsets: ["latin"], variable: "--font-mano", display: "swap" });

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

// Si ya viste la bienvenida en esta visita, se oculta antes de pintar la página (sin parpadeo).
const SCRIPT_BIENVENIDA = `try{if(sessionStorage.getItem("illari:bienvenida")==="1")document.documentElement.dataset.bienvenida="vista"}catch(e){}`;

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-PE" suppressHydrationWarning className={`${titulo.variable} ${texto.variable} ${mano.variable}`}>
      <body>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_BIENVENIDA }} />
        <noscript>
          <style>{`.bienvenida{display:none!important}`}</style>
        </noscript>
        <a className="saltar" href="#contenido">
          Ir al contenido
        </a>
        {children}
      </body>
    </html>
  );
}
