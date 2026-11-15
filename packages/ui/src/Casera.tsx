import type { SVGProps } from "react";

/**
 * La casera: personaje guía de la marca. Acompaña en la web y en la app.
 * `gesto="saluda"` levanta la mano; `gesto="canasta"` lleva la compra.
 * Con `titulo` se anuncia como imagen; sin él es decorativa.
 */
export function Casera({
  gesto = "canasta",
  titulo,
  ...props
}: { gesto?: "canasta" | "saluda"; titulo?: string } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 200 220"
      role={titulo ? "img" : undefined}
      aria-label={titulo}
      aria-hidden={titulo ? undefined : true}
      focusable="false"
      {...props}
    >
      {/* trenza y cabello */}
      <path d="M60 78c-10 30-8 60 4 84" stroke="#2a1a3a" strokeWidth="14" strokeLinecap="round" fill="none" />
      <circle cx="66" cy="166" r="8" fill="#f5b700" />
      <path d="M52 84c0-34 22-54 48-54s48 20 48 54c0 10-2 18-6 24H58c-4-6-6-14-6-24z" fill="#2a1a3a" />
      {/* cuerpo y mandil */}
      <path d="M36 220c0-40 28-62 64-62s64 22 64 62z" fill="#d4186c" />
      <path d="M68 220c0-26 4-44 32-44s32 18 32 44z" fill="#fffaf6" />
      <path d="M78 176c6 8 14 12 22 12s16-4 22-12" stroke="#d4186c" strokeWidth="4" fill="none" />
      {/* cuello y rostro */}
      <rect x="88" y="138" width="24" height="28" rx="10" fill="#c98a62" />
      <ellipse cx="100" cy="100" rx="40" ry="44" fill="#dba27a" />
      <path d="M60 92c4-26 22-40 42-40 18 0 34 12 38 34-14 0-28-6-38-18-8 14-22 22-42 24z" fill="#2a1a3a" />
      <circle cx="84" cy="104" r="4.5" fill="#2a1a3a" />
      <circle cx="116" cy="104" r="4.5" fill="#2a1a3a" />
      <path d="M84 120c8 10 24 10 32 0" stroke="#2a1a3a" strokeWidth="4.5" strokeLinecap="round" fill="none" />
      <circle cx="72" cy="116" r="7" fill="#e8798c" opacity=".55" />
      <circle cx="128" cy="116" r="7" fill="#e8798c" opacity=".55" />
      <circle cx="60" cy="112" r="5" fill="#f5b700" />
      <circle cx="140" cy="112" r="5" fill="#f5b700" />
      {gesto === "saluda" ? (
        <g>
          <path d="M150 178c14-10 22-28 22-46" stroke="#d4186c" strokeWidth="18" strokeLinecap="round" fill="none" />
          <circle cx="172" cy="124" r="12" fill="#dba27a" />
        </g>
      ) : (
        <g>
          <path d="M132 196h56l-6 24h-44z" fill="#b8793a" />
          <path d="M136 196c0-18 10-28 24-28s24 10 24 28" stroke="#8d5a26" strokeWidth="5" fill="none" />
          <circle cx="148" cy="192" r="10" fill="#e2322b" />
          <circle cx="166" cy="190" r="10" fill="#b9d531" />
          <path d="M176 194c2-12 8-18 14-20" stroke="#1f7a4d" strokeWidth="5" strokeLinecap="round" fill="none" />
        </g>
      )}
    </svg>
  );
}
