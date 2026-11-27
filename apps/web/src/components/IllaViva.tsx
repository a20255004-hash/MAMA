"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { Illa, type GestoIlla } from "@illari/ui";
import Illa3D from "@/tres/Illa3D";

/**
 * Illa en 3D, viva e interactiva. Si la persona pidió menos movimiento o su dispositivo no soporta
 * gráficos 3D, se muestra la Illa ilustrada de siempre: nadie se queda sin ella.
 */
export function IllaViva({
  gesto = "saluda",
  className,
  titulo,
  interactiva = true,
  arrastrable = true,
  alTocar,
}: {
  gesto?: GestoIlla;
  className?: string;
  titulo?: string;
  interactiva?: boolean;
  arrastrable?: boolean;
  alTocar?: () => void;
}) {
  const quieto = useReducedMotion();
  const [webgl, setWebgl] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const c = document.createElement("canvas");
      setWebgl(Boolean(c.getContext("webgl2") ?? c.getContext("webgl")));
    } catch {
      setWebgl(false);
    }
  }, []);

  // La primera Illa 3D (hecha con formas simples) no convenció a la dueña. Mientras se elige un avatar
  // realista, se muestra la Illa ilustrada. Cambiar a true cuando el modelo nuevo esté listo.
  const AVATAR_3D_LISTO = false;

  if (!AVATAR_3D_LISTO || quieto || webgl === false) {
    return (
      <div className={`illa-viva ${className ?? ""}`}>
        <Illa gesto={gesto} titulo={titulo} />
      </div>
    );
  }
  // Mientras se comprueba, se reserva el espacio para que nada salte.
  if (webgl === null) return <div className={`illa-viva ${className ?? ""}`} aria-hidden="true" />;

  return <Illa3D gesto={gesto} className={className} titulo={titulo} interactiva={interactiva} arrastrable={arrastrable} alTocar={alTocar} />;
}
