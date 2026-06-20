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

## Canales Solo APK

Algunos canales pueden funcionar en la APK Android con ExoPlayer, pero no en la Web App por restricciones CORS del servidor del stream. En esos casos el JSON conserva la URL y `working: true`, pero agrega:

- `webWorking: false`
- `webNote`: mensaje visible para la Web App

La Web App muestra la etiqueta `Solo APK` y no intenta reproducir esos canales con HLS.js. Esto evita que GitHub Pages parezca roto cuando el bloqueo viene del servidor externo.

Canales marcados actualmente como Solo APK:

- Gen
- RQP Paraguay
- SNT

## Embeds Oficiales

La Web App tambien puede probar un reproductor web alternativo mediante iframe oficial por canal. Para eso el canal debe tener:

- `webPlayerType: "iframe"`
- `webEmbedUrl`: URL oficial del reproductor o pagina en vivo

Cuando `webPlayerType` es `iframe`, la Web App no usa HLS.js para ese canal y carga el iframe dentro del area del reproductor. Esta tecnica se esta probando inicialmente con C9N:

- C9N: `https://www.c9n.com.py/envivo/`

Si el iframe oficial no carga o el sitio bloquea ser embebido, la Web App muestra un mensaje de reproductor no disponible.

En una etapa futura se pueden reactivar en Web usando un Cloudflare Worker o un HLS CORS Proxy que agregue headers CORS y reescriba playlists/segmentos cuando sea necesario.

## Publicacion

Esta carpeta esta preparada para publicarse con GitHub Pages. Las rutas usadas por la Web App son relativas:

- `./channels_paraguay.json`
- `./radios_paraguay.json`
- `./style.css`
- `./app.js`
- `./assets/logos/`

La Web App no incluye backend. Solo necesita internet para cargar los streams, consultar APIs publicas de radios cuando corresponda y cargar HLS.js desde CDN.
