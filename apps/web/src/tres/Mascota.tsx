"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const PIEL = "#d99f7b";
const PELO = "#24140f";

function Arcilla({ color, brillo = 0.25 }: { color: string; brillo?: number }) {
  return <meshPhysicalMaterial color={color} roughness={0.55} clearcoat={brillo} clearcoatRoughness={0.5} />;
}

/**
 * Illa: la compradora, personaje guía de la marca, modelada como figura de arcilla.
 * Sigue al puntero con la cabeza y respira; con `quieto` se queda de frente.
 */
export function Mascota({ quieto = false, saluda = false }: { quieto?: boolean; saluda?: boolean }) {
  const cuerpo = useRef<THREE.Group>(null);
  const cabeza = useRef<THREE.Group>(null);
  const brazo = useRef<THREE.Group>(null);
  const { pointer } = useThree();

  useFrame((estado, delta) => {
    if (quieto) return;
    const t = estado.clock.elapsedTime;
    if (cuerpo.current) cuerpo.current.position.y = Math.sin(t * 1.4) * 0.035;
    if (cabeza.current) {
      cabeza.current.rotation.y = THREE.MathUtils.damp(cabeza.current.rotation.y, pointer.x * 0.5, 4, delta);
      cabeza.current.rotation.x = THREE.MathUtils.damp(cabeza.current.rotation.x, -pointer.y * 0.3, 4, delta);
    }
    if (brazo.current && saluda) brazo.current.rotation.z = -2.3 + Math.sin(t * 5) * 0.28;
  });

  return (
    <group ref={cuerpo} position={[0, -0.55, 0]}>
      {/* vestido y mandil */}
      <mesh position={[0, -0.35, 0]}>
        <capsuleGeometry args={[0.62, 0.55, 12, 32]} />
        <Arcilla color="#0f3b33" />
      </mesh>
      <mesh position={[0, -0.42, 0.36]} scale={[0.72, 0.9, 0.5]}>
        <sphereGeometry args={[0.62, 32, 24]} />
        <Arcilla color="#e4efe9" />
      </mesh>
      {/* brazos */}
      <group position={[-0.62, 0.02, 0.05]} rotation={[0, 0, 0.5]}>
        <mesh position={[0, -0.3, 0]}>
          <capsuleGeometry args={[0.13, 0.42, 8, 16]} />
          <Arcilla color="#0f3b33" />
        </mesh>
        <mesh position={[0, -0.64, 0]}>
          <sphereGeometry args={[0.14, 20, 16]} />
          <Arcilla color={PIEL} />
        </mesh>
      </group>
      <group ref={brazo} position={[0.62, 0.02, 0.05]} rotation={[0, 0, saluda ? -2.3 : -0.5]}>
        <mesh position={[0, -0.3, 0]}>
          <capsuleGeometry args={[0.13, 0.42, 8, 16]} />
          <Arcilla color="#0f3b33" />
        </mesh>
        <mesh position={[0, -0.64, 0]}>
          <sphereGeometry args={[0.14, 20, 16]} />
          <Arcilla color={PIEL} />
        </mesh>
      </group>
      {/* canasta con la compra */}
      {!saluda && (
        <group position={[-0.78, -0.72, 0.42]}>
          <mesh>
            <cylinderGeometry args={[0.34, 0.26, 0.34, 28, 1, true]} />
            <meshStandardMaterial color="#b9793c" roughness={0.9} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[-0.1, 0.16, 0]}>
            <sphereGeometry args={[0.15, 20, 16]} />
            <Arcilla color="#e02a1a" brillo={1} />
          </mesh>
          <mesh position={[0.12, 0.17, 0.05]}>
            <sphereGeometry args={[0.14, 20, 16]} />
            <Arcilla color="#a9c92b" brillo={0.6} />
          </mesh>
          <mesh position={[0.02, 0.2, -0.12]}>
            <sphereGeometry args={[0.13, 20, 16]} />
            <Arcilla color="#f58a16" brillo={0.5} />
          </mesh>
        </group>
      )}
      {/* cabeza */}
      <group ref={cabeza} position={[0, 0.75, 0]}>
        <mesh>
          <sphereGeometry args={[0.56, 48, 36]} />
          <Arcilla color={PIEL} />
        </mesh>
        <mesh position={[0, 0.1, -0.06]} scale={[1.06, 1.02, 1.04]}>
          <sphereGeometry args={[0.56, 40, 28, 0, Math.PI * 2, 0, Math.PI * 0.52]} />
          <Arcilla color={PELO} brillo={0.5} />
        </mesh>
        <mesh position={[0, 0.62, -0.18]}>
          <sphereGeometry args={[0.24, 28, 20]} />
          <Arcilla color={PELO} brillo={0.5} />
        </mesh>
        {[-0.19, 0.19].map((x) => (
          <mesh key={x} position={[x, 0.02, 0.5]}>
            <sphereGeometry args={[0.06, 16, 12]} />
            <meshStandardMaterial color="#160d0a" roughness={0.2} />
          </mesh>
        ))}
        {[-0.34, 0.34].map((x) => (
          <mesh key={x} position={[x, -0.14, 0.42]} scale={[1, 0.7, 0.4]}>
            <sphereGeometry args={[0.1, 16, 12]} />
            <meshStandardMaterial color="#e8798c" roughness={0.7} transparent opacity={0.75} />
          </mesh>
        ))}
        <mesh position={[0, -0.16, 0.5]} rotation={[0.25, 0, Math.PI]}>
          <torusGeometry args={[0.13, 0.026, 10, 24, Math.PI]} />
          <meshStandardMaterial color="#160d0a" roughness={0.3} />
        </mesh>
        {[-0.57, 0.57].map((x) => (
          <mesh key={x} position={[x, -0.12, 0.02]}>
            <sphereGeometry args={[0.07, 16, 12]} />
            <meshPhysicalMaterial color="#ffb56b" metalness={0.6} roughness={0.25} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
