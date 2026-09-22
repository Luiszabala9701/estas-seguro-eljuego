# ¿Estás seguro? El juego

Juego narrativo original en español de investigación criminal y terror psicológico. Tres casos completos, doce finales y un motor determinista que conserva declaraciones, separa los hechos del conocimiento del investigador y abre confrontaciones según las pruebas disponibles.

## Jugar en esta computadora

Abrí **Jugar.cmd** y después **http://127.0.0.1:5173** en Chrome o Edge. Dejá la ventana del servidor abierta mientras jugás. No abras `index.html` con doble clic: el código fuente usa módulos de TypeScript.

También podés iniciar desde una terminal en esta carpeta:

```sh
npm install
npm run dev
```

Requisito de desarrollo: Node.js 22.12 o posterior. La instalación descarga herramientas de desarrollo; el juego terminado no usa Internet, IA, API, cuenta ni backend. Las dependencias ya están instaladas en esta copia del proyecto. El lockfile fija las versiones reproducibles.

## Controles

- Mouse o pantalla táctil: seleccionar opciones y abrir pruebas.
- `1` a `9`: responder a la opción correspondiente.
- `E`: abrir el expediente durante una partida.
- `Tab`, `Enter` y `Espacio`: navegar y activar controles.
- `Escape`: cerrar el expediente o las opciones.
- «Mostrar texto»: completar un diálogo de inmediato.

El texto libre tiene dominios explícitos. La frase original y la interpretación se confirman antes de registrarse. Si el juego no entiende una frase, permite aclarar, reformular, no recordar, callar o elegir otro lugar sin especificarlo.

## Qué incluye

| Caso | Mecánica principal | Finales |
| --- | --- | --- |
| La última llamada | Relación, llamada borrada, pruebas compartidas o reservadas y protección | 4 |
| Habitación 309 | Cronologías con relojes distintos, arma desaparecida y una coartada falsa | 4 |
| El testigo imposible | Procedencia de una imagen, identificación, recuerdos y encubrimiento histórico | 4 |

El primer caso está abierto. Cualquier final, favorable o desfavorable, desbloquea el siguiente. Repetir un caso conserva los hallazgos del archivo; comenzar otro reemplaza la partida activa solo tras confirmación.

Incluye expediente, historial íntegro de declaraciones y rectificaciones, recuerdos, personajes, contradicciones utilizadas, audio ambiental sintetizado opcional, volumen, silencio, texto grande, reducción de movimiento y guardado automático versionado con copia de respaldo.

## Pruebas y compilación

```sh
npm test
npm run test:e2e
npm run build
npm run preview
```

`npm test` ejecuta Vitest. `npm run test:e2e` usa instalaciones locales de Chrome y Edge, con perfiles de prueba aislados. La configuración incluye escritorio y emulación táctil vertical; ver [docs/TESTING.md](docs/TESTING.md).

La compilación lista para publicar queda en **dist/**. `npm run preview` la sirve en **http://127.0.0.1:4173**. Los recursos usan rutas relativas, compatibles con una subcarpeta de GitHub Pages, Netlify o un servidor estático. No se publicó en Internet ni se configuró ningún servicio externo.

La versión de producción agrega un service worker: después de la primera carga completa, puede volver a abrirse sin conexión en ese mismo navegador y origen. El modo de desarrollo requiere el servidor local encendido. El service worker no toma una versión nueva a mitad de una partida; la nueva versión se activa al cerrar las pestañas anteriores.

## Guardado y privacidad

El guardado está en `localStorage`, clave `estas-seguro.save`, con respaldo en `estas-seguro.save.backup`. Se escribe después de cada decisión, confrontación, presentación de pruebas y cambio de opciones. Persiste escenas, conocimientos, declaraciones, evidencias, contradicciones, elecciones, variables, progreso y preferencias.

Cambiar de navegador, puerto u origen crea un almacenamiento separado. Borrar datos del sitio o usar una sesión privada puede eliminar el progreso. Opciones permite exportar el JSON antes de borrar o investigar un problema. La exportación es una copia de seguridad; esta versión no incluye importación desde la interfaz.

Una migración compatible admite el formato v1 del prototipo. Una versión futura desconocida se conserva sin sobrescribir. Si falla el almacenamiento, el juego avisa y permite seguir en memoria y exportar.

## Documentación

- [Diseño y reglas](docs/GAME_DESIGN.md)
- [Arquitectura](docs/ARCHITECTURE.md)
- [Motor narrativo y cómo agregar contenido](docs/NARRATIVE_SYSTEM.md)
- [Historias, cronologías y finales — contiene spoilers](docs/CASES.md)
- [Etapas y alcance](docs/ROADMAP.md)
- [Pruebas y límites de verificación](docs/TESTING.md)
- [Subir al repositorio y publicar](docs/DEPLOYMENT.md)

El arte SVG es original, deliberadamente estilizado y reemplazable. Los registros de audio se presentan mediante transcripciones completas y ambiente sintetizado; no hay voces grabadas. No se necesita ningún recurso externo durante una partida.
