"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { PASOS } from "@/lib/contenido";

/** Los cuatro momentos de una compra. La línea se llena con el avance de la lectura. */
export function Pasos() {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 28 });

  return (
    <section id="como" className="seccion pasos" data-guia="como">
      <div className="pasos__titulo">
        <h2 className="titulo-2">Cuatro momentos, y solo uno es tuyo.</h2>
        <p className="bajada">
          Tú nos dices qué necesitas. De ahí en adelante, la madrugada, los puestos y las bolsas corren por
          nuestra cuenta.
        </p>
      </div>
      <ol ref={ref} className="pasos__lista">
        <motion.span className="pasos__linea" style={{ scaleY }} aria-hidden="true" />
        {PASOS.map((paso, i) => (
          <li key={paso.titulo} className="paso">
            <span className="paso__numero" aria-hidden="true">
              {i + 1}
            </span>
            <div>
              <p className="paso__momento">{paso.momento}</p>
              <h3 className="titulo-3">{paso.titulo}</h3>
              <p>{paso.texto}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
