"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Illa, MARCA, enlaceWhatsApp } from "@illari/ui";
import { fechaCorta, FRASE_ESTADO, mensajeDeError, misPedidos, NOMBRE_MODALIDAD, type PedidoResumen } from "@illari/db";
import { Cargando, ErrorAviso, EtiquetaEstado, Vacio } from "@/componentes/Comunes";
import { useSesion } from "@/componentes/Sesion";

function saludoDeLaHora(): string {
  const h = new Date().getHours();
  return h < 12 ? "Buenos días" : h < 19 ? "Buenas tardes" : "Buenas noches";
}

function FilaPedido({ p }: { p: PedidoResumen }) {
  const n = p.pedido_items[0]?.count ?? 0;
  return (
    <li>
      <Link className="fila-link" href={`/pedido/?id=${p.id}`}>
        <span className="pedido-fila__arriba">
          <span className="pedido-fila__titulo">Pedido #{p.numero}</span>
          <EtiquetaEstado estado={p.estado} />
        </span>
        <span className="t-meta">
          {NOMBRE_MODALIDAD[p.modalidad]} · {n === 0 ? "sin lista" : n === 1 ? "1 producto" : `${n} productos`} ·{" "}
          {fechaCorta(p.creado_en)}
        </span>
        {p.estado !== "cancelado" && p.estado !== "cerrado" && <span className="t-suave">{FRASE_ESTADO[p.estado]}</span>}
      </Link>
    </li>
  );
}

export default function Inicio() {
  const { perfil } = useSesion();
  const [pedidos, setPedidos] = useState<PedidoResumen[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saludo, setSaludo] = useState("Hola");

  useEffect(() => {
    setSaludo(saludoDeLaHora());
    let vivo = true;
    misPedidos()
      .then((p) => vivo && setPedidos(p))
      .catch((e) => vivo && setError(mensajeDeError(e)));
    return () => {
      vivo = false;
    };
  }, []);

  const nombre = perfil.nombre.split(" ")[0] ?? "";
  const abiertos = (pedidos ?? []).filter((p) => !["entregado", "cerrado", "cancelado"].includes(p.estado));
  const anteriores = (pedidos ?? []).filter((p) => ["entregado", "cerrado", "cancelado"].includes(p.estado));

  return (
    <div className="apilado apilado--grande">
      <div className="saludo">
        <div className="avatar-illa" aria-hidden="true">
          <Illa gesto="saluda" />
        </div>
        <div>
          <p className="t-mano saludo__mano">
            {saludo}
            {nombre ? `, ${nombre}` : ""}
          </p>
          <p className="t-suave">¿Qué te traemos hoy del {MARCA.mercado}?</p>
        </div>
      </div>

      <Link href="/pedido/nuevo/" className="boton boton--accion boton--grande boton--ancho">
        Hacer un pedido
      </Link>

      <ErrorAviso mensaje={error} />

      {pedidos === null && !error && <Cargando texto="Buscando tus pedidos…" />}

      {pedidos !== null && pedidos.length === 0 && (
        <Vacio titulo="Aún no tienes pedidos">
          <p>Cuéntanos qué necesitas y nosotras vamos al mercado por ti.</p>
        </Vacio>
      )}

      {abiertos.length > 0 && (
        <section className="apilado apilado--chico" aria-labelledby="h-abiertos">
          <h2 id="h-abiertos" className="t-titulo">
            En marcha
          </h2>
          <ul className="filas">
            {abiertos.map((p) => (
              <FilaPedido key={p.id} p={p} />
            ))}
          </ul>
        </section>
      )}

      {anteriores.length > 0 && (
        <section className="apilado apilado--chico" aria-labelledby="h-anteriores">
          <h2 id="h-anteriores" className="t-titulo">
            Anteriores
          </h2>
          <ul className="filas">
            {anteriores.map((p) => (
              <FilaPedido key={p.id} p={p} />
            ))}
          </ul>
        </section>
      )}

      <p className="t-meta">
        ¿Prefieres hablar con nosotras?{" "}
        <a className="enlace" href={enlaceWhatsApp("Hola, necesito ayuda con mi pedido.")} target="_blank" rel="noopener noreferrer">
          Escríbenos por WhatsApp
        </a>
      </p>
    </div>
  );
}
