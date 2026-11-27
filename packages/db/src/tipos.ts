export type Rol = "cliente" | "compradora" | "repartidor" | "administrador";
export type EstadoPedido =
  | "solicitado"
  | "cotizado"
  | "aprobado"
  | "en_compra"
  | "liquidado"
  | "en_entrega"
  | "entregado"
  | "cerrado"
  | "cancelado";
export type Sustitucion = "similar" | "consultar" | "omitir";
export type EstadoItem = "pendiente" | "comprado" | "sin_stock" | "sustituido";
export type EstadoCotizacion = "enviada" | "aprobada" | "rechazada" | "reemplazada";
export type CuentaCaja = "fondos_clientes" | "negocio";
export type TipoMovimiento =
  | "adelanto_cliente"
  | "cobro_saldo_cliente"
  | "compra_productos"
  | "devolucion_cliente"
  | "ingreso_servicio"
  | "ingreso_delivery"
  | "gasto_operativo"
  | "pago_personal"
  | "otro";
export type Modalidad = "paquete" | "lista" | "delegada" | "caseros";
export type Recepcion = "domicilio" | "recojo";
export type EstadoSolicitud = "nueva" | "contactada" | "convertida" | "descartada";
export type EstadoReclamacion = "recibido" | "en_atencion" | "respondido";

export type Perfil = {
  id: string;
  ciudad_id: string;
  rol: Rol;
  nombre: string;
  celular: string | null;
  activo: boolean;
  creado_en: string;
};
export type Hogar = {
  id: string;
  ciudad_id: string;
  perfil_id: string | null;
  nombre: string;
  celular: string | null;
  personas: number | null;
  presupuesto_semanal: number | null;
  notas: string;
  creado_en: string;
};
export type Direccion = {
  id: string;
  hogar_id: string;
  etiqueta: string;
  direccion: string;
  referencia: string;
  zona: string;
};
export type Categoria = { id: number; nombre: string; orden: number };
export type Producto = { id: string; categoria_id: number; nombre: string; unidad_defecto: string; activo: boolean };
export type Pedido = {
  id: string;
  numero: number;
  ciudad_id: string;
  mercado_id: string | null;
  hogar_id: string;
  solicitud_id: string | null;
  modalidad: Modalidad;
  recepcion: Recepcion;
  direccion_id: string | null;
  estado: EstadoPedido;
  fecha_deseada: string | null;
  notas_cliente: string;
  creado_en: string;
  actualizado_en: string;
};
export type Item = {
  id: string;
  pedido_id: string;
  producto_id: string | null;
  descripcion: string;
  cantidad: number;
  unidad: string;
  preferencia: string;
  casero: string;
  sustitucion: Sustitucion;
  precio_unit_estimado: number | null;
  estado_item: EstadoItem;
  cantidad_real: number | null;
  precio_real_total: number | null;
  nota_compra: string;
  orden: number;
};
export type Cotizacion = {
  id: string;
  pedido_id: string;
  version: number;
  total_productos_estimado: number;
  tarifa_servicio: number;
  tarifa_delivery: number;
  tolerancia_pct: number;
  estado: EstadoCotizacion;
  enviada_en: string;
  aprobada_en: string | null;
};
export type NotaInterna = { id: string; pedido_id: string; autor_id: string | null; texto: string; creado_en: string };
export type Movimiento = {
  id: string;
  ciudad_id: string;
  fecha: string;
  cuenta: CuentaCaja;
  tipo: TipoMovimiento;
  entrada: boolean;
  monto: number;
  pedido_id: string | null;
  descripcion: string;
  creado_en: string;
};
export type ResumenMes = {
  ciudad_id: string;
  mes: string;
  ingresos: number;
  gastos: number;
  ganancia: number;
  fondos_clientes_neto: number;
};
export type Solicitud = {
  id: string;
  ciudad_id: string;
  nombre: string;
  celular: string;
  modalidad: Modalidad;
  recepcion: Recepcion;
  paquete_id: string | null;
  mensaje: string;
  estado: EstadoSolicitud;
  origen: string;
  creado_en: string;
};
export type Reclamacion = {
  id: string;
  numero: number;
  tipo: "reclamo" | "queja";
  consumidor_nombre: string;
  documento_tipo: string;
  documento_numero: string;
  celular: string;
  correo: string;
  domicilio: string;
  bien_tipo: "producto" | "servicio";
  monto_reclamado: number | null;
  descripcion_bien: string;
  detalle: string;
  pedido_consumidor: string;
  estado: EstadoReclamacion;
  respuesta: string | null;
  respondido_en: string | null;
  fecha_limite: string;
  creado_en: string;
};
export type PedidoConHogar = Pedido & {
  hogares: Pick<Hogar, "nombre" | "celular"> | null;
  pedido_items: { count: number }[];
};
