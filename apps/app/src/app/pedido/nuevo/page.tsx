"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { Illa } from "@illari/ui";
import {
  agregarDireccion,
  catalogo,
  cantidad as formatoCantidad,
  crearPedido,
  direccionesDe,
  mensajeDeError,
  NOMBRE_MODALIDAD,
  type Categoria,
  type Direccion,
  type ItemNuevo,
  type Modalidad,
  type Producto,
  type Recepcion,
  type Sustitucion,
} from "@illari/db";
import { Cargando, ErrorAviso } from "@/componentes/Comunes";
import { useSesion } from "@/componentes/Sesion";

const AYUDA_MODALIDAD: Record<Modalidad, string> = {
  paquete: "Un combo ya armado, listo para pedir.",
  lista: "Tú escribes qué quieres y nosotras lo compramos.",
  delegada: "Nos cuentas la idea (por ejemplo, el menú de la semana) y armamos la compra.",
  caseros: "Compramos donde tú ya compras, con tus caseros de confianza.",
};

const SUSTITUCION: { id: Sustitucion; nombre: string }[] = [
  { id: "consultar", nombre: "Consultarme antes" },
  { id: "similar", nombre: "Cambiar por algo similar" },
  { id: "omitir", nombre: "Mejor no llevarlo" },
];

const UNIDADES = ["kg", "unidad", "docena", "atado", "litro", "bolsa"];

type ItemEnEdicion = ItemNuevo & { clave: string };

