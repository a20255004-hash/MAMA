"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { MotionValue } from "motion/react";
import * as THREE from "three";
import { Fruto, type Tipo } from "./Frutos";

const PIEZAS: Tipo[] = [
  "palta", "manzana", "limon", "granada", "cebolla", "kiwi", "camote", "lima",
  "manzana", "palta", "granada", "limon", "cebolla", "manzana", "camote", "lima",
];
const N = PIEZAS.length;

const suavizar = (a: number, b: number, x: number) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};

/**
 * La compra en tres actos, guiada por el scroll (`avance` de 0 a 1):
 * 1. racimo: todo junto, girando despacio;
 * 2. vuelo: las piezas se abren y pasan junto a la cámara;
 * 3. repisa: quedan ordenadas en dos filas, listas para llevar.
 */
export function Cosecha({ avance, quieto }: { avance: MotionValue<number>; quieto: boolean }) {
  const grupo = useRef<THREE.Group>(null);
  const piezas = useRef<(THREE.Group | null)[]>([]);
  const { viewport, pointer, camera, size } = useThree();

  const destinos = useMemo(() => {
    const aureo = Math.PI * (3 - Math.sqrt(5));
    return PIEZAS.map((_, i) => {
      // Racimo: puntos repartidos sobre una esfera.
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const racimo = new THREE.Vector3(Math.cos(aureo * i) * r, y, Math.sin(aureo * i) * r).multiplyScalar(1.55);
      // Vuelo: túnel alrededor del eje de la cámara.
      const a = (i / N) * Math.PI * 2 * 2.3;
      const vuelo = new THREE.Vector3(Math.cos(a) * (3.1 + (i % 3) * 0.7), Math.sin(a) * (2 + (i % 2) * 0.5), -7 + i * 0.95);
      // Repisa: dos filas de ocho.
      const repisa = new THREE.Vector3(((i % 8) - 3.5) * 1.12, i < 8 ? 0.72 : -0.72, 0);
      return { racimo, vuelo, repisa, giro: 0.25 + ((i * 37) % 10) / 14, fase: i * 1.7 };
    });
  }, []);

  const tmp = useMemo(() => new THREE.Vector3(), []);
  const tmp2 = useMemo(() => new THREE.Vector3(), []);

  useFrame((estado, delta) => {
    const t = avance.get();
    const reloj = quieto ? 0 : estado.clock.elapsedTime;
    const aVuelo = suavizar(0.1, 0.38, t);
    const aRepisa = suavizar(0.62, 0.86, t);
    // Igual que el CSS: bajo 992 px el texto va abajo y el racimo arriba; si no, texto a la izquierda y racimo a la derecha.
    const angosto = size.width < 992;
    const DIAMETRO = 4.1; // racimo completo, en unidades de la escena
    // En celular el racimo ocupa la franja libre entre la cabecera (64 px) y el bloque de texto (~390 px).
    const franja = Math.max(150, size.height - 64 - 390);
    const escala = angosto
      ? Math.min(0.8, ((franja / size.height) * viewport.height) / DIAMETRO, viewport.width / 4.6)
      : Math.min(0.95, viewport.width / 10.5);

    const centroX = angosto ? 0 : viewport.width * 0.25;
    const centroY = angosto ? viewport.height * (0.5 - (64 + franja / 2) / size.height) : -0.1;
    const giroRacimo = reloj * 0.22 + t * 5;

    destinos.forEach((d, i) => {
      const pieza = piezas.current[i];
      if (!pieza) return;
      tmp.copy(d.racimo).applyAxisAngle(THREE.Object3D.DEFAULT_UP, giroRacimo).multiplyScalar(escala);
      tmp.x += centroX * (1 - aVuelo);
      tmp.y += centroY * (1 - aVuelo) + Math.sin(reloj * 0.9 + d.fase) * 0.06;
      tmp2.copy(d.vuelo);
      tmp2.z += aVuelo * 6 - aRepisa * 2;
      tmp.lerp(tmp2, aVuelo);
      tmp2.copy(d.repisa).multiplyScalar(angosto ? 0.42 : Math.min(1, viewport.width / 10.5));
      tmp2.y += viewport.height * (angosto ? 0.14 : 0.2);
      tmp.lerp(tmp2, aRepisa);
      pieza.position.lerp(tmp, quieto ? 1 : Math.min(1, delta * 7));

      const tamano = THREE.MathUtils.lerp(escala * 0.95, angosto ? 0.42 : 0.9, aRepisa);
      pieza.scale.setScalar(tamano);
      const giro = reloj * d.giro * (1 - aRepisa * 0.85) + d.fase;
      pieza.rotation.set(giro * 0.6 + t * 4, giro, 0.25 * Math.sin(d.fase) * (1 - aRepisa));
    });

    // La cámara acompaña al puntero: da profundidad sin marear.
    if (!quieto) {
      camera.position.x = THREE.MathUtils.damp(camera.position.x, pointer.x * 0.45, 3, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, pointer.y * 0.3, 3, delta);
      camera.lookAt(0, 0, 0);
    }
  });

  return (
    <group ref={grupo}>
      {PIEZAS.map((tipo, i) => (
        <group
          key={i}
          ref={(g) => {
            piezas.current[i] = g;
          }}
        >
          <Fruto tipo={tipo} />
        </group>
      ))}
    </group>
  );
}
