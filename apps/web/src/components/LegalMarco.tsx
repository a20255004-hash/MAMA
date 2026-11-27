import type { ReactNode } from "react";
import { Logo } from "@illari/ui";
import "@/app/legal.css";

/** Marco común de las páginas legales: logo, volver a la página y un cuerpo angosto y legible. */
export function LegalMarco({ children }: { children: ReactNode }) {
  return (
    <div className="legal">
      <header className="legal__barra">
        <div className="legal__barra-in">
          <a href="../" className="legal__logo" aria-label="Illari, volver al inicio">
            <Logo />
          </a>
          <a href="../" className="legal__volver">
            Volver a la página
          </a>
        </div>
      </header>
      <main id="contenido" className="legal__cuerpo">
        {children}
      </main>
    </div>
  );
}
