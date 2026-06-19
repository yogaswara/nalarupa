const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

const GenerateImageUseCase = require('../src/usecases/generate-image-usecase');
const Task = require('../src/domain/entities/task');

jest.mock('../src/domain/entities/task');

describe('GenerateImageUseCase', () => {
  let mockTaskRepository;
  let mockGeminiService;
  let generateImageUseCase;

  beforeEach(() => {
    mockTaskRepository = {
      create: jest.fn(),
      updateStatus: jest.fn(),
      getById: jest.fn(),
      updateResult: jest.fn(),
    };
    mockGeminiService = {
      optimizePrompt: jest.fn(),
      generateImage: jest.fn(),
    };
    generateImageUseCase = new GenerateImageUseCase(mockTaskRepository, mockGeminiService);
    jest.clearAllMocks();
    consoleErrorSpy.mockClear();
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('execute', () => {
    it('should throw an error for invalid curriculum text length', async () => {
      await expect(generateImageUseCase.execute('', 'Edu-Cartoon')).rejects.toThrow('Curriculum text must be between 1 and 1000 characters.');
      await expect(generateImageUseCase.execute('a'.repeat(1001), 'Edu-Cartoon')).rejects.toThrow('Curriculum text must be between 1 and 1000 characters.');
    });

    it('should throw an error for invalid style', async () => {
      await expect(generateImageUseCase.execute('Valid text', 'Invalid Style')).rejects.toThrow('Invalid style selected.');
    });

    it('should create a task and return it', async () => {
      Task.mockImplementation(() => ({ id: '123', curriculumText: 'Valid text', style: 'Edu-Cartoon', userId: 'user-1', status: 'pending' }));
      mockTaskRepository.create.mockResolvedValue();

      const result = await generateImageUseCase.execute('Valid text', 'Edu-Cartoon', 'user-1');

      expect(mockTaskRepository.create).toHaveBeenCalledWith(expect.any(Object));
      expect(result).toHaveProperty('id', '123');
      expect(result).toHaveProperty('status', 'pending');
    });
  });

  describe('processImageGeneration', () => {
    it('should use the fast prompt path for short curriculum text', async () => {
      const taskId = '123';
      const curriculumText = 'Valid text';
      const style = 'Edu-Cartoon';
      const imageUrl = 'http://example.com/image.png';

      mockTaskRepository.getById.mockResolvedValue({
        id: taskId,
        curriculumText: curriculumText,
        style: style,
        status: 'pending',
      });
      mockGeminiService.generateImage.mockResolvedValue(imageUrl);

      await generateImageUseCase.processImageGeneration(taskId, curriculumText, style);

      expect(mockGeminiService.optimizePrompt).not.toHaveBeenCalled();
      expect(mockTaskRepository.updateStatus).toHaveBeenCalledWith(taskId, 'processing-image');
      expect(mockGeminiService.generateImage).toHaveBeenCalledWith(expect.stringContaining(curriculumText));
      expect(mockTaskRepository.updateResult).toHaveBeenCalledWith(
        taskId,
        imageUrl,
        expect.stringContaining('CRITICAL: absolutely no text')
      );
    });

    it('should optimize long curriculum text before image generation', async () => {
      const taskId = '123';
      const curriculumText = 'Valid text '.repeat(60);
      const style = 'Edu-Cartoon';
      const optimizedPrompt = 'Optimized Prompt';
      const imageUrl = 'http://example.com/image.png';

      mockTaskRepository.getById.mockResolvedValue({
        id: taskId,
        curriculumText: curriculumText,
        style: style,
        status: 'pending',
      });
      mockGeminiService.optimizePrompt.mockResolvedValue(optimizedPrompt);
      mockGeminiService.generateImage.mockResolvedValue(imageUrl);

      await generateImageUseCase.processImageGeneration(taskId, curriculumText, style);

      expect(mockTaskRepository.updateStatus).toHaveBeenCalledWith(taskId, 'processing-LLM');
      expect(mockGeminiService.optimizePrompt).toHaveBeenCalledWith(curriculumText, style);
      expect(mockTaskRepository.updateStatus).toHaveBeenCalledWith(taskId, 'processing-image');
      expect(mockGeminiService.generateImage).toHaveBeenCalledWith(optimizedPrompt);
      expect(mockTaskRepository.updateResult).toHaveBeenCalledWith(taskId, imageUrl, optimizedPrompt);
    });

    it('should handle inappropriate content detection', async () => {
      const taskId = '123';
      const curriculumText = 'Inappropriate text '.repeat(60);
      const style = 'Edu-Cartoon';
      const inappropriateMessage = 'Inappropriate Content Detected';

      mockTaskRepository.getById.mockResolvedValue({
        id: taskId,
        curriculumText: curriculumText,
        style: style,
        status: 'pending',
      });
      mockGeminiService.optimizePrompt.mockResolvedValue(inappropriateMessage);

      await generateImageUseCase.processImageGeneration(taskId, curriculumText, style);

      expect(mockTaskRepository.updateStatus).toHaveBeenCalledWith(taskId, 'processing-LLM');
      expect(mockGeminiService.optimizePrompt).toHaveBeenCalledWith(curriculumText, style);
      expect(mockTaskRepository.updateStatus).toHaveBeenCalledWith(taskId, 'failed', inappropriateMessage);
      expect(mockGeminiService.generateImage).not.toHaveBeenCalled();
      expect(mockTaskRepository.updateResult).not.toHaveBeenCalled();
    });

    it('should handle errors during LLM processing', async () => {
      const taskId = '123';
      const curriculumText = 'Valid text '.repeat(60);
      const style = 'Edu-Cartoon';
      const errorMessage = 'LLM error';

      mockTaskRepository.getById.mockResolvedValue({
        id: taskId,
        curriculumText: curriculumText,
        style: style,
        status: 'pending',
      });
      mockGeminiService.optimizePrompt.mockRejectedValue(new Error(errorMessage));

      await generateImageUseCase.processImageGeneration(taskId, curriculumText, style);

      expect(mockTaskRepository.updateStatus).toHaveBeenCalledWith(taskId, 'processing-LLM');
      expect(mockGeminiService.optimizePrompt).toHaveBeenCalledWith(curriculumText, style);
      expect(mockTaskRepository.updateStatus).toHaveBeenCalledWith(taskId, 'failed', errorMessage);
      expect(mockGeminiService.generateImage).not.toHaveBeenCalled();
      expect(mockTaskRepository.updateResult).not.toHaveBeenCalled();
    });

    it('should handle errors during image generation', async () => {
      const taskId = '123';
      const curriculumText = 'Valid text '.repeat(60);
      const style = 'Edu-Cartoon';
      const optimizedPrompt = 'Optimized Prompt';
      const errorMessage = 'Image generation error';

      mockTaskRepository.getById.mockResolvedValue({
        id: taskId,
        curriculumText: curriculumText,
        style: style,
        status: 'pending',
      });
      mockGeminiService.optimizePrompt.mockResolvedValue(optimizedPrompt);
      mockGeminiService.generateImage.mockRejectedValue(new Error(errorMessage));

      await generateImageUseCase.processImageGeneration(taskId, curriculumText, style);

      expect(mockTaskRepository.updateStatus).toHaveBeenCalledWith(taskId, 'processing-LLM');
      expect(mockGeminiService.optimizePrompt).toHaveBeenCalledWith(curriculumText, style);
      expect(mockTaskRepository.updateStatus).toHaveBeenCalledWith(taskId, 'processing-image');
      expect(mockGeminiService.generateImage).toHaveBeenCalledWith(optimizedPrompt);
      expect(mockTaskRepository.updateStatus).toHaveBeenCalledWith(taskId, 'failed', errorMessage);
      expect(mockTaskRepository.updateResult).not.toHaveBeenCalled();
    });
  });
});
