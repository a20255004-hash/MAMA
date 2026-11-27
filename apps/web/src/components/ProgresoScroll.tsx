"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { Sol } from "@illari/ui";

/** Línea fina arriba de la pantalla: un solcito recorre el camino a medida que avanzas por la página. */
export function ProgresoScroll() {
  const quieto = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll();
  const suave = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.4 });
  const izquierda = useTransform(suave, (v) => `${v * 100}%`);
  if (quieto) return null;
  return (
    <div className="progreso-scroll" aria-hidden="true">
      <motion.span className="progreso-scroll__linea" style={{ scaleX: suave }} />
      <motion.span className="progreso-scroll__sol" style={{ left: izquierda }}>
        <Sol />
      </motion.span>
    </div>
  );
}
