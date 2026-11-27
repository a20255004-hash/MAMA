"use client";

import { Suspense, useRef } from "react";
import { motion, transform, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "motion/react";
import { MARCA, enlaceWhatsApp } from "@illari/ui";
import { Cosecha } from "@/tres/Cosecha";
import { Escribiendo } from "./Escribiendo";
import { reproducir } from "@/lib/sonido";
import { usePrecargarFrutas } from "@/tres/Frutos";
import { Lienzo } from "@/tres/Lienzo";

/**
 * Apertura en tres actos. La pantalla queda fija mientras el scroll hace
 * avanzar la escena 3D: racimo, vuelo entre los productos y repisa al amanecer.
 * Los textos y los productos ocupan zonas distintas de la pantalla: nunca se enciman.
 */
export function Historia() {
  const pista = useRef<HTMLDivElement>(null);
  const quieto = useReducedMotion() ?? false;
  usePrecargarFrutas(); // fuera de Suspense: las diez frutas se bajan a la vez
  const { scrollYProgress: t } = useScroll({ target: pista, offset: ["start start", "end end"] });

  // En forma de función: el cálculo lo hace siempre el mismo código, en todos los navegadores.
  const amanece = useTransform(() => transform(t.get(), [0.6, 0.92], [0, 1]));
  const opacidad1 = useTransform(() => transform(t.get(), [0.06, 0.16], [1, 0]));
  const opacidad2 = useTransform(() => transform(t.get(), [0.4, 0.46, 0.54, 0.6], [0, 1, 1, 0]));
  const opacidad3 = useTransform(() => transform(t.get(), [0.86, 0.94], [0, 1]));
  const toca1 = useTransform(() => (t.get() < 0.14 ? "auto" : "none"));

  // Suena una sola vez cada vez que sale el sol; vuelve a armarse si la persona sube de nuevo.
  const yaAmanecio = useRef(false);
  useMotionValueEvent(t, "change", (v) => {
    if (v > 0.86 && !yaAmanecio.current) {
      yaAmanecio.current = true;
      reproducir("amanecer");
    } else if (v < 0.7) {
      yaAmanecio.current = false;
    }
  });

  return (
    <section ref={pista} id="inicio" className="historia" data-guia="inicio">
      <div className="historia__escena">
        <motion.div className="historia__amanecer" style={{ opacity: amanece }} aria-hidden="true" />
        <Lienzo className="historia__lienzo">
          <Suspense fallback={null}>
            <Cosecha avance={t} quieto={quieto} />
          </Suspense>
        </Lienzo>

        <motion.div className="acto acto--uno" style={{ opacity: opacidad1, pointerEvents: toca1 }}>
          <h1 className="acto__titulo">Duerme un ratito más. Hoy vamos al mercado por ti.</h1>
          <Escribiendo
            como="p"
            className="acto__texto"
            texto={`Escogemos tu fruta, tu verdura y tu pollo en el ${MARCA.mercado} como si fueran para nuestra propia mesa, y te los llevamos a casa.`}
            velocidad={20}
            retraso={900}
          />
          <div className="acto__acciones">
            <a className="boton boton--accion" href="#pedir">
              Quiero mi compra
            </a>
            <a
              className="boton boton--borde"
              href={enlaceWhatsApp(`Hola, quiero pedir una compra del ${MARCA.mercado}.`)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Escríbenos por WhatsApp
            </a>
          </div>
        </motion.div>

        <motion.p className="acto acto--dos" style={{ opacity: opacidad2 }}>
          De madrugada, cuando {MARCA.ciudad} todavía duerme, ya estamos saludando a los caseros.
        </motion.p>

        <motion.p className="acto acto--tres" style={{ opacity: opacidad3 }}>
          Y cuando sale el sol, tu compra ya va camino a tu casa.
        </motion.p>
      </div>
    </section>
  );
}
