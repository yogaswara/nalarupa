class TaskRepository {
  async create(task) {
    throw new Error("Method 'create' must be implemented.");
  }

  async updateStatus(taskId, status, errorMessage = null) {
    throw new Error("Method 'updateStatus' must be implemented.");
  }

  async updateResult(taskId, imageUrl, optimizedPrompt) {
    throw new Error("Method 'updateResult' must be implemented.");
  }

  async getById(taskId) {
    throw new Error("Method 'getById' must be implemented.");
  }

  async getByIdForUser(taskId, userId) {
    throw new Error("Method 'getByIdForUser' must be implemented.");
  }

  async getAll(userId) {
    throw new Error("Method 'getAll' must be implemented.");
  }
}

module.exports = TaskRepository;
