"use client";

import { useEffect, useState } from "react";

const ESTILOS = [
  { id: "huerta", nombre: "Huerta" },
  { id: "sol", nombre: "Sol" },
  { id: "rocoto", nombre: "Rocoto" },
] as const;
const CLAVE = "illari:estilo";

/**
 * TEMPORAL: selector para que la dueña compare los tres estilos de color y letra
 * sobre la página real. Cuando elija uno, se borra este archivo y los otros dos estilos.
 */
export function Estilos() {
  const [activo, setActivo] = useState<string>("huerta");

  useEffect(() => {
    let inicial = "huerta";
    try {
      inicial = new URLSearchParams(location.search).get("estilo") ?? localStorage.getItem(CLAVE) ?? "huerta";
    } catch {
      /* sin almacenamiento */
    }
    if (ESTILOS.some((e) => e.id === inicial)) aplicar(inicial);
  }, []);

  function aplicar(id: string) {
    document.documentElement.dataset.estilo = id;
    setActivo(id);
    try {
      localStorage.setItem(CLAVE, id);
    } catch {
      /* sin almacenamiento */
    }
  }

  return (
    <div className="estilos" role="group" aria-label="Probar estilos de color y letra (temporal)">
      <span>Estilo</span>
      {ESTILOS.map((e) => (
        <button key={e.id} type="button" aria-pressed={activo === e.id} onClick={() => aplicar(e.id)}>
          {e.nombre}
        </button>
      ))}
    </div>
  );
}
