# Estado del proyecto

## Fases

1. **Web comercial y cimientos** — construida (cinematográfica 3D) y publicada, con bienvenida cálida al entrar.
2. **Base de datos** — Supabase "Illari" creada y con las migraciones 0001 a 0004 aplicadas (ver abajo).
3. **App de clientes y Illari Central (panel)** — primera versión construida; falta probarlas con personas reales (ver "Qué está probado").
4. **Entregas, paquetes, caseros, Libro de Reclamaciones, privacidad y app instalable** — construidos en la segunda tanda (migración 0005).
5. **Reportes, gráficos, varias ciudades y textos legales finales** — pendiente.

## Qué hay

- Monorepo con `apps/web`, `apps/app` (clientes), `apps/admin` (Illari Central), `packages/ui` (tokens, marca, estilos de app) y `packages/db` (datos, validación y todas las llamadas a Supabase).
- **Web:** escenas 3D, carrusel, pasos, Illa como guía, formulario que guarda la solicitud y abre WhatsApp, bienvenida (saludo según la hora, una vez por visita), logo con colores del sol.
- **App de clientes (`/app`):** crear cuenta y entrar, "Mi casa" (datos y direcciones), hacer un pedido en tres pasos (lista propia, compra delegada o caseros), ver el estado, aprobar la cotización y cancelar mientras no se compra.
- **Illari Central (`/central`):** solo para el equipo. *Hoy* (solicitudes de la web y pedidos en marcha), *Pedidos* (precios, cotización con versiones, avance de estado, notas, cuentas del pedido), *Comprar* (modo compras para el celular, con reglas de sustitución), *Caja* (dos cuentas separadas: dinero de clientes y negocio), *Reclamos* (Libro de Reclamaciones con plazo), *Equipo* (roles) y *Catálogo*.
- **Segunda tanda:** *Entregas* (programar quién y cuándo, la repartidora marca "salí" y "entregado" desde su celular y el pedido se actualiza solo), *Paquetes* (crear, editar y publicar; aparecen en la web y en la app), *Mi casa* con preferencias de compra y caseros de confianza (la compradora los ve al comprar), Libro de Reclamaciones y Privacidad en la web (`/reclamaciones/`, `/privacidad/`, enlazados en el pie), y app/panel instalables en el celular (manifiesto, íconos del sol y modo sin conexión que solo guarda la carcasa, nunca datos de pedidos).
- **Base de datos:** seguridad por filas en todas las tablas, funciones que validan quién actúa y en qué estado está el pedido, libro de caja que no permite mezclar dinero de clientes con ingresos del negocio, y plazo de 15 días hábiles en los reclamos.

## Qué está probado

- La seguridad de la base de datos se probó simulando a un visitante, dos clientas y una administradora (qué ve y qué puede hacer cada una, cotizar, aprobar, comprar, caja). Todo quedó como se esperaba, y se corrigió un fallo que apareció en la prueba (migración 0004).
- La bienvenida se probó en escritorio y celular (360 y 375 px).
- Falta probar de punta a punta, con una cuenta real, el recorrido completo en el navegador de la app y del panel.

## Publicación

- El sitio es estático: GitHub Pages no ejecuta código de servidor. Los datos se leen y escriben desde el navegador con la clave publicable y la seguridad por filas.
- Una sola publicación arma las tres aplicaciones (`.github/workflows/pages.yml`):
  - https://a20255004-hash.github.io/MAMA/ — página comercial
  - https://a20255004-hash.github.io/MAMA/app/ — app de clientes
  - https://a20255004-hash.github.io/MAMA/central/ — Illari Central
- La URL y la clave publicable de Supabase están por defecto en `packages/db/src/cliente.ts` (son públicas por diseño). La clave `service_role` nunca entra al repositorio.

## Pendiente para que todo funcione con personas reales

- [ ] **Supabase → Authentication → URL Configuration:** poner como *Site URL* `https://a20255004-hash.github.io/MAMA/app/` y agregar a *Redirect URLs* `https://a20255004-hash.github.io/MAMA/app/**` y `https://a20255004-hash.github.io/MAMA/central/**`. Sin esto, el enlace del correo de confirmación no vuelve a la app.
- [ ] **Supabase → Authentication → Providers → Email:** hoy exige confirmar el correo y el servicio de correo gratuito envía muy pocos mensajes por hora. Para empezar con su mamá y su equipo conviene desactivar "Confirm email" (la persona entra al instante); se vuelve a activar con un servicio de correo propio cuando haya más clientes.
- [ ] **La dueña crea su cuenta** en la app de clientes y se le da el rol de administración (se hace con una consulta a la base de datos; hace falta su correo). Después ella cambia los roles del resto del equipo desde *Equipo*.
- [ ] Probar el recorrido completo: solicitud en la web → pedido → cotización → aprobación → compra → cuentas → entrega.

## Todavía no existe (se hará por fases)

- Reportes y gráficos (ventas, ganancia por mes, clientes frecuentes) y cajas por compradora.
- Varias ciudades: la base ya está preparada (todo lleva `ciudad_id`), falta la pantalla para abrir una ciudad nueva.
- Desactivar a una persona del equipo (hoy solo se cambia su rol).
- Términos y condiciones, y las secciones nuevas de la web (Quiénes somos, Compromisos, Dónde llegamos, Preguntas frecuentes): necesitan tu aprobación y tus datos legales.
- Enviar correos desde el sistema (copia de la respuesta a un reclamo, avisos): requiere un servicio de correo propio.

## Decisiones pendientes de la dueña

- **Marca:** ya decidió nombre, lema, logo (con colores del sol), colores, letras y nombre del panel. Faltan los elementos característicos (toldo, cenefa andina, etiquetas, sello) si quiere sumarlos.
- **Estructura de la web:** aprobar Quiénes somos, Nuestros compromisos, Dónde llegamos, Preguntas frecuentes y el pie de página completo con Libro de Reclamaciones.

## Datos que debe entregar la dueña

- Datos legales para el pie de página y los textos legales: razón social (o nombre completo con RUC), RUC, domicilio, correo de contacto, horario y redes. Si falta alguno, no se muestra: no se inventa.
- Consultar "Illari" en el buscador de marcas de INDECOPI antes de registrarla.
- Paquetes reales: nombres y contenido.
- Modelo de cobro del servicio (solo para el panel; no se publica).
- Confirmar con un asesor legal el Libro de Reclamaciones (plazo de 15 días hábiles, datos obligatorios y la entrega de copia al consumidor) y revisar la página de Privacidad.
- Completar `apps/web/src/lib/empresa.ts` con los datos legales; mientras estén vacíos no se muestran.
