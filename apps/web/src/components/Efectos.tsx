"use client";

import { useReducedMotion } from "motion/react";
import { useEffect } from "react";

const TITULOS = ".titulo-2:not([data-sin-dividir]), .quien__titulo";
const BLOQUES = ".bajada:not(.manifiesto__palabras), .quien__bajada, .quien__lista li, .pedir__intro p";

/**
 * Efectos de la página, todos juntos para que sean fáciles de apagar:
 * - Los títulos se "descubren" palabra por palabra al entrar en pantalla.
 * - Los párrafos suben suavemente.
 * - Los botones principales se acercan un poquito al puntero (efecto imán).
 * - Un anillo suave acompaña al puntero en pantallas con ratón.
 * Con "menos movimiento" no se activa nada, y sin JavaScript la página se ve completa.
 */
export function Efectos() {
  const quieto = useReducedMotion() ?? false;

  // Revelado de títulos y párrafos.
  useEffect(() => {
    if (quieto) return;
    const html = document.documentElement;
    html.classList.add("js-efectos");

    document.querySelectorAll<HTMLElement>(TITULOS).forEach((el) => {
      if (el.dataset.dividido) return;
      el.dataset.dividido = "1";
      const texto = el.textContent ?? "";
      el.setAttribute("aria-label", texto);
      el.textContent = "";
      texto.split(" ").forEach((palabra, i, todas) => {
        const caja = document.createElement("span");
        caja.className = "rv-palabra";
        caja.setAttribute("aria-hidden", "true");
        const dentro = document.createElement("span");
        dentro.textContent = palabra;
        dentro.style.setProperty("--i", String(i));
        caja.appendChild(dentro);
        el.appendChild(caja);
        if (i < todas.length - 1) el.appendChild(document.createTextNode(" "));
      });
      el.classList.add("rv");
    });
    document.querySelectorAll<HTMLElement>(BLOQUES).forEach((el, i) => {
      el.classList.add("rv", "rv-bloque");
      el.style.setProperty("--i", String(i % 4));
    });

    const o = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (e.isIntersecting) {
            e.target.classList.add("rv--vista");
            o.unobserve(e.target);
          }
        }
      },
      { threshold: 0.25, rootMargin: "0px 0px -8% 0px" },
    );
    document.querySelectorAll(".rv").forEach((el) => o.observe(el));
    return () => {
      o.disconnect();
      html.classList.remove("js-efectos");
    };
  }, [quieto]);

  // Imán en los botones principales y anillo que sigue al puntero (solo con ratón).
  useEffect(() => {
    if (quieto || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const anillo = document.createElement("div");
    anillo.className = "anillo";
    anillo.setAttribute("aria-hidden", "true");
    document.body.appendChild(anillo);

    let x = -100;
    let y = -100;
    let ax = -100;
    let ay = -100;
    let marco = 0;
    const imanes = () => Array.from(document.querySelectorAll<HTMLElement>(".boton--accion, .boton--grande, .cabecera__marca"));

    const bucle = () => {
      ax += (x - ax) * 0.2;
      ay += (y - ay) * 0.2;
      anillo.style.transform = `translate3d(${ax}px, ${ay}px, 0) translate(-50%, -50%)`;
      marco = requestAnimationFrame(bucle);
    };
    marco = requestAnimationFrame(bucle);

    const mover = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      const sobre = (e.target as Element | null)?.closest("a, button, [role=button], input, textarea, select, label");
      anillo.classList.toggle("anillo--sobre", Boolean(sobre));
      for (const b of imanes()) {
        const r = b.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        const cerca = Math.abs(dx) < r.width / 2 + 40 && Math.abs(dy) < r.height / 2 + 40;
        b.style.transition = cerca ? "transform 90ms ease-out" : "transform 420ms cubic-bezier(0.16, 1, 0.3, 1)";
        b.style.transform = cerca ? `translate(${(dx * 0.18).toFixed(1)}px, ${(dy * 0.28).toFixed(1)}px)` : "";
      }
    };
    const salir = () => {
      anillo.classList.add("anillo--fuera");
    };
    const entrar = () => anillo.classList.remove("anillo--fuera");
    window.addEventListener("pointermove", mover, { passive: true });
    document.documentElement.addEventListener("pointerleave", salir);
    document.documentElement.addEventListener("pointerenter", entrar);
    return () => {
      cancelAnimationFrame(marco);
      window.removeEventListener("pointermove", mover);
      document.documentElement.removeEventListener("pointerleave", salir);
      document.documentElement.removeEventListener("pointerenter", entrar);
      anillo.remove();
      for (const b of imanes()) {
        b.style.transform = "";
        b.style.transition = "";
      }
    };
  }, [quieto]);

  return null;
}
