"use client";

import { useCallback, useEffect, useState } from "react";
import {
  enlaceCorreo,
  fechaCorta,
  fechaHora,
  marcarReclamo,
  mensajeDeError,
  reclamaciones as listarReclamos,
  responderReclamo,
  type Reclamacion,
} from "@illari/db";
import { Cabeza, Cargando, ErrorAviso, Vacio } from "@/componentes/Comunes";
import { SoloAdmin } from "@/componentes/Guardia";

function diasHasta(fecha: string): number {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return Math.round((new Date(`${fecha}T00:00:00`).getTime() - hoy.getTime()) / 86_400_000);
}

function Tarjeta({ r, onCambio }: { r: Reclamacion; onCambio: () => Promise<void> }) {
  const [texto, setTexto] = useState(r.respuesta ?? "");
  const [abierta, setAbierta] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ocupada, setOcupada] = useState(false);
  const dias = diasHasta(r.fecha_limite);

  async function correr(f: () => Promise<void>) {
    setOcupada(true);
    setError(null);
    try {
      await f();
      await onCambio();
      setAbierta(false);
    } catch (e) {
      setError(mensajeDeError(e));
    } finally {
      setOcupada(false);
    }
  }

  return (
    <li className="panel apilado">
      <div className="fila-flex fila-flex--entre">
        <h2 className="t-seccion">
          Hoja #{r.numero} · {r.tipo === "reclamo" ? "Reclamo" : "Queja"}
        </h2>
        <span className={`etiqueta ${r.estado === "respondido" ? "etiqueta--entregado" : dias <= 3 ? "" : "etiqueta--cotizado"}`} style={r.estado !== "respondido" && dias <= 3 ? { background: "var(--error-fondo)", color: "var(--error)" } : undefined}>
          {r.estado === "respondido" ? "Respondido" : r.estado === "en_atencion" ? "En atención" : "Recibido"}
        </span>
      </div>
      <dl className="datos">
        <dt>Consumidor</dt>
        <dd>
          {r.consumidor_nombre} · {r.documento_tipo} {r.documento_numero}
        </dd>
        <dt>Contacto</dt>
        <dd>
          {r.celular} · {r.correo}
        </dd>
        <dt>Domicilio</dt>
        <dd>{r.domicilio}</dd>
        <dt>Bien contratado</dt>
        <dd>
          {r.bien_tipo === "producto" ? "Producto" : "Servicio"}: {r.descripcion_bien}
          {r.monto_reclamado !== null ? ` · S/ ${Number(r.monto_reclamado).toFixed(2)}` : ""}
        </dd>
        <dt>Recibido</dt>
        <dd>{fechaHora(r.creado_en)}</dd>
        <dt>Responder antes del</dt>
        <dd>
          {fechaCorta(r.fecha_limite)}
          {r.estado !== "respondido" && (
            <span className="t-meta">{dias < 0 ? ` (venció hace ${-dias} días)` : dias === 0 ? " (vence hoy)" : ` (en ${dias} días)`}</span>
          )}
        </dd>
      </dl>
      <div>
        <p className="t-meta">Detalle</p>
        <p style={{ whiteSpace: "pre-wrap" }}>{r.detalle}</p>
      </div>
      {r.pedido_consumidor && (
        <div>
          <p className="t-meta">Lo que pide el consumidor</p>
          <p style={{ whiteSpace: "pre-wrap" }}>{r.pedido_consumidor}</p>
        </div>
      )}
      {r.respuesta && (
        <div className="superficie superficie--fresca">
          <p className="t-meta">Respuesta ({r.respondido_en ? fechaHora(r.respondido_en) : ""})</p>
          <p style={{ whiteSpace: "pre-wrap" }}>{r.respuesta}</p>
        </div>
      )}
      <ErrorAviso mensaje={error} />
      {r.estado !== "respondido" && (
        <div className="apilado apilado--chico">
          {abierta ? (
            <>
              <div className="campo">
                <label htmlFor={`resp-${r.id}`}>Tu respuesta al consumidor</label>
                <textarea id={`resp-${r.id}`} value={texto} maxLength={3000} onChange={(e) => setTexto(e.target.value)} style={{ minHeight: "9rem" }} />
                <span className="campo__ayuda">
                  Al guardarla queda registrada. Envíasela al consumidor por su correo o por WhatsApp: esta pantalla no la envía sola.
                </span>
              </div>
              <div className="fila-flex">
                <button type="button" className="boton boton--accion boton--chico" disabled={ocupada || texto.trim().length < 10} onClick={() => void correr(() => responderReclamo(r.id, texto.trim()))}>
                  Guardar respuesta
                </button>
                <button type="button" className="enlace" onClick={() => setAbierta(false)}>
                  Cancelar
                </button>
              </div>
            </>
          ) : (
            <div className="fila-flex">
              <button type="button" className="boton boton--accion boton--chico" onClick={() => setAbierta(true)}>
                Responder
              </button>
              {r.estado === "recibido" && (
                <button type="button" className="boton boton--suave boton--chico" disabled={ocupada} onClick={() => void correr(() => marcarReclamo(r.id, "en_atencion"))}>
                  Marcar en atención
                </button>
              )}
              <a className="boton boton--borde boton--chico" href={enlaceCorreo(r.correo, `Respuesta a tu hoja de reclamación #${r.numero}`)}>
                Escribir al correo
              </a>
              <a className="boton boton--borde boton--chico" href={`https://wa.me/51${r.celular}`} target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            </div>
          )}
        </div>
      )}
    </li>
  );
}

function Reclamos() {
  const [lista, setLista] = useState<Reclamacion[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      setLista(await listarReclamos());
    } catch (e) {
      setError(mensajeDeError(e));
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  if (!lista) return error ? <ErrorAviso mensaje={error} /> : <Cargando texto="Abriendo el libro…" />;

  const abiertos = lista.filter((r) => r.estado !== "respondido");
  const respondidos = lista.filter((r) => r.estado === "respondido");

  return (
    <div className="apilado apilado--grande">
      <Cabeza titulo="Libro de Reclamaciones" />
      <p className="aviso">
        El plazo para responder se calcula en 15 días hábiles desde que llega la hoja (de lunes a viernes, sin descontar feriados).
        Confirma con tu asesor legal o con INDECOPI cómo aplicarlo a tu negocio.
      </p>
      <ErrorAviso mensaje={error} />

      {lista.length === 0 && (
        <Vacio titulo="Aún no hay hojas de reclamación">
          <p>Cuando alguien llene el libro desde la página, aparecerá aquí.</p>
        </Vacio>
      )}

      {abiertos.length > 0 && (
        <section className="apilado" aria-labelledby="h-ab">
          <h2 id="h-ab" className="t-titulo">
            Por responder ({abiertos.length})
          </h2>
          <ul className="apilado">
            {abiertos.map((r) => (
              <Tarjeta key={r.id} r={r} onCambio={cargar} />
            ))}
          </ul>
        </section>
      )}

      {respondidos.length > 0 && (
        <section className="apilado" aria-labelledby="h-re">
          <h2 id="h-re" className="t-titulo">
            Respondidos
          </h2>
          <ul className="apilado">
            {respondidos.map((r) => (
              <Tarjeta key={r.id} r={r} onCambio={cargar} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

export default function Pagina() {
  return (
    <SoloAdmin>
      <Reclamos />
    </SoloAdmin>
  );
}
