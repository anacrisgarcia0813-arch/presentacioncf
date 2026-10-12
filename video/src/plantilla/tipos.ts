// Configuración de un Reel tipo podcast (Hernando + Infi). Cada episodio exporta un ConfigReel.

export type Palabra = { w: string; s: number; e: number };
export type Linea = { who: string; s: number; e: number; text: string; words: Palabra[] };
export type DatosEpisodio = { duration: number; lines: Linea[] };

export type Foco = "H" | "I" | "W";
export type Toma = { desde: number; zoom: number; foco: Foco; golpe?: boolean };
export type Tono = "rojo" | "verde" | "blanco";

export type ConfigReel = {
  video: string; // ruta dentro de public/
  datos: DatosEpisodio;
  caras: Record<Foco, { x: number; y: number }>;
  tomas: Toma[];
  rojas: string[];
  verdes: string[];
  hook?: { hasta: number; lineas: { texto: string; tono: Tono; size: number }[] };
  alerta?: { desde: number; hasta: number; titulo: string; texto: string };
  nombres?: { who: "H" | "I"; desde: number; hasta: number; texto: string }[];
  tarjetas?: { desde: number; hasta: number; texto: string; tono: Tono; ding?: boolean }[];
  chips?: { desde: number; texto: string }[];
  bloqueo?: { desde: number; hasta: number };
  cta: { desde: number; arriba: string; palabra: string; sub: string };
};

// Busca cuándo se dice una palabra (n = ocurrencia) en los datos del episodio.
export const crearCuando = (datos: DatosEpisodio) => (palabra: string, n = 1): number => {
  let k = 0;
  for (const l of datos.lines)
    for (const w of l.words)
      if (w.w.toLowerCase().replace(/[^\wáéíóúñü/]/gi, "") === palabra && ++k === n) return w.s;
  throw new Error(`Palabra no encontrada: ${palabra}`);
};

// Caras de Hernando (izquierda) e Infi (derecha) en el set del podcast, lienzo 1080x1920.
export const CARAS_PODCAST: ConfigReel["caras"] = {
  H: { x: 308, y: 495 },
  I: { x: 820, y: 480 },
  W: { x: 540, y: 800 },
};
