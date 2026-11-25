import type { Modalidad, Recepcion } from "@illari/db";

/**
 * Textos de la página comercial. Tono: cálido, cercano, de tú a tú, como habla
 * una casera de confianza. Aquí no van precios ni condiciones de pago.
 */

export const MODALIDADES: { id: Modalidad; nombre: string; resumen: string; detalle: string }[] = [
  {
    id: "paquete",
    nombre: "Paquetes y combos",
    resumen: "Ya lo pensamos por ti.",
    detalle:
      "Canastas armadas para la semana, para el almuerzo del domingo o para lo que necesites. Le quitas y le pones lo que quieras.",
  },
  {
    id: "lista",
    nombre: "Mi propia lista",
    resumen: "Tú mandas, nosotras compramos.",
    detalle:
      "Escríbenos tu lista tal cual la harías tú: la palta para hoy, el tomate para ensalada, el pollo en presas. Así mismito te lo traemos.",
  },
  {
    id: "delegada",
    nombre: "Compra delegada",
    resumen: "Confía en nuestro ojo.",
    detalle:
      "Cuéntanos para cuántos cocinas y cuánto quieres gastar. Escogemos lo mejor del día, como lo haríamos para nuestra casa.",
  },
  {
    id: "caseros",
    nombre: "Mis caseros de confianza",
    resumen: "Vamos donde tus caseros de siempre.",
    detalle:
      "¿Tienes tu casera de las verduras y tu casero del pollo? Dinos quiénes son y vamos donde ellos, de tu parte.",
  },
];

export const RECEPCIONES: { id: Recepcion; nombre: string; detalle: string }[] = [
  { id: "domicilio", nombre: "En mi casa", detalle: "Llegamos a cualquier parte de Tacna." },
  { id: "recojo", nombre: "Lo recojo en el mercado", detalle: "Quedamos en un punto del Mercado Grau." },
];

/** Es una secuencia real, por eso va numerada. */
export const PASOS: { momento: string; titulo: string; texto: string }[] = [
  {
    momento: "Un día antes",
    titulo: "Nos cuentas qué necesitas.",
    texto:
      "Por aquí, por WhatsApp o con una llamada, como te quede más cómodo. De paso nos dices qué hacemos si algo no hay.",
  },
  {
    momento: "Antes de comprar",
    titulo: "Te pasamos los precios.",
    texto:
      "Preguntamos cómo amaneció el mercado y te enviamos tu cotización. No compramos nada hasta que tú nos digas que sí.",
  },
  {
    momento: "De madrugada",
    titulo: "Vamos por lo tuyo.",
    texto:
      "Recorremos los puestos y escogemos pieza por pieza. Si algo no hay, hacemos lo que quedamos contigo. Nada de sorpresas.",
  },
  {
    momento: "En la mañana",
    titulo: "Llega a tus manos.",
    texto: "Te lo llevamos a tu casa, en cualquier parte de Tacna, o lo recoges en el Mercado Grau. Tú eliges.",
  },
];

export const CRITERIOS: { titulo: string; texto: string }[] = [
  {
    titulo: "Pieza por pieza",
    texto: "Miramos, tocamos y olemos antes de llevar. Lo que no nos convence, se queda en el puesto.",
  },
  {
    titulo: "Con tus caseros",
    texto: "Si ya tienes los tuyos, vamos donde ellos. Y si no, compramos donde sabemos que es bueno.",
  },
  {
    titulo: "Siempre con tu permiso",
    texto: "No cambiamos un producto por otro sin avisarte. Tu compra es tuya; nosotras solo te la traemos.",
  },
];

/** Notas a mano (Caveat): cortas, grandes y siempre con sentido; no se usan en párrafos. */
export const MANO = {
  quien: "Escogido hoy por Illa",
  cierre: "Con cariño, Illa",
} as const;

export const CINTA = ["Frutas", "Verduras", "Papas", "Carnes", "Pollo", "Huevos", "Abarrotes", "Hierbas"];

/** Lo que dice Illa según la parte de la página que se está viendo. */
export const GUIA: Record<string, string> = {
  inicio: "¡Hola! Soy Illa. Yo madrugo para que tú no tengas que hacerlo.",
  formas: "¿No sabes cuál elegir? Tranqui, yo te ayudo.",
  pasos: "Primero te paso los precios y recién ahí decides.",
  quien: "Compro como para mi casa: si no me convence, no lo llevo.",
  pedir: "Cuéntame qué necesitas y te escribo al toque.",
};

/** Ayuda de Illa para elegir la forma de comprar. */
export const AYUDA: { pregunta: string; opciones: { texto: string; modalidad: Modalidad }[] } = {
  pregunta: "¿Cómo te gusta hacer tu mercado?",
  opciones: [
    { texto: "Ya sé exactamente qué quiero", modalidad: "lista" },
    { texto: "Prefiero algo ya armado", modalidad: "paquete" },
    { texto: "Elige tú por mí", modalidad: "delegada" },
    { texto: "Con mis caseros de siempre", modalidad: "caseros" },
  ],
};
