"use client";

import { useState, type FormEvent } from "react";
import { entrar, mensajeDeError, pedirRecuperacion, registrarCuenta } from "@illari/db";
import { Illa, Logo, MARCA } from "@illari/ui";
import { ErrorAviso } from "./Comunes";

type Modo = "entrar" | "crear" | "olvide";

function normalizarCelular(v: string): string {
  return v.replace(/\D/g, "").replace(/^51(?=9\d{8}$)/, "");
}

function urlDeVuelta(): string {
  return `${window.location.origin}${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/`;
}

/** Pantalla de entrada: un amanecer, el lema y el formulario para entrar o crear la cuenta. */
export function Acceso() {
  const [modo, setModo] = useState<Modo>("entrar");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setAviso(null);
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email") ?? "").trim();
    const clave = String(f.get("clave") ?? "");

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return setError("Revisa tu correo: parece que le falta algo.");

    setEnviando(true);
    try {
      if (modo === "olvide") {
        await pedirRecuperacion(email, urlDeVuelta());
        setAviso("Si ese correo tiene una cuenta, te enviamos un enlace para elegir una clave nueva.");
      } else if (modo === "entrar") {
        if (!clave) return setError("Escribe tu clave.");
        await entrar(email, clave);
      } else {
        const nombre = String(f.get("nombre") ?? "").trim();
        const celular = normalizarCelular(String(f.get("celular") ?? ""));
        if (nombre.length < 2) return setError("Dinos cómo te llamas.");
        if (!/^9\d{8}$/.test(celular)) return setError("Revisa tu celular: son 9 dígitos y empieza con 9.");
        if (clave.length < 8) return setError("La clave debe tener al menos 8 caracteres.");
        const r = await registrarCuenta({ email, clave, nombre, celular, volverA: urlDeVuelta() });
        if (!r.sesionIniciada) {
          setAviso("¡Casi listo! Te enviamos un correo para confirmar tu cuenta. Toca el enlace y vuelve aquí.");
        }
      }
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setEnviando(false);
    }
  }

  const titulo = modo === "entrar" ? "Qué bueno verte" : modo === "crear" ? "Crea tu cuenta" : "Recupera tu clave";

  return (
    <main className="acceso">
      <aside className="acceso__lado" aria-hidden="true">
        <div className="acceso__sol" />
        <Illa gesto="saluda" className="acceso__illa" />
      </aside>

      <div className="acceso__caja">
        <Logo className="acceso__logo" />
        <p className="t-mano acceso__mano">{MARCA.lema.split(". ")[0]}.</p>
        <h1 className="t-pagina">{titulo}</h1>

        <form className="formulario" onSubmit={enviar} noValidate>
          {modo === "crear" && (
            <>
              <div className="campo">
                <label htmlFor="nombre">¿Cómo te llamas?</label>
                <input id="nombre" name="nombre" autoComplete="name" required />
              </div>
              <div className="campo">
                <label htmlFor="celular">Tu celular</label>
                <input id="celular" name="celular" type="tel" inputMode="numeric" autoComplete="tel" placeholder="9XX XXX XXX" required />
                <span className="campo__ayuda">Por aquí te escribimos para coordinar tu compra.</span>
              </div>
            </>
          )}
          <div className="campo">
            <label htmlFor="email">Tu correo</label>
            <input id="email" name="email" type="email" autoComplete="email" inputMode="email" required />
          </div>
          {modo !== "olvide" && (
            <div className="campo">
              <label htmlFor="clave">{modo === "crear" ? "Elige una clave" : "Tu clave"}</label>
              <input
                id="clave"
                name="clave"
                type="password"
                autoComplete={modo === "crear" ? "new-password" : "current-password"}
                required
              />
              {modo === "crear" && <span className="campo__ayuda">Mínimo 8 caracteres.</span>}
            </div>
          )}

          <ErrorAviso mensaje={error} />
          {aviso && (
            <p className="aviso aviso--bien" role="status">
              {aviso}
            </p>
          )}

          <button type="submit" className="boton boton--accion boton--grande boton--ancho" disabled={enviando}>
            {enviando ? "Un momento…" : modo === "entrar" ? "Entrar" : modo === "crear" ? "Crear mi cuenta" : "Enviarme el enlace"}
          </button>
        </form>

        <div className="acceso__pie">
          {modo === "entrar" && (
            <>
              <p>
                ¿Primera vez?{" "}
                <button type="button" className="enlace" onClick={() => { setModo("crear"); setError(null); setAviso(null); }}>
                  Crea tu cuenta
                </button>
              </p>
              <button type="button" className="enlace" onClick={() => { setModo("olvide"); setError(null); setAviso(null); }}>
                Olvidé mi clave
              </button>
            </>
          )}
          {modo !== "entrar" && (
            <button type="button" className="enlace" onClick={() => { setModo("entrar"); setError(null); setAviso(null); }}>
              Ya tengo cuenta: entrar
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
