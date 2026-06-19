class Task {
  constructor(id, curriculumText, style, userId = null, optimizedPrompt = null, status = 'pending', imageUrl = null, errorMessage = null, createdAt = new Date().toISOString()) {
    if (!id || !curriculumText || !style) {
      throw new Error('Task must have an ID, curriculum text, and style.');
    }
    this.id = id;
    this.curriculumText = curriculumText;
    this.style = style;
    this.userId = userId;
    this.optimizedPrompt = optimizedPrompt;
    this.status = status;
    this.imageUrl = imageUrl;
    this.errorMessage = errorMessage;
    this.createdAt = createdAt;
  }
}

module.exports = Task;
