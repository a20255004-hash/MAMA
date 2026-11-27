"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { enlaceWhatsApp } from "@illari/ui";
import {
  aprobarCotizacion,
  cancelarPedido,
  cantidad as formatoCantidad,
  detalleDePedido,
  fechaCorta,
  FRASE_ESTADO,
  mensajeDeError,
  NOMBRE_MODALIDAD,
  NOMBRE_RECEPCION,
  soles,
  type DetallePedido,
  type EstadoPedido,
  type Item,
} from "@illari/db";
import { Cargando, ErrorAviso, EtiquetaEstado, Vacio } from "@/componentes/Comunes";

const CAMINO: { estados: EstadoPedido[]; texto: string }[] = [
  { estados: ["solicitado"], texto: "Recibido" },
  { estados: ["cotizado"], texto: "Cotizado" },
  { estados: ["aprobado", "en_compra", "liquidado"], texto: "Comprando" },
  { estados: ["en_entrega"], texto: "En camino" },
  { estados: ["entregado", "cerrado"], texto: "Entregado" },
];

function Camino({ estado }: { estado: EstadoPedido }) {
  const actual = CAMINO.findIndex((c) => c.estados.includes(estado));
  return (
    <ol className="camino" aria-label="Avance del pedido">
      {CAMINO.map((c, i) => (
        <li key={c.texto} data-listo={i <= actual} aria-current={i === actual ? "step" : undefined}>
          {c.texto}
        </li>
      ))}
    </ol>
  );
}

const TEXTO_ITEM: Record<Item["estado_item"], string> = {
  pendiente: "",
  comprado: "Comprado",
  sin_stock: "No había",
  sustituido: "Cambiado por algo similar",
};

function LineaItem({ it, verPrecios }: { it: Item; verPrecios: boolean }) {
  const comprado = it.estado_item === "comprado" || it.estado_item === "sustituido";
  return (
    <li>
      <div className="item-linea">
        <div>
          <p style={{ fontWeight: 600 }}>{it.descripcion}</p>
          <p className="t-meta">
            {formatoCantidad(it.cantidad)} {it.unidad}
            {it.preferencia ? ` · ${it.preferencia}` : ""}
            {it.casero ? ` · ${it.casero}` : ""}
          </p>
          {TEXTO_ITEM[it.estado_item] && <p className="t-meta">{TEXTO_ITEM[it.estado_item]}{it.nota_compra ? ` · ${it.nota_compra}` : ""}</p>}
        </div>
        {verPrecios && (
          <div className="item-linea__der">
            {comprado && it.precio_real_total !== null ? (
              <>
                <p>{soles(it.precio_real_total)}</p>
                <p className="t-meta">{formatoCantidad(it.cantidad_real ?? it.cantidad)} {it.unidad}</p>
              </>
            ) : it.precio_unit_estimado !== null ? (
              <>
                <p>{soles(it.cantidad * it.precio_unit_estimado)}</p>
                <p className="t-meta">{soles(it.precio_unit_estimado)} c/u</p>
              </>
            ) : null}
          </div>
        )}
      </div>
    </li>
  );
}

