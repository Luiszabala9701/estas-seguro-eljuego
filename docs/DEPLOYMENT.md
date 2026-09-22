# Subir el juego

El proyecto se publica como web estática. No necesita servidor de aplicación, base de datos, cuentas ni variables secretas.

## Repositorio

Subir los archivos del proyecto, incluyendo `package-lock.json`. `.gitignore` excluye dependencias, compilación, capturas, resultados de pruebas y archivos de entorno. El PDF de referencia no forma parte del proyecto.

## Hosting conectado al repositorio

Configuración de compilación:

| Campo | Valor |
| --- | --- |
| Directorio raíz | Raíz del repositorio |
| Node.js | 22.12 o posterior |
| Instalación | `npm ci` |
| Compilación | `npm run build` |
| Directorio público | `dist` |
| Variables de entorno | Ninguna |

`netlify.toml` ya contiene la configuración para Netlify. Otros servicios que publiquen archivos estáticos pueden usar los mismos valores. El juego no usa rutas de servidor ni requiere reglas de reescritura.

## Subida directa

El contenido de `dist/` es la versión publicable. El ZIP `output/release/estas-seguro-web.zip` contiene esos archivos en su raíz; sirve para servicios con carga manual de sitios estáticos. No subir el código fuente a un hosting que no ejecute la compilación.

## Guardado al cambiar de dirección

El progreso se guarda por navegador y origen. Una partida local en `127.0.0.1` no aparece automáticamente en el dominio publicado. El juego permite exportar su guardado desde Opciones, pero esta versión no incluye importación desde la interfaz.

## Estado de publicación

La versión local está preparada. Para conectar o subir a un repositorio existente hace falta su URL y autorización de acceso a ese destino. No se ha creado un repositorio remoto ni publicado una URL pública sin seleccionar ese destino.
