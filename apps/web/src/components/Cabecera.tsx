"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { MARCA } from "@casera/ui";

/**
 * Cabecera flotante. El sol recorre su arco a medida que se baja por la página:
 * es el mismo viaje de la compra, de la madrugada a la mañana.
 */
export function Cabecera() {
  const { scrollYProgress } = useScroll();
  const offsetDistance = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <header className="cabecera">
      <a className="cabecera__marca" href="#inicio" aria-label={`${MARCA.nombre}, inicio`}>
        casera
      </a>
      <svg className="cabecera__cielo" viewBox="0 0 64 28" aria-hidden="true" focusable="false">
        <path d="M4 24 A28 22 0 0 1 60 24" fill="none" stroke="currentColor" strokeOpacity=".35" strokeDasharray="2 4" />
        <motion.circle
          r="4.5"
          fill="var(--aji)"
          style={{ offsetPath: 'path("M4 24 A28 22 0 0 1 60 24")', offsetDistance }}
        />
      </svg>
      <nav className="cabecera__nav" aria-label="Secciones">
        <a href="#como">Cómo funciona</a>
        <a href="#modos">Formas de comprar</a>
        <a href="#criterio">Quién compra</a>
      </nav>
      <a className="boton boton--aji cabecera__pedir" href="#pedir">
        Pedir mi compra
      </a>
    </header>
  );
}
