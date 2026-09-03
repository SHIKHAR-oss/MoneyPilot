import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Gemini AI Client Configuration
 * Manages Google Generative AI client lifecycle safely without exposing secrets
 */

let genAIInstance = null;

export const isGeminiConfigured = () => {
  return Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '');
};

export const getGeminiClient = () => {
  if (!isGeminiConfigured()) {
    return null;
  }

  if (!genAIInstance) {
    genAIInstance = new GoogleGenerativeAI(process.env.GEMINI_API_KEY.trim());
  }

  return genAIInstance;
};

export const getGeminiModel = (modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash') => {
  const client = getGeminiClient();
  if (!client) {
    return null;
  }

  return client.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.2
    }
  });
};

export default {
  isGeminiConfigured,
  getGeminiClient,
  getGeminiModel
};
