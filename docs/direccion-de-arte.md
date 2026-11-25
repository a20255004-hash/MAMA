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
- **Eligió el estilo Huerta.**
- **Las frutas de la portada deben verse reales**, no plásticas ni falsas.
- **Illa debe verse dulce y sonriente**; una versión anterior parecía una señora seria.
- **Quiere sonidos** que hagan la experiencia más agradable.
- Rechazó dos paletas (índigo/magenta y rosa/menta con Bodoni) y dos tipografías (Bricolage, Bodoni).

## Estilo: Huerta (elegido por la dueña)

Mandarina `#c7400c` (ajustada: da 5,0:1 con texto blanco, el `#d9480f` original solo 4,3:1) como único color de acción; fondos claros en blanco cálido `#fbfaf4`, verde hoja muy claro `#f1f5e2` / `#e7f1de` y mantequilla `#ffe08a` / `#fff3cf`; texto en verde profundo `#14352a`. 
**Letras (elegidas por la dueña):** **Fredoka** (redondeada y cálida) para títulos y números, **Figtree** para el texto, y **Caveat** como toque a mano en notas cortas y grandes: la etiqueta "Escogido hoy por Illa", el "¡Listo!" del pedido y la despedida "Con cariño, Illa". Las cinco parejas de la primera ronda no la convencieron.

## Logo

**"La i-sol"**, elegido por la dueña: el nombre en minúsculas y un sol de ocho rayos como punto de la primera "i". "Illari" es amanecer. Está en `packages/ui/src/Logo.tsx`; el sol solo es el ícono de la pestaña (`apps/web/src/app/icon.svg`). La posición del sol depende de la letra y está medida para Fredoka 600. El "sol de hojas" (rayos en forma de hoja) queda como símbolo secundario para divisores y sellos.

**Lema:** "Duerme un ratito más. Hoy vamos al mercado por ti." **Panel interno:** "Illari Central". **App de clientes:** "Illari".

## Illa

La compradora. Ilustración de la cabeza a la cintura, pensada para verse **dulce y sonriente**: cara redonda, ojos grandes con brillo, mejillas rosadas, sonrisa abierta, dos trenzas con lazos amarillos, blusa bordada y mandil del color de acción. Tres gestos: saluda, lleva la canasta, celebra. En la web:

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

## 3D y frutas reales

La portada usa **frutas y verduras escaneadas de verdad** (Poly Haven, CC0), con su piel, manchas y brillo natural, iluminadas con un estudio de luces propio. Cada modelo pesa menos de 0,4 MB (texturas de 512 px) y se baja en paralelo al abrir la página. El lienzo solo dibuja cuando está a la vista. Créditos en `apps/web/public/frutas/LICENCIA.txt`.

## Sonido

Sintetizado en el navegador, sin archivos de audio, con volumen bajo y solo tras el primer toque de la persona: un golpecito suave al pulsar botones, un pop cuando Illa habla, una notita que sube en cada paso de "cómo funciona", pajaritos y un acorde tibio cuando sale el sol, y un arpegio alegre al enviar el pedido. Se puede silenciar desde la cabecera y la elección se recuerda.

## Panel y app

Mismos tokens, logo e Illa. Ninguno usa fondos oscuros.
