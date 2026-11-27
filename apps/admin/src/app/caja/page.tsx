"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  fechaCorta,
  mensajeDeError,
  movimientos as listarMovimientos,
  NOMBRE_MOVIMIENTO,
  registrarMovimiento,
  resumenCaja,
  soles,
  type Movimiento,
  type ResumenMes,
  type TipoMovimiento,
} from "@illari/db";
import { useSesion } from "@/componentes/Sesion";
import { Cabeza, Cargando, ErrorAviso, Vacio } from "@/componentes/Comunes";
import { SoloAdmin } from "@/componentes/Guardia";

const numero = (t: string): number => Number(t.replace(",", "."));
const hoy = () => new Date().toISOString().slice(0, 10);
const TIPOS = Object.keys(NOMBRE_MOVIMIENTO) as TipoMovimiento[];

function mesLegible(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("es-PE", { month: "long", year: "numeric" });
}

function Caja() {
  const { perfil } = useSesion();
  const [movs, setMovs] = useState<Movimiento[] | null>(null);
  const [resumen, setResumen] = useState<ResumenMes[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [f, setF] = useState({
    tipo: "gasto_operativo" as TipoMovimiento,
    monto: "",
    fecha: hoy(),
    descripcion: "",
    cuenta: "negocio" as "negocio" | "fondos_clientes",
    entrada: false,
  });

  const cargar = useCallback(async () => {
    try {
      const [m, r] = await Promise.all([listarMovimientos(), resumenCaja()]);
      setMovs(m);
      setResumen(r);
    } catch (e) {
      setError(mensajeDeError(e));
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setAviso(null);
    const monto = numero(f.monto);
    if (!(monto > 0)) return setError("Escribe un monto mayor que cero.");
    setOcupado(true);
    try {
      await registrarMovimiento({
        ciudadId: perfil.ciudad_id,
        tipo: f.tipo,
        monto,
        fecha: f.fecha,
        descripcion: f.descripcion.trim(),
        cuenta: f.cuenta,
        entrada: f.entrada,
      });
      setF({ ...f, monto: "", descripcion: "" });
      setAviso("Movimiento registrado.");
      await cargar();
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setOcupado(false);
    }
  }

  if (!movs || !resumen) return error ? <ErrorAviso mensaje={error} /> : <Cargando texto="Abriendo la caja…" />;

  const mesActual = resumen[0];
  const custodia = resumen.reduce((s, r) => s + Number(r.fondos_clientes_neto), 0);

  return (
    <div className="apilado apilado--grande">
      <Cabeza titulo="Caja" />

      <p className="aviso">
        El dinero de los productos es de los clientes: se guarda aparte, como fondos de terceros. Solo el servicio y el delivery
        son ingreso del negocio. Los movimientos no se editan ni se borran: si te equivocas, registra uno que lo corrija.
      </p>

      <div className="cifras">
        <div className="cifra cifra--fresca">
          <span className="cifra__num t-num">{soles(mesActual?.ingresos ?? 0)}</span>
          <span>Ingresos {mesActual ? `de ${mesLegible(mesActual.mes)}` : "del mes"}</span>
        </div>
        <div className="cifra">
          <span className="cifra__num t-num">{soles(mesActual?.gastos ?? 0)}</span>
          <span>Gastos del mes</span>
        </div>
        <div className="cifra cifra--fresca">
          <span className="cifra__num t-num">{soles(mesActual?.ganancia ?? 0)}</span>
          <span>Ganancia del mes</span>
        </div>
        <div className="cifra">
          <span className="cifra__num t-num">{soles(custodia)}</span>
          <span>Dinero de clientes en custodia</span>
        </div>
      </div>

      <section className="panel apilado" aria-labelledby="h-nuevo">
        <h2 id="h-nuevo" className="t-titulo">
          Registrar un movimiento
        </h2>
        <form className="formulario" onSubmit={enviar} noValidate>
          <div className="fila">
            <div className="campo">
              <label htmlFor="tipo">Tipo</label>
              <select id="tipo" value={f.tipo} onChange={(e) => setF({ ...f, tipo: e.target.value as TipoMovimiento })}>
                {TIPOS.map((t) => (
                  <option key={t} value={t}>
                    {NOMBRE_MOVIMIENTO[t]}
                  </option>
                ))}
              </select>
            </div>
            <div className="campo">
              <label htmlFor="monto">Monto (S/)</label>
              <input id="monto" inputMode="decimal" value={f.monto} onChange={(e) => setF({ ...f, monto: e.target.value })} />
            </div>
            <div className="campo">
              <label htmlFor="fecha">Fecha</label>
              <input id="fecha" type="date" value={f.fecha} onChange={(e) => setF({ ...f, fecha: e.target.value })} />
            </div>
          </div>
          {f.tipo === "otro" && (
            <div className="fila">
              <div className="campo">
                <label htmlFor="cuenta">Cuenta</label>
                <select id="cuenta" value={f.cuenta} onChange={(e) => setF({ ...f, cuenta: e.target.value as "negocio" | "fondos_clientes" })}>
                  <option value="negocio">Negocio</option>
                  <option value="fondos_clientes">Dinero de clientes</option>
                </select>
              </div>
              <div className="campo">
                <label htmlFor="sentido">Sentido</label>
                <select id="sentido" value={f.entrada ? "entrada" : "salida"} onChange={(e) => setF({ ...f, entrada: e.target.value === "entrada" })}>
                  <option value="salida">Sale dinero</option>
                  <option value="entrada">Entra dinero</option>
                </select>
              </div>
            </div>
          )}
          <div className="campo">
            <label htmlFor="desc">Detalle</label>
            <input id="desc" value={f.descripcion} maxLength={300} onChange={(e) => setF({ ...f, descripcion: e.target.value })} placeholder="Ej.: gasolina de la semana" />
          </div>
          <ErrorAviso mensaje={error} />
          {aviso && (
            <p className="aviso aviso--bien" role="status">
              {aviso}
            </p>
          )}
          <button type="submit" className="boton boton--accion" style={{ justifySelf: "start" }} disabled={ocupado}>
            Registrar
          </button>
        </form>
      </section>

      {resumen.length > 0 && (
        <section className="apilado apilado--chico" aria-labelledby="h-meses">
          <h2 id="h-meses" className="t-titulo">
            Por mes
          </h2>
          <div className="tabla-caja">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Mes</th>
                  <th className="num">Ingresos</th>
                  <th className="num">Gastos</th>
                  <th className="num">Ganancia</th>
                  <th className="num">Dinero de clientes</th>
                </tr>
              </thead>
              <tbody>
                {resumen.map((r) => (
                  <tr key={r.mes}>
                    <td style={{ textTransform: "capitalize" }}>{mesLegible(r.mes)}</td>
                    <td className="num">{soles(r.ingresos)}</td>
                    <td className="num">{soles(r.gastos)}</td>
                    <td className="num">{soles(r.ganancia)}</td>
                    <td className="num">{soles(r.fondos_clientes_neto)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="apilado apilado--chico" aria-labelledby="h-movs">
        <h2 id="h-movs" className="t-titulo">
          Últimos movimientos
        </h2>
        {movs.length === 0 ? (
          <Vacio titulo="Todavía no hay movimientos" />
        ) : (
          <div className="tabla-caja">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Movimiento</th>
                  <th>Cuenta</th>
                  <th className="num">Monto</th>
                </tr>
              </thead>
              <tbody>
                {movs.map((m) => (
                  <tr key={m.id}>
                    <td>{fechaCorta(m.fecha)}</td>
                    <td>
                      {NOMBRE_MOVIMIENTO[m.tipo]}
                      {m.descripcion && <div className="t-meta">{m.descripcion}</div>}
                    </td>
                    <td>{m.cuenta === "negocio" ? "Negocio" : "Clientes"}</td>
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
    </div>
  );
}

export default function Pagina() {
  return (
    <SoloAdmin>
      <Caja />
    </SoloAdmin>
  );
}
