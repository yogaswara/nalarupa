const fs = require('fs/promises');
const path = require('path');

// Mock @google/genai BEFORE requiring GeminiService
const mockGenerateContent = jest.fn();
jest.mock('@google/genai', () => {
  return {
    GoogleGenAI: jest.fn().mockImplementation(() => {
      return {
        models: {
          generateContent: mockGenerateContent,
        },
      };
    }),
  };
});

jest.mock('fs/promises', () => ({
  writeFile: jest.fn(),
  mkdir: jest.fn(),
}));

describe('GeminiService', () => {
  let GeminiService;
  let geminiService;

  beforeAll(() => {
    process.env.GEMINI_API_KEY = 'FAKE_API_KEY';
    // Require GeminiService after setting up environment and mocks
    GeminiService = require('../src/infrastructure/services/gemini-service');
  });

  beforeEach(() => {
    jest.clearAllMocks();
    geminiService = new GeminiService();
  });

  describe('optimizePrompt', () => {
    it('should successfully optimize prompt', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        text: 'Optimized Educational Prompt'
      });

      const result = await geminiService.optimizePrompt('Curriculum text', 'Edu-Cartoon');
      expect(result).toBe('Optimized Educational Prompt');
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    });

    it('should throw error for inappropriate content', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        text: 'Inappropriate Content Detected'
      });

      await expect(geminiService.optimizePrompt('Bad text', 'Edu-Cartoon'))
        .rejects.toThrow('Failed to optimize prompt or detected inappropriate content.');
    });
  });

  describe('generateImage', () => {
    it('should successfully generate image and save locally', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        candidates: [
          {
            content: {
              parts: [
                {
                  inlineData: {
                    data: 'dGVzdC1pbWFnZS1ieXRlcw==', // 'test-image-bytes' in base64
                  }
                }
              ]
            }
          }
        ]
      });

      const result = await geminiService.generateImage('Some prompt');
      expect(result).toMatch(/^\/uploads\/nalarupa-/);
      expect(fs.mkdir).toHaveBeenCalledTimes(1);
      expect(fs.writeFile).toHaveBeenCalledTimes(1);
    });

    it('should throw error if no image returned', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        candidates: []
      });

      await expect(geminiService.generateImage('Some prompt'))
        .rejects.toThrow('Failed to generate image or retrieve image URL from Gemini.');
    });
  });
});
