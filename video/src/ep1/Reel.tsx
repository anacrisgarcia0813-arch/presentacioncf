import "@fontsource/montserrat/800.css";
import "@fontsource/montserrat/900.css";
import { useEffect, useState } from "react";
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
import {
  BLOQUEO,
  CARAS,
  CHIPS,
  CTA,
  data,
  HOOK,
  NOMBRES,
  ROJAS,
  TARJETAS,
  TOMAS,
  VERDES,
} from "./config";

const W = 1080;
const H = 1920;
const VERDE = "#3DFF8A";
const ROJO = "#FF3B3B";
const AMARILLO = "#FFE600";
const FUENTE = "Montserrat, sans-serif";

const contorno = (px: number): React.CSSProperties => ({
  WebkitTextStroke: `${px}px #000`,
  paintOrder: "stroke fill",
  textShadow: "0 6px 18px rgba(0,0,0,.55)",
});

const limpiar = (w: string) => w.toLowerCase().replace(/[^\wáéíóúñü]/gi, "");

/* ---------- Cámara virtual: zooms y sacudidas ---------- */
const Camara: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  let i = 0;
  while (i + 1 < TOMAS.length && TOMAS[i + 1].desde <= t) i++;
  const toma = TOMAS[i];
  const previa = TOMAS[Math.max(0, i - 1)];
  const fin = TOMAS[i + 1]?.desde ?? data.duration;
  const dentro = t - toma.desde;

  // Empuje lento dentro de la toma y golpe de zoom en los momentos fuertes.
  const empuje = interpolate(dentro, [0, fin - toma.desde], [0, 0.04], { extrapolateRight: "clamp" });
  const entrada = toma.golpe
    ? spring({ frame: frame - Math.round(toma.desde * fps), fps, config: { damping: 14, stiffness: 220 } })
    : 1;
  const z = (toma.golpe ? previa.zoom + (toma.zoom - previa.zoom) * entrada : toma.zoom) + empuje;

  const f = CARAS[toma.foco];
  const k = Math.min(1, (z - 1) / 0.5) * 0.7;
  const objetivoX = f.x + (W / 2 - f.x) * k;
  const objetivoY = f.y + (700 - f.y) * k * 0.5;
  let tx = Math.min(0, Math.max(W - W * z, objetivoX - f.x * z));
  let ty = Math.min(0, Math.max(H - H * z, objetivoY - f.y * z));

  // Sacudida en el bloqueo.
  const dt = t - BLOQUEO.desde;
  if (dt >= 0 && dt < 0.45) {
    const a = 22 * (1 - dt / 0.45);
    tx = Math.min(0, Math.max(W - W * z, tx + Math.sin(frame * 2.7) * a));
    ty = Math.min(0, Math.max(H - H * z, ty + Math.cos(frame * 3.1) * a));
  }

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div style={{ width: W, height: H, transformOrigin: "0 0", transform: `translate(${tx}px, ${ty}px) scale(${z})` }}>
        <OffthreadVideo src={staticFile("ep1/base.mp4")} style={{ width: W, height: H }} />
      </div>
    </AbsoluteFill>
  );
};

/* ---------- Subtítulos palabra a palabra ---------- */
type Palabra = { w: string; s: number; e: number };
const bloques: Palabra[][] = [];
for (const l of data.lines) {
  let actual: Palabra[] = [];
  l.words.forEach((p, idx) => {
    actual.push(p);
    const corte = /[,.?!…:]$/.test(p.w) || actual.length === 3 || idx === l.words.length - 1;
    if (corte) {
      bloques.push(actual);
      actual = [];
    }
  });
}

