"use client";

import { useRef, useState } from "react";
import { useMotionValueEvent, useScroll } from "motion/react";
import { PASOS } from "@/lib/contenido";
import { reproducir } from "@/lib/sonido";

/**
 * Los cuatro momentos de una compra. La pantalla queda fija y el número cambia con
 * el scroll. Los cuatro pasos están apilados en el mismo lugar y se cruzan con una
 * transición CSS, así que el paso visible siempre coincide con el scroll.
 * La lista completa queda disponible para lectores de pantalla.
 */
export function Pasos() {
  const pista = useRef<HTMLDivElement>(null);
  const [activo, setActivo] = useState(0);
  const { scrollYProgress } = useScroll({ target: pista, offset: ["start start", "end end"] });

  const ultimo = useRef(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const nuevo = Math.min(PASOS.length - 1, Math.max(0, Math.floor(v * PASOS.length)));
    if (nuevo !== ultimo.current) {
      ultimo.current = nuevo;
      reproducir("paso", nuevo);
    }
    setActivo(nuevo);
  });

  return (
    <section ref={pista} id="pasos" className="pasos" data-guia="pasos">
      <div className="pasos__fija">
        <h2 className="titulo-2">Así de fácil es.</h2>

        <div className="pasos__cuerpo" aria-hidden="true">
          {PASOS.map((p, i) => (
            <div key={p.titulo} className="paso" data-estado={i === activo ? "activo" : i < activo ? "antes" : "despues"}>
              <span className="pasos__numero">{i + 1}</span>
              <div className="pasos__texto">
                <p className="pasos__momento">{p.momento}</p>
                <p className="pasos__paso">{p.titulo}</p>
                <p className="pasos__detalle">{p.texto}</p>
              </div>
            </div>
          ))}
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
