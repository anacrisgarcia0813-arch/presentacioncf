import { Composition } from "remotion";
import { configEp1 } from "./ep1/config";
import { configEp1Corto } from "./ep1corto/config";
import type { ConfigReel } from "./plantilla/tipos";
import { Reel } from "./plantilla/Reel";
import { Presentacion, presentacionSchemaDefaults } from "./Presentacion";

// Reels de la serie: cada uno es una configuración sobre la misma plantilla.
const REELS: { id: string; cfg: ConfigReel }[] = [
  { id: "Ep1", cfg: configEp1 },
  { id: "Ep1Corto", cfg: configEp1Corto },
];

// Cada <Composition> es un vídeo que puedes renderizar.
// Cambia los defaultProps (o pásalos con --props) para generar vídeos automáticamente.
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Principal"
        component={Presentacion}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={presentacionSchemaDefaults}
      />
      <Composition
        id="Vertical"
        component={Presentacion}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={presentacionSchemaDefaults}
      />
      {REELS.map(({ id, cfg }) => (
        <Composition
          key={id}
          id={id}
          component={Reel}
          durationInFrames={Math.ceil(cfg.datos.duration * 30)}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{ cfg }}
        />
      ))}
    </>
  );
};
