"use client";

import type { ReactNode } from "react";
import { Sol } from "@illari/ui";
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

export function Vacio({ titulo, children }: { titulo: string; children?: ReactNode }) {
  return (
    <div className="vacio">
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

/** Encabezado de cada pantalla del panel. */
export function Cabeza({ titulo, children }: { titulo: string; children?: ReactNode }) {
  return (
    <div className="cabeza">
      <h1 className="t-pagina">{titulo}</h1>
      {children && <div className="fila-flex">{children}</div>}
    </div>
  );
}

/** Enlace de WhatsApp a un cliente concreto, con el mensaje ya escrito. */
export function enlaceCliente(celular: string | null | undefined, mensaje: string): string | null {
  if (!celular) return null;
  return `https://wa.me/51${celular}?text=${encodeURIComponent(mensaje)}`;
}

/** Dirección de la app de clientes: vive junto al panel, una carpeta más arriba. */
export function urlDeLaApp(): string {
  return new URL("../app/", window.location.href).href;
}
