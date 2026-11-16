"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { PASOS } from "@/lib/contenido";

const ENTRA = [0.16, 1, 0.3, 1] as const;
const SALE = [0.7, 0, 0.84, 0] as const;

/**
 * Los cuatro momentos de una compra. La pantalla queda fija y el número
 * cambia con el scroll; la lista completa queda disponible para lectores de pantalla.
 */
export function Pasos() {
  const pista = useRef<HTMLDivElement>(null);
  const [activo, setActivo] = useState(0);
  const quieto = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: pista, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setActivo(Math.min(PASOS.length - 1, Math.max(0, Math.floor(v * PASOS.length))));
  });

  const paso = PASOS[activo]!;

  return (
    <section ref={pista} id="pasos" className="pasos" data-guia="pasos">
      <div className="pasos__fija">
        <h2 className="titulo-2">Así de fácil es.</h2>

        <div className="pasos__cuerpo" aria-hidden="true">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={`n${activo}`}
              className="pasos__numero"
              initial={quieto ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.2, ease: ENTRA } }}
              exit={quieto ? undefined : { opacity: 0, y: -8, transition: { duration: 0.15, ease: SALE } }}
            >
              {activo + 1}
            </motion.span>
          </AnimatePresence>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`t${activo}`}
              className="pasos__texto"
              initial={quieto ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.2, ease: ENTRA } }}
              exit={quieto ? undefined : { opacity: 0, y: -8, transition: { duration: 0.15, ease: SALE } }}
            >
              <p className="pasos__momento">{paso.momento}</p>
              <p className="pasos__paso">{paso.titulo}</p>
              <p className="pasos__detalle">{paso.texto}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <ol className="pasos__marcas" aria-hidden="true">
          {PASOS.map((p, i) => (
            <li key={p.titulo} data-activo={i <= activo || undefined} />
          ))}
        </ol>

        <ol className="solo-lectores">
          {PASOS.map((p) => (
            <li key={p.titulo}>
              {p.momento}: {p.titulo} {p.texto}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
