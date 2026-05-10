# Encuestas de aula del Tema 1

El sistema `telematica-polls` se ejecuta en el VPS y sustituye a Microsoft Forms para las actividades breves de clase. GitHub Pages aloja solo la presentación web, simuladores y configuración pública de enlaces.

## Rutas

- Estudiante: `https://vps-d05caed1.vps.ovh.net/polls/student/tema1-2026/<actividad>`
- Display/resultados: `https://vps-d05caed1.vps.ovh.net/polls/display/tema1-2026/<actividad>`
- Display embebido: `https://vps-d05caed1.vps.ovh.net/polls/display/tema1-2026/<actividad>?embed=1`
- Profesor: `https://vps-d05caed1.vps.ovh.net/polls/teacher/tema1-2026`

La URL de profesor requiere token privado. Ese token no se guarda en este repositorio ni se debe proyectar.

## Actividades

- `servicio-digital-critico`
- `redes-en-una-palabra`
- `videollamada-calidad`
- `malla-completa`
- `conmutacion-circuitos`
- `mensajes-vs-paquetes`
- `transmision-vs-propagacion`
- `servicios-latencia-jitter`
- `datagrama-vs-circuito-virtual`
- `idea-clave-final`

## Integración en la presentación web

`docs/slides/polls-config.js` define la diapositiva y las URLs públicas de cada actividad. La presentación web incrusta la vista `display` en modo `?embed=1` para proyectar resultados agregados en directo. El alumnado responde desde el QR o desde el botón “Responder”.

## Privacidad docente

El sistema no solicita nombre ni correo. Las respuestas se usan para comentar resultados agregados en clase y se eliminan automáticamente tras aproximadamente 60 minutos. En respuestas abiertas se recomienda no introducir información personal.

## Borrado de respuestas

El backend borra periódicamente respuestas antiguas según `RETENTION_MINUTES` y el VPS ejecuta además un cron de respaldo cada 10 minutos. El profesor también puede borrar una actividad o toda la sesión desde la vista privada.

## Actualización

Para cambiar URLs, edita `docs/slides/polls-config.js`. Para cambiar actividades o lógica del backend, actualiza la aplicación desplegada en `/opt/telematica-polls` en el VPS.
