import { clienteConSesion, ok } from "./cliente";
import type { Perfil, Sustitucion } from "./tipos";
import type { CaseroHogar, Entrega, EntregaConPedido, PaqueteFila, PreferenciaHogar } from "./tipos-extra";

/** Entregas, paquetes y lo que cada hogar prefiere. */

// Entregas -----------------------------------------------------------------------------------------

export async function entregas(): Promise<EntregaConPedido[]> {
  const filas = ok(
    await clienteConSesion()
      .from("entregas")
      .select(
        "*, pedidos(numero, estado, recepcion, notas_cliente, hogares(nombre, celular), direcciones(direccion, referencia, zona)), perfiles(nombre)",
      )
      .order("ventana"),
  );
  return filas as unknown as EntregaConPedido[];
}

export async function entregaDePedido(pedidoId: string): Promise<Entrega | null> {
  return ok(await clienteConSesion().from("entregas").select("*").eq("pedido_id", pedidoId).maybeSingle()) as Entrega | null;
}

export async function programarEntrega(pedidoId: string, repartidorId: string | null, ventana: string): Promise<void> {
  ok(
    await clienteConSesion()
      .from("entregas")
      .upsert({ pedido_id: pedidoId, repartidor_id: repartidorId, ventana }, { onConflict: "pedido_id" })
      .select("id"),
  );
}

export async function marcarEntrega(
  pedidoId: string,
  estado: "en_camino" | "entregada" | "fallida",
  nota: string,
): Promise<void> {
  ok(await clienteConSesion().rpc("marcar_entrega", { p_pedido: pedidoId, p_estado: estado, p_nota: nota }));
}

export async function repartidores(): Promise<Perfil[]> {
  return ok(
    await clienteConSesion().from("perfiles").select("*").eq("rol", "repartidor").eq("activo", true).order("nombre"),
  ) as Perfil[];
}

// Paquetes -------------------------------------------------------------------------------------------

export async function paquetesAdmin(): Promise<PaqueteFila[]> {
  return ok(await clienteConSesion().from("paquetes").select("*").order("orden").order("creado_en")) as PaqueteFila[];
}

export type PaqueteEditable = {
  id?: string;
  ciudadId: string;
  nombre: string;
  paraQuien: string;
  descripcion: string;
  contenido: string[];
  publicado: boolean;
  orden: number;
};

function slugDe(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

export async function guardarPaquete(p: PaqueteEditable): Promise<void> {
  const fila = {
    nombre: p.nombre,
    para_quien: p.paraQuien,
    descripcion: p.descripcion,
    contenido: p.contenido,
    publicado: p.publicado,
    orden: p.orden,
  };
  const sb = clienteConSesion();
  if (p.id) {
    ok(await sb.from("paquetes").update(fila).eq("id", p.id).select("id"));
  } else {
    const slug = `${slugDe(p.nombre) || "paquete"}-${Date.now().toString(36)}`;
    ok(await sb.from("paquetes").insert({ ...fila, ciudad_id: p.ciudadId, slug }).select("id"));
  }
}

export async function borrarPaquete(id: string): Promise<void> {
  ok(await clienteConSesion().from("paquetes").delete().eq("id", id).select("id"));
}

// Lo que cada hogar prefiere ---------------------------------------------------------------------------

export async function cuentaDeHogar(hogarId: string): Promise<{ caseros: CaseroHogar[]; preferencias: PreferenciaHogar[] }> {
  const sb = clienteConSesion();
  const [c, p] = await Promise.all([
    sb.from("caseros_hogar").select("*").eq("hogar_id", hogarId).order("creado_en"),
    sb.from("preferencias_hogar").select("*").eq("hogar_id", hogarId).order("creado_en"),
  ]);
  return { caseros: ok(c) as CaseroHogar[], preferencias: ok(p) as PreferenciaHogar[] };
}

export async function agregarCasero(
  hogarId: string,
  c: { rubro: string; nombre: string; puesto: string; nota: string },
): Promise<CaseroHogar> {
  return ok(await clienteConSesion().from("caseros_hogar").insert({ hogar_id: hogarId, ...c }).select("*").single()) as CaseroHogar;
}

export async function borrarCasero(id: string): Promise<void> {
  ok(await clienteConSesion().from("caseros_hogar").delete().eq("id", id).select("id"));
}

export async function agregarPreferencia(
  hogarId: string,
  p: { producto: string; preferencia: string; sustitucion: Sustitucion },
): Promise<PreferenciaHogar> {
  return ok(
    await clienteConSesion().from("preferencias_hogar").insert({ hogar_id: hogarId, ...p }).select("*").single(),
  ) as PreferenciaHogar;
}

export async function borrarPreferencia(id: string): Promise<void> {
  ok(await clienteConSesion().from("preferencias_hogar").delete().eq("id", id).select("id"));
}
