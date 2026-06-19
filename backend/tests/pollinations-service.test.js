const PollinationsService = require('../src/infrastructure/services/pollinations-service');
const axios = require('axios');
const fs = require('fs/promises');

jest.mock('axios');
jest.mock('fs/promises', () => ({
  mkdir: jest.fn(),
  writeFile: jest.fn(),
}));

describe('PollinationsService', () => {
  let service;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PollinationsService();
    process.env.POLLINATIONS_API_URL = '';
    process.env.POLLINATIONS_API_KEY = '';
  });

  describe('optimizePrompt', () => {
    it('should successfully optimize prompt', async () => {
      axios.post.mockResolvedValueOnce({
        data: 'Optimized prompt by pollinations'
      });

      const result = await service.optimizePrompt('Curriculum text', 'Edu-Cartoon');
      expect(result).toContain('Optimized prompt by pollinations');
      expect(result).toContain('CRITICAL: absolutely no text');
      expect(axios.post).toHaveBeenCalledWith(
        'https://text.pollinations.ai/',
        expect.objectContaining({
          model: 'openai',
          messages: expect.any(Array)
        }),
        expect.any(Object)
      );
    });

    it('should send Authorization header if key is present', async () => {
      process.env.POLLINATIONS_API_KEY = 'TEST_KEY';
      axios.post.mockResolvedValueOnce({
        data: 'Optimized prompt'
      });

      await service.optimizePrompt('Curriculum text', 'Edu-Cartoon');
      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer TEST_KEY'
          })
        })
      );
    });

    it('should throw error for inappropriate content', async () => {
      axios.post.mockResolvedValueOnce({
        data: 'Inappropriate Content Detected'
      });

      await expect(service.optimizePrompt('bad text', 'Edu-Cartoon'))
        .rejects.toThrow('Failed to optimize prompt or detected inappropriate content.');
    });
  });

  describe('generateImage', () => {
    it('should successfully download and save image', async () => {
      axios.get.mockResolvedValueOnce({
        data: Buffer.from('imagebytes')
      });

      const result = await service.generateImage('detailed prompt');
      expect(result).toMatch(/^\/uploads\/nalarupa-/);
      expect(fs.mkdir).toHaveBeenCalledTimes(1);
      expect(fs.writeFile).toHaveBeenCalledTimes(1);
    });

    it('should ensure upload directory exists', async () => {
      axios.get.mockResolvedValueOnce({
        data: Buffer.from('imagebytes')
      });

      await service.generateImage('detailed prompt');
      expect(fs.mkdir).toHaveBeenCalledTimes(1);
      expect(fs.writeFile).toHaveBeenCalledTimes(1);
    });

    it('should throw error if download fails', async () => {
      axios.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(service.generateImage('detailed prompt'))
        .rejects.toThrow('Failed to generate image or retrieve image URL from Pollinations.');
    });
  });
});
