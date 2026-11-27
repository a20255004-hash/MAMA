"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  cantidad as formatoCantidad,
  mensajeDeError,
  pedidosParaComprar,
  registrarCompra,
  soles,
  type EstadoItem,
  type Item,
  type PedidoParaComprar,
} from "@illari/db";
import { Cabeza, Cargando, ErrorAviso, Vacio } from "@/componentes/Comunes";

const REGLA: Record<Item["sustitucion"], string> = {
  consultar: "Si no hay: consultar al cliente antes de cambiar.",
  similar: "Si no hay: puedes cambiarlo por algo similar.",
  omitir: "Si no hay: no lo lleves.",
};

type Abierto = { itemId: string; modo: "comprado" | "sustituido" | "sin_stock" };

const numero = (t: string): number => Number(t.replace(",", "."));

function TarjetaItem({
  it,
  celular,
  onGuardar,
}: {
  it: Item;
  celular: string | null;
  onGuardar: (itemId: string, estado: EstadoItem, cantidad: number | null, precio: number | null, nota: string) => Promise<void>;
}) {
  const [abierto, setAbierto] = useState<Abierto["modo"] | null>(null);
  const [cant, setCant] = useState(String(it.cantidad_real ?? it.cantidad));
  const [precio, setPrecio] = useState(it.precio_real_total === null ? "" : String(it.precio_real_total));
  const [nota, setNota] = useState(it.nota_compra);
  const [autorizado, setAutorizado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const hecho = it.estado_item !== "pendiente";

  async function guardar() {
    setError(null);
    if (abierto === "sin_stock") {
      setGuardando(true);
      try {
        await onGuardar(it.id, "sin_stock", null, null, nota);
        setAbierto(null);
      } catch (e) {
        setError(mensajeDeError(e));
      } finally {
        setGuardando(false);
      }
      return;
    }
    const c = numero(cant);
    const p = numero(precio);
    if (!(c > 0)) return setError("Escribe la cantidad que compraste.");
    if (precio.trim() === "" || !(p >= 0)) return setError("Escribe cuánto pagaste en total por este producto.");
    if (abierto === "sustituido" && it.sustitucion === "consultar" && !autorizado) {
      return setError("Marca que el cliente autorizó el cambio, o consúltalo antes.");
    }
    setGuardando(true);
    try {
      await onGuardar(it.id, abierto ?? "comprado", c, p, nota);
      setAbierto(null);
    } catch (e) {
      setError(mensajeDeError(e));
    } finally {
      setGuardando(false);
    }
  }

  const consulta = celular
    ? `https://wa.me/51${celular}?text=${encodeURIComponent(`Hola, estamos en el mercado y no encontramos ${it.descripcion}. ¿Lo cambiamos por algo similar?`)}`
    : null;

  return (
    <li className="compra-item" data-estado={it.estado_item}>
      <div>
        <p className="compra-item__nombre">{it.descripcion}</p>
        <p style={{ fontSize: "var(--t-lg)" }}>
          {formatoCantidad(it.cantidad)} {it.unidad}
          {it.casero ? ` · ${it.casero}` : ""}
        </p>
      </div>
      {it.preferencia && <p className="compra-item__nota">“{it.preferencia}”</p>}
      <p className="t-meta">{REGLA[it.sustitucion]}</p>

      {hecho && !abierto && (
        <div className="fila-flex fila-flex--entre">
          <p style={{ fontWeight: 600 }}>
            {it.estado_item === "sin_stock"
              ? "No había"
              : `${it.estado_item === "sustituido" ? "Cambiado · " : "Comprado · "}${formatoCantidad(it.cantidad_real ?? 0)} ${it.unidad} · ${soles(it.precio_real_total)}`}
          </p>
          <button type="button" className="enlace" onClick={() => setAbierto(it.estado_item === "pendiente" ? "comprado" : it.estado_item)}>
            Corregir
          </button>
        </div>
      )}

      {!hecho && !abierto && (
        <div className="compra-acciones">
          <button type="button" className="boton boton--accion" onClick={() => setAbierto("comprado")}>
            Comprado
          </button>
          <button type="button" className="boton boton--borde" onClick={() => setAbierto("sin_stock")}>
            No había
          </button>
          {it.sustitucion !== "omitir" && (
            <button type="button" className="boton boton--suave" onClick={() => setAbierto("sustituido")}>
              Lo cambié
            </button>
          )}
        </div>
      )}

      {abierto && (
        <div className="apilado">
          {abierto !== "sin_stock" && (
            <div className="compra-campos">
              <div className="campo">
                <label htmlFor={`c-${it.id}`}>Cantidad ({it.unidad})</label>
                <input id={`c-${it.id}`} inputMode="decimal" value={cant} onChange={(e) => setCant(e.target.value)} />
              </div>
              <div className="campo">
                <label htmlFor={`p-${it.id}`}>Pagué en total (S/)</label>
                <input id={`p-${it.id}`} inputMode="decimal" value={precio} onChange={(e) => setPrecio(e.target.value)} autoFocus />
              </div>
            </div>
          )}
          {abierto === "sustituido" && it.sustitucion === "consultar" && (
            <div className="aviso apilado apilado--chico">
              <p>Este producto se consulta antes de cambiarlo.</p>
              {consulta && (
                <a className="boton boton--suave boton--chico" style={{ justifySelf: "start" }} href={consulta} target="_blank" rel="noopener noreferrer">
                  Preguntar al cliente por WhatsApp
                </a>
              )}
              <label className="fila-flex" style={{ flexWrap: "nowrap", alignItems: "flex-start" }}>
                <input type="checkbox" checked={autorizado} onChange={(e) => setAutorizado(e.target.checked)} style={{ marginTop: "0.35rem", accentColor: "var(--accion)" }} />
                <span>El cliente autorizó el cambio.</span>
              </label>
            </div>
          )}
          <div className="campo">
            <label htmlFor={`n-${it.id}`}>{abierto === "sustituido" ? "¿Por cuál lo cambiaste?" : "Nota (opcional)"}</label>
            <input id={`n-${it.id}`} value={nota} maxLength={300} onChange={(e) => setNota(e.target.value)} />
          </div>
          <ErrorAviso mensaje={error} />
          <div className="fila-flex">
            <button type="button" className="boton boton--accion" disabled={guardando} onClick={() => void guardar()}>
              {guardando ? "Guardando…" : "Guardar"}
            </button>
            <button type="button" className="enlace" onClick={() => { setAbierto(null); setError(null); }}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

export default function Comprar() {
  const [pedidos, setPedidos] = useState<PedidoParaComprar[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      setPedidos(await pedidosParaComprar());
    } catch (e) {
      setError(mensajeDeError(e));
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  async function guardar(itemId: string, estado: EstadoItem, cantidad: number | null, precio: number | null, nota: string) {
    await registrarCompra({ itemId, estado, cantidadReal: cantidad, precioRealTotal: precio, nota });
    await cargar();
  }

  if (!pedidos) return error ? <ErrorAviso mensaje={error} /> : <Cargando texto="Buscando qué comprar…" />;

  return (
    <div className="apilado apilado--grande">
      <Cabeza titulo="Comprar" />
      <ErrorAviso mensaje={error} />
      {pedidos.length === 0 ? (
        <Vacio titulo="No hay compras pendientes">
          <p>Cuando un cliente apruebe su cotización, su lista aparecerá aquí.</p>
        </Vacio>
      ) : (
        pedidos.map((p) => {
          const items = [...p.pedido_items].sort((a, b) => a.orden - b.orden);
          const hechos = items.filter((i) => i.estado_item !== "pendiente").length;
          return (
            <section key={p.id} className="compra-pedido" aria-label={`Pedido ${p.numero}`}>
              <div className="fila-flex fila-flex--entre">
                <h2 className="t-titulo">
                  #{p.numero} · {p.hogares?.nombre ?? "Sin nombre"}
                </h2>
                <span className="t-meta">
                  {hechos} de {items.length}
                </span>
              </div>
              <div className="avance" role="progressbar" aria-valuenow={hechos} aria-valuemin={0} aria-valuemax={items.length} aria-label="Avance de la compra">
                <span style={{ width: `${items.length ? (hechos / items.length) * 100 : 0}%` }} />
              </div>
              {p.notas_cliente && <p className="aviso">{p.notas_cliente}</p>}
              {items.length === 0 ? (
                <p className="t-suave">
                  Este pedido no tiene lista.{" "}
                  <Link className="enlace" href={`/pedido/?id=${p.id}`}>
                    Ábrelo
                  </Link>{" "}
                  para armarla.
                </p>
              ) : (
                <ul className="compra-pedido">
                  {items.map((it) => (
                    <TarjetaItem key={it.id} it={it} celular={p.hogares?.celular ?? null} onGuardar={guardar} />
                  ))}
                </ul>
              )}
              {hechos === items.length && items.length > 0 && (
                <p className="aviso aviso--bien">
                  ¡Todo comprado!{" "}
                  <Link className="enlace" href={`/pedido/?id=${p.id}`}>
                    Cerrar cuentas del pedido
                  </Link>
                </p>
              )}
            </section>
          );
        })
      )}
    </div>
  );
}
