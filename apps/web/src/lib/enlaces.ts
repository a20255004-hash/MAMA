/** Enlaces externos del negocio. Si un dato no está configurado, devuelve null y la interfaz no lo muestra. */

export function enlaceWhatsApp(mensaje: string): string | null {
  const numero = (process.env.NEXT_PUBLIC_WHATSAPP ?? "").replace(/\D/g, "");
  if (!/^\d{10,15}$/.test(numero)) return null;
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}

export function enlaceApp(): string | null {
  const url = process.env.NEXT_PUBLIC_APP_URL ?? "";
  return /^https?:\/\//.test(url) ? url : null;
}
