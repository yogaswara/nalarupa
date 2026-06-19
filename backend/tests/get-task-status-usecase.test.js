
const GetTaskStatusUseCase = require('../src/usecases/get-task-status-usecase');
const Task = require('../src/domain/entities/task');

describe('GetTaskStatusUseCase', () => {
  let mockTaskRepository;
  let getTaskStatusUseCase;

  beforeEach(() => {
    mockTaskRepository = {
      getById: jest.fn(),
    };
    getTaskStatusUseCase = new GetTaskStatusUseCase(mockTaskRepository);
    jest.clearAllMocks();
  });

  it('should return a task if found', async () => {
    const taskId = '123';
    const mockTask = new Task(taskId, 'Text', 'Style', null, 'pending', null, null, Date.now());
    mockTaskRepository.getById.mockResolvedValue(mockTask);

    const result = await getTaskStatusUseCase.execute(taskId);

    expect(mockTaskRepository.getById).toHaveBeenCalledWith(taskId);
    expect(result).toEqual(mockTask);
  });

  it('should throw an error if task is not found', async () => {
    const taskId = 'nonexistent';
    mockTaskRepository.getById.mockResolvedValue(null);

    await expect(getTaskStatusUseCase.execute(taskId)).rejects.toThrow('Task not found.');
    expect(mockTaskRepository.getById).toHaveBeenCalledWith(taskId);
  });
});
