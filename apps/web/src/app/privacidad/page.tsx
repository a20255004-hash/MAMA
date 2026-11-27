import type { Metadata } from "next";
import { MARCA } from "@illari/ui";
import { LegalMarco } from "@/components/LegalMarco";
import { datosDeLaEmpresa } from "@/lib/empresa";

export const metadata: Metadata = {
  title: `Privacidad y cookies — ${MARCA.nombre}`,
  description: "Qué datos guardamos, para qué y cómo cuidamos tu información.",
};

export default function Pagina() {
  const datos = datosDeLaEmpresa();
  return (
    <LegalMarco>
      <div className="legal__texto">
        <h1>Privacidad y cookies</h1>
        <p>Última actualización: 27 de noviembre de 2026.</p>
        <p>
          Esto explica con palabras sencillas qué información tuya usamos en {MARCA.nombre} y por qué. Si algo cambia, lo actualizamos aquí.
        </p>
      </div>

      <section className="legal__texto" aria-labelledby="h-datos">
        <h2 id="h-datos">Qué datos guardamos</h2>
        <ul>
          <li>
            <strong>Si nos escribes desde la página:</strong> tu nombre, tu celular, cómo quieres comprar, dónde recibirlo y el mensaje que dejes.
          </li>
          <li>
            <strong>Si creas una cuenta en la app:</strong> tu nombre, celular, correo, direcciones de entrega, preferencias de compra, caseros de
            confianza y tus pedidos con sus importes.
          </li>
          <li>
            <strong>Si llenas el Libro de Reclamaciones:</strong> los datos de la hoja (nombre, documento, contacto, domicilio y el detalle).
          </li>
        </ul>
      </section>

      <section className="legal__texto" aria-labelledby="h-uso">
        <h2 id="h-uso">Para qué los usamos</h2>
        <ul>
          <li>Coordinar contigo, comprar en el mercado y entregarte tu pedido.</li>
          <li>Atender tus consultas, reclamos y quejas.</li>
          <li>Llevar nuestras cuentas del negocio.</li>
        </ul>
        <p>No vendemos ni compartimos tus datos con terceros para publicidad.</p>
      </section>

      <section className="legal__texto" aria-labelledby="h-donde">
        <h2 id="h-donde">Dónde se guardan y quién los ve</h2>
        <p>
          Los datos se guardan en una base de datos en la nube (Supabase), con servidores en Estados Unidos. Solo el equipo de {MARCA.nombre} los ve,
          y cada persona únicamente lo que necesita para su trabajo: quien compra ve las listas; quien entrega, la dirección y el celular; la
          administración, todo lo demás. Cada cliente ve solo sus propios pedidos.
        </p>
      </section>

      <section className="legal__texto" aria-labelledby="h-cookies">
        <h2 id="h-cookies">Cookies y almacenamiento en tu dispositivo</h2>
        <p>No usamos cookies de publicidad ni de seguimiento. Guardamos en tu navegador solo lo necesario para que todo funcione a tu gusto:</p>
        <ul>
          <li>Si ya viste la bienvenida en esta visita y si ya nos habías visitado.</li>
          <li>Si prefieres la página con sonido o en silencio.</li>
          <li>En la app, tu sesión iniciada, para que no tengas que escribir tu clave cada vez.</li>
        </ul>
        <p>Puedes borrarlo cuando quieras desde la configuración de tu navegador.</p>
      </section>

      <section className="legal__texto" aria-labelledby="h-derechos">
        <h2 id="h-derechos">Tus derechos</h2>
        <p>
          Puedes pedirnos ver, corregir o borrar tus datos cuando quieras. Escríbenos por WhatsApp al 916 973 788
          {datos.find((d) => d.etiqueta === "Correo") ? " o al correo indicado abajo" : ""} y lo atendemos. Esto se rige por la ley peruana de
          protección de datos personales.
        </p>
      </section>

      {datos.length > 0 && (
        <section aria-labelledby="h-resp">
          <h2 id="h-resp">Responsable</h2>
          <dl className="legal__datos">
            {datos.map((d) => (
              <div key={d.etiqueta} style={{ display: "contents" }}>
                <dt>{d.etiqueta}</dt>
                <dd>{d.valor}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </LegalMarco>
  );
}
