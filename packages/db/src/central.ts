import { clienteConSesion, ok } from "./cliente";
import type {
  Categoria,
  Cotizacion,
  Direccion,
  EstadoItem,
  EstadoPedido,
  EstadoReclamacion,
  EstadoSolicitud,
  Hogar,
  Item,
  Movimiento,
  NotaInterna,
  Pedido,
  PedidoConHogar,
  Perfil,
  Producto,
  Reclamacion,
  ResumenMes,
  Rol,
  Solicitud,
  Sustitucion,
  TipoMovimiento,
} from "./tipos";
import { CUENTA_DE, ENTRADA_DE } from "./formato";

/** Todo lo que usa Illari Central, el panel interno. La seguridad real vive en la base de datos. */

// Solicitudes que llegan desde la web ----------------------------------------------------------

export async function solicitudes(estado?: EstadoSolicitud): Promise<Solicitud[]> {
  let q = clienteConSesion().from("solicitudes").select("*").order("creado_en", { ascending: false });
  if (estado) q = q.eq("estado", estado);
  return ok(await q) as Solicitud[];
}

export async function marcarSolicitud(id: string, estado: EstadoSolicitud): Promise<void> {
  ok(await clienteConSesion().from("solicitudes").update({ estado }).eq("id", id).select("id"));
}

/** Convierte una solicitud de la web en cliente + pedido. Si el celular ya existe, reutiliza ese hogar. */
export async function convertirSolicitud(s: Solicitud): Promise<Pedido> {
  const sb = clienteConSesion();
  let hogar = ok(
    await sb.from("hogares").select("*").eq("ciudad_id", s.ciudad_id).eq("celular", s.celular).limit(1).maybeSingle(),
  ) as Hogar | null;
  if (!hogar) {
    hogar = ok(
      await sb.from("hogares").insert({ ciudad_id: s.ciudad_id, nombre: s.nombre, celular: s.celular }).select("*").single(),
    ) as Hogar;
  }
  const pedido = ok(
    await sb
      .from("pedidos")
      .insert({
        ciudad_id: s.ciudad_id,
        hogar_id: hogar.id,
        solicitud_id: s.id,
        modalidad: s.modalidad,
        recepcion: s.recepcion,
        notas_cliente: s.mensaje,
      })
      .select("*")
      .single(),
  ) as Pedido;
  await marcarSolicitud(s.id, "convertida");
  return pedido;
}

// Pedidos --------------------------------------------------------------------------------------

export async function pedidos(estados?: EstadoPedido[]): Promise<PedidoConHogar[]> {
  let q = clienteConSesion()
    .from("pedidos")
    .select("*, hogares(nombre, celular), pedido_items(count)")
    .order("creado_en", { ascending: false });
  if (estados && estados.length > 0) q = q.in("estado", estados);
  return ok(await q) as PedidoConHogar[];
}

export type PedidoCompleto = {
  pedido: Pedido;
  hogar: Hogar | null;
  direccion: Direccion | null;
  items: Item[];
  cotizaciones: Cotizacion[];
  notas: NotaInterna[];
  movimientos: Movimiento[];
};

export async function pedidoCompleto(id: string): Promise<PedidoCompleto | null> {
  const sb = clienteConSesion();
  const pedido = ok(await sb.from("pedidos").select("*").eq("id", id).maybeSingle()) as Pedido | null;
  if (!pedido) return null;
  const [hogar, dir, items, cots, notas, movs] = await Promise.all([
    sb.from("hogares").select("*").eq("id", pedido.hogar_id).maybeSingle(),
    pedido.direccion_id ? sb.from("direcciones").select("*").eq("id", pedido.direccion_id).maybeSingle() : Promise.resolve({ data: null, error: null }),
    sb.from("pedido_items").select("*").eq("pedido_id", id).order("orden"),
    sb.from("cotizaciones").select("*").eq("pedido_id", id).order("version", { ascending: false }),
    sb.from("notas_internas").select("*").eq("pedido_id", id).order("creado_en"),
    sb.from("movimientos").select("*").eq("pedido_id", id).order("creado_en"),
  ]);
  return {
    pedido,
    hogar: ok(hogar) as Hogar | null,
    direccion: ok(dir) as Direccion | null,
    items: ok(items) as Item[],
    cotizaciones: ok(cots) as Cotizacion[],
    notas: ok(notas) as NotaInterna[],
    movimientos: ok(movs) as Movimiento[],
  };
}

export type ItemEditable = {
  id?: string;
  pedidoId: string;
  descripcion: string;
  cantidad: number;
  unidad: string;
  preferencia: string;
  casero: string;
  sustitucion: Sustitucion;
  precioUnitEstimado: number | null;
  productoId?: string | null;
  orden?: number;
};

export async function guardarItem(it: ItemEditable): Promise<void> {
  const fila = {
    pedido_id: it.pedidoId,
    producto_id: it.productoId ?? null,
    descripcion: it.descripcion,
    cantidad: it.cantidad,
    unidad: it.unidad,
    preferencia: it.preferencia,
    casero: it.casero,
    sustitucion: it.sustitucion,
    precio_unit_estimado: it.precioUnitEstimado,
    orden: it.orden ?? 0,
  };
  const sb = clienteConSesion();
  if (it.id) ok(await sb.from("pedido_items").update(fila).eq("id", it.id).select("id"));
  else ok(await sb.from("pedido_items").insert(fila).select("id"));
}

export async function borrarItem(id: string): Promise<void> {
  ok(await clienteConSesion().from("pedido_items").delete().eq("id", id).select("id"));
}

export async function enviarCotizacion(pedidoId: string, servicio: number, delivery: number, toleranciaPct: number): Promise<void> {
  ok(
    await clienteConSesion().rpc("enviar_cotizacion", {
      p_pedido: pedidoId,
      p_servicio: servicio,
      p_delivery: delivery,
      p_tolerancia: toleranciaPct,
    }),
  );
}

