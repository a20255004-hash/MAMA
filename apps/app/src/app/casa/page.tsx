"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  actualizarPerfil,
  agregarDireccion,
  borrarDireccion,
  direccionesDe,
  guardarHogar,
  mensajeDeError,
  type Direccion,
} from "@illari/db";
import { ErrorAviso } from "@/componentes/Comunes";
import { useSesion } from "@/componentes/Sesion";

function normalizarCelular(v: string): string {
  return v.replace(/\D/g, "").replace(/^51(?=9\d{8}$)/, "");
}

export default function MiCasa() {
  const { perfil, hogar, refrescar, cerrarSesion } = useSesion();
  const [direcciones, setDirecciones] = useState<Direccion[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [nueva, setNueva] = useState({ etiqueta: "", direccion: "", referencia: "", zona: "" });

  useEffect(() => {
    let vivo = true;
    direccionesDe(hogar.id)
      .then((d) => vivo && setDirecciones(d))
      .catch((e) => vivo && setError(mensajeDeError(e)));
    return () => {
      vivo = false;
    };
  }, [hogar.id]);

  async function guardar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setGuardado(false);
    const f = new FormData(e.currentTarget);
    const nombre = String(f.get("nombre") ?? "").trim();
    const celular = normalizarCelular(String(f.get("celular") ?? ""));
    const personasTexto = String(f.get("personas") ?? "").trim();
    const personas = personasTexto ? Number(personasTexto) : null;
    if (nombre.length < 2) return setError("Dinos cómo te llamas.");
    if (!/^9\d{8}$/.test(celular)) return setError("Revisa tu celular: son 9 dígitos y empieza con 9.");
    if (personas !== null && (!Number.isInteger(personas) || personas < 1 || personas > 30)) {
      return setError("Las personas en casa deben ser un número entre 1 y 30.");
    }
    setOcupado(true);
    try {
      await actualizarPerfil(perfil.id, { nombre, celular });
      await guardarHogar(hogar.id, { nombre, celular, personas, notas: String(f.get("notas") ?? "").trim() });
      await refrescar();
      setGuardado(true);
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setOcupado(false);
    }
  }

  async function agregar(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (nueva.direccion.trim().length < 5) return setError("Escribe la dirección completa.");
    try {
      const d = await agregarDireccion(hogar.id, {
        etiqueta: nueva.etiqueta.trim() || "Casa",
        direccion: nueva.direccion.trim(),
        referencia: nueva.referencia.trim(),
        zona: nueva.zona.trim(),
      });
      setDirecciones((prev) => [...(prev ?? []), d]);
      setNueva({ etiqueta: "", direccion: "", referencia: "", zona: "" });
    } catch (err) {
      setError(mensajeDeError(err));
    }
  }

  async function quitar(id: string) {
    setError(null);
    try {
      await borrarDireccion(id);
      setDirecciones((prev) => (prev ?? []).filter((d) => d.id !== id));
    } catch (err) {
      setError(mensajeDeError(err));
    }
  }

  return (
    <div className="apilado apilado--grande">
      <h1 className="t-pagina">Mi casa</h1>
      <p className="t-suave">Mientras mejor te conozcamos, mejor compramos para ti.</p>

      <form className="formulario" onSubmit={guardar} noValidate key={hogar.id + hogar.nombre}>
        <div className="fila">
          <div className="campo">
            <label htmlFor="nombre">Tu nombre</label>
            <input id="nombre" name="nombre" defaultValue={hogar.nombre} autoComplete="name" />
          </div>
          <div className="campo">
            <label htmlFor="celular">Celular</label>
            <input id="celular" name="celular" type="tel" inputMode="numeric" defaultValue={hogar.celular ?? ""} autoComplete="tel" />
          </div>
        </div>
        <div className="campo">
          <label htmlFor="personas">¿Cuántas personas son en casa?</label>
          <input id="personas" name="personas" type="number" inputMode="numeric" min={1} max={30} defaultValue={hogar.personas ?? ""} style={{ maxWidth: "8rem" }} />
        </div>
        <div className="campo">
          <label htmlFor="notas">Lo que debemos tener en cuenta</label>
          <textarea id="notas" name="notas" maxLength={600} defaultValue={hogar.notas} placeholder="Alergias, lo que no les gusta, cómo prefieren la fruta…" />
        </div>
        <ErrorAviso mensaje={error} />
        {guardado && (
          <p className="aviso aviso--bien" role="status">
            Guardado. ¡Gracias!
          </p>
        )}
        <button type="submit" className="boton boton--accion" disabled={ocupado} style={{ justifySelf: "start" }}>
          {ocupado ? "Guardando…" : "Guardar cambios"}
        </button>
      </form>

      <hr className="separador" />

      <section className="apilado" aria-labelledby="h-dir">
        <h2 id="h-dir" className="t-titulo">
          Direcciones de entrega
        </h2>
        {direcciones === null ? (
          <p className="t-suave">Cargando…</p>
        ) : direcciones.length === 0 ? (
          <p className="t-suave">Aún no guardaste ninguna.</p>
        ) : (
          <ul className="filas">
            {direcciones.map((d) => (
              <li key={d.id}>
                <div className="fila-flex fila-flex--entre">
                  <div>
                    <p style={{ fontWeight: 600 }}>{d.etiqueta}</p>
                    <p className="t-suave">
                      {d.direccion}
                      {d.referencia ? ` · ${d.referencia}` : ""}
                      {d.zona ? ` · ${d.zona}` : ""}
                    </p>
                  </div>
                  <button type="button" className="enlace" onClick={() => void quitar(d.id)} aria-label={`Quitar la dirección ${d.etiqueta}`}>
                    Quitar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <form className="superficie formulario" onSubmit={agregar} noValidate>
          <h3 className="t-seccion">Agregar una dirección</h3>
          <div className="fila">
            <div className="campo">
              <label htmlFor="n-etiqueta">Nombre</label>
              <input id="n-etiqueta" value={nueva.etiqueta} onChange={(e) => setNueva({ ...nueva, etiqueta: e.target.value })} placeholder="Casa, trabajo…" />
            </div>
            <div className="campo">
              <label htmlFor="n-zona">Zona o distrito</label>
              <input id="n-zona" value={nueva.zona} onChange={(e) => setNueva({ ...nueva, zona: e.target.value })} />
            </div>
          </div>
          <div className="campo">
            <label htmlFor="n-dir">Dirección</label>
            <input id="n-dir" value={nueva.direccion} onChange={(e) => setNueva({ ...nueva, direccion: e.target.value })} autoComplete="street-address" />
          </div>
          <div className="campo">
            <label htmlFor="n-ref">Referencia</label>
            <input id="n-ref" value={nueva.referencia} onChange={(e) => setNueva({ ...nueva, referencia: e.target.value })} placeholder="Ej.: portón verde, frente al parque" />
          </div>
          <button type="submit" className="boton boton--suave" style={{ justifySelf: "start" }}>
            Guardar dirección
          </button>
        </form>
      </section>

      <hr className="separador" />

      <section className="apilado apilado--chico" aria-labelledby="h-cuenta">
        <h2 id="h-cuenta" className="t-titulo">
          Mi cuenta
        </h2>
        <button type="button" className="boton boton--borde" style={{ justifySelf: "start" }} onClick={() => void cerrarSesion()}>
          Cerrar sesión
        </button>
      </section>
    </div>
  );
}
