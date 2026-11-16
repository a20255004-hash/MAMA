import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

/** Ciudad con la que opera el negocio hoy. Las demás se agregan como datos. */
export const CIUDAD_INICIAL = "tacna";

export const MODALIDADES = ["paquete", "lista", "delegada", "caseros"] as const;
export type Modalidad = (typeof MODALIDADES)[number];

export const RECEPCIONES = ["domicilio", "recojo"] as const;
export type Recepcion = (typeof RECEPCIONES)[number];

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

let cliente: SupabaseClient | null | undefined;

/** Devuelve el cliente de base de datos, o null si aún no está configurada. */
function db(): SupabaseClient | null {
  if (cliente !== undefined) return cliente;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_KEY;
  cliente = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
  return cliente;
}

export function baseDeDatosLista(): boolean {
  return db() !== null;
}

async function idDeCiudad(sb: SupabaseClient, slug: string): Promise<string | null> {
  const { data, error } = await sb.from("ciudades").select("id").eq("slug", slug).maybeSingle();
  if (error) throw new Error(`No se pudo leer la ciudad: ${error.message}`);
  return (data?.id as string | undefined) ?? null;
}

/** Paquetes visibles en la web. Lista vacía si no hay base de datos o no hay publicados. */
export async function paquetesPublicados(ciudad = CIUDAD_INICIAL): Promise<Paquete[]> {
  const sb = db();
  if (!sb) return [];
  const ciudadId = await idDeCiudad(sb, ciudad);
  if (!ciudadId) return [];
  const { data, error } = await sb
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
  const sb = db();
  if (!sb) return { ok: false, motivo: "sin-base-de-datos" };
  try {
    const ciudadId = await idDeCiudad(sb, ciudad);
    if (!ciudadId) return { ok: false, motivo: "error", detalle: "Ciudad no encontrada." };
    const { error } = await sb.from("solicitudes").insert({
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
