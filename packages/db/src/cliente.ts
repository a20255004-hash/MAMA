import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Datos públicos del proyecto Supabase de Illari. La clave "publishable" está pensada para ir en
 * el navegador: lo que cada persona puede ver o hacer lo decide la seguridad por filas (RLS) de la
 * base de datos, no esta clave. La clave `service_role` jamás entra a este repositorio.
 * Se pueden cambiar con NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_KEY (por ejemplo, para otro proyecto).
 */
const URL_PUBLICA = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zpkluwhkjdpdyaoyiact.supabase.co";
const CLAVE_PUBLICABLE = process.env.NEXT_PUBLIC_SUPABASE_KEY || "sb_publishable_E75uG1GagVAj1RrPmqRJ7A_9Uq2sXzI";

let anonimo: SupabaseClient | undefined;
let conSesion: SupabaseClient | undefined;

/** Cliente de la página comercial: sin sesión, solo puede leer lo público y dejar solicitudes. */
export function clienteWeb(): SupabaseClient {
  anonimo ??= createClient(URL_PUBLICA, CLAVE_PUBLICABLE, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return anonimo;
}

/** Cliente de la app y del panel: guarda la sesión en el navegador y la comparte entre ambos. */
export function clienteConSesion(): SupabaseClient {
  conSesion ??= createClient(URL_PUBLICA, CLAVE_PUBLICABLE, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: "illari-auth" },
  });
  return conSesion;
}

/** Convierte un error de la base de datos en una frase que se pueda leer sin ser técnica. */
export function mensajeDeError(e: unknown): string {
  const texto =
    e instanceof Error
      ? e.message
      : typeof e === "object" && e && "message" in e
        ? String((e as { message: unknown }).message)
        : String(e);
  const t = texto.toLowerCase();
  if (t.includes("invalid login credentials")) return "El correo o la clave no coinciden. Revísalos e inténtalo otra vez.";
  if (t.includes("email not confirmed"))
    return "Todavía falta confirmar tu correo. Revisa tu bandeja (y el spam) y toca el enlace que te enviamos.";
  if (t.includes("user already registered")) return "Ese correo ya tiene una cuenta. Prueba entrando con tu clave.";
  if (t.includes("password should be at least")) return "La clave debe tener al menos 8 caracteres.";
  if (t.includes("email") && t.includes("invalid")) return "Ese correo no parece válido. Revísalo e inténtalo otra vez.";
  if (t.includes("signup") && t.includes("disabled")) return "Por ahora no se pueden crear cuentas nuevas.";
  if (t.includes("rate limit") || t.includes("too many"))
    return "Hiciste muchos intentos seguidos. Espera unos minutos y vuelve a probar.";
  if (t.includes("failed to fetch") || t.includes("networkerror") || t.includes("load failed"))
    return "No hay conexión con el servidor. Revisa tu internet e inténtalo de nuevo.";
  if (t.includes("row-level security") || t.includes("permission denied") || t.includes("42501"))
    return "No tienes permiso para hacer esto.";
  if (t.includes("duplicate key")) return "Eso ya existe.";
  return texto || "Ocurrió un problema. Inténtalo de nuevo.";
}

export class ErrorIllari extends Error {}

/** Lanza un error legible si la respuesta de la base de datos trae uno. */
export function ok<T>(r: { data: T; error: { message: string } | null }): T {
  if (r.error) throw new ErrorIllari(mensajeDeError(r.error));
  return r.data;
}
