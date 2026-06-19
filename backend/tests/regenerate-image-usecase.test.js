const ReGenerateImageUseCase = require('../src/usecases/regenerate-image-usecase');

describe('ReGenerateImageUseCase', () => {
  let taskRepository;
  let generateImageUseCase;
  let reGenerateImageUseCase;

  beforeEach(() => {
    taskRepository = {
      getByIdForUser: jest.fn(),
    };
    generateImageUseCase = {
      execute: jest.fn(),
    };
    reGenerateImageUseCase = new ReGenerateImageUseCase(taskRepository, generateImageUseCase);
  });

  it('should create a new generation task from a source task owned by the visitor', async () => {
    taskRepository.getByIdForUser.mockResolvedValue({
      id: 'source-1',
      curriculumText: 'Photosynthesis lesson',
      style: 'Technical Diagram',
      userId: 'visitor-1',
    });
    generateImageUseCase.execute.mockResolvedValue({ id: 'new-task-1', status: 'pending' });

    const result = await reGenerateImageUseCase.execute('source-1', 'visitor-1');

    expect(taskRepository.getByIdForUser).toHaveBeenCalledWith('source-1', 'visitor-1');
    expect(generateImageUseCase.execute).toHaveBeenCalledWith(
      'Photosynthesis lesson',
      'Technical Diagram',
      'visitor-1',
      'source-1'
    );
    expect(result).toEqual({ id: 'new-task-1', status: 'pending' });
  });

  it('should create a new generation task from a source task with custom curriculum text', async () => {
    taskRepository.getByIdForUser.mockResolvedValue({
      id: 'source-1',
      curriculumText: 'Photosynthesis lesson',
      style: 'Technical Diagram',
      userId: 'visitor-1',
    });
    generateImageUseCase.execute.mockResolvedValue({ id: 'new-task-1', status: 'pending' });

    const result = await reGenerateImageUseCase.execute('source-1', 'visitor-1', 'Custom lesson text');

    expect(taskRepository.getByIdForUser).toHaveBeenCalledWith('source-1', 'visitor-1');
    expect(generateImageUseCase.execute).toHaveBeenCalledWith(
      'Custom lesson text',
      'Technical Diagram',
      'visitor-1',
      'source-1'
    );
    expect(result).toEqual({ id: 'new-task-1', status: 'pending' });
  });

  it('should reject regeneration when the task does not belong to the visitor', async () => {
    taskRepository.getByIdForUser.mockResolvedValue(null);

    await expect(reGenerateImageUseCase.execute('source-1', 'visitor-2')).rejects.toThrow('Task not found.');

    expect(generateImageUseCase.execute).not.toHaveBeenCalled();
  });

  it('should keep concurrent users isolated when regenerating at the same time', async () => {
    taskRepository.getByIdForUser.mockImplementation(async (taskId, visitorId) => ({
      id: taskId,
      curriculumText: `Lesson for ${visitorId}`,
      style: visitorId === 'visitor-a' ? 'Edu-Cartoon' : 'Historical Sketch',
      userId: visitorId,
    }));
    generateImageUseCase.execute.mockImplementation(async (text, style, visitorId) => ({
      id: `new-${visitorId}`,
      curriculumText: text,
      style,
      userId: visitorId,
      status: 'pending',
    }));

    const [firstResult, secondResult] = await Promise.all([
      reGenerateImageUseCase.execute('task-a', 'visitor-a'),
      reGenerateImageUseCase.execute('task-b', 'visitor-b'),
    ]);

    expect(firstResult).toMatchObject({
      id: 'new-visitor-a',
      curriculumText: 'Lesson for visitor-a',
      style: 'Edu-Cartoon',
      userId: 'visitor-a',
    });
    expect(secondResult).toMatchObject({
      id: 'new-visitor-b',
      curriculumText: 'Lesson for visitor-b',
      style: 'Historical Sketch',
      userId: 'visitor-b',
    });
    expect(taskRepository.getByIdForUser).toHaveBeenCalledWith('task-a', 'visitor-a');
    expect(taskRepository.getByIdForUser).toHaveBeenCalledWith('task-b', 'visitor-b');
    expect(generateImageUseCase.execute).toHaveBeenCalledWith('Lesson for visitor-a', 'Edu-Cartoon', 'visitor-a', 'task-a');
    expect(generateImageUseCase.execute).toHaveBeenCalledWith('Lesson for visitor-b', 'Historical Sketch', 'visitor-b', 'task-b');
  });
});
