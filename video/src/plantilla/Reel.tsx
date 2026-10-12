import "@fontsource/montserrat/800.css";
import "@fontsource/montserrat/900.css";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  AbsoluteFill,
  Audio,
  continueRender,
  delayRender,
  interpolate,
  OffthreadVideo,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { ConfigReel, Palabra, Tono } from "./tipos";

const W = 1080;
const H = 1920;
const VERDE = "#3DFF8A";
const ROJO = "#FF3B3B";
const AMARILLO = "#FFE600";
const FUENTE = "Montserrat, sans-serif";

// Zonas seguras de Reels/TikTok: la interfaz tapa ~250 px arriba y ~420 px abajo.
const SEGURO_ARRIBA = 270;
const SUBTITULOS_Y = 1170;

const Cfg = createContext<ConfigReel | null>(null);
const useCfg = () => useContext(Cfg)!;

const contorno = (px: number): React.CSSProperties => ({
  WebkitTextStroke: `${px}px #000`,
  paintOrder: "stroke fill",
  textShadow: "0 6px 18px rgba(0,0,0,.55)",
});

const limpiar = (w: string) => w.toLowerCase().replace(/[^\wáéíóúñü]/gi, "");

const fondoDe = (t: Tono) => (t === "rojo" ? ROJO : t === "verde" ? VERDE : "#fff");
const colorDe = (t: Tono) => (t === "rojo" ? "#fff" : "#000");

/* ---------- Cámara virtual: zooms y sacudidas ---------- */
const Camara: React.FC = () => {
  const cfg = useCfg();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const tomas = cfg.tomas;

  let i = 0;
  while (i + 1 < tomas.length && tomas[i + 1].desde <= t) i++;
  const toma = tomas[i];
  const previa = tomas[Math.max(0, i - 1)];
  const fin = tomas[i + 1]?.desde ?? cfg.datos.duration;
  const dentro = t - toma.desde;

  // Empuje lento dentro de la toma y golpe de zoom en los momentos fuertes.
  const empuje = interpolate(dentro, [0, fin - toma.desde], [0, 0.04], { extrapolateRight: "clamp" });
  const entrada =
    toma.golpe && i > 0
      ? spring({ frame: frame - Math.round(toma.desde * fps), fps, config: { damping: 14, stiffness: 220 } })
      : 1;
  const z = (toma.golpe ? previa.zoom + (toma.zoom - previa.zoom) * entrada : toma.zoom) + empuje;

  const f = cfg.caras[toma.foco];
  const k = Math.min(1, (z - 1) / 0.5) * 0.7;
  const objetivoX = f.x + (W / 2 - f.x) * k;
  const objetivoY = f.y + (700 - f.y) * k * 0.5;
  let tx = Math.min(0, Math.max(W - W * z, objetivoX - f.x * z));
  let ty = Math.min(0, Math.max(H - H * z, objetivoY - f.y * z));

  // Sacudida en el bloqueo.
  if (cfg.bloqueo) {
    const dt = t - cfg.bloqueo.desde;
    if (dt >= 0 && dt < 0.45) {
      const a = 22 * (1 - dt / 0.45);
      tx = Math.min(0, Math.max(W - W * z, tx + Math.sin(frame * 2.7) * a));
      ty = Math.min(0, Math.max(H - H * z, ty + Math.cos(frame * 3.1) * a));
    }
  }

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div style={{ width: W, height: H, transformOrigin: "0 0", transform: `translate(${tx}px, ${ty}px) scale(${z})` }}>
        <OffthreadVideo src={staticFile(cfg.video)} style={{ width: W, height: H }} />
      </div>
    </AbsoluteFill>
  );
};

/* ---------- Subtítulos palabra a palabra ---------- */
const useBloques = () => {
  const cfg = useCfg();
  return useMemo(() => {
    const bloques: Palabra[][] = [];
    for (const l of cfg.datos.lines) {
      let actual: Palabra[] = [];
      l.words.forEach((p, idx) => {
        actual.push(p);
        if (/[,.?!…:]$/.test(p.w) || actual.length === 3 || idx === l.words.length - 1) {
          bloques.push(actual);
          actual = [];
        }
      });
    }
    return bloques;
  }, [cfg]);
};

