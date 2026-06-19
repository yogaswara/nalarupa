const AIServiceFactory = require('../src/infrastructure/services/ai-service-factory');
const GeminiService = require('../src/infrastructure/services/gemini-service');
const PollinationsService = require('../src/infrastructure/services/pollinations-service');

jest.mock('../src/infrastructure/services/gemini-service');
jest.mock('../src/infrastructure/services/pollinations-service');

describe('AIServiceFactory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.AI_PROVIDER = '';
    process.env.GEMINI_API_KEY = '';
  });

  it('should return PollinationsService if AI_PROVIDER is pollinations', () => {
    process.env.AI_PROVIDER = 'pollinations';
    const service = AIServiceFactory.create();
    expect(service).toBeInstanceOf(PollinationsService);
  });

  it('should return GeminiService if AI_PROVIDER is gemini', () => {
    process.env.AI_PROVIDER = 'gemini';
    const service = AIServiceFactory.create();
    expect(service).toBeInstanceOf(GeminiService);
  });

  it('should auto-detect GeminiService if AI_PROVIDER is empty but key is present', () => {
    process.env.GEMINI_API_KEY = 'TEST_KEY';
    const service = AIServiceFactory.create();
    expect(service).toBeInstanceOf(GeminiService);
  });

  it('should fall back to PollinationsService if AI_PROVIDER is empty and key is missing', () => {
    const service = AIServiceFactory.create();
    expect(service).toBeInstanceOf(PollinationsService);
  });
});
