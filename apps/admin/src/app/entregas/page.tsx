"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  entregas as listarEntregas,
  fechaHora,
  marcarEntrega,
  mensajeDeError,
  NOMBRE_ENTREGA,
  type EntregaConPedido,
} from "@illari/db";
import { Cabeza, Cargando, ErrorAviso, Vacio } from "@/componentes/Comunes";
import { useSesion } from "@/componentes/Sesion";

function Tarjeta({ e, onCambio }: { e: EntregaConPedido; onCambio: () => Promise<void> }) {
  const [nota, setNota] = useState(e.nota);
  const [error, setError] = useState<string | null>(null);
  const [ocupada, setOcupada] = useState(false);
  const p = e.pedidos;
  const dir = p?.direcciones;
  const direccion = dir ? `${dir.direccion}${dir.zona ? `, ${dir.zona}` : ""}, Tacna` : null;
  const mapa = direccion ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}` : null;
  const terminada = e.estado === "entregada";
  const listaParaSalir = p?.estado === "liquidado" || p?.estado === "en_entrega";

  async function marcar(estado: "en_camino" | "entregada" | "fallida") {
    setError(null);
    if (estado === "fallida" && nota.trim().length < 3) return setError("Cuéntanos brevemente por qué no se pudo entregar.");
    setOcupada(true);
    try {
      await marcarEntrega(e.pedido_id, estado, nota.trim());
      await onCambio();
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setOcupada(false);
    }
  }

  return (
    <li className="panel apilado">
      <div className="fila-flex fila-flex--entre">
        <h2 className="t-seccion">
          #{p?.numero} · {p?.hogares?.nombre ?? "Sin nombre"}
        </h2>
        <span className="etiqueta etiqueta--en_entrega">{NOMBRE_ENTREGA[e.estado]}</span>
      </div>
      <dl className="datos">
        <dt>Horario</dt>
        <dd>{e.ventana || "Sin horario"}</dd>
        <dt>Dirección</dt>
        <dd>
          {dir ? (
            <>
              {dir.direccion}
              {dir.referencia ? ` (${dir.referencia})` : ""}
              {dir.zona ? ` · ${dir.zona}` : ""}
            </>
          ) : (
            "Sin dirección registrada"
          )}
        </dd>
        {e.perfiles?.nombre && (
          <>
            <dt>Entrega</dt>
            <dd>{e.perfiles.nombre}</dd>
          </>
        )}
        {p?.notas_cliente && (
          <>
            <dt>Notas</dt>
            <dd style={{ whiteSpace: "pre-wrap" }}>{p.notas_cliente}</dd>
          </>
        )}
        {e.entregada_en && (
          <>
            <dt>Entregada</dt>
            <dd>{fechaHora(e.entregada_en)}</dd>
          </>
        )}
      </dl>
      <div className="fila-flex">
        {p?.hogares?.celular && (
          <>
            <a className="boton boton--suave boton--chico" href={`tel:+51${p.hogares.celular}`}>
              Llamar
            </a>
            <a className="boton boton--suave boton--chico" href={`https://wa.me/51${p.hogares.celular}`} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
          </>
        )}
        {mapa && (
          <a className="boton boton--suave boton--chico" href={mapa} target="_blank" rel="noopener noreferrer">
            Ver en el mapa
          </a>
        )}
        <Link className="enlace" href={`/pedido/?id=${e.pedido_id}`}>
          Ver pedido
        </Link>
      </div>
      {!terminada && listaParaSalir && (
        <div className="apilado apilado--chico">
          <div className="campo">
            <label htmlFor={`n-${e.id}`}>Nota (opcional)</label>
            <input id={`n-${e.id}`} value={nota} maxLength={300} onChange={(ev) => setNota(ev.target.value)} placeholder="Ej.: se dejó con la vecina" />
          </div>
          <ErrorAviso mensaje={error} />
          <div className="compra-acciones">
            {p?.estado === "liquidado" && (
              <button type="button" className="boton boton--suave" disabled={ocupada} onClick={() => void marcar("en_camino")}>
                Salí a entregar
              </button>
            )}
            <button type="button" className="boton boton--accion" disabled={ocupada} onClick={() => void marcar("entregada")}>
              Entregado
            </button>
            <button type="button" className="boton boton--borde" disabled={ocupada} onClick={() => void marcar("fallida")}>
              No se pudo
            </button>
          </div>
        </div>
      )}
      {!terminada && !listaParaSalir && <p className="t-meta">Este pedido todavía se está comprando; podrás entregarlo cuando cierren las cuentas.</p>}
    </li>
  );
}

export default function Entregas() {
  const { perfil } = useSesion();
  const [lista, setLista] = useState<EntregaConPedido[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      const todas = await listarEntregas();
      setLista(perfil.rol === "repartidor" ? todas.filter((e) => e.repartidor_id === perfil.id) : todas);
    } catch (e) {
      setError(mensajeDeError(e));
    }
  }, [perfil.id, perfil.rol]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  if (!lista) return error ? <ErrorAviso mensaje={error} /> : <Cargando texto="Buscando entregas…" />;

  const pendientes = lista.filter((e) => e.estado !== "entregada");
  const hechas = lista.filter((e) => e.estado === "entregada");

  return (
    <div className="apilado apilado--grande">
      <Cabeza titulo="Entregas" />
      <ErrorAviso mensaje={error} />
      {lista.length === 0 && (
        <Vacio titulo={perfil.rol === "repartidor" ? "No tienes entregas asignadas" : "No hay entregas programadas"}>
          <p>
            {perfil.rol === "repartidor"
              ? "Cuando te asignen una, aparecerá aquí."
              : "Programa la entrega desde el pedido, cuando ya se haya comprado."}
          </p>
        </Vacio>
      )}
      {pendientes.length > 0 && (
        <section className="apilado" aria-labelledby="h-pend">
          <h2 id="h-pend" className="t-titulo">
            Por entregar ({pendientes.length})
          </h2>
          <ul className="apilado">
            {pendientes.map((e) => (
              <Tarjeta key={e.id} e={e} onCambio={cargar} />
            ))}
          </ul>
        </section>
      )}
      {hechas.length > 0 && (
        <section className="apilado" aria-labelledby="h-hechas">
          <h2 id="h-hechas" className="t-titulo">
            Entregadas
          </h2>
          <ul className="apilado">
            {hechas.slice(0, 20).map((e) => (
              <Tarjeta key={e.id} e={e} onCambio={cargar} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
