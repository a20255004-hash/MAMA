"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  agregarNota,
  aprobarEnNombreDelCliente,
  borrarItem,
  cambiarEstado,
  cancelarPedidoCentral,
  cantidad as formatoCantidad,
  catalogoCompleto,
  cuentaDeHogar,
  entregaDePedido,
  enviarCotizacion,
  marcarEntrega,
  NOMBRE_ENTREGA,
  NOMBRE_SUSTITUCION,
  programarEntrega,
  repartidores,
  type CaseroHogar,
  type Entrega,
  type Perfil,
  type PreferenciaHogar,
  fechaCorta,
  fechaHora,
  guardarItem,
  mensajeDeError,
  NOMBRE_ESTADO,
  NOMBRE_MODALIDAD,
  NOMBRE_MOVIMIENTO,
  NOMBRE_RECEPCION,
  pedidoCompleto,
  registrarMovimiento,
  soles,
  type EstadoPedido,
  type PedidoCompleto,
  type Producto,
  type Sustitucion,
  type TipoMovimiento,
} from "@illari/db";
import { Cargando, ErrorAviso, EtiquetaEstado, Vacio, enlaceCliente, urlDeLaApp } from "@/componentes/Comunes";
import { SoloAdmin } from "@/componentes/Guardia";
import { useSesion } from "@/componentes/Sesion";

type Fila = {
  clave: string;
  id?: string;
  productoId?: string | null;
  descripcion: string;
  cantidad: string;
  unidad: string;
  precio: string;
  sustitucion: Sustitucion;
  preferencia: string;
  casero: string;
};

const UNIDADES = ["kg", "unidad", "docena", "atado", "litro", "bolsa"];
const SUSTITUCION: Record<Sustitucion, string> = {
  consultar: "Consultar",
  similar: "Cambiar por similar",
  omitir: "No llevar",
};

const SIGUIENTE: Partial<Record<EstadoPedido, { a: EstadoPedido; texto: string }[]>> = {
  aprobado: [{ a: "en_compra", texto: "Empezar a comprar" }],
  en_compra: [{ a: "liquidado", texto: "Terminé de comprar: cerrar cuentas" }],
  liquidado: [
    { a: "en_entrega", texto: "Salió a entregar" },
    { a: "entregado", texto: "Marcar entregado" },
  ],
  en_entrega: [{ a: "entregado", texto: "Marcar entregado" }],
  entregado: [{ a: "cerrado", texto: "Cerrar pedido" }],
};

const TIPOS_DEL_PEDIDO: TipoMovimiento[] = [
  "adelanto_cliente",
  "cobro_saldo_cliente",
  "compra_productos",
  "devolucion_cliente",
  "ingreso_servicio",
  "ingreso_delivery",
];

const numero = (t: string): number => Number(t.replace(",", "."));
const hoy = () => new Date().toISOString().slice(0, 10);

function filasDe(d: PedidoCompleto): Fila[] {
  return d.items.map((i) => ({
    clave: i.id,
    id: i.id,
    productoId: i.producto_id,
    descripcion: i.descripcion,
    cantidad: String(i.cantidad),
    unidad: i.unidad,
    precio: i.precio_unit_estimado === null ? "" : String(i.precio_unit_estimado),
    sustitucion: i.sustitucion,
    preferencia: i.preferencia,
    casero: i.casero,
  }));
}

