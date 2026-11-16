# Dirección de arte

## Concepto: hoy vamos al mercado por ti

El servicio existe porque alguien madruga para que el cliente no tenga que hacerlo. La página lo cuenta como una película corta: la pantalla queda fija y el scroll hace avanzar la escena hasta que amanece.

**Nombre: Illari**, "amanecer" en quechua. Aprobado por la dueña. Antes de registrar la marca hay que consultarla en INDECOPI: existen Illari S.A.C. (exportadora de productos del mar, Lima) y una línea de quesos "Illari" de La Cabrita; ninguna es del rubro de compras por encargo.

## Decisiones de la dueña (no negociables)

- **Sin fondos oscuros.** Todos los fondos son claros.
- **Los efectos actuales se quedan:** apertura 3D en tres actos, carrusel horizontal, pasos con número grande.
- **Illa no es 3D.** Es una ilustración que se ve entera y que acompaña y guía al cliente.
- **Ningún texto se sale ni se encima** con otro texto, con los productos ni con la cabecera.
- **Tono cálido y humano.** Nada de frases que suenen a robot.
- Rechazó dos paletas (índigo/magenta y rosa/menta con Bodoni) y dos tipografías (Bricolage, Bodoni).

## Estilos en evaluación

Hay tres estilos de color y letra, intercambiables con el selector temporal de la página (`Estilos.tsx`) o con `?estilo=`. Cuando la dueña elija, se borran los otros dos y el selector.

| Estilo | Color de acción | Fondos | Letras |
|---|---|---|---|
| **Huerta** (propuesto) | Mandarina `#d9480f` | Blanco cálido, verde hoja muy claro, mantequilla | Fraunces + Plus Jakarta Sans |
| Sol | Azul cobalto `#2447d6` | Blanco, amarillo sol, celeste | Outfit + DM Sans |
| Rocoto | Rojo rocoto `#c81e2b` | Crema, durazno, oliva claro | Young Serif + Figtree |

Reglas comunes: un solo color de acción por estilo; el resto son neutros y superficies claras. Tres pesos de letra como máximo (400, 500, 600). Títulos con interlineado 1.1; texto 1.55. Cuerpo de 16 px; nada por debajo de 12 px.

## Logo

Un sol que amanece y cuyos rayos son hojas, sobre una línea de horizonte, junto al nombre en minúsculas. "Illari" es amanecer; las hojas dicen que lo que llega es fresco. Está en `packages/ui/src/Logo.tsx` y como ícono en `apps/web/src/app/icon.svg`.

## Illa

La compradora. Ilustración de la cabeza a la cintura, con mandil del color de acción. Tres gestos: saluda, lleva la canasta, celebra. En la web:

- Aparece abajo a la derecha, dice una frase al llegar a cada sección y se calla sola a los siete segundos.
- Ofrece "Ayúdame a elegir": pregunta cómo le gusta comprar a la persona, le recomienda una forma y la lleva al pedido con esa opción ya marcada.
- En "Quién compra" aparece grande con su canasta; al enviar el pedido, celebra.
- En celular espera a que termine la portada para no tapar los botones.

## Voz

De tú a tú, como habla una casera de confianza: "Duerme un ratito más", "Tú mandas, nosotras compramos", "así mismito te lo traemos". Frases cortas, sin tecnicismos. Los errores del formulario también: "Dinos cómo te llamas".

## Estructura: escenas, no secciones apiladas

1. **Apertura fija en tres actos** (3D): racimo de productos → vuelo entre los productos → repisa al amanecer. Texto y productos ocupan zonas distintas de la pantalla.
2. **Manifiesto.**
3. **Formas de comprar:** carrusel horizontal que avanza con el scroll.
4. **Cómo funciona:** pantalla fija con un número que cambia del 1 al 4.
5. **Quién compra:** Illa, cinta de palabras y los tres criterios.
6. **Pedir:** formulario que abre WhatsApp con el pedido escrito.

## Movimiento

Duraciones de 150, 200 o 300 ms; entra con salida suave y sale con entrada suave; solo se anima posición y opacidad. Lo que depende del scroll lo controla la persona. Con `prefers-reduced-motion` se detiene el giro continuo, la cinta, el parpadeo y el saludo.

## 3D

Productos modelados con geometría propia en Three.js (`apps/web/src/tres`), sin modelos ni texturas descargadas. El lienzo solo dibuja cuando está a la vista.

## Panel y app

Mismos tokens, logo e Illa. Ninguno usa fondos oscuros.