const Subtitulos: React.FC = () => {
  const cfg = useCfg();
  const bloques = useBloques();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  // Antes de la primera palabra ya se ve el primer bloque (sin pantalla vacía en el fotograma 0).
  const idx =
    t < bloques[0][0].s
      ? 0
      : bloques.findIndex((b, i) => t >= b[0].s && t < (bloques[i + 1]?.[0].s ?? b[b.length - 1].e + 0.6));
  if (idx < 0) return null;
  const b = bloques[idx];
  if (t > b[b.length - 1].e + 0.6) return null;
  const pop = idx === 0 ? 1 : spring({ frame: frame - Math.round(b[0].s * fps), fps, config: { damping: 12, stiffness: 260 } });

  return (
    <div
      style={{
        position: "absolute",
        top: SUBTITULOS_Y,
        left: 60,
        right: 60,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "6px 46px",
        transform: `scale(${0.75 + 0.25 * pop})`,
      }}
    >
      {b.map((p, i) => {
        const limpio = limpiar(p.w);
        const activa = t >= p.s && t < p.e + 0.05;
        const color = cfg.rojas.includes(limpio) ? ROJO : cfg.verdes.includes(limpio) ? VERDE : activa ? AMARILLO : "#fff";
        const texto = p.w.replace(/\.\.\.|…/g, "").replace(/[,.:]$/, "").toUpperCase();
        return (
          <span
            key={i}
            style={{
              fontFamily: FUENTE,
              fontWeight: 900,
              fontSize: 86,
              lineHeight: 1.12,
              color,
              display: "inline-block",
              transform: `scale(${activa ? 1.05 : 1}) rotate(${activa ? -2 : 0}deg)`,
              ...contorno(14),
            }}
          >
            {texto}
          </span>
        );
      })}
    </div>
  );
};

/* ---------- Piezas gráficas ---------- */
const Entra: React.FC<{ desde: number; hasta: number; children: React.ReactNode; top: number }> = ({ desde, hasta, children, top }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  if (t < desde || t > hasta) return null;
  // Lo que empieza en 0 se ve ya en el primer fotograma (miniatura y primer instante).
  const s = desde <= 0 ? 1 : spring({ frame: frame - Math.round(desde * fps), fps, config: { damping: 11, stiffness: 200 } });
  const salida = interpolate(t, [hasta - 0.18, hasta], [1, 0], { extrapolateLeft: "clamp" });
  return (
    <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: salida, transform: `scale(${s}) translateY(${(1 - s) * -40}px)` }}>
      {children}
    </div>
  );
};

const Pastilla: React.FC<{ fondo: string; color?: string; children: React.ReactNode; size?: number }> = ({ fondo, color = "#000", children, size = 54 }) => (
  <div
    style={{
      background: fondo,
      color,
      fontFamily: FUENTE,
      fontWeight: 900,
      fontSize: size,
      padding: "18px 34px",
      borderRadius: 22,
      boxShadow: "0 12px 40px rgba(0,0,0,.45)",
      border: "4px solid #000",
      maxWidth: 960,
      textAlign: "center",
      lineHeight: 1.1,
    }}
  >
    {children}
  </div>
);

const Hook: React.FC = () => {
  const { hook } = useCfg();
  if (!hook) return null;
  return (
    <Entra desde={0} hasta={hook.hasta} top={SEGURO_ARRIBA}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        {hook.lineas.map((l) => (
          <Pastilla key={l.texto} fondo={fondoDe(l.tono)} color={colorDe(l.tono)} size={l.size}>
            {l.texto}
          </Pastilla>
        ))}
      </div>
    </Entra>
  );
};

// Imita la pantalla real de WhatsApp cuando bloquean un número.
const Alerta: React.FC = () => {
  const { alerta } = useCfg();
  if (!alerta) return null;
  return (
    <Entra desde={alerta.desde} hasta={alerta.hasta} top={SEGURO_ARRIBA}>
      <div
        style={{
          width: 980,
          background: "#111B21",
          borderRadius: 34,
          padding: "34px 40px",
          boxShadow: "0 20px 60px rgba(0,0,0,.6)",
          border: "3px solid #2A3942",
          display: "flex",
          gap: 28,
          alignItems: "center",
        }}
      >
        <div style={{ width: 110, height: 110, borderRadius: 999, background: "#25D366", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64, flexShrink: 0 }}>
          🚫
        </div>
        <div style={{ fontFamily: FUENTE, color: "#E9EDEF" }}>
          <div style={{ fontWeight: 900, fontSize: 56, lineHeight: 1.08 }}>{alerta.titulo}</div>
          <div style={{ fontWeight: 800, fontSize: 36, color: "#8696A0", marginTop: 10, lineHeight: 1.2 }}>{alerta.texto}</div>
        </div>
      </div>
    </Entra>
  );
};

const Nombres: React.FC = () => {
  const { nombres = [] } = useCfg();
  return (
    <>
      {nombres.map((n) => (
        <Entra key={n.texto} desde={n.desde} hasta={n.hasta} top={1020}>
          <div style={{ width: "100%", boxSizing: "border-box", display: "flex", justifyContent: n.who === "H" ? "flex-start" : "flex-end", padding: "0 90px" }}>
            <div style={{ background: "rgba(0,0,0,.78)", color: "#fff", fontFamily: FUENTE, fontWeight: 800, fontSize: 38, padding: "12px 24px", borderRadius: 999, borderLeft: `10px solid ${VERDE}` }}>
              {n.texto}
            </div>
          </div>
        </Entra>
      ))}
    </>
  );
};

const Tarjetas: React.FC = () => {
  const { tarjetas = [] } = useCfg();
  return (
    <>
      {tarjetas.map((c) => (
        <Entra key={c.texto} desde={c.desde} hasta={c.hasta} top={SEGURO_ARRIBA}>
          <Pastilla fondo={fondoDe(c.tono)} color={colorDe(c.tono)}>
            {c.texto}
          </Pastilla>
        </Entra>
      ))}
    </>
  );
};

