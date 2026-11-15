"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { Lienzo } from "@/tres/Lienzo";
import { Mascota } from "@/tres/Mascota";
import { CINTA, CRITERIOS } from "@/lib/contenido";

/** Quién compra: el criterio de una mamá, con Illa en 3D y la cinta de lo que se consigue en el mercado. */
export function Quien() {
  const ref = useRef<HTMLElement>(null);
  const quieto = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], ["4%", "-38%"]);
  const subir = useTransform(scrollYProgress, [0, 1], ["8%", "-8%"]);

  return (
    <section ref={ref} id="quien" className="quien" data-guia="quien" data-tema="oscuro">
      <motion.p className="quien__cinta" style={quieto ? undefined : { x }} aria-hidden="true">
        {[...CINTA, ...CINTA].map((palabra, i) => (
          <span key={i}>{palabra}</span>
        ))}
      </motion.p>

      <div className="quien__cuerpo">
        <motion.div className="quien__retrato" style={quieto ? undefined : { y: subir }}>
          <Lienzo className="quien__lienzo" camara={[0, 0, 4.1]} fov={34}>
            <group position={[0, 0.4, 0]}>
              <Mascota quieto={quieto} />
            </group>
          </Lienzo>
        </motion.div>

        <div className="quien__texto">
          <h2 className="quien__titulo">Elegimos como para nuestra casa.</h2>
          <p className="quien__bajada">
            Detrás de cada compra hay una mamá que lleva años haciendo el mercado. Sabe cuándo una fruta está en su
            punto y cuándo conviene esperar a mañana.
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
