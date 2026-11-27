import type { EstadoPedido, Modalidad, Recepcion, Rol, TipoMovimiento } from "./tipos";

/** S/ 1,234.50 */
export function soles(n: number | string | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return "—";
  return `S/ ${Number(n).toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function cantidad(n: number | string): string {
  return Number(n).toLocaleString("es-PE", { maximumFractionDigits: 3 });
}

export function fechaCorta(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(`${iso}T12:00:00`) : new Date(iso);
  return d.toLocaleDateString("es-PE", { day: "numeric", month: "short", year: "numeric" });
}

export function fechaHora(iso: string): string {
  return new Date(iso).toLocaleString("es-PE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export const NOMBRE_ESTADO: Record<EstadoPedido, string> = {
  solicitado: "Recibido",
  cotizado: "Cotización lista",
  aprobado: "Aprobado",
  en_compra: "Comprando",
  liquidado: "Cuentas hechas",
  en_entrega: "En camino",
  entregado: "Entregado",
  cerrado: "Cerrado",
  cancelado: "Cancelado",
};

/** Lo que ve la persona en su app, dicho con calidez. */
export const FRASE_ESTADO: Record<EstadoPedido, string> = {
  solicitado: "Ya recibimos tu pedido. Te escribimos pronto con la cotización.",
  cotizado: "Tu cotización está lista. Revísala y, si te parece bien, apruébala.",
  aprobado: "¡Aprobado! Ya nos vamos al mercado por ti.",
  en_compra: "Estamos en el mercado escogiendo tu compra.",
  liquidado: "Ya terminamos de comprar. Estamos cerrando las cuentas con los precios reales.",
  en_entrega: "Tu pedido va en camino.",
  entregado: "Entregado. ¡Que lo disfrutes!",
  cerrado: "Pedido cerrado. Gracias por confiar en nosotras.",
  cancelado: "Este pedido se canceló.",
};

export const NOMBRE_MODALIDAD: Record<Modalidad, string> = {
  paquete: "Paquete o combo",
  lista: "Mi propia lista",
  delegada: "Compra delegada",
  caseros: "Mis caseros de confianza",
};

export const NOMBRE_RECEPCION: Record<Recepcion, string> = {
  domicilio: "A domicilio",
  recojo: "Recojo en el Mercado Grau",
};

export const NOMBRE_ROL: Record<Rol, string> = {
  cliente: "Cliente",
  compradora: "Compradora",
  repartidor: "Repartidor",
  administrador: "Administración",
};

export const NOMBRE_MOVIMIENTO: Record<TipoMovimiento, string> = {
  adelanto_cliente: "Adelanto del cliente",
  cobro_saldo_cliente: "Cobro de saldo al cliente",
  compra_productos: "Compra de productos",
  devolucion_cliente: "Devolución al cliente",
  ingreso_servicio: "Ingreso por servicio",
  ingreso_delivery: "Ingreso por delivery",
  gasto_operativo: "Gasto operativo",
  pago_personal: "Pago al personal",
  otro: "Otro",
};

/** Las dos cuentas de la caja: el dinero de los clientes nunca se mezcla con el del negocio. */
export const CUENTA_DE: Record<TipoMovimiento, "fondos_clientes" | "negocio" | null> = {
  adelanto_cliente: "fondos_clientes",
  cobro_saldo_cliente: "fondos_clientes",
  compra_productos: "fondos_clientes",
  devolucion_cliente: "fondos_clientes",
  ingreso_servicio: "negocio",
  ingreso_delivery: "negocio",
  gasto_operativo: "negocio",
  pago_personal: "negocio",
  otro: null,
};

export const ENTRADA_DE: Record<TipoMovimiento, boolean | null> = {
  adelanto_cliente: true,
  cobro_saldo_cliente: true,
  compra_productos: false,
  devolucion_cliente: false,
  ingreso_servicio: true,
  ingreso_delivery: true,
  gasto_operativo: false,
  pago_personal: false,
  otro: null,
};

/** Enlace para escribir un correo con el asunto ya puesto. */
export function enlaceCorreo(correo: string, asunto: string): string {
  return `mailto:${correo}?subject=${encodeURIComponent(asunto)}`;
}

export const NOMBRE_ENTREGA = {
  pendiente: "Por salir",
  en_camino: "En camino",
  entregada: "Entregada",
  fallida: "No se pudo entregar",
} as const;

export const NOMBRE_SUSTITUCION = {
  consultar: "Consultarme antes",
  similar: "Cambiar por algo similar",
  omitir: "Mejor no llevarlo",
} as const;
