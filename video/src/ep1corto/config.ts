import data from "./data.json";
import { CARAS_PODCAST, ConfigReel, crearCuando } from "../plantilla/tipos";

// Corte de 25 s del episodio 1: abre con la consecuencia (el bloqueo) y cierra pidiendo CHECKLIST.
const cuando = crearCuando(data);
const bloqueado = cuando("bloqueado");

export const configEp1Corto: ConfigReel = {
  video: "ep1corto/base.mp4",
  datos: data,
  caras: CARAS_PODCAST,
  // Primer plano desde el fotograma 0; nunca se abre con plano general.
  tomas: [
    { desde: 0, zoom: 1.3, foco: "I" },
    { desde: 1.25, zoom: 1.15, foco: "I" },
    { desde: bloqueado - 0.05, zoom: 1.3, foco: "I", golpe: true },
    { desde: 2.6, zoom: 1.3, foco: "H", golpe: true },
    { desde: 4.2, zoom: 1.0, foco: "W" },
    { desde: 5.85, zoom: 1.15, foco: "I" },
    { desde: cuando("oficiales") - 0.1, zoom: 1.3, foco: "I", golpe: true },
    { desde: 10.1, zoom: 1.15, foco: "H" },
    { desde: cuando("casi") - 0.08, zoom: 1.3, foco: "I", golpe: true },
    { desde: 12.65, zoom: 1.0, foco: "W" },
    { desde: 14.3, zoom: 1.15, foco: "I" },
    { desde: 16.25, zoom: 1.0, foco: "W" },
    { desde: 19.05, zoom: 1.15, foco: "H" },
    { desde: 20.8, zoom: 1.0, foco: "W" },
  ],
  rojas: ["bloqueado", "bloqueando", "piratas", "casi", "nunca", "perder"],
  verdes: ["api", "oficial", "protegemos", "crm", "hoy"],
  alerta: {
    desde: 0,
    hasta: 2.6,
    titulo: "Esta cuenta ya no puede usar WhatsApp",
    texto: "Tu número fue suspendido. Clientes, chats y contactos: fuera.",
  },
  bloqueo: { desde: bloqueado, hasta: 2.6 },
  nombres: [
    { who: "H", desde: 2.7, hasta: 4.4, texto: "HERNANDO · Infibots" },
    { who: "I", desde: 5.9, hasta: 7.5, texto: "INFI · IA de Infibots 🤖" },
  ],
  tarjetas: [
    { desde: 2.67, hasta: 5.6, texto: "❓ ¿POR QUÉ PASA?", tono: "blanco" },
    { desde: cuando("bots"), hasta: 9.6, texto: "🤖 BOTS PIRATAS = RIESGO", tono: "rojo" },
    { desde: cuando("casi"), hasta: 12.6, texto: "⚠️ SIN AVISO PREVIO", tono: "rojo" },
    { desde: cuando("api"), hasta: 16.1, texto: "✅ LA SOLUCIÓN: API OFICIAL", tono: "verde", ding: true },
    { desde: cuando("protegemos"), hasta: 18.95, texto: "🛡️ NÚMERO PROTEGIDO + CRM", tono: "verde" },
  ],
  cta: { desde: cuando("ya"), arriba: "COMENTA 👇", palabra: "CHECKLIST", sub: "📋 ¿Tu número está en riesgo?" },
};
