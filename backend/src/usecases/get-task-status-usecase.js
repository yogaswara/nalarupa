class GetTaskStatusUseCase {
  constructor(taskRepository) {
    this.taskRepository = taskRepository;
  }

  async execute(taskId) {
    const task = await this.taskRepository.getById(taskId);
    if (!task) {
      throw new Error('Task not found.');
    }
    return task;
  }
}

module.exports = GetTaskStatusUseCase;
