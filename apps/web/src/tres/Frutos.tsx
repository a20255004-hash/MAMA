"use client";

import { useMemo } from "react";
import * as THREE from "three";

/**
 * Productos del mercado modelados con geometría propia (sin archivos externos).
 * Cada uno mide cerca de 1 unidad para poder mezclarlos en una misma escena.
 */

export const TIPOS = [
  "tomate", "naranja", "limon", "huevo", "palta", "zanahoria",
  "cebolla", "papa", "aji", "berenjena", "manzana",
] as const;
export type Tipo = (typeof TIPOS)[number];

function Piel({ color, brillo = 0.75, aspero = 0.32 }: { color: string; brillo?: number; aspero?: number }) {
  return (
    <meshPhysicalMaterial
      color={color}
      roughness={aspero}
      clearcoat={brillo}
      clearcoatRoughness={0.22}
      envMapIntensity={1.15}
    />
  );
}

const VERDE = "#2f7d46";

/** Perfil de revolución: radio según la altura, de abajo hacia arriba. */
function useTorno(radio: (a: number) => number, alto: number) {
  return useMemo(() => {
    const puntos: THREE.Vector2[] = [];
    for (let i = 0; i <= 28; i++) {
      const a = (i / 28) * Math.PI;
      puntos.push(new THREE.Vector2(Math.max(Math.sin(a) * radio(a), 0.0001), -Math.cos(a) * alto));
    }
    return new THREE.LatheGeometry(puntos, 40);
  }, [radio, alto]);
}

const perfilHuevo = (a: number) => 0.4 + 0.07 * Math.cos(a);
const perfilPalta = (a: number) => 0.36 + 0.15 * Math.cos(a);
const perfilBerenjena = (a: number) => 0.3 + 0.13 * Math.cos(a);

function Tallo({ y, alto = 0.16 }: { y: number; alto?: number }) {
  return (
    <mesh position={[0, y, 0]} rotation={[0, 0, 0.18]}>
      <cylinderGeometry args={[0.025, 0.04, alto, 8]} />
      <meshStandardMaterial color="#5a4a2a" roughness={0.8} />
    </mesh>
  );
}

function Caliz({ y, radio = 0.2 }: { y: number; radio?: number }) {
  return (
    <group position={[0, y, 0]}>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} rotation={[0, (i / 5) * Math.PI * 2, Math.PI / 2 - 0.35]} position={[0, 0, 0]}>
          <coneGeometry args={[0.05, radio * 2, 6]} />
          <meshStandardMaterial color={VERDE} roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function Papa() {
  const geo = useMemo(() => {
    const g = new THREE.IcosahedronGeometry(0.5, 4);
    const p = g.attributes.position as THREE.BufferAttribute;
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const bulto = 1 + 0.1 * Math.sin(v.x * 5.1 + 1) * Math.cos(v.y * 4.3) + 0.07 * Math.sin(v.z * 6.7 + v.x * 2);
      v.multiplyScalar(bulto);
      p.setXYZ(i, v.x * 1.25, v.y * 0.85, v.z * 0.95);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <mesh geometry={geo}>
      <Piel color="#b98a52" brillo={0.05} aspero={0.85} />
    </mesh>
  );
}

export function Fruto({ tipo }: { tipo: Tipo }) {
  const huevo = useTorno(perfilHuevo, 0.56);
  const palta = useTorno(perfilPalta, 0.62);
  const berenjena = useTorno(perfilBerenjena, 0.72);

  switch (tipo) {
    case "tomate":
      return (
        <group>
          <mesh scale={[1, 0.84, 1]}>
            <sphereGeometry args={[0.5, 48, 32]} />
            <Piel color="#e02a1a" brillo={1} aspero={0.18} />
          </mesh>
          <Caliz y={0.4} />
          <Tallo y={0.46} />
        </group>
      );
    case "naranja":
      return (
        <group>
          <mesh>
            <sphereGeometry args={[0.5, 48, 32]} />
            <Piel color="#f58a16" brillo={0.35} aspero={0.5} />
          </mesh>
          <mesh position={[0, 0.49, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.03, 10]} />
            <meshStandardMaterial color={VERDE} />
          </mesh>
        </group>
      );
    case "limon":
      return (
        <mesh scale={[0.82, 0.82, 1.08]}>
          <sphereGeometry args={[0.46, 40, 28]} />
          <Piel color="#a9c92b" brillo={0.45} aspero={0.42} />
        </mesh>
      );
    case "huevo":
      return (
        <mesh geometry={huevo}>
          <Piel color="#ecd3b4" brillo={0.15} aspero={0.6} />
        </mesh>
      );
    case "palta":
      return (
        <mesh geometry={palta}>
          <Piel color="#23432a" brillo={0.3} aspero={0.62} />
        </mesh>
      );
    case "zanahoria":
      return (
        <group rotation={[0, 0, Math.PI]}>
          <mesh>
            <coneGeometry args={[0.2, 1.2, 28]} />
            <Piel color="#f0791a" brillo={0.3} aspero={0.5} />
          </mesh>
          {[-0.3, 0, 0.3].map((r) => (
            <mesh key={r} position={[r * 0.3, -0.78, 0]} rotation={[0, 0, Math.PI + r]}>
              <coneGeometry args={[0.05, 0.42, 6]} />
              <meshStandardMaterial color={VERDE} roughness={0.6} />
            </mesh>
          ))}
        </group>
      );
    case "cebolla":
      return (
        <group>
          <mesh scale={[1, 0.92, 1]}>
            <sphereGeometry args={[0.46, 40, 28]} />
            <Piel color="#7c2463" brillo={0.7} aspero={0.3} />
          </mesh>
          <mesh position={[0, 0.5, 0]}>
            <coneGeometry args={[0.12, 0.32, 16]} />
            <Piel color="#a8478c" brillo={0.3} aspero={0.5} />
          </mesh>
        </group>
      );
    case "papa":
      return <Papa />;
    case "aji":
      return (
        <group rotation={[0, 0, Math.PI + 0.3]}>
          <mesh>
            <coneGeometry args={[0.17, 1.05, 24]} />
            <Piel color="#f4a50c" brillo={1} aspero={0.2} />
          </mesh>
          <mesh position={[0, -0.6, 0]} rotation={[0, 0, 0.5]}>
            <cylinderGeometry args={[0.03, 0.05, 0.22, 8]} />
            <meshStandardMaterial color={VERDE} roughness={0.6} />
          </mesh>
        </group>
      );
    case "berenjena":
      return (
        <group>
          <mesh geometry={berenjena}>
            <Piel color="#3a1746" brillo={1} aspero={0.15} />
          </mesh>
          <Caliz y={0.66} radio={0.16} />
          <Tallo y={0.76} alto={0.2} />
        </group>
      );
    case "manzana":
      return (
        <group>
          <mesh scale={[1, 0.92, 1]}>
            <sphereGeometry args={[0.48, 48, 32]} />
            <Piel color="#b3121f" brillo={1} aspero={0.2} />
          </mesh>
          <Tallo y={0.47} alto={0.2} />
        </group>
      );
  }
}
