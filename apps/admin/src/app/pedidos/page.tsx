"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  fechaCorta,
  mensajeDeError,
  NOMBRE_ESTADO,
  NOMBRE_MODALIDAD,
  pedidos as listarPedidos,
  type EstadoPedido,
  type PedidoConHogar,
} from "@illari/db";
import { Cabeza, Cargando, ErrorAviso, EtiquetaEstado, Vacio } from "@/componentes/Comunes";
import { SoloAdmin } from "@/componentes/Guardia";

const GRUPOS: { id: string; texto: string; estados: EstadoPedido[] }[] = [
  { id: "activos", texto: "En marcha", estados: ["solicitado", "cotizado", "aprobado", "en_compra", "liquidado", "en_entrega"] },
  { id: "cerrados", texto: "Terminados", estados: ["entregado", "cerrado"] },
  { id: "cancelados", texto: "Cancelados", estados: ["cancelado"] },
];

function Lista() {
  const [todos, setTodos] = useState<PedidoConHogar[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [grupo, setGrupo] = useState("activos");
  const [estado, setEstado] = useState<EstadoPedido | "">("");
  const [buscar, setBuscar] = useState("");

  useEffect(() => {
    listarPedidos()
      .then(setTodos)
      .catch((e) => setError(mensajeDeError(e)));
  }, []);

  const visibles = useMemo(() => {
    const g = GRUPOS.find((x) => x.id === grupo) ?? GRUPOS[0]!;
    const q = buscar.trim().toLowerCase();
    return (todos ?? []).filter(
      (p) =>
        g.estados.includes(p.estado) &&
        (!estado || p.estado === estado) &&
        (!q || `${p.numero} ${p.hogares?.nombre ?? ""} ${p.hogares?.celular ?? ""}`.toLowerCase().includes(q)),
    );
  }, [todos, grupo, estado, buscar]);

  const grupoActual = GRUPOS.find((x) => x.id === grupo) ?? GRUPOS[0]!;

  return (
    <div className="apilado apilado--grande">
      <Cabeza titulo="Pedidos" />
      <ErrorAviso mensaje={error} />

      <div className="apilado">
        <div className="chips" role="group" aria-label="Grupo de pedidos">
          {GRUPOS.map((g) => (
            <button key={g.id} type="button" className="chip" aria-pressed={grupo === g.id} onClick={() => { setGrupo(g.id); setEstado(""); }}>
              {g.texto}
            </button>
          ))}
        </div>
        <div className="fila">
          <div className="campo">
            <label htmlFor="buscar">Buscar por número, nombre o celular</label>
            <input id="buscar" value={buscar} onChange={(e) => setBuscar(e.target.value)} />
          </div>
          {grupoActual.estados.length > 1 && (
            <div className="campo">
              <label htmlFor="estado">Estado</label>
              <select id="estado" value={estado} onChange={(e) => setEstado(e.target.value as EstadoPedido | "")}>
                <option value="">Todos</option>
                {grupoActual.estados.map((e) => (
                  <option key={e} value={e}>
                    {NOMBRE_ESTADO[e]}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {!todos && !error && <Cargando texto="Cargando pedidos…" />}
      {todos && visibles.length === 0 && <Vacio titulo="No hay pedidos con ese filtro" />}
      {visibles.length > 0 && (
        <div className="panel">
          {visibles.map((p) => (
            <Link key={p.id} href={`/pedido/?id=${p.id}`} className="fila-pedido">
              <span className="fila-pedido__arriba">
                <strong>
                  #{p.numero} · {p.hogares?.nombre ?? "Sin nombre"}
                </strong>
                <EtiquetaEstado estado={p.estado} />
              </span>
              <span className="t-meta">
                {NOMBRE_MODALIDAD[p.modalidad]} · {p.pedido_items[0]?.count ?? 0} productos · {fechaCorta(p.creado_en)}
                {p.hogares?.celular ? ` · ${p.hogares.celular}` : ""}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Pagina() {
  return (
    <SoloAdmin>
      <Lista />
    </SoloAdmin>
  );
}
