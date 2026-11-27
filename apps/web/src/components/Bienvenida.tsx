"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Logo, MARCA } from "@illari/ui";
import { EVENTO_BIENVENIDA_CERRADA } from "./Escribiendo";
import { IllaViva } from "./IllaViva";
import { iniciarSonido, reproducir } from "@/lib/sonido";

const CLAVE_VISTA = "illari:bienvenida";
const CLAVE_VISITA = "illari:visita";

/** Sol grande de fondo: disco amarillo con dos tamaños de rayos, muy suaves. */
function SolDeFondo() {
  const rayos = Array.from({ length: 16 }, (_, i) => i);
  return (
    <svg viewBox="-100 -100 200 200" aria-hidden="true" focusable="false" className="bienvenida__sol-svg">
      <g className="bienvenida__rayos">
        {rayos.map((i) => (
          <rect
            key={i}
            x="-2.4"
            y={i % 2 ? -96 : -90}
            width="4.8"
            height={i % 2 ? 22 : 30}
            rx="2.4"
            fill="var(--sol-rayo)"
            opacity={i % 2 ? 0.28 : 0.4}
            transform={`rotate(${i * 22.5})`}
          />
        ))}
      </g>
      <circle r="58" fill="var(--sol)" opacity="0.92" />
      <circle r="58" fill="none" stroke="var(--sol-rayo)" strokeOpacity="0.25" strokeWidth="1.5" />
    </svg>
  );
}

function saludoDeLaHora(): string {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}

/**
 * Bienvenida: lo primero que ve quien entra. Un amanecer, un saludo según la hora y a Illa
 * recibiéndote. Aparece una vez por visita (si recargas, ya no estorba) y se puede cerrar con
 * el botón o con Escape. El botón también despierta los sonidos, que los navegadores solo
 * permiten tras un toque.
 */
export function Bienvenida() {
  const [abierta, setAbierta] = useState(true);
  const [saludo, setSaludo] = useState<string | null>(null);
  const [regresa, setRegresa] = useState(false);
  const raiz = useRef<HTMLDivElement>(null);
  const boton = useRef<HTMLButtonElement>(null);
  const sinMovimiento = useReducedMotion();

  // Decide si mostrarla y con qué palabras.
  useEffect(() => {
    let vista = false;
    let anterior = false;
    try {
      vista = sessionStorage.getItem(CLAVE_VISTA) === "1";
      anterior = localStorage.getItem(CLAVE_VISITA) === "1";
    } catch {
      /* sin almacenamiento: se muestra igual */
    }
    if (vista) {
      setAbierta(false);
      return;
    }
    setSaludo(saludoDeLaHora());
    setRegresa(anterior);
    iniciarSonido();
  }, []);

  const cerrar = useCallback(() => {
    try {
      sessionStorage.setItem(CLAVE_VISTA, "1");
      localStorage.setItem(CLAVE_VISITA, "1");
    } catch {
      /* se vuelve a mostrar en la próxima visita, nada grave */
    }
    document.documentElement.dataset.bienvenida = "vista";
    setAbierta(false);
    window.dispatchEvent(new Event(EVENTO_BIENVENIDA_CERRADA));
    // El audio necesita un instante para despertar tras el toque.
    window.setTimeout(() => reproducir("amanecer"), 140);
  }, []);

  // Mientras está abierta: no se desplaza la página de atrás, el foco se queda aquí y Escape cierra.
  useEffect(() => {
    if (!abierta) return;
    const html = document.documentElement;
    const antes = html.style.overflow;
    html.style.overflow = "hidden";

    const detras = Array.from(document.body.children).filter(
      (el): el is HTMLElement => el instanceof HTMLElement && el !== raiz.current && el.tagName !== "SCRIPT",
    );
    const previos = detras.map((el) => el.inert);
    detras.forEach((el) => {
      el.inert = true;
    });
    boton.current?.focus({ preventScroll: true });

    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape") cerrar();
    };
    window.addEventListener("keydown", alTeclear);
    return () => {
      html.style.overflow = antes;
      detras.forEach((el, i) => {
        el.inert = previos[i] ?? false;
      });
      window.removeEventListener("keydown", alTeclear);
    };
  }, [abierta, cerrar]);

  return (
    <AnimatePresence>
      {abierta && (
        <motion.div
          ref={raiz}
          className="bienvenida"
          role="dialog"
          aria-modal="true"
          aria-labelledby="bienvenida-titulo"
          initial={false}
          exit={sinMovimiento ? { opacity: 0 } : { opacity: 0, y: -28 }}
          transition={{ duration: sinMovimiento ? 0.01 : 0.3, ease: [0.7, 0, 0.84, 0] }}
          data-sin-sonido
        >
          <div className="bienvenida__cielo" aria-hidden="true">
            <div className="bienvenida__sol">
              <SolDeFondo />
            </div>
            <div className="bienvenida__suelo" />
          </div>

          <div className="bienvenida__marco">
            <div className="bienvenida__logo">
              <Logo />
            </div>

            <div className="bienvenida__cuerpo">
              <div className="bienvenida__texto">
                <p className="bienvenida__mano" aria-live="polite">
                  {saludo ? `${saludo}, ${regresa ? "qué bueno verte de nuevo" : "qué gusto verte"}` : " "}
                </p>
                <h2 id="bienvenida-titulo" className="bienvenida__titulo">
                  Duerme un ratito más.
                </h2>
                <p className="bienvenida__sub">Hoy vamos al mercado por ti.</p>
                <p className="bienvenida__detalle">
                  Soy Illa. Mientras tú descansas, yo recorro el {MARCA.mercado} y escojo tu fruta, tu verdura y tu
                  pollo como para mi propia mesa.
                </p>
                <button ref={boton} type="button" className="boton boton--accion boton--grande bienvenida__entrar" onClick={cerrar}>
                  Pasa, estás en tu casa
                </button>
              </div>

              <div className="bienvenida__illa">
                <IllaViva gesto="saluda" />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
