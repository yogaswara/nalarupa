const TaskRepository = require('../../../domain/repositories/task-repository');
const Task = require('../../../domain/entities/task');
const { db } = require('../../config/db');

class SqliteTaskRepository extends TaskRepository {
  constructor() {
    super();
    this.db = db;
  }

  async create(task) {
    const stmt = this.db.prepare(
      'INSERT INTO tasks (id, curriculumText, style, userId, status, createdAt) VALUES (?, ?, ?, ?, ?, ?)'
    );
    stmt.run(task.id, task.curriculumText, task.style, task.userId, task.status, task.createdAt);
    return task;
  }

  async updateStatus(taskId, status, errorMessage = null) {
    const stmt = this.db.prepare(
      'UPDATE tasks SET status = ?, errorMessage = ? WHERE id = ?'
    );
    stmt.run(status, errorMessage, taskId);
    return this.getById(taskId);
  }

  async updateResult(taskId, imageUrl, optimizedPrompt) {
    const stmt = this.db.prepare(
      "UPDATE tasks SET imageUrl = ?, optimizedPrompt = ?, status = 'completed' WHERE id = ?"
    );
    stmt.run(imageUrl, optimizedPrompt, taskId);

    // Also add to gallery
    const task = await this.getById(taskId);
    if (task) {
      const galleryStmt = this.db.prepare(
        'INSERT INTO gallery (id, userId, originalText, imageUrl, style, createdAt) VALUES (?, ?, ?, ?, ?, ?)'
      );
      galleryStmt.run(task.id, task.userId, task.curriculumText, task.imageUrl, task.style, task.createdAt);
    }
    return this.getById(taskId);
  }

  async getById(taskId) {
    const stmt = this.db.prepare('SELECT * FROM tasks WHERE id = ?');
    const row = stmt.get(taskId);
    return this.mapTask(row);
  }

  async getByIdForUser(taskId, userId) {
    const stmt = this.db.prepare('SELECT * FROM tasks WHERE id = ? AND userId = ?');
    const row = stmt.get(taskId, userId);
    return this.mapTask(row);
  }

  mapTask(row) {
    if (!row) return null;
    return new Task(
      row.id,
      row.curriculumText,
      row.style,
      row.userId,
      row.optimizedPrompt,
      row.status,
      row.imageUrl,
      row.errorMessage,
      row.createdAt
    );
  }

  async getAll(userId) {
    const stmt = this.db.prepare('SELECT * FROM gallery WHERE userId = ? ORDER BY createdAt DESC');
    return stmt.all(userId);
  }
}

module.exports = SqliteTaskRepository;
