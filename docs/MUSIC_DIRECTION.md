# Dirección musical

La música debe acompañar la lectura sin cubrirla. La implementación usa pistas MP3 locales, volumen moderado, reproducción en bucle y un fundido al cambiar de pantalla. El navegador solo inicia el audio después de una acción del jugador.

| Archivo | Uso |
| --- | --- |
| `menu.mp3` | Menú principal y archivo |
| `logros.mp3` | Menú de logros |
| `caso-01.mp3` | *La última llamada* |
| `caso-02.mp3` | *Habitación 309* |
| `caso-03.mp3` | *El testigo imposible* |
| `caso-04.mp3` | *La frecuencia muerta* |
| `caso-05.mp3` | *El último vagón* |
| `finales.mp3` | Desenlaces de todos los casos |
| `logro-desbloqueado.mp3` | Efecto breve al obtener un logro |

Las pistas se empaquetan con el juego y el service worker las guarda para jugar sin conexión después de la primera carga completa. Sus fuentes y autores están registrados en `src/musica/README.md`.
