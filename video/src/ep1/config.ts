import data from "./data.json";
import { CARAS_PODCAST, ConfigReel, crearCuando, Toma } from "../plantilla/tipos";

// Tomas de cámara virtual. golpe = zoom rápido con whoosh (momento importante).
// Tres niveles: 1.0 general, 1.15 medio, 1.3 golpe. Más de 1.3 se ve borroso (Veo entrega 720p).
const TOMAS: Toma[] = [
  { desde: 0, zoom: 1.15, foco: "H" },
  { desde: 1.0, zoom: 1.0, foco: "W" },
  { desde: 2.55, zoom: 1.3, foco: "H", golpe: true },
  { desde: 3.95, zoom: 1.15, foco: "I" },
  { desde: 5.75, zoom: 1.0, foco: "W" },
  { desde: 7.6, zoom: 1.3, foco: "I", golpe: true },
  { desde: 10.2, zoom: 1.15, foco: "H" },
  { desde: 12.05, zoom: 1.3, foco: "I", golpe: true },
  { desde: 12.95, zoom: 1.0, foco: "W" },
  { desde: 14.2, zoom: 1.15, foco: "I" },
  { desde: 17.75, zoom: 1.3, foco: "I", golpe: true },
  { desde: 19.1, zoom: 1.15, foco: "H" },
  { desde: 21.3, zoom: 1.0, foco: "W" },
  { desde: 23.5, zoom: 1.15, foco: "I" },
  { desde: 27.05, zoom: 1.0, foco: "W" },
  { desde: 29.9, zoom: 1.3, foco: "I", golpe: true },
  { desde: 31.3, zoom: 1.15, foco: "I" },
  { desde: 35.45, zoom: 1.0, foco: "W" },
  { desde: 38.25, zoom: 1.15, foco: "H" },
  { desde: 40.0, zoom: 1.0, foco: "W" },
];

// Colores de palabras clave en los subtítulos.
const ROJAS = ["bloqueando", "piratas", "casi", "nunca", "bloqueado", "perder"];
const VERDES = ["oficial", "api", "protegemos", "crm", "instante", "24", "horas", "ventas", "competitivos", "hoy"];

const HOOK: ConfigReel["hook"] = {
  hasta: 2.5,
  lineas: [
    { texto: "¿POR QUÉ WHATSAPP ESTÁ", tono: "blanco", size: 54 },
    { texto: "BLOQUEANDO", tono: "rojo", size: 104 },
    { texto: "NEGOCIOS? 🚫", tono: "blanco", size: 54 },
  ],
};

const NOMBRES: ConfigReel["nombres"] = [
  { who: "H", desde: 0.25, hasta: 2.4, texto: "HERNANDO · Infibots" },
  { who: "I", desde: 4.1, hasta: 6.0, texto: "INFI · IA de Infibots 🤖" },
];

const cuando = crearCuando(data);

const TARJETAS: ConfigReel["tarjetas"] = [
  { desde: cuando("bots"), hasta: 9.9, texto: "🤖 BOTS PIRATAS = RIESGO", tono: "rojo" },
  { desde: cuando("casi"), hasta: 12.9, texto: "⚠️ SIN AVISO PREVIO", tono: "rojo" },
  { desde: cuando("api"), hasta: 26.95, texto: "✅ API OFICIAL DE WHATSAPP", tono: "verde", ding: true },
  { desde: cuando("protegemos"), hasta: 29.8, texto: "🛡️ NÚMERO PROTEGIDO + CRM", tono: "verde" },
  { desde: cuando("instante"), hasta: 35.3, texto: "⚡ RESPUESTA AL INSTANTE 24/7", tono: "verde" },
  { desde: cuando("ventas"), hasta: 38.1, texto: "📈 MÁS VENTAS", tono: "verde" },
];

const CHIPS = [
  { desde: cuando("clientes"), texto: "💬 Clientes" },
  { desde: cuando("cotizaciones"), texto: "📄 Cotizaciones" },
  { desde: cuando("prospectos"), texto: "🎯 Prospectos" },
];

const BLOQUEO = { desde: cuando("bloqueado"), hasta: 19.1 };
const CTA = { desde: cuando("ya"), arriba: "COMENTA 👇", palabra: "WHATSAPP", sub: "👇 y te decimos cómo migrar" };

export const configEp1: ConfigReel = {
  video: "ep1/base.mp4",
  datos: data,
  caras: CARAS_PODCAST,
  tomas: TOMAS,
  rojas: ROJAS,
  verdes: VERDES,
  hook: HOOK,
  nombres: NOMBRES,
  tarjetas: TARJETAS,
  chips: CHIPS,
  bloqueo: BLOQUEO,
  cta: CTA,
};
