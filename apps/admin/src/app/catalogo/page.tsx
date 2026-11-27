"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { activarProducto, catalogoCompleto, crearProducto, mensajeDeError, type Categoria, type Producto } from "@illari/db";
import { Cabeza, Cargando, ErrorAviso } from "@/componentes/Comunes";
import { SoloAdmin } from "@/componentes/Guardia";

const UNIDADES = ["kg", "unidad", "docena", "atado", "litro", "bolsa"];

function Catalogo() {
  const [cat, setCat] = useState<{ categorias: Categoria[]; productos: Producto[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nuevo, setNuevo] = useState({ categoriaId: "", nombre: "", unidad: "kg" });
  const [ocupado, setOcupado] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const c = await catalogoCompleto();
      setCat(c);
      setNuevo((n) => (n.categoriaId ? n : { ...n, categoriaId: String(c.categorias[0]?.id ?? "") }));
    } catch (e) {
      setError(mensajeDeError(e));
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  async function agregar(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (nuevo.nombre.trim().length < 2) return setError("Escribe el nombre del producto.");
    setOcupado(true);
    try {
      await crearProducto({ categoriaId: Number(nuevo.categoriaId), nombre: nuevo.nombre.trim(), unidad: nuevo.unidad });
      setNuevo({ ...nuevo, nombre: "" });
      await cargar();
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setOcupado(false);
    }
  }

  async function alternar(p: Producto) {
    setError(null);
    try {
      await activarProducto(p.id, !p.activo);
      await cargar();
    } catch (err) {
      setError(mensajeDeError(err));
    }
  }

  if (!cat) return error ? <ErrorAviso mensaje={error} /> : <Cargando texto="Abriendo el catálogo…" />;

  return (
    <div className="apilado apilado--grande">
      <Cabeza titulo="Catálogo" />
      <p className="aviso">
        Es solo una lista de ayuda para que los clientes escojan rápido: Illari no guarda existencias ni precios fijos. Los
        precios se ponen en cada cotización, con los del día.
      </p>
      <ErrorAviso mensaje={error} />

      <form className="panel formulario" onSubmit={agregar} noValidate>
        <h2 className="t-titulo">Agregar un producto</h2>
        <div className="fila">
          <div className="campo">
            <label htmlFor="cat">Categoría</label>
            <select id="cat" value={nuevo.categoriaId} onChange={(e) => setNuevo({ ...nuevo, categoriaId: e.target.value })}>
              {cat.categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="campo">
            <label htmlFor="nom">Nombre</label>
            <input id="nom" value={nuevo.nombre} maxLength={80} onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} />
          </div>
          <div className="campo">
            <label htmlFor="uni">Se pide por</label>
            <select id="uni" value={nuevo.unidad} onChange={(e) => setNuevo({ ...nuevo, unidad: e.target.value })}>
              {UNIDADES.map((u) => (
                <option key={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>
        <button type="submit" className="boton boton--accion" style={{ justifySelf: "start" }} disabled={ocupado}>
          Agregar
        </button>
      </form>

      {cat.categorias.map((c) => {
        const productos = cat.productos.filter((p) => p.categoria_id === c.id);
        return (
          <section key={c.id} className="apilado apilado--chico" aria-labelledby={`c-${c.id}`}>
            <h2 id={`c-${c.id}`} className="t-titulo">
              {c.nombre}
            </h2>
            {productos.length === 0 ? (
              <p className="t-suave">Sin productos.</p>
            ) : (
              <div className="panel">
                <ul className="filas">
                  {productos.map((p) => (
                    <li key={p.id}>
                      <div className="fila-flex fila-flex--entre">
                        <span style={{ opacity: p.activo ? 1 : 0.55 }}>
                          {p.nombre} <span className="t-meta">· por {p.unidad_defecto}</span>
                        </span>
                        <button type="button" className="enlace" onClick={() => void alternar(p)}>
                          {p.activo ? "Ocultar" : "Mostrar"}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

export default function Pagina() {
  return (
    <SoloAdmin>
      <Catalogo />
    </SoloAdmin>
  );
}
