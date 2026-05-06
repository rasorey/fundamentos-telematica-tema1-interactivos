# Fundamentos de Telemática · Tema 1 · Ejemplos interactivos

Este repositorio contiene únicamente los ejemplos interactivos web del Tema 1 de Fundamentos de Telemática. Las diapositivas del tema se distribuyen por separado a través del aula virtual.

## Sitio publicado

https://rasorey.github.io/fundamentos-telematica-tema1-interactivos/

## Ejemplos

| Ejemplo | Concepto principal | URL |
|---|---|---|
| `full_mesh_calculator` | Escalabilidad de mallas completas | https://rasorey.github.io/fundamentos-telematica-tema1-interactivos/interactive_examples/full_mesh_calculator/ |
| `transmission_vs_propagation` | Tiempo de transmisión y tiempo de propagación | https://rasorey.github.io/fundamentos-telematica-tema1-interactivos/interactive_examples/transmission_vs_propagation/ |
| `circuit_switching` | Conmutación de circuitos | https://rasorey.github.io/fundamentos-telematica-tema1-interactivos/interactive_examples/circuit_switching/ |
| `message_switching` | Conmutación de mensajes y almacenamiento/reenvío | https://rasorey.github.io/fundamentos-telematica-tema1-interactivos/interactive_examples/message_switching/ |
| `packet_switching_delay` | Conmutación de paquetes, pipeline, overhead y retardo | https://rasorey.github.io/fundamentos-telematica-tema1-interactivos/interactive_examples/packet_switching_delay/ |
| `datagram_vs_virtual_circuit` | Datagrama frente a circuito virtual | https://rasorey.github.io/fundamentos-telematica-tema1-interactivos/interactive_examples/datagram_vs_virtual_circuit/ |

## Uso local

```bash
cd docs
python -m http.server 8000
```

Después abre:

http://localhost:8000/

## Publicación en GitHub Pages

Este repositorio incluye el workflow `.github/workflows/pages.yml`, que publica el contenido de `docs/` como sitio estático.

Si necesitas crearlo manualmente:

```bash
gh auth login
cd fundamentos-telematica-tema1-interactivos
git init
git add .
git commit -m "Initial public interactive examples for Tema 1"
gh repo create fundamentos-telematica-tema1-interactivos --public --source=. --remote=origin --push
```

Después activa GitHub Pages desde:

Settings → Pages → Build and deployment → GitHub Actions

## Licencia

Este repositorio usa doble licencia:

- Código fuente HTML/CSS/JavaScript: 0BSD.
- Contenido docente original incluido en las páginas, diagramas propios, capturas propias y documentación docente: CC0 1.0 Universal.

Las diapositivas del tema se distribuyen aparte en el aula virtual y no forman parte del repositorio.

Las imágenes o recursos externos mantienen su licencia original y se documentan en `docs/assets/credits/IMAGE_CREDITS.md`.

## Cómo citar

Consulta `CITATION.cff`. Aunque la atribución no sea obligatoria para el material CC0, se agradece citar la fuente en contextos docentes.

## Aviso

Las diapositivas completas del tema se distribuyen a través del aula virtual. Este sitio contiene solo los ejemplos interactivos.
