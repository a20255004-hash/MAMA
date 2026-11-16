# Illari — contexto del proyecto

Servicio de compras por encargo en el **Mercado Grau de Tacna**. El cliente delega su compra a una compradora de confianza que conoce el mercado y elige como para su propia casa. No es un delivery ni un supermercado en línea: es una compra personalizada basada en confianza, calidad y comodidad.

"Illari" ("amanecer" en quechua) es el nombre de la marca, **aprobado por la dueña**. El personaje guía se llama Illa. Antes de registrar la marca hay que consultarla en INDECOPI (hay otras empresas llamadas Illari en rubros distintos).

WhatsApp del negocio: 51 916 973 788 (está en `packages/ui/src/marca.ts`).

## Negocio

- **Quién compra:** al inicio, la mamá de la dueña. Su criterio es la propuesta de valor. Después se incorporan compradoras y repartidores, y luego otras ciudades.
- **Qué se compra:** todo lo que hay en el Mercado Grau (frutas, verduras, tubérculos, carnes, pollo, huevos, abarrotes). El negocio no almacena ni gestiona productos: compra y entrega.
- **Modalidades:** paquetes y combos · mi propia lista · compra delegada · mis caseros de confianza.
- **Recepción:** entrega a domicilio (toda la ciudad de Tacna, movilidad propia) o recojo coordinado en el Mercado Grau.
- **Flujo:** solicitud → coordinación por WhatsApp o llamada → cotización estimada → aprobación → adelanto → compra → liquidación con precios reales → entrega o recojo → cierre.
- **Sustituciones:** nunca se cambia un producto sin autorización previa del cliente (regla por producto: reemplazar por similar, consultar u omitir).

## Reglas que no se rompen

1. **La web comercial no publica condiciones de pago, adelantos ni precios internos.** Eso se coordina directamente con el cliente y vive solo en el panel.
2. **Cotizaciones, adelantos y liquidaciones son lógica de administración.** El cliente ve en su app solo sus propios importes.
3. **El dinero de productos del cliente no es ingreso.** Se registra como fondos de terceros. Ingreso = servicio + delivery. Ganancia = ingreso − costos operativos.
4. **Nada de funciones aparentes.** Todo botón, formulario o gráfico funciona y persiste datos reales.
5. **No inventar datos comerciales** (precios, teléfonos, direcciones, testimonios, cifras) ni integraciones. Lo que falte se deja configurable y se avisa.
6. **El módulo de compras debe ser muy fácil de usar** para una persona no técnica, de pie en el mercado, con el celular.
7. **Toda tabla operativa lleva `ciudad_id`** (y `mercado_id` cuando aplique). Roles previstos: cliente, compradora, repartidor, administrador.
8. **El diseño premium va desde la primera pantalla.** No se construyen interfaces genéricas para "embellecer después".
9. **Sin fondos oscuros.** La dueña lo pidió expresamente: todos los fondos son claros en la web, la app y el panel. El verde profundo es solo para texto.
10. **Se publica en GitHub Pages, no en Vercel.** El sitio es estático: no hay código de servidor (ni server actions ni rutas API).

## Arquitectura

Monorepo con npm workspaces. Un solo producto, tres aplicaciones sobre la misma base de datos y el mismo sistema de diseño.

```
apps/web        Página comercial (Next.js, App Router)      ← fase 1
apps/app        App de clientes, PWA                        ← fase 3
apps/admin      Panel ERP                                   ← fase 2
packages/ui     Tokens, marca, personaje, ilustraciones
packages/db     Acceso a datos, tipos y validaciones (Supabase)
supabase/       Migraciones SQL y datos semilla
docs/           Documentación solo cuando hace falta
```

- **Stack:** TypeScript, Next.js 15 con exportación estática, React 19, Motion (`motion/react`), Three.js con React Three Fiber, Supabase (Postgres + RLS), CSS propio con tokens (sin Tailwind).
- **Publicación:** GitHub Pages mediante `.github/workflows/pages.yml`, en cada cambio de `main`. El repositorio en GitHub se llama `MAMA` (antes `PROYECTO-LUZMILA`); el sitio vive en `/MAMA` y la ruta base se toma sola del nombre del repositorio (`NEXT_PUBLIC_BASE_PATH`). Dirección pública: https://a20255004-hash.github.io/MAMA/
- **Datos:** las apps nunca hablan con Supabase directamente; pasan por `@illari/db`, que corre en el navegador con la clave publicable. Los cambios de esquema van como archivo nuevo en `supabase/migrations/`.
- **Seguridad:** RLS activo en todas las tablas. En el navegador solo se usa la clave publicable. La clave `service_role` no entra al repositorio.
- **Comandos:** `npm run dev` (web en :3000), `npm run build`, `npm run typecheck`.

## Diseño

Dirección de arte completa en `docs/direccion-de-arte.md`; leerla antes de tocar la interfaz. Resumen:

- La página son escenas fijas que avanzan con el scroll: apertura 3D en tres actos, carrusel horizontal, pasos con número grande. **Estos efectos le gustan a la dueña: no quitarlos.**
- **Illa es una ilustración 2D** (`packages/ui/src/Illa.tsx`), no 3D. Debe verse entera y guiar al cliente (frases por sección y ayuda para elegir la forma de compra).
- **Ningún texto puede salirse ni encimarse** con otro elemento. Verificarlo en 360, 375, 768, 1280 y 1440 px antes de entregar.
- **Tono cálido y humano**, de tú a tú, como una casera de confianza. Nada que suene a robot.
- Hay **tres estilos de color y letra en evaluación** (Huerta, Sol, Rocoto) en `packages/ui/src/tokens.css`, con un selector temporal (`apps/web/src/components/Estilos.tsx`). Cuando la dueña elija, borrar los otros dos, el selector y las fuentes sobrantes de `layout.tsx`.
- Rechazados: fondos oscuros, ilustraciones planas de plantilla, secciones apiladas, índigo/magenta, rosa/menta, Bricolage Grotesque y Bodoni Moda.
- Logo: sol que amanece con rayos de hojas (`packages/ui/src/Logo.tsx`).
- El 3D está en `apps/web/src/tres` y usa solo geometría propia.

Reglas de diseño de la dueña (globales): dirección de arte antes del código, nada de plantilla genérica, movimiento con función, responsive, accesible y `prefers-reduced-motion` respetado, verificar en navegador en escritorio y móvil, y decir qué skills se invocaron realmente.

## Forma de trabajo

- Fases funcionales; cada fase se prueba y se corrige antes de avanzar.
- Al entregar: qué se desarrolló, qué funciona, qué pruebas se hicieron, qué queda pendiente.
- Tomar las decisiones técnicas y creativas ya definidas sin consultar cada detalle; ser concreto y no repetir preguntas ya respondidas.
- Idioma del producto y la documentación: español (Perú).

## Estado

Ver `docs/estado.md` (fases, pendientes y datos que debe entregar la dueña).
