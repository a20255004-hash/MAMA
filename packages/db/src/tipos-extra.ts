import type { EstadoPedido, Recepcion, Sustitucion } from "./tipos";

export type EstadoEntrega = "pendiente" | "en_camino" | "entregada" | "fallida";

export type Entrega = {
  id: string;
  pedido_id: string;
  repartidor_id: string | null;
  ventana: string;
  estado: EstadoEntrega;
  entregada_en: string | null;
  nota: string;
};

export type EntregaConPedido = Entrega & {
  pedidos: {
    numero: number;
    estado: EstadoPedido;
    recepcion: Recepcion;
    notas_cliente: string;
    hogares: { nombre: string; celular: string | null } | null;
    direcciones: { direccion: string; referencia: string; zona: string } | null;
  } | null;
  perfiles: { nombre: string } | null;
};

export type PaqueteFila = {
  id: string;
  ciudad_id: string;
  slug: string;
  nombre: string;
  para_quien: string;
  descripcion: string;
  contenido: string[];
  publicado: boolean;
  orden: number;
};

export type CaseroHogar = { id: string; hogar_id: string; rubro: string; nombre: string; puesto: string; nota: string };

export type PreferenciaHogar = {
  id: string;
  hogar_id: string;
  producto: string;
  preferencia: string;
  sustitucion: Sustitucion;
};
