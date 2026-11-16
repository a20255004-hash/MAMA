"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  paquetesPublicados,
  registrarSolicitud,
  solicitudSchema,
  type Modalidad,
  type Paquete,
} from "@illari/db";
import { Illa, MARCA, enlaceWhatsApp } from "@illari/ui";
import { MODALIDADES, RECEPCIONES } from "@/lib/contenido";
import { EVENTO_MODALIDAD } from "./Formas";

type Estado =
  | { fase: "inicial" }
  | { fase: "invalida"; errores: Record<string, string> }
  | { fase: "enviada"; nombre: string; enlace: string };

/**
 * Solicitud de compra. Al enviar: valida, guarda la solicitud en la base de
 * datos (cuando está conectada) y abre WhatsApp con el pedido ya redactado.
 */
export function Pedir() {
  const [estado, setEstado] = useState<Estado>({ fase: "inicial" });
  const [modalidad, setModalidad] = useState<Modalidad>("paquete");
  const [paquetes, setPaquetes] = useState<Paquete[]>([]);
  const errores = estado.fase === "invalida" ? estado.errores : {};

  useEffect(() => {
    const alElegir = (e: Event) => setModalidad((e as CustomEvent<Modalidad>).detail);
    window.addEventListener(EVENTO_MODALIDAD, alElegir);
    paquetesPublicados()
      .then(setPaquetes)
      .catch((e) => console.error("[paquetes]", e));
    return () => window.removeEventListener(EVENTO_MODALIDAD, alElegir);
  }, []);

  function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const texto = (campo: string) => String(f.get(campo) ?? "");
    if (texto("sitio")) return; // campo trampa: solo lo llenan los robots

    const revision = solicitudSchema.safeParse({
      nombre: texto("nombre"),
      celular: texto("celular"),
      modalidad: texto("modalidad"),
      recepcion: texto("recepcion"),
      paqueteId: texto("paqueteId") || null,
      mensaje: texto("mensaje"),
    });

    if (!revision.success) {
      const nuevos: Record<string, string> = {};
      for (const p of revision.error.issues) nuevos[String(p.path[0] ?? "formulario")] ??= p.message;
      setEstado({ fase: "invalida", errores: nuevos });
      const primero = Object.keys(nuevos)[0];
      if (primero) e.currentTarget.querySelector<HTMLElement>(`[name="${primero}"]`)?.focus();
      return;
    }

    const d = revision.data;
    const forma = MODALIDADES.find((m) => m.id === d.modalidad)?.nombre ?? d.modalidad;
    const recibe = RECEPCIONES.find((r) => r.id === d.recepcion)?.nombre ?? d.recepcion;
    const paquete = paquetes.find((p) => p.id === d.paqueteId)?.nombre;
    const lineas = [
      `Hola, soy ${d.nombre}. Quiero pedir una compra del ${MARCA.mercado}.`,
      `Forma de compra: ${forma}${paquete ? ` (${paquete})` : ""}`,
      `Entrega: ${recibe}`,
      d.mensaje && `Lo que necesito: ${d.mensaje}`,
    ].filter(Boolean);
    const enlace = enlaceWhatsApp(lineas.join("\n"));

    // Se guarda en segundo plano; WhatsApp se abre de inmediato para que el navegador no lo bloquee.
    void registrarSolicitud(d).then((r) => {
      if (!r.ok && r.motivo === "error") console.error("[solicitud]", r.detalle);
    });
    window.open(enlace, "_blank", "noopener");
    setEstado({ fase: "enviada", nombre: d.nombre.split(" ")[0] ?? d.nombre, enlace });
  }

  return (
    <section id="pedir" className="pedir" data-guia="pedir">
      <div className="pedir__intro">
        <h2 className="titulo-2">¿Qué te traemos?</h2>
        <p className="bajada">
          Déjanos tus datos y se abrirá WhatsApp con tu pedido ya escrito. Conversamos, te pasamos los precios y
          recién ahí decides. Sin compromiso.
        </p>
      </div>

      {estado.fase === "enviada" ? (
        <div className="pedir__listo" role="status">
          <Illa gesto="celebra" className="pedir__illa" />
          <div>
            <h3>¡Listo, {estado.nombre}! Ya casi.</h3>
            <p>Se abrió WhatsApp con tu pedido escrito. Dale a enviar y conversamos. Si no se abrió, ábrelo aquí.</p>
            <div className="pedir__acciones">
              <a className="boton boton--accion" href={estado.enlace} target="_blank" rel="noopener noreferrer">
                Abrir WhatsApp
              </a>
              <button className="boton boton--borde" type="button" onClick={() => setEstado({ fase: "inicial" })}>
                Hacer otro pedido
              </button>
            </div>
          </div>
        </div>
      ) : (
        <form className="formulario" onSubmit={enviar} noValidate>
          <div className="campo">
            <label htmlFor="nombre">¿Cómo te llamas?</label>
            <input
              id="nombre"
              name="nombre"
              autoComplete="name"
              aria-invalid={errores.nombre ? true : undefined}
              aria-describedby={errores.nombre ? "nombre-error" : undefined}
            />
            {errores.nombre && (
              <p id="nombre-error" className="campo__error">
                {errores.nombre}
              </p>
            )}
          </div>

          <div className="campo">
            <label htmlFor="celular">Tu celular</label>
            <input
              id="celular"
              name="celular"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="9 dígitos"
              aria-invalid={errores.celular ? true : undefined}
              aria-describedby={errores.celular ? "celular-error" : undefined}
            />
            {errores.celular && (
              <p id="celular-error" className="campo__error">
                {errores.celular}
              </p>
            )}
          </div>

          <fieldset className="campo campo--ancho">
            <legend>¿Cómo quieres comprar?</legend>
            <div className="opciones">
              {MODALIDADES.map((m) => (
                <label key={m.id} className="opcion">
                  <input
                    type="radio"
                    name="modalidad"
                    value={m.id}
                    checked={modalidad === m.id}
                    onChange={() => setModalidad(m.id)}
                  />
                  <span>{m.nombre}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {modalidad === "paquete" && paquetes.length > 0 && (
            <div className="campo campo--ancho">
              <label htmlFor="paqueteId">¿Qué paquete te provoca?</label>
              <select id="paqueteId" name="paqueteId" defaultValue="">
                <option value="">Todavía no lo decido</option>
                {paquetes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}

          <fieldset className="campo campo--ancho">
            <legend>¿Dónde te lo entregamos?</legend>
            <div className="opciones">
              {RECEPCIONES.map((r, i) => (
                <label key={r.id} className="opcion opcion--doble">
                  <input type="radio" name="recepcion" value={r.id} defaultChecked={i === 0} />
                  <span>
                    {r.nombre}
                    <small>{r.detalle}</small>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="campo campo--ancho">
            <label htmlFor="mensaje">
              Cuéntanos qué necesitas <span className="campo__opcional">(si quieres)</span>
            </label>
            <textarea
              id="mensaje"
              name="mensaje"
              rows={4}
              maxLength={1200}
              placeholder="Tu lista, para cuántos cocinas, tus caseros… lo que se te ocurra."
              aria-invalid={errores.mensaje ? true : undefined}
            />
            {errores.mensaje && <p className="campo__error">{errores.mensaje}</p>}
          </div>

          <div className="trampa" aria-hidden="true">
            <label htmlFor="sitio">No llenar</label>
            <input id="sitio" name="sitio" tabIndex={-1} autoComplete="off" />
          </div>

          <button className="boton boton--accion boton--grande campo--ancho" type="submit">
            Enviar mi pedido por WhatsApp
          </button>
        </form>
      )}
    </section>
  );
}
