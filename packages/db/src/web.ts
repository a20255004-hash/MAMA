import { z } from "zod";
import { clienteWeb } from "./cliente";
import type { Modalidad, Recepcion } from "./tipos";

/** Ciudad con la que opera el negocio hoy. Las demás se agregan como datos. */
export const CIUDAD_INICIAL = "tacna";

export const MODALIDADES = ["paquete", "lista", "delegada", "caseros"] as const satisfies readonly Modalidad[];
export const RECEPCIONES = ["domicilio", "recojo"] as const satisfies readonly Recepcion[];

export type Paquete = {
  id: string;
  slug: string;
  nombre: string;
  paraQuien: string;
  descripcion: string;
  contenido: string[];
};

/** Lo que el formulario de la web debe cumplir antes de guardarse. */
export const solicitudSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, "Dinos cómo te llamas.")
    .max(80, "Ese nombre es muy largo; ponlo más cortito."),
  celular: z
    .string()
    .transform((v) => v.replace(/\D/g, "").replace(/^51(?=9\d{8}$)/, ""))
    .pipe(z.string().regex(/^9\d{8}$/, "Revisa tu celular: son 9 dígitos y empieza con 9.")),
  modalidad: z.enum(MODALIDADES, { message: "Cuéntanos cómo quieres comprar." }),
  recepcion: z.enum(RECEPCIONES, { message: "Dinos dónde te lo entregamos." }),
  paqueteId: z.string().uuid().nullable().optional(),
  mensaje: z.string().trim().max(1200, "Tu mensaje es muy largo; el resto nos lo cuentas por WhatsApp.").default(""),
});
export type SolicitudNueva = z.infer<typeof solicitudSchema>;

/** La conexión con la base de datos siempre está lista; se mantiene por compatibilidad. */
export function baseDeDatosLista(): boolean {
  return true;
}

export async function idDeCiudad(slug = CIUDAD_INICIAL): Promise<string | null> {
  const { data, error } = await clienteWeb().from("ciudades").select("id").eq("slug", slug).maybeSingle();
  if (error) throw new Error(`No se pudo leer la ciudad: ${error.message}`);
  return (data?.id as string | undefined) ?? null;
}

/** Paquetes visibles en la web. Lista vacía si no hay publicados. */
export async function paquetesPublicados(ciudad = CIUDAD_INICIAL): Promise<Paquete[]> {
  const ciudadId = await idDeCiudad(ciudad);
  if (!ciudadId) return [];
  const { data, error } = await clienteWeb()
    .from("paquetes")
    .select("id, slug, nombre, para_quien, descripcion, contenido")
    .eq("ciudad_id", ciudadId)
    .eq("publicado", true)
    .order("orden");
  if (error) throw new Error(`No se pudieron leer los paquetes: ${error.message}`);
  return (data ?? []).map((p) => ({
    id: p.id as string,
    slug: p.slug as string,
    nombre: p.nombre as string,
    paraQuien: p.para_quien as string,
    descripcion: p.descripcion as string,
    contenido: (p.contenido as string[] | null) ?? [],
  }));
}

export type ResultadoSolicitud =
  | { ok: true }
  | { ok: false; motivo: "sin-base-de-datos" | "error"; detalle?: string };

/** Guarda una solicitud llegada desde la web. La fila nace como 'nueva'. */
export async function registrarSolicitud(
  datos: SolicitudNueva,
  ciudad = CIUDAD_INICIAL,
): Promise<ResultadoSolicitud> {
  try {
    const ciudadId = await idDeCiudad(ciudad);
    if (!ciudadId) return { ok: false, motivo: "error", detalle: "Ciudad no encontrada." };
    const { error } = await clienteWeb().from("solicitudes").insert({
      ciudad_id: ciudadId,
      nombre: datos.nombre,
      celular: datos.celular,
      modalidad: datos.modalidad,
      recepcion: datos.recepcion,
      paquete_id: datos.modalidad === "paquete" ? (datos.paqueteId ?? null) : null,
      mensaje: datos.mensaje,
    });
    if (error) return { ok: false, motivo: "error", detalle: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, motivo: "error", detalle: e instanceof Error ? e.message : String(e) };
  }
}

/** Libro de Reclamaciones virtual: lo que debe cumplir una hoja antes de guardarse. */
export const reclamoSchema = z.object({
  tipo: z.enum(["reclamo", "queja"], { message: "Elige si es un reclamo o una queja." }),
  nombre: z.string().trim().min(3, "Escribe tu nombre completo.").max(120),
  documentoTipo: z.enum(["DNI", "CE", "Pasaporte", "RUC"], { message: "Elige el tipo de documento." }),
  documentoNumero: z.string().trim().regex(/^[A-Za-z0-9]{6,15}$/, "Revisa el número de tu documento."),
  celular: z
    .string()
    .transform((v) => v.replace(/\D/g, "").replace(/^51(?=9\d{8}$)/, ""))
    .pipe(z.string().regex(/^9\d{8}$/, "Revisa tu celular: son 9 dígitos y empieza con 9.")),
  correo: z.string().trim().email("Revisa tu correo.").max(120),
  domicilio: z.string().trim().min(5, "Escribe tu domicilio.").max(200),
  bienTipo: z.enum(["producto", "servicio"], { message: "Indica si se trata de un producto o un servicio." }),
  monto: z.number().min(0).max(100000).nullable().optional(),
  descripcionBien: z.string().trim().min(3, "Describe brevemente el producto o servicio.").max(300),
  detalle: z.string().trim().min(10, "Cuéntanos con un poco más de detalle qué pasó.").max(2000),
  pedidoConsumidor: z.string().trim().max(600).default(""),
});
export type ReclamoNuevo = z.infer<typeof reclamoSchema>;

export async function registrarReclamo(
  datos: ReclamoNuevo,
  ciudad = CIUDAD_INICIAL,
): Promise<{ ok: true } | { ok: false; detalle: string }> {
  try {
    const ciudadId = await idDeCiudad(ciudad);
    if (!ciudadId) return { ok: false, detalle: "Ciudad no encontrada." };
    const { error } = await clienteWeb().from("reclamaciones").insert({
      ciudad_id: ciudadId,
      tipo: datos.tipo,
      consumidor_nombre: datos.nombre,
      documento_tipo: datos.documentoTipo,
      documento_numero: datos.documentoNumero,
      celular: datos.celular,
      correo: datos.correo,
      domicilio: datos.domicilio,
      bien_tipo: datos.bienTipo,
      monto_reclamado: datos.monto ?? null,
      descripcion_bien: datos.descripcionBien,
      detalle: datos.detalle,
      pedido_consumidor: datos.pedidoConsumidor,
    });
    if (error) return { ok: false, detalle: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, detalle: e instanceof Error ? e.message : String(e) };
  }
}
