"use client";

import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import { Escribiendo } from "./Escribiendo";

const TEXTO =
  "Levantarte de madrugada, caminar entre puestos, comparar, regatear y volver cargando las bolsas. Y recién ahí empieza tu día. Si trabajas, estudias o tienes hijos, esas horas valen oro. Déjanos esa parte a nosotras.";

function Palabra({ palabra, progreso, desde, hasta }: { palabra: string; progreso: MotionValue<number>; desde: number; hasta: number }) {
  const opacidad = useTransform(progreso, [desde, hasta], [0.16, 1]);
  return <motion.span style={{ opacity: opacidad }}>{palabra} </motion.span>;
}

/**
 * Manifiesto: el título se escribe solo y el párrafo se "enciende" palabra por palabra
 * a medida que haces scroll, como si lo fueras leyendo en voz alta.
 */
export function Manifiesto() {
  const ref = useRef<HTMLElement>(null);
  const quieto = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const palabras = TEXTO.split(" ");

  return (
    <section ref={ref} className="manifiesto manifiesto--vivo">
      <div className="manifiesto__marco">
      <h2 className="titulo-2" data-sin-dividir>
        <Escribiendo texto="Sabemos lo que es correr todo el día." velocidad={38} />
      </h2>
      <p className="bajada manifiesto__palabras" aria-label={TEXTO}>
        <span aria-hidden="true">
          {palabras.map((p, i) =>
            quieto ? (
              <span key={i}>{p} </span>
            ) : (
              <Palabra key={i} palabra={p} progreso={scrollYProgress} desde={i / palabras.length} hasta={Math.min(1, (i + 2.2) / (palabras.length + 2.2))} />
            ),
          )}
        </span>
      </p>
      </div>
    </section>
  );
}