export async function cambiarEstado(pedidoId: string, estado: EstadoPedido): Promise<void> {
  ok(await clienteConSesion().rpc("cambiar_estado_pedido", { p_pedido: pedidoId, p_estado: estado }));
}

export async function cancelarPedidoCentral(pedidoId: string): Promise<void> {
  ok(await clienteConSesion().rpc("cancelar_pedido", { p_pedido: pedidoId }));
}

export async function aprobarEnNombreDelCliente(pedidoId: string): Promise<void> {
  ok(await clienteConSesion().rpc("aprobar_cotizacion", { p_pedido: pedidoId }));
}

export async function registrarCompra(datos: {
  itemId: string;
  cantidadReal: number | null;
  precioRealTotal: number | null;
  estado: EstadoItem;
  nota: string;
}): Promise<void> {
  ok(
    await clienteConSesion().rpc("registrar_compra_item", {
      p_item: datos.itemId,
      p_cantidad_real: datos.cantidadReal,
      p_precio_real_total: datos.precioRealTotal,
      p_estado: datos.estado,
      p_nota: datos.nota,
    }),
  );
}

export async function agregarNota(pedidoId: string, autorId: string, texto: string): Promise<void> {
  ok(await clienteConSesion().from("notas_internas").insert({ pedido_id: pedidoId, autor_id: autorId, texto }).select("id"));
}

/** Pedidos listos para comprar, con sus productos y el nombre de quien los recibe. */
export type PedidoParaComprar = Pedido & { hogares: { nombre: string; celular: string | null } | null; pedido_items: Item[] };

export async function pedidosParaComprar(): Promise<PedidoParaComprar[]> {
  const filas = ok(
    await clienteConSesion()
      .from("pedidos")
      .select("*, hogares(nombre, celular), pedido_items(*)")
      .in("estado", ["aprobado", "en_compra"])
      .order("creado_en"),
  );
  return filas as PedidoParaComprar[];
}

// Caja -----------------------------------------------------------------------------------------

export async function movimientos(limite = 200): Promise<Movimiento[]> {
  return ok(
    await clienteConSesion().from("movimientos").select("*").order("fecha", { ascending: false }).order("creado_en", { ascending: false }).limit(limite),
  ) as Movimiento[];
}

export async function resumenCaja(): Promise<ResumenMes[]> {
  return ok(await clienteConSesion().from("resumen_caja").select("*").order("mes", { ascending: false })) as ResumenMes[];
}

export async function registrarMovimiento(datos: {
  ciudadId: string;
  tipo: TipoMovimiento;
  monto: number;
  fecha: string;
  pedidoId?: string | null;
  descripcion: string;
  /** Solo para el tipo "otro", que no fija cuenta ni sentido. */
  cuenta?: "fondos_clientes" | "negocio";
  entrada?: boolean;
}): Promise<void> {
  const cuenta = CUENTA_DE[datos.tipo] ?? datos.cuenta;
  const entrada = ENTRADA_DE[datos.tipo] ?? datos.entrada;
  if (!cuenta || entrada === undefined) throw new Error("Falta indicar la cuenta y si es entrada o salida.");
  ok(
    await clienteConSesion()
      .from("movimientos")
      .insert({
        ciudad_id: datos.ciudadId,
        tipo: datos.tipo,
        cuenta,
        entrada,
        monto: datos.monto,
        fecha: datos.fecha,
        pedido_id: datos.pedidoId ?? null,
        descripcion: datos.descripcion,
      })
      .select("id"),
  );
}

// Libro de Reclamaciones ------------------------------------------------------------------------

export async function reclamaciones(): Promise<Reclamacion[]> {
  return ok(await clienteConSesion().from("reclamaciones").select("*").order("creado_en", { ascending: false })) as Reclamacion[];
}

export async function marcarReclamo(id: string, estado: EstadoReclamacion): Promise<void> {
  ok(await clienteConSesion().from("reclamaciones").update({ estado }).eq("id", id).select("id"));
}

export async function responderReclamo(id: string, respuesta: string): Promise<void> {
  ok(
    await clienteConSesion()
      .from("reclamaciones")
      .update({ estado: "respondido", respuesta, respondido_en: new Date().toISOString() })
      .eq("id", id)
      .select("id"),
  );
}

// Equipo y catálogo ------------------------------------------------------------------------------

export async function perfiles(): Promise<Perfil[]> {
  return ok(await clienteConSesion().from("perfiles").select("*").order("creado_en", { ascending: false })) as Perfil[];
}

export async function cambiarRol(perfilId: string, rol: Rol): Promise<void> {
  ok(await clienteConSesion().rpc("cambiar_rol", { p_perfil: perfilId, p_rol: rol }));
}

export async function catalogoCompleto(): Promise<{ categorias: Categoria[]; productos: Producto[] }> {
  const sb = clienteConSesion();
  const [c, p] = await Promise.all([
    sb.from("categorias").select("*").order("orden"),
    sb.from("productos").select("*").order("nombre"),
  ]);
  return { categorias: ok(c) as Categoria[], productos: ok(p) as Producto[] };
}

export async function crearProducto(datos: { categoriaId: number; nombre: string; unidad: string }): Promise<void> {
  ok(
    await clienteConSesion()
      .from("productos")
      .insert({ categoria_id: datos.categoriaId, nombre: datos.nombre, unidad_defecto: datos.unidad })
      .select("id"),
  );
}

export async function activarProducto(id: string, activo: boolean): Promise<void> {
  ok(await clienteConSesion().from("productos").update({ activo }).eq("id", id).select("id"));
}

