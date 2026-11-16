import type { SVGProps } from "react";

export type GestoIlla = "saluda" | "canasta" | "celebra";

const PIEL = "#e2aa80";
const PIEL_SOMBRA = "#cf9268";
const PELO = "#2b1a16";
const BLUSA = "#f6dcbd";

/**
 * Illa: la compradora que acompaña al cliente. Ilustración completa, de la
 * cabeza a la cintura, pensada para verse entera (nunca recortada).
 * El mandil toma el color de acción del estilo activo.
 *
 * Las clases `illa__*` permiten animarla desde CSS (parpadeo, saludo).
 */
export function Illa({
  gesto = "saluda",
  titulo,
  ...props
}: { gesto?: GestoIlla; titulo?: string } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 240 300"
      role={titulo ? "img" : undefined}
      aria-label={titulo}
      aria-hidden={titulo ? undefined : true}
      focusable="false"
      {...props}
    >
      {/* cabello por detrás y moño bajo */}
      <circle cx="170" cy="126" r="22" fill={PELO} />
      <path d="M62 104c0-40 26-66 58-66s58 26 58 66c0 22-6 40-14 52H76c-8-12-14-30-14-52z" fill={PELO} />

      {/* brazo izquierdo (detrás del cuerpo en "saluda") */}
      {gesto === "saluda" && (
        <g>
          <path d="M66 196c-12 14-16 34-12 54" stroke={BLUSA} strokeWidth="30" strokeLinecap="round" fill="none" />
          <circle cx="55" cy="256" r="15" fill={PIEL} />
        </g>
      )}

      {/* cuerpo: blusa y mandil */}
      <path d="M50 290v-72c0-32 28-52 70-52s70 20 70 52v72a8 8 0 0 1-8 8H58a8 8 0 0 1-8-8z" fill={BLUSA} />
      <path d="M96 170c6 14 14 20 24 20s18-6 24-20" stroke="#dfbf97" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M84 298v-80c12 8 24 12 36 12s24-4 36-12v80z" fill="var(--accion, #d9480f)" />
      <path d="M90 220l12-48M150 220l-12-48" stroke="var(--accion, #d9480f)" strokeWidth="7" strokeLinecap="round" />
      <path d="M104 262h32" stroke="rgb(255 255 255 / 0.55)" strokeWidth="4" strokeLinecap="round" />

      {/* cuello y rostro */}
      <path d="M106 138h28v26c0 8-6 14-14 14s-14-6-14-14z" fill={PIEL_SOMBRA} />
      <ellipse cx="120" cy="102" rx="46" ry="50" fill={PIEL} />
      <circle cx="75" cy="108" r="9" fill={PIEL} />
      <circle cx="165" cy="108" r="9" fill={PIEL} />
      <circle cx="75" cy="124" r="6" fill="none" stroke="#e8a317" strokeWidth="3" />
      <circle cx="165" cy="124" r="6" fill="none" stroke="#e8a317" strokeWidth="3" />

      {/* flequillo con raya al lado */}
      <path d="M72 100c2-34 24-54 50-54 24 0 44 16 48 46-18 2-38-6-54-24-8 18-24 28-44 32z" fill={PELO} />
      <path d="M100 58c10-6 22-8 34-4" stroke="#4a3029" strokeWidth="3" strokeLinecap="round" fill="none" />

      {/* cara */}
      <path d="M92 94c5-4 12-4 17 0M131 94c5-4 12-4 17 0" stroke={PELO} strokeWidth="3.500" strokeLinecap="round" fill="none" />
      <g className="illa__ojos">
        <ellipse cx="101" cy="108" rx="5" ry="6" fill={PELO} />
        <ellipse cx="139" cy="108" rx="5" ry="6" fill={PELO} />
        <circle cx="103" cy="106" r="1.600" fill="#fff" />
        <circle cx="141" cy="106" r="1.600" fill="#fff" />
      </g>
      <path d="M118 112c-2 5-2 8 2 9" stroke={PIEL_SOMBRA} strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M102 128c8 10 28 10 36 0" stroke="#7a2e22" strokeWidth="4" strokeLinecap="round" fill="none" />
      <ellipse cx="88" cy="124" rx="9" ry="6" fill="#ee8f8a" opacity="0.5" />
      <ellipse cx="152" cy="124" rx="9" ry="6" fill="#ee8f8a" opacity="0.5" />

      {/* brazos según el gesto */}
      {gesto === "saluda" && (
        <g className="illa__saludo">
          <path d="M176 196c16-10 28-34 32-62" stroke={BLUSA} strokeWidth="30" strokeLinecap="round" fill="none" />
          <circle cx="209" cy="124" r="16" fill={PIEL} />
          <path d="M198 114l-6-12M207 108l-1-14M217 110l5-12" stroke={PIEL} strokeWidth="8" strokeLinecap="round" />
        </g>
      )}

      {gesto === "celebra" && (
        <g>
          <path d="M64 196c-16-10-28-34-32-62" stroke={BLUSA} strokeWidth="30" strokeLinecap="round" fill="none" />
          <circle cx="31" cy="124" r="16" fill={PIEL} />
          <path d="M176 196c16-10 28-34 32-62" stroke={BLUSA} strokeWidth="30" strokeLinecap="round" fill="none" />
          <circle cx="209" cy="124" r="16" fill={PIEL} />
          <path d="M20 86l-8-10M34 80l-2-12M206 80l2-12M220 86l8-10" stroke="var(--accion, #d9480f)" strokeWidth="5" strokeLinecap="round" />
        </g>
      )}

      {gesto === "canasta" && (
        <g>
          {/* lo que asoma de la canasta */}
          <circle cx="98" cy="232" r="17" fill="#e02a1a" />
          <path d="M98 216c-4-1-8 1-9 4 3 0 6-1 9-1s6 1 9 1c-1-3-5-5-9-4z" fill="#2f7d46" />
          <ellipse cx="128" cy="230" rx="16" ry="14" fill="#a9c92b" />
          <circle cx="154" cy="234" r="14" fill="#f58a16" />
          <path d="M132 222c6-16 18-22 28-22-2 12-10 20-22 24z" fill="#2f7d46" />
          {/* canasta tejida */}
          <path d="M68 240h104l-9 46a10 10 0 0 1-10 8H87a10 10 0 0 1-10-8z" fill="#c98a4b" />
          <path d="M72 256h96M75 272h90M92 240l6 54M120 240v54M148 240l-6 54" stroke="#a66d33" strokeWidth="3" />
          <path d="M66 240h108" stroke="#a66d33" strokeWidth="7" strokeLinecap="round" />
          {/* brazos abrazando la canasta */}
          <path d="M64 198c-10 18-6 40 12 54" stroke={BLUSA} strokeWidth="30" strokeLinecap="round" fill="none" />
          <circle cx="78" cy="254" r="15" fill={PIEL} />
          <path d="M176 198c10 18 6 40-12 54" stroke={BLUSA} strokeWidth="30" strokeLinecap="round" fill="none" />
          <circle cx="162" cy="254" r="15" fill={PIEL} />
        </g>
      )}
    </svg>
  );
}
