"use client";

import type { ReactNode } from "react";
import { Illa, Sol, type GestoIlla } from "@illari/ui";
import { NOMBRE_ESTADO, type EstadoPedido } from "@illari/db";

export function Cargando({ texto = "Un momento…" }: { texto?: string }) {
  return (
    <div className="cargando" role="status">
      <div className="apilado apilado--chico" style={{ justifyItems: "center" }}>
        <Sol className="cargando__sol" />
        <p>{texto}</p>
      </div>
    </div>
  );
}

export function Vacio({ titulo, children, gesto = "canasta" }: { titulo: string; children?: ReactNode; gesto?: GestoIlla }) {
  return (
    <div className="vacio">
      <Illa gesto={gesto} style={{ width: "7rem", height: "auto" }} />
      <h2 className="t-seccion" style={{ color: "var(--tinta)" }}>
        {titulo}
      </h2>
      {children}
    </div>
  );
}

export function EtiquetaEstado({ estado }: { estado: EstadoPedido }) {
  return <span className={`etiqueta etiqueta--${estado}`}>{NOMBRE_ESTADO[estado]}</span>;
}

export function ErrorAviso({ mensaje }: { mensaje: string | null }) {
  if (!mensaje) return null;
  return (
    <p className="aviso aviso--error" role="alert">
      {mensaje}
    </p>
  );
}
