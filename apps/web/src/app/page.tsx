import { Logo, MARCA, enlaceWhatsApp } from "@illari/ui";
import { Bienvenida } from "@/components/Bienvenida";
import { Cabecera } from "@/components/Cabecera";
import { CintaGigante } from "@/components/CintaGigante";
import { Efectos } from "@/components/Efectos";
import { Formas } from "@/components/Formas";
import { Guia } from "@/components/Guia";
import { HoyTeTraemos } from "@/components/HoyTeTraemos";
import { Historia } from "@/components/Historia";
import { Manifiesto } from "@/components/Manifiesto";
import { Pasos } from "@/components/Pasos";
import { Pedir } from "@/components/Pedir";
import { ProgresoScroll } from "@/components/ProgresoScroll";
import { Quien } from "@/components/Quien";
import { MANO } from "@/lib/contenido";

export default function Pagina() {
  return (
    <>
      <Bienvenida />
      <ProgresoScroll />
      <Efectos />
      <Cabecera />

      <main id="contenido">
        <Historia />

        <Manifiesto />
        <HoyTeTraemos />
        <Formas />
        <Pasos />
        <CintaGigante />
        <Quien />
        <Pedir />
      </main>

      <footer className="pie">
        <Logo className="pie__logo" />
        <p className="pie__frase">
          {MARCA.nombre} significa amanecer en quechua. Así queremos que empiece tu día: con tu mercado ya hecho.
        </p>
        <p className="pie__firma">{MANO.cierre}</p>
        <nav className="pie__legal" aria-label="Información legal">
          <a href="reclamaciones/">Libro de Reclamaciones</a>
          <a href="privacidad/">Privacidad y cookies</a>
        </nav>
        <div className="pie__fila">
          <p>
            {MARCA.mercado}, {MARCA.ciudad}, Perú
          </p>
          <a href={enlaceWhatsApp("Hola, quiero hacer una consulta.")} target="_blank" rel="noopener noreferrer">
            WhatsApp 916 973 788
          </a>
        </div>
      </footer>

      <Guia />
    </>
  );
}
