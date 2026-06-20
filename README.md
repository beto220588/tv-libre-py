# TV Libre Paraguay Web App

Web App simple de TV Libre Paraguay para ver canales y escuchar radios libres desde el navegador.

La aplicacion lee listas JSON locales, muestra TV y Radios en secciones separadas, permite buscar, filtrar por categoria, guardar favoritos en el navegador y recordar el ultimo canal o radio reproducida.

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
- `style.css`: estilos responsive y diseno para TV/control remoto.
- `app.js`: carga de TV/Radios, filtros, favoritos, ultimo visto y reproduccion.
- `channels_paraguay.json`: lista de canales de TV.
- `radios_paraguay.json`: lista de radios.
- `assets/logos/`: logos locales usados por las listas.

## Reproduccion

- TV usa `<video>` y HLS.js para streams `.m3u8`.
- Radios usa `<audio controls>`.
- Radios con `sourceType: "audio"` usan URL directa.
- Radios con `sourceType: "hls_audio"` usan HLS.js si el navegador no soporta HLS nativo.
- Radios con `sourceType: "pls"` intentan leer la primera linea `File1=http://...`.
- Radios con `sourceType: "m3u"` intentan leer el primer stream HTTP valido.
- Radios con `sourceType: "api_hls"` consultan la API de DesdeParaguay y, si el enlace viene incompleto, intentan reconstruir el HLS usando la lista movil publica.

## Publicacion

Esta carpeta esta preparada para publicarse con GitHub Pages. Las rutas usadas por la Web App son relativas:

- `./channels_paraguay.json`
- `./radios_paraguay.json`
- `./style.css`
- `./app.js`
- `./assets/logos/`

La Web App no incluye backend. Solo necesita internet para cargar los streams, consultar APIs publicas de radios cuando corresponda y cargar HLS.js desde CDN.
