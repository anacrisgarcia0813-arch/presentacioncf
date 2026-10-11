import { Composition } from "remotion";
import { Presentacion, presentacionSchemaDefaults } from "./Presentacion";
import { duracionEp1, Reel } from "./ep1/Reel";

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
      <Composition
        id="Ep1"
        component={Reel}
        durationInFrames={Math.ceil(duracionEp1 * 30)}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
