"""Prepara un episodio para Remotion.

- Quita los silencios largos entre frases (ritmo de Reel).
- Reescala el vídeo a 1080x1920.
- Calcula el tiempo de cada palabra para los subtítulos.

Uso: python3 scripts/preparar-episodio.py <video.mp4> <guion.json> <carpeta-salida-public> <data.json> [borrar.json]
guion.json: [{"s": inicio, "e": fin, "who": "H"|"I", "text": "..."}] con tiempos del vídeo original.
borrar.json (opcional): [{"desde", "hasta", "x", "y", "w", "h"}] zonas a borrar (texto incrustado por la IA),
en segundos y píxeles del vídeo original.
"""
import json, subprocess, sys, re

video, guion_path, out_dir, data_path = sys.argv[1:5]
borrar = json.load(open(sys.argv[5])) if len(sys.argv) > 5 else []
PAD_IN, PAD_OUT, MAX_GAP, COLA = 0.12, 0.18, 0.30, 1.4

lineas = json.load(open(guion_path, encoding="utf-8"))
dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", video],
                           capture_output=True, text=True).stdout)

# Tramos a conservar: cada frase con un poco de aire, fusionando huecos cortos.
tramos = []
for i, l in enumerate(lineas):
    a = max(0.0, l["s"] - PAD_IN)
    b = min(dur, l["e"] + (COLA if i == len(lineas) - 1 else PAD_OUT))
    if tramos and a - tramos[-1][1] <= MAX_GAP:
        tramos[-1][1] = max(tramos[-1][1], b)
    else:
        tramos.append([a, b])

def remap(t):
    acc = 0.0
    for a, b in tramos:
        if t <= a:
            return acc
        if t <= b:
            return acc + (t - a)
        acc += b - a
    return acc

# Limpieza previa: borra texto incrustado y escala una sola vez con lanczos + nitidez adaptativa.
limpieza = "".join(
    f"delogo=x={b['x']}:y={b['y']}:w={b['w']}:h={b['h']}:enable='between(t,{b['desde']},{b['hasta']})',"
    for b in borrar
)
partes, filtros = [], [f"[0:v]{limpieza}scale=1080:1920:flags=lanczos,cas=strength=0.5,fps=30,split={len(tramos)}" + "".join(f"[src{k}]" for k in range(len(tramos)))]
for k, (a, b) in enumerate(tramos):
    d = b - a
    filtros.append(f"[src{k}]trim={a:.3f}:{b:.3f},setpts=PTS-STARTPTS[v{k}]")
    filtros.append(f"[0:a]atrim={a:.3f}:{b:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.015,afade=t=out:st={max(0, d - 0.02):.3f}:d=0.02[a{k}]")
    partes.append(f"[v{k}][a{k}]")
filtros.append("".join(partes) + f"concat=n={len(tramos)}:v=1:a=1[v][a]")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", video, "-filter_complex", ";".join(filtros),
                "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-crf", "10", "-preset", "slow", "-tune", "film",
                "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", f"{out_dir}/base.mp4"], check=True)

# Palabras con tiempos repartidos según su longitud dentro de cada frase.
salida = []
for l in lineas:
    s, e = remap(l["s"]), remap(l["e"])
    palabras = l["text"].split()
    pesos = [len(re.sub(r"[^\wáéíóúñü]", "", p, flags=re.I)) + 2 for p in palabras]
    total, t = sum(pesos), s
    ws = []
    for p, w in zip(palabras, pesos):
        d = (e - s) * w / total
        ws.append({"w": p, "s": round(t, 3), "e": round(t + d, 3)})
        t += d
    salida.append({"who": l["who"], "s": round(s, 3), "e": round(e, 3), "text": l["text"], "words": ws})

total = sum(b - a for a, b in tramos)
json.dump({"duration": round(total, 3), "lines": salida}, open(data_path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"Original {dur:.1f}s -> editado {total:.1f}s en {len(tramos)} tramos")
