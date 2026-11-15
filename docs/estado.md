# Estado del proyecto

## Fases

1. **Web comercial y cimientos** — construida. Falta conectar la base de datos (ver abajo).
2. **Panel ERP** — pendiente. Bandeja de solicitudes, clientes, pedidos, cotización, compra, liquidación y caja.
3. **App de clientes (PWA)** — pendiente. Registro, perfil de preferencias del hogar, pedidos y seguimiento.
4. **Reportes, personal y varias ciudades** — pendiente.

## Fase 1: qué hay

- Monorepo con `apps/web`, `packages/ui` (tokens, personaje, ilustraciones) y `packages/db` (datos y validación).
- Página comercial completa: portada, amanecer, cómo funciona, formas de comprar, quién compra, paquetes (si hay publicados) y formulario de solicitud.
- Migración `supabase/migrations/0001_cimientos.sql`: ciudades, mercados, paquetes y solicitudes, con seguridad por filas.
- `supabase/seed.sql`: tres paquetes de propuesta, en borrador.

## Pendiente para cerrar la fase 1

- [ ] Crear el proyecto de Supabase y aplicar la migración (requiere autorización de la dueña).
- [ ] Copiar `apps/web/.env.example` a `apps/web/.env.local` y completar URL y clave publicable.
- [ ] Probar el envío real de una solicitud y verificarla en la base de datos.
- [ ] Publicar en Vercel.

## Datos que debe entregar la dueña

- Número de WhatsApp del negocio (activa los botones de WhatsApp).
- Confirmación del nombre "Casera", o el nombre definitivo.
- Paquetes reales: nombres y contenido (hoy hay tres propuestas en borrador).
- Modelo de cobro del servicio (tarifa fija, porcentaje o mixta). Solo para el panel; no se publica.
