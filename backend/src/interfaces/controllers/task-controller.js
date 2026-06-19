const GenerateImageUseCase = require('../../usecases/generate-image-usecase');
const ReGenerateImageUseCase = require('../../usecases/regenerate-image-usecase');
const GetTaskStatusUseCase = require('../../usecases/get-task-status-usecase');
const SqliteTaskRepository = require('../../infrastructure/database/sqlite/sqlite-task-repository');
const AIServiceFactory = require('../../infrastructure/services/ai-service-factory');
const { v4: uuidv4 } = require('uuid');

const taskRepository = new SqliteTaskRepository();
const aiService = AIServiceFactory.create();
const generateImageUseCase = new GenerateImageUseCase(taskRepository, aiService);
const reGenerateImageUseCase = new ReGenerateImageUseCase(taskRepository, generateImageUseCase);
const getTaskStatusUseCase = new GetTaskStatusUseCase(taskRepository);

function readVisitorId(req) {
  const headerVisitorId = req.header('x-visitor-id');
  if (headerVisitorId) {
    return headerVisitorId;
  }

  const cookieHeader = req.headers && req.headers.cookie;
  if (!cookieHeader) {
    return null;
  }

  const visitorCookie = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith('nalarupa_visitor_id='));

  if (!visitorCookie) {
    return null;
  }

  return decodeURIComponent(visitorCookie.split('=')[1] || '');
}

function resolveVisitorId(req, res) {
  const existingVisitorId = readVisitorId(req);
  if (existingVisitorId) {
    return existingVisitorId;
  }

  const visitorId = uuidv4();
  if (typeof res.cookie === 'function') {
    res.cookie('nalarupa_visitor_id', visitorId, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });
  }

  return visitorId;
}

class TaskController {
  async generateImage(req, res) {
    try {
      const { text, style } = req.body;
      const visitorId = resolveVisitorId(req, res);
      const task = await generateImageUseCase.execute(text, style, visitorId);
      res.status(202).json({ taskId: task.id, status: task.status });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async reGenerateImage(req, res) {
    try {
      const { taskId } = req.params;
      const { text } = req.body || {};
      const visitorId = resolveVisitorId(req, res);
      const task = await reGenerateImageUseCase.execute(taskId, visitorId, text);
      res.status(202).json({ taskId: task.id, status: task.status, sourceTaskId: taskId });
    } catch (error) {
      const statusCode = error.message === 'Task not found.' ? 404 : 400;
      res.status(statusCode).json({ error: error.message });
    }
  }

  async getTaskStatus(req, res) {
    try {
      const { taskId } = req.params;
      const task = await getTaskStatusUseCase.execute(taskId);
      res.status(200).json(task);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async getGallery(req, res) {
    try {
      const visitorId = resolveVisitorId(req, res);
      const galleryItems = await taskRepository.getAll(visitorId);
      res.status(200).json(galleryItems);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new TaskController();
