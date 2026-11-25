import type { SVGProps } from "react";
import { MARCA } from "./marca";

/** Sol de ocho rayos: es el punto de la "i" del logo y también el ícono de la marca. */
export function Sol(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false" {...props}>
      <circle cx="10" cy="10" r="4.2" fill="var(--accion)" />
      <path
        d="M10 1.5v2.6M10 15.9v2.6M1.5 10h2.6M15.9 10h2.6M4 4l1.8 1.8M14.2 14.2L16 16M16 4l-1.8 1.8M5.8 14.2L4 16"
        stroke="var(--accion)"
        strokeWidth="1.7"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

/**
 * Símbolo secundario: un sol que amanece cuyos rayos son hojas.
 * Queda disponible para divisores y sellos; el logo principal es `Logo`.
 */
export function Simbolo(props: SVGProps<SVGSVGElement>) {
  const hoja = "M24 15.5c3.6-4.6 3.6-9 0-13.5-3.6 4.5-3.6 8.9 0 13.5z";
  return (
    <svg viewBox="0 0 48 34" aria-hidden="true" focusable="false" {...props}>
      {[-72, -36, 0, 36, 72].map((giro) => (
        <path key={giro} d={hoja} transform={`rotate(${giro} 24 30)`} fill="var(--tinta)" />
      ))}
      <path d="M13 30a11 11 0 0 1 22 0z" fill="var(--accion)" />
      <path d="M4 31.5h40" stroke="var(--tinta)" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Logo "la i-sol": el nombre en minúsculas, con un sol en lugar del punto de la primera "i".
 * Usa la letra de títulos y se escala con el tamaño de letra del lugar donde se ponga.
 * La "ı" sin punto es la letra del alfabeto turco; aquí solo sirve para dejar sitio al sol.
 * La altura del sol (`top`) está medida para Fredoka 600 con interlineado 1.15: si cambia la letra, hay que volver a medirla.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={className} role="img" aria-label={MARCA.nombre} style={{ display: "inline-block", lineHeight: 1.15 }}>
      <span
        aria-hidden="true"
        style={{ fontFamily: "var(--f-titulo)", fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1.15 }}
      >
        <span style={{ position: "relative", display: "inline-block" }}>
          ı
          <Sol
            style={{
              position: "absolute",
              left: "50%",
              top: "-0.065em",
              width: "0.5em",
              height: "0.5em",
              transform: "translateX(-50%)",
            }}
          />
        </span>
        llari
      </span>
    </span>
  );
}
