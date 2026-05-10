# Changelog

## 1.5.0 - 2026-05-10

- Sustituida la integración de Microsoft Forms en `docs/slides/` por el sistema propio de encuestas de aula desplegado en el VPS.
- Añadido `docs/slides/polls-config.js` con URLs públicas de estudiante y vistas `display` embebibles bajo `https://vps-d05caed1.vps.ovh.net/polls/`.
- Actualizado el visor web para crear overlays `poll` con iframes reales de resultados en directo, botones de respuesta y fallback limpio.
- Añadidos QR públicos de estudiante en `docs/slides/assets/qrs/polls/`.
- Añadida documentación `docs/polls/README.md` para student/display/teacher, borrado de respuestas e integración con la presentación web.
- Confirmado que no se incluyen tokens privados, PowerPoint ni PDF de diapositivas en el repositorio.

## 1.4.1 - 2026-05-10

- Reconstruida `docs/slides/` para que la versión web use fondos renderizados desde `TEMA_1_mejorado_v6_4.pptx`, en lugar de una presentación HTML resumida.
- Añadidos fondos 16:9 de las 67 diapositivas en `docs/slides/assets/slide-backgrounds/` y miniaturas para el índice en `docs/slides/assets/thumbnails/`.
- Añadido `docs/slides/interactions-config.js` con overlays proporcionales para simuladores y números reales de diapositiva.
- Incrustados los seis simuladores con `iframe` sobre la zona de captura de sus diapositivas de laboratorio.
- Ajustada la configuración de Microsoft Forms para permitir inserción por `embedUrl` y fallback limpio cuando no hay URL real.
- Añadido modo diagnóstico con `?debug=1` para revisar overlays, coordenadas y Forms sin URL sin ensuciar el modo presentación.
- Actualizada la documentación de `docs/slides/`, README y portada del sitio para explicar el flujo basado en PowerPoint renderizado.
- Confirmado que el PowerPoint y el PDF siguen fuera del repositorio.

## 1.4.0 - 2026-05-10

- Añadida presentación web paralela en `docs/slides/`.
- Implementada navegación 16:9 en HTML/CSS/JavaScript vanilla, sin backend ni dependencias externas.
- Incrustados los seis simuladores en modo `?embed=1` dentro de diapositivas online con botón “Abrir en navegador” y fallback.
- Añadido `docs/slides/forms-config.js` para configurar URLs normales, URLs de inserción y QR de Microsoft Forms.
- Añadidas diapositivas Forms con fallback limpio cuando no existe `embedUrl`.
- Añadido índice navegable, controles por teclado, botón de pantalla completa y barra de progreso.
- Añadida documentación específica en `docs/slides/README.md`.
- Actualizada la portada del sitio `docs/index.html` con enlace a la presentación interactiva online.
- Confirmado que el PowerPoint y el PDF siguen fuera del repositorio.

## 1.3.5 - 2026-05-09

- Mejorados `circuit_switching` y `message_switching` como micro-laboratorios docentes.
- En `circuit_switching`, añadidas barras de capacidad por enlace con capacidad reservada, usada, ociosa y libre.
- En `circuit_switching`, reforzada la línea temporal establecimiento → transferencia → liberación y la comparación entre usuario activo al 100 % y usuario a ráfagas.
- En `circuit_switching`, mejorado el caso de bloqueo cuando la tasa reservada supera la capacidad disponible por enlace.
- En `message_switching`, añadida visualización de buffers por nodo, ocupación de buffer y cola por nodo.
- En `message_switching`, reforzado el diagrama espacio-tiempo para mostrar que cada nodo espera el mensaje completo antes de reenviarlo.
- En `message_switching`, añadida comparación directa entre mensaje completo y aproximación con paquetes.
- Ajustados ambos modos `?embed=1` para vista 16:9 legible.

## 1.3.4 - 2026-05-09

