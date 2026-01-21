
import { GoogleGenerativeAI } from "@google/generative-ai";

export class GeminiService {
  /**
   * Mengambil wawasan terkait hilirisasi industri menggunakan Gemini AI.
   * Mengikuti pedoman terbaru SDK @google/generative-ai.
   */
  async getHilirisasiInsights(prompt: string) {
    try {
      // Inisialisasi klien tepat sebelum panggilan API untuk memastikan penggunaan kunci API terbaru.
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("VITE_GEMINI_API_KEY is not set in .env file");
      }
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-pro"});

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      return text || "Maaf, tidak ada analisis yang dapat dihasilkan.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "Maaf, terjadi kesalahan saat menghubungi asisten AI. Silakan coba lagi nanti.";
    }
  }
}

export const geminiService = new GeminiService();
