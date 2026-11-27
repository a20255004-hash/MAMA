"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { CINTA, CRITERIOS, MANO } from "@/lib/contenido";
import { IllaViva } from "./IllaViva";

/** Quién compra: el criterio de una mamá, con Illa y la cinta de lo que se consigue en el mercado. */
export function Quien() {
  const ref = useRef<HTMLElement>(null);
  const quieto = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-35%"]);

  return (
    <section ref={ref} id="quien" className="quien" data-guia="quien">
      <div className="quien__ventana" aria-hidden="true">
        <motion.p className="quien__cinta" style={quieto ? undefined : { x }}>
          {[...CINTA, ...CINTA].map((palabra, i) => (
            <span key={i}>{palabra}</span>
          ))}
        </motion.p>
      </div>

      <div className="quien__cuerpo">
        <h2 className="quien__titulo">Compramos como para nuestra mesa.</h2>

        <div className="quien__retrato">
          <IllaViva gesto="canasta" titulo="Illa con su canasta llena de la compra del día" />
          <p className="mano-etiqueta">{MANO.quien}</p>
        </div>

        <div className="quien__texto">
          <p className="quien__bajada">
            Detrás de cada compra hay una mamá con años de mercado encima. Sabe cuándo la palta está en su punto, qué
            tomate aguanta la semana y cuándo es mejor esperar a mañana.
          </p>
          <ul className="quien__lista">
            {CRITERIOS.map((c) => (
              <li key={c.titulo}>
                <h3>{c.titulo}</h3>
                <p>{c.texto}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
