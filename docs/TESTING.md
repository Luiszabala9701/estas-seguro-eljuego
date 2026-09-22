# Pruebas

## Resultado de la entrega

- 66 pruebas de motor, narrativa, interpretación y guardado; incluyen 500 recorridos deterministas y rutas a los veinte finales.
- 15 pruebas de interfaz aprobadas: cinco flujos en Chrome escritorio, Chrome móvil emulado y Edge escritorio.
- 1 prueba de producción sin conexión aprobada, con recarga y restauración de partida.
- Compilación de producción completada con TypeScript estricto.

Las pruebas de navegador se ejecutan con un trabajador para evitar agotar recursos al abrir varias instancias simultáneas en Windows.

## Ejecutar

```sh
npm test
npm run test:e2e
npm run build
```

Las pruebas de navegador usan instalaciones locales de Chrome y Edge con perfiles temporales aislados. La configuración levanta Vite o reutiliza el puerto 5173. No reutiliza sesiones personales. Las capturas se escriben en `output/qa/` y los detalles de fallos en `test-results/`.

## Qué verifica cada nivel

### Motor, interpretación y guardado

- Equivalencia de expresiones, acentos, espacios y mayúsculas.
- Negaciones y frases inciertas separadas de afirmaciones.
- Texto no reconocido sin una declaración inventada.
- Diferencia entre falsedad objetiva y conocimiento del investigador.
- Conflictos entre declaraciones; pruebas desconocidas, privadas y presentadas.
- Fuentes discutidas tratadas como información insuficiente.
- No repetición de confrontaciones ya usadas.
- Historial conservado y correcciones de varias versiones sin bucles.
- Verificación de procedencia con documentos adicionales.
- Reacciones por contexto de escena y prueba, sin acumular beneficios al repetir.
- Recorridos explícitos hasta los veinte finales.
- 100 partidas deterministas por caso, alternando explicación y rectificación, para detectar bloqueos y variables fuera de rango.
- Referencias, variables, evidencia, condiciones, transiciones, finales de respaldo y alcance estático.
- Restauración coherente, recuperación de JSON roto, protección de versiones futuras y migración v1.
- Hallazgos persistentes al repetir; progresión tras un final desfavorable.

Los recorridos aleatorios usan semillas fijas solo en las pruebas. El juego no decide aleatoriamente preguntas, mentiras, reacciones o finales.

### Navegador

Tres perfiles: Chrome escritorio 1440×1000, Chrome con emulación táctil vertical 390×844 y Edge escritorio 1280×900. Se comprueban menú, bloqueos, controles de teclado, opciones, respuesta ambigua, expediente, presentación de pruebas, restauración tras recarga, rectificación, final, desbloqueo y archivo sin spoilers. Se detectan errores JavaScript, solicitudes externas y desbordamiento horizontal.

Se inspeccionan las capturas completas del menú, interrogatorio y final, incluidas las versiones móviles. Las pruebas de confirmación cancelan la eliminación y el reinicio: no borran datos del jugador real.

### Compilación

`tsc --noEmit` exige tipado estricto antes de `vite build`. La producción usa rutas relativas. El service worker generado precarga recursos locales para posteriores cargas sin red; se comprueba por separado sobre `npm run preview`.

## Alcance real

No se afirma haber probado Safari, Firefox o teléfonos físicos. La comprobación automatizada no sustituye una sesión extensa de pruebas narrativas con jugadores. Los finales sí tienen rutas ejecutadas, y las diferencias en relojes, conocimiento, rectificación y procedencia se comprueban con datos reales del motor.

Para agregar un caso, incluir una ruta a cada final y mantener el recorrido sin bloqueos. Para cambiar la persistencia, agregar una prueba de migración desde el formato previo y otra de rechazo seguro de formatos incompatibles.
