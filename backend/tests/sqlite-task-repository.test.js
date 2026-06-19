
const SqliteTaskRepository = require('../src/infrastructure/database/sqlite/sqlite-task-repository');
const Task = require('../src/domain/entities/task');
const { db } = require('../src/infrastructure/config/db');

jest.mock('../src/infrastructure/config/db', () => ({
  db: {
    prepare: jest.fn().mockReturnThis(),
    run: jest.fn(),
    get: jest.fn(),
    all: jest.fn(),
  },
}));

describe('SqliteTaskRepository', () => {
  let repository;

  beforeEach(() => {
    repository = new SqliteTaskRepository();
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new task', async () => {
      const task = new Task('1', 'Text', 'Style', 'user-1', null, 'pending', null, null, Date.now());
      await repository.create(task);

      expect(db.prepare).toHaveBeenCalledWith('INSERT INTO tasks (id, curriculumText, style, userId, status, createdAt) VALUES (?, ?, ?, ?, ?, ?)');
      expect(db.run).toHaveBeenCalledWith(task.id, task.curriculumText, task.style, task.userId, task.status, task.createdAt);
    });
  });

  describe('updateStatus', () => {
    it('should update task status', async () => {
      const taskId = '1';
      const status = 'completed';
      const errorMessage = null;
      const mockTask = new Task(taskId, 'Text', 'Style', 'user-1', null, status, null, null, Date.now());

      db.get.mockReturnValueOnce({ id: taskId, curriculumText: 'Text', style: 'Style', userId: 'user-1', status: status, createdAt: Date.now() });

      const result = await repository.updateStatus(taskId, status, errorMessage);

      expect(db.prepare).toHaveBeenCalledWith('UPDATE tasks SET status = ?, errorMessage = ? WHERE id = ?');
      expect(db.run).toHaveBeenCalledWith(status, errorMessage, taskId);
      expect(result).toEqual(mockTask);
    });
  });

  describe('updateResult', () => {
    it('should update task result and add to gallery', async () => {
      const taskId = '1';
      const imageUrl = 'http://example.com/image.png';
      const optimizedPrompt = 'Optimized Text';
      const mockTask = new Task(taskId, 'Text', 'Style', 'user-1', optimizedPrompt, 'completed', imageUrl, null, Date.now());

      db.get.mockReturnValue({ id: taskId, curriculumText: 'Text', style: 'Style', userId: 'user-1', optimizedPrompt: optimizedPrompt, status: 'completed', imageUrl: imageUrl, createdAt: Date.now() });

      const result = await repository.updateResult(taskId, imageUrl, optimizedPrompt);

      expect(db.prepare).toHaveBeenCalledWith('UPDATE tasks SET imageUrl = ?, optimizedPrompt = ?, status = \'completed\' WHERE id = ?');
      expect(db.run).toHaveBeenCalledWith(imageUrl, optimizedPrompt, taskId);
      expect(db.prepare).toHaveBeenCalledWith('INSERT INTO gallery (id, userId, originalText, imageUrl, style, createdAt) VALUES (?, ?, ?, ?, ?, ?)');
      expect(db.run).toHaveBeenCalledWith(taskId, mockTask.userId, mockTask.curriculumText, mockTask.imageUrl, mockTask.style, mockTask.createdAt);
      expect(result).toEqual(mockTask);
    });
  });

  describe('getById', () => {
    it('should return a task by ID', async () => {
      const taskId = '1';
      const mockRow = { id: taskId, curriculumText: 'Text', style: 'Style', userId: 'user-1', optimizedPrompt: 'Optimized', status: 'pending', imageUrl: null, errorMessage: null, createdAt: Date.now() };
      db.get.mockReturnValueOnce(mockRow);

      const result = await repository.getById(taskId);

      expect(db.prepare).toHaveBeenCalledWith('SELECT * FROM tasks WHERE id = ?');
      expect(db.get).toHaveBeenCalledWith(taskId);
      expect(result).toEqual(new Task(mockRow.id, mockRow.curriculumText, mockRow.style, mockRow.userId, mockRow.optimizedPrompt, mockRow.status, mockRow.imageUrl, mockRow.errorMessage, mockRow.createdAt));
    });

    it('should return null if task not found', async () => {
      const taskId = 'nonexistent';
      db.get.mockReturnValueOnce(undefined);

      const result = await repository.getById(taskId);

      expect(result).toBeNull();
    });
  });

  describe('getByIdForUser', () => {
    it('should return a task by ID only when it belongs to the user', async () => {
      const taskId = '1';
      const userId = 'user-1';
      const mockRow = {
        id: taskId,
        curriculumText: 'Text',
        style: 'Style',
        userId,
        optimizedPrompt: 'Optimized',
        status: 'completed',
        imageUrl: 'url',
        errorMessage: null,
        createdAt: Date.now(),
      };
      db.get.mockReturnValueOnce(mockRow);

      const result = await repository.getByIdForUser(taskId, userId);

      expect(db.prepare).toHaveBeenCalledWith('SELECT * FROM tasks WHERE id = ? AND userId = ?');
      expect(db.get).toHaveBeenCalledWith(taskId, userId);
      expect(result).toEqual(
        new Task(
          mockRow.id,
          mockRow.curriculumText,
          mockRow.style,
          mockRow.userId,
          mockRow.optimizedPrompt,
          mockRow.status,
          mockRow.imageUrl,
          mockRow.errorMessage,
          mockRow.createdAt
        )
      );
    });

    it('should return null for another user task', async () => {
      db.get.mockReturnValueOnce(undefined);

      const result = await repository.getByIdForUser('1', 'user-2');

      expect(db.prepare).toHaveBeenCalledWith('SELECT * FROM tasks WHERE id = ? AND userId = ?');
      expect(db.get).toHaveBeenCalledWith('1', 'user-2');
      expect(result).toBeNull();
    });
  });

  describe('getAll', () => {
    it('should return all gallery items', async () => {
      const mockGalleryItems = [
        { id: '1', userId: 'user-1', originalText: 'Text1', imageUrl: 'url1', style: 'Style1', createdAt: Date.now() },
        { id: '2', userId: 'user-1', originalText: 'Text2', imageUrl: 'url2', style: 'Style2', createdAt: Date.now() },
      ];
      db.all.mockReturnValueOnce(mockGalleryItems);

      const result = await repository.getAll('user-1');

      expect(db.prepare).toHaveBeenCalledWith('SELECT * FROM gallery WHERE userId = ? ORDER BY createdAt DESC');
      expect(db.all).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(mockGalleryItems);
    });
  });
});
