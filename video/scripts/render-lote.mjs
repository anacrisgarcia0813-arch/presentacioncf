// Renderiza todos los vídeos definidos en videos.json, uno tras otro.
// Uso: npm run lote
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const videos = JSON.parse(readFileSync(new URL("../videos.json", import.meta.url), "utf8"));
const extra = process.argv.slice(2);

for (const v of videos) {
  const salida = `out/${v.archivo}.mp4`;
  console.log(`\n▶ Renderizando ${salida} (${v.composicion})`);
  execFileSync(
    "npx",
    ["remotion", "render", v.composicion, salida, `--props=${JSON.stringify(v.props)}`, ...extra],
    { stdio: "inherit", shell: process.platform === "win32" },
  );
}
console.log(`\n✔ ${videos.length} vídeos listos en la carpeta out/`);
