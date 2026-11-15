/** Datos de marca en un solo lugar. Cambiar aquí cambia las tres aplicaciones. */
export const MARCA = {
  nombre: "Illari",
  /** "Illari" significa amanecer en quechua. */
  lema: "Tu mercado, listo cuando amanece.",
  ciudad: "Tacna",
  mercado: "Mercado Grau",
  /** WhatsApp del negocio, con código de país y sin signos. */
  whatsapp: "51916973788",
} as const;

/** Enlace para abrir un chat de WhatsApp con el negocio y un mensaje ya escrito. */
export function enlaceWhatsApp(mensaje: string): string {
  return `https://wa.me/${MARCA.whatsapp}?text=${encodeURIComponent(mensaje)}`;
}
