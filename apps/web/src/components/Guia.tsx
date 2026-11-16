"use client";

import { useEffect, useRef, useState } from "react";
import type { Modalidad } from "@illari/db";
import { Illa } from "@illari/ui";
import { AYUDA, GUIA, MODALIDADES } from "@/lib/contenido";
import { EVENTO_MODALIDAD } from "./Formas";

const CLAVE = "illari:guia-callada";
const SEGUNDOS_VISIBLE = 7;

type Vista = { tipo: "frase" } | { tipo: "pregunta" } | { tipo: "resultado"; modalidad: Modalidad };

/**
 * Illa acompaña al cliente por toda la página. Al llegar a cada sección dice
 * algo breve y se calla sola para no tapar el contenido. Si la persona no sabe
 * qué forma de compra le conviene, se lo pregunta y la lleva al pedido.
 * Se la puede callar; la decisión se recuerda en este dispositivo.
 */
export function Guia() {
  const [seccion, setSeccion] = useState("inicio");
  const [callada, setCallada] = useState(true);
  const [abierto, setAbierto] = useState(false);
  const [vista, setVista] = useState<Vista>({ tipo: "frase" });
  const sobre = useRef(false);

  useEffect(() => {
    try {
      setCallada(localStorage.getItem(CLAVE) === "1");
    } catch {
      setCallada(false);
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

  // Al cambiar de sección, Illa habla (si no la callaron) y vuelve a la frase.
  useEffect(() => {
    if (callada) return;
    setVista({ tipo: "frase" });
    setAbierto(true);
  }, [seccion, callada]);

  // Se calla sola a los pocos segundos, salvo que estén conversando con ella.
  useEffect(() => {
    if (!abierto || vista.tipo !== "frase") return;
    const reloj = window.setTimeout(() => {
      if (!sobre.current) setAbierto(false);
    }, SEGUNDOS_VISIBLE * 1000);
    return () => window.clearTimeout(reloj);
  }, [abierto, vista, seccion]);

  function callar() {
    setAbierto(false);
    setCallada(true);
    setVista({ tipo: "frase" });
    try {
      localStorage.setItem(CLAVE, "1");
    } catch {
      /* sin almacenamiento: la preferencia dura solo esta visita */
    }
  }

  function alTocarIlla() {
    if (abierto) return setAbierto(false);
    setCallada(false);
    setAbierto(true);
    try {
      localStorage.setItem(CLAVE, "0");
    } catch {
      /* sin almacenamiento */
    }
  }

  function irAPedir(modalidad: Modalidad) {
    window.dispatchEvent(new CustomEvent<Modalidad>(EVENTO_MODALIDAD, { detail: modalidad }));
    document.getElementById("pedir")?.scrollIntoView({ behavior: "smooth" });
    setVista({ tipo: "frase" });
    setAbierto(false);
  }

  const elegida = vista.tipo === "resultado" ? MODALIDADES.find((m) => m.id === vista.modalidad) : undefined;
  const ofreceAyuda = seccion === "inicio" || seccion === "formas";

  return (
    <aside
      className="guia"
      aria-label="Illa te acompaña"
      data-seccion={seccion}
      onPointerEnter={() => (sobre.current = true)}
      onPointerLeave={() => (sobre.current = false)}
    >
      {abierto && (
        <div className="guia__globo" key={`${vista.tipo}-${seccion}`}>
          <button type="button" className="guia__cerrar" onClick={callar} aria-label="Callar a Illa">
            <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          {vista.tipo === "frase" && (
            <>
              <p>{GUIA[seccion] ?? GUIA.inicio}</p>
              {ofreceAyuda && (
                <button type="button" className="guia__accion" onClick={() => setVista({ tipo: "pregunta" })}>
                  Ayúdame a elegir
                </button>
              )}
            </>
          )}

          {vista.tipo === "pregunta" && (
            <>
              <p>{AYUDA.pregunta}</p>
              <ul className="guia__opciones">
                {AYUDA.opciones.map((o) => (
                  <li key={o.modalidad}>
                    <button type="button" onClick={() => setVista({ tipo: "resultado", modalidad: o.modalidad })}>
                      {o.texto}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}

          {vista.tipo === "resultado" && elegida && (
            <>
              <p>
                Entonces lo tuyo es <strong>{elegida.nombre.toLowerCase()}</strong>. {elegida.detalle}
              </p>
              <button type="button" className="guia__accion" onClick={() => irAPedir(elegida.id)}>
                Vamos a pedirlo
              </button>
            </>
          )}
        </div>
      )}

      <button
        type="button"
        className="guia__illa"
        onClick={alTocarIlla}
        aria-expanded={abierto}
        aria-label={abierto ? "Ocultar lo que dice Illa" : "Hablar con Illa"}
      >
        <Illa key={abierto ? seccion : "quieta"} gesto="saluda" />
      </button>
    </aside>
  );
}
