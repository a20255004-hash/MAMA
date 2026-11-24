import { Logo } from "@illari/ui";
import { Sonido } from "./Sonido";

/** Cabecera fija con fondo propio, para que ningún texto de la página se le encime. */
export function Cabecera() {
  return (
    <header className="cabecera">
      <a className="cabecera__marca" href="#inicio">
        <Logo />
      </a>
      <nav className="cabecera__nav" aria-label="Secciones">
        <a href="#formas">Formas de comprar</a>
        <a href="#pasos">Cómo funciona</a>
        <a href="#quien">Quién compra</a>
      </nav>
      <div className="cabecera__lado">
        <Sonido />
        <a className="boton boton--accion boton--chico" href="#pedir">
          Pedir
        </a>
      </div>
    </header>
  );
}
