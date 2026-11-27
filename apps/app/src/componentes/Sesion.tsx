"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { alCambiarSesion, asegurarHogar, miPerfil, salir, sesionActual, type Hogar, type Perfil } from "@illari/db";
import { Acceso } from "./Acceso";
import { Marco } from "./Marco";
import { Cargando } from "./Comunes";

type Estado =
  | { fase: "cargando" }
  | { fase: "fuera" }
  | { fase: "dentro"; perfil: Perfil; hogar: Hogar }
  | { fase: "error"; mensaje: string };

type Contexto = {
  perfil: Perfil;
  hogar: Hogar;
  refrescar: () => Promise<void>;
  cerrarSesion: () => Promise<void>;
};

const Ctx = createContext<Contexto | null>(null);

/** Datos de la persona que entró. Solo se usa dentro de la compuerta, cuando ya hay sesión. */
export function useSesion(): Contexto {
  const c = useContext(Ctx);
  if (!c) throw new Error("useSesion solo funciona con una sesión iniciada.");
  return c;
}

type Interno = { estado: Estado; recargar: () => Promise<void>; salir: () => Promise<void> };
const Interna = createContext<Interno | null>(null);

export function ProveedorSesion({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<Estado>({ fase: "cargando" });

  const cargar = useCallback(async () => {
    try {
      const sesion = await sesionActual();
      if (!sesion) {
        setEstado({ fase: "fuera" });
        return;
      }
      // El perfil lo crea la base al registrarse; si aún no está, se reintenta un momento después.
      let perfil = await miPerfil();
      if (!perfil) {
        await new Promise((r) => setTimeout(r, 900));
        perfil = await miPerfil();
      }
      if (!perfil) {
        setEstado({ fase: "error", mensaje: "No encontramos tu perfil. Cierra sesión y vuelve a entrar." });
        return;
      }
      const hogar = await asegurarHogar(perfil);
      setEstado({ fase: "dentro", perfil, hogar });
    } catch (e) {
      setEstado({ fase: "error", mensaje: e instanceof Error ? e.message : "No pudimos abrir tu cuenta." });
    }
  }, []);

  useEffect(() => {
    void cargar();
    return alCambiarSesion((s) => {
      if (!s) setEstado({ fase: "fuera" });
      else void cargar();
    });
  }, [cargar]);

  const cerrar = useCallback(async () => {
    await salir();
    setEstado({ fase: "fuera" });
  }, []);

  const interno = useMemo<Interno>(() => ({ estado, recargar: cargar, salir: cerrar }), [estado, cargar, cerrar]);
  return <Interna.Provider value={interno}>{children}</Interna.Provider>;
}

/** Decide qué se ve: cargando, la pantalla de entrada o la app con su marco. */
export function Compuerta({ children }: { children: ReactNode }) {
  const i = useContext(Interna);
  if (!i) return null;
  const { estado } = i;

  if (estado.fase === "cargando") return <Cargando texto="Abriendo tu casa…" />;
  if (estado.fase === "fuera") return <Acceso />;
  if (estado.fase === "error") {
    return (
      <main className="acceso">
        <div className="acceso__caja apilado">
          <h1 className="t-titulo">Algo no salió bien</h1>
          <p className="aviso aviso--error" role="alert">
            {estado.mensaje}
          </p>
          <button type="button" className="boton boton--borde" onClick={() => void i.salir()}>
            Salir e intentar de nuevo
          </button>
        </div>
      </main>
    );
  }

  const valor: Contexto = {
    perfil: estado.perfil,
    hogar: estado.hogar,
    refrescar: i.recargar,
    cerrarSesion: i.salir,
  };
  return (
    <Ctx.Provider value={valor}>
      <Marco>{children}</Marco>
    </Ctx.Provider>
  );
}
