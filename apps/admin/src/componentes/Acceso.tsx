"use client";

import { useState, type FormEvent } from "react";
import { entrar, mensajeDeError } from "@illari/db";
import { Logo, MARCA } from "@illari/ui";
import { ErrorAviso } from "./Comunes";

/** Entrada del panel: solo para el equipo. Las cuentas nuevas se crean en la app de clientes. */
export function Acceso() {
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email") ?? "").trim();
    const clave = String(f.get("clave") ?? "");
    if (!email || !clave) return setError("Escribe tu correo y tu clave.");
    setEnviando(true);
    try {
      await entrar(email, clave);
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="acceso">
      <div className="acceso__caja">
        <div className="apilado apilado--chico">
          <Logo className="acceso__logo" />
          <p className="t-seccion" style={{ color: "var(--accion-osc)" }}>
            {MARCA.nombrePanel}
          </p>
        </div>
        <h1 className="t-pagina">Entrar al panel</h1>
        <form className="formulario" onSubmit={enviar} noValidate>
          <div className="campo">
            <label htmlFor="email">Correo</label>
            <input id="email" name="email" type="email" autoComplete="email" inputMode="email" required />
          </div>
          <div className="campo">
            <label htmlFor="clave">Clave</label>
            <input id="clave" name="clave" type="password" autoComplete="current-password" required />
          </div>
          <ErrorAviso mensaje={error} />
          <button type="submit" className="boton boton--accion boton--grande boton--ancho" disabled={enviando}>
            {enviando ? "Un momento…" : "Entrar"}
          </button>
        </form>
        <p className="t-meta">
          ¿Aún no tienes cuenta? Créala en la{" "}
          <a className="enlace" href="../app/">
            app de clientes
          </a>{" "}
          y pide que te den acceso al equipo.
        </p>
      </div>
    </main>
  );
}
