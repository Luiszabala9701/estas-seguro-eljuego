# Motor narrativo

## Estado y transiciones

`startCase` crea una partida y entra en la escena inicial. `choose` valida que la opción esté visible y que no haya una confrontación pendiente. Los efectos de respuesta se aplican antes de determinar el destino. Después se aplican los efectos de entrada de la nueva escena y se buscan contradicciones.

Cada escena declara capítulo, hora narrativa, tipo, texto, voz, efectos, opciones y, opcionalmente, un dominio de texto o reacciones a pruebas. `variants` permite cambiar el diálogo por condiciones (por ejemplo, reconocer una rectificación voluntaria anterior). Los destinos pueden ser directos o una lista ordenada de condiciones con alternativa obligatoria.

`$ending` evalúa los finales en orden. El último carece de condición y es una salida garantizada. Las rutas narrativas no alteran la cronología objetiva.

## Condiciones y efectos

Condiciones: `all`, `any`, `not`, igualdad de una bandera, valor de una afirmación, prueba conocida por un actor, escena visitada y umbrales narrativos. La afirmación consultada es la última afirmación cierta sobre el tema; `ever` sirve para consultar el historial. Incertidumbres y silencios no sobrescriben hechos concretos.

Efectos: declarar, descubrir/compartir una prueba, establecer una bandera, ajustar sospecha/tensión y recordar. No contienen funciones ni expresiones de JavaScript. El motor no compara IDs de los casos.

## Declaraciones

Una declaración conserva `id`, `caseId`, `characterId`, `questionId`, proposición, valor normalizado, texto original, hora, orden, certeza, estado y fuentes vinculadas. La verificación contra la verdad autoral es interna; no sirve como conocimiento del investigador ni incrementa sospecha por sí sola.

La rectificación conserva todas las versiones previas con estado `rectified`. Genera una nueva versión activa y resuelve las confrontaciones pendientes del mismo hecho. Esto impide que una corrección vuelva a enfrentarse indefinidamente con sus propias versiones anteriores.

## Detección y confrontación

- Dos afirmaciones ciertas del mismo hecho con valores incompatibles generan un conflicto lógico.
- Una fuente confirmada conocida por el investigador puede contradecir una afirmación anterior.
- Una fuente discutida genera `possible / insufficient`: el expediente informa el desacuerdo sin tratarlo como una contradicción confirmada.
- Las reglas de caso declaran conflictos temporales o de relaciones entre hechos distintos, con su rectificación coherente.

Los identificadores de conflicto se construyen a partir de las declaraciones y las fuentes. `used` impide repetir una confrontación ya utilizada. Se muestran citas de las declaraciones reales, no textos inventados para acusar al jugador.

Las salidas son rectificar, explicar un recuerdo incompleto, solicitar procedencia y callar. Explicar registra la explicación pendiente de corroboración; no la convierte en verdad. Algunas fuentes desbloquean documentación adicional si se cuestiona su procedencia.

Las pruebas pueden descubrirse solo para el protagonista. `presentEvidence` agrega conocimiento al investigador y evalúa reacciones particulares de la escena. Cada reacción se aplica una sola vez por combinación escena/prueba; presentar reiteradamente no acumula beneficios.

## Texto libre

`normalize` retira acentos, signos, diferencias de mayúsculas y espacios repetidos. Las expresiones regulares pertenecen a categorías concretas de cada pregunta. La negación contextual bloquea afirmaciones positivas; algunas negaciones completas reconocidas expresan una categoría afirmativa, como «no salí de mi domicilio».

Si aparecen varios lugares o marcadores de incertidumbre, se solicita aclaración. Texto fuera del dominio produce `unknown`, sin declarar un hecho. Todos los dominios incluyen no recuerdo, silencio y otro lugar sin especificar. La confirmación del jugador conserva la frase original junto con la categoría elegida.

Este sistema no cubre todo el español ni busca hacerlo. Las frases complejas pueden exigir una categoría explícita; siempre existe salida sin interpretación automática.

## Agregar un caso

1. Crear un `CaseData` nuevo en `src/cases/` y definir primero verdad, cronología y personajes.
2. Definir hechos con IDs estables y etiquetas legibles. Precisar el alcance temporal de cada proposición.
3. Añadir evidencias, contenido, fuente, fiabilidad y los hechos que realmente permiten probar. No atribuirles inferencias que no contienen.
4. Escribir escenas con alternativas incondicionales y condiciones/effects declarativos.
5. Definir cuatro o más finales ordenados y un final de respaldo. Usar decisiones y fuentes, no solo sospecha.
6. Registrar el caso en `src/cases/index.ts`. El desbloqueo sigue ese orden.
7. Agregar recorridos explícitos a cada final y ejecutar `validateCase`, las pruebas y una revisión visual.

Una futura actualización que retire o cambie IDs ya guardados requiere una migración adicional. Agregar escenas o pruebas con IDs nuevos es compatible con los guardados actuales.
