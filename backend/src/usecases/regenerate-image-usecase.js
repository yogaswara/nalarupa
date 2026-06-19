class ReGenerateImageUseCase {
  constructor(taskRepository, generateImageUseCase) {
    this.taskRepository = taskRepository;
    this.generateImageUseCase = generateImageUseCase;
  }

  async execute(sourceTaskId, visitorId, text = null) {
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
    
    const finalText = text ? text.trim() : sourceTask.curriculumText.trim();
    const rootParentId = sourceTask.parentId || sourceTask.id;

    return this.generateImageUseCase.execute(finalText, sourceTask.style, visitorId, rootParentId);
  }
}

module.exports = ReGenerateImageUseCase;
