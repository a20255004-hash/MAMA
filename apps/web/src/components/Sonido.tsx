"use client";

import { useEffect, useSyncExternalStore } from "react";
import { alternarSonido, estaActivo, iniciarSonido, suscribir } from "@/lib/sonido";

/** Botón de la cabecera para activar o silenciar los sonidos de la página. */
export function Sonido() {
  const activo = useSyncExternalStore(suscribir, estaActivo, () => true);

  useEffect(() => {
    iniciarSonido();
  }, []);

  return (
    <button
      type="button"
      className="sonido"
      data-sin-sonido
      aria-pressed={activo}
      aria-label="Sonido de la página"
      title={activo ? "Silenciar" : "Activar sonido"}
      onClick={alternarSonido}
    >
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 9.5v5h3.5L12 18.5v-13L7.500 9.500z" fill="currentColor" stroke="none" />
        {activo ? (
          <>
            <path d="M15.500 9a4 4 0 0 1 0 6" />
            <path d="M18 6.500a8 8 0 0 1 0 11" />
          </>
        ) : (
          <path d="M16 9.500l5 5M21 9.500l-5 5" />
        )}
      </svg>
    </button>
  );
}
