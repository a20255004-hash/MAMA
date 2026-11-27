"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform, useVelocity } from "motion/react";
import { useRef } from "react";

const FRASES = ["Duerme un ratito más", "Hoy vamos al mercado por ti", "Compramos como para nuestra mesa"];

/**
 * Dos cintas de letras gigantes que corren en sentidos opuestos con el scroll
 * y se inclinan según la velocidad con la que bajas, como una pista de carreras.
 */
export function CintaGigante() {
  const ref = useRef<HTMLElement>(null);
  const quieto = useReducedMotion() ?? false;
  const { scrollYProgress, scrollY } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const velocidad = useSpring(useVelocity(scrollY), { stiffness: 120, damping: 28 });
  const inclina = useTransform(velocidad, [-2400, 0, 2400], [7, 0, -7]);
  const izquierda = useTransform(scrollYProgress, [0, 1], ["0%", "-38%"]);
  const derecha = useTransform(scrollYProgress, [0, 1], ["-38%", "0%"]);

  const fila = (clase: string) => (
    <span className={clase}>
      {[...FRASES, ...FRASES].map((f, i) => (
        <span key={i}>
          {f}
          <i aria-hidden="true" />
        </span>
      ))}
    </span>
  );

  return (
    <section ref={ref} className="gigante" aria-label="Duerme un ratito más. Hoy vamos al mercado por ti.">
      <motion.p className="gigante__fila" aria-hidden="true" style={quieto ? undefined : { x: izquierda, skewX: inclina }}>
        {fila("gigante__borde")}
      </motion.p>
      <motion.p className="gigante__fila" aria-hidden="true" style={quieto ? undefined : { x: derecha, skewX: inclina }}>
        {fila("gigante__lleno")}
      </motion.p>
    </section>
  );
}
