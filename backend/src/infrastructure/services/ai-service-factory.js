const GeminiService = require('./gemini-service');
const PollinationsService = require('./pollinations-service');

class AIServiceFactory {
  static create() {
    const provider = (process.env.AI_PROVIDER || '').toLowerCase();

    if (provider === 'pollinations') {
      return new PollinationsService();
    }

    if (provider === 'gemini') {
      return new GeminiService();
    }

    // Auto-detect based on API key availability
    if (process.env.GEMINI_API_KEY) {
      return new GeminiService();
    } else {
      console.warn('GEMINI_API_KEY is not set in environment variables. Falling back to PollinationsService.');
      return new PollinationsService();
    }
  }
}

module.exports = AIServiceFactory;