- Mejorado `datagram_vs_virtual_circuit` para explicar con más claridad datagrama, circuito virtual, estado, rutas, fallo y desorden.
- Añadida edición de costes por enlace y selección explícita de enlace congestionado o fallado.
- Sustituidas rutas predefinidas por decisión de ruta calculada sobre un grafo pequeño.
- Añadida tabla de encaminamiento para modo datagrama con salida preferente, alternativa y coste/estado.
- Añadida tabla de identificadores de circuito virtual con línea de entrada, IdCV de entrada, línea de salida e IdCV de salida.
- Añadida animación de paquetes P1, P2 y P3, con rutas distintas en datagrama y ruta lógica fija en circuito virtual.
- Añadida detección visual de orden esperado, orden real y posible desorden.
- Añadido aviso “reestablecer circuito” cuando un fallo afecta a la ruta original del circuito virtual.
- Ajustado el modo `?embed=1` para vista 16:9 legible.

## 1.3.3 - 2026-05-09

- Mejorado `packet_switching_delay` como laboratorio principal de conmutación de paquetes, pipeline, overhead y retardo.
- Añadido slider visible de tamaño útil del paquete con valor sincronizado en bytes.
- Rediseñado el diagrama espacio-tiempo con escala temporal, nodos por salto y paquetes P1-P4 avanzando por la ruta.
- Diferenciadas visualmente cabecera y payload en la estructura del paquete y en el diagrama.
- Reforzadas las gráficas de eficiencia útil, retardo del último paquete y overhead frente al tamaño de paquete.
- Añadida comparación simultánea entre mensaje sin segmentar, paquetes pequeños y paquetes grandes.
- Añadida solución paso a paso con número de paquetes, overhead, `Ttx` por paquete y llegada del último paquete.
- Sustituido el reto de cálculo simple por un reto de elección de tamaño de paquete para minimizar retardo sin overhead excesivo.
- Ajustado el modo `?embed=1` para vista 16:9 con controles principales, métricas, diagrama y resumen compacto visibles.

## 1.3.2 - 2026-05-09

- Mejorado `transmission_vs_propagation` como micro-laboratorio visual de tiempo de transmisión y tiempo de propagación.
- Añadida una línea temporal explícita con cuatro eventos: empieza a salir el primer bit, sale el último bit, llega el primer bit y llega el último bit.
- Reforzada la visualización simultánea de transmisión y propagación: el paquete aparece como rectángulo ocupando el enlace y los bits extremos se desplazan con la misma velocidad física.
- Añadidas barras comparativas para `Ttx`, `Tprop` y `Ttotal`.
- Añadida la comprobación “sube R 10×” para mostrar que aumenta la tasa y baja `Ttx`, pero `Tprop` no cambia.
- Ajustado el modo `?embed=1` para vista 16:9 compacta, sin scroll vertical de página y con métricas, barras, frases clave, visualización y eventos visibles.
- Probado el ejemplo en modo normal y modo incrustado con Playwright, sin errores JavaScript en consola.

## 1.3.1 - 2026-05-07

- Corregida la animación de `transmission_vs_propagation`: el primer bit y el último bit se propagan ahora con la misma velocidad del medio.
- Ajustado el modelo visual para que el último bit empiece a moverse después de `Ttx`, en lugar de recorrer el enlace con una velocidad aparente distinta.
- Rediseñada la visualización con un rectángulo naranja que representa el paquete ocupando el enlace y con una línea de tiempo donde `Ttx` aparece como intervalo rectangular explícito.
- Añadida una nota docente visible aclarando que la diferencia entre ambos bits es temporal, no física.

## 1.3.0 - 2026-05-07

