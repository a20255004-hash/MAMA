import type { Modalidad, Recepcion } from "@illari/db";

/** Textos de la página comercial. Aquí no van precios ni condiciones de pago. */

export const MODALIDADES: { id: Modalidad; nombre: string; resumen: string; detalle: string }[] = [
  {
    id: "paquete",
    nombre: "Paquetes y combos",
    resumen: "Una compra ya pensada, que ajustas a tu casa.",
    detalle:
      "Partes de una compra armada para una necesidad concreta y le cambias lo que quieras: más de esto, nada de aquello.",
  },
  {
    id: "lista",
    nombre: "Mi propia lista",
    resumen: "Tú dices qué, cuánto y cómo lo quieres.",
    detalle:
      "Nos mandas tu lista con cantidades y detalles: la palta para hoy, el tomate para ensalada, el pollo en presas. Compramos exactamente eso.",
  },
  {
    id: "delegada",
    nombre: "Compra delegada",
    resumen: "Nos dices para qué y cuánto quieres gastar. Nosotras elegimos.",
    detalle:
      "Nos cuentas qué necesitas, tu presupuesto y lo que prefieres en casa. Nuestra compradora decide qué llevar, como lo haría para la suya.",
  },
  {
    id: "caseros",
    nombre: "Mis caseros de confianza",
    resumen: "Compramos en los puestos donde tú siempre compras.",
    detalle:
      "Si ya tienes tus vendedores de siempre, nos indicas cuáles y vamos a ellos. Tu compra sigue siendo la tuya, solo que no vas tú.",
  },
];

export const RECEPCIONES: { id: Recepcion; nombre: string; detalle: string }[] = [
  { id: "domicilio", nombre: "En mi casa", detalle: "Entregamos en toda la ciudad de Tacna." },
  { id: "recojo", nombre: "Lo recojo en el mercado", detalle: "Coordinamos el punto en el Mercado Grau." },
];

/** Es una secuencia real, por eso va numerada. */
export const PASOS: { momento: string; titulo: string; texto: string }[] = [
  {
    momento: "El día anterior",
    titulo: "Nos cuentas qué necesitas.",
    texto:
      "Por aquí, por WhatsApp o por llamada. Eliges un paquete, mandas tu lista o nos dejas decidir. También nos dices qué hacer si algo no hay.",
  },
  {
    momento: "Antes de comprar",
    titulo: "Te enviamos la cotización.",
    texto: "Averiguamos los precios del día y te la mandamos para que la revises. No compramos nada hasta que la apruebes.",
  },
  {
    momento: "De madrugada",
    titulo: "Compramos por ti.",
    texto:
      "Recorremos los puestos y elegimos pieza por pieza. Si un producto no está disponible, hacemos lo que nos indicaste: nunca decidimos por ti.",
  },
  {
    momento: "En la mañana",
    titulo: "Recibes tu compra.",
    texto: "Te la llevamos a casa, en cualquier punto de Tacna, o la recoges en el Mercado Grau.",
  },
];

export const CRITERIOS: { titulo: string; texto: string }[] = [
  {
    titulo: "Pieza por pieza",
    texto: "Cada fruta y cada verdura se mira y se toca antes de llevarla. Lo que no está bueno, se queda en el puesto.",
  },
  {
    titulo: "Tus caseros también",
    texto: "Si tienes vendedores de confianza, compramos con ellos. Conocer el mercado es saber a quién comprarle qué.",
  },
  {
    titulo: "Nada sin tu permiso",
    texto: "No cambiamos un producto por otro ni tomamos decisiones que no nos diste. Antes de comprar ya sabemos qué hacer.",
  },
];

export const CINTA = ["Frutas", "Verduras", "Tubérculos", "Carnes", "Pollo", "Huevos", "Abarrotes", "Hierbas"];

/** Lo que dice Illa, la compradora, según la parte de la página que se está viendo. */
export const GUIA: Record<string, string> = {
  inicio: "Hola, soy Illa. Yo voy al mercado para que tú no tengas que madrugar.",
  formas: "Elige la forma que más se parezca a cómo compras tú.",
  pasos: "Así trabajamos: primero la cotización, después la compra.",
  quien: "Compro como para mi casa. Si no me convence, no lo llevo.",
  pedir: "Cuéntame qué necesitas y te escribo para coordinar.",
};
