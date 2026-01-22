
import { GoogleGenerativeAI, GenerationConfig, Content } from "@google/genai";

export class GeminiService {
  private genAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async getHilirisasiInsights(prompt: string): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash-latest",
        systemInstruction: "Anda adalah pakar ekonomi industri Indonesia spesialis hilirisasi. Berikan analisis mendalam, data-driven, namun mudah dipahami. Fokus pada nilai tambah, penyerapan tenaga kerja, dan dampak makroekonomi."
      });

      const generationConfig: GenerationConfig = {
        temperature: 0.7,
        topP: 1,
        topK: 1,
        maxOutputTokens: 2048,
      };

      const parts = [
        { text: prompt },
      ];
      
      const result = await model.generateContent({
        contents: [{ role: "user", parts }],
        generationConfig,
      });

      const response = result.response;
      return response.text();
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "Maaf, terjadi kesalahan saat menghubungi asisten AI. Silakan coba lagi nanti.";
    }
  }
}

// Mengambil API key dari environment variables
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not defined in environment variables.");
}

export const geminiService = new GeminiService(apiKey);
