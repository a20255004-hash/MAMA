"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { borrarPaquete, guardarPaquete, mensajeDeError, paquetesAdmin, type PaqueteFila } from "@illari/db";
import { Cabeza, Cargando, ErrorAviso, Vacio } from "@/componentes/Comunes";
import { SoloAdmin } from "@/componentes/Guardia";
import { useSesion } from "@/componentes/Sesion";

type Borrador = { id?: string; nombre: string; paraQuien: string; descripcion: string; contenido: string; publicado: boolean; orden: string };

const VACIO: Borrador = { nombre: "", paraQuien: "", descripcion: "", contenido: "", publicado: false, orden: "0" };

function Paquetes() {
  const { perfil } = useSesion();
  const [lista, setLista] = useState<PaqueteFila[] | null>(null);
  const [edit, setEdit] = useState<Borrador | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const cargar = useCallback(async () => {
    try {
      setLista(await paquetesAdmin());
    } catch (e) {
      setError(mensajeDeError(e));
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  async function correr(f: () => Promise<void>, ok?: string) {
    setOcupado(true);
    setError(null);
    setAviso(null);
    try {
      await f();
      await cargar();
      if (ok) setAviso(ok);
    } catch (e) {
      setError(mensajeDeError(e));
    } finally {
      setOcupado(false);
    }
  }

  async function guardar(e: FormEvent) {
    e.preventDefault();
    if (!edit) return;
    if (edit.nombre.trim().length < 2) return setError("Ponle un nombre al paquete.");
    const contenido = edit.contenido
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (edit.publicado && contenido.length === 0) return setError("Para publicarlo, escribe qué trae el paquete.");
    await correr(async () => {
      await guardarPaquete({
        id: edit.id,
        ciudadId: perfil.ciudad_id,
        nombre: edit.nombre.trim(),
        paraQuien: edit.paraQuien.trim(),
        descripcion: edit.descripcion.trim(),
        contenido,
        publicado: edit.publicado,
        orden: Number(edit.orden) || 0,
      });
      setEdit(null);
    }, "Paquete guardado.");
  }

  if (!lista) return error ? <ErrorAviso mensaje={error} /> : <Cargando texto="Abriendo los paquetes…" />;

  return (
    <div className="apilado apilado--grande">
      <Cabeza titulo="Paquetes">
        {!edit && (
          <button type="button" className="boton boton--accion boton--chico" onClick={() => setEdit({ ...VACIO, orden: String(lista.length + 1) })}>
            Nuevo paquete
          </button>
        )}
      </Cabeza>
      <p className="aviso">
        Los paquetes publicados aparecen en la página y en la app. Aquí no llevan precio: cada pedido se cotiza con los precios del
        día.
      </p>
      <ErrorAviso mensaje={error} />
      {aviso && (
        <p className="aviso aviso--bien" role="status">
          {aviso}
        </p>
      )}

      {edit && (
        <form className="panel formulario" onSubmit={guardar} noValidate>
          <h2 className="t-titulo">{edit.id ? "Editar paquete" : "Nuevo paquete"}</h2>
          <div className="campo">
            <label htmlFor="p-nombre">Nombre</label>
            <input id="p-nombre" value={edit.nombre} maxLength={80} onChange={(e) => setEdit({ ...edit, nombre: e.target.value })} />
          </div>
          <div className="campo">
            <label htmlFor="p-para">Para quién es</label>
            <input id="p-para" value={edit.paraQuien} maxLength={140} onChange={(e) => setEdit({ ...edit, paraQuien: e.target.value })} placeholder="Ej.: una familia de 4 personas" />
          </div>
          <div className="campo">
            <label htmlFor="p-desc">Descripción</label>
            <textarea id="p-desc" value={edit.descripcion} maxLength={400} onChange={(e) => setEdit({ ...edit, descripcion: e.target.value })} />
          </div>
          <div className="campo">
            <label htmlFor="p-cont">Qué trae (una línea por producto)</label>
            <textarea id="p-cont" value={edit.contenido} onChange={(e) => setEdit({ ...edit, contenido: e.target.value })} placeholder={"2 kg de papa\n1 kg de tomate\n1 pollo entero"} style={{ minHeight: "9rem" }} />
          </div>
          <div className="fila">
            <div className="campo">
              <label htmlFor="p-orden">Orden</label>
              <input id="p-orden" inputMode="numeric" value={edit.orden} onChange={(e) => setEdit({ ...edit, orden: e.target.value })} />
            </div>
          </div>
          <label className="fila-flex" style={{ flexWrap: "nowrap", alignItems: "flex-start" }}>
            <input type="checkbox" checked={edit.publicado} onChange={(e) => setEdit({ ...edit, publicado: e.target.checked })} style={{ marginTop: "0.35rem", accentColor: "var(--accion)" }} />
            <span>Publicar (que lo vean los clientes)</span>
          </label>
          <div className="fila-flex">
            <button type="submit" className="boton boton--accion" disabled={ocupado}>
              Guardar
            </button>
            <button type="button" className="enlace" onClick={() => setEdit(null)}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {lista.length === 0 && !edit && (
        <Vacio titulo="Todavía no hay paquetes">
          <p>Crea el primero cuando tengas su contenido definido.</p>
        </Vacio>
      )}

      <ul className="apilado">
        {lista.map((p) => (
          <li key={p.id} className="panel apilado apilado--chico">
            <div className="fila-flex fila-flex--entre">
              <h2 className="t-seccion">{p.nombre}</h2>
              <span className={`etiqueta ${p.publicado ? "etiqueta--entregado" : ""}`}>{p.publicado ? "Publicado" : "Borrador"}</span>
            </div>
            {p.para_quien && <p className="t-suave">{p.para_quien}</p>}
            {p.descripcion && <p>{p.descripcion}</p>}
            {p.contenido.length > 0 && (
              <ul className="filas">
                {p.contenido.map((c, i) => (
                  <li key={`${c}-${i}`}>{c}</li>
                ))}
              </ul>
            )}
            <div className="fila-flex">
              <button
                type="button"
                className="boton boton--suave boton--chico"
                onClick={() => setEdit({ id: p.id, nombre: p.nombre, paraQuien: p.para_quien, descripcion: p.descripcion, contenido: p.contenido.join("\n"), publicado: p.publicado, orden: String(p.orden) })}
              >
                Editar
              </button>
              <button
                type="button"
                className="boton boton--borde boton--chico"
                disabled={ocupado || (!p.publicado && p.contenido.length === 0)}
                onClick={() =>
                  void correr(
                    () => guardarPaquete({ id: p.id, ciudadId: p.ciudad_id, nombre: p.nombre, paraQuien: p.para_quien, descripcion: p.descripcion, contenido: p.contenido, publicado: !p.publicado, orden: p.orden }),
                    p.publicado ? "Paquete oculto." : "Paquete publicado.",
                  )
                }
              >
                {p.publicado ? "Ocultar" : "Publicar"}
              </button>
              <button
                type="button"
                className="enlace"
                style={{ color: "var(--error)" }}
                disabled={ocupado}
                onClick={() => {
                  if (window.confirm(`¿Borrar el paquete "${p.nombre}"? No se puede deshacer.`)) void correr(() => borrarPaquete(p.id), "Paquete borrado.");
                }}
              >
                Borrar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Pagina() {
  return (
    <SoloAdmin>
      <Paquetes />
    </SoloAdmin>
  );
}
