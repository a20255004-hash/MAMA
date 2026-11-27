"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ElementType } from "react";

/** La bienvenida avisa con este evento cuando se cierra; el texto no se escribe detrás de ella. */
export const EVENTO_BIENVENIDA_CERRADA = "illari:bienvenida-cerrada";

function bienvenidaAbierta(): boolean {
  return Boolean(document.querySelector(".bienvenida")) && document.documentElement.dataset.bienvenida !== "vista";
}

/**
 * Texto que se escribe solo, letra por letra, cuando llega a la pantalla (y después de la bienvenida).
 * Quien usa lector de pantalla recibe el texto completo desde el inicio; con "menos movimiento" aparece de una vez.
 * El espacio se reserva desde el principio, así nada salta ni se mueve al escribirse.
 */
export function Escribiendo({
  texto,
  como: Etiqueta = "span",
  className,
  velocidad = 34,
  retraso = 250,
}: {
  texto: string;
  como?: ElementType;
  className?: string;
  /** Milisegundos por letra. */
  velocidad?: number;
  /** Milisegundos antes de empezar. */
  retraso?: number;
}) {
  const quieto = useReducedMotion() ?? false;
  const ref = useRef<HTMLElement>(null);
  const [n, setN] = useState(0);
  const [listo, setListo] = useState(false);
  const [arranca, setArranca] = useState(false);

  // Empieza cuando está a la vista y la bienvenida ya se cerró.
  useEffect(() => {
    if (quieto) return;
    const el = ref.current;
    if (!el) return;
    let visible = false;
    let libre = !bienvenidaAbierta();
    const comprobar = () => {
      if (visible && libre) setArranca(true);
    };
    const o = new IntersectionObserver(
      ([x]) => {
        visible = x?.isIntersecting ?? false;
        comprobar();
      },
      { threshold: 0.35 },
    );
    o.observe(el);
    const alCerrar = () => {
      libre = true;
      comprobar();
    };
    window.addEventListener(EVENTO_BIENVENIDA_CERRADA, alCerrar);
    return () => {
      o.disconnect();
      window.removeEventListener(EVENTO_BIENVENIDA_CERRADA, alCerrar);
    };
  }, [quieto]);

  useEffect(() => {
    if (!arranca || listo) return;
    let i = 0;
    let reloj = window.setTimeout(function paso() {
      i += 1;
      setN(i);
      if (i >= texto.length) return setListo(true);
      // Un respiro un poco más largo después de cada signo, como si alguien escribiera.
      const pausa = /[.,;:]/.test(texto[i - 1] ?? "") ? velocidad * 7 : velocidad + Math.random() * 18;
      reloj = window.setTimeout(paso, pausa);
    }, retraso);
    return () => window.clearTimeout(reloj);
  }, [arranca, listo, texto, velocidad, retraso]);

  const E = Etiqueta;
  if (quieto) return <E className={className}>{texto}</E>;

  return (
    <E ref={ref} className={className} aria-label={texto}>
      <span className="escribiendo" aria-hidden="true">
        <span className="escribiendo__fantasma">{texto}</span>
        <span className="escribiendo__texto">
          {texto.slice(0, n)}
          <span className={`escribiendo__cursor${listo ? " escribiendo__cursor--fin" : ""}`} />
        </span>
      </span>
    </E>
  );
}
