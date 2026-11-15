"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

/** Franja de paso entre la madrugada y el día: el sol sale mientras se baja. */
export function Amanecer() {
  const ref = useRef<HTMLDivElement>(null);
  const quieto = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 0.75], ["55%", "-35%"]);

  return (
    <div ref={ref} className="amanecer" aria-hidden="true">
      <motion.div className="amanecer__sol" style={quieto ? undefined : { y }} />
      <svg className="amanecer__toldos" viewBox="0 0 1200 90" preserveAspectRatio="none" focusable="false">
        <path d="M0 90V40q50 44 100 0t100 0 100 0 100 0 100 0 100 0 100 0 100 0 100 0 100 0 100 0 100 0v50z" />
      </svg>
    </div>
  );
}
