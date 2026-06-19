class ReGenerateImageUseCase {
  constructor(taskRepository, generateImageUseCase) {
    this.taskRepository = taskRepository;
    this.generateImageUseCase = generateImageUseCase;
  }

  async execute(sourceTaskId, visitorId) {
    if (!sourceTaskId) {
      throw new Error('Task ID is required.');
    }
    if (!visitorId) {
      throw new Error('Visitor ID is required.');
    }

    const sourceTask = await this.taskRepository.getByIdForUser(sourceTaskId, visitorId);
    if (!sourceTask) {
      throw new Error('Task not found.');
    }
    const text = sourceTask.curriculumText.trim();

    return this.generateImageUseCase.execute(text, sourceTask.style, visitorId);
  }
}

module.exports = ReGenerateImageUseCase;
