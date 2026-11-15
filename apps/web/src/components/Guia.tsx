"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Lienzo } from "@/tres/Lienzo";
import { Mascota } from "@/tres/Mascota";
import { GUIA } from "@/lib/contenido";

const CLAVE = "illari:guia-oculta";

/**
 * Illa acompaña la lectura con una frase por sección y sigue al puntero con la mirada.
 * Se puede recoger y la decisión se recuerda en este dispositivo.
 */
export function Guia() {
  const [seccion, setSeccion] = useState("inicio");
  const [oculta, setOculta] = useState(true);
  const quieto = useReducedMotion() ?? false;

  useEffect(() => {
    try {
      const guardada = localStorage.getItem(CLAVE);
      // En pantallas chicas empieza recogida para no tapar el contenido.
      setOculta(guardada ? guardada === "1" : window.matchMedia("(max-width: 40rem)").matches);
    } catch {
      setOculta(false);
    }
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (e.isIntersecting) setSeccion(e.target.getAttribute("data-guia") ?? "inicio");
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    document.querySelectorAll("[data-guia]").forEach((s) => observador.observe(s));
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

  return (
    <aside className="guia" aria-label="Illa te acompaña">
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
              {GUIA[seccion] ?? GUIA.inicio}
            </motion.p>
          </AnimatePresence>
        </div>
      )}
      <button
        type="button"
        className="guia__avatar"
        onClick={() => alternar(!oculta)}
        aria-expanded={!oculta}
        aria-label={oculta ? "Mostrar lo que dice Illa" : "Ocultar lo que dice Illa"}
      >
        <Lienzo className="guia__lienzo" camara={[0, 0.1, 3.1]} fov={30}>
          <group position={[0, -0.22, 0]}>
            <Mascota quieto={quieto} saluda={!oculta} />
          </group>
        </Lienzo>
      </button>
    </aside>
  );
}