- Añadido modo “Reto” en los seis simuladores con valores aleatorios, comprobación y pista o solución razonada.
- Reforzado el enfoque de micro-laboratorio: predicción, cálculo, comprobación e interpretación.
- Revisado el modo incrustado `?embed=1` para mantener vistas compactas 16:9.
- Sustituido el vaciado de SVG con `innerHTML` por `replaceChildren()` para evitar patrones frágiles.
- Probadas 19 rutas locales con Chromium/Google Chrome headless: índice, seis ejemplos en modo normal, seis ejemplos con `?embed=1` y seis wrappers `docs/embed/*.html`, sin errores de consola.
- Actualizada la documentación para aclarar que la versión principal de las diapositivas se mantiene limpia y que Microsoft Forms se gestiona fuera del repositorio.
- Confirmado que el repositorio sigue sin contener `.ppt`, `.pptx` ni PDF de diapositivas.

## 1.2.0 - 2026-05-07

- Actualizadas fuentes y documentación para la iteración V4 local de la presentación.
- Sustituida la referencia documental a herramientas de participación externas por Microsoft Forms.
- Añadidas fuentes oficiales para Microsoft Forms, inserción en PowerPoint, compartición mediante enlace/QR, prefijos SI y prefijos binarios.
- Mantenida la separación: el repositorio sigue alojando solo ejemplos interactivos web y documentación asociada, nunca diapositivas.

## 1.1.0 - 2026-05-07

- Convertidos los simuladores en micro-laboratorios guiados con predicción previa, presets, reinicio, explicación dinámica e interpretación del resultado.
- Añadido modo incrustado `?embed=1` para usar los simuladores dentro de una diapositiva 16:9 cuando el entorno de PowerPoint lo permita.
- Añadidas páginas wrapper en `docs/embed/` para facilitar el uso desde complementos o visores que acepten una URL web.
- Mejorado `full_mesh_calculator` con comparación entre malla completa, estrella y red conmutada, gráfica de crecimiento, tabla dinámica y aviso de escalabilidad.
- Reforzado `transmission_vs_propagation` con presets docentes, animación de primer/último bit, barras Ttx/Tprop, pausa/reproducción y mensajes sobre latencia física.
- Mejorado `circuit_switching` con presets de tráfico continuo, tráfico a ráfagas y bloqueo; visualización de capacidad reservada, usada y ociosa.
- Mejorado `message_switching` con buffers, colas, advertencia por capacidad de almacenamiento, diagrama espacio-tiempo y comparación con paquetes.
- Mejorado `packet_switching_delay` con pipeline animado, scrubber temporal, comparación con mensaje sin segmentar, gráficas de eficiencia/retardo/overhead y tablas generadas con nodos HTML.
- Mejorado `datagram_vs_virtual_circuit` con selección de enlace congestionado o fallado, rutas alternativas, fase de establecimiento, tablas dinámicas y generación accesible de filas/celdas.
- Actualizada la documentación para explicar modo normal, modo incrustado, uso desde PowerPoint, uso por QR y distribución mediante aula virtual.
- Preparada integración local V3 de la presentación con datos de impacto, capturas, QR, enlaces públicos y nota de fallback para navegador.
- Actualizadas fuentes para datos de impacto, GitHub Pages, PowerPoint add-ins y licencias.
- Confirmada la exclusión de `.ppt`, `.pptx` y PDF de diapositivas del repositorio.

## 1.0.0 - 2026-05-06

- Creado repositorio público solo para ejemplos interactivos.
- Configurado sitio estático para GitHub Pages.
- Excluidas las diapositivas del repositorio.
- Añadida doble licencia: 0BSD para código y CC0 para contenido docente propio.
- Añadido ejemplo `transmission_vs_propagation`.
- Mejorados ejemplos de conmutación de circuitos, mensajes, paquetes y datagrama frente a circuito virtual.
- Mejorada la visualización de retardos, overhead, pipeline, colas, congestión y jitter.
- Añadidos créditos de imágenes externas; actualmente no se usan imágenes externas.
- Añadidas instrucciones para enlazar desde el aula virtual y desde las diapositivas.
- Añadida actualización local de la presentación con enlaces públicos y QR.
