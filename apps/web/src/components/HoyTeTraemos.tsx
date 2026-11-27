"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { CINTA } from "@/lib/contenido";

/**
 * "Hoy te traemos…" con una palabra gigante que se escribe, se borra y cambia: frutas, verduras, papas…
 * Solo se mueve mientras está a la vista. Con "menos movimiento", muestra la lista completa sin animar.
 */
export function HoyTeTraemos() {
  const quieto = useReducedMotion() ?? false;
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [i, setI] = useState(0);
  const [n, setN] = useState(0);
  const [borrando, setBorrando] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const o = new IntersectionObserver(([x]) => setVisible(x?.isIntersecting ?? false), { threshold: 0.3 });
    o.observe(el);
    return () => o.disconnect();
  }, []);

  useEffect(() => {
    if (quieto || !visible) return;
    const palabra = CINTA[i % CINTA.length] ?? "";
    let t: number;
    if (!borrando && n < palabra.length) t = window.setTimeout(() => setN(n + 1), 85);
    else if (!borrando) t = window.setTimeout(() => setBorrando(true), 1500);
    else if (n > 0) t = window.setTimeout(() => setN(n - 1), 42);
    else {
      t = window.setTimeout(() => {
        setBorrando(false);
        setI(i + 1);
      }, 220);
    }
    return () => window.clearTimeout(t);
  }, [quieto, visible, n, borrando, i]);

  const palabra = CINTA[i % CINTA.length] ?? "";

  return (
    <section ref={ref} className="trae" aria-label="Lo que te traemos">
      <p className="trae__antes">Hoy te traemos</p>
      {quieto ? (
        <p className="trae__lista">{CINTA.join(", ").toLowerCase()}.</p>
      ) : (
        <p className="trae__palabra" aria-hidden="true">
          {palabra.slice(0, n)}
          <span className="trae__cursor" />
        </p>
      )}
      <p className="solo-lectores" aria-live="off">
        {CINTA.join(", ")}
      </p>
      <a className="boton boton--accion boton--grande" href="#pedir">
        Quiero mi compra
      </a>
    </section>
  );
}
