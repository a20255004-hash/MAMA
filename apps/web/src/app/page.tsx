import { Logo, MARCA, enlaceWhatsApp } from "@illari/ui";
import { Cabecera } from "@/components/Cabecera";
import { Estilos } from "@/components/Estilos";
import { Formas } from "@/components/Formas";
import { Guia } from "@/components/Guia";
import { Historia } from "@/components/Historia";
import { Pasos } from "@/components/Pasos";
import { Pedir } from "@/components/Pedir";
import { Quien } from "@/components/Quien";

export default function Pagina() {
  return (
    <>
      <Cabecera />

      <main id="contenido">
        <Historia />

        <section className="manifiesto">
          <h2 className="titulo-2">Sabemos lo que es correr todo el día.</h2>
          <p className="bajada">
            Levantarte de madrugada, caminar entre puestos, comparar, regatear y volver cargando las bolsas. Y recién
            ahí empieza tu día. Si trabajas, estudias o tienes hijos, esas horas valen oro. Déjanos esa parte a
            nosotras.
          </p>
        </section>

        <Formas />
        <Pasos />
        <Quien />
        <Pedir />
      </main>

      <footer className="pie">
        <Logo className="pie__logo" />
        <p className="pie__frase">
          {MARCA.nombre} significa amanecer en quechua. Así queremos que empiece tu día: con tu mercado ya hecho.
        </p>
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
      <Estilos />
    </>
  );
}
