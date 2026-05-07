# Changelog

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
