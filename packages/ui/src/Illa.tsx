import { useId, type SVGProps } from "react";

export type GestoIlla = "saluda" | "canasta" | "celebra";

const PIEL = "#e8b48a";
const PIEL_SOMBRA = "#d89c72";
const PELO = "#2b1a16";
const PELO_BRILLO = "#4a302a";
const BLUSA = "#f4d3ae";
const ORO = "#ffc933";
const ACCION = "var(--accion, #d9480f)";

/** Un tramo de trenza: óvalos que se cruzan, como cabello trenzado de verdad. */
function Trenza({ x }: { x: number }) {
  return (
    <g>
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${x} ${166 + i * 22}) rotate(${i % 2 ? 16 : -16})`}>
          <ellipse rx="12" ry="15" fill={PELO} />
          <path d="M-4 -9c4 4 4 14 0 18" stroke={PELO_BRILLO} strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </g>
      ))}
      {/* lazo amarillo */}
      <g transform={`translate(${x} 232)`}>
        <path d="M-12 -7L0 0L-12 7z" fill={ORO} />
        <path d="M12 -7L0 0L12 7z" fill={ORO} />
        <circle r="3.5" fill="#f2a900" />
      </g>
    </g>
  );
}

/**
 * Illa: la compradora que acompaña al cliente. Ilustración de la cabeza a la
 * cintura, con cara redonda, sonrisa abierta y dos trenzas con lazos.
 * El mandil toma el color de acción del estilo activo.
 *
 * Las clases `illa__*` permiten animarla desde CSS (parpadeo y saludo).
 */
export function Illa({
  gesto = "saluda",
  titulo,
  ...props
}: { gesto?: GestoIlla; titulo?: string } & SVGProps<SVGSVGElement>) {
  const boca = useId();

  return (
    <svg
      viewBox="0 0 240 300"
      role={titulo ? "img" : undefined}
      aria-label={titulo}
      aria-hidden={titulo ? undefined : true}
      focusable="false"
      {...props}
    >
      <defs>
        <clipPath id={boca}>
          <path d="M98 138Q120 144 142 138Q138 161 120 161Q102 161 98 138Z" />
        </clipPath>
      </defs>

      {/* cabello por detrás */}
      <ellipse cx="120" cy="98" rx="64" ry="62" fill={PELO} />

      {/* blusa */}
      <path d="M46 300v-62c0-34 30-56 74-56s74 22 74 56v62z" fill={BLUSA} />

      {/* cuello y escote bordado */}
      <rect x="104" y="148" width="32" height="40" rx="12" fill={PIEL_SOMBRA} />
      <path d="M96 182Q120 210 144 182Z" fill={PIEL_SOMBRA} />
      {[
        [101, 188, ORO],
        [110, 196, ACCION],
        [120, 199, ORO],
        [130, 196, ACCION],
        [139, 188, ORO],
      ].map(([cx, cy, color]) => (
        <circle key={`${cx}`} cx={cx as number} cy={cy as number} r="2.8" fill={color as string} />
      ))}

      {/* mandil */}
      <path d="M88 300v-80c10 6 22 9 32 9s22-3 32-9v80z" fill={ACCION} />
      <path d="M95 226L87 190M145 226L153 190" stroke={ACCION} strokeWidth="9" strokeLinecap="round" />
      <rect x="104" y="258" width="32" height="24" rx="7" fill="rgb(255 255 255 / 0.28)" />

      {/* trenzas */}
      <Trenza x={72} />
      <Trenza x={168} />

      {/* brazo izquierdo y lo que lleva, según el gesto */}
      {gesto === "saluda" && (
        <g>
          <path d="M62 208C54 226 54 244 58 258" stroke={BLUSA} strokeWidth="28" strokeLinecap="round" fill="none" />
          <circle cx="58" cy="266" r="14" fill={PIEL} />
        </g>
      )}

      {gesto === "canasta" && (
        <g>
          {/* lo que asoma de la canasta */}
          <circle cx="100" cy="240" r="17" fill="#e02a1a" />
          <path d="M100 224c-4-1-8 1-9 4 3 0 6-1 9-1s6 1 9 1c-1-3-5-5-9-4z" fill="#2f7d46" />
          <ellipse cx="130" cy="238" rx="16" ry="14" fill="#a9c92b" />
          <circle cx="156" cy="242" r="14" fill="#f58a16" />
          <path d="M134 230c6-16 18-22 28-22-2 12-10 20-22 24z" fill="#2f7d46" />
          {/* canasta tejida */}
          <path d="M70 250h100l-9 42a10 10 0 0 1-10 8H89a10 10 0 0 1-10-8z" fill="#c98a4b" />
          <path d="M74 264h92M77 280h86M94 250l5 50M120 250v50M146 250l-5 50" stroke="#a66d33" strokeWidth="3" />
          <path d="M68 250h104" stroke="#a66d33" strokeWidth="7" strokeLinecap="round" />
          {/* brazos abrazando la canasta */}
          <path d="M62 208C48 226 54 246 72 256" stroke={BLUSA} strokeWidth="28" strokeLinecap="round" fill="none" />
          <circle cx="76" cy="258" r="14" fill={PIEL} />
          <path d="M178 208C192 226 186 246 168 256" stroke={BLUSA} strokeWidth="28" strokeLinecap="round" fill="none" />
          <circle cx="164" cy="258" r="14" fill={PIEL} />
        </g>
      )}

      {gesto === "celebra" && (
        <g>
          <path d="M64 208C44 194 34 170 34 144" stroke={BLUSA} strokeWidth="28" strokeLinecap="round" fill="none" />
          <circle cx="34" cy="130" r="15" fill={PIEL} />
          <path d="M16 96l-8-10M34 88l-2-14M50 98l6-12" stroke={ACCION} strokeWidth="4" strokeLinecap="round" />
        </g>
      )}

      {/* orejas y aretes */}
      <circle cx="67" cy="114" r="10" fill={PIEL} />
      <circle cx="173" cy="114" r="10" fill={PIEL} />
      <circle cx="66" cy="132" r="5.5" fill="none" stroke="#e8a317" strokeWidth="3" />
      <circle cx="174" cy="132" r="5.5" fill="none" stroke="#e8a317" strokeWidth="3" />

      {/* rostro redondo */}
      <ellipse cx="120" cy="110" rx="54" ry="56" fill={PIEL} />

      {/* mejillas */}
      <ellipse cx="85" cy="134" rx="11" ry="7.5" fill="#f2827f" opacity="0.5" />
      <ellipse cx="155" cy="134" rx="11" ry="7.5" fill="#f2827f" opacity="0.5" />

      {/* cejas suaves y levantadas */}
      <path d="M85 94Q98 85 111 92M129 92Q142 85 155 94" stroke={PELO} strokeWidth="3.5" strokeLinecap="round" fill="none" />

      {/* ojos grandes y brillantes */}
      <g className="illa__ojos">
        <ellipse cx="98" cy="113" rx="7" ry="8.5" fill={PELO} />
        <ellipse cx="142" cy="113" rx="7" ry="8.5" fill={PELO} />
        <circle cx="100.5" cy="109.500" r="2.800" fill="#fff" />
        <circle cx="144.500" cy="109.500" r="2.800" fill="#fff" />
        <circle cx="95.500" cy="116.500" r="1.400" fill="#fff" />
        <circle cx="139.500" cy="116.500" r="1.400" fill="#fff" />
      </g>

      {/* naricita */}
      <path d="M116 127Q120 131 124 127" stroke={PIEL_SOMBRA} strokeWidth="3" strokeLinecap="round" fill="none" />

      {/* sonrisa abierta con dientes y lengüita */}
      <path d="M98 138Q120 144 142 138Q138 161 120 161Q102 161 98 138Z" fill="#7d2620" />
      <g clipPath={`url(#${boca})`}>
        <path d="M96 137Q120 143 144 137L144 147Q120 153 96 147Z" fill="#fffdf8" />
        <ellipse cx="120" cy="160" rx="12" ry="8" fill="#e8665f" />
      </g>
      <path d="M96 136q-4 3-1 8M144 136q4 3 1 8" stroke={PIEL_SOMBRA} strokeWidth="2.500" strokeLinecap="round" fill="none" />

      {/* flequillo con raya al medio */}
      <path
        d="M68 110C66 62 96 44 120 44s54 18 52 66C164 86 144 70 120 68C96 70 76 86 68 110Z"
        fill={PELO}
      />
      <path d="M120 46V68" stroke={PELO_BRILLO} strokeWidth="2.500" strokeLinecap="round" />
      <path d="M92 58Q106 50 118 52" stroke={PELO_BRILLO} strokeWidth="3" strokeLinecap="round" fill="none" />

      {/* brazo derecho: el que saluda o celebra */}
      {gesto === "saluda" && (
        <g className="illa__saludo">
          <path d="M178 208C198 194 208 170 208 146" stroke={BLUSA} strokeWidth="28" strokeLinecap="round" fill="none" />
          <circle cx="208" cy="130" r="15" fill={PIEL} />
          <path d="M198 118l-7-12M207 114l-1-15M217 118l6-12" stroke={PIEL} strokeWidth="8" strokeLinecap="round" />
        </g>
      )}

      {gesto === "celebra" && (
        <g>
          <path d="M176 208C196 194 206 170 206 144" stroke={BLUSA} strokeWidth="28" strokeLinecap="round" fill="none" />
          <circle cx="206" cy="130" r="15" fill={PIEL} />
          <path d="M224 96l8-10M206 88l2-14M190 98l-6-12" stroke={ACCION} strokeWidth="4" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
}
