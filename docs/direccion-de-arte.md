# Dirección de arte

## Concepto: mientras duermes, hacemos tu mercado

El servicio existe porque alguien madruga para que el cliente no tenga que hacerlo. La página lo cuenta como una película corta: la pantalla queda fija y el scroll hace avanzar la escena hasta que amanece.

**Nombre: Illari**, "amanecer" en quechua. Propuesto por Claude; pendiente de confirmación de la dueña. El personaje guía se llama **Illa**.

## Decisiones de la dueña (no negociables)

- **Sin fondos oscuros.** Todos los fondos son claros. El verde profundo se usa solo para texto.
- **Nada genérico:** no ilustraciones planas, no secciones apiladas como plantilla, no poco movimiento.
- Dirección elegida: **cinematográfica 3D**.

## Lo que se tomó de las referencias

- **Shopify Editions:** objetos con presencia propia, expuestos en repisa. De ahí la escena final con los productos ordenados en dos filas.
- **KHY:** una sola idea a pantalla completa, tipografía fina y mucho aire.
- **Kylie Cosmetics:** fondos rosados claros y producto brillante como protagonista.

No se copió composición, tipografía ni color de ninguna.

## Color

| Nombre | Hex | Rol |
|---|---|---|
| Papel | `#fffcf7` | Fondo de lectura |
| Alba | `#ffe9dc` | Rosa del amanecer: apertura |
| Durazno claro | `#ffe3c8` | Superficie cálida (pasos, pie) |
| Menta | `#ddefe6` | Superficie fresca (quién compra) |
| Durazno | `#ffb56b` | La primera luz: fin del amanecer y acentos |
| Menta viva / Limón | `#a9dfc6` / `#f2e277` | Tarjetas del carrusel |
| Tomate | `#e5391f` | Acción principal y números |
| Tinta | `#0b2b24` | Verde profundo, solo texto |

## Tipografía

- **Bodoni Moda** para títulos: fina, de alto contraste, en redonda y cursiva. Enorme, como cabecera de revista.
- **Schibsted Grotesk** para texto y controles.
- Títulos en frases completas. Sin etiquetas en mayúsculas.

## Estructura: escenas, no secciones apiladas

1. **Apertura fija en tres actos** (3D): racimo de productos girando → vuelo entre los productos → repisa al amanecer. El fondo pasa de rosa a durazno.
2. **Manifiesto:** una frase grande.
3. **Formas de comprar:** carrusel horizontal que avanza con el scroll.
4. **Cómo funciona:** pantalla fija con un número gigante que cambia del 1 al 4.
5. **Quién compra:** Illa en 3D, cinta de palabras en movimiento y los tres criterios.
6. **Pedir:** formulario que abre WhatsApp con el pedido escrito.

## 3D

Todo está modelado con geometría propia en Three.js (`apps/web/src/tres`): no hay modelos ni texturas descargadas. Materiales con barniz para el brillo, iluminación de estudio propia. Los lienzos solo dibujan cuando están a la vista.

## Movimiento

Cada animación responde al scroll o a una acción. Con `prefers-reduced-motion` se detiene el giro continuo, la cinta y el seguimiento del puntero; lo que depende del scroll se mantiene porque lo controla la persona.

## Panel y app

Mismos tokens y tipografías. La app: serena y rápida, con Illa en estados vacíos y de éxito. El panel: denso, sobre papel, con tomate solo para acciones y alertas. Ninguno usa fondos oscuros.