export default function NuevoPedido() {
  const { perfil, hogar } = useSesion();
  const router = useRouter();
  const sinMovimiento = useReducedMotion();

  const [paso, setPaso] = useState(0);
  const [modalidad, setModalidad] = useState<Modalidad | null>(null);
  const [items, setItems] = useState<ItemEnEdicion[]>([]);
  const [recepcion, setRecepcion] = useState<Recepcion>("domicilio");
  const [direcciones, setDirecciones] = useState<Direccion[] | null>(null);
  const [direccionId, setDireccionId] = useState<string>("");
  const [fecha, setFecha] = useState("");
  const [notas, setNotas] = useState("");
  const [cat, setCat] = useState<{ categorias: Categoria[]; productos: Producto[] } | null>(null);
  const [categoriaActiva, setCategoriaActiva] = useState<number | null>(null);
  const [libre, setLibre] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [listo, setListo] = useState<{ id: string; numero: number } | null>(null);
  const [nuevaDir, setNuevaDir] = useState({ etiqueta: "Casa", direccion: "", referencia: "", zona: "" });
  const [agregandoDir, setAgregandoDir] = useState(false);

  useEffect(() => {
    let vivo = true;
    Promise.all([catalogo(), direccionesDe(hogar.id)])
      .then(([c, d]) => {
        if (!vivo) return;
        setCat(c);
        setDirecciones(d);
        if (d[0]) setDireccionId(d[0].id);
        setCategoriaActiva(c.categorias[0]?.id ?? null);
      })
      .catch((e) => vivo && setError(mensajeDeError(e)));
    return () => {
      vivo = false;
    };
  }, [hogar.id]);

  // "Paquete o combo" se suma aquí cuando haya paquetes publicados y su selector.
  const modalidades: Modalidad[] = ["lista", "delegada", "caseros"];

  const productosVisibles = useMemo(
    () => (cat?.productos ?? []).filter((p) => p.categoria_id === categoriaActiva),
    [cat, categoriaActiva],
  );

  function agregarProducto(p: Producto) {
    setItems((prev) => {
      const ya = prev.find((i) => i.productoId === p.id);
      if (ya) return prev.map((i) => (i.clave === ya.clave ? { ...i, cantidad: i.cantidad + 1 } : i));
      return [
        ...prev,
        { clave: crypto.randomUUID(), productoId: p.id, descripcion: p.nombre, cantidad: 1, unidad: p.unidad_defecto, sustitucion: "consultar" },
      ];
    });
  }

  function agregarLibre() {
    const texto = libre.trim();
    if (!texto) return;
    setItems((prev) => [...prev, { clave: crypto.randomUUID(), descripcion: texto, cantidad: 1, unidad: "unidad", sustitucion: "consultar" }]);
    setLibre("");
  }

  function cambiar(clave: string, cambio: Partial<ItemEnEdicion>) {
    setItems((prev) => prev.map((i) => (i.clave === clave ? { ...i, ...cambio } : i)));
  }

  function quitar(clave: string) {
    setItems((prev) => prev.filter((i) => i.clave !== clave));
  }

  function validarPaso(): string | null {
    if (paso === 0 && !modalidad) return "Elige cómo quieres comprar.";
    if (paso === 1) {
      if (modalidad === "delegada") {
        if (items.length === 0 && notas.trim().length < 5) return "Cuéntanos qué necesitas, aunque sea con pocas palabras.";
      } else if (items.length === 0) return "Agrega al menos un producto.";
      if (items.some((i) => !(i.cantidad > 0))) return "Revisa las cantidades: deben ser mayores que cero.";
    }
    if (paso === 2 && recepcion === "domicilio" && !direccionId) return "Elige o agrega la dirección de entrega.";
    return null;
  }

  function siguiente() {
    const problema = validarPaso();
    setError(problema);
    if (!problema) setPaso((p) => Math.min(2, p + 1));
  }

  async function guardarDireccion() {
    setError(null);
    if (nuevaDir.direccion.trim().length < 5) return setError("Escribe la dirección completa.");
    try {
      const d = await agregarDireccion(hogar.id, {
        etiqueta: nuevaDir.etiqueta.trim() || "Casa",
        direccion: nuevaDir.direccion.trim(),
        referencia: nuevaDir.referencia.trim(),
        zona: nuevaDir.zona.trim(),
      });
      setDirecciones((prev) => [...(prev ?? []), d]);
      setDireccionId(d.id);
      setAgregandoDir(false);
      setNuevaDir({ etiqueta: "Casa", direccion: "", referencia: "", zona: "" });
    } catch (e) {
      setError(mensajeDeError(e));
    }
  }

  async function enviar() {
    const problema = validarPaso();
    if (problema || !modalidad) return setError(problema);
    setEnviando(true);
    setError(null);
    try {
      const pedido = await crearPedido({
        ciudadId: perfil.ciudad_id,
        hogarId: hogar.id,
        modalidad,
        recepcion,
        direccionId: direccionId || null,
        fechaDeseada: fecha || null,
        notas: notas.trim(),
        items: items.map(({ clave: _clave, ...i }) => i),
      });
      setListo({ id: pedido.id, numero: pedido.numero });
    } catch (e) {
      setError(mensajeDeError(e));
    } finally {
      setEnviando(false);
    }
  }

  if (listo) {
    return (
      <div className="apilado apilado--grande" style={{ justifyItems: "center", textAlign: "center", paddingTop: "var(--e-6)" }}>
        <Illa gesto="celebra" style={{ width: "10rem", height: "auto" }} />
        <p className="t-mano" style={{ fontSize: "2.75rem" }}>
          ¡Listo!
        </p>
        <p className="t-titulo">Recibimos tu pedido #{listo.numero}</p>
        <p className="t-suave" style={{ maxWidth: "26rem" }}>
          Te escribiremos pronto con la cotización para que la revises. No compramos nada hasta que tú la apruebes.
        </p>
        <div className="fila-flex" style={{ justifyContent: "center" }}>
          <button type="button" className="boton boton--accion" onClick={() => router.push(`/pedido/?id=${listo.id}`)}>
            Ver mi pedido
          </button>
          <Link href="/" className="boton boton--borde">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  if (!cat || !direcciones) {
    return error ? <ErrorAviso mensaje={error} /> : <Cargando texto="Preparando tu pedido…" />;
  }

  const variantes = sinMovimiento
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : { initial: { opacity: 0, x: 24 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -24 } };

  return (
    <div className="apilado apilado--grande">
      <div className="apilado apilado--chico">
        <div className="progreso" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span key={i} data-listo={i <= paso} />
          ))}
        </div>
        <p className="t-meta">Paso {paso + 1} de 3</p>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={paso} {...variantes} transition={{ duration: sinMovimiento ? 0.01 : 0.2, ease: [0.16, 1, 0.3, 1] }}>
          {paso === 0 && (
            <fieldset className="apilado">
              <legend className="t-pagina" style={{ marginBottom: "var(--e-4)" }}>
                ¿Cómo quieres comprar?
              </legend>
              <div className="opciones">
                {modalidades.map((m) => (
                  <label key={m} className="opcion">
                    <input type="radio" name="modalidad" value={m} checked={modalidad === m} onChange={() => setModalidad(m)} />
                    <span>
                      <strong>{NOMBRE_MODALIDAD[m]}</strong>
                      <span>{AYUDA_MODALIDAD[m]}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {paso === 1 && (
            <div className="apilado apilado--grande">
              <h1 className="t-pagina">{modalidad === "delegada" ? "Cuéntanos qué necesitas" : "¿Qué te traemos?"}</h1>

              {modalidad === "delegada" && (
                <div className="campo">
                  <label htmlFor="notas-delegada">Tu idea</label>
                  <textarea
                    id="notas-delegada"
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    placeholder="Por ejemplo: para 4 personas, sopa y un guiso; fruta para la semana."
                  />
                  <span className="campo__ayuda">También puedes agregar productos abajo si ya sabes algunos.</span>
                </div>
              )}

              <section className="producto-buscador" aria-label="Catálogo">
                <div className="chips" role="group" aria-label="Categorías">
                  {cat.categorias.map((c) => (
                    <button key={c.id} type="button" className="chip" aria-pressed={categoriaActiva === c.id} onClick={() => setCategoriaActiva(c.id)}>
                      {c.nombre}
                    </button>
                  ))}
                </div>
                <div className="chips" role="group" aria-label="Productos">
                  {productosVisibles.map((p) => (
                    <button key={p.id} type="button" className="chip" onClick={() => agregarProducto(p)}>
                      + {p.nombre}
                    </button>
                  ))}
                </div>
                <div className="campo">
                  <label htmlFor="libre">¿No lo ves? Escríbelo</label>
                  <div className="fila-flex" style={{ flexWrap: "nowrap" }}>
                    <input
                      id="libre"
                      value={libre}
                      onChange={(e) => setLibre(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          agregarLibre();
                        }
                      }}
                      placeholder="Ej.: palta fuerte, queso fresco…"
                      style={{ flex: 1, minWidth: 0 }}
                    />
                    <button type="button" className="boton boton--suave" onClick={agregarLibre}>
                      Agregar
                    </button>
                  </div>
                </div>
              </section>

              {items.length > 0 && (
                <section className="apilado apilado--chico" aria-label="Tu lista">
                  <h2 className="t-titulo">Tu lista ({items.length})</h2>
                  {items.map((it) => (
                    <div key={it.clave} className="item-fila">
                      <div className="item-fila__arriba">
                        <span className="item-fila__nombre">{it.descripcion}</span>
                        <button type="button" className="enlace" onClick={() => quitar(it.clave)} aria-label={`Quitar ${it.descripcion}`}>
                          Quitar
                        </button>
                      </div>
                      <div className="fila">
                        <div className="campo">
                          <span className="campo__titulo">Cantidad</span>
                          <div className="fila-flex" style={{ flexWrap: "nowrap" }}>
                            <span className="contador">
                              <button type="button" aria-label="Menos" onClick={() => cambiar(it.clave, { cantidad: Math.max(0.5, it.cantidad - (it.unidad === "kg" ? 0.5 : 1)) })}>
                                −
                              </button>
                              <input
                                aria-label={`Cantidad de ${it.descripcion}`}
                                inputMode="decimal"
                                value={String(it.cantidad)}
                                onChange={(e) => {
                                  const n = Number(e.target.value.replace(",", "."));
                                  if (!Number.isNaN(n)) cambiar(it.clave, { cantidad: n });
                                }}
                              />
                              <button type="button" aria-label="Más" onClick={() => cambiar(it.clave, { cantidad: it.cantidad + (it.unidad === "kg" ? 0.5 : 1) })}>
                                +
                              </button>
                            </span>
                            <select aria-label="Unidad" value={it.unidad} onChange={(e) => cambiar(it.clave, { unidad: e.target.value })} style={{ minWidth: 0 }}>
                              {(UNIDADES.includes(it.unidad) ? UNIDADES : [...UNIDADES, it.unidad]).map((u) => (
                                <option key={u}>{u}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="campo">
                          <label htmlFor={`sust-${it.clave}`}>Si no hay</label>
                          <select id={`sust-${it.clave}`} value={it.sustitucion} onChange={(e) => cambiar(it.clave, { sustitucion: e.target.value as Sustitucion })}>
                            {SUSTITUCION.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.nombre}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="fila">
                        <div className="campo">
                          <label htmlFor={`pref-${it.clave}`}>Cómo lo quieres (opcional)</label>
                          <input
                            id={`pref-${it.clave}`}
                            value={it.preferencia ?? ""}
                            maxLength={200}
                            onChange={(e) => cambiar(it.clave, { preferencia: e.target.value })}
                            placeholder="Ej.: maduras para hoy"
                          />
                        </div>
                        {modalidad === "caseros" && (
                          <div className="campo">
                            <label htmlFor={`cas-${it.clave}`}>Casero o puesto</label>
                            <input id={`cas-${it.clave}`} value={it.casero ?? ""} maxLength={80} onChange={(e) => cambiar(it.clave, { casero: e.target.value })} placeholder="Ej.: doña Rosa" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </section>
              )}
            </div>
          )}

          {paso === 2 && (
            <div className="apilado apilado--grande">
              <h1 className="t-pagina">¿Cómo lo recibes?</h1>

              <fieldset className="opciones">
                <legend className="solo-lectores">Forma de recepción</legend>
                <label className="opcion">
                  <input type="radio" name="recepcion" checked={recepcion === "domicilio"} onChange={() => setRecepcion("domicilio")} />
                  <span>
                    <strong>En mi casa</strong>
                    <span>Te lo llevamos a tu domicilio, en Tacna.</span>
                  </span>
                </label>
                <label className="opcion">
                  <input type="radio" name="recepcion" checked={recepcion === "recojo"} onChange={() => setRecepcion("recojo")} />
                  <span>
                    <strong>Lo recojo en el mercado</strong>
                    <span>Coordinamos contigo dónde y a qué hora en el Mercado Grau.</span>
                  </span>
                </label>
              </fieldset>

              {recepcion === "domicilio" && (
                <section className="apilado apilado--chico" aria-label="Dirección">
                  {direcciones.length > 0 && (
                    <div className="opciones">
                      {direcciones.map((d) => (
                        <label key={d.id} className="opcion">
                          <input type="radio" name="direccion" checked={direccionId === d.id} onChange={() => setDireccionId(d.id)} />
                          <span>
                            <strong>{d.etiqueta}</strong>
                            <span>
                              {d.direccion}
                              {d.referencia ? ` · ${d.referencia}` : ""}
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                  {agregandoDir || direcciones.length === 0 ? (
                    <div className="superficie apilado">
                      <h2 className="t-seccion">Nueva dirección</h2>
                      <div className="campo">
                        <label htmlFor="d-etiqueta">Nombre</label>
                        <input id="d-etiqueta" value={nuevaDir.etiqueta} onChange={(e) => setNuevaDir({ ...nuevaDir, etiqueta: e.target.value })} />
                      </div>
                      <div className="campo">
                        <label htmlFor="d-dir">Dirección</label>
                        <input id="d-dir" value={nuevaDir.direccion} onChange={(e) => setNuevaDir({ ...nuevaDir, direccion: e.target.value })} autoComplete="street-address" />
                      </div>
                      <div className="fila">
                        <div className="campo">
                          <label htmlFor="d-ref">Referencia</label>
                          <input id="d-ref" value={nuevaDir.referencia} onChange={(e) => setNuevaDir({ ...nuevaDir, referencia: e.target.value })} placeholder="Ej.: portón verde" />
                        </div>
                        <div className="campo">
                          <label htmlFor="d-zona">Zona o distrito</label>
                          <input id="d-zona" value={nuevaDir.zona} onChange={(e) => setNuevaDir({ ...nuevaDir, zona: e.target.value })} />
                        </div>
                      </div>
                      <div className="fila-flex">
                        <button type="button" className="boton boton--suave" onClick={() => void guardarDireccion()}>
                          Guardar dirección
                        </button>
                        {direcciones.length > 0 && (
                          <button type="button" className="enlace" onClick={() => setAgregandoDir(false)}>
                            Cancelar
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <button type="button" className="enlace" style={{ justifySelf: "start" }} onClick={() => setAgregandoDir(true)}>
                      + Agregar otra dirección
                    </button>
                  )}
                </section>
              )}

              <div className="fila">
                <div className="campo">
                  <label htmlFor="fecha">¿Para cuándo lo necesitas?</label>
                  <input id="fecha" type="date" value={fecha} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setFecha(e.target.value)} />
                  <span className="campo__ayuda">Opcional. Lo coordinamos contigo.</span>
                </div>
              </div>

              {modalidad !== "delegada" && (
                <div className="campo">
                  <label htmlFor="notas">¿Algo más que debamos saber?</label>
                  <textarea id="notas" value={notas} maxLength={1200} onChange={(e) => setNotas(e.target.value)} placeholder="Horarios, alergias, cosas que no te gustan…" />
                </div>
              )}

              <section className="superficie superficie--calida apilado apilado--chico" aria-label="Resumen">
                <h2 className="t-seccion">Tu pedido</h2>
                <p className="t-suave">{modalidad ? NOMBRE_MODALIDAD[modalidad] : ""}</p>
                {items.length > 0 ? (
                  <ul className="resumen">
                    {items.map((i) => (
                      <li key={i.clave}>
                        <span>{i.descripcion}</span>
                        <span className="t-num">
                          {formatoCantidad(i.cantidad)} {i.unidad}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="t-suave">Sin lista: lo armamos según lo que nos contaste.</p>
                )}
                <p className="t-meta">No pagas nada ahora: primero te enviamos la cotización y tú decides.</p>
              </section>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <ErrorAviso mensaje={error} />

      <div className="fila-flex fila-flex--entre">
        {paso > 0 ? (
          <button type="button" className="boton boton--borde" onClick={() => { setError(null); setPaso(paso - 1); }} disabled={enviando}>
            Atrás
          </button>
        ) : (
          <Link href="/" className="boton boton--borde">
            Cancelar
          </Link>
        )}
        {paso < 2 ? (
          <button type="button" className="boton boton--accion" onClick={siguiente}>
            Siguiente
          </button>
        ) : (
          <button type="button" className="boton boton--accion boton--grande" onClick={() => void enviar()} disabled={enviando}>
            {enviando ? "Enviando…" : "Enviar mi pedido"}
          </button>
        )}
      </div>
    </div>
  );
}
