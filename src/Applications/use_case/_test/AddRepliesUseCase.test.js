const RepliesRepository = require('../../../Domains/replies/RepliesRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddReplies = require('../../../Domains/replies/entities/AddReplies');
const AddedReplies = require('../../../Domains/replies/entities/AddedReplies');
const AddRepliesUseCase = require('../AddRepliesUseCase');

describe('AddRepliesUseCase', () => {
  it('should throw error if not contain needed property', async () => {
    // Arrange
    const useCasePayload = {
      content: 'Dicoding Indonesia Backend Expert',
    };

    const addRepliesUseCase = new AddRepliesUseCase({});

    // Action & Assert
    await expect(addRepliesUseCase.execute(useCasePayload)).rejects.toThrowError('ADD_REPLIES_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error if not meet data type specification', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 123,
      commentId: 'comment-123',
      content: new AddReplies({ content: 'Dicoding Indonesia Backend Expert' }).content,
      owner: 'user-123',
    };

    const addRepliesUseCase = new AddRepliesUseCase({});

    // Action & Assert
    await expect(addRepliesUseCase.execute(useCasePayload)).rejects.toThrowError('ADD_REPLIES_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error if thread not found', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      content: new AddReplies({ content: 'Dicoding Indonesia Backend Expert' }).content,
      owner: 'user-123',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.checkThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const addRepliesUseCase = new AddRepliesUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    expect(addRepliesUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('ADD_REPLIES_USE_CASE.THREAD_NOT_FOUND');
    expect(mockThreadRepository.checkThreadById).toHaveBeenCalledWith('thread-123');
  });

  it('should throw error if comment not found', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      content: new AddReplies({ content: 'Dicoding Indonesia Backend Expert' }).content,
      owner: 'user-123',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockThreadRepository.checkThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve({ id: 'threadId' }));
    mockCommentRepository.findCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const addRepliesUseCase = new AddRepliesUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Actions & Assert
    await expect(addRepliesUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('ADD_REPLIES_USE_CASE.COMMENT_NOT_FOUND');
    expect(mockThreadRepository.checkThreadById).toHaveBeenCalledWith('thread-123');
    expect(mockCommentRepository.findCommentById).toHaveBeenCalledWith('comment-123');
  });

  it('should orchestrating the add replies action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      content: new AddReplies({ content: 'Dicoding Indonesia Backend Expert' }).content,
      owner: 'user-123',
    };

    const expectedAddedReplies = new AddedReplies({
      id: 'reply-123',
      content: useCasePayload.content,
      owner: 'user-123',
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockRepliesRepository = new RepliesRepository();

    /** mocking needed function */
    mockThreadRepository.checkThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve({ id: 'threadId' }));
    mockCommentRepository.findCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve({ id: 'commentId' }));
    mockRepliesRepository.addReplies = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedAddedReplies));

    const addRepliesUseCase = new AddRepliesUseCase({
      commentRepository: mockCommentRepository,
      repliesRepository: mockRepliesRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedReplies = await addRepliesUseCase.execute(useCasePayload);

    // Assert
    expect(addedReplies).toStrictEqual(expectedAddedReplies);
    expect(mockThreadRepository.checkThreadById).toHaveBeenCalledWith('thread-123');
    expect(mockCommentRepository.findCommentById).toHaveBeenCalledWith('comment-123');
    expect(mockRepliesRepository.addReplies).toHaveBeenCalledWith({
      content: 'Dicoding Indonesia Backend Expert',
      commentId: 'comment-123',
      owner: 'user-123',
    });
  });
});