function Detalle() {
  const id = useSearchParams().get("id");
  const [d, setD] = useState<DetallePedido | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [confirmarCancelar, setConfirmarCancelar] = useState(false);

  const cargar = useCallback(async () => {
    if (!id) return setD(null);
    try {
      setD(await detalleDePedido(id));
    } catch (e) {
      setError(mensajeDeError(e));
    }
  }, [id]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  async function accion(f: () => Promise<void>) {
    setOcupado(true);
    setError(null);
    try {
      await f();
      setConfirmarCancelar(false);
      await cargar();
    } catch (e) {
      setError(mensajeDeError(e));
    } finally {
      setOcupado(false);
    }
  }

  if (d === undefined) return error ? <ErrorAviso mensaje={error} /> : <Cargando texto="Abriendo tu pedido…" />;
  if (d === null) {
    return (
      <Vacio titulo="No encontramos ese pedido">
        <Link href="/" className="boton boton--borde">
          Volver al inicio
        </Link>
      </Vacio>
    );
  }

  const { pedido, items, cotizacion, direccion } = d;
  // Los importes aparecen cuando ya hay cotización: antes son solo notas de trabajo de la administración.
  const verPrecios = pedido.estado !== "solicitado";
  const totalEstimado = cotizacion
    ? cotizacion.total_productos_estimado + cotizacion.tarifa_servicio + cotizacion.tarifa_delivery
    : null;
  const totalReal = items.reduce((s, i) => s + (i.precio_real_total ?? 0), 0);
  const hayCompras = items.some((i) => i.precio_real_total !== null);
  const puedeCancelar = pedido.estado === "solicitado" || pedido.estado === "cotizado";

  return (
    <div className="apilado apilado--grande">
      <Link href="/" className="enlace" style={{ justifySelf: "start" }}>
        ← Mis pedidos
      </Link>

      <div className="apilado apilado--chico">
        <div className="fila-flex fila-flex--entre">
          <h1 className="t-pagina">Pedido #{pedido.numero}</h1>
          <EtiquetaEstado estado={pedido.estado} />
        </div>
        <p className="t-suave">{FRASE_ESTADO[pedido.estado]}</p>
      </div>

      {pedido.estado !== "cancelado" && <Camino estado={pedido.estado} />}

      <ErrorAviso mensaje={error} />

      {pedido.estado === "cotizado" && cotizacion && totalEstimado !== null && (
        <section className="superficie superficie--calida apilado" aria-labelledby="h-cot">
          <h2 id="h-cot" className="t-titulo">
            Tu cotización
          </h2>
          <div className="totales">
            <div>
              <span>Productos (estimado)</span>
              <span className="t-num">{soles(cotizacion.total_productos_estimado)}</span>
            </div>
            {cotizacion.tarifa_servicio > 0 && (
              <div>
                <span>Servicio de compra</span>
                <span className="t-num">{soles(cotizacion.tarifa_servicio)}</span>
              </div>
            )}
            {cotizacion.tarifa_delivery > 0 && (
              <div>
                <span>Entrega a domicilio</span>
                <span className="t-num">{soles(cotizacion.tarifa_delivery)}</span>
              </div>
            )}
            <div>
              <span>Total estimado</span>
              <span className="cotizacion__total t-num">{soles(totalEstimado)}</span>
            </div>
          </div>
          <p className="t-meta">
            Los precios del mercado cambian cada día: el total final puede variar hasta un {cotizacion.tolerancia_pct}% en
            los productos. Al terminar, te mostramos cada precio real.
          </p>
          <div className="fila-flex">
            <button type="button" className="boton boton--accion boton--grande" disabled={ocupado} onClick={() => void accion(() => aprobarCotizacion(pedido.id))}>
              {ocupado ? "Un momento…" : "Aprobar y comenzar"}
            </button>
            <a
              className="boton boton--borde"
              href={enlaceWhatsApp(`Hola, tengo una duda sobre mi pedido #${pedido.numero}.`)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Tengo una duda
            </a>
          </div>
        </section>
      )}

      {cotizacion?.estado === "aprobada" && cotizacion.aprobada_en && (
        <p className="aviso aviso--bien">Aprobaste la cotización el {fechaCorta(cotizacion.aprobada_en)}.</p>
      )}

      {hayCompras && (
        <section className="superficie apilado" aria-labelledby="h-real">
          <h2 id="h-real" className="t-seccion">
            Lo que costó tu compra
          </h2>
          <div className="totales">
            <div>
              <span>Productos (precios reales)</span>
              <span className="t-num">{soles(totalReal)}</span>
            </div>
            {cotizacion && cotizacion.tarifa_servicio > 0 && (
              <div>
                <span>Servicio de compra</span>
                <span className="t-num">{soles(cotizacion.tarifa_servicio)}</span>
              </div>
            )}
            {cotizacion && cotizacion.tarifa_delivery > 0 && (
              <div>
                <span>Entrega a domicilio</span>
                <span className="t-num">{soles(cotizacion.tarifa_delivery)}</span>
              </div>
            )}
            <div>
              <span>Total</span>
              <span className="t-num">
                {soles(totalReal + (cotizacion?.tarifa_servicio ?? 0) + (cotizacion?.tarifa_delivery ?? 0))}
              </span>
            </div>
          </div>
        </section>
      )}

      <section className="apilado apilado--chico" aria-labelledby="h-items">
        <h2 id="h-items" className="t-titulo">
          Tu lista
        </h2>
        {items.length === 0 ? (
          <p className="t-suave">Sin lista: la armamos según lo que nos contaste.</p>
        ) : (
          <ul className="filas">
            {items.map((it) => (
              <LineaItem key={it.id} it={it} verPrecios={verPrecios} />
            ))}
          </ul>
        )}
      </section>

      <section className="apilado apilado--chico" aria-labelledby="h-datos">
        <h2 id="h-datos" className="t-titulo">
          Datos del pedido
        </h2>
        <dl className="datos">
          <dt>Forma de compra</dt>
          <dd>{NOMBRE_MODALIDAD[pedido.modalidad]}</dd>
          <dt>Recepción</dt>
          <dd>{NOMBRE_RECEPCION[pedido.recepcion]}</dd>
          {direccion && (
            <>
              <dt>Dirección</dt>
              <dd>
                {direccion.direccion}
                {direccion.referencia ? ` (${direccion.referencia})` : ""}
              </dd>
            </>
          )}
          {pedido.fecha_deseada && (
            <>
              <dt>Para el</dt>
              <dd>{fechaCorta(pedido.fecha_deseada)}</dd>
            </>
          )}
          <dt>Pedido el</dt>
          <dd>{fechaCorta(pedido.creado_en)}</dd>
          {pedido.notas_cliente && (
            <>
              <dt>Tus notas</dt>
              <dd style={{ whiteSpace: "pre-wrap" }}>{pedido.notas_cliente}</dd>
            </>
          )}
        </dl>
      </section>

      {puedeCancelar && (
        <section className="apilado apilado--chico">
          {confirmarCancelar ? (
            <div className="superficie apilado" role="alertdialog" aria-label="Confirmar cancelación">
              <p>¿Seguro que quieres cancelar este pedido? No se compra nada hasta que lo apruebes, así que no pasa nada.</p>
              <div className="fila-flex">
                <button type="button" className="boton boton--peligro" disabled={ocupado} onClick={() => void accion(() => cancelarPedido(pedido.id))}>
                  Sí, cancelar
                </button>
                <button type="button" className="boton boton--borde" onClick={() => setConfirmarCancelar(false)}>
                  No, volver
                </button>
              </div>
            </div>
          ) : (
            <button type="button" className="enlace" style={{ justifySelf: "start", color: "var(--error)" }} onClick={() => setConfirmarCancelar(true)}>
              Cancelar este pedido
            </button>
          )}
        </section>
      )}

      {!puedeCancelar && pedido.estado !== "cancelado" && pedido.estado !== "cerrado" && pedido.estado !== "entregado" && (
        <p className="t-meta">
          Para cambiar algo de un pedido que ya está en marcha,{" "}
          <a className="enlace" href={enlaceWhatsApp(`Hola, quiero consultar sobre mi pedido #${pedido.numero}.`)} target="_blank" rel="noopener noreferrer">
            escríbenos por WhatsApp
          </a>
          .
        </p>
      )}
    </div>
  );
}

export default function PaginaPedido() {
  return (
    <Suspense fallback={<Cargando texto="Abriendo tu pedido…" />}>
      <Detalle />
    </Suspense>
  );
}
