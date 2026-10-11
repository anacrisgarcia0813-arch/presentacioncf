# Vídeos automáticos con Remotion

Proyecto para crear y editar vídeos con código (React) y renderizarlos en lote.

## 1. Instalar en tu PC (una sola vez)

1. Descarga el repositorio (en GitHub: **Code → Download ZIP**, o `git clone`).
2. Entra en la carpeta `video/` y ejecuta el instalador:
   - **Windows:** clic derecho sobre `instalar-windows.ps1` → **Ejecutar con PowerShell**.
     Instala Node.js LTS, FFmpeg y Git con `winget`, y luego los paquetes del proyecto.
   - **Mac / Linux:** abre una terminal en `video/` y ejecuta `bash instalar-mac-linux.sh`.
3. Cierra y vuelve a abrir la terminal para que se reconozcan `node` y `ffmpeg`.

> Remotion ya trae su propio FFmpeg interno para renderizar; el FFmpeg del sistema
> queda instalado para tareas extra (cortar, convertir, unir clips, extraer audio).

## 2. Uso

| Comando | Qué hace |
|---|---|
| `npm run studio` | Abre el editor visual en el navegador (vista previa en vivo) |
| `npm run render` | Renderiza el vídeo horizontal 1920×1080 → `out/video.mp4` |
| `npm run render:vertical` | Renderiza el vertical 1080×1920 (Reels/TikTok) |
| `npm run lote` | Renderiza **todos** los vídeos de `videos.json` automáticamente |

## 3. Edición automática

Edita `videos.json`: cada entrada es un vídeo con su texto y colores. Añade tantas
como quieras y ejecuta `npm run lote`.

También puedes renderizar uno suelto con datos propios:

```bash
npx remotion render Principal out/mio.mp4 --props='{"titulo":"Hola","subtitulo":"Prueba","colorFondo":"#111","colorTexto":"#fff"}'
```

Para usar imágenes, música o clips, colócalos en `public/` y úsalos en el código con
`staticFile("archivo.mp4")` junto a los componentes `<Video>`, `<Img>` o `<Audio>` de Remotion.

## Archivos

- `src/Root.tsx` – lista de vídeos (composiciones), tamaño, duración y fps.
- `src/Presentacion.tsx` – diseño y animaciones de la plantilla.
- `videos.json` – datos para el renderizado en lote.

## Licencia de Remotion

Gratis para personas, equipos de hasta 3 personas y organizaciones sin ánimo de lucro.
Empresas con 4 o más empleados necesitan licencia: https://remotion.pro
