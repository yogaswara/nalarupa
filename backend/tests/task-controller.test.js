const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });

const TaskController = require('../src/interfaces/controllers/task-controller');
const GenerateImageUseCase = require('../src/usecases/generate-image-usecase');
const ReGenerateImageUseCase = require('../src/usecases/regenerate-image-usecase');
const GetTaskStatusUseCase = require('../src/usecases/get-task-status-usecase');
const SqliteTaskRepository = require('../src/infrastructure/database/sqlite/sqlite-task-repository');

jest.mock('../src/usecases/generate-image-usecase');
jest.mock('../src/usecases/regenerate-image-usecase');
jest.mock('../src/usecases/get-task-status-usecase');
jest.mock('../src/infrastructure/database/sqlite/sqlite-task-repository');

describe('TaskController', () => {
  let req;
  let res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  afterAll(() => {
    consoleWarnSpy.mockRestore();
  });

  describe('generateImage', () => {
    it('should return 202 and task ID on successful image generation request', async () => {
      req.body = { text: 'test text', style: 'Edu-Cartoon' };
      req.header = jest.fn((name) => (name === 'x-visitor-id' ? 'visitor-1' : null));

      GenerateImageUseCase.prototype.execute.mockResolvedValue({ id: '123', status: 'pending' });

      await TaskController.generateImage(req, res);

      expect(GenerateImageUseCase.prototype.execute).toHaveBeenCalledWith('test text', 'Edu-Cartoon', 'visitor-1');
      expect(res.status).toHaveBeenCalledWith(202);
      expect(res.json).toHaveBeenCalledWith({ data: { taskId: '123', status: 'pending' }, success: true, message: 'Task created successfully' });
    });

    it('should return 400 on invalid input', async () => {
      req.body = { text: '', style: 'Edu-Cartoon' };
      req.header = jest.fn((name) => (name === 'x-visitor-id' ? 'visitor-1' : null));

      GenerateImageUseCase.prototype.execute.mockRejectedValue(new Error('Invalid input'));

      await TaskController.generateImage(req, res);

      expect(GenerateImageUseCase.prototype.execute).toHaveBeenCalledWith('', 'Edu-Cartoon', 'visitor-1');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Invalid input' });
    });

    it('should keep concurrent generate requests isolated by visitor ID', async () => {
      const firstReq = {
        body: { text: 'first text', style: 'Edu-Cartoon' },
        header: jest.fn((name) => (name === 'x-visitor-id' ? 'visitor-a' : null)),
      };
      const secondReq = {
        body: { text: 'second text', style: 'Historical Sketch' },
        header: jest.fn((name) => (name === 'x-visitor-id' ? 'visitor-b' : null)),
      };
      const firstRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const secondRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      GenerateImageUseCase.prototype.execute.mockImplementation(async (text, style, visitorId) => ({
        id: `task-${visitorId}`,
        status: 'pending',
      }));

      await Promise.all([
        TaskController.generateImage(firstReq, firstRes),
        TaskController.generateImage(secondReq, secondRes),
      ]);

      expect(GenerateImageUseCase.prototype.execute).toHaveBeenCalledWith('first text', 'Edu-Cartoon', 'visitor-a');
      expect(GenerateImageUseCase.prototype.execute).toHaveBeenCalledWith('second text', 'Historical Sketch', 'visitor-b');
      expect(firstRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Task created successfully',
        data: {
          taskId: 'task-visitor-a',
          status: 'pending'
        }
      });

      expect(secondRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Task created successfully',
        data: {
          taskId: 'task-visitor-b',
          status: 'pending'
        }
      });
    });
  });

  describe('reGenerateImage', () => {
    it('should return 202 and a new task ID on successful regeneration request', async () => {
      req.params = { taskId: 'source-123' };
      req.header = jest.fn((name) => (name === 'x-visitor-id' ? 'visitor-1' : null));

      ReGenerateImageUseCase.prototype.execute.mockResolvedValue({ id: 'new-123', status: 'pending' });

      await TaskController.reGenerateImage(req, res);

      expect(ReGenerateImageUseCase.prototype.execute).toHaveBeenCalledWith('source-123', 'visitor-1', undefined);
      expect(res.status).toHaveBeenCalledWith(202);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Task created successfully',
        data: {
          taskId: 'new-123',
          status: 'pending',
          sourceTaskId: 'source-123'
        }
      });
    });

    it('should return 404 when the source task is not found for the visitor', async () => {
      req.params = { taskId: 'source-123' };
      req.header = jest.fn((name) => (name === 'x-visitor-id' ? 'visitor-2' : null));

      ReGenerateImageUseCase.prototype.execute.mockRejectedValue(new Error('Task not found.'));

      await TaskController.reGenerateImage(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Task not found.'
      });
    });
  });

  describe('getTaskStatus', () => {
    it('should return 200 and task details on successful status retrieval', async () => {
      req.params = { taskId: '123' };
      const mockTask = { id: '123', status: 'completed', imageUrl: 'url' };

      GetTaskStatusUseCase.prototype.execute.mockResolvedValue(mockTask);

      await TaskController.getTaskStatus(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Task status retrieved successfully',
        data: mockTask
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 404 if task is not found', async () => {
      req.params = { taskId: 'nonexistent' };

      GetTaskStatusUseCase.prototype.execute.mockRejectedValue(new Error('Task not found.'));

      await TaskController.getTaskStatus(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Task not found.'
      });
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('getGallery', () => {
    it('should return 200 and gallery items', async () => {
      const mockGalleryItems = [{ id: '1', imageUrl: 'url1' }];
      req.header = jest.fn((name) =>
        name === 'x-visitor-id' ? 'visitor-1' : null
      );

      SqliteTaskRepository.prototype.getAll.mockResolvedValue(mockGalleryItems);

      await TaskController.getGallery(req, res);

      expect(SqliteTaskRepository.prototype.getAll).toHaveBeenCalledWith('visitor-1');
      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Gallery items retrieved successfully',
        data: mockGalleryItems
      });
    });

    it('should return 500 on internal server error', async () => {
      req.header = jest.fn((name) => (name === 'x-visitor-id' ? 'visitor-1' : null));
      SqliteTaskRepository.prototype.getAll.mockRejectedValue(new Error('Database error'));

      await TaskController.getGallery(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Database error'
      });
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
