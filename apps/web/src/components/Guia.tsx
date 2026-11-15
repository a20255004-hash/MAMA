"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Casera } from "@casera/ui";
import { GUIA } from "@/lib/contenido";

const CLAVE = "casera:guia-oculta";

/**
 * La casera acompaña la lectura con una frase por sección.
 * Se puede cerrar y la decisión se recuerda en este dispositivo.
 */
export function Guia() {
  const [seccion, setSeccion] = useState("inicio");
  const [oculta, setOculta] = useState(true);
  const quieto = useReducedMotion();

  useEffect(() => {
    try {
      const guardada = localStorage.getItem(CLAVE);
      // En pantallas chicas empieza recogida para no tapar el contenido.
      setOculta(guardada ? guardada === "1" : window.matchMedia("(max-width: 40rem)").matches);
    } catch {
      setOculta(false);
    }
    const secciones = document.querySelectorAll<HTMLElement>("[data-guia]");
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (e.isIntersecting) setSeccion(e.target.getAttribute("data-guia") ?? "inicio");
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    secciones.forEach((s) => observador.observe(s));
    return () => observador.disconnect();
  }, []);

  function alternar(valor: boolean) {
    setOculta(valor);
    try {
      localStorage.setItem(CLAVE, valor ? "1" : "0");
    } catch {
      /* sin almacenamiento: la preferencia dura solo esta visita */
    }
  }

  const frase = GUIA[seccion] ?? GUIA.inicio;

  return (
    <aside className="guia" aria-label="La casera te acompaña">
      {!oculta && (
        <div className="guia__globo">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={seccion}
              initial={quieto ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={quieto ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              {frase}
            </motion.p>
          </AnimatePresence>
          <button type="button" className="guia__cerrar" onClick={() => alternar(true)} aria-label="Ocultar a la casera">
            <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}
      <button
        type="button"
        className="guia__avatar"
        onClick={() => alternar(!oculta)}
        aria-expanded={!oculta}
        aria-label={oculta ? "Mostrar a la casera" : "Ocultar a la casera"}
      >
        <Casera gesto="saluda" />
      </button>
    </aside>
  );
}
