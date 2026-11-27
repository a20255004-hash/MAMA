import { clienteConSesion, ok } from "./cliente";
import type {
  Categoria,
  Cotizacion,
  Direccion,
  Hogar,
  Item,
  Modalidad,
  Pedido,
  Perfil,
  Producto,
  Recepcion,
  Sustitucion,
} from "./tipos";

/** Todo lo que la app de clientes necesita. Cada persona solo ve lo suyo: lo decide la base de datos. */

/** El hogar de la persona; si todavía no existe, se crea con los datos de su perfil. */
export async function asegurarHogar(perfil: Perfil): Promise<Hogar> {
  const sb = clienteConSesion();
  const existente = ok(await sb.from("hogares").select("*").eq("perfil_id", perfil.id).maybeSingle());
  if (existente) return existente as Hogar;
  const nuevo = ok(
    await sb
      .from("hogares")
      .insert({
        ciudad_id: perfil.ciudad_id,
        perfil_id: perfil.id,
        nombre: perfil.nombre.trim().length >= 2 ? perfil.nombre.trim() : "Mi casa",
        celular: perfil.celular,
      })
      .select("*")
      .single(),
  );
  return nuevo as Hogar;
}

export async function guardarHogar(
  id: string,
  datos: { nombre: string; celular: string | null; personas: number | null; notas: string },
): Promise<void> {
  ok(await clienteConSesion().from("hogares").update(datos).eq("id", id).select("id"));
}

export async function direccionesDe(hogarId: string): Promise<Direccion[]> {
  const filas = ok(await clienteConSesion().from("direcciones").select("*").eq("hogar_id", hogarId).order("creado_en"));
  return filas as Direccion[];
}

export async function agregarDireccion(
  hogarId: string,
  d: { etiqueta: string; direccion: string; referencia: string; zona: string },
): Promise<Direccion> {
  const fila = ok(await clienteConSesion().from("direcciones").insert({ hogar_id: hogarId, ...d }).select("*").single());
  return fila as Direccion;
}

export async function borrarDireccion(id: string): Promise<void> {
  ok(await clienteConSesion().from("direcciones").delete().eq("id", id).select("id"));
}

export async function catalogo(): Promise<{ categorias: Categoria[]; productos: Producto[] }> {
  const sb = clienteConSesion();
  const [c, p] = await Promise.all([
    sb.from("categorias").select("*").order("orden"),
    sb.from("productos").select("*").eq("activo", true).order("nombre"),
  ]);
  return { categorias: ok(c) as Categoria[], productos: ok(p) as Producto[] };
}

export type ItemNuevo = {
  productoId?: string | null;
  descripcion: string;
  cantidad: number;
  unidad: string;
  preferencia?: string;
  casero?: string;
  sustitucion: Sustitucion;
};

export async function crearPedido(datos: {
  ciudadId: string;
  hogarId: string;
  modalidad: Modalidad;
  recepcion: Recepcion;
  direccionId: string | null;
  fechaDeseada: string | null;
  notas: string;
  items: ItemNuevo[];
}): Promise<Pedido> {
  const sb = clienteConSesion();
  const pedido = ok(
    await sb
      .from("pedidos")
      .insert({
        ciudad_id: datos.ciudadId,
        hogar_id: datos.hogarId,
        modalidad: datos.modalidad,
        recepcion: datos.recepcion,
        direccion_id: datos.recepcion === "domicilio" ? datos.direccionId : null,
        fecha_deseada: datos.fechaDeseada || null,
        notas_cliente: datos.notas,
      })
      .select("*")
      .single(),
  ) as Pedido;

  if (datos.items.length > 0) {
    const { error } = await sb.from("pedido_items").insert(
      datos.items.map((it, i) => ({
        pedido_id: pedido.id,
        producto_id: it.productoId ?? null,
        descripcion: it.descripcion,
        cantidad: it.cantidad,
        unidad: it.unidad,
        preferencia: it.preferencia ?? "",
        casero: it.casero ?? "",
        sustitucion: it.sustitucion,
        orden: i,
      })),
    );
    if (error) {
      // Si no se pudieron guardar los productos, el pedido vacío se cancela para no dejar basura.
      await sb.rpc("cancelar_pedido", { p_pedido: pedido.id });
      ok({ data: null, error });
    }
  }
  return pedido;
}

export type PedidoResumen = Pedido & { pedido_items: { count: number }[] };

export async function misPedidos(): Promise<PedidoResumen[]> {
  const filas = ok(
    await clienteConSesion().from("pedidos").select("*, pedido_items(count)").order("creado_en", { ascending: false }),
  );
  return filas as PedidoResumen[];
}

export type DetallePedido = {
  pedido: Pedido;
  items: Item[];
  cotizacion: Cotizacion | null;
  direccion: Direccion | null;
};

export async function detalleDePedido(id: string): Promise<DetallePedido | null> {
  const sb = clienteConSesion();
  const pedido = ok(await sb.from("pedidos").select("*").eq("id", id).maybeSingle()) as Pedido | null;
  if (!pedido) return null;
  const [items, cots, dir] = await Promise.all([
    sb.from("pedido_items").select("*").eq("pedido_id", id).order("orden"),
    sb.from("cotizaciones").select("*").eq("pedido_id", id).order("version", { ascending: false }),
    pedido.direccion_id ? sb.from("direcciones").select("*").eq("id", pedido.direccion_id).maybeSingle() : Promise.resolve({ data: null, error: null }),
  ]);
  const cotizaciones = ok(cots) as Cotizacion[];
  return {
    pedido,
    items: ok(items) as Item[],
    cotizacion: cotizaciones.find((c) => c.estado === "enviada" || c.estado === "aprobada") ?? null,
    direccion: ok(dir) as Direccion | null,
  };
}

export async function aprobarCotizacion(pedidoId: string): Promise<void> {
  ok(await clienteConSesion().rpc("aprobar_cotizacion", { p_pedido: pedidoId }));
}

export async function cancelarPedido(pedidoId: string): Promise<void> {
  ok(await clienteConSesion().rpc("cancelar_pedido", { p_pedido: pedidoId }));
}
