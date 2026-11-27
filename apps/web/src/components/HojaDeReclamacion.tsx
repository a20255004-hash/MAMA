"use client";

import { useState, type FormEvent } from "react";
import { Illa } from "@illari/ui";
import { reclamoSchema, registrarReclamo, type ReclamoNuevo } from "@illari/db";

type Errores = Partial<Record<string, string>>;

/** Hoja de reclamación virtual: valida, guarda en la base y deja una copia para imprimir o guardar. */
export function HojaDeReclamacion() {
  const [errores, setErrores] = useState<Errores>({});
  const [general, setGeneral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [listo, setListo] = useState<{ datos: ReclamoNuevo; cuando: string } | null>(null);

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setGeneral(null);
    const f = new FormData(e.currentTarget);
    const montoTexto = String(f.get("monto") ?? "").trim().replace(",", ".");
    const crudo = {
      tipo: f.get("tipo") ?? undefined,
      nombre: f.get("nombre") ?? "",
      documentoTipo: f.get("documentoTipo") ?? undefined,
      documentoNumero: f.get("documentoNumero") ?? "",
      celular: f.get("celular") ?? "",
      correo: f.get("correo") ?? "",
      domicilio: f.get("domicilio") ?? "",
      bienTipo: f.get("bienTipo") ?? undefined,
      monto: montoTexto === "" ? null : Number(montoTexto),
      descripcionBien: f.get("descripcionBien") ?? "",
      detalle: f.get("detalle") ?? "",
      pedidoConsumidor: f.get("pedidoConsumidor") ?? "",
    };
    const revision = reclamoSchema.safeParse(crudo);
    if (!revision.success) {
      const nuevos: Errores = {};
      for (const i of revision.error.issues) nuevos[String(i.path[0])] ??= i.message;
      setErrores(nuevos);
      const primero = Object.keys(nuevos)[0];
      if (primero) e.currentTarget.querySelector<HTMLElement>(`[name="${primero}"]`)?.focus();
      return;
    }
    setErrores({});
    setEnviando(true);
    const r = await registrarReclamo(revision.data);
    setEnviando(false);
    if (!r.ok) {
      setGeneral("No pudimos registrar tu hoja. Revisa tu conexión e inténtalo de nuevo; si sigue fallando, escríbenos por WhatsApp.");
      return;
    }
    setListo({ datos: revision.data, cuando: new Date().toLocaleString("es-PE", { dateStyle: "long", timeStyle: "short" }) });
    window.scrollTo({ top: 0 });
  }

  if (listo) {
    const d = listo.datos;
    return (
      <div className="legal__texto">
        <Illa gesto="celebra" style={{ width: "7rem", height: "auto" }} />
        <h2>Recibimos tu hoja</h2>
        <p>
          Tu {d.tipo === "reclamo" ? "reclamo" : "queja"} quedó registrado el {listo.cuando}. Te responderemos al correo o al celular que dejaste,
          dentro del plazo que corresponde. Guarda o imprime esta copia.
        </p>
        <div className="resumen-hoja">
          <dl className="legal__datos">
            <dt>Consumidor</dt>
            <dd>
              {d.nombre} · {d.documentoTipo} {d.documentoNumero}
            </dd>
            <dt>Contacto</dt>
            <dd>
              {d.celular} · {d.correo}
            </dd>
            <dt>Domicilio</dt>
            <dd>{d.domicilio}</dd>
            <dt>Bien contratado</dt>
            <dd>
              {d.bienTipo === "producto" ? "Producto" : "Servicio"}: {d.descripcionBien}
              {d.monto ? ` · S/ ${d.monto.toFixed(2)}` : ""}
            </dd>
            <dt>Detalle</dt>
            <dd style={{ whiteSpace: "pre-wrap" }}>{d.detalle}</dd>
            {d.pedidoConsumidor && (
              <>
                <dt>Tu pedido</dt>
                <dd style={{ whiteSpace: "pre-wrap" }}>{d.pedidoConsumidor}</dd>
              </>
            )}
          </dl>
        </div>
        <button type="button" className="boton boton--borde" onClick={() => window.print()}>
          Imprimir o guardar mi copia
        </button>
      </div>
    );
  }

  const Error = ({ n }: { n: string }) =>
    errores[n] ? (
      <span id={`e-${n}`} className="hoja__error" role="alert">
        {errores[n]}
      </span>
    ) : null;
  const inv = (n: string) => ({ "aria-invalid": errores[n] ? true : undefined, "aria-describedby": errores[n] ? `e-${n}` : undefined });

  return (
    <form className="hoja" onSubmit={enviar} noValidate>
      <fieldset>
        <legend>1. Tipo de hoja</legend>
        <label className="hoja__opcion">
          <input type="radio" name="tipo" value="reclamo" />
          <span>
            <strong>Reclamo</strong>
            <span>Estoy en desacuerdo con el producto o con el servicio que recibí.</span>
          </span>
        </label>
        <label className="hoja__opcion">
          <input type="radio" name="tipo" value="queja" />
          <span>
            <strong>Queja</strong>
            <span>Tengo un malestar que no es sobre el producto o servicio en sí, por ejemplo, la atención recibida.</span>
          </span>
        </label>
        <Error n="tipo" />
      </fieldset>

      <fieldset>
        <legend>2. Tus datos</legend>
        <div className="hoja__campo">
          <label htmlFor="nombre">Nombre completo</label>
          <input id="nombre" name="nombre" autoComplete="name" {...inv("nombre")} />
          <Error n="nombre" />
        </div>
        <div className="hoja__fila">
          <div className="hoja__campo">
            <label htmlFor="documentoTipo">Documento</label>
            <select id="documentoTipo" name="documentoTipo" defaultValue="DNI" {...inv("documentoTipo")}>
              <option>DNI</option>
              <option value="CE">Carné de extranjería</option>
              <option>Pasaporte</option>
              <option>RUC</option>
            </select>
          </div>
          <div className="hoja__campo">
            <label htmlFor="documentoNumero">Número</label>
            <input id="documentoNumero" name="documentoNumero" inputMode="text" {...inv("documentoNumero")} />
            <Error n="documentoNumero" />
          </div>
        </div>
        <div className="hoja__fila">
          <div className="hoja__campo">
            <label htmlFor="celular">Celular</label>
            <input id="celular" name="celular" type="tel" inputMode="numeric" autoComplete="tel" {...inv("celular")} />
            <Error n="celular" />
          </div>
          <div className="hoja__campo">
            <label htmlFor="correo">Correo</label>
            <input id="correo" name="correo" type="email" autoComplete="email" {...inv("correo")} />
            <Error n="correo" />
          </div>
        </div>
        <div className="hoja__campo">
          <label htmlFor="domicilio">Domicilio</label>
          <input id="domicilio" name="domicilio" autoComplete="street-address" {...inv("domicilio")} />
          <Error n="domicilio" />
        </div>
      </fieldset>

      <fieldset>
        <legend>3. Lo que contrataste</legend>
        <div className="hoja__fila">
          <div className="hoja__campo">
            <label htmlFor="bienTipo">Se trata de</label>
            <select id="bienTipo" name="bienTipo" defaultValue="servicio" {...inv("bienTipo")}>
              <option value="servicio">Un servicio</option>
              <option value="producto">Un producto</option>
            </select>
          </div>
          <div className="hoja__campo">
            <label htmlFor="monto">Monto reclamado (S/, opcional)</label>
            <input id="monto" name="monto" inputMode="decimal" />
          </div>
        </div>
        <div className="hoja__campo">
          <label htmlFor="descripcionBien">Descripción breve</label>
          <input id="descripcionBien" name="descripcionBien" placeholder="Ej.: compra por encargo del jueves" {...inv("descripcionBien")} />
          <Error n="descripcionBien" />
        </div>
      </fieldset>

      <fieldset>
        <legend>4. Detalle</legend>
        <div className="hoja__campo">
          <label htmlFor="detalle">Cuéntanos qué pasó</label>
          <textarea id="detalle" name="detalle" maxLength={2000} {...inv("detalle")} />
          <Error n="detalle" />
        </div>
        <div className="hoja__campo">
          <label htmlFor="pedidoConsumidor">¿Qué solución esperas? (opcional)</label>
          <textarea id="pedidoConsumidor" name="pedidoConsumidor" maxLength={600} />
        </div>
      </fieldset>

      <p className="legal__nota">
        Presentar esta hoja no te impide acudir a otras vías de solución de controversias ni es requisito previo para presentar una denuncia
        ante INDECOPI.
      </p>

      {general && (
        <p className="hoja__error" role="alert">
          {general}
        </p>
      )}
      <button type="submit" className="boton boton--accion boton--grande" disabled={enviando}>
        {enviando ? "Enviando…" : "Enviar mi hoja"}
      </button>
    </form>
  );
}
