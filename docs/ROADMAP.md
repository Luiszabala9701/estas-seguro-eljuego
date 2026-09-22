# Etapas y alcance

## Implementado

1. **Diseño y arquitectura:** TypeScript estricto, estado separado de UI, datos declarativos, verdad y cronologías de cada caso.
2. **Primer interrogatorio:** respuestas cerradas y abiertas, memoria, dos clases de contradicción y una sala jugable. Verificado antes de ampliar a otros casos.
3. **Primer caso completo:** catorce escenas, rutas de protección/ocultamiento, ocho pruebas y cuatro desenlaces.
4. **Presentación:** menú, selección, expediente, archivo, ilustración local, audio opcional, opciones, responsive y progresión.
5. **Segundo caso:** quince escenas, diez pruebas, relojes incompatibles y cuatro desenlaces.
6. **Tercer caso:** quince escenas, nueve pruebas, procedencia de imágenes y contradicciones encadenadas, cuatro desenlaces.
7. **QA:** recorridos por los veinte finales, 500 partidas deterministas de comprobación, guardados, intérprete, navegadores, capturas de escritorio/móvil y compilación estática.

La entrega incluye el contenido jugable de los cinco casos. Ningún expediente es una pantalla de «próximamente».

## Límites explícitos de esta versión

- Arte vectorial estilizado: no hay retratos fotográficos ni animación facial compleja. Las variantes de investigadores y luz son ilustraciones SVG.
- Audio ambiental sintetizado y transcripciones íntegras: no incluye actuación de voz ni grabaciones habladas.
- El texto libre reconoce dominios seleccionados, no conversación abierta.
- Las duraciones del menú son estimaciones de lectura y exploración, no mediciones con jugadores externos.
- Se exporta el guardado; importar un JSON desde la interfaz queda para una ampliación opcional.
- Las pruebas móviles se realizan con emulación de Chrome. No equivalen a verificar Safari/iOS ni todos los modelos de teléfono.
- No se publicó la web en un dominio. `dist/` está preparado para hosting estático.

## Extensiones posibles

Las nuevas historias pueden añadirse por datos. Una producción posterior puede reemplazar los SVG por arte más detallado, grabar voces con permisos, ampliar escenas reactivas, incorporar perfiles de guardado y realizar pruebas de ritmo con personas. No son requisitos para completar las rutas actuales.
