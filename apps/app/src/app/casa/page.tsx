"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  actualizarPerfil,
  agregarCasero,
  agregarDireccion,
  agregarPreferencia,
  borrarCasero,
  borrarDireccion,
  borrarPreferencia,
  cuentaDeHogar,
  direccionesDe,
  guardarHogar,
  mensajeDeError,
  NOMBRE_SUSTITUCION,
  type CaseroHogar,
  type Direccion,
  type PreferenciaHogar,
  type Sustitucion,
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

  const [caseros, setCaseros] = useState<CaseroHogar[] | null>(null);
  const [prefs, setPrefs] = useState<PreferenciaHogar[] | null>(null);
  const [nuevoCasero, setNuevoCasero] = useState({ rubro: "", nombre: "", puesto: "", nota: "" });
  const [nuevaPref, setNuevaPref] = useState({ producto: "", preferencia: "", sustitucion: "consultar" as Sustitucion });

  async function sumarCasero(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!nuevoCasero.nombre.trim()) return setError("Escribe el nombre de tu casero o casera.");
    try {
      const c = await agregarCasero(hogar.id, {
        rubro: nuevoCasero.rubro.trim(),
        nombre: nuevoCasero.nombre.trim(),
        puesto: nuevoCasero.puesto.trim(),
        nota: nuevoCasero.nota.trim(),
      });
      setCaseros((prev) => [...(prev ?? []), c]);
      setNuevoCasero({ rubro: "", nombre: "", puesto: "", nota: "" });
    } catch (err) {
      setError(mensajeDeError(err));
    }
  }

  async function sumarPref(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!nuevaPref.producto.trim()) return setError("Escribe a qué producto se refiere.");
    try {
      const p = await agregarPreferencia(hogar.id, {
        producto: nuevaPref.producto.trim(),
        preferencia: nuevaPref.preferencia.trim(),
        sustitucion: nuevaPref.sustitucion,
      });
      setPrefs((prev) => [...(prev ?? []), p]);
      setNuevaPref({ producto: "", preferencia: "", sustitucion: "consultar" });
    } catch (err) {
      setError(mensajeDeError(err));
    }
  }

  async function quitarCasero(id: string) {
    try {
      await borrarCasero(id);
      setCaseros((prev) => (prev ?? []).filter((c) => c.id !== id));
    } catch (err) {
      setError(mensajeDeError(err));
    }
  }

  async function quitarPref(id: string) {
    try {
      await borrarPreferencia(id);
      setPrefs((prev) => (prev ?? []).filter((p) => p.id !== id));
    } catch (err) {
      setError(mensajeDeError(err));
    }
  }

  useEffect(() => {
    let vivo = true;
    cuentaDeHogar(hogar.id)
      .then((c) => {
        if (!vivo) return;
        setCaseros(c.caseros);
        setPrefs(c.preferencias);
      })
      .catch((e) => vivo && setError(mensajeDeError(e)));
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

      <section className="apilado" aria-labelledby="h-pref">
        <h2 id="h-pref" className="t-titulo">
          Cómo te gusta tu compra
        </h2>
        <p className="t-suave">Así compramos como tú lo harías: la compradora lo tendrá a la vista.</p>
        {prefs && prefs.length > 0 && (
          <ul className="filas">
            {prefs.map((p) => (
              <li key={p.id}>
                <div className="fila-flex fila-flex--entre">
                  <div>
                    <p style={{ fontWeight: 600 }}>{p.producto}</p>
                    <p className="t-suave">
                      {p.preferencia ? `${p.preferencia} · ` : ""}
                      Si no hay: {NOMBRE_SUSTITUCION[p.sustitucion].toLowerCase()}
                    </p>
                  </div>
                  <button type="button" className="enlace" onClick={() => void quitarPref(p.id)} aria-label={`Quitar la preferencia de ${p.producto}`}>
                    Quitar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <form className="superficie formulario" onSubmit={sumarPref} noValidate>
          <h3 className="t-seccion">Agregar una preferencia</h3>
          <div className="fila">
            <div className="campo">
              <label htmlFor="pf-prod">Producto</label>
              <input id="pf-prod" value={nuevaPref.producto} maxLength={80} onChange={(e) => setNuevaPref({ ...nuevaPref, producto: e.target.value })} placeholder="Ej.: palta" />
            </div>
            <div className="campo">
              <label htmlFor="pf-pref">Cómo lo prefieres</label>
              <input id="pf-pref" value={nuevaPref.preferencia} maxLength={200} onChange={(e) => setNuevaPref({ ...nuevaPref, preferencia: e.target.value })} placeholder="Ej.: casi maduras" />
            </div>
          </div>
          <div className="campo">
            <label htmlFor="pf-sust">Si no hay</label>
            <select id="pf-sust" value={nuevaPref.sustitucion} onChange={(e) => setNuevaPref({ ...nuevaPref, sustitucion: e.target.value as Sustitucion })}>
              {(Object.keys(NOMBRE_SUSTITUCION) as Sustitucion[]).map((s) => (
                <option key={s} value={s}>
                  {NOMBRE_SUSTITUCION[s]}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="boton boton--suave" style={{ justifySelf: "start" }}>
            Guardar preferencia
          </button>
        </form>
      </section>

      <hr className="separador" />

      <section className="apilado" aria-labelledby="h-cas">
        <h2 id="h-cas" className="t-titulo">
          Mis caseros de confianza
        </h2>
        <p className="t-suave">Si ya compras con alguien de siempre, cuéntanos dónde y compramos ahí.</p>
        {caseros && caseros.length > 0 && (
          <ul className="filas">
            {caseros.map((c) => (
              <li key={c.id}>
                <div className="fila-flex fila-flex--entre">
                  <div>
                    <p style={{ fontWeight: 600 }}>{c.nombre}</p>
                    <p className="t-suave">{[c.rubro, c.puesto, c.nota].filter(Boolean).join(" · ")}</p>
                  </div>
                  <button type="button" className="enlace" onClick={() => void quitarCasero(c.id)} aria-label={`Quitar a ${c.nombre}`}>
                    Quitar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <form className="superficie formulario" onSubmit={sumarCasero} noValidate>
          <h3 className="t-seccion">Agregar un casero</h3>
          <div className="fila">
            <div className="campo">
              <label htmlFor="ca-nom">Nombre</label>
              <input id="ca-nom" value={nuevoCasero.nombre} maxLength={80} onChange={(e) => setNuevoCasero({ ...nuevoCasero, nombre: e.target.value })} placeholder="Ej.: doña Rosa" />
            </div>
            <div className="campo">
              <label htmlFor="ca-rub">Qué vende</label>
              <input id="ca-rub" value={nuevoCasero.rubro} maxLength={60} onChange={(e) => setNuevoCasero({ ...nuevoCasero, rubro: e.target.value })} placeholder="Ej.: verduras" />
            </div>
          </div>
          <div className="campo">
            <label htmlFor="ca-pue">Dónde queda su puesto</label>
            <input id="ca-pue" value={nuevoCasero.puesto} maxLength={120} onChange={(e) => setNuevoCasero({ ...nuevoCasero, puesto: e.target.value })} placeholder="Ej.: pasillo de la entrada, al fondo" />
          </div>
          <div className="campo">
            <label htmlFor="ca-not">Algo que debamos saber</label>
            <input id="ca-not" value={nuevoCasero.nota} maxLength={300} onChange={(e) => setNuevoCasero({ ...nuevoCasero, nota: e.target.value })} />
          </div>
          <button type="submit" className="boton boton--suave" style={{ justifySelf: "start" }}>
            Guardar casero
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
