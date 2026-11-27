"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Logo } from "@illari/ui";
import { useSesion } from "./Sesion";

const ENLACES = [
  { href: "/", texto: "Inicio", d: "M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" },
  { href: "/pedido/nuevo/", texto: "Pedir", d: "M12 5v14M5 12h14" },
  { href: "/casa/", texto: "Mi casa", d: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 3.6-6 8-6s8 2 8 6" },
] as const;

/** Cabecera con el logo y navegación: arriba en pantallas grandes, abajo en el celular. */
export function Marco({ children }: { children: ReactNode }) {
  const { perfil } = useSesion();
  const ruta = usePathname() ?? "/";

  const activo = (href: string) => (href === "/" ? ruta === "/" : ruta.startsWith(href));
  const nombre = perfil.nombre.split(" ")[0] ?? "";

  return (
    <div className="marco">
      <header className="marco__barra">
        <div className="marco__barra-in">
          <Link href="/" className="marco__logo" aria-label="Illari, inicio">
            <Logo />
          </Link>
          <nav className="marco__nav-alto" aria-label="Secciones">
            {ENLACES.map((e) => (
              <Link key={e.href} href={e.href} aria-current={activo(e.href) ? "page" : undefined}>
                {e.texto}
              </Link>
            ))}
          </nav>
          <Link href="/casa/" className="marco__yo" aria-label="Mi casa y mi cuenta">
            <span aria-hidden="true">{nombre.slice(0, 1).toUpperCase() || "I"}</span>
          </Link>
        </div>
      </header>

      <main className="marco__contenido" id="contenido">
        {children}
      </main>

      <nav className="marco__nav-bajo" aria-label="Secciones">
        {ENLACES.map((e) => (
          <Link key={e.href} href={e.href} aria-current={activo(e.href) ? "page" : undefined}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d={e.d} />
            </svg>
            {e.texto}
          </Link>
        ))}
      </nav>
    </div>
  );
}