function Detalle() {
  const id = useSearchParams().get("id");
  const { perfil } = useSesion();
  const [d, setD] = useState<PedidoCompleto | null | undefined>(undefined);
  const [filas, setFilas] = useState<Fila[]>([]);
  const [quitadas, setQuitadas] = useState<string[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [servicio, setServicio] = useState("");
  const [delivery, setDelivery] = useState("");
  const [tolerancia, setTolerancia] = useState("10");
  const [nota, setNota] = useState("");
  const [confirmar, setConfirmar] = useState<"cancelar" | "aprobar" | null>(null);
  const [mov, setMov] = useState({ tipo: "adelanto_cliente" as TipoMovimiento, monto: "", fecha: hoy(), descripcion: "" });
  const [entrega, setEntrega] = useState<Entrega | null>(null);
  const [reps, setReps] = useState<Perfil[]>([]);
  const [casa, setCasa] = useState<{ caseros: CaseroHogar[]; preferencias: PreferenciaHogar[] } | null>(null);
  const [formEntrega, setFormEntrega] = useState({ repartidorId: "", ventana: "" });

  const cargar = useCallback(async () => {
    if (!id) return setD(null);
    try {
      const completo = await pedidoCompleto(id);
      setD(completo);
      if (completo) {
        setFilas(filasDe(completo));
        setQuitadas([]);
        const ultima = completo.cotizaciones[0];
        if (ultima) {
          setServicio(String(ultima.tarifa_servicio));
          setDelivery(String(ultima.tarifa_delivery));
          setTolerancia(String(ultima.tolerancia_pct));
        }
        const [en, rs, ca] = await Promise.all([
          entregaDePedido(id),
          repartidores(),
          completo.hogar ? cuentaDeHogar(completo.hogar.id) : Promise.resolve(null),
        ]);
        setEntrega(en);
        setReps(rs);
        setCasa(ca);
        setFormEntrega({ repartidorId: en?.repartidor_id ?? "", ventana: en?.ventana ?? "" });
      }
    } catch (e) {
      setError(mensajeDeError(e));
    }
  }, [id]);

  useEffect(() => {
    void cargar();
    catalogoCompleto()
      .then((c) => setProductos(c.productos.filter((p) => p.activo)))
      .catch(() => undefined);
  }, [cargar]);

  const totalFilas = useMemo(
    () => filas.reduce((s, f) => s + (numero(f.cantidad) || 0) * (numero(f.precio) || 0), 0),
    [filas],
  );

  async function correr(f: () => Promise<void>, mensajeOk?: string) {
    setOcupado(true);
    setError(null);
    setAviso(null);
    try {
      await f();
      setConfirmar(null);
      await cargar();
      if (mensajeOk) setAviso(mensajeOk);
    } catch (e) {
      setError(mensajeDeError(e));
    } finally {
      setOcupado(false);
    }
  }

  function validarFilas(): string | null {
    if (filas.length === 0) return "Agrega al menos un producto.";
    for (const f of filas) {
      if (f.descripcion.trim().length < 1) return "Hay un producto sin nombre.";
      if (!(numero(f.cantidad) > 0)) return `Revisa la cantidad de "${f.descripcion}".`;
      if (f.precio.trim() !== "" && !(numero(f.precio) >= 0)) return `Revisa el precio de "${f.descripcion}".`;
    }
    return null;
  }

  async function guardarLista(pedidoId: string) {
    for (const q of quitadas) await borrarItem(q);
    for (const [i, f] of filas.entries()) {
      await guardarItem({
        id: f.id,
        pedidoId,
        productoId: f.productoId ?? null,
        descripcion: f.descripcion.trim(),
        cantidad: numero(f.cantidad),
        unidad: f.unidad,
        preferencia: f.preferencia,
        casero: f.casero,
        sustitucion: f.sustitucion,
        precioUnitEstimado: f.precio.trim() === "" ? null : numero(f.precio),
        orden: i,
      });
    }
  }

  async function guardarYa(pedidoId: string) {
    const problema = validarFilas();
    if (problema) return setError(problema);
    await correr(() => guardarLista(pedidoId), "Lista guardada.");
  }

  async function cotizar(pedidoId: string) {
    const problema = validarFilas();
    if (problema) return setError(problema);
    if (filas.some((f) => f.precio.trim() === "")) return setError("Faltan precios: pon un precio estimado a cada producto.");
    const s = servicio.trim() === "" ? 0 : numero(servicio);
    const e = delivery.trim() === "" ? 0 : numero(delivery);
    const t = tolerancia.trim() === "" ? 10 : numero(tolerancia);
    if (!(s >= 0) || !(e >= 0) || !(t >= 0 && t <= 100)) return setError("Revisa el servicio, el delivery y el margen.");
    await correr(async () => {
      await guardarLista(pedidoId);
      await enviarCotizacion(pedidoId, s, e, t);
    }, "Cotización enviada. Avísale al cliente para que la revise.");
  }

  function anadirFila(p?: Producto) {
    setFilas((prev) => [
      ...prev,
      {
        clave: crypto.randomUUID(),
        productoId: p?.id ?? null,
        descripcion: p?.nombre ?? "",
        cantidad: "1",
        unidad: p?.unidad_defecto ?? "kg",
        precio: "",
        sustitucion: "consultar",
        preferencia: "",
        casero: "",
      },
    ]);
  }

  function cambiarFila(clave: string, cambio: Partial<Fila>) {
    setFilas((prev) => prev.map((f) => (f.clave === clave ? { ...f, ...cambio } : f)));
  }

  function quitarFila(f: Fila) {
    setFilas((prev) => prev.filter((x) => x.clave !== f.clave));
    if (f.id) setQuitadas((prev) => [...prev, f.id as string]);
  }

  async function registrarMov(e: FormEvent, pedidoId: string, ciudadId: string) {
    e.preventDefault();
    const monto = numero(mov.monto);
    if (!(monto > 0)) return setError("Escribe un monto mayor que cero.");
    await correr(async () => {
      await registrarMovimiento({
        ciudadId,
        tipo: mov.tipo,
        monto,
        fecha: mov.fecha,
        pedidoId,
        descripcion: mov.descripcion.trim(),
      });
      setMov({ ...mov, monto: "", descripcion: "" });
    }, "Movimiento registrado.");
  }

  async function guardarNota(e: FormEvent, pedidoId: string) {
    e.preventDefault();
    if (!nota.trim()) return;
    await correr(async () => {
      await agregarNota(pedidoId, perfil.id, nota.trim());
      setNota("");
    });
  }

  if (d === undefined) return error ? <ErrorAviso mensaje={error} /> : <Cargando texto="Abriendo el pedido…" />;
  if (d === null) {
    return (
      <Vacio titulo="No encontramos ese pedido">
        <Link href="/pedidos/" className="boton boton--borde">
          Volver a pedidos
        </Link>
      </Vacio>
    );
  }

  const { pedido, hogar, direccion, items, cotizaciones, notas, movimientos } = d;
  const editable = pedido.estado === "solicitado" || pedido.estado === "cotizado";
  const cotVigente = cotizaciones.find((c) => c.estado === "enviada" || c.estado === "aprobada") ?? null;
  const enMarcha = !["entregado", "cerrado", "cancelado"].includes(pedido.estado);
  const hayCompra = ["en_compra", "liquidado", "en_entrega", "entregado", "cerrado"].includes(pedido.estado);

  // Cuentas: lo que el cliente adelanta para productos es dinero suyo (fondos de terceros);
  // solo servicio y delivery son ingreso del negocio.
  const totalReal = items.reduce((s, i) => s + (i.precio_real_total ?? 0), 0);
  const suma = (t: TipoMovimiento[]) => movimientos.filter((m) => t.includes(m.tipo)).reduce((s, m) => s + Number(m.monto), 0);
  const recibidoProductos = suma(["adelanto_cliente", "cobro_saldo_cliente"]) - suma(["devolucion_cliente"]);
  const saldoProductos = totalReal - recibidoProductos;
  const debidoFees = (cotVigente?.tarifa_servicio ?? 0) + (cotVigente?.tarifa_delivery ?? 0);
  const cobradoFees = suma(["ingreso_servicio", "ingreso_delivery"]);
  const saldoFees = debidoFees - cobradoFees;
  const pendientes = items.filter((i) => i.estado_item === "pendiente").length;

  const wsp = enlaceCliente(
    hogar?.celular,
    pedido.estado === "cotizado"
      ? `Hola ${hogar?.nombre.split(" ")[0] ?? ""}, tu cotización del pedido #${pedido.numero} ya está lista. Puedes revisarla y aprobarla aquí: ${typeof window !== "undefined" ? urlDeLaApp() : ""}`
      : `Hola ${hogar?.nombre.split(" ")[0] ?? ""}, te escribimos de Illari por tu pedido #${pedido.numero}.`,
  );

  function sugerirMonto(tipo: TipoMovimiento): string {
    if (tipo === "compra_productos") return totalReal > 0 ? String(totalReal) : "";
    if (tipo === "ingreso_servicio") return cotVigente && cotVigente.tarifa_servicio > 0 ? String(cotVigente.tarifa_servicio) : "";
    if (tipo === "ingreso_delivery") return cotVigente && cotVigente.tarifa_delivery > 0 ? String(cotVigente.tarifa_delivery) : "";
    if (tipo === "cobro_saldo_cliente") return saldoProductos > 0 ? saldoProductos.toFixed(2) : "";
    if (tipo === "devolucion_cliente") return saldoProductos < 0 ? Math.abs(saldoProductos).toFixed(2) : "";
    return "";
  }

  return (
    <div className="apilado apilado--grande">
      <Link href="/pedidos/" className="enlace" style={{ justifySelf: "start" }}>
        ← Pedidos
      </Link>

      <div className="fila-flex fila-flex--entre">
        <div className="apilado apilado--chico">
          <h1 className="t-pagina">
            Pedido #{pedido.numero} · {hogar?.nombre ?? "Sin nombre"}
          </h1>
          <p className="t-suave">
            {NOMBRE_MODALIDAD[pedido.modalidad]} · {NOMBRE_RECEPCION[pedido.recepcion]} · {fechaCorta(pedido.creado_en)}
          </p>
        </div>
        <EtiquetaEstado estado={pedido.estado} />
      </div>

      <ErrorAviso mensaje={error} />
      {aviso && (
        <p className="aviso aviso--bien" role="status">
          {aviso}
        </p>
      )}

      <div className="dos-columnas">
        <div className="apilado apilado--grande">
          {/* Lista de productos ------------------------------------------------------- */}
          <section className="panel apilado" aria-labelledby="h-lista">
            <div className="fila-flex fila-flex--entre">
              <h2 id="h-lista" className="t-titulo">
                Productos
              </h2>
              {editable && (
                <span className="t-meta">{filas.length} en la lista</span>
              )}
            </div>

            {editable ? (
              <>
                <div>
                  {filas.map((f) => (
                    <div key={f.clave} className="editor-item">
                      <div className="rejilla-item">
                        <div className="campo ancho">
                          <label htmlFor={`d-${f.clave}`}>Producto</label>
                          <input id={`d-${f.clave}`} list="catalogo-productos" value={f.descripcion} onChange={(e) => cambiarFila(f.clave, { descripcion: e.target.value })} />
                        </div>
                        <div className="campo">
                          <label htmlFor={`c-${f.clave}`}>Cantidad</label>
                          <input id={`c-${f.clave}`} inputMode="decimal" value={f.cantidad} onChange={(e) => cambiarFila(f.clave, { cantidad: e.target.value })} />
                        </div>
                        <div className="campo">
                          <label htmlFor={`u-${f.clave}`}>Unidad</label>
                          <select id={`u-${f.clave}`} value={f.unidad} onChange={(e) => cambiarFila(f.clave, { unidad: e.target.value })}>
                            {(UNIDADES.includes(f.unidad) ? UNIDADES : [...UNIDADES, f.unidad]).map((u) => (
                              <option key={u}>{u}</option>
                            ))}
                          </select>
                        </div>
                        <div className="campo">
                          <label htmlFor={`p-${f.clave}`}>Precio c/u (S/)</label>
                          <input id={`p-${f.clave}`} inputMode="decimal" value={f.precio} onChange={(e) => cambiarFila(f.clave, { precio: e.target.value })} />
                        </div>
                      </div>
                      <div className="fila">
                        <div className="campo">
                          <label htmlFor={`pr-${f.clave}`}>Preferencia del cliente</label>
                          <input id={`pr-${f.clave}`} value={f.preferencia} onChange={(e) => cambiarFila(f.clave, { preferencia: e.target.value })} />
                        </div>
                        <div className="campo">
                          <label htmlFor={`s-${f.clave}`}>Si no hay</label>
                          <select id={`s-${f.clave}`} value={f.sustitucion} onChange={(e) => cambiarFila(f.clave, { sustitucion: e.target.value as Sustitucion })}>
                            {(Object.keys(SUSTITUCION) as Sustitucion[]).map((s) => (
                              <option key={s} value={s}>
                                {SUSTITUCION[s]}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="campo">
                          <label htmlFor={`ca-${f.clave}`}>Casero o puesto</label>
                          <input id={`ca-${f.clave}`} value={f.casero} onChange={(e) => cambiarFila(f.clave, { casero: e.target.value })} />
                        </div>
                      </div>
                      <div className="fila-flex fila-flex--entre">
                        <span className="t-meta t-num">
                          Subtotal: {soles((numero(f.cantidad) || 0) * (numero(f.precio) || 0))}
                        </span>
                        <button type="button" className="enlace" style={{ color: "var(--error)" }} onClick={() => quitarFila(f)}>
                          Quitar
                        </button>
                      </div>
                    </div>
                  ))}
                  {filas.length === 0 && <p className="t-suave">Aún no hay productos. Agrégalos abajo.</p>}
                </div>
                <datalist id="catalogo-productos">
                  {productos.map((p) => (
                    <option key={p.id} value={p.nombre} />
                  ))}
                </datalist>
                <div className="fila-flex">
                  <button type="button" className="boton boton--suave boton--chico" onClick={() => anadirFila()}>
                    + Agregar producto
                  </button>
                  <button type="button" className="boton boton--borde boton--chico" disabled={ocupado} onClick={() => void guardarYa(pedido.id)}>
                    Guardar lista
                  </button>
                  <span className="t-num" style={{ marginLeft: "auto", fontWeight: 600 }}>
                    Productos: {soles(totalFilas)}
                  </span>
                </div>
              </>
            ) : items.length === 0 ? (
              <p className="t-suave">Este pedido no tiene lista de productos.</p>
            ) : (
              <div className="tabla-caja">
                <table className="tabla">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th className="num">Pedido</th>
                      <th className="num">Estimado</th>
                      <th className="num">Real</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((i) => (
                      <tr key={i.id}>
                        <td>
                          {i.descripcion}
                          <div className="t-meta">
                            {[i.preferencia, i.casero, i.estado_item !== "pendiente" ? i.estado_item.replace("_", " ") : "", i.nota_compra]
                              .filter(Boolean)
                              .join(" · ")}
                          </div>
                        </td>
                        <td className="num">
                          {formatoCantidad(i.cantidad)} {i.unidad}
                        </td>
                        <td className="num">{i.precio_unit_estimado === null ? "—" : soles(i.cantidad * i.precio_unit_estimado)}</td>
                        <td className="num">{i.precio_real_total === null ? "—" : soles(i.precio_real_total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Cotización --------------------------------------------------------------- */}
          {editable && (
            <section className="panel apilado" aria-labelledby="h-cot">
              <h2 id="h-cot" className="t-titulo">
                {pedido.estado === "cotizado" ? "Cotización enviada" : "Cotizar"}
              </h2>
              {cotVigente && pedido.estado === "cotizado" && (
                <p className="aviso">
                  Versión {cotVigente.version}: productos {soles(cotVigente.total_productos_estimado)}, servicio {soles(cotVigente.tarifa_servicio)}, delivery{" "}
                  {soles(cotVigente.tarifa_delivery)}. Esperando que el cliente la apruebe. Si la cambias, se envía una versión nueva.
                </p>
              )}
              <div className="fila">
                <div className="campo">
                  <label htmlFor="serv">Servicio de compra (S/)</label>
                  <input id="serv" inputMode="decimal" value={servicio} onChange={(e) => setServicio(e.target.value)} placeholder="0.00" />
                </div>
                <div className="campo">
                  <label htmlFor="deliv">Delivery (S/)</label>
                  <input id="deliv" inputMode="decimal" value={delivery} onChange={(e) => setDelivery(e.target.value)} placeholder="0.00" />
                </div>
                <div className="campo">
                  <label htmlFor="tol">Margen de variación (%)</label>
                  <input id="tol" inputMode="decimal" value={tolerancia} onChange={(e) => setTolerancia(e.target.value)} />
                </div>
              </div>
              <div className="totales">
                <div>
                  <span>Productos (estimado)</span>
                  <span className="t-num">{soles(totalFilas)}</span>
                </div>
                <div>
                  <span>Servicio + delivery</span>
                  <span className="t-num">{soles((numero(servicio) || 0) + (numero(delivery) || 0))}</span>
                </div>
                <div>
                  <span>Total estimado para el cliente</span>
                  <span className="t-num">{soles(totalFilas + (numero(servicio) || 0) + (numero(delivery) || 0))}</span>
                </div>
              </div>
              <div className="fila-flex">
                <button type="button" className="boton boton--accion" disabled={ocupado} onClick={() => void cotizar(pedido.id)}>
                  {pedido.estado === "cotizado" ? "Enviar nueva versión" : "Guardar y enviar cotización"}
                </button>
                {pedido.estado === "cotizado" && wsp && (
                  <a className="boton boton--suave" href={wsp} target="_blank" rel="noopener noreferrer">
                    Avisar por WhatsApp
                  </a>
                )}
              </div>
              <p className="t-meta">
                Aquí no se publican condiciones de pago: el adelanto y la forma de pago se coordinan con el cliente por WhatsApp o llamada.
              </p>
            </section>
          )}

          {/* Entrega ------------------------------------------------------------------- */}
          {pedido.recepcion === "domicilio" && ["liquidado", "en_entrega", "entregado"].includes(pedido.estado) && (
            <section className="panel apilado" aria-labelledby="h-ent">
              <h2 id="h-ent" className="t-titulo">
                Entrega a domicilio
              </h2>
              {entrega && (
                <p className="aviso">
                  {NOMBRE_ENTREGA[entrega.estado]}
                  {entrega.entregada_en ? ` el ${fechaHora(entrega.entregada_en)}` : ""}
                  {entrega.nota ? ` · ${entrega.nota}` : ""}
                </p>
              )}
              <div className="fila">
                <div className="campo">
                  <label htmlFor="rep">Quién entrega</label>
                  <select id="rep" value={formEntrega.repartidorId} onChange={(e) => setFormEntrega({ ...formEntrega, repartidorId: e.target.value })}>
                    <option value="">Sin asignar</option>
                    {reps.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.nombre || "Sin nombre"}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="campo">
                  <label htmlFor="vent">Horario</label>
                  <input id="vent" value={formEntrega.ventana} maxLength={80} onChange={(e) => setFormEntrega({ ...formEntrega, ventana: e.target.value })} placeholder="Ej.: mañana de 9 a 11" />
                </div>
              </div>
              {reps.length === 0 && (
                <p className="t-meta">
                  Aún no hay repartidores. Dale ese rol a alguien desde{" "}
                  <Link className="enlace" href="/equipo/">
                    Equipo
                  </Link>
                  ; mientras tanto puedes entregar tú y marcar el pedido como entregado.
                </p>
              )}
              <div className="fila-flex">
                <button
                  type="button"
                  className="boton boton--suave"
                  disabled={ocupado}
                  onClick={() => void correr(() => programarEntrega(pedido.id, formEntrega.repartidorId || null, formEntrega.ventana.trim()), "Entrega guardada.")}
                >
                  Guardar entrega
                </button>
                {entrega && pedido.estado !== "entregado" && (
                  <>
                    {pedido.estado === "liquidado" && (
                      <button type="button" className="boton boton--accion" disabled={ocupado} onClick={() => void correr(() => marcarEntrega(pedido.id, "en_camino", ""), "Salió a entregar.")}>
                        Salió a entregar
                      </button>
                    )}
                    <button type="button" className="boton boton--accion" disabled={ocupado} onClick={() => void correr(() => marcarEntrega(pedido.id, "entregada", ""), "Pedido entregado.")}>
                      Marcar entregada
                    </button>
                  </>
                )}
              </div>
            </section>
          )}

          {/* Compra y cuentas ---------------------------------------------------------- */}
          {hayCompra && (
            <section className="panel apilado" aria-labelledby="h-cuentas">
              <h2 id="h-cuentas" className="t-titulo">
                Cuentas del pedido
              </h2>
              {pendientes > 0 && pedido.estado === "en_compra" && (
                <p className="aviso">
                  Faltan {pendientes} producto{pendientes === 1 ? "" : "s"} por comprar.{" "}
                  <Link className="enlace" href="/comprar/">
                    Ir a Comprar
                  </Link>
                </p>
              )}
              <div className="apilado apilado--chico">
                <h3 className="t-seccion">Productos (dinero del cliente)</h3>
                <div className="totales">
                  <div>
                    <span>Compra real</span>
                    <span className="t-num">{soles(totalReal)}</span>
                  </div>
                  <div>
                    <span>Recibido para productos (menos devoluciones)</span>
                    <span className="t-num">{soles(recibidoProductos)}</span>
                  </div>
                  <div>
                    <span>{saldoProductos >= 0 ? "El cliente aún debe" : "Hay que devolver al cliente"}</span>
                    <span className="t-num">{soles(Math.abs(saldoProductos))}</span>
                  </div>
                </div>
              </div>
              <div className="apilado apilado--chico">
                <h3 className="t-seccion">Servicio y delivery (ingreso del negocio)</h3>
                <div className="totales">
                  <div>
                    <span>Acordado</span>
                    <span className="t-num">{soles(debidoFees)}</span>
                  </div>
                  <div>
                    <span>Cobrado</span>
                    <span className="t-num">{soles(cobradoFees)}</span>
                  </div>
                  <div>
                    <span>{saldoFees > 0 ? "Por cobrar" : "Al día"}</span>
                    <span className="t-num">{soles(Math.max(saldoFees, 0))}</span>
                  </div>
                </div>
              </div>

              <form className="formulario" onSubmit={(e) => void registrarMov(e, pedido.id, pedido.ciudad_id)} noValidate>
                <h3 className="t-seccion">Registrar un movimiento de este pedido</h3>
                <div className="fila">
                  <div className="campo">
                    <label htmlFor="m-tipo">Qué pasó</label>
                    <select
                      id="m-tipo"
                      value={mov.tipo}
                      onChange={(e) => {
                        const tipo = e.target.value as TipoMovimiento;
                        setMov({ ...mov, tipo, monto: mov.monto || sugerirMonto(tipo) });
                      }}
                    >
                      {TIPOS_DEL_PEDIDO.map((t) => (
                        <option key={t} value={t}>
                          {NOMBRE_MOVIMIENTO[t]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="campo">
                    <label htmlFor="m-monto">Monto (S/)</label>
                    <input id="m-monto" inputMode="decimal" value={mov.monto} onChange={(e) => setMov({ ...mov, monto: e.target.value })} />
                  </div>
                  <div className="campo">
                    <label htmlFor="m-fecha">Fecha</label>
                    <input id="m-fecha" type="date" value={mov.fecha} onChange={(e) => setMov({ ...mov, fecha: e.target.value })} />
                  </div>
                </div>
                <div className="campo">
                  <label htmlFor="m-desc">Detalle (opcional)</label>
                  <input id="m-desc" value={mov.descripcion} maxLength={300} onChange={(e) => setMov({ ...mov, descripcion: e.target.value })} />
                </div>
                <button type="submit" className="boton boton--suave" style={{ justifySelf: "start" }} disabled={ocupado}>
                  Registrar
                </button>
              </form>

              {movimientos.length > 0 && (
                <div className="tabla-caja">
                  <table className="tabla">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Movimiento</th>
                        <th className="num">Monto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movimientos.map((m) => (
                        <tr key={m.id}>
                          <td>{fechaCorta(m.fecha)}</td>
                          <td>
                            {NOMBRE_MOVIMIENTO[m.tipo]}
                            {m.descripcion && <div className="t-meta">{m.descripcion}</div>}
                          </td>
                          <td className={`num ${m.entrada ? "entrada" : "salida"}`}>
                            {m.entrada ? "+" : "−"} {soles(m.monto)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}
        </div>

        {/* Columna lateral ---------------------------------------------------------------- */}
        <div className="apilado apilado--grande">
          <section className="panel apilado" aria-labelledby="h-acciones">
            <h2 id="h-acciones" className="t-titulo">
              Qué sigue
            </h2>
            {pedido.estado === "solicitado" && <p className="t-suave">Pon los precios estimados y envía la cotización.</p>}
            {pedido.estado === "cotizado" && <p className="t-suave">Esperando que el cliente apruebe. Si ya te confirmó por teléfono, puedes aprobar por él.</p>}
            {pedido.estado === "cancelado" && <p className="t-suave">Este pedido está cancelado.</p>}
            <div className="apilado apilado--chico">
              {pedido.estado === "cotizado" &&
                (confirmar === "aprobar" ? (
                  <div className="aviso apilado apilado--chico">
                    <p>¿El cliente te confirmó que aprueba la cotización?</p>
                    <div className="fila-flex">
                      <button type="button" className="boton boton--accion boton--chico" disabled={ocupado} onClick={() => void correr(() => aprobarEnNombreDelCliente(pedido.id), "Pedido aprobado.")}>
                        Sí, aprobar
                      </button>
                      <button type="button" className="enlace" onClick={() => setConfirmar(null)}>
                        No
                      </button>
                    </div>
                  </div>
                ) : (
                  <button type="button" className="boton boton--suave" onClick={() => setConfirmar("aprobar")}>
                    Aprobar en nombre del cliente
                  </button>
                ))}
              {(SIGUIENTE[pedido.estado] ?? []).map((s) => (
                <button
                  key={s.a}
                  type="button"
                  className="boton boton--accion"
                  disabled={ocupado || (s.a === "liquidado" && pendientes > 0)}
                  onClick={() => void correr(() => cambiarEstado(pedido.id, s.a), `Pedido: ${NOMBRE_ESTADO[s.a]}.`)}
                >
                  {s.texto}
                </button>
              ))}
              {pedido.estado === "en_compra" && pendientes > 0 && (
                <p className="t-meta">Para cerrar cuentas, cada producto debe estar comprado, cambiado o marcado sin stock.</p>
              )}
              {enMarcha &&
                (confirmar === "cancelar" ? (
                  <div className="aviso aviso--error apilado apilado--chico">
                    <p>¿Cancelar este pedido? No se puede deshacer.</p>
                    <div className="fila-flex">
                      <button type="button" className="boton boton--peligro boton--chico" disabled={ocupado} onClick={() => void correr(() => cancelarPedidoCentral(pedido.id), "Pedido cancelado.")}>
                        Sí, cancelar
                      </button>
                      <button type="button" className="enlace" onClick={() => setConfirmar(null)}>
                        No
                      </button>
                    </div>
                  </div>
                ) : (
                  <button type="button" className="enlace" style={{ justifySelf: "start", color: "var(--error)" }} onClick={() => setConfirmar("cancelar")}>
                    Cancelar pedido
                  </button>
                ))}
            </div>
          </section>

          <section className="panel apilado" aria-labelledby="h-cli">
            <h2 id="h-cli" className="t-titulo">
              Cliente y entrega
            </h2>
            <dl className="datos">
              <dt>Nombre</dt>
              <dd>{hogar?.nombre ?? "—"}</dd>
              <dt>Celular</dt>
              <dd>{hogar?.celular ?? "—"}</dd>
              {hogar?.personas && (
                <>
                  <dt>En casa</dt>
                  <dd>{hogar.personas} personas</dd>
                </>
              )}
              <dt>Recepción</dt>
              <dd>{NOMBRE_RECEPCION[pedido.recepcion]}</dd>
              {direccion && (
                <>
                  <dt>Dirección</dt>
                  <dd>
                    {direccion.direccion}
                    {direccion.referencia ? ` (${direccion.referencia})` : ""}
                    {direccion.zona ? ` · ${direccion.zona}` : ""}
                  </dd>
                </>
              )}
              {pedido.fecha_deseada && (
                <>
                  <dt>Para el</dt>
                  <dd>{fechaCorta(pedido.fecha_deseada)}</dd>
                </>
              )}
              {pedido.notas_cliente && (
                <>
                  <dt>Notas</dt>
                  <dd style={{ whiteSpace: "pre-wrap" }}>{pedido.notas_cliente}</dd>
                </>
              )}
              {hogar?.notas && (
                <>
                  <dt>Del hogar</dt>
                  <dd style={{ whiteSpace: "pre-wrap" }}>{hogar.notas}</dd>
                </>
              )}
            </dl>
            {wsp && (
              <a className="boton boton--suave boton--chico" style={{ justifySelf: "start" }} href={wsp} target="_blank" rel="noopener noreferrer">
                Escribir por WhatsApp
              </a>
            )}
          </section>

          {casa && (casa.caseros.length > 0 || casa.preferencias.length > 0) && (
            <section className="panel apilado" aria-labelledby="h-pref">
              <h2 id="h-pref" className="t-titulo">
                Lo que prefiere este hogar
              </h2>
              {casa.preferencias.length > 0 && (
                <ul className="filas">
                  {casa.preferencias.map((p) => (
                    <li key={p.id}>
                      <strong>{p.producto}</strong>
                      <span className="t-suave">
                        {p.preferencia ? `${p.preferencia} · ` : ""}
                        Si no hay: {NOMBRE_SUSTITUCION[p.sustitucion].toLowerCase()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {casa.caseros.length > 0 && (
                <div className="apilado apilado--chico">
                  <h3 className="t-seccion">Sus caseros de confianza</h3>
                  <ul className="filas">
                    {casa.caseros.map((c) => (
                      <li key={c.id}>
                        <strong>{c.nombre}</strong>
                        <span className="t-suave">{[c.rubro, c.puesto, c.nota].filter(Boolean).join(" · ")}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          {cotizaciones.length > 0 && (
            <section className="panel apilado apilado--chico" aria-labelledby="h-hist">
              <h2 id="h-hist" className="t-titulo">
                Cotizaciones
              </h2>
              <ul className="filas">
                {cotizaciones.map((c) => (
                  <li key={c.id}>
                    <div className="fila-flex fila-flex--entre">
                      <strong>Versión {c.version}</strong>
                      <span className="t-meta">{c.estado}</span>
                    </div>
                    <p className="t-meta t-num">
                      {soles(c.total_productos_estimado)} + servicio {soles(c.tarifa_servicio)} + delivery {soles(c.tarifa_delivery)} · {fechaHora(c.enviada_en)}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="panel apilado" aria-labelledby="h-notas">
            <h2 id="h-notas" className="t-titulo">
              Notas internas
            </h2>
            {notas.length === 0 ? (
              <p className="t-suave">Solo las ve el equipo.</p>
            ) : (
              <ul className="filas">
                {notas.map((n) => (
                  <li key={n.id}>
                    <p style={{ whiteSpace: "pre-wrap" }}>{n.texto}</p>
                    <p className="t-meta">{fechaHora(n.creado_en)}</p>
                  </li>
                ))}
              </ul>
            )}
            <form className="formulario" onSubmit={(e) => void guardarNota(e, pedido.id)}>
              <div className="campo">
                <label htmlFor="nota">Nueva nota</label>
                <textarea id="nota" value={nota} maxLength={1000} onChange={(e) => setNota(e.target.value)} />
              </div>
              <button type="submit" className="boton boton--suave boton--chico" style={{ justifySelf: "start" }} disabled={ocupado || !nota.trim()}>
                Guardar nota
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}

export default function Pagina() {
  return (
    <SoloAdmin>
      <Suspense fallback={<Cargando texto="Abriendo el pedido…" />}>
        <Detalle />
      </Suspense>
    </SoloAdmin>
  );
}
