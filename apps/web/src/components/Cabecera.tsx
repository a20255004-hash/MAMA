"use client";

import { useEffect, useState } from "react";
import { MARCA } from "@illari/ui";

/** Cabecera fija. Toma el color (claro u oscuro) de la sección que tiene debajo. */
export function Cabecera() {
  const [tema, setTema] = useState("oscuro");

  useEffect(() => {
    let pendiente = 0;
    const leer = () => {
      pendiente = 0;
      for (const s of document.querySelectorAll<HTMLElement>("[data-tema]:not(.cabecera)")) {
        const r = s.getBoundingClientRect();
        if (r.top <= 40 && r.bottom > 40) {
          setTema(s.dataset.tema ?? "oscuro");
          return;
        }
      }
    };
    const alMover = () => {
      if (!pendiente) pendiente = requestAnimationFrame(leer);
    };
    leer();
    window.addEventListener("scroll", alMover, { passive: true });
    return () => {
      window.removeEventListener("scroll", alMover);
      cancelAnimationFrame(pendiente);
    };
  }, []);

  return (
    <header className="cabecera" data-tema={tema}>
      <a className="cabecera__marca" href="#inicio" aria-label={`${MARCA.nombre}, inicio`}>
        illari
      </a>
      <nav className="cabecera__nav" aria-label="Secciones">
        <a href="#formas">Formas de comprar</a>
        <a href="#pasos">Cómo funciona</a>
        <a href="#quien">Quién compra</a>
      </nav>
      <a className="cabecera__pedir" href="#pedir">
        Pedir
      </a>
    </header>
  );
}
