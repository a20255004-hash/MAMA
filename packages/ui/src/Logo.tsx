import type { SVGProps } from "react";
import { MARCA } from "./marca";

/**
 * Símbolo: un sol que amanece y cuyos rayos son hojas.
 * "Illari" es amanecer; las hojas dicen que lo que llega es fresco.
 */
export function Simbolo(props: SVGProps<SVGSVGElement>) {
  const hoja = "M24 15.5c3.6-4.6 3.6-9 0-13.5-3.6 4.5-3.6 8.900 0 13.5z";
  return (
    <svg viewBox="0 0 48 34" aria-hidden="true" focusable="false" {...props}>
      {[-72, -36, 0, 36, 72].map((giro) => (
        <path key={giro} d={hoja} transform={`rotate(${giro} 24 30)`} fill="var(--tinta)" />
      ))}
      <path d="M13 30a11 11 0 0 1 22 0z" fill="var(--accion)" />
      <path d="M4 31.500h40" stroke="var(--tinta)" strokeWidth="2.200" strokeLinecap="round" />
    </svg>
  );
}

/** Logotipo completo: símbolo y nombre. El nombre usa la letra de títulos del estilo activo. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={className} role="img" aria-label={MARCA.nombre} style={{ display: "inline-flex", alignItems: "center", gap: "0.45em" }}>
      <Simbolo style={{ height: "1.05em", width: "auto", flex: "none" }} />
      <span
        aria-hidden="true"
        style={{
          fontFamily: "var(--f-titulo)",
          fontWeight: 600,
          letterSpacing: "-0.02em",
          lineHeight: 1,
        }}
      >
        illari
      </span>
    </span>
  );
}
