import type { Metadata } from "next";
import { MARCA, enlaceWhatsApp } from "@illari/ui";
import { HojaDeReclamacion } from "@/components/HojaDeReclamacion";
import { LegalMarco } from "@/components/LegalMarco";
import { datosDeLaEmpresa } from "@/lib/empresa";

export const metadata: Metadata = {
  title: `Libro de Reclamaciones — ${MARCA.nombre}`,
  description: "Si algo no salió como esperabas, cuéntanoslo aquí y te respondemos.",
};

export default function Pagina() {
  const datos = datosDeLaEmpresa();
  return (
    <LegalMarco>
      <div className="legal__texto">
        <h1>Libro de Reclamaciones</h1>
        <p>
          Si algo no salió como esperabas, queremos saberlo. Llena esta hoja y la recibirá directamente nuestro equipo. Te respondemos al correo
          o al celular que dejes.
        </p>
      </div>

      {datos.length > 0 && (
        <section aria-labelledby="h-proveedor">
          <h2 id="h-proveedor">Quién te atiende</h2>
          <dl className="legal__datos">
            <dt>Nombre comercial</dt>
            <dd>{MARCA.nombre}</dd>
            {datos.map((d) => (
              <div key={d.etiqueta} style={{ display: "contents" }}>
                <dt>{d.etiqueta}</dt>
                <dd>{d.valor}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <HojaDeReclamacion />

      <p className="legal__nota">
        ¿Prefieres conversarlo primero? Escríbenos por{" "}
        <a href={enlaceWhatsApp("Hola, quiero hacer una consulta sobre mi pedido.")} target="_blank" rel="noopener noreferrer">
          WhatsApp
        </a>
        . Hablar con nosotras no reemplaza esta hoja.
      </p>
    </LegalMarco>
  );
}
