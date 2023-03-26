const RepliesRepository = require('../../../Domains/replies/RepliesRepository');
const DeleteRepliesUseCase = require('../DeleteRepliesUseCase');

describe('DeleteRepliesUseCase', () => {
  it('should throw error if payload did not contain needed property', async () => {
    // Arrange
    const useCasePayload = {
      commentId: 'comment-123',
    };

    /** creating dependency of use case */
    const mockRepliesRepository = new RepliesRepository();

    // Action & Assert
    await expect(new DeleteRepliesUseCase({
      repliesRepository: mockRepliesRepository,
    }).execute(useCasePayload)).rejects.toThrowError('DELETE_REPLIES_USE_CASE.NOT_CONTAIN_REPLY_ID');
  });

  it('should throw error if payload did not meet data type specification', async () => {
    // Arrange
    const useCasePayload = {
      replyId: 123,
    };

    /** creating dependency of use case */
    const mockRepliesRepository = new RepliesRepository();

    // Action & Assert
    await expect(new DeleteRepliesUseCase({
      repliesRepository: mockRepliesRepository,
    }).execute(useCasePayload)).rejects.toThrowError('DELETE_REPLIES_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should orchestrating the delete reply action corretly', async () => {
    // Arrange
    const useCaseParams = {
      replyId: 'reply-123',
      owner: 'user-123',
    };

    const mockRepliesRepository = new RepliesRepository();
    mockRepliesRepository.findRepliesById = jest.fn()
      .mockImplementation(() => Promise.resolve());
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
