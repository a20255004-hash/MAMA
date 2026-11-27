"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import * as THREE from "three";
import type { GestoIlla } from "@illari/ui";

/**
 * Illa en 3D: formas suaves tipo muñeca de vinilo, hechas con geometrías simples (sin descargar modelos).
 * - Te sigue con la mirada y la cabeza, parpadea y respira.
 * - Saluda con la mano; las trenzas se mueven con inercia.
 * - Se deja girar un poco arrastrándola y vuelve sola a su sitio.
 * - Al tocarla salta de alegría con los brazos arriba.
 */

const C = {
  piel: "#e8b48a",
  pielSombra: "#d89c72",
  pelo: "#2b1a16",
  peloBrillo: "#4a302a",
  blusa: "#f4d3ae",
  mandil: "#c7400c",
  mandilClaro: "#de6b3d",
  oro: "#ffc933",
  oroOsc: "#f2a900",
  rubor: "#f08f86",
  boca: "#7a2024",
  lengua: "#ef7f86",
  cesta: "#a8703a",
  cestaOsc: "#8a5a2b",
};

export type Control = {
  /** Hacia dónde mira (−1 a 1 en cada eje). */
  mira: { x: number; y: number };
  /** Giro por arrastre (radianes, hacia donde apunta el dedo). */
  giro: number;
  /** Momento (en segundos del reloj) en que la tocaron por última vez. */
  toque: number;
};

const lim = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const mezcla = (a: number, b: number, k: number) => a + (b - a) * k;

function Lazo({ escala = 1 }: { escala?: number }) {
  return (
    <group scale={escala}>
      <mesh position={[-0.1, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.095, 0.2, 18]} />
        <meshStandardMaterial color={C.oro} roughness={0.55} />
      </mesh>
      <mesh position={[0.1, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.095, 0.2, 18]} />
        <meshStandardMaterial color={C.oro} roughness={0.55} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.05, 16, 12]} />
        <meshStandardMaterial color={C.oroOsc} roughness={0.5} />
      </mesh>
    </group>
  );
}

function Trenza({ grupo }: { grupo: MutableRefObject<THREE.Group | null> }) {
  return (
    <group ref={grupo}>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[0, -0.12 - i * 0.15, 0]} rotation={[0, 0, i % 2 ? 0.4 : -0.4]} scale={[1, 1.3, 0.95]}>
          <sphereGeometry args={[0.1, 20, 16]} />
          <meshStandardMaterial color={C.pelo} roughness={0.45} />
        </mesh>
      ))}
      <group position={[0, -0.78, 0.02]}>
        <Lazo />
      </group>
    </group>
  );
}

function Brazo({
  grupo,
  antebrazo,
  mano,
}: {
  grupo: MutableRefObject<THREE.Group | null>;
  antebrazo: MutableRefObject<THREE.Group | null>;
  mano?: React.ReactNode;
}) {
  return (
    <group ref={grupo}>
      <mesh position={[0, -0.24, 0]}>
        <capsuleGeometry args={[0.15, 0.28, 8, 16]} />
        <meshStandardMaterial color={C.blusa} roughness={0.8} />
      </mesh>
      <group ref={antebrazo} position={[0, -0.5, 0]}>
        <mesh position={[0, -0.2, 0]}>
          <capsuleGeometry args={[0.112, 0.24, 8, 16]} />
          <meshStandardMaterial color={C.piel} roughness={0.7} />
        </mesh>
        <mesh position={[0, -0.44, 0]}>
          <sphereGeometry args={[0.135, 20, 16]} />
          <meshStandardMaterial color={C.piel} roughness={0.7} />
        </mesh>
        {mano}
      </group>
    </group>
  );
}

