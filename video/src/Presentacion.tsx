import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export type PresentacionProps = {
  titulo: string;
  subtitulo: string;
  colorFondo: string;
  colorTexto: string;
};

export const presentacionSchemaDefaults: PresentacionProps = {
  titulo: "Mi primer vídeo",
  subtitulo: "Hecho con Remotion",
  colorFondo: "#0f172a",
  colorTexto: "#ffffff",
};

export const Presentacion: React.FC<PresentacionProps> = ({
  titulo,
  subtitulo,
  colorFondo,
  colorTexto,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const entrada = spring({ frame, fps, config: { damping: 200 } });
  const subtituloOpacidad = interpolate(frame, [20, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const salida = interpolate(
    frame,
    [durationInFrames - 20, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colorFondo,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Helvetica, Arial, sans-serif",
        color: colorTexto,
        opacity: salida,
        textAlign: "center",
        padding: 80,
      }}
    >
      <h1
        style={{
          fontSize: 120,
          margin: 0,
          transform: `translateY(${(1 - entrada) * 60}px) scale(${0.8 + entrada * 0.2})`,
          opacity: entrada,
        }}
      >
        {titulo}
      </h1>
      <p style={{ fontSize: 56, marginTop: 30, opacity: subtituloOpacidad }}>
        {subtitulo}
      </p>
    </AbsoluteFill>
  );
};
