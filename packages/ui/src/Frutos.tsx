import type { ReactElement, SVGProps } from "react";

export const FRUTOS = [
  "tomate",
  "limon",
  "palta",
  "zanahoria",
  "aji",
  "cebolla",
  "choclo",
  "huevo",
  "papa",
  "culantro",
] as const;
export type TipoFruto = (typeof FRUTOS)[number];

const DIBUJOS: Record<TipoFruto, ReactElement> = {
  tomate: (
    <>
      <circle cx="50" cy="56" r="34" fill="#e2322b" />
      <path d="M26 42a34 34 0 0 1 24-20" stroke="#ff8a7a" strokeWidth="6" strokeLinecap="round" fill="none" />
      <path d="M50 24c-8-2-14 2-16 8 6 0 10-2 16-2s10 2 16 2c-2-6-8-10-16-8z" fill="#1f7a4d" />
      <path d="M50 26v-10" stroke="#1f7a4d" strokeWidth="5" strokeLinecap="round" />
    </>
  ),
  limon: (
    <>
      <ellipse cx="50" cy="52" rx="34" ry="28" fill="#b9d531" transform="rotate(-18 50 52)" />
      <path d="M22 46a30 24 0 0 1 22-16" stroke="#e6f58a" strokeWidth="6" strokeLinecap="round" fill="none" />
      <circle cx="82" cy="40" r="5" fill="#8fae1b" />
    </>
  ),
  palta: (
    <>
      <path d="M50 10c16 0 30 26 30 48a30 30 0 0 1-60 0c0-22 14-48 30-48z" fill="#2f5d34" />
      <path d="M50 22c11 0 21 20 21 36a21 21 0 0 1-42 0c0-16 10-36 21-36z" fill="#cfe08a" />
      <circle cx="50" cy="60" r="12" fill="#7a4a23" />
    </>
  ),
  zanahoria: (
    <>
      <path
        d="M30 34c10-8 26-6 32 4 8 14-14 46-22 52-6-8-22-40-10-56z"
        fill="#f08a1c"
        transform="rotate(28 50 55)"
      />
      <path
        d="M60 30c0-10 4-18 12-22M66 32c4-8 12-12 20-12M68 38c8-4 14-2 20 2"
        stroke="#1f7a4d"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
    </>
  ),
  aji: (
    <>
      <path d="M22 78c26 6 54-10 60-44-10-2-18 2-22 10-8 16-20 26-38 34z" fill="#f5b700" />
      <path d="M40 68c12-8 22-18 28-30" stroke="#ffe07a" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M78 36c2-8 0-14-4-20" stroke="#1f7a4d" strokeWidth="6" strokeLinecap="round" fill="none" />
    </>
  ),
  cebolla: (
    <>
      <path d="M50 22c22 6 34 22 34 38 0 18-16 28-34 28S16 78 16 60c0-16 12-32 34-38z" fill="#8e2a6b" />
      <path
        d="M50 28c-10 10-16 22-16 34s6 20 16 24M50 28c10 10 16 22 16 34s-6 20-16 24"
        stroke="#c25aa0"
        strokeWidth="4"
        fill="none"
      />
      <path d="M50 24c-2-6 0-12 4-16" stroke="#7a9a3a" strokeWidth="5" strokeLinecap="round" fill="none" />
    </>
  ),
  choclo: (
    <>
      <rect x="34" y="12" width="32" height="70" rx="16" fill="#f7d54a" />
      <path d="M42 22v50M50 18v60M58 22v50M36 34h28M36 46h28M36 58h28" stroke="#d9a916" strokeWidth="3" />
      <path
        d="M30 50c-4 18 4 34 20 40-14-2-28-14-26-34zM70 50c4 18-4 34-20 40 14-2 28-14 26-34z"
        fill="#1f7a4d"
      />
    </>
  ),
  huevo: (
    <>
      <path d="M50 12c16 0 28 24 28 44a28 28 0 0 1-56 0c0-20 12-44 28-44z" fill="#f3dcc2" />
      <path d="M34 40c2-8 6-14 12-18" stroke="#fff5e8" strokeWidth="6" strokeLinecap="round" fill="none" />
    </>
  ),
  papa: (
    <>
      <path d="M24 52c0-18 14-30 32-30 16 0 26 10 26 26 0 20-16 34-34 34-14 0-24-12-24-30z" fill="#c99a5b" />
      <circle cx="42" cy="44" r="3" fill="#8d6431" />
      <circle cx="60" cy="58" r="3" fill="#8d6431" />
      <circle cx="46" cy="68" r="2.5" fill="#8d6431" />
    </>
  ),
  culantro: (
    <>
      <path d="M50 92V44" stroke="#1f7a4d" strokeWidth="5" strokeLinecap="round" />
      <path
        d="M50 46c-18 2-28-8-28-22 14-2 26 6 28 22zM50 46c18 2 28-8 28-22-14-2-26 6-28 22zM50 34c-8-8-8-18 0-26 8 8 8 18 0 26z"
        fill="#2c9a5f"
      />
      <path d="M50 70c-12 0-18-6-20-14 10 0 18 4 20 14zM50 70c12 0 18-6 20-14-10 0-18 4-20 14z" fill="#1f7a4d" />
    </>
  ),
};

/** Ilustración de un producto del mercado. Decorativa: no se anuncia a lectores de pantalla. */
export function Fruto({ tipo, ...props }: { tipo: TipoFruto } & SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false" {...props}>
      {DIBUJOS[tipo]}
    </svg>
  );
}
