"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Modalidad } from "@casera/db";
import { Fruto } from "@casera/ui";
import { MODALIDADES } from "@/lib/contenido";

/** Evento con el que esta sección le avisa al formulario qué forma de comprar se eligió. */
export const EVENTO_MODALIDAD = "casera:modalidad";

export function Modalidades() {
  const [activa, setActiva] = useState<Modalidad>("paquete");
  const quieto = useReducedMotion();
  const base = useId();
  const actual = MODALIDADES.find((m) => m.id === activa) ?? MODALIDADES[0]!;

  function pedirAsi() {
    window.dispatchEvent(new CustomEvent<Modalidad>(EVENTO_MODALIDAD, { detail: activa }));
  }

  function alTeclear(e: React.KeyboardEvent, i: number) {
    const paso = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (!paso) return;
    e.preventDefault();
    const siguiente = MODALIDADES[(i + paso + MODALIDADES.length) % MODALIDADES.length]!;
    setActiva(siguiente.id);
    document.getElementById(`${base}-tab-${siguiente.id}`)?.focus();
  }

  return (
    <section id="modos" className="seccion modos" data-guia="modos">
      <h2 className="titulo-2">Compra como compras tú.</h2>
      <div className="modos__cuerpo">
        <div className="modos__lista" role="tablist" aria-label="Formas de comprar" aria-orientation="vertical">
          {MODALIDADES.map((m, i) => (
            <button
              key={m.id}
              id={`${base}-tab-${m.id}`}
              role="tab"
              type="button"
              aria-selected={m.id === activa}
              aria-controls={`${base}-panel`}
              tabIndex={m.id === activa ? 0 : -1}
              className="modo"
              onClick={() => setActiva(m.id)}
              onKeyDown={(e) => alTeclear(e, i)}
            >
              <span className="modo__nombre">{m.nombre}</span>
              <span className="modo__resumen">{m.resumen}</span>
            </button>
          ))}
        </div>

        <div id={`${base}-panel`} role="tabpanel" aria-labelledby={`${base}-tab-${activa}`} className="modos__panel">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={actual.id}
              className="modos__detalle"
              initial={quieto ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={quieto ? undefined : { opacity: 0, y: -12 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="modos__frutos" aria-hidden="true">
                {actual.frutos.map((f, i) => (
                  <motion.span
                    key={f + i}
                    initial={quieto ? false : { scale: 0.4, rotate: -30 }}
                    animate={{ scale: 1, rotate: (i - 1) * 9 }}
                    transition={{ type: "spring", stiffness: 260, damping: 16, delay: i * 0.05 }}
                  >
                    <Fruto tipo={f} />
                  </motion.span>
                ))}
              </div>
              <p className="modos__texto">{actual.detalle}</p>
              <a className="boton boton--buganvilla" href="#pedir" onClick={pedirAsi}>
                Pedir con {actual.nombre.toLowerCase()}
              </a>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
