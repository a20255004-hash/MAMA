"use server";

import { registrarSolicitud, solicitudSchema } from "@casera/db";

export type EstadoSolicitud =
  | { fase: "inicial" }
  | { fase: "enviada"; nombre: string }
  | { fase: "invalida"; errores: Record<string, string>; valores: Record<string, string> }
  | { fase: "fallo"; motivo: "sin-base-de-datos" | "error"; valores: Record<string, string> };

export async function enviarSolicitud(
  _previo: EstadoSolicitud,
  formulario: FormData,
): Promise<EstadoSolicitud> {
  const texto = (campo: string) => String(formulario.get(campo) ?? "");
  const valores = {
    nombre: texto("nombre"),
    celular: texto("celular"),
    modalidad: texto("modalidad"),
    recepcion: texto("recepcion"),
    paqueteId: texto("paqueteId"),
    mensaje: texto("mensaje"),
  };

  // Campo trampa: las personas no lo ven. Si llega lleno, es un robot y no se guarda nada.
  if (texto("sitio")) return { fase: "enviada", nombre: valores.nombre };

  const revision = solicitudSchema.safeParse({
    ...valores,
    paqueteId: valores.paqueteId || null,
  });
  if (!revision.success) {
    const errores: Record<string, string> = {};
    for (const problema of revision.error.issues) {
      const campo = String(problema.path[0] ?? "formulario");
      errores[campo] ??= problema.message;
    }
    return { fase: "invalida", errores, valores };
  }

  const resultado = await registrarSolicitud(revision.data);
  if (!resultado.ok) {
    if (resultado.motivo === "error") console.error("[solicitud]", resultado.detalle);
    return { fase: "fallo", motivo: resultado.motivo, valores };
  }
  return { fase: "enviada", nombre: revision.data.nombre.split(" ")[0] ?? revision.data.nombre };
}
