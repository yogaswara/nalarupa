const { v4: uuidv4 } = require('uuid');
const Task = require('../domain/entities/task');

const TASK_TIMEOUT_MS = Number(process.env.AI_TASK_TIMEOUT_MS || 28000);
const OPTIMIZATION_THRESHOLD = Number(process.env.AI_OPTIMIZATION_THRESHOLD || 250);

const forbiddenContentPatterns = [
  /\b(sex|sexual|porn|nude|nudity|erotic)\b/i,
  /\b(drug|drugs|cocaine|heroin|meth|marijuana|weed)\b/i,
  /\b(gambling|casino|betting)\b/i,
  /\b(hate symbol|nazi|swastika|extremist|terrorist)\b/i,
];

const styleGuides = {
  'Edu-Cartoon': 'friendly educational cartoon illustration, bright colors, clean vector style, simple composition, child-friendly',
  'Technical Diagram': 'scientific educational visualization, clean structure, light background, accurate shapes, diagram-like composition without labels',
  'Historical Sketch': 'educational textbook sketch, historically grounded, neutral presentation, detailed but easy to understand',
};

function assertClassroomSafe(curriculumText) {
  if (forbiddenContentPatterns.some((pattern) => pattern.test(curriculumText))) {
    throw new Error('Inappropriate Content Detected.');
  }
}

function shouldOptimizePrompt(curriculumText) {
  return curriculumText.length > OPTIMIZATION_THRESHOLD;
}

function buildFastPrompt(curriculumText, style) {
  return [
    `Create a clear classroom-safe educational visual about: ${curriculumText.trim()}.`,
    `Style: ${styleGuides[style]}.`,
    'Rules: focus on one main concept, concrete visible scene, clean textbook composition, no artistic/cinematic excess, never request text, letters, words, labels, captions, numbers, logos, watermarks, signs, posters, or typography.',
    'CRITICAL: absolutely no text, no letters, no words, no labels, no captions, no numbers, no typography, no watermark, no logo, no signature.'
  ].join(' ');
}

function withTimeout(promise, timeoutMs, label) {
  let timeout;
  const timeoutPromise = new Promise((_, reject) => {
    timeout = setTimeout(() => {
      reject(new Error(`${label} timed out after ${Math.round(timeoutMs / 1000)} seconds.`));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeout));
}

class GenerateImageUseCase {
  constructor(taskRepository, aiService) {
    this.taskRepository = taskRepository;
    this.aiService = aiService;
  }

  async execute(curriculumText, style, visitorId = null, parentId = null) {
    if (!curriculumText || curriculumText.length > 1000) {
      throw new Error('Curriculum text must be between 1 and 1000 characters.');
    }
    if (!['Edu-Cartoon', 'Technical Diagram', 'Historical Sketch'].includes(style)) {
      throw new Error('Invalid style selected.');
    }

    const taskId = uuidv4();
    const task = new Task(taskId, curriculumText, style, visitorId, null, 'pending', null, null, new Date().toISOString(), parentId);
    await this.taskRepository.create(task);

    // Asynchronously process the image generation
    this.processImageGeneration(taskId, curriculumText, style);

    return task;
  }

  async processImageGeneration(taskId, curriculumText, style) {
    try {
      const deadline = Date.now() + TASK_TIMEOUT_MS;
      assertClassroomSafe(curriculumText);

      let optimizedPrompt;
      if (shouldOptimizePrompt(curriculumText)) {
        await this.taskRepository.updateStatus(taskId, 'processing-LLM');
        const remainingMs = Math.max(1000, deadline - Date.now());
        optimizedPrompt = await withTimeout(
          this.aiService.optimizePrompt(curriculumText, style),
          remainingMs,
          'Prompt optimization'
        );
      } else {
        optimizedPrompt = buildFastPrompt(curriculumText, style);
      }

      const promptText = typeof optimizedPrompt === 'string' ? optimizedPrompt : String(optimizedPrompt || '');
      if (promptText.includes("Inappropriate Content Detected")) {
        await this.taskRepository.updateStatus(taskId, 'failed', promptText);
        return;
      }

      await this.taskRepository.updateStatus(taskId, 'processing-image');
      const remainingMs = Math.max(1000, deadline - Date.now());
      const imageUrl = await withTimeout(
        this.aiService.generateImage(optimizedPrompt),
        remainingMs,
        'Image generation'
      );

      await this.taskRepository.updateResult(taskId, imageUrl, optimizedPrompt);
    } catch (error) {
      console.error(`Error processing task ${taskId}:`, error);
      await this.taskRepository.updateStatus(taskId, 'failed', error.message);
    }
  }
}

module.exports = GenerateImageUseCase;
