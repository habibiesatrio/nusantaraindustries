
import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  /**
   * Mengambil wawasan terkait hilirisasi industri menggunakan Gemini AI.
   * Mengikuti pedoman terbaru SDK @google/genai.
   */
  async getHilirisasiInsights(prompt: string) {
    try {
      // Inisialisasi klien tepat sebelum panggilan API untuk memastikan penggunaan kunci API terbaru.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: "Anda adalah pakar ekonomi industri Indonesia spesialis hilirisasi. Berikan analisis mendalam, data-driven, namun mudah dipahami. Fokus pada nilai tambah, penyerapan tenaga kerja, dan dampak makroekonomi."
        }
      });

      // Mengakses teks langsung dari properti .text sesuai pedoman (bukan method call).
      return response.text || "Maaf, tidak ada analisis yang dapat dihasilkan.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "Maaf, terjadi kesalahan saat menghubungi asisten AI. Silakan coba lagi nanti.";
    }
  }
}

export const geminiService = new GeminiService();
