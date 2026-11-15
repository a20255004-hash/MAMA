"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { PASOS } from "@/lib/contenido";

/**
 * Los cuatro momentos de una compra. La pantalla queda fija y el número
 * cambia con el scroll; debajo queda la lista completa para lectores de pantalla.
 */
export function Pasos() {
  const pista = useRef<HTMLDivElement>(null);
  const [activo, setActivo] = useState(0);
  const quieto = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: pista, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setActivo(Math.min(PASOS.length - 1, Math.floor(v * PASOS.length)));
  });

  const paso = PASOS[activo]!;
  const entrar = quieto ? false : { opacity: 0, y: 40 };
  const salir = quieto ? undefined : { opacity: 0, y: -40 };

  return (
    <section ref={pista} id="pasos" className="pasos" data-guia="pasos" data-tema="oscuro">
      <div className="pasos__fija">
        <h2 className="pasos__titulo">Cuatro momentos. Solo el primero es tuyo.</h2>

        <div className="pasos__cuerpo" aria-hidden="true">
          <div className="pasos__numero">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={activo}
                initial={quieto ? false : { y: "60%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={quieto ? undefined : { y: "-60%", opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                {activo + 1}
              </motion.span>
            </AnimatePresence>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activo}
              className="pasos__texto"
              initial={entrar}
              animate={{ opacity: 1, y: 0 }}
              exit={salir}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
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
