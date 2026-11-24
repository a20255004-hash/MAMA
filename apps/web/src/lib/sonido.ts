/**
 * Sonidos de la página, generados en el momento con Web Audio: no se descarga
 * ningún archivo de audio. Son breves, suaves y siempre con volumen bajo.
 *
 * Los navegadores solo permiten el audio después de que la persona toca, hace
 * clic o usa el teclado; hasta entonces no suena nada. Se puede silenciar con el
 * botón de la cabecera y la elección se recuerda en este dispositivo.
 */

export type Sonido = "toque" | "elige" | "pop" | "campanita" | "paso" | "exito" | "amanecer";

const CLAVE = "illari:sonido";
const VOLUMEN = 0.55;

let ctx: AudioContext | null = null;
let maestro: GainNode | null = null;
let activo = true;
let listo = false;
let ultimoToque = 0;
const oyentes = new Set<() => void>();

type OpcionesNota = {
  frec: number;
  hasta?: number;
  inicio?: number;
  dur?: number;
  tipo?: OscillatorType;
  vol?: number;
  ataque?: number;
};

function nota(c: AudioContext, destino: AudioNode, o: OpcionesNota) {
  const { frec, hasta, inicio = 0, dur = 0.15, tipo = "sine", vol = 0.2, ataque = 0.006 } = o;
  const t0 = c.currentTime + inicio;
  const osc = c.createOscillator();
  const ganancia = c.createGain();
  osc.type = tipo;
  osc.frequency.setValueAtTime(frec, t0);
  if (hasta) osc.frequency.exponentialRampToValueAtTime(hasta, t0 + dur);
  ganancia.gain.setValueAtTime(0.0001, t0);
  ganancia.gain.exponentialRampToValueAtTime(vol, t0 + ataque);
  ganancia.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(ganancia).connect(destino);
  osc.start(t0);
  osc.stop(t0 + dur + 0.03);
}

const ESCALA_PASOS = [392, 440, 494, 587]; // sol, la, si, re: sube con cada paso

function tocar(c: AudioContext, destino: AudioNode, que: Sonido, i: number) {
  switch (que) {
    case "toque": // pulsar un botón: un golpecito de madera suave
      nota(c, destino, { frec: 520, hasta: 340, dur: 0.09, vol: 0.16 });
      nota(c, destino, { frec: 1040, dur: 0.05, vol: 0.04 });
      break;
    case "elige": // elegir una opción
      nota(c, destino, { frec: 660, hasta: 990, dur: 0.1, vol: 0.13 });
      break;
    case "pop": // Illa aparece
      nota(c, destino, { frec: 480, hasta: 880, dur: 0.12, vol: 0.14 });
      break;
    case "campanita": // Illa te recomienda algo
      nota(c, destino, { frec: 784, dur: 0.35, tipo: "triangle", vol: 0.13 });
      nota(c, destino, { frec: 1175, inicio: 0.09, dur: 0.45, tipo: "triangle", vol: 0.09 });
      break;
    case "paso": // cambia el número de "cómo funciona"
      nota(c, destino, { frec: ESCALA_PASOS[i % ESCALA_PASOS.length] ?? 440, hasta: 300, dur: 0.14, tipo: "triangle", vol: 0.15 });
      break;
    case "exito": // el pedido está listo
      [523, 659, 784, 1047].forEach((frec, k) =>
        nota(c, destino, { frec, inicio: k * 0.09, dur: 0.32, tipo: "triangle", vol: 0.13 }),
      );
      break;
    case "amanecer": // sale el sol: un acorde tibio y pajaritos
      [262, 330, 392].forEach((frec) => nota(c, destino, { frec, dur: 1.8, tipo: "triangle", vol: 0.035, ataque: 0.5 }));
      [0.15, 0.32, 0.55, 0.72, 0.95].forEach((inicio, k) =>
        nota(c, destino, { frec: 2300 + k * 140, hasta: 3300 + k * 90, inicio, dur: 0.09, vol: 0.045 }),
      );
      break;
  }
}

function avisar() {
  oyentes.forEach((f) => f());
}

function preparar() {
  if (ctx || typeof window === "undefined") return;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return;
  ctx = new Ctor();
  maestro = ctx.createGain();
  maestro.gain.value = VOLUMEN;
  maestro.connect(ctx.destination);
}

function alPrimerGesto() {
  preparar();
  if (ctx?.state === "suspended") void ctx.resume();
}

/** Se llama una vez al abrir la página: lee la preferencia y espera el primer toque. */
export function iniciarSonido() {
  if (listo || typeof window === "undefined") return;
  listo = true;
  try {
    activo = localStorage.getItem(CLAVE) !== "0";
  } catch {
    activo = true;
  }
  avisar();

  for (const tipo of ["pointerdown", "keydown", "touchend"] as const) {
    window.addEventListener(tipo, alPrimerGesto, { once: false, passive: true });
  }

  // Un solo oyente para todos los botones, en vez de uno por cada botón.
  document.addEventListener(
    "click",
    (e) => {
      const el = (e.target as Element | null)?.closest?.(
        "a.boton, button.boton, .forma__pedir, .guia__accion, .guia__opciones button, .opcion, .guia__illa, .cabecera__nav a",
      );
      if (!el || el.closest("[data-sin-sonido]")) return;
      const ahora = performance.now();
      if (ahora - ultimoToque < 90) return; // una etiqueta y su casilla disparan dos clics
      ultimoToque = ahora;
      reproducir("toque");
    },
    true,
  );

  // Si la pestaña queda atrás, el audio descansa.
  document.addEventListener("visibilitychange", () => {
    if (!ctx) return;
    if (document.hidden) void ctx.suspend();
    else if (activo) void ctx.resume();
  });
}

export function reproducir(que: Sonido, i = 0) {
  if (!activo || !ctx || !maestro || ctx.state !== "running") return;
  tocar(ctx, maestro, que, i);
}

export function estaActivo() {
  return activo;
}

export function suscribir(f: () => void) {
  oyentes.add(f);
  return () => {
    oyentes.delete(f);
  };
}

export function alternarSonido() {
  activo = !activo;
  try {
    localStorage.setItem(CLAVE, activo ? "1" : "0");
  } catch {
    /* sin almacenamiento: la preferencia dura solo esta visita */
  }
  avisar();
  if (activo) {
    alPrimerGesto();
    reproducir("campanita");
  }
}
