import type { Session } from "@supabase/supabase-js";
import { clienteConSesion, ok } from "./cliente";
import type { Perfil } from "./tipos";

export type { Session };

/** Crea la cuenta. Si el proyecto exige confirmar el correo, `sesionIniciada` es false. */
export async function registrarCuenta(datos: {
  email: string;
  clave: string;
  nombre: string;
  celular: string;
  volverA?: string;
}): Promise<{ sesionIniciada: boolean }> {
  const sb = clienteConSesion();
  const { data, error } = await sb.auth.signUp({
    email: datos.email.trim(),
    password: datos.clave,
    options: {
      data: { nombre: datos.nombre.trim(), celular: datos.celular },
      emailRedirectTo: datos.volverA,
    },
  });
  if (error) throw new Error(error.message);
  // Con el correo ya registrado, Supabase responde sin error y sin identidades: se avisa igual.
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    throw new Error("User already registered");
  }
  return { sesionIniciada: data.session !== null };
}

export async function entrar(email: string, clave: string): Promise<void> {
  const { error } = await clienteConSesion().auth.signInWithPassword({ email: email.trim(), password: clave });
  if (error) throw new Error(error.message);
}

export async function salir(): Promise<void> {
  await clienteConSesion().auth.signOut();
}

export async function sesionActual(): Promise<Session | null> {
  const { data } = await clienteConSesion().auth.getSession();
  return data.session;
}

/** Avisa cada vez que alguien entra o sale. Devuelve la función para dejar de escuchar. */
export function alCambiarSesion(f: (s: Session | null) => void): () => void {
  const { data } = clienteConSesion().auth.onAuthStateChange((_evento, s) => f(s));
  return () => data.subscription.unsubscribe();
}

export async function miPerfil(): Promise<Perfil | null> {
  const sb = clienteConSesion();
  const { data: u } = await sb.auth.getUser();
  if (!u.user) return null;
  const fila = ok(await sb.from("perfiles").select("*").eq("id", u.user.id).maybeSingle());
  return (fila as Perfil | null) ?? null;
}

export async function actualizarPerfil(id: string, datos: { nombre: string; celular: string | null }): Promise<void> {
  ok(await clienteConSesion().from("perfiles").update(datos).eq("id", id).select("id"));
}

export async function pedirRecuperacion(email: string, volverA: string): Promise<void> {
  const { error } = await clienteConSesion().auth.resetPasswordForEmail(email.trim(), { redirectTo: volverA });
  if (error) throw new Error(error.message);
}

export async function cambiarClave(clave: string): Promise<void> {
  const { error } = await clienteConSesion().auth.updateUser({ password: clave });
  if (error) throw new Error(error.message);
}