const Subtitulos: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const idx = bloques.findIndex((b, i) => t >= b[0].s && t < (bloques[i + 1]?.[0].s ?? b[b.length - 1].e + 0.6));
  if (idx < 0) return null;
  const b = bloques[idx];
  if (t > b[b.length - 1].e + 0.6) return null;
  const pop = spring({ frame: frame - Math.round(b[0].s * fps), fps, config: { damping: 12, stiffness: 260 } });

  return (
    <div
      style={{
        position: "absolute",
        top: 1170,
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
        const color = ROJAS.includes(limpio) ? ROJO : VERDES.includes(limpio) ? VERDE : activa ? AMARILLO : "#fff";
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
  const s = spring({ frame: frame - Math.round(desde * fps), fps, config: { damping: 11, stiffness: 200 } });
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

const Hook: React.FC = () => (
  <Entra desde={0} hasta={HOOK.hasta} top={110}>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <Pastilla fondo="#fff" size={54}>{HOOK.linea1}</Pastilla>
      <Pastilla fondo={ROJO} color="#fff" size={104}>{HOOK.linea2}</Pastilla>
      <Pastilla fondo="#fff" size={54}>{HOOK.linea3}</Pastilla>
    </div>
  </Entra>
);

const Nombres: React.FC = () => (
  <>
    {NOMBRES.map((n) => (
      <Entra key={n.texto} desde={n.desde} hasta={n.hasta} top={1020}>
        <div style={{ width: "100%", boxSizing: "border-box", display: "flex", justifyContent: n.who === "H" ? "flex-start" : "flex-end", padding: "0 50px" }}>
          <div style={{ background: "rgba(0,0,0,.78)", color: "#fff", fontFamily: FUENTE, fontWeight: 800, fontSize: 38, padding: "12px 24px", borderRadius: 999, borderLeft: `10px solid ${VERDE}` }}>
            {n.texto}
          </div>
        </div>
      </Entra>
    ))}
  </>
);

const Tarjetas: React.FC = () => (
  <>
    {TARJETAS.map((c) => (
      <Entra key={c.texto} desde={c.desde} hasta={c.hasta} top={260}>
        <Pastilla fondo={c.tono === "rojo" ? ROJO : VERDE} color={c.tono === "rojo" ? "#fff" : "#000"}>
          {c.texto}
        </Pastilla>
      </Entra>
    ))}
  </>
);

const Chips: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const bloqueado = t >= BLOQUEO.desde;
  return (
    <>
      {CHIPS.map((c, i) => (
        <Entra key={c.texto} desde={c.desde} hasta={BLOQUEO.hasta} top={240 + i * 120}>
          <div style={{ filter: bloqueado ? "grayscale(1) brightness(.7)" : "none", textDecoration: bloqueado ? "line-through" : "none", textDecorationThickness: 8, textDecorationColor: ROJO }}>
            <Pastilla fondo="#fff" size={52}>{c.texto}</Pastilla>
          </div>
        </Entra>
      ))}
    </>
  );
};

const Bloqueo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  if (t < BLOQUEO.desde || t > BLOQUEO.hasta) return null;
  const f0 = Math.round(BLOQUEO.desde * fps);
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
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const latido = 1 + 0.04 * Math.sin((frame / fps) * Math.PI * 3);
  return (
    <Entra desde={CTA.desde} hasta={data.duration + 1} top={90}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, transform: `scale(${latido})` }}>
        <Pastilla fondo="#fff" size={56}>COMENTA 👇</Pastilla>
        <Pastilla fondo={VERDE} size={104}>{CTA.palabra}</Pastilla>
        <div style={{ fontFamily: FUENTE, fontWeight: 800, fontSize: 44, color: "#fff", ...contorno(8) }}>{CTA.sub}</div>
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
  const { fps } = useVideoConfig();
  const sonidos: { t: number; f: string; v: number }[] = [
    ...TOMAS.filter((x) => x.golpe).map((x) => ({ t: x.desde - 0.12, f: "whoosh", v: 0.35 })),
    ...TARJETAS.map((c) => ({ t: c.desde, f: c.ding ? "ding" : "pop", v: 0.4 })),
    ...CHIPS.map((c) => ({ t: c.desde, f: "pop", v: 0.45 })),
    { t: BLOQUEO.desde, f: "impact", v: 0.7 },
    { t: CTA.desde, f: "ding", v: 0.45 },
    { t: 0.05, f: "whoosh", v: 0.3 },
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

export const Reel: React.FC = () => {
  const [handle] = useState(() => delayRender("Cargando fuentes"));
  useEffect(() => {
    Promise.all([document.fonts.load("900 80px Montserrat"), document.fonts.load("800 40px Montserrat")]).then(() => continueRender(handle));
  }, [handle]);

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Camara />
      <Bloqueo />
      <Hook />
      <Nombres />
      <Tarjetas />
      <Chips />
      <Cta />
      <Subtitulos />
      <Progreso />
      <Sfx />
    </AbsoluteFill>
  );
};

export const duracionEp1 = data.duration;
