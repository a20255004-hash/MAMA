"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import type { Modalidad } from "@illari/db";
import { MODALIDADES } from "@/lib/contenido";

/** Evento con el que esta sección le avisa al formulario qué forma de comprar se eligió. */
export const EVENTO_MODALIDAD = "illari:modalidad";

/**
 * Las cuatro formas de comprar, en una fila que avanza de lado con el scroll.
 * La fila es una lista normal: con teclado se recorre igual.
 */
export function Formas() {
  const pista = useRef<HTMLDivElement>(null);
  const fila = useRef<HTMLUListElement>(null);
  const [recorrido, setRecorrido] = useState(0);
  const { scrollYProgress } = useScroll({ target: pista, offset: ["start start", "end end"] });
  const suave = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.0005 });
  const x = useTransform(suave, (v) => -v * recorrido);

  useEffect(() => {
    const medir = () => {
      if (fila.current) setRecorrido(Math.max(0, fila.current.scrollWidth - window.innerWidth));
    };
    medir();
    const o = new ResizeObserver(medir);
    if (fila.current) o.observe(fila.current);
    window.addEventListener("resize", medir);
    return () => {
      o.disconnect();
      window.removeEventListener("resize", medir);
    };
  }, []);

  function elegir(id: Modalidad) {
    window.dispatchEvent(new CustomEvent<Modalidad>(EVENTO_MODALIDAD, { detail: id }));
  }

  // Al enfocar una tarjeta con teclado, llevar el scroll hasta donde esa tarjeta queda visible.
  function alEnfocar(i: number) {
    const el = pista.current;
    if (!el || !recorrido) return;
    const inicio = el.getBoundingClientRect().top + window.scrollY;
    const largo = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: inicio + (i / (MODALIDADES.length - 1)) * largo });
  }

  return (
    <section ref={pista} id="formas" className="formas" data-guia="formas" data-tema="claro">
      <div className="formas__fija">
        <h2 className="formas__titulo">Compra como compras tú.</h2>
        <motion.ul ref={fila} className="formas__fila" style={{ x }}>
          {MODALIDADES.map((m, i) => (
            <li key={m.id} className={`forma forma--${m.id}`}>
              <h3 className="forma__nombre">{m.nombre}</h3>
              <p className="forma__resumen">{m.resumen}</p>
              <p className="forma__detalle">{m.detalle}</p>
              <a className="forma__pedir" href="#pedir" onClick={() => elegir(m.id)} onFocus={() => alEnfocar(i)}>
                Pedir así
                <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </li>
          ))}
        </motion.ul>
        <motion.span className="formas__barra" style={{ scaleX: suave }} aria-hidden="true" />
      </div>
    </section>
  );
}
