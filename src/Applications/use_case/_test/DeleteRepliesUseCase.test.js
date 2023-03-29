const RepliesRepository = require('../../../Domains/replies/RepliesRepository');
const DeleteRepliesUseCase = require('../DeleteRepliesUseCase');

describe('DeleteRepliesUseCase', () => {
  it('should orchestrating the delete reply action corretly', async () => {
    // Arrange
    const useCaseParams = {
      replyId: 'reply-123',
      owner: 'user-123',
    };

    const mockRepliesRepository = new RepliesRepository();
    mockRepliesRepository.findRepliesById = jest.fn()
      .mockImplementation(() => Promise.resolve({ id: 'reply-123', owner: 'user-123' }));
    mockRepliesRepository.checkRepliesOwner = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockRepliesRepository.deleteReplies = jest.fn()
      .mockImplementation(() => Promise.resolve());

    // Action
    await new DeleteRepliesUseCase({
      repliesRepository: mockRepliesRepository,
    }).execute(useCaseParams);

    // Assert
    expect(mockRepliesRepository.findRepliesById).toHaveBeenCalledWith('reply-123');
    expect(mockRepliesRepository.checkRepliesOwner).toHaveBeenCalledWith('reply-123', 'user-123');
    expect(mockRepliesRepository.deleteReplies).toHaveBeenCalledWith('reply-123');
  });
});
