import { MARCA, enlaceWhatsApp } from "@illari/ui";
import { Cabecera } from "@/components/Cabecera";
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

        <section className="manifiesto" data-tema="claro">
          <p className="manifiesto__frase">Ir al mercado te cuesta una madrugada. Encargarlo, un mensaje.</p>
          <p className="manifiesto__texto">
            Levantarte antes que el sol, recorrer puestos, comparar, elegir y volver cargando. Si trabajas, estudias
            o tienes hijos, esas horas tienen mejor uso. Nosotras hacemos el recorrido completo en el {MARCA.mercado}{" "}
            de {MARCA.ciudad}.
          </p>
        </section>

        <Formas />
        <Pasos />
        <Quien />
        <Pedir />
      </main>

      <footer className="pie" data-tema="oscuro">
        <p className="pie__marca" aria-hidden="true">
          illari
        </p>
        <div className="pie__fila">
          <p>
            {MARCA.nombre} significa amanecer en quechua. {MARCA.lema}
          </p>
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
