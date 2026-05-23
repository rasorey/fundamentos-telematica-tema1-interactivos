# Laboratorios interactivos del Tema 4

Código fuente HTML/CSS/JavaScript: 0BSD.  
Contenido docente propio: CC0 1.0 Universal.

Esta carpeta contiene la Fase A de laboratorios interactivos del Tema 4, *Medios físicos de transmisión*:

- `fiber_loss_budget`: presupuesto óptico, pérdidas, sensibilidad y margen.
- `wireless_range_explorer`: pérdida de espacio libre, frecuencia, distancia, obstáculos y margen radio.
- `structured_cabling_builder`: rack, patch panel, canal permanente, canal completo y mantenimiento.

Los laboratorios funcionan como páginas estáticas sin dependencias externas. Cada uno soporta modo normal y modo incrustado:

| Laboratorio | URL pública normal | URL pública embed |
|---|---|---|
| `fiber_loss_budget` | https://rasorey.github.io/fundamentos-telematica-tema1-interactivos/interactive_examples_tema4/fiber_loss_budget/ | https://rasorey.github.io/fundamentos-telematica-tema1-interactivos/interactive_examples_tema4/fiber_loss_budget/?embed=1 |
| `wireless_range_explorer` | https://rasorey.github.io/fundamentos-telematica-tema1-interactivos/interactive_examples_tema4/wireless_range_explorer/ | https://rasorey.github.io/fundamentos-telematica-tema1-interactivos/interactive_examples_tema4/wireless_range_explorer/?embed=1 |
| `structured_cabling_builder` | https://rasorey.github.io/fundamentos-telematica-tema1-interactivos/interactive_examples_tema4/structured_cabling_builder/ | https://rasorey.github.io/fundamentos-telematica-tema1-interactivos/interactive_examples_tema4/structured_cabling_builder/?embed=1 |

## Validación de Fase A

| Laboratorio | Local normal | Local embed | GitHub Pages normal | GitHub Pages embed | Captura |
|---|---|---|---|---|---|
| `fiber_loss_budget` | OK | OK | OK | OK | `assets/screenshots/fiber_loss_budget.png` |
| `wireless_range_explorer` | OK | OK | OK | OK | `assets/screenshots/wireless_range_explorer.png` |
| `structured_cabling_builder` | OK | OK | OK | OK | `assets/screenshots/structured_cabling_builder.png` |

## Capturas para PowerPoint

Las capturas 16:9 se guardan en:

```text
assets/screenshots/
```

Comando documentado para regenerarlas desde la raíz del repositorio:

```bash
python3 -m http.server 8014 --directory docs
npx playwright screenshot --viewport-size=1280,720 http://127.0.0.1:8014/interactive_examples_tema4/fiber_loss_budget/?embed=1 docs/interactive_examples_tema4/assets/screenshots/fiber_loss_budget.png
npx playwright screenshot --viewport-size=1280,720 http://127.0.0.1:8014/interactive_examples_tema4/wireless_range_explorer/?embed=1 docs/interactive_examples_tema4/assets/screenshots/wireless_range_explorer.png
npx playwright screenshot --viewport-size=1280,720 http://127.0.0.1:8014/interactive_examples_tema4/structured_cabling_builder/?embed=1 docs/interactive_examples_tema4/assets/screenshots/structured_cabling_builder.png
```

Las capturas actuales son PNG de 1280×720 generados desde el modo `?embed=1`.

## Laboratorios planificados

No se crean enlaces a laboratorios no implementados. Quedan planificados:

- `copper_cabling_selector`
- `medium_selector`
- `satellite_latency_comparison`
- `usb_interface_explorer`

## Notas docentes

- Los modelos son simplificados y se explican como aproximaciones.
- Las unidades se muestran en todos los resultados principales.
- La viabilidad se expresa con margen suficiente, margen bajo o enlace no viable.
- `fiber_loss_budget` no sustituye una certificación real ni una hoja de datos de transceptores.
- `wireless_range_explorer` no modela con precisión interiores reales, fading ni regulación.
- `structured_cabling_builder` simplifica la instalación para distinguir canal permanente, canal completo y mantenimiento.
- Las diapositivas PowerPoint y los PDF se distribuyen por el aula virtual, no desde este repositorio.
