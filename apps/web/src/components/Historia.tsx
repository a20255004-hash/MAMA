"use client";

import { useRef } from "react";
import { motion, transform, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "motion/react";
import { MARCA, enlaceWhatsApp } from "@illari/ui";
import { Cosecha } from "@/tres/Cosecha";
import { Lienzo } from "@/tres/Lienzo";

const TITULO = ["Mientras duermes,", "hacemos", "tu mercado."];

/**
 * Apertura en tres actos. La pantalla queda fija mientras el scroll hace
 * avanzar la escena 3D: racimo, vuelo entre los productos y repisa al amanecer.
 */
export function Historia() {
  const pista = useRef<HTMLDivElement>(null);
  const quieto = useReducedMotion() ?? false;
  const { scrollYProgress: t } = useScroll({ target: pista, offset: ["start start", "end end"] });

  const fondo = useTransform(t, [0, 0.55, 0.74, 0.9, 1], ["#ffe9dc", "#ffe4cf", "#ffd6a8", "#ffc284", "#ffb56b"]);
  // En forma de función: así el cálculo lo hace siempre el mismo código y no el navegador.
  const opacidad1 = useTransform(() => transform(t.get(), [0.1, 0.2], [1, 0]));
  const subir1 = useTransform(() => transform(t.get(), [0, 0.2], [0, -12]) + "%");
  const opacidad2 = useTransform(() => transform(t.get(), [0.26, 0.36, 0.5, 0.58], [0, 1, 1, 0]));
  const opacidad3 = useTransform(() => transform(t.get(), [0.8, 0.92], [0, 1]));
  const visible1 = useTransform(t, (v) => (v < 0.2 ? "auto" : "none"));
  const visible3 = useTransform(t, (v) => (v > 0.85 ? "auto" : "none"));

  // La cabecera cambia de color cuando la escena amanece.
  useMotionValueEvent(t, "change", (v) => {
    pista.current?.setAttribute("data-tema", v > 0.8 ? "claro" : "oscuro");
  });

  return (
    <section ref={pista} id="inicio" className="historia" data-guia="inicio" data-tema="oscuro">
      <motion.div className="historia__escena" style={{ backgroundColor: fondo }}>
        <Lienzo className="historia__lienzo">
          <Cosecha avance={t} quieto={quieto} />
        </Lienzo>

        <motion.div className="acto acto--uno" style={{ opacity: opacidad1, y: subir1, pointerEvents: visible1 }}>
          <h1 className="acto__titulo">
            {TITULO.map((linea, i) => (
              <span key={linea} className="mascara">
                <motion.span
                  initial={quieto ? false : { y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1.1, delay: 0.15 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                >
                  {linea}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.div
            className="acto__pie"
            initial={quieto ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            <p>
              Compras del {MARCA.mercado} por encargo. Alguien que conoce cada puesto elige por ti y lo lleva a tu
              casa.
            </p>
            <div className="acto__acciones">
              <a className="boton boton--tomate" href="#pedir">
                Pedir mi compra
              </a>
              <a
                className="boton boton--borde"
                href={enlaceWhatsApp(`Hola, quiero pedir una compra del ${MARCA.mercado}.`)}
                target="_blank"
                rel="noopener noreferrer"
              >
                Escribir por WhatsApp
              </a>
            </div>
          </motion.div>
        </motion.div>

        <motion.p className="acto acto--dos" style={{ opacity: opacidad2 }}>
          Una mamá que lleva años haciendo el mercado elige tu compra, pieza por pieza.
        </motion.p>

        <motion.div className="acto acto--tres" style={{ opacity: opacidad3, pointerEvents: visible3 }}>
          <p>Y cuando amanece en {MARCA.ciudad}, tu compra ya va camino a casa.</p>
        </motion.div>

        <motion.span className="historia__baja" style={{ opacity: opacidad1 }} aria-hidden="true">
          Baja para ver la madrugada
        </motion.span>
      </motion.div>
    </section>
  );
}
