# Estado del proyecto

## Fases

1. **Web comercial y cimientos** — construida (segunda versión, cinematográfica 3D). Falta conectar la base de datos.
2. **Panel ERP** — pendiente. Bandeja de solicitudes, clientes, pedidos, cotización, compra, liquidación y caja.
3. **App de clientes (PWA)** — pendiente. Registro, perfil de preferencias del hogar, pedidos y seguimiento.
4. **Reportes, personal y varias ciudades** — pendiente.

## Fase 1: qué hay

- Monorepo con `apps/web`, `packages/ui` (tokens y marca) y `packages/db` (datos y validación).
- Página comercial con escenas 3D, carrusel, pasos fijos, Illa (ilustrada) como guía, logo y formulario.
- Estilo Huerta (elegido), frutas reales escaneadas en la portada y sonidos con botón para silenciar.
- El formulario valida y abre WhatsApp (51 916 973 788) con el pedido redactado. Si la base de datos está conectada, además guarda la solicitud.
- Migración `supabase/migrations/0001_cimientos.sql` y `supabase/seed.sql` (tres paquetes de propuesta, en borrador).
- Publicación automática en GitHub Pages con `.github/workflows/pages.yml` en cada cambio de `main`.

## Publicación

- El sitio es estático (`output: "export"`): GitHub Pages no ejecuta código de servidor. Por eso los datos se leen y escriben desde el navegador con la clave publicable y seguridad por filas.
- GitHub Pages gratis exige que el repositorio sea **público**.
- Las variables `SUPABASE_URL` y `SUPABASE_PUBLISHABLE_KEY` se configuran en GitHub (Settings → Secrets and variables → Actions → Variables).

## Pendiente para cerrar la fase 1

- [x] Repositorio público (renombrado a `MAMA`).
- [ ] Activar GitHub Pages una vez: Settings → Pages → Source: "GitHub Actions" (lo hace la dueña). Luego la web queda en https://a20255004-hash.github.io/MAMA/
- [ ] Crear el proyecto de Supabase y aplicar la migración (requiere autorización de la dueña).
- [ ] Probar el guardado real de una solicitud.

## Decisiones pendientes de la dueña

- **Marca:** ya decidió nombre, lema, logo, colores, letras y nombre del panel. Faltan los elementos característicos (toldo, cenefa andina, etiquetas, sello) si quiere sumarlos.
- **Base de datos:** crear el proyecto gratuito de Supabase (la herramienta de creación pide un paso de confirmación de costo que no está disponible en la sesión; se crea a mano en el panel de Supabase, región São Paulo). De ella dependen las solicitudes, los reclamos, el panel interno y la app de clientes.
- **Estructura de la web:** aprobar Quiénes somos, Nuestros compromisos, Dónde llegamos, Preguntas frecuentes y el pie de página completo con Libro de Reclamaciones.

## Datos que debe entregar la dueña

- Datos legales para el pie de página y los textos legales: razón social (o nombre completo con RUC), RUC, domicilio, correo de contacto, horario y redes. Si falta alguno, no se muestra: no se inventa.
- Consultar "Illari" en el buscador de marcas de INDECOPI antes de registrarla.
- Paquetes reales: nombres y contenido.
- Modelo de cobro del servicio (solo para el panel; no se publica).
