"use client";

import { useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

/**
 * Frutas y verduras reales, escaneadas a partir de fotografías (Poly Haven, licencia CC0).
 * Cada modelo vive en `public/frutas/<id>/` con sus texturas reducidas a 512 px.
 * Ver `public/frutas/LICENCIA.txt`.
 */

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const MODELOS = {
  palta: { id: "food_avocado_01", tamano: 1.0 },
  limon: { id: "lemon", tamano: 0.85 },
  lima: { id: "food_lime_01", tamano: 0.75 },
  manzana: { id: "food_apple_01", tamano: 0.95 },
  cebolla: { id: "yellow_onion", tamano: 1.0 },
  camote: { id: "sweet_potato", tamano: 1.15 },
  granada: { id: "food_pomegranate_01", tamano: 0.95 },
  kiwi: { id: "food_kiwi_01", tamano: 0.8 },
} as const;

export type Tipo = keyof typeof MODELOS;
export const TIPOS = Object.keys(MODELOS) as Tipo[];

const url = (tipo: Tipo) => `${BASE}/frutas/${MODELOS[tipo].id}/${MODELOS[tipo].id}.gltf`;

/** Empieza a bajar todos los modelos apenas la página se abre, sin esperar a que se pidan. */
export function usePrecargarFrutas() {
  useEffect(() => {
    for (const t of TIPOS) useGLTF.preload(url(t));
  }, []);
}

/**
 * Una fruta lista para la escena: centrada en su origen y escalada para que su lado
 * más largo mida 1 unidad (multiplicado por su tamaño relativo). Cada pieza es una
 * copia propia, así que se pueden usar varias del mismo tipo sin que se pisen.
 */
export function Fruto({ tipo }: { tipo: Tipo }) {
  const { scene } = useGLTF(url(tipo));

  const copia = useMemo(() => {
    const raiz = scene.clone(true);
    const caja = new THREE.Box3().setFromObject(raiz);
    const centro = caja.getCenter(new THREE.Vector3());
    const mayor = Math.max(...caja.getSize(new THREE.Vector3()).toArray());
    const escala = MODELOS[tipo].tamano / (mayor || 1);

    raiz.traverse((o) => {
      const malla = o as THREE.Mesh;
      if (!malla.isMesh) return;
      const m = malla.material as THREE.MeshStandardMaterial;
      m.envMapIntensity = 1.1; // los escaneos reflejan el estudio de luces con naturalidad
    });

    const grupo = new THREE.Group();
    raiz.position.copy(centro).multiplyScalar(-1);
    grupo.add(raiz);
    grupo.scale.setScalar(escala);
    return grupo;
  }, [scene, tipo]);

  return <primitive object={copia} />;
}
