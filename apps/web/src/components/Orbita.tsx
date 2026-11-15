"use client";

import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from "motion/react";
import { Casera, Fruto, type TipoFruto } from "@casera/ui";

const ANILLO: TipoFruto[] = [
  "tomate", "limon", "palta", "zanahoria", "aji", "cebolla", "choclo", "huevo", "papa", "culantro",
];
const RADIO = 41; // en unidades cqw del contenedor
const INCLINACION = 0.36;

function Pieza({ tipo, indice, giro }: { tipo: TipoFruto; indice: number; giro: MotionValue<number> }) {
  const fase = (indice / ANILLO.length) * Math.PI * 2;
  const transform = useTransform(giro, (g) => {
    const a = g + fase;
    const fondo = Math.sin(a); // -1 atrás, 1 adelante
    const x = Math.cos(a) * RADIO;
    const y = fondo * RADIO * INCLINACION;
    const escala = 0.62 + (fondo + 1) * 0.24;
    return `translate(-50%, -50%) translate(${x.toFixed(2)}cqw, ${y.toFixed(2)}cqw) scale(${escala.toFixed(3)}) rotate(${(Math.cos(a) * 14).toFixed(1)}deg)`;
  });
  const zIndex = useTransform(giro, (g) => (Math.sin(g + fase) > 0 ? 3 : 1));
  const opacity = useTransform(giro, (g) => 0.55 + (Math.sin(g + fase) + 1) * 0.225);

  return (
    <motion.div className="orbita__pieza" style={{ transform, zIndex, opacity }}>
      <Fruto tipo={tipo} />
    </motion.div>
  );
}

/**
 * La compra girando alrededor de la casera. El giro es continuo y se acelera
 * con el scroll; con "reducir movimiento" queda quieto, con todo visible.
 */
export function Orbita() {
  const quieto = useReducedMotion();
  const giro = useMotionValue(0.6);
  const { scrollY } = useScroll();
  const impulso = useSpring(useVelocity(scrollY), { stiffness: 60, damping: 22 });

  useAnimationFrame((_, delta) => {
    if (quieto) return;
    const extra = Math.min(Math.abs(impulso.get()) / 900, 3);
    giro.set(giro.get() + (delta / 1000) * (0.22 + extra * 0.5));
  });

  return (
    <div className="orbita" aria-hidden="true">
      <div className="orbita__aro" />
      <Casera className="orbita__casera" />
      {ANILLO.map((tipo, i) => (
        <Pieza key={tipo} tipo={tipo} indice={i} giro={giro} />
      ))}
    </div>
  );
}
