"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useSesion } from "./Sesion";

/** Muestra su contenido solo a la administración; a las demás las lleva a su sección. */
export function SoloAdmin({ children }: { children: ReactNode }) {
  const { perfil } = useSesion();
  if (perfil.rol === "administrador") return <>{children}</>;
  return (
    <div className="vacio">
      <h1 className="t-seccion" style={{ color: "var(--tinta)" }}>
        Esta sección es solo para administración
      </h1>
      <Link href="/comprar/" className="boton boton--accion">
        Ir a Comprar
      </Link>
    </div>
  );
}
