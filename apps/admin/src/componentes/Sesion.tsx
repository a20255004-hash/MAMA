"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { alCambiarSesion, miPerfil, salir, sesionActual, type Perfil } from "@illari/db";
import { MARCA } from "@illari/ui";
import { Acceso } from "./Acceso";
import { Cargando } from "./Comunes";
import { Marco } from "./Marco";

type Estado =
  | { fase: "cargando" }
  | { fase: "fuera" }
  | { fase: "dentro"; perfil: Perfil }
  | { fase: "error"; mensaje: string };

type Contexto = { perfil: Perfil; cerrarSesion: () => Promise<void> };

const Ctx = createContext<Contexto | null>(null);

/** Datos de la persona del equipo que entró. */
export function useSesion(): Contexto {
  const c = useContext(Ctx);
  if (!c) throw new Error("useSesion solo funciona con una sesión iniciada.");
  return c;
}

type Interno = { estado: Estado; salir: () => Promise<void> };
const Interna = createContext<Interno | null>(null);

export function ProveedorSesion({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<Estado>({ fase: "cargando" });

  const cargar = useCallback(async () => {
    try {
      const sesion = await sesionActual();
      if (!sesion) return setEstado({ fase: "fuera" });
      const perfil = await miPerfil();
      if (!perfil) return setEstado({ fase: "error", mensaje: "No encontramos tu perfil. Cierra sesión y vuelve a entrar." });
      setEstado({ fase: "dentro", perfil });
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

  const interno = useMemo<Interno>(() => ({ estado, salir: cerrar }), [estado, cerrar]);
  return <Interna.Provider value={interno}>{children}</Interna.Provider>;
}

/** Solo pasa el equipo (administración, compradoras y repartidores); una clienta ve un aviso amable. */
export function Compuerta({ children }: { children: ReactNode }) {
  const i = useContext(Interna);
  if (!i) return null;
  const { estado } = i;

  if (estado.fase === "cargando") return <Cargando texto={`Abriendo ${MARCA.nombrePanel}…`} />;
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

  const { perfil } = estado;
  if (perfil.rol === "cliente" || !perfil.activo) {
    return (
      <main className="acceso">
        <div className="acceso__caja apilado">
          <h1 className="t-titulo">Este panel es para el equipo de Illari</h1>
          <p className="t-suave">
            Tu cuenta es de cliente, así que aquí no hay nada para ti. Tus pedidos están en la app.
          </p>
          <a className="boton boton--accion" href="../app/">
            Ir a mi app
          </a>
          <button type="button" className="boton boton--borde" onClick={() => void i.salir()}>
            Cerrar sesión
          </button>
        </div>
      </main>
    );
  }

  return (
    <Ctx.Provider value={{ perfil, cerrarSesion: i.salir }}>
      <Marco>{children}</Marco>
    </Ctx.Provider>
  );
}