const Chips: React.FC = () => {
  const { chips = [], bloqueo } = useCfg();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!bloqueo) return null;
  const bloqueado = frame / fps >= bloqueo.desde;
  return (
    <>
      {chips.map((c, i) => (
        <Entra key={c.texto} desde={c.desde} hasta={bloqueo.hasta} top={SEGURO_ARRIBA + i * 120}>
          <div style={{ filter: bloqueado ? "grayscale(1) brightness(.7)" : "none", textDecoration: bloqueado ? "line-through" : "none", textDecorationThickness: 8, textDecorationColor: ROJO }}>
            <Pastilla fondo="#fff" size={52}>{c.texto}</Pastilla>
          </div>
        </Entra>
      ))}
    </>
  );
};

const Bloqueo: React.FC = () => {
  const { bloqueo } = useCfg();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!bloqueo) return null;
  const t = frame / fps;
  if (t < bloqueo.desde || t > bloqueo.hasta) return null;
  const f0 = Math.round(bloqueo.desde * fps);
  const flash = interpolate(frame - f0, [0, 10], [0.45, 0], { extrapolateRight: "clamp" });
  const s = spring({ frame: frame - f0, fps, config: { damping: 15, stiffness: 260 } });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: ROJO, opacity: flash }} />
      <AbsoluteFill style={{ boxShadow: `inset 0 0 220px 60px rgba(255,0,0,.55)` }} />
      <div style={{ position: "absolute", top: 880, left: 0, right: 0, display: "flex", justifyContent: "center", transform: `scale(${2.2 - 1.2 * s}) rotate(-8deg)`, opacity: Math.min(1, s * 1.5) }}>
        <div style={{ fontFamily: FUENTE, fontWeight: 900, fontSize: 104, color: ROJO, background: "rgba(255,255,255,.92)", border: `12px solid ${ROJO}`, borderRadius: 26, padding: "10px 36px", letterSpacing: 2, whiteSpace: "nowrap" }}>
          🚫 BLOQUEADO
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Cta: React.FC = () => {
  const { cta, datos } = useCfg();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const latido = 1 + 0.04 * Math.sin((frame / fps) * Math.PI * 3);
  return (
    <Entra desde={cta.desde} hasta={datos.duration + 1} top={SEGURO_ARRIBA}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, transform: `scale(${latido})` }}>
        <Pastilla fondo="#fff" size={56}>{cta.arriba}</Pastilla>
        <Pastilla fondo={VERDE} size={104}>{cta.palabra}</Pastilla>
        <div style={{ fontFamily: FUENTE, fontWeight: 800, fontSize: 44, color: "#fff", ...contorno(8) }}>{cta.sub}</div>
      </div>
    </Entra>
  );
};

const Progreso: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <div style={{ position: "absolute", top: 0, left: 0, height: 12, width: `${(frame / durationInFrames) * 100}%`, background: VERDE, boxShadow: `0 0 18px ${VERDE}` }} />
  );
};

/* ---------- Efectos de sonido ---------- */
const Sfx: React.FC = () => {
  const cfg = useCfg();
  const { fps } = useVideoConfig();
  const sonidos: { t: number; f: string; v: number }[] = [
    { t: 0, f: "whoosh", v: 0.3 },
    ...cfg.tomas.filter((x, i) => x.golpe && i > 0).map((x) => ({ t: x.desde - 0.12, f: "whoosh", v: 0.35 })),
    ...(cfg.tarjetas ?? []).map((c) => ({ t: c.desde, f: c.ding ? "ding" : "pop", v: 0.4 })),
    ...(cfg.chips ?? []).map((c) => ({ t: c.desde, f: "pop", v: 0.45 })),
    ...(cfg.bloqueo ? [{ t: cfg.bloqueo.desde, f: "impact", v: 0.7 }] : []),
    { t: cfg.cta.desde, f: "ding", v: 0.45 },
  ];
  return (
    <>
      {sonidos.map((s, i) => (
        <Sequence key={i} from={Math.max(0, Math.round(s.t * fps))} durationInFrames={30}>
          <Audio src={staticFile(`sfx/${s.f}.wav`)} volume={s.v} />
        </Sequence>
      ))}
    </>
  );
};

export const Reel: React.FC<{ cfg: ConfigReel }> = ({ cfg }) => {
  const [handle] = useState(() => delayRender("Cargando fuentes"));
  useEffect(() => {
    Promise.all([document.fonts.load("900 80px Montserrat"), document.fonts.load("800 40px Montserrat")]).then(() => continueRender(handle));
  }, [handle]);

  return (
    <Cfg.Provider value={cfg}>
      <AbsoluteFill style={{ background: "#000" }}>
        <Camara />
        <Bloqueo />
        <Hook />
        <Alerta />
        <Nombres />
        <Tarjetas />
        <Chips />
        <Cta />
        <Subtitulos />
        <Progreso />
        <Sfx />
      </AbsoluteFill>
    </Cfg.Provider>
  );
};
