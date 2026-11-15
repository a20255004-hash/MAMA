import { paquetesPublicados, type Paquete } from "@casera/db";
import { Casera, MARCA } from "@casera/ui";
import { Amanecer } from "@/components/Amanecer";
import { Cabecera } from "@/components/Cabecera";
import { Guia } from "@/components/Guia";
import { Modalidades } from "@/components/Modalidades";
import { Orbita } from "@/components/Orbita";
import { Pasos } from "@/components/Pasos";
import { Pedir } from "@/components/Pedir";
import { CRITERIOS } from "@/lib/contenido";
import { enlaceApp, enlaceWhatsApp } from "@/lib/enlaces";

// Los paquetes se administran desde el panel: la página los vuelve a leer cada 5 minutos.
export const revalidate = 300;

async function leerPaquetes(): Promise<Paquete[]> {
  try {
    return await paquetesPublicados();
  } catch (e) {
    console.error("[paquetes]", e);
    return [];
  }
}

export default async function Pagina() {
  const paquetes = await leerPaquetes();
  const whatsapp = enlaceWhatsApp(`Hola, quiero pedir una compra del ${MARCA.mercado}.`);
  const app = enlaceApp();

  return (
    <>
      <Cabecera />
      <main id="contenido">
        <section id="inicio" className="hero" data-guia="inicio">
          <div className="hero__texto">
            <h1 className="hero__titulo">Nosotras madrugamos por ti.</h1>
            <p className="hero__bajada">
              Una compradora que conoce el {MARCA.mercado} elige tus frutas, verduras, carnes y abarrotes como
              si fueran para su casa. Tú los recibes en la tuya.
            </p>
            <div className="hero__acciones">
              <a className="boton boton--aji boton--grande" href="#pedir">
                Pedir mi compra
              </a>
              <a className="boton boton--claro" href="#como">
                Ver cómo funciona
              </a>
            </div>
          </div>
          <Orbita />
        </section>

        <Amanecer />

        <section className="seccion manifiesto">
          <p className="manifiesto__frase">
            Ir al mercado te cuesta una madrugada. Encargarlo te cuesta un mensaje.
          </p>
          <p className="bajada">
            Levantarte antes que el sol, recorrer puestos, comparar, elegir y volver cargando. Si trabajas,
            estudias o tienes hijos, esas horas tienen mejor uso. Nosotras hacemos el recorrido completo en el{" "}
            {MARCA.mercado} de {MARCA.ciudad}.
          </p>
        </section>

        <Pasos />
        <Modalidades />

        <section id="criterio" className="criterio" data-guia="criterio">
          <div className="criterio__interior">
            <div className="criterio__cabeza">
              <h2 className="titulo-2">Elegimos como para nuestra casa.</h2>
              <p className="bajada">
                Detrás de cada compra hay una mamá que lleva años haciendo el mercado. Sabe cuándo una fruta
                está en su punto y cuándo conviene esperar a mañana.
              </p>
            </div>
            <Casera className="criterio__casera" titulo="La casera, con su canasta de compras" />
            <ul className="criterio__lista">
              {CRITERIOS.map((c) => (
                <li key={c.titulo}>
                  <h3 className="titulo-3">{c.titulo}</h3>
                  <p>{c.texto}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {paquetes.length > 0 && (
          <section id="paquetes" className="seccion paquetes" data-guia="paquetes">
            <h2 className="titulo-2">Paquetes para empezar.</h2>
            <p className="bajada">Cada uno se cotiza con los precios del día y se ajusta a lo que tú quieras.</p>
            <ul className="paquetes__fila">
              {paquetes.map((p) => (
                <li key={p.id} className="paquete">
                  <p className="paquete__para">{p.paraQuien}</p>
                  <h3 className="titulo-3">{p.nombre}</h3>
                  <p>{p.descripcion}</p>
                  {p.contenido.length > 0 && (
                    <ul className="paquete__contenido">
                      {p.contenido.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        <Pedir paquetes={paquetes} whatsapp={whatsapp} app={app} />
      </main>

      <footer className="pie">
        <p className="pie__marca">casera</p>
        <p>{MARCA.lema}</p>
        <p className="pie__lugar">
          {MARCA.mercado}, {MARCA.ciudad}, Perú
        </p>
      </footer>

      <Guia />
    </>
  );
}
