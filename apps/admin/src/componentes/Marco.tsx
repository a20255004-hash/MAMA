"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { NOMBRE_ROL, type Rol } from "@illari/db";
import { Logo, MARCA } from "@illari/ui";
import { useSesion } from "./Sesion";

type Enlace = { href: string; texto: string; roles: Rol[] };

const ENLACES: Enlace[] = [
  { href: "/", texto: "Hoy", roles: ["administrador"] },
  { href: "/pedidos/", texto: "Pedidos", roles: ["administrador"] },
  { href: "/comprar/", texto: "Comprar", roles: ["administrador", "compradora"] },
  { href: "/entregas/", texto: "Entregas", roles: ["administrador", "repartidor"] },
  { href: "/caja/", texto: "Caja", roles: ["administrador"] },
  { href: "/paquetes/", texto: "Paquetes", roles: ["administrador"] },
  { href: "/reclamos/", texto: "Reclamos", roles: ["administrador"] },
  { href: "/equipo/", texto: "Equipo", roles: ["administrador"] },
  { href: "/catalogo/", texto: "Catálogo", roles: ["administrador"] },
];

/** Barra lateral en pantallas grandes; en el celular, una franja de pestañas arriba. */
export function Marco({ children }: { children: ReactNode }) {
  const { perfil, cerrarSesion } = useSesion();
  const ruta = usePathname() ?? "/";
  const visibles = ENLACES.filter((e) => e.roles.includes(perfil.rol));
  const activo = (href: string) => (href === "/" ? ruta === "/" : ruta.startsWith(href.replace(/\/$/, "")));

  return (
    <div className="central">
      <aside className="central__lado">
        <div className="central__marca">
          <Link href={visibles[0]?.href ?? "/"} aria-label={`${MARCA.nombrePanel}, inicio`}>
            <Logo />
          </Link>
          <span className="central__sello">Central</span>
        </div>

        <nav className="central__nav" aria-label="Secciones">
          {visibles.map((e) => (
            <Link key={e.href} href={e.href} aria-current={activo(e.href) ? "page" : undefined}>
              {e.texto}
            </Link>
          ))}
        </nav>

        <div className="central__yo">
          <p className="central__nombre">{perfil.nombre || "Equipo"}</p>
          <p className="t-meta">{NOMBRE_ROL[perfil.rol]}</p>
          <button type="button" className="enlace" onClick={() => void cerrarSesion()}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="central__contenido" id="contenido">
        {children}
      </main>
    </div>
  );
}
