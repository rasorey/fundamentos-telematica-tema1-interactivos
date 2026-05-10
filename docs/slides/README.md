# Presentación interactiva online

Esta carpeta contiene una versión web paralela y resumida del Tema 1 de Fundamentos de Telemática. No sustituye a la presentación oficial en PowerPoint, que se distribuye por separado en el aula virtual.

## Estructura

- `index.html`: presentación web navegable en formato 16:9.
- `slides.css`: estilo visual de la presentación.
- `slides.js`: navegación, pantalla completa, índice, carga diferida de iframes y renderizado de Forms.
- `forms-config.js`: configuración de enlaces, URLs incrustadas y QR de Microsoft Forms.
- `assets/images/`: imágenes propias para esta versión web, si se añaden.
- `assets/qrs/`: QR de formularios, si se añaden.
- `assets/screenshots/`: capturas propias relacionadas con la presentación web, si se añaden.

## Diferencia con el PowerPoint

El PowerPoint `TEMA_1_mejorado_v6_4.pptx` se mantiene como versión oficial para el aula virtual. Esta versión web está pensada para clases en navegador, sesiones interactivas y acceso directo a simuladores incrustados.

El repositorio no debe contener archivos `.ppt`, `.pptx` ni PDF de las diapositivas.

## Actualizar Microsoft Forms

Edita `forms-config.js` y completa las entradas que correspondan:

```js
servicioDigital: {
  title: "Servicio digital crítico",
  url: "https://forms.office.com/...",
  embedUrl: "https://forms.office.com/Pages/ResponsePage.aspx?...&embed=true",
  qr: "./assets/qrs/servicio-digital.png"
}
```

Campos:

- `url`: enlace normal para abrir el formulario en una pestaña nueva.
- `embedUrl`: enlace de inserción para usar dentro de un `iframe`.
- `qr`: ruta relativa a una imagen QR, si se quiere mostrar.

Si `embedUrl` está vacío, la diapositiva muestra una tarjeta limpia con “Actividad disponible desde el aula virtual”. Si `url` está vacío, no se muestra botón de apertura de Forms.

No añadas afirmaciones sobre anonimato o acceso sin confirmarlas en la configuración real de Microsoft Forms.

## Actualizar QR

Guarda las imágenes QR en:

```text
docs/slides/assets/qrs/
```

Después referencia cada archivo desde `forms-config.js`, por ejemplo:

```js
qr: "./assets/qrs/malla-completa.png"
```

## Cambiar enlaces a simuladores

Los simuladores se cargan en modo incrustado con rutas relativas:

```html
../interactive_examples/packet_switching_delay/?embed=1
```

El botón “Abrir en navegador” usa la ruta normal:

```html
../interactive_examples/packet_switching_delay/
```

Si cambia la estructura del sitio, actualiza ambas URLs.

## Probar localmente

Desde la raíz del repositorio:

```bash
cd docs
python -m http.server 8000
```

Abre:

```text
http://localhost:8000/slides/
```

Controles:

- Flecha derecha / espacio: siguiente diapositiva.
- Flecha izquierda: diapositiva anterior.
- `O`: abrir/cerrar índice.
- `F`: pantalla completa.
- Inicio / Fin: primera o última diapositiva.

## Publicación en GitHub Pages

El workflow del repositorio publica `docs/` como sitio estático. La presentación quedará disponible en:

```text
https://rasorey.github.io/fundamentos-telematica-tema1-interactivos/slides/
```

## Licencia

- Código HTML/CSS/JavaScript: 0BSD.
- Contenido docente propio: CC0 1.0 Universal.
- Recursos externos: mantienen su licencia original y deben documentarse en los créditos correspondientes.
