const axios = require('axios');
const fs = require('fs/promises');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const REQUEST_TIMEOUT_MS = Number(process.env.AI_PROVIDER_TIMEOUT_MS || 26000);
const TEXT_TIMEOUT_MS = Number(process.env.AI_TEXT_TIMEOUT_MS || 8000);
const IMAGE_WIDTH = Number(process.env.POLLINATIONS_IMAGE_WIDTH || 512);
const IMAGE_HEIGHT = Number(process.env.POLLINATIONS_IMAGE_HEIGHT || 512);
const IMAGE_MODEL = process.env.POLLINATIONS_IMAGE_MODEL || 'flux';

class PollinationsService {
  async optimizePrompt(curriculumText, style) {
    const prompt = `You are Nalarupa, an expert educational image prompt engineer. Your task is to convert curriculum text into a high-quality image generation prompt.

GOAL:
Create educational visuals that help students understand concepts clearly and quickly.
Style: ${style}
Rules: focus on one main concept, concrete visible scene, clean textbook composition, no artistic/cinematic excess.
Never request text, letters, words, labels, captions, numbers, logos, watermarks, signs, posters, or typography.
If the curriculum contains sexual content, drugs, gambling, hate symbols, or extremist content, return exactly: Inappropriate Content Detected.
Return only the image prompt.
Curriculum: ${curriculumText}`;

    try {
      const headers = {
        'Content-Type': 'application/json'
      };
      if (process.env.POLLINATIONS_API_KEY) {
        headers['Authorization'] = `Bearer ${process.env.POLLINATIONS_API_KEY}`;
      }
      const response = await axios.post('https://text.pollinations.ai/', {
        messages: [
          { role: 'user', content: prompt }
        ],
        model: 'openai',
        jsonMode: false
      }, { headers, timeout: TEXT_TIMEOUT_MS });

      // Pollinations text endpoint returns string directly
      const text = typeof response.data === 'string' ? response.data : response.data.choices?.[0]?.message?.content || '';

      if (text.includes("Inappropriate Content Detected")) {
        throw new Error(text);
      }
      const optimizedPrompt = `${text.trim()} Educational illustration, high quality, professional textbook artwork, clean composition, easy to understand, sharp details, bright natural colors. CRITICAL: absolutely no text, no letters, no words, no labels, no captions, no numbers, no typography, no watermark, no logo, no signature.`;
      return optimizedPrompt;
    } catch (error) {
      console.error('Error optimizing prompt with Pollinations:', error);
      throw new Error('Failed to optimize prompt or detected inappropriate content.');
    }
  }

  async generateImage(imagePrompt) {
    try {
      const encodedPrompt = encodeURIComponent(imagePrompt);
      const baseUrl = process.env.POLLINATIONS_API_URL || 'https://gen.pollinations.ai/image/';

      // Ensure baseUrl ends with a slash if prompt is appended directly
      const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
      const seed = Math.floor(Math.random() * 1000000);
      let url = `${normalizedBaseUrl}${encodedPrompt}?width=${IMAGE_WIDTH}&height=${IMAGE_HEIGHT}&seed=${seed}&model=${IMAGE_MODEL}&nologo=true&private=true`;

      if (process.env.POLLINATIONS_API_KEY) {
        url += `&key=${process.env.POLLINATIONS_API_KEY}`;
      }

      const response = await axios.get(url, { responseType: 'arraybuffer', timeout: REQUEST_TIMEOUT_MS });
      const imageBytes = response.data;

      const imageFileName = `nalarupa-${uuidv4()}.png`;
      const imageFilePath = path.join(__dirname, '..', '..', '..', 'public', 'uploads', imageFileName);

      const uploadDir = path.dirname(imageFilePath);
      await fs.mkdir(uploadDir, { recursive: true });
      await fs.writeFile(imageFilePath, Buffer.from(imageBytes));

      return `/uploads/${imageFileName}`;
    } catch (error) {
      console.error('Error generating image with Pollinations:', error);
      throw new Error('Failed to generate image or retrieve image URL from Pollinations.');
    }
  }
}

module.exports = PollinationsService;
