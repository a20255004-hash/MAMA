"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  convertirSolicitud,
  fechaCorta,
  fechaHora,
  marcarSolicitud,
  mensajeDeError,
  NOMBRE_MODALIDAD,
  NOMBRE_RECEPCION,
  pedidos as listarPedidos,
  reclamaciones as listarReclamos,
  solicitudes as listarSolicitudes,
  type PedidoConHogar,
  type Reclamacion,
  type Solicitud,
} from "@illari/db";
import { Cabeza, Cargando, ErrorAviso, EtiquetaEstado, Vacio, enlaceCliente } from "@/componentes/Comunes";
import { SoloAdmin } from "@/componentes/Guardia";
import { useSesion } from "@/componentes/Sesion";

function diasHasta(fecha: string): number {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return Math.round((new Date(`${fecha}T00:00:00`).getTime() - hoy.getTime()) / 86_400_000);
}

function Hoy() {
  const router = useRouter();
  const [sol, setSol] = useState<Solicitud[] | null>(null);
  const [peds, setPeds] = useState<PedidoConHogar[] | null>(null);
  const [recl, setRecl] = useState<Reclamacion[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ocupada, setOcupada] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      const [s, p, r] = await Promise.all([listarSolicitudes("nueva"), listarPedidos(), listarReclamos()]);
      setSol(s);
      setPeds(p);
      setRecl(r);
    } catch (e) {
      setError(mensajeDeError(e));
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  async function convertir(s: Solicitud) {
    setOcupada(s.id);
    setError(null);
    try {
      const p = await convertirSolicitud(s);
      router.push(`/pedido/?id=${p.id}`);
    } catch (e) {
      setError(mensajeDeError(e));
      setOcupada(null);
    }
  }

  async function marcar(s: Solicitud, estado: "contactada" | "descartada") {
    setOcupada(s.id);
    setError(null);
    try {
      await marcarSolicitud(s.id, estado);
      await cargar();
    } catch (e) {
      setError(mensajeDeError(e));
    } finally {
      setOcupada(null);
    }
  }

  if (!sol || !peds || !recl) return error ? <ErrorAviso mensaje={error} /> : <Cargando texto="Preparando el día…" />;

  const por = (...e: PedidoConHogar["estado"][]) => peds.filter((p) => e.includes(p.estado));
  const porCotizar = por("solicitado");
  const porAprobar = por("cotizado");
  const paraComprar = por("aprobado", "en_compra");
  const porEntregar = por("liquidado", "en_entrega");
  const reclamosAbiertos = recl.filter((r) => r.estado !== "respondido");
  const urgentes = reclamosAbiertos.filter((r) => diasHasta(r.fecha_limite) <= 5);
  const activos = peds.filter((p) => !["entregado", "cerrado", "cancelado"].includes(p.estado));

  return (
    <div className="apilado apilado--grande">
      <Cabeza titulo="Hoy" />
      <ErrorAviso mensaje={error} />

      <div className="cifras">
        <a className="cifra" href="#solicitudes">
          <span className="cifra__num">{sol.length}</span>
          <span>Solicitudes nuevas</span>
        </a>
        <Link className="cifra" href="/pedidos/">
          <span className="cifra__num">{porCotizar.length}</span>
          <span>Por cotizar</span>
        </Link>
        <Link className="cifra" href="/pedidos/">
          <span className="cifra__num">{porAprobar.length}</span>
          <span>Esperando al cliente</span>
        </Link>
        <Link className="cifra cifra--fresca" href="/comprar/">
          <span className="cifra__num">{paraComprar.length}</span>
          <span>Para comprar</span>
        </Link>
        <Link className="cifra cifra--fresca" href="/pedidos/">
          <span className="cifra__num">{porEntregar.length}</span>
          <span>Por entregar</span>
        </Link>
        <Link className={`cifra ${urgentes.length > 0 ? "cifra--alerta" : ""}`} href="/reclamos/">
          <span className="cifra__num">{reclamosAbiertos.length}</span>
          <span>{urgentes.length > 0 ? `Reclamos (${urgentes.length} vencen pronto)` : "Reclamos abiertos"}</span>
        </Link>
      </div>

      <section id="solicitudes" className="apilado" aria-labelledby="h-sol">
        <h2 id="h-sol" className="t-titulo">
          Solicitudes de la web
        </h2>
        {sol.length === 0 ? (
          <Vacio titulo="No hay solicitudes nuevas">
            <p>Cuando alguien pida desde la página, aparecerá aquí.</p>
          </Vacio>
        ) : (
          <ul className="apilado">
            {sol.map((s) => {
              const enlace = enlaceCliente(
                s.celular,
                `Hola ${s.nombre.split(" ")[0]}, te escribimos de Illari por tu pedido. ¿Conversamos?`,
              );
              return (
                <li key={s.id} className="panel apilado apilado--chico">
                  <div className="fila-flex fila-flex--entre">
                    <p className="t-seccion">{s.nombre}</p>
                    <span className="t-meta">{fechaHora(s.creado_en)}</span>
                  </div>
                  <p className="t-suave">
                    {s.celular} · {NOMBRE_MODALIDAD[s.modalidad]} · {NOMBRE_RECEPCION[s.recepcion]}
                  </p>
                  {s.mensaje && <p style={{ whiteSpace: "pre-wrap" }}>{s.mensaje}</p>}
                  <div className="fila-flex">
                    <button type="button" className="boton boton--accion boton--chico" disabled={ocupada === s.id} onClick={() => void convertir(s)}>
                      Crear pedido
                    </button>
                    {enlace && (
                      <a className="boton boton--suave boton--chico" href={enlace} target="_blank" rel="noopener noreferrer" onClick={() => void marcar(s, "contactada")}>
                        Escribir por WhatsApp
                      </a>
                    )}
                    <button type="button" className="enlace" disabled={ocupada === s.id} onClick={() => void marcar(s, "descartada")}>
                      Descartar
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="apilado" aria-labelledby="h-act">
        <h2 id="h-act" className="t-titulo">
          Pedidos en marcha
        </h2>
        {activos.length === 0 ? (
          <Vacio titulo="No hay pedidos en marcha" />
        ) : (
          <div className="panel">
            {activos.slice(0, 12).map((p) => (
              <Link key={p.id} href={`/pedido/?id=${p.id}`} className="fila-pedido">
                <span className="fila-pedido__arriba">
                  <strong>
                    #{p.numero} · {p.hogares?.nombre ?? "Sin nombre"}
                  </strong>
                  <EtiquetaEstado estado={p.estado} />
                </span>
                <span className="t-meta">
                  {NOMBRE_MODALIDAD[p.modalidad]} · {p.pedido_items[0]?.count ?? 0} productos · {fechaCorta(p.creado_en)}
                </span>
              </Link>
            ))}
            {activos.length > 12 && (
              <Link href="/pedidos/" className="enlace">
                Ver los {activos.length} pedidos →
              </Link>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default function Pagina() {
  const { perfil } = useSesion();
  const router = useRouter();
  useEffect(() => {
    if (perfil.rol === "compradora") router.replace("/comprar/");
  }, [perfil.rol, router]);
  if (perfil.rol !== "administrador") return <Cargando />;
  return (
    <SoloAdmin>
      <Hoy />
    </SoloAdmin>
  );
}
