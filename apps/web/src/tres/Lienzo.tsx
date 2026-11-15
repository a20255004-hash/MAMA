"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";

/**
 * Lienzo 3D común. Solo dibuja mientras está a la vista, para no gastar
 * batería en celulares cuando la escena quedó fuera de pantalla.
 */
export function Lienzo({
  children,
  camara = [0, 0, 7.5],
  fov = 36,
  className,
}: {
  children: ReactNode;
  camara?: [number, number, number];
  fov?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const o = new IntersectionObserver(([e]) => setVisible(e?.isIntersecting ?? true), { rootMargin: "80px" });
    o.observe(el);
    return () => o.disconnect();
  }, []);

  return (
    <div ref={ref} className={className} aria-hidden="true">
      <Canvas
        dpr={[1, 1.75]}
        frameloop={visible ? "always" : "never"}
        camera={{ position: camara, fov }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.35} />
        <directionalLight position={[4, 6, 5]} intensity={2.2} color="#ffe2bd" />
        <directionalLight position={[-6, -2, -4]} intensity={0.9} color="#ffd9c2" />
        {/* Estudio de luces propio: da los reflejos sin descargar nada. */}
        <Environment resolution={256}>
          <Lightformer form="rect" intensity={5} position={[0, 5, 2]} scale={[10, 4, 1]} color="#fff3e0" />
          <Lightformer form="rect" intensity={2.5} position={[-6, 1, 2]} scale={[3, 8, 1]} color="#9fe6d2" />
          <Lightformer form="rect" intensity={3} position={[6, -1, 3]} scale={[3, 8, 1]} color="#ffb56b" />
          <Lightformer form="ring" intensity={2} position={[0, -4, -4]} scale={6} color="#ffffff" />
        </Environment>
        {children}
      </Canvas>
    </div>
  );
}
