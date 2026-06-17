# TV Libre Paraguay Web App

Web App simple de TV Libre Paraguay para ver canales libres en vivo desde el navegador.

La aplicacion lee la lista local `channels_paraguay.json`, muestra canales por categoria, permite buscar, guardar favoritos en el navegador y reproducir streams HLS `.m3u8` usando HLS.js.

## Probar localmente

Desde esta carpeta:

```bash
python -m http.server 8080
```

Luego abrir:

```text
http://localhost:8080
```

No abras `index.html` con doble clic, porque el navegador puede bloquear `fetch()` al cargar archivos locales.

## Archivos principales

- `index.html`: estructura de la Web App.
- `style.css`: estilos responsive y diseño para TV/control remoto.
- `app.js`: carga de canales, filtros, favoritos y reproduccion HLS.
- `channels_paraguay.json`: lista de canales usada por la Web App.
- `assets/logos/`: logos locales usados por la lista.

## Publicacion

Esta carpeta esta preparada para publicarse con GitHub Pages. Las rutas usadas por la Web App son relativas:

- `./channels_paraguay.json`
- `./style.css`
- `./app.js`
- `./assets/logos/`

La Web App no incluye backend. Solo necesita internet para cargar los streams `.m3u8` y la libreria HLS.js desde CDN.
