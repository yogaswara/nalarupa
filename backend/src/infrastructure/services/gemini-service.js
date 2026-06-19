const { GoogleGenAI } = require('@google/genai');
const fs = require('fs/promises');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

class GeminiService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment variables.');
    }
  }

  async optimizePrompt(curriculumText, style) {
    const prompt = `Based on the following curriculum text and desired style, generate a detailed and appropriate image prompt. Ensure the prompt is safe for school environments (SFW). If the content is inappropriate, clearly state "Inappropriate Content Detected."\n\nCurriculum Text: ${curriculumText}\nStyle: ${style}\n\nImage Prompt:`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      // Extract text safely — response.text may be undefined in some SDK versions
      let text = response.text;
      if (typeof text !== 'string') {
        // Fallback: extract from candidates parts
        const parts = response.candidates?.[0]?.content?.parts || [];
        const textPart = parts.find(p => p.text);
        text = textPart?.text || '';
      }

      if (!text) {
        throw new Error('Gemini returned an empty response.');
      }

      if (text.includes("Inappropriate Content Detected")) {
        throw new Error(text);
      }
      return text.trim();
    } catch (error) {
      console.error('Error optimizing prompt with Gemini:', error);
      throw new Error('Failed to optimize prompt or detected inappropriate content.');
    }
  }

  async generateImage(imagePrompt) {
    try {
      const response = await ai.models.generateContent({
        model: process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image",
        contents: imagePrompt,
      });

      const parts = response.candidates?.[0]?.content?.parts || [];
      const imagePart = parts.find(part => part.inlineData);

      if (!imagePart) {
        throw new Error("No image returned by Gemini.");
      }

      const imageBytes = imagePart.inlineData.data;

      const imageFileName = `nalarupa-${uuidv4()}.png`;
      const imageFilePath = path.join(__dirname, '..', '..', '..', 'public', 'uploads', imageFileName);

      await fs.mkdir(path.dirname(imageFilePath), { recursive: true });
      await fs.writeFile(imageFilePath, Buffer.from(imageBytes, 'base64'));

      return `/uploads/${imageFileName}`;

    } catch (error) {
      console.error('Error generating image with Gemini:', error);
      throw new Error('Failed to generate image or retrieve image URL from Gemini.');
    }
  }
}

module.exports = GeminiService;
