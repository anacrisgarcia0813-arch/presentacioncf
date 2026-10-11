import data from "./data.json";

// Posición de cada cara en el lienzo 1080x1920 (H = Hernando, I = Infi).
export const CARAS = {
  H: { x: 308, y: 495 },
  I: { x: 820, y: 480 },
  W: { x: 540, y: 800 }, // plano general
} as const;

export type Foco = keyof typeof CARAS;

// Tomas de cámara virtual. golpe = zoom rápido con whoosh (momento importante).
export type Toma = { desde: number; zoom: number; foco: Foco; golpe?: boolean };

export const TOMAS: Toma[] = [
  { desde: 0, zoom: 1.3, foco: "H" },
  { desde: 1.0, zoom: 1.0, foco: "W" },
  { desde: 2.55, zoom: 1.38, foco: "H", golpe: true },
  { desde: 3.95, zoom: 1.2, foco: "I" },
  { desde: 5.75, zoom: 1.05, foco: "W" },
  { desde: 7.6, zoom: 1.42, foco: "I", golpe: true },
  { desde: 10.2, zoom: 1.25, foco: "H" },
  { desde: 12.05, zoom: 1.6, foco: "I", golpe: true },
  { desde: 12.95, zoom: 1.0, foco: "W" },
  { desde: 14.2, zoom: 1.15, foco: "I" },
  { desde: 17.75, zoom: 1.65, foco: "I", golpe: true },
  { desde: 19.1, zoom: 1.3, foco: "H" },
  { desde: 21.3, zoom: 1.05, foco: "W" },
  { desde: 23.5, zoom: 1.25, foco: "I" },
  { desde: 27.05, zoom: 1.0, foco: "W" },
  { desde: 29.9, zoom: 1.45, foco: "I", golpe: true },
  // 31.3–32.8: zoom cerrado que deja fuera unos subtítulos basura incrustados por Veo.
  { desde: 31.3, zoom: 1.5, foco: "I" },
  { desde: 32.8, zoom: 1.2, foco: "I" },
  { desde: 35.45, zoom: 1.05, foco: "W" },
  { desde: 38.25, zoom: 1.3, foco: "H" },
  { desde: 40.0, zoom: 1.0, foco: "W" },
];

// Colores de palabras clave en los subtítulos.
export const ROJAS = ["bloqueando", "piratas", "casi", "nunca", "bloqueado", "perder"];
export const VERDES = ["oficial", "api", "protegemos", "crm", "instante", "24", "horas", "ventas", "competitivos", "hoy"];

export const HOOK = { hasta: 2.5, linea1: "¿POR QUÉ WHATSAPP ESTÁ", linea2: "BLOQUEANDO", linea3: "NEGOCIOS? 🚫" };

export const NOMBRES = [
  { who: "H" as const, desde: 0.25, hasta: 2.4, texto: "HERNANDO · Infibots" },
  { who: "I" as const, desde: 4.1, hasta: 6.0, texto: "INFI · IA de Infibots 🤖" },
];

// Busca cuándo se dice una palabra (n = ocurrencia).
export const cuando = (palabra: string, n = 1): number => {
  let k = 0;
  for (const l of data.lines)
    for (const w of l.words)
      if (w.w.toLowerCase().replace(/[^\wáéíóúñü/]/gi, "") === palabra && ++k === n) return w.s;
  throw new Error(`Palabra no encontrada: ${palabra}`);
};

export const TARJETAS = [
  { desde: cuando("bots"), hasta: 9.9, texto: "🤖 BOTS PIRATAS = RIESGO", tono: "rojo" as const },
  { desde: cuando("casi"), hasta: 12.9, texto: "⚠️ SIN AVISO PREVIO", tono: "rojo" as const },
  { desde: cuando("api"), hasta: 26.95, texto: "✅ API OFICIAL DE WHATSAPP", tono: "verde" as const, ding: true },
  { desde: cuando("protegemos"), hasta: 29.8, texto: "🛡️ NÚMERO PROTEGIDO + CRM", tono: "verde" as const },
  { desde: cuando("instante"), hasta: 35.3, texto: "⚡ RESPUESTA AL INSTANTE 24/7", tono: "verde" as const },
  { desde: cuando("ventas"), hasta: 38.1, texto: "📈 MÁS VENTAS", tono: "verde" as const },
];

export const CHIPS = [
  { desde: cuando("clientes"), texto: "💬 Clientes" },
  { desde: cuando("cotizaciones"), texto: "📄 Cotizaciones" },
  { desde: cuando("prospectos"), texto: "🎯 Prospectos" },
];

export const BLOQUEO = { desde: cuando("bloqueado"), hasta: 19.1 };
export const CTA = { desde: cuando("ya"), palabra: "WHATSAPP", sub: "👇 y te decimos cómo migrar" };

export { data };