function Canasta() {
  return (
    <group position={[0.02, -0.5, 0.05]} rotation={[0.1, 0, 0]}>
      <mesh position={[0, -0.12, 0]}>
        <cylinderGeometry args={[0.27, 0.21, 0.26, 24]} />
        <meshStandardMaterial color={C.cesta} roughness={0.85} />
      </mesh>
      <mesh position={[0, -0.02, 0]}>
        <torusGeometry args={[0.27, 0.025, 10, 28]} />
        <meshStandardMaterial color={C.cestaOsc} roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.16, 0]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.27, 0.018, 8, 24, Math.PI]} />
        <meshStandardMaterial color={C.cestaOsc} roughness={0.85} />
      </mesh>
      {(
        [
          ["#5f8a3a", [-0.1, 0.03, 0.05], 0.12],
          ["#f2c230", [0.1, 0.04, 0.02], 0.1],
          ["#d6402b", [0.0, 0.06, -0.08], 0.11],
          ["#7fb34a", [0.05, 0.02, 0.12], 0.09],
        ] as [string, [number, number, number], number][]
      ).map(([color, pos, r], i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[r, 18, 14]} />
          <meshStandardMaterial color={color} roughness={0.55} />
        </mesh>
      ))}
    </group>
  );
}

function Escena({ gesto, ctl }: { gesto: GestoIlla; ctl: MutableRefObject<Control> }) {
  const cuerpo = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null);
  const cabeza = useRef<THREE.Group>(null);
  const ojoI = useRef<THREE.Group>(null);
  const ojoD = useRef<THREE.Group>(null);
  const cejas = useRef<THREE.Group>(null);
  const boca = useRef<THREE.Group>(null);
  const brazoD = useRef<THREE.Group>(null);
  const antD = useRef<THREE.Group>(null);
  const brazoI = useRef<THREE.Group>(null);
  const antI = useRef<THREE.Group>(null);
  const trenzaI = useRef<THREE.Group>(null);
  const trenzaD = useRef<THREE.Group>(null);

  const e = useRef({
    parpadeo: 0,
    proximo: 2.5,
    cabezaY: 0,
    angT: [0, 0],
    velT: [0, 0],
    yaw: 0,
    alegria: 0,
    ult: -10,
  });

  const formaBoca = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-0.13, 0);
    s.lineTo(0.13, 0);
    s.quadraticCurveTo(0.125, -0.17, 0, -0.185);
    s.quadraticCurveTo(-0.125, -0.17, -0.13, 0);
    return s;
  }, []);

  useFrame((estado, dt) => {
    const d = Math.min(dt, 0.05);
    const t = estado.clock.elapsedTime;
    const s = e.current;
    const c = ctl.current;

    // Alegría: dura un par de segundos después de que la tocan.
    if (c.toque > s.ult) {
      s.ult = c.toque;
    }
    const desdeToque = t - s.ult;
    const alegre = gesto === "celebra" || desdeToque < 1.9;
    s.alegria = mezcla(s.alegria, alegre ? 1 : 0, 1 - Math.exp(-d * 9));

    // Mirada y cabeza: sigue el puntero con suavidad; si nadie la mueve, curiosea sola.
    const ocioX = Math.sin(t * 0.6) * 0.18;
    const mx = c.mira.x * 0.9 + ocioX * (Math.abs(c.mira.x) < 0.05 ? 1 : 0.2);
    const my = c.mira.y;
    const cab = cabeza.current;
    if (cab) {
      const objY = mx * 0.5;
      const prev = s.cabezaY;
      cab.rotation.y = mezcla(cab.rotation.y, objY, 1 - Math.exp(-d * 6));
      cab.rotation.x = mezcla(cab.rotation.x, -my * 0.28 - s.alegria * 0.08, 1 - Math.exp(-d * 6));
      cab.rotation.z = mezcla(cab.rotation.z, -mx * 0.06 + Math.sin(t * 1.1) * 0.015, 1 - Math.exp(-d * 5));
      cab.position.y = 0.58 + Math.sin(t * 1.7) * 0.008;
      s.cabezaY = cab.rotation.y;
      var velCab = (cab.rotation.y - prev) / Math.max(d, 0.001);
    } else {
      var velCab = 0;
    }
    for (const ojo of [ojoI.current, ojoD.current]) {
      if (!ojo) continue;
      ojo.position.x = mezcla(ojo.position.x, Math.sign(ojo.userData.lado) * 0.168 + c.mira.x * 0.04, 1 - Math.exp(-d * 10));
      ojo.position.y = mezcla(ojo.position.y, 0.04 + c.mira.y * 0.025, 1 - Math.exp(-d * 10));
    }

    // Parpadeo.
    if (t > s.proximo) {
      s.parpadeo = 0.14;
      s.proximo = t + 2.2 + Math.random() * 3;
    }
    s.parpadeo = Math.max(0, s.parpadeo - d);
    const cierre = s.parpadeo > 0 ? 1 - Math.sin((1 - s.parpadeo / 0.14) * Math.PI) * 0.92 : 1;
    const alegreOjo = 1 - s.alegria * 0.25;
    for (const ojo of [ojoI.current, ojoD.current]) ojo?.scale.set(1, cierre * alegreOjo, 1);

    // Cejas y boca: se alzan y se abren con la alegría.
    if (cejas.current) cejas.current.position.y = 0.2 + s.alegria * 0.04;
    if (boca.current) {
      const habla = 0.5 + 0.5 * Math.sin(t * 2.2);
      boca.current.scale.set(1 + s.alegria * 0.12, 1 + s.alegria * 0.55 + habla * 0.04, 1);
    }

    // Respiración y giro por arrastre.
    if (torso.current) torso.current.scale.set(1 + Math.sin(t * 1.6) * 0.006, 1 + Math.sin(t * 1.6) * 0.012, 1);
    s.yaw = mezcla(s.yaw, c.giro, 1 - Math.exp(-d * (c.giro === 0 ? 5 : 14)));
    if (cuerpo.current) {
      cuerpo.current.rotation.y = s.yaw * 0.6 + c.mira.x * 0.1;
      // Salto de alegría: dos rebotes.
      const salto = desdeToque < 1.1 ? Math.abs(Math.sin(desdeToque * Math.PI * 2.2)) * 0.2 * (1 - desdeToque / 1.1) : 0;
      cuerpo.current.position.y = 0.1 + salto + (gesto === "celebra" ? Math.abs(Math.sin(t * 3)) * 0.04 : 0);
      cuerpo.current.rotation.z = mezcla(cuerpo.current.rotation.z, Math.sin(t * 0.9) * 0.015 + (desdeToque < 1.1 ? Math.sin(desdeToque * 14) * 0.03 : 0), 1 - Math.exp(-d * 8));
    }

    // Brazos.
    const saluda = gesto === "saluda" || gesto === "celebra";
    if (brazoD.current && antD.current) {
      const alto = s.alegria > 0.05 || gesto === "saluda";
      const objBrazo = gesto === "celebra" || s.alegria > 0.5 ? -2.7 + Math.sin(t * 9) * 0.1 : saluda ? -2.35 + Math.sin(t * 2) * 0.05 : -0.12;
      brazoD.current.rotation.z = mezcla(brazoD.current.rotation.z, objBrazo, 1 - Math.exp(-d * 7));
      const objAnt = alto ? 0.32 + Math.sin(t * (s.alegria > 0.5 ? 11 : 7)) * 0.5 : 0.08;
      antD.current.rotation.z = mezcla(antD.current.rotation.z, objAnt, 1 - Math.exp(-d * 10));
    }
    if (brazoI.current && antI.current) {
      const arriba = gesto === "celebra" || s.alegria > 0.5;
      const objBrazo = arriba ? 2.7 + Math.sin(t * 9 + 1) * 0.1 : gesto === "canasta" ? 0.22 : 0.12;
      brazoI.current.rotation.z = mezcla(brazoI.current.rotation.z, objBrazo, 1 - Math.exp(-d * 7));
      brazoI.current.rotation.x = mezcla(brazoI.current.rotation.x, 0, 1 - Math.exp(-d * 7));
      const objAnt = arriba ? -0.3 + Math.sin(t * 11 + 1) * 0.4 : 0;
      antI.current.rotation.z = mezcla(antI.current.rotation.z, objAnt, 1 - Math.exp(-d * 10));
      antI.current.rotation.x = mezcla(antI.current.rotation.x, !arriba && gesto === "canasta" ? -1.15 : 0, 1 - Math.exp(-d * 7));
    }

    // Trenzas: resortes amortiguados que reaccionan al movimiento de la cabeza y del salto.
    const trenzas = [trenzaI.current, trenzaD.current];
    for (let i = 0; i < 2; i++) {
      const g = trenzas[i];
      if (!g) continue;
      const empuje = -velCab * 0.05 + (desdeToque < 1.1 ? Math.sin(desdeToque * 16) * 0.5 * (1 - desdeToque / 1.1) : 0);
      const reposo = Math.sin(t * 1.4 + i * 1.7) * 0.03;
      const a = s.angT[i] ?? 0;
      const v = s.velT[i] ?? 0;
      const nv = v + (-a * 38 - v * 5 + empuje * 90) * d;
      const na = a + nv * d;
      s.velT[i] = nv;
      s.angT[i] = lim(na, -0.7, 0.7);
      g.rotation.z = s.angT[i]! + reposo;
    }
  });

  return (
    <group ref={cuerpo} position={[0, 0.1, 0]}>
      {/* Torso: blusa, mandil con bolsillo y bordado en el cuello */}
      <group ref={torso}>
        <mesh position={[0, -0.38, 0]} scale={[1.02, 0.5, 0.6]}>
          <sphereGeometry args={[0.62, 32, 20]} />
          <meshStandardMaterial color={C.blusa} roughness={0.85} />
        </mesh>
        <mesh position={[0, -0.82, 0]} scale={[0.86, 1, 0.68]}>
          <capsuleGeometry args={[0.6, 0.8, 10, 28]} />
          <meshStandardMaterial color={C.blusa} roughness={0.85} />
        </mesh>
        <RoundedBox args={[0.62, 0.72, 0.1]} radius={0.07} smoothness={4} position={[0, -0.86, 0.39]}>
          <meshStandardMaterial color={C.mandil} roughness={0.75} />
        </RoundedBox>
        <RoundedBox args={[0.3, 0.2, 0.05]} radius={0.04} smoothness={4} position={[0, -1.05, 0.45]}>
          <meshStandardMaterial color={C.mandilClaro} roughness={0.75} />
        </RoundedBox>
        {[-1, 1].map((l) => (
          <mesh key={l} position={[l * 0.22, -0.4, 0.3]} rotation={[0.3, 0, l * -0.2]}>
            <capsuleGeometry args={[0.035, 0.42, 6, 10]} />
            <meshStandardMaterial color={C.mandil} roughness={0.75} />
          </mesh>
        ))}
        {[-2, -1, 0, 1, 2].map((i) => (
          <mesh key={i} position={[i * 0.06, -0.33 - Math.abs(i) * 0.014, 0.43 - Math.abs(i) * 0.03]}>
            <sphereGeometry args={[0.022, 10, 8]} />
            <meshStandardMaterial color={i % 2 ? C.oro : C.mandilClaro} roughness={0.5} />
          </mesh>
        ))}
      </group>

      {/* Cuello */}
      <mesh position={[0, -0.12, 0]}>
        <cylinderGeometry args={[0.13, 0.15, 0.3, 20]} />
        <meshStandardMaterial color={C.pielSombra} roughness={0.7} />
      </mesh>

      {/* Brazos: el derecho (a la izquierda de la pantalla) saluda; el izquierdo sostiene la canasta */}
      <group position={[-0.6, -0.5, 0]}>
        <Brazo grupo={brazoD} antebrazo={antD} />
      </group>
      <group position={[0.6, -0.5, 0]}>
        <Brazo grupo={brazoI} antebrazo={antI} mano={gesto === "canasta" ? <Canasta /> : undefined} />
      </group>

      {/* Cabeza */}
      <group ref={cabeza} position={[0, 0.58, 0]} scale={1.16}>
        {/* Pelo por detrás y casquete sobre la frente */}
        <mesh position={[0, 0.02, -0.07]} scale={[1.04, 1.04, 0.96]}>
          <sphereGeometry args={[0.54, 36, 28]} />
          <meshStandardMaterial color={C.pelo} roughness={0.45} />
        </mesh>
        <mesh scale={[1.02, 1.07, 0.99]} rotation={[-0.12, 0, 0]}>
          <sphereGeometry args={[0.518, 40, 28, 0, Math.PI * 2, 0, 1.06]} />
          <meshStandardMaterial color={C.pelo} roughness={0.4} />
        </mesh>
        <mesh scale={[1, 1.04, 0.97]}>
          <sphereGeometry args={[0.5, 40, 32]} />
          <meshStandardMaterial color={C.piel} roughness={0.62} />
        </mesh>

        {/* Orejas y aretes */}
        {[-1, 1].map((l) => (
          <group key={l} position={[l * 0.5, -0.02, -0.02]}>
            <mesh scale={[0.55, 1, 0.8]}>
              <sphereGeometry args={[0.08, 14, 12]} />
              <meshStandardMaterial color={C.piel} roughness={0.7} />
            </mesh>
            <mesh position={[l * 0.015, -0.11, 0.015]} rotation={[0, Math.PI / 2, 0]}>
              <torusGeometry args={[0.04, 0.009, 8, 20]} />
              <meshStandardMaterial color={C.oro} roughness={0.35} metalness={0.4} />
            </mesh>
          </group>
        ))}

        {/* Ojos */}
        {[-1, 1].map((l) => (
          <group key={l} ref={l < 0 ? ojoI : ojoD} userData={{ lado: l }} position={[l * 0.168, 0.04, 0.445]}>
            <mesh scale={[1, 1.12, 0.6]}>
              <sphereGeometry args={[0.058, 18, 14]} />
              <meshStandardMaterial color="#1a0f0d" roughness={0.25} />
            </mesh>
            <mesh position={[0.02, 0.026, 0.028]}>
              <sphereGeometry args={[0.019, 10, 8]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            <mesh position={[-0.017, -0.02, 0.03]}>
              <sphereGeometry args={[0.009, 8, 6]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </group>
        ))}

        {/* Cejas */}
        <group ref={cejas} position={[0, 0.2, 0.455]}>
          {[-1, 1].map((l) => (
            <mesh key={l} position={[l * 0.17, 0, -0.01 * 0]} rotation={[0, 0, Math.PI / 2 + l * -0.12]}>
              <capsuleGeometry args={[0.014, 0.11, 4, 8]} />
              <meshStandardMaterial color={C.peloBrillo} roughness={0.6} />
            </mesh>
          ))}
        </group>

        {/* Mejillas y nariz */}
        {[-1, 1].map((l) => (
          <mesh key={l} position={[l * 0.29, -0.1, 0.395]} rotation={[0, l * 0.5, 0]} scale={[1, 0.72, 0.25]}>
            <sphereGeometry args={[0.085, 16, 12]} />
            <meshStandardMaterial color={C.rubor} roughness={0.8} transparent opacity={0.62} />
          </mesh>
        ))}
        <mesh position={[0, -0.04, 0.495]} scale={[1, 0.85, 0.8]}>
          <sphereGeometry args={[0.034, 14, 10]} />
          <meshStandardMaterial color={C.pielSombra} roughness={0.6} />
        </mesh>

        {/* Boca abierta, con dientes y lengua */}
        <group ref={boca} position={[0, -0.155, 0.461]}>
          <mesh renderOrder={2}>
            <shapeGeometry args={[formaBoca]} />
            <meshStandardMaterial color={C.boca} roughness={0.5} polygonOffset polygonOffsetFactor={-2} polygonOffsetUnits={-2} />
          </mesh>
          <mesh position={[0, -0.016, 0.001]} renderOrder={3}>
            <planeGeometry args={[0.2, 0.034]} />
            <meshBasicMaterial color="#fffaf2" polygonOffset polygonOffsetFactor={-3} polygonOffsetUnits={-3} />
          </mesh>
          <mesh position={[0, -0.145, 0.001]} scale={[1, 0.62, 1]} renderOrder={3}>
            <circleGeometry args={[0.058, 20]} />
            <meshBasicMaterial color={C.lengua} polygonOffset polygonOffsetFactor={-3} polygonOffsetUnits={-3} />
          </mesh>
        </group>

        {/* Trenzas con lazos amarillos */}
        <group position={[-0.5, -0.06, 0.02]}>
          <Trenza grupo={trenzaI} />
        </group>
        <group position={[0.5, -0.06, 0.02]}>
          <Trenza grupo={trenzaD} />
        </group>
      </group>
    </group>
  );
}

/** Lienzo con la Illa 3D. Solo dibuja cuando está a la vista, y responde al puntero y al dedo. */
export default function Illa3D({
  gesto = "saluda",
  interactiva = true,
  arrastrable = true,
  alTocar,
  className,
  titulo,
}: {
  gesto?: GestoIlla;
  interactiva?: boolean;
  arrastrable?: boolean;
  alTocar?: () => void;
  className?: string;
  titulo?: string;
}) {
  const caja = useRef<HTMLDivElement>(null);
  const ctl = useRef<Control>({ mira: { x: 0, y: 0 }, giro: 0, toque: -100 });
  const [visible, setVisible] = useState(true);
  const arrastre = useRef<{ x: number; movio: boolean } | null>(null);
  const reloj = useRef<() => number>(() => 0);

  useEffect(() => {
    const el = caja.current;
    if (!el) return;
    const o = new IntersectionObserver(([x]) => setVisible(x?.isIntersecting ?? true), { rootMargin: "60px" });
    o.observe(el);
    return () => o.disconnect();
  }, []);

  // Mirada: sigue el puntero en toda la pantalla, relativo al centro de la cabeza.
  useEffect(() => {
    if (!interactiva) return;
    const mover = (ev: PointerEvent) => {
      const r = caja.current?.getBoundingClientRect();
      if (!r) return;
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height * 0.3;
      ctl.current.mira.x = lim((ev.clientX - cx) / (window.innerWidth * 0.4), -1, 1);
      ctl.current.mira.y = lim(-(ev.clientY - cy) / (window.innerHeight * 0.4), -1, 1);
    };
    window.addEventListener("pointermove", mover, { passive: true });
    return () => window.removeEventListener("pointermove", mover);
  }, [interactiva]);

  const alBajar = (ev: React.PointerEvent) => {
    arrastre.current = { x: ev.clientX, movio: false };
    (ev.currentTarget as HTMLElement).setPointerCapture?.(ev.pointerId);
  };
  const alMover = (ev: React.PointerEvent) => {
    const a = arrastre.current;
    if (!a) return;
    const dx = ev.clientX - a.x;
    if (Math.abs(dx) > 6) a.movio = true;
    if (arrastrable) ctl.current.giro = lim(dx / 90, -1.2, 1.2);
  };
  const alSoltar = () => {
    const a = arrastre.current;
    arrastre.current = null;
    ctl.current.giro = 0;
    if (a && !a.movio && interactiva) {
      ctl.current.toque = reloj.current();
      alTocar?.();
    }
  };

  return (
    <div
      ref={caja}
      className={`illa-viva ${className ?? ""}`}
      role={titulo ? "img" : undefined}
      aria-label={titulo}
      aria-hidden={titulo ? undefined : true}
      onPointerDown={alBajar}
      onPointerMove={alMover}
      onPointerUp={alSoltar}
      onPointerCancel={() => {
        arrastre.current = null;
        ctl.current.giro = 0;
      }}
    >
      <Canvas
        dpr={[1, 2]}
        frameloop={visible ? "always" : "never"}
        camera={{ position: [0, 0.05, 5.4], fov: 30 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ clock }) => {
          reloj.current = () => clock.elapsedTime;
        }}
      >
        <hemisphereLight args={["#fff4e6", "#d9a98a", 1.15]} />
        <directionalLight position={[2.5, 3.5, 4]} intensity={2.4} color="#ffe6c8" />
        <directionalLight position={[-3.5, 1, 2]} intensity={0.8} color="#cfe9ff" />
        <directionalLight position={[0, 2, -4]} intensity={1.1} color="#ffd9a8" />
        <Escena gesto={gesto} ctl={ctl} />
      </Canvas>
    </div>
  );
}
