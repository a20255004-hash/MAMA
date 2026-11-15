"use client";

import { useActionState, useEffect, useState } from "react";
import type { Modalidad, Paquete } from "@casera/db";
import { Casera } from "@casera/ui";
import { enviarSolicitud, type EstadoSolicitud } from "@/app/acciones";
import { MODALIDADES, RECEPCIONES } from "@/lib/contenido";
import { EVENTO_MODALIDAD } from "./Modalidades";

const INICIAL: EstadoSolicitud = { fase: "inicial" };

export function Pedir({
  paquetes,
  whatsapp,
  app,
}: {
  paquetes: Paquete[];
  whatsapp: string | null;
  app: string | null;
}) {
  const [estado, enviar, enviando] = useActionState(enviarSolicitud, INICIAL);
  const [modalidad, setModalidad] = useState<Modalidad>("paquete");

  const valores = estado.fase === "invalida" || estado.fase === "fallo" ? estado.valores : null;
  const errores = estado.fase === "invalida" ? estado.errores : {};

  useEffect(() => {
    const alElegir = (e: Event) => setModalidad((e as CustomEvent<Modalidad>).detail);
    window.addEventListener(EVENTO_MODALIDAD, alElegir);
    return () => window.removeEventListener(EVENTO_MODALIDAD, alElegir);
  }, []);

  // Tras un error de validación, llevar el foco al primer campo con problema.
  useEffect(() => {
    if (estado.fase !== "invalida") return;
    const primero = Object.keys(estado.errores)[0];
    if (primero) document.querySelector<HTMLElement>(`[name="${primero}"]`)?.focus();
  }, [estado]);

  return (
    <section id="pedir" className="seccion pedir" data-guia="pedir">
      <div className="pedir__intro">
        <h2 className="titulo-2">Cuéntanos qué necesitas.</h2>
        <p className="bajada">
          Déjanos tus datos y te escribimos para coordinar tu compra y enviarte la cotización. Pedir no te
          compromete a nada.
        </p>
        {(whatsapp || app) && (
          <div className="pedir__atajos">
            {whatsapp && (
              <a className="boton boton--linea" href={whatsapp} target="_blank" rel="noopener noreferrer">
                Escribir por WhatsApp
              </a>
            )}
            {app && (
              <a className="boton boton--linea" href={app}>
                Abrir la app
              </a>
            )}
          </div>
        )}
      </div>

      {estado.fase === "enviada" ? (
        <div className="pedir__listo" role="status">
          <Casera gesto="saluda" className="pedir__casera" />
          <h3 className="titulo-3">Solicitud enviada{estado.nombre ? `, ${estado.nombre}` : ""}.</h3>
          <p>Te escribiremos al celular que nos dejaste para coordinar tu compra.</p>
        </div>
      ) : (
        <form className="formulario" action={enviar} noValidate>
          {estado.fase === "fallo" && (
            <p className="aviso" role="alert">
              {estado.motivo === "sin-base-de-datos"
                ? "Todavía no estamos recibiendo solicitudes por este formulario."
                : "No se pudo enviar tu solicitud. Revisa tu conexión e inténtalo de nuevo."}
              {whatsapp && " También puedes escribirnos por WhatsApp."}
            </p>
          )}

          <div className="campo">
            <label htmlFor="nombre">Tu nombre</label>
            <input
              id="nombre"
              name="nombre"
              autoComplete="name"
              required
              defaultValue={valores?.nombre}
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
            <label htmlFor="celular">Celular con WhatsApp</label>
            <input
              id="celular"
              name="celular"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="9 dígitos"
              required
              defaultValue={valores?.celular}
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
              <label htmlFor="paqueteId">Paquete</label>
              <select id="paqueteId" name="paqueteId" defaultValue={valores?.paqueteId ?? ""}>
                <option value="">Aún no lo decido</option>
                {paquetes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}

          <fieldset className="campo campo--ancho">
            <legend>¿Cómo quieres recibirla?</legend>
            <div className="opciones">
              {RECEPCIONES.map((r, i) => (
                <label key={r.id} className="opcion opcion--doble">
                  <input
                    type="radio"
                    name="recepcion"
                    value={r.id}
                    defaultChecked={valores ? valores.recepcion === r.id : i === 0}
                  />
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
              ¿Qué necesitas? <span className="campo__opcional">Opcional</span>
            </label>
            <textarea
              id="mensaje"
              name="mensaje"
              rows={4}
              maxLength={1200}
              placeholder="Tu lista, para cuántas personas es, tus caseros, lo que prefieras."
              defaultValue={valores?.mensaje}
              aria-invalid={errores.mensaje ? true : undefined}
            />
            {errores.mensaje && <p className="campo__error">{errores.mensaje}</p>}
          </div>

          <div className="trampa" aria-hidden="true">
            <label htmlFor="sitio">No llenar</label>
            <input id="sitio" name="sitio" tabIndex={-1} autoComplete="off" />
          </div>

          <button className="boton boton--buganvilla boton--grande campo--ancho" type="submit" disabled={enviando}>
            {enviando ? "Enviando…" : "Enviar mi solicitud"}
          </button>
        </form>
      )}
    </section>
  );
}
