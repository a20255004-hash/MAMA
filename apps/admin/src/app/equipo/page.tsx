"use client";

import { useCallback, useEffect, useState } from "react";
import { cambiarRol, fechaCorta, mensajeDeError, NOMBRE_ROL, perfiles as listarPerfiles, type Perfil, type Rol } from "@illari/db";
import { Cabeza, Cargando, ErrorAviso } from "@/componentes/Comunes";
import { SoloAdmin } from "@/componentes/Guardia";
import { useSesion } from "@/componentes/Sesion";

const ROLES = Object.keys(NOMBRE_ROL) as Rol[];

function Equipo() {
  const { perfil: yo } = useSesion();
  const [lista, setLista] = useState<Perfil[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [solo, setSolo] = useState<"equipo" | "todos">("equipo");

  const cargar = useCallback(async () => {
    try {
      setLista(await listarPerfiles());
    } catch (e) {
      setError(mensajeDeError(e));
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  async function cambiar(p: Perfil, rol: Rol) {
    setOcupado(p.id);
    setError(null);
    setAviso(null);
    try {
      await cambiarRol(p.id, rol);
      await cargar();
      setAviso(`${p.nombre || "La persona"} ahora es ${NOMBRE_ROL[rol].toLowerCase()}.`);
    } catch (e) {
      setError(mensajeDeError(e));
    } finally {
      setOcupado(null);
    }
  }

  if (!lista) return error ? <ErrorAviso mensaje={error} /> : <Cargando texto="Buscando al equipo…" />;

  const visibles = lista.filter((p) => solo === "todos" || p.rol !== "cliente");

  return (
    <div className="apilado apilado--grande">
      <Cabeza titulo="Equipo" />
      <p className="aviso">
        Para sumar a una compradora o a un repartidor: pídele que cree su cuenta en la app de clientes. Cuando aparezca aquí,
        cámbiale el rol.
      </p>
      <div className="chips" role="group" aria-label="Ver">
        <button type="button" className="chip" aria-pressed={solo === "equipo"} onClick={() => setSolo("equipo")}>
          Equipo
        </button>
        <button type="button" className="chip" aria-pressed={solo === "todos"} onClick={() => setSolo("todos")}>
          Todos, con clientes
        </button>
      </div>
      <ErrorAviso mensaje={error} />
      {aviso && (
        <p className="aviso aviso--bien" role="status">
          {aviso}
        </p>
      )}
      <div className="tabla-caja">
        <table className="tabla">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Celular</th>
              <th>Desde</th>
              <th>Rol</th>
            </tr>
          </thead>
          <tbody>
            {visibles.map((p) => (
              <tr key={p.id}>
                <td>
                  {p.nombre || "Sin nombre"}
                  {p.id === yo.id && <span className="t-meta"> (tú)</span>}
                </td>
                <td>{p.celular ?? "—"}</td>
                <td>{fechaCorta(p.creado_en)}</td>
                <td>
                  <label className="solo-lectores" htmlFor={`rol-${p.id}`}>
                    Rol de {p.nombre}
                  </label>
                  <select
                    id={`rol-${p.id}`}
                    value={p.rol}
                    disabled={p.id === yo.id || ocupado === p.id}
                    onChange={(e) => void cambiar(p, e.target.value as Rol)}
                    style={{ minHeight: "2.5rem", padding: "0.3rem 0.6rem", border: "1.5px solid var(--linea)", borderRadius: "var(--r-chico)", background: "#fff", font: "inherit" }}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {NOMBRE_ROL[r]}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {visibles.length === 0 && (
              <tr>
                <td colSpan={4}>No hay personas para mostrar.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Pagina() {
  return (
    <SoloAdmin>
      <Equipo />
    </SoloAdmin>
  );
}
